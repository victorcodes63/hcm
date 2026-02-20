import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { InterviewWithDetails, InterviewType, InterviewDurationMinutes } from '@/types/dashboard';

const MAX_PER_SCHEDULE = 10;
const VALID_TYPES: InterviewType[] = ['phone', 'video', 'onsite'];
const VALID_DURATIONS: InterviewDurationMinutes[] = [30, 45, 60];

function jobToSummary(job: {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  postedDate: Date;
  isActive: boolean;
  clientId?: string | null;
  client?: { name: string | null } | null;
  minYearsExperience?: number | null;
  educationLevel?: string | null;
  educationQualification?: string | null;
  requiredCertifications?: string | null;
}) {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    category: job.category,
    postedDate: job.postedDate.toISOString(),
    isActive: job.isActive,
    clientId: job.clientId ?? null,
    clientName: job.client?.name ?? null,
    minYearsExperience: job.minYearsExperience ?? null,
    educationLevel: job.educationLevel ?? null,
    educationQualification: job.educationQualification ?? null,
    requiredCertifications: job.requiredCertifications ?? null,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const b = body as {
    jobId?: string;
    date?: string;
    startTime?: string;
    durationMinutes?: number;
    type?: string;
    applicationIds?: string[];
    locationOrLink?: string;
  };
  const jobId = typeof b.jobId === 'string' ? b.jobId.trim() : '';
  const dateStr = typeof b.date === 'string' ? b.date.trim() : '';
  const startTimeStr = typeof b.startTime === 'string' ? b.startTime.trim() : '09:00';
  const durationMinutes = b.durationMinutes != null && VALID_DURATIONS.includes(b.durationMinutes as InterviewDurationMinutes)
    ? (b.durationMinutes as InterviewDurationMinutes)
    : 45;
  const type = (typeof b.type === 'string' ? b.type.trim().toLowerCase() : 'video') as InterviewType;
  const applicationIds = Array.isArray(b.applicationIds)
    ? b.applicationIds.filter((id): id is string => typeof id === 'string').slice(0, MAX_PER_SCHEDULE)
    : [];
  const locationOrLink = typeof b.locationOrLink === 'string' ? b.locationOrLink.trim() || null : null;

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
  }
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: 'date is required (YYYY-MM-DD).' }, { status: 400 });
  }
  if (applicationIds.length === 0) {
    return NextResponse.json({ error: 'applicationIds is required (at least one, max 10).' }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'type must be one of: phone, video, onsite.' }, { status: 400 });
  }
  if (!locationOrLink || locationOrLink.length === 0) {
    return NextResponse.json({ error: 'locationOrLink is required (e.g. Zoom link or office address).' }, { status: 400 });
  }

  const [hours, minutes] = startTimeStr.split(':').map((s) => parseInt(s, 10) || 0);
  const baseDate = new Date(dateStr);
  if (Number.isNaN(baseDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date.' }, { status: 400 });
  }
  baseDate.setHours(hours, minutes, 0, 0);

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true },
    });
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }
    const applications = await prisma.application.findMany({
      where: { id: { in: applicationIds }, jobId },
      include: { candidate: true, job: { include: { client: true } } },
    });
    if (applications.length !== applicationIds.length) {
      return NextResponse.json({
        error: 'Some application IDs were not found or do not belong to this job.',
      }, { status: 400 });
    }
    const created: InterviewWithDetails[] = [];
    let slotStart = new Date(baseDate.getTime());
    for (const app of applications) {
      const interview = await prisma.interview.create({
        data: {
          applicationId: app.id,
          scheduledAt: new Date(slotStart.getTime()),
          durationMinutes,
          type,
          locationOrLink,
          notes: null,
        },
        include: {
          application: {
            include: { candidate: true, job: { include: { client: true } } },
          },
        },
      });
      created.push({
        id: interview.id,
        applicationId: interview.applicationId,
        scheduledAt: interview.scheduledAt.toISOString(),
        durationMinutes: interview.durationMinutes,
        type: interview.type as InterviewType,
        locationOrLink: interview.locationOrLink,
        notes: interview.notes,
        status: interview.status,
        inviteSentAt: interview.inviteSentAt?.toISOString() ?? null,
        officialLetterPath: interview.officialLetterPath,
        confirmationStatus: interview.confirmationStatus ?? 'pending',
        confirmationNotes: interview.confirmationNotes,
        confirmationAt: interview.confirmationAt?.toISOString() ?? null,
        createdAt: interview.createdAt.toISOString(),
        updatedAt: interview.updatedAt.toISOString(),
        application: {
          id: interview.application.id,
          status: interview.application.status,
          candidate: {
            id: interview.application.candidate.id,
            firstName: interview.application.candidate.firstName,
            lastName: interview.application.candidate.lastName,
            email: interview.application.candidate.email,
            phone: interview.application.candidate.phone,
            location: interview.application.candidate.location,
            experience: interview.application.candidate.experience,
            education: interview.application.candidate.education,
            resumePath: interview.application.candidate.resumePath,
            createdAt: interview.application.candidate.createdAt.toISOString(),
          },
          job: jobToSummary(interview.application.job),
        },
      });
      slotStart = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
    }
    return NextResponse.json(created);
  } catch (e) {
    console.error('POST /api/interviews/bulk error:', e);
    return NextResponse.json({ error: 'Failed to create interviews.' }, { status: 500 });
  }
}
