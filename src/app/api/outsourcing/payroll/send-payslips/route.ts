import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPayslipEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const month = body.month != null ? parseInt(String(body.month), 10) : new Date().getMonth() + 1;
    const year = body.year != null ? parseInt(String(body.year), 10) : new Date().getFullYear();
    const clientId = typeof body.clientId === 'string' ? body.clientId : undefined;
    const departmentId = typeof body.departmentId === 'string' ? body.departmentId : undefined;
    const testTo = typeof body.testTo === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.testTo) ? body.testTo : undefined;
    const employeeIds = Array.isArray(body.employeeIds)
      ? (body.employeeIds as string[]).filter((id): id is string => typeof id === 'string')
      : undefined;

    if (Number.isNaN(month) || month < 1 || month > 12 || Number.isNaN(year)) {
      return NextResponse.json({ error: 'Invalid month or year' }, { status: 400 });
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        month,
        year,
        ...(employeeIds?.length
          ? { employeeId: { in: employeeIds } }
          : clientId || departmentId
            ? {
                employee: {
                  ...(clientId ? { outsourcingClientId: clientId } : {}),
                  ...(departmentId ? { departmentId } : {}),
                },
              }
            : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            client: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: [{ employee: { lastName: 'asc' } }, { employee: { firstName: 'asc' } }],
    });

    const sent: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];
    let diagnostics: Record<string, unknown> | undefined;

    const toProcess = testTo ? payrolls.slice(0, 1) : payrolls;
    for (const p of toProcess) {
      const email = testTo || p.employee.email?.trim();
      const employeeName = `${p.employee.firstName} ${p.employee.lastName}`;
      if (!email) {
        skipped.push(employeeName);
        continue;
      }
      const result = await sendPayslipEmail({
        to: email,
        employeeName,
        month,
        year,
        data: {
          employeeName,
          employeeNumber: p.employee.employeeNumber,
          clientName: p.employee.client.name,
          departmentName: p.employee.department?.name ?? null,
          basicPay: String(p.basicPay),
          allowances: (p.allowances as { name: string; amount: number }[]) ?? [],
          deductions: (p.deductions as { name: string; amount: number }[]) ?? [],
          grossPay: String(p.grossPay),
          paye: String(p.paye),
          nssf: String(p.nssf),
          nhif: String(p.nhif),
          netPay: String(p.netPay),
        },
      });
      if (result.sent) {
        sent.push(employeeName);
      } else {
        errors.push(`${employeeName}: ${result.error || 'Failed to send'}`);
        if (result.diagnostics && !diagnostics) {
          diagnostics = result.diagnostics;
        }
      }
    }

    const payload: {
      sent: number;
      skipped: number;
      errors?: string[];
      details: { sent: string[]; skipped: string[]; errors: string[] };
      diagnostics?: typeof diagnostics;
    } = {
      sent: sent.length,
      skipped: skipped.length,
      details: { sent, skipped, errors },
    };
    if (errors.length > 0) payload.errors = errors;
    if (diagnostics) payload.diagnostics = diagnostics;
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    console.error('[send-payslips]', msg, stack);
    return NextResponse.json(
      { error: 'Failed to send payslips', details: process.env.NODE_ENV === 'development' ? msg : undefined },
      { status: 500 }
    );
  }
}
