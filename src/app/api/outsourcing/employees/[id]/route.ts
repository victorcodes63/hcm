import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function str(b: Record<string, unknown>, key: string): string | null {
  const v = b[key];
  return typeof v === 'string' ? v.trim() || null : null;
}
function date(b: Record<string, unknown>, key: string): Date | undefined {
  const v = str(b, key);
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function mapEmployeeToJson(e: {
  id: string;
  employeeNumber: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  kraPin: string | null;
  nssfNumber: string | null;
  nhifNumber: string | null;
  idNumber: string | null;
  dateOfJoining: Date | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountNumber: string | null;
  outsourcingClientId: string;
  departmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: { id: string; name: string };
  department: { id: string; name: string } | null;
}) {
  return {
    id: e.id,
    employeeNumber: e.employeeNumber ?? null,
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    phone: e.phone ?? null,
    jobTitle: e.jobTitle ?? null,
    kraPin: e.kraPin ?? null,
    nssfNumber: e.nssfNumber ?? null,
    nhifNumber: e.nhifNumber ?? null,
    idNumber: e.idNumber ?? null,
    dateOfJoining: e.dateOfJoining?.toISOString().slice(0, 10) ?? null,
    bankName: e.bankName ?? null,
    bankBranch: e.bankBranch ?? null,
    bankAccountNumber: e.bankAccountNumber ?? null,
    clientId: e.outsourcingClientId,
    clientName: e.client.name,
    departmentId: e.departmentId,
    departmentName: e.department?.name ?? null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Employee id required' }, { status: 400 });

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    return NextResponse.json(mapEmployeeToJson(employee));
  } catch (e) {
    console.error('[outsourcing/employees GET]', e);
    return NextResponse.json({ error: 'Failed to load employee' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Employee id required' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const firstName = b.firstName !== undefined ? str(b, 'firstName') : undefined;
  const lastName = b.lastName !== undefined ? str(b, 'lastName') : undefined;
  const email = b.email !== undefined ? str(b, 'email') : undefined;
  const phone = b.phone !== undefined ? str(b, 'phone') : undefined;
  const employeeNumber = b.employeeNumber !== undefined ? str(b, 'employeeNumber') : undefined;
  const jobTitle = b.jobTitle !== undefined ? str(b, 'jobTitle') : undefined;
  const kraPin = b.kraPin !== undefined ? str(b, 'kraPin') : undefined;
  const nssfNumber = b.nssfNumber !== undefined ? str(b, 'nssfNumber') : undefined;
  const nhifNumber = b.nhifNumber !== undefined ? str(b, 'nhifNumber') : undefined;
  const idNumber = b.idNumber !== undefined ? str(b, 'idNumber') : undefined;
  const dateOfJoining = b.dateOfJoining !== undefined ? date(b, 'dateOfJoining') : undefined;
  const bankName = b.bankName !== undefined ? str(b, 'bankName') : undefined;
  const bankBranch = b.bankBranch !== undefined ? str(b, 'bankBranch') : undefined;
  const bankAccountNumber = b.bankAccountNumber !== undefined ? str(b, 'bankAccountNumber') : undefined;
  const departmentId = b.departmentId !== undefined
    ? (typeof b.departmentId === 'string' && b.departmentId.trim() ? b.departmentId.trim() : null)
    : undefined;

  if (firstName !== undefined && !firstName) {
    return NextResponse.json({ error: 'First name is required.' }, { status: 400 });
  }
  if (lastName !== undefined && !lastName) {
    return NextResponse.json({ error: 'Last name is required.' }, { status: 400 });
  }
  if (email !== undefined && !email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }
  if (email !== undefined && !/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (employeeNumber !== undefined) data.employeeNumber = employeeNumber;
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (jobTitle !== undefined) data.jobTitle = jobTitle;
  if (kraPin !== undefined) data.kraPin = kraPin;
  if (nssfNumber !== undefined) data.nssfNumber = nssfNumber;
  if (nhifNumber !== undefined) data.nhifNumber = nhifNumber;
  if (idNumber !== undefined) data.idNumber = idNumber;
  if (dateOfJoining !== undefined) data.dateOfJoining = dateOfJoining;
  if (bankName !== undefined) data.bankName = bankName;
  if (bankBranch !== undefined) data.bankBranch = bankBranch;
  if (bankAccountNumber !== undefined) data.bankAccountNumber = bankAccountNumber;
  if (departmentId !== undefined) data.departmentId = departmentId;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Provide at least one field to update.' }, { status: 400 });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const existing = await prisma.employee.findUnique({ where: { id }, select: { outsourcingClientId: true } });
    if (!existing) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

    if (email !== undefined) {
      const duplicate = await prisma.employee.findFirst({
        where: {
          outsourcingClientId: existing.outsourcingClientId,
          email: email.toLowerCase(),
          id: { not: id },
        },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'Another employee in this client already has this email.' }, { status: 409 });
      }
      data.email = (data.email as string).toLowerCase();
    }

    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(mapEmployeeToJson(employee));
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    console.error('[outsourcing/employees PATCH]', e);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Employee id required' }, { status: 400 });

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    console.error('[outsourcing/employees DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
