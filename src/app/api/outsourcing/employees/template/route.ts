import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

const HEADERS = [
  'EMP No.',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Job Title',
  'National ID',
  'KRA PIN',
  'NSSF Number',
  'NHIF Number',
  'Date of Joining (YYYY-MM-DD)',
  'Bank Name',
  'Bank Branch',
  'Bank Account Number',
  'Department Name',
] as const;

const EXAMPLE_ROW = [
  '001',
  'John',
  'Doe',
  'john.doe@example.com',
  '+254 700 123 456',
  'Accountant',
  '12345678',
  'A001234567K',
  '12345678901',
  '98765432101',
  '2024-01-15',
  'Equity',
  'Westlands',
  '01234567890',
  'Finance',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId') || undefined;

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    let client: { name: string; departments: { name: string }[] } | null = null;
    if (clientId) {
      const c = await prisma.outsourcingClient.findUnique({
        where: { id: clientId },
        include: { departments: { orderBy: { name: 'asc' } } },
      });
      if (c) client = c;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Eagle HR ATS';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Employees', {
      views: [{ state: 'frozen', ySplit: 2 }],
      properties: { tabColor: { argb: 'FF043d4a' } },
    });

    // Instructions row
    const deptList = client && client.departments.length > 0
      ? ` Departments for ${client.name}: ${client.departments.map((d) => d.name).join(', ')}`
      : client
        ? ' Add departments in the client detail page first.'
        : ' Select a client when importing. Department Name must match the client\'s departments exactly or leave blank.';
    const clientInfo = client ? `Import employees for: ${client.name}. ` : 'Import employees. Fill rows below, then select a client and use Import. ';
    sheet.addRow([
      `${clientInfo}Required: First Name, Last Name, Email. Department Name must match exactly or leave blank.${deptList}`,
    ]);
    sheet.mergeCells('A1:O1');
    const instructionRow = sheet.getRow(1);
    instructionRow.font = { italic: true, size: 10, color: { argb: 'FF6b7280' } };
    instructionRow.height = 36;
    instructionRow.alignment = { wrapText: true, vertical: 'middle' };

    // Headers
    sheet.addRow(HEADERS);
    const headerRow = sheet.getRow(2);
    headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF043d4a' },
    };
    headerRow.alignment = { wrapText: true, vertical: 'middle' };
    headerRow.height = 22;

    // Example row
    sheet.addRow(EXAMPLE_ROW);
    const exampleRow = sheet.getRow(3);
    exampleRow.font = { italic: true, size: 10, color: { argb: 'FF9ca3af' } };

    // Set column widths
    sheet.columns = HEADERS.map((_, i) => ({
      width: i === 0 ? 10 : i <= 4 ? 20 : i === 10 ? 22 : 18,
    }));

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = client
      ? `employee-import-template-${client.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.xlsx`
      : 'employee-import-template.xlsx';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error('[employees/template]', e);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
