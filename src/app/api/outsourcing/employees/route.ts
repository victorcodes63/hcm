import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([], { status: 200 });
    }
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const jobTitle = searchParams.get('jobTitle') || undefined;

    const employees = await prisma.employee.findMany({
      where: {
        ...(clientId ? { outsourcingClientId: clientId } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(jobTitle?.trim() ? { jobTitle: { equals: jobTitle.trim(), mode: 'insensitive' } } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ client: { name: 'asc' } }, { lastName: 'asc' }, { firstName: 'asc' }],
    });

    const list = employees.map((e) => ({
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
    }));

    return NextResponse.json(list);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[outsourcing/employees]', e);
    return NextResponse.json(
      {
        error: 'Failed to load employees',
        ...(process.env.NODE_ENV === 'development' && { detail: msg }),
      },
      { status: 500 }
    );
  }
}
