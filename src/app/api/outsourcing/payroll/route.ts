import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([], { status: 200 });
    }
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const clientId = searchParams.get('clientId') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;

    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    if (Number.isNaN(m) || m < 1 || m > 12 || Number.isNaN(y)) {
      return NextResponse.json({ error: 'Invalid month or year' }, { status: 400 });
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        month: m,
        year: y,
        ...(clientId || departmentId
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
          include: {
            client: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [
        { employee: { lastName: 'asc' } },
        { employee: { firstName: 'asc' } },
      ],
    });

    const list = payrolls.map((p) => ({
      id: p.id,
      employeeId: p.employeeId,
      employeeName: `${p.employee.firstName} ${p.employee.lastName}`,
      employeeNumber: p.employee.employeeNumber ?? null,
      clientName: p.employee.client.name,
      departmentName: p.employee.department?.name ?? null,
      month: p.month,
      year: p.year,
      basicPay: String(p.basicPay),
      allowances: p.allowances as { name: string; amount: number }[],
      deductions: p.deductions as { name: string; amount: number }[],
      grossPay: String(p.grossPay),
      paye: String(p.paye),
      nssf: String(p.nssf),
      nhif: String(p.nhif),
      netPay: String(p.netPay),
      status: p.status,
    }));

    return NextResponse.json(list);
  } catch (e) {
    console.error('[payroll GET]', e);
    return NextResponse.json({ error: 'Failed to load payroll' }, { status: 500 });
  }
}
