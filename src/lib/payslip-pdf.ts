/**
 * Generate payslip PDF for email attachment.
 * World-class layout matching professional reference design.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

export interface PayslipPdfData {
  employeeName: string;
  employeeNumber?: string | null;
  clientName: string;
  departmentName?: string | null;
  basicPay: string;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossPay: string;
  paye: string;
  nssf: string;
  nhif: string;
  netPay: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatAmount(val: string | number): string {
  return Number(val).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

// Brand colors
const PRIMARY = rgb(4 / 255, 61 / 255, 74 / 255);       // #043d4a
const SECONDARY = rgb(222 / 255, 141 / 255, 0 / 255);  // #de8d00 orange accent
const GRAY_600 = rgb(82 / 255, 82 / 255, 82 / 255);
const GRAY_500 = rgb(115 / 255, 115 / 255, 115 / 255);
const LIGHT_BG = rgb(249 / 255, 250 / 255, 251 / 255); // #f9fafb
const BORDER = rgb(229 / 255, 229 / 255, 229 / 255);

const LOGO_PATH = resolve(process.cwd(), 'public/images/logo/logo_dark_ubxaCll.png');

export async function generatePayslipPdf(
  data: PayslipPdfData,
  month: number,
  year: number
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const monthName = MONTH_NAMES[month - 1] ?? String(month);
  const fmt = (v: string | number) => `KES ${formatAmount(v)}`;

  const margin = 60;
  const contentWidth = width - margin * 2;
  let y = height - margin;

  // 1. Logo (centered)
  if (existsSync(LOGO_PATH)) {
    try {
      const logoBytes = readFileSync(LOGO_PATH);
      const png = await doc.embedPng(logoBytes);
      const logoW = 120;
      const logoH = (png.height / png.width) * logoW;
      page.drawImage(png, {
        x: width / 2 - logoW / 2,
        y: y - logoH,
        width: logoW,
        height: logoH,
      });
      y -= logoH + 8;
    } catch {
      // Fallback to text branding
      const w = helveticaBold.widthOfTextAtSize('EAGLE HR CONSULTANTS', 16);
      page.drawText('EAGLE HR CONSULTANTS', {
        x: width / 2 - w / 2,
        y: y - 16,
        size: 16,
        font: helveticaBold,
        color: PRIMARY,
      });
      y -= 28;
    }
  } else {
    const w = helveticaBold.widthOfTextAtSize('EAGLE HR CONSULTANTS', 16);
    page.drawText('EAGLE HR CONSULTANTS', {
      x: width / 2 - w / 2,
      y: y - 16,
      size: 16,
      font: helveticaBold,
      color: PRIMARY,
    });
    y -= 28;
  }

  // Horizontal line
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.75,
    color: BORDER,
  });
  y -= 28;

  // 2. Greeting
  page.drawText(`Dear ${data.employeeName},`, {
    x: margin,
    y,
    size: 14,
    font: helvetica,
    color: GRAY_600,
  });
  y -= 16;
  page.drawText(`Please find your payslip for ${monthName} ${year}.`, {
    x: margin,
    y,
    size: 12,
    font: helvetica,
    color: GRAY_600,
  });
  y -= 24;

  // 3. Employee/Client/Department box (light grey background)
  const boxPadding = 16;
  const infoRows = [
    ['Employee', data.employeeName + (data.employeeNumber ? ` (${data.employeeNumber})` : '')],
    ['Client', data.clientName],
    ...(data.departmentName ? [['Department', data.departmentName]] as [string, string][] : []),
  ];
  const infoBoxH = infoRows.length * 20 + boxPadding * 2;
  page.drawRectangle({
    x: margin,
    y: y - infoBoxH,
    width: contentWidth,
    height: infoBoxH,
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 1,
  });
  let infoY = y - boxPadding - 14;
  for (const [label, value] of infoRows) {
    page.drawText(label, { x: margin + boxPadding, y: infoY, size: 11, font: helveticaBold, color: GRAY_600 });
    const valW = helvetica.widthOfTextAtSize(value, 11);
    page.drawText(value, { x: width - margin - boxPadding - valW, y: infoY, size: 11, font: helvetica, color: GRAY_600 });
    infoY -= 20;
  }
  y -= infoBoxH + 24;

  // 4. Earnings section
  page.drawText('Earnings', {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: PRIMARY,
  });
  y -= 20;

  const earningsRows: [string, string][] = [
    ['Basic pay', fmt(data.basicPay)],
    ...(data.allowances ?? []).map((a) => [a.name, fmt(a.amount)]),
    ['Gross pay', fmt(data.grossPay)],
  ];
  const rowH = 14;
  for (let i = 0; i < earningsRows.length; i++) {
    const [label, amt] = earningsRows[i];
    const isTotal = label === 'Gross pay';
    if (isTotal) {
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: BORDER,
      });
      y -= 6;
    }
    const font = isTotal ? helveticaBold : helvetica;
    const color = isTotal ? PRIMARY : GRAY_600;
    page.drawText(label, { x: margin, y, size: 11, font, color });
    const amtW = font.widthOfTextAtSize(amt, 11);
    page.drawText(amt, { x: width - margin - amtW, y, size: 11, font, color });
    y -= rowH;
  }
  y -= 16;

  // 5. Deductions section
  page.drawText('Deductions', {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: PRIMARY,
  });
  y -= 20;

  const deductionsRows: [string, string][] = [
    ['PAYE', fmt(data.paye)],
    ['NSSF', fmt(data.nssf)],
    ['NHIF', fmt(data.nhif)],
    ...(data.deductions ?? []).map((d) => [d.name, fmt(d.amount)]),
    ['Net pay', fmt(data.netPay)],
  ];
  for (let i = 0; i < deductionsRows.length; i++) {
    const [label, amt] = deductionsRows[i];
    const isTotal = label === 'Net pay';
    if (isTotal) {
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: BORDER,
      });
      y -= 6;
    }
    const font = isTotal ? helveticaBold : helvetica;
    const color = isTotal ? SECONDARY : GRAY_600;
    page.drawText(label, { x: margin, y, size: 11, font, color });
    const amtW = font.widthOfTextAtSize(amt, 11);
    page.drawText(amt, { x: width - margin - amtW, y, size: 11, font, color });
    y -= rowH;
  }

  // 6. Footer (centered)
  const footer = 'Computer-generated payslip. For queries, contact Eagle HR Consultants.';
  const footerW = helvetica.widthOfTextAtSize(footer, 9);
  page.drawText(footer, {
    x: width / 2 - footerW / 2,
    y: 50,
    size: 9,
    font: helvetica,
    color: GRAY_500,
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
