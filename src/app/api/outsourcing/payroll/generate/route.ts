import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    const month = typeof b.month === 'number' ? b.month : parseInt(String(b.month ?? ''), 10);
    const year = typeof b.year === 'number' ? b.year : parseInt(String(b.year ?? ''), 10);
    const clientId = typeof b.clientId === 'string' && b.clientId.trim() ? b.clientId.trim() : null;
    const departmentId = typeof b.departmentId === 'string' && b.departmentId.trim() ? b.departmentId.trim() : null;

    if (Number.isNaN(month) || month < 1 || month > 12 || Number.isNaN(year)) {
      return NextResponse.json({ error: 'Valid month (1-12) and year are required' }, { status: 400 });
    }

    const employees = await prisma.employee.findMany({
      where: {
        ...(clientId ? { outsourcingClientId: clientId } : {}),
        ...(departmentId ? { departmentId } : {}),
      },
      select: { id: true },
    });

    const existing = await prisma.payroll.findMany({
      where: {
        month,
        year,
        employeeId: { in: employees.map((e) => e.id) },
      },
      select: { employeeId: true },
    });
    const existingIds = new Set(existing.map((e) => e.employeeId));

    const toCreate = employees.filter((e) => !existingIds.has(e.id));
    const zero = new Decimal(0);

    if (toCreate.length === 0) {
      return NextResponse.json({
        created: 0,
        skipped: employees.length,
        message: 'All employees in scope already have payroll records for this month.',
      });
    }

    await prisma.payroll.createMany({
      data: toCreate.map((e) => ({
        employeeId: e.id,
        month,
        year,
        basicPay: zero,
        grossPay: zero,
        paye: zero,
        nssf: zero,
        nhif: zero,
        netPay: zero,
      })),
    });

    return NextResponse.json({
      created: toCreate.length,
      skipped: employees.length - toCreate.length,
      message: `Created ${toCreate.length} draft payroll record(s) for ${month}/${year}.`,
    });
  } catch (e) {
    console.error('[payroll/generate]', e);
    return NextResponse.json({ error: 'Failed to generate payroll' }, { status: 500 });
  }
}
