import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APP_TIMEZONE } from '@/lib/timezone';
import { generateInterviewSchedulePdf } from '@/lib/interview-schedule-pdf';

const LOGO_PATH = '/images/logo/logo_dark_ubxaCll.png';

/**
 * GET /api/interviews/export-schedule?date=YYYY-MM-DD&jobId=xxx
 *   OR ?ids=id1,id2,id3 (export selected interviews only)
 * ?format=pdf — returns PDF for direct download
 * Default: returns HTML for viewing/printing
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids') || '';
  const dateStr = searchParams.get('date') || '';
  const jobId = searchParams.get('jobId') || undefined;
  const formatPdf = searchParams.get('format') === 'pdf';

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }

    let interviews: Awaited<ReturnType<typeof prisma.interview.findMany>>;

    if (idsParam.trim()) {
      const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ error: 'Query "ids" must be a comma-separated list of interview IDs.' }, { status: 400 });
      }
      interviews = await prisma.interview.findMany({
        where: { id: { in: ids } },
        include: {
          application: {
            include: { candidate: true, job: true },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      });
      // Preserve order of ids if needed (findMany returns in arbitrary order; we ordered by scheduledAt)
    } else {
      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return NextResponse.json({ error: 'Query "date" (YYYY-MM-DD) or "ids" is required.' }, { status: 400 });
      }
      const dateStart = new Date(dateStr);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStr);
      dateEnd.setHours(23, 59, 59, 999);
      if (Number.isNaN(dateStart.getTime())) {
        return NextResponse.json({ error: 'Invalid date.' }, { status: 400 });
      }
      const where: { scheduledAt: { gte: Date; lte: Date }; application?: { jobId: string } } = {
        scheduledAt: { gte: dateStart, lte: dateEnd },
      };
      if (jobId?.trim()) where.application = { jobId: jobId.trim() };
      interviews = await prisma.interview.findMany({
        where,
        include: {
          application: {
            include: { candidate: true, job: true },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      });
    }

    const positionTitle = interviews.length > 0 ? (interviews[0].application as { job: { title: string } }).job.title : '—';
    const scheduleDate = interviews.length > 0
      ? new Date(interviews[0].scheduledAt).toLocaleDateString('en-KE', { dateStyle: 'long', timeZone: APP_TIMEZONE })
      : (dateStr ? new Date(dateStr).toLocaleDateString('en-KE', { dateStyle: 'long', timeZone: APP_TIMEZONE }) : '—');
    const venue = interviews.length > 0 && (interviews[0].locationOrLink?.trim())
      ? interviews[0].locationOrLink!.trim()
      : '—';

    const isMeetingUrl = (s: string | null | undefined) => {
      const t = s?.trim();
      return !!t && (t.startsWith('http://') || t.startsWith('https://'));
    };
    const hasAnyVirtualMeeting = interviews.some(
      (i) => i.type === 'video' && isMeetingUrl(i.locationOrLink)
    );

    const rows = interviews.map((i, index) => {
      const start = i.scheduledAt;
      const durationMs = (i.durationMinutes ?? 45) * 60 * 1000;
      const end = new Date(start.getTime() + durationMs);
      const timeRange = `${start.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', timeZone: APP_TIMEZONE })} – ${end.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', timeZone: APP_TIMEZONE })}`;
      const candidate = i.application as { candidate: { firstName: string; lastName: string; email: string; phone: string | null } };
      const fullName = `${candidate.candidate.firstName} ${candidate.candidate.lastName}`;
      const email = candidate.candidate.email ?? '—';
      const phone = candidate.candidate.phone?.trim() ?? '—';
      const meetingLink = hasAnyVirtualMeeting
        ? (i.type === 'video' && isMeetingUrl(i.locationOrLink) ? i.locationOrLink!.trim() : '—')
        : null; // omit column
      const base: string[] = [`${index + 1}.`, fullName, email, phone, timeRange];
      if (hasAnyVirtualMeeting) base.push(meetingLink!);
      base.push(''); // Time in
      return base;
    });

    const headers = ['No.', 'Candidate', 'Email', 'Phone', 'Time', ...(hasAnyVirtualMeeting ? ['Meeting link'] : []), 'Time in'];

    if (formatPdf) {
      const pdfBuffer = await generateInterviewSchedulePdf({
        positionTitle,
        scheduleDate,
        venue,
        headers,
        rows,
      });
      const pdfFilename = idsParam.trim()
        ? `interview-schedule-selected-${interviews.length}.pdf`
        : `interview-schedule-${dateStr}.pdf`;
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfFilename}"`,
          'Content-Length': String(pdfBuffer.byteLength),
        },
      });
    }

    const pageTitle = `Interview Schedule – ${positionTitle} – Eagle HR`;
    const logoFullUrl = request.nextUrl.origin + LOGO_PATH;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, 'Helvetica Neue', sans-serif;
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px 32px;
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.4;
    }
    .header { text-align: center; margin-bottom: 28px; }
    .logo { margin-bottom: 20px; }
    .logo img { max-width: 180px; height: auto; display: inline-block; }
    .schedule-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: #0B1D39;
    }
    .position {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }
    .date-venue {
      color: #555;
      font-size: 0.9375rem;
      margin: 0;
      text-align: center;
    }
    .date-venue .label { font-weight: 600; color: #333; }
    .schedule-wrap {
      width: 100%;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 13px;
    }
    table col.col-no { width: 6%; }
    table col.col-candidate { width: 15%; }
    table col.col-email { width: 19%; }
    table col.col-phone { width: 17%; }
    table col.col-time { width: 13%; }
    table col.col-meeting { width: 18%; }
    table col.col-timein { width: 12%; }
    th, td {
      border: 1px solid #000000;
      padding: 12px 14px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #0B1D39 !important;
      color: #ffffff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    tbody tr:nth-child(even) { background: #f5f6f8; }
    tbody tr:hover { background: #eef0f3; }
    td { word-wrap: break-word; overflow-wrap: break-word; }
    @media print {
      body { max-width: none; padding: 16px 20px; }
      .schedule-wrap { overflow: visible; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      th {
        background: #0B1D39 !important;
        color: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo"><img src="${escapeHtml(logoFullUrl)}" alt="Eagle HR" width="180" /></div>
    <h1 class="schedule-title">Interview Schedule</h1>
    <p class="position">${escapeHtml(positionTitle)}</p>
    <p class="date-venue"><span class="label">Date:</span> ${escapeHtml(scheduleDate)}</p>
    <p class="date-venue"><span class="label">Venue:</span> ${escapeHtml(venue)}</p>
  </header>
  <div class="schedule-wrap">
    <table>
      <colgroup>
        <col class="col-no" />
        <col class="col-candidate" />
        <col class="col-email" />
        <col class="col-phone" />
        <col class="col-time" />
        ${hasAnyVirtualMeeting ? '<col class="col-meeting" />' : ''}
        <col class="col-timein" />
      </colgroup>
      <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${hasAnyVirtualMeeting ? 7 : 6}">No interviews scheduled.</td></tr>`}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  function escapeHtml(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  const filename = idsParam.trim()
    ? `interview-schedule-selected-${interviews.length}.html`
    : `interview-schedule-${dateStr}.html`;
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
  } catch {
    return NextResponse.json({ error: 'Failed to generate schedule.' }, { status: 500 });
  }
}
