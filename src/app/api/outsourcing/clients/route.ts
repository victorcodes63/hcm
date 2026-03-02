import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ClientWithCounts = Awaited<
  ReturnType<typeof prisma.outsourcingClient.findMany>
>[number] & { _count: { employees: number; departments: number } };

function str(b: Record<string, unknown>, key: string): string | null {
  const v = b[key];
  return typeof v === 'string' ? v.trim() || null : null;
}
function num(b: Record<string, unknown>, key: string): number | null {
  const v = b[key];
  if (v == null) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isNaN(n) ? null : n;
}
function date(b: Record<string, unknown>, key: string): Date | undefined {
  const v = str(b, key);
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseClientBody(b: Record<string, unknown>) {
  const name = str(b, 'name') ?? '';
  const serviceFeeAmount = num(b, 'serviceFeeAmount');
  return {
    name,
    contactName: str(b, 'contactName') ?? undefined,
    contactEmail: str(b, 'contactEmail') ?? undefined,
    contactPhone: str(b, 'contactPhone') ?? undefined,
    kraPin: str(b, 'kraPin') ?? undefined,
    nssfEmployerNumber: str(b, 'nssfEmployerNumber') ?? undefined,
    nhifEmployerNumber: str(b, 'nhifEmployerNumber') ?? undefined,
    companyRegistrationNumber: str(b, 'companyRegistrationNumber') ?? undefined,
    vatNumber: str(b, 'vatNumber') ?? undefined,
    bankName: str(b, 'bankName') ?? undefined,
    bankAccountNumber: str(b, 'bankAccountNumber') ?? undefined,
    bankBranch: str(b, 'bankBranch') ?? undefined,
    bankSwiftCode: str(b, 'bankSwiftCode') ?? undefined,
    currency: str(b, 'currency') ?? undefined,
    billingCycle: str(b, 'billingCycle') ?? undefined,
    serviceFeeType: str(b, 'serviceFeeType') ?? undefined,
    serviceFeeAmount: serviceFeeAmount != null ? serviceFeeAmount : undefined,
    paymentTerms: str(b, 'paymentTerms') ?? undefined,
    postalAddress: str(b, 'postalAddress') ?? undefined,
    county: str(b, 'county') ?? undefined,
    contractStartDate: date(b, 'contractStartDate'),
    contractEndDate: date(b, 'contractEndDate'),
  };
}

function mapClientToJson(c: ClientWithCounts) {
  return {
    id: c.id,
    name: c.name,
    contactName: c.contactName ?? null,
    contactEmail: c.contactEmail ?? null,
    contactPhone: c.contactPhone ?? null,
    kraPin: c.kraPin ?? null,
    nssfEmployerNumber: c.nssfEmployerNumber ?? null,
    nhifEmployerNumber: c.nhifEmployerNumber ?? null,
    companyRegistrationNumber: c.companyRegistrationNumber ?? null,
    vatNumber: c.vatNumber ?? null,
    bankName: c.bankName ?? null,
    bankAccountNumber: c.bankAccountNumber ?? null,
    bankBranch: c.bankBranch ?? null,
    bankSwiftCode: c.bankSwiftCode ?? null,
    currency: c.currency ?? 'KES',
    billingCycle: c.billingCycle ?? null,
    serviceFeeType: c.serviceFeeType ?? null,
    serviceFeeAmount: c.serviceFeeAmount != null ? String(c.serviceFeeAmount) : null,
    paymentTerms: c.paymentTerms ?? null,
    postalAddress: c.postalAddress ?? null,
    county: c.county ?? null,
    contractStartDate: c.contractStartDate?.toISOString().slice(0, 10) ?? null,
    contractEndDate: c.contractEndDate?.toISOString().slice(0, 10) ?? null,
    employeeCount: c._count.employees,
    departmentCount: c._count.departments,
  };
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([], { status: 200 });
    }
    const list = await prisma.outsourcingClient.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { employees: true, departments: true } } },
    });
    return NextResponse.json(
      list.map((c) => mapClientToJson(c))
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[outsourcing/clients]', e);
    return NextResponse.json(
      {
        error: 'Failed to load outsourcing clients',
        ...(process.env.NODE_ENV === 'development' && { detail: msg }),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const data = parseClientBody(b);
  if (!data.name) {
    return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const client = await prisma.outsourcingClient.create({
      data,
      include: { _count: { select: { employees: true, departments: true } } },
    });
    return NextResponse.json(mapClientToJson(client));
  } catch (e) {
    console.error('[outsourcing/clients POST]', e);
    return NextResponse.json({ error: 'Failed to create outsourcing client' }, { status: 500 });
  }
}
