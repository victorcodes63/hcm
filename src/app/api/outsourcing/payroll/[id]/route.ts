import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { calculateStatutory } from '@/lib/payroll-calc';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const p = await prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            client: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
    if (!p) return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    const allowances = (p.allowances as { name: string; amount: number }[]) ?? [];
    const deductions = (p.deductions as { name: string; amount: number }[]) ?? [];
    return NextResponse.json({
      id: p.id,
      employeeId: p.employeeId,
      employeeName: `${p.employee.firstName} ${p.employee.lastName}`,
      employeeNumber: p.employee.employeeNumber,
      clientName: p.employee.client.name,
      departmentName: p.employee.department?.name,
      month: p.month,
      year: p.year,
      basicPay: String(p.basicPay),
      allowances,
      deductions,
      grossPay: String(p.grossPay),
      paye: String(p.paye),
      nssf: String(p.nssf),
      nhif: String(p.nhif),
      netPay: String(p.netPay),
      status: p.status,
    });
  } catch (e) {
    console.error('[payroll GET id]', e);
    return NextResponse.json({ error: 'Failed to load payroll' }, { status: 500 });
  }
}

function toDecimal(v: string | number): Decimal {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, '')) || 0;
  return new Decimal(Math.round(n * 100) / 100);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;

    const basicPay = body.basicPay != null ? toDecimal(body.basicPay) : undefined;
    const allowances = Array.isArray(body.allowances)
      ? (body.allowances as { name: string; amount: number }[]).filter(
          (a) => typeof a?.name === 'string' && typeof a?.amount === 'number'
        )
      : undefined;
    const deductions = Array.isArray(body.deductions)
      ? (body.deductions as { name: string; amount: number }[]).filter(
          (d) => typeof d?.name === 'string' && typeof d?.amount === 'number'
        )
      : undefined;
    const payeOverride = body.paye != null ? toDecimal(body.paye) : undefined;
    const nssfOverride = body.nssf != null ? toDecimal(body.nssf) : undefined;
    const nhifOverride = body.nhif != null ? toDecimal(body.nhif) : undefined;
    const recalculateStatutory = body.recalculateStatutory === true;

    const existing = await prisma.payroll.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });

    const basicPayVal = basicPay != null ? Number(basicPay) : Number(existing.basicPay);
    const allowancesVal = allowances ?? (existing.allowances as { name: string; amount: number }[]) ?? [];
    const deductionsVal = deductions ?? (existing.deductions as { name: string; amount: number }[]) ?? [];

    const allowancesTotal = allowancesVal.reduce((s, a) => s + (a?.amount ?? 0), 0);
    const grossPayNum = basicPayVal + allowancesTotal;
    const otherDeductionsTotal = deductionsVal.reduce((s, d) => s + (d?.amount ?? 0), 0);

    let paye: Decimal;
    let nssf: Decimal;
    let nhif: Decimal;
    let netPay: Decimal;

    if (recalculateStatutory) {
      const calc = calculateStatutory(grossPayNum, otherDeductionsTotal);
      paye = toDecimal(calc.paye);
      nssf = toDecimal(calc.nssf);
      nhif = toDecimal(calc.nhif);
      netPay = toDecimal(calc.netPay);
    } else {
      paye = payeOverride ?? existing.paye;
      nssf = nssfOverride ?? existing.nssf;
      nhif = nhifOverride ?? existing.nhif;
      const payeNum = Number(paye);
      const nssfNum = Number(nssf);
      const nhifNum = Number(nhif);
      netPay = toDecimal(grossPayNum - payeNum - nssfNum - nhifNum - otherDeductionsTotal);
    }

    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        ...(basicPay != null ? { basicPay } : {}),
        ...(allowances != null ? { allowances } : {}),
        ...(deductions != null ? { deductions } : {}),
        grossPay: toDecimal(grossPayNum),
        paye,
        nssf,
        nhif,
        netPay,
      },
    });

    return NextResponse.json({
      id: updated.id,
      basicPay: String(updated.basicPay),
      allowances: updated.allowances,
      deductions: updated.deductions,
      grossPay: String(updated.grossPay),
      paye: String(updated.paye),
      nssf: String(updated.nssf),
      nhif: String(updated.nhif),
      netPay: String(updated.netPay),
    });
  } catch (e) {
    console.error('[payroll PATCH]', e);
    return NextResponse.json({ error: 'Failed to update payroll' }, { status: 500 });
  }
}
