import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { calculateStatutory } from '@/lib/payroll-calc';

function toDecimal(n: number): Decimal {
  return new Decimal(Math.round(n * 100) / 100);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const month = body.month != null ? parseInt(String(body.month), 10) : undefined;
    const year = body.year != null ? parseInt(String(body.year), 10) : undefined;
    const clientId = typeof body.clientId === 'string' ? body.clientId : undefined;
    const departmentId = typeof body.departmentId === 'string' ? body.departmentId : undefined;

    if (Number.isNaN(month) || month < 1 || month > 12 || Number.isNaN(year)) {
      return NextResponse.json({ error: 'Valid month and year required' }, { status: 400 });
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        month: month!,
        year: year!,
        ...(clientId || departmentId
          ? {
              employee: {
                ...(clientId ? { outsourcingClientId: clientId } : {}),
                ...(departmentId ? { departmentId } : {}),
              },
            }
          : {}),
      },
    });

    let updated = 0;
    for (const p of payrolls) {
      const grossPayNum = Number(p.grossPay);
      const otherDeductions = (p.deductions as { name: string; amount: number }[]) ?? [];
      const otherTotal = otherDeductions.reduce((s, d) => s + (d?.amount ?? 0), 0);
      const calc = calculateStatutory(grossPayNum, otherTotal);

      await prisma.payroll.update({
        where: { id: p.id },
        data: {
          paye: toDecimal(calc.paye),
          nssf: toDecimal(calc.nssf),
          nhif: toDecimal(calc.nhif),
          netPay: toDecimal(calc.netPay),
        },
      });
      updated++;
    }

    return NextResponse.json({
      updated,
      message: `Recalculated statutory deductions (PAYE, NSSF, NHIF) for ${updated} payroll record(s).`,
    });
  } catch (e) {
    console.error('[payroll recalculate-statutory]', e);
    return NextResponse.json({ error: 'Failed to recalculate' }, { status: 500 });
  }
}
