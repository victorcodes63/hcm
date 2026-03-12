import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

const HEADER_MAP: Record<string, string> = {
  'EMP No.': 'employeeNumber',
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'Email': 'email',
  'Phone': 'phone',
  'Job Title': 'jobTitle',
  'National ID': 'idNumber',
  'KRA PIN': 'kraPin',
  'NSSF Number': 'nssfNumber',
  'NHIF Number': 'nhifNumber',
  'Date of Joining (YYYY-MM-DD)': 'dateOfJoining',
  'Bank Name': 'bankName',
  'Bank Branch': 'bankBranch',
  'Bank Account Number': 'bankAccountNumber',
  'Department Name': 'departmentName',
};

function parseDate(val: unknown): Date | null {
  if (val == null) return null;
  if (typeof val === 'object' && val instanceof Date && !isNaN(val.getTime())) return val;
  const s = String(val).trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function parseString(val: unknown): string | null {
  if (val == null) return null;
  const s = String(val).trim();
  return s || null;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('clientId') as string | null;

    if (!file || !clientId?.trim()) {
      return NextResponse.json(
        { error: 'Both file and clientId are required.' },
        { status: 400 }
      );
    }

    const client = await prisma.outsourcingClient.findUnique({
      where: { id: clientId.trim() },
      include: { departments: true },
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const deptByName = new Map(client.departments.map((d) => [d.name.toLowerCase().trim(), d.id]));

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json({ error: 'The Excel file has no worksheets.' }, { status: 400 });
    }

    const allRows: unknown[][] = [];
    const maxCols = 15;
    sheet.eachRow((row, rowNumber) => {
      const vals: unknown[] = [];
      for (let c = 1; c <= maxCols; c++) {
        vals[c - 1] = row.getCell(c).value;
      }
      allRows[rowNumber - 1] = vals;
    });

    if (allRows.length < 2) {
      return NextResponse.json({ error: 'The file has no data rows (header + at least 1 row).' }, { status: 400 });
    }

    const headerCells = (allRows[0] ?? []) as unknown[];
    const colIndex: Record<string, number> = {};
    for (const [header, key] of Object.entries(HEADER_MAP)) {
      const idx = headerCells.findIndex((c) => String(c ?? '').trim() === header);
      if (idx >= 0) colIndex[key] = idx;
    }
    const firstNameIdx = colIndex.firstName ?? headerCells.findIndex((c) => /first\s*name/i.test(String(c ?? '')));
    const lastNameIdx = colIndex.lastName ?? headerCells.findIndex((c) => /last\s*name/i.test(String(c ?? '')));
    const emailIdx = colIndex.email ?? headerCells.findIndex((c) => /email/i.test(String(c ?? '')));

    if (firstNameIdx < 0 || lastNameIdx < 0 || emailIdx < 0) {
      return NextResponse.json({
        error: 'Could not find required columns: First Name, Last Name, Email. Use the download template.',
      }, { status: 400 });
    }

    const getVal = (row: unknown[], key: string) => {
      const idx = colIndex[key];
      return idx != null ? row[idx] : undefined;
    };

    const created: string[] = [];
    const skipped: { row: number; reason: string }[] = [];
    const errors: { row: number; reason: string }[] = [];

    for (let r = 1; r < allRows.length; r++) {
      const row = allRows[r] ?? [];
      const rowNum = r + 1;
      const firstName = parseString(getVal(row, 'firstName') ?? row[firstNameIdx]);
      const lastName = parseString(getVal(row, 'lastName') ?? row[lastNameIdx]);
      const email = parseString(getVal(row, 'email') ?? row[emailIdx]);

      if (!firstName || !lastName || !email) {
        if (!firstName && !lastName && !email) {
          skipped.push({ row: rowNum, reason: 'Empty row' });
        } else {
          errors.push({ row: rowNum, reason: 'Missing required field: First Name, Last Name, or Email' });
        }
        continue;
      }

      const emailNorm = email.toLowerCase().trim();
      if (!/\S+@\S+\.\S+/.test(emailNorm)) {
        errors.push({ row: rowNum, reason: 'Invalid email' });
        continue;
      }

      const departmentName = parseString(getVal(row, 'departmentName'));
      let departmentId: string | null = null;
      if (departmentName) {
        departmentId = deptByName.get(departmentName.toLowerCase()) ?? null;
        if (!departmentId) {
          errors.push({ row: rowNum, reason: `Department "${departmentName}" not found for this client` });
          continue;
        }
      }

      const existing = await prisma.employee.findFirst({
        where: {
          outsourcingClientId: clientId.trim(),
          email: emailNorm,
        },
      });
      if (existing) {
        skipped.push({ row: rowNum, reason: `Employee with email ${emailNorm} already exists` });
        continue;
      }

      const dateOfJoining = parseDate(getVal(row, 'dateOfJoining'));

      await prisma.employee.create({
        data: {
          outsourcingClientId: clientId.trim(),
          departmentId,
          employeeNumber: parseString(getVal(row, 'employeeNumber')),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: emailNorm,
          phone: parseString(getVal(row, 'phone')),
          jobTitle: parseString(getVal(row, 'jobTitle')),
          idNumber: parseString(getVal(row, 'idNumber')),
          kraPin: parseString(getVal(row, 'kraPin')),
          nssfNumber: parseString(getVal(row, 'nssfNumber')),
          nhifNumber: parseString(getVal(row, 'nhifNumber')),
          dateOfJoining: dateOfJoining ?? undefined,
          bankName: parseString(getVal(row, 'bankName')),
          bankBranch: parseString(getVal(row, 'bankBranch')),
          bankAccountNumber: parseString(getVal(row, 'bankAccountNumber')),
        },
      });
      created.push(`${firstName} ${lastName}`);
    }

    return NextResponse.json({
      created: created.length,
      createdNames: created,
      skipped: skipped.length,
      skippedDetails: skipped.slice(0, 20),
      errors: errors.length,
      errorDetails: errors.slice(0, 20),
    });
  } catch (e) {
    console.error('[employees/import]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to import employees' },
      { status: 500 }
    );
  }
}
