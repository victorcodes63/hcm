import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { InterviewWithDetails, CreateInterviewBody, InterviewType } from '@/types/dashboard';

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
  clientName?: string | null;
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
    clientName: job.clientName ?? null,
    minYearsExperience: job.minYearsExperience ?? null,
    educationLevel: job.educationLevel ?? null,
    educationQualification: job.educationQualification ?? null,
    requiredCertifications: job.requiredCertifications ?? null,
  };
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([]);
    }
    const interviews = await prisma.interview.findMany({
      where: {},
      include: {
        application: {
          include: {
            candidate: true,
            job: { include: { client: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    const list: InterviewWithDetails[] = interviews.map((i) => ({
      id: i.id,
      applicationId: i.applicationId,
      scheduledAt: i.scheduledAt.toISOString(),
      type: i.type as InterviewType,
      locationOrLink: i.locationOrLink,
      notes: i.notes,
      status: i.status,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
      application: {
        id: i.application.id,
        status: i.application.status,
        candidate: {
          id: i.application.candidate.id,
          firstName: i.application.candidate.firstName,
          lastName: i.application.candidate.lastName,
          email: i.application.candidate.email,
          phone: i.application.candidate.phone,
          location: i.application.candidate.location,
          experience: i.application.candidate.experience,
          education: i.application.candidate.education,
          resumePath: i.application.candidate.resumePath,
          createdAt: i.application.candidate.createdAt.toISOString(),
        },
        job: jobToSummary({
          id: i.application.job.id,
          title: i.application.job.title,
          company: i.application.job.company,
          location: i.application.job.location,
          type: i.application.job.type,
          category: i.application.job.category,
          postedDate: i.application.job.postedDate,
          isActive: i.application.job.isActive,
          clientId: i.application.job.clientId ?? null,
          clientName: i.application.job.client?.name ?? null,
          minYearsExperience: i.application.job.minYearsExperience ?? null,
          educationLevel: i.application.job.educationLevel ?? null,
          educationQualification: i.application.job.educationQualification ?? null,
          requiredCertifications: i.application.job.requiredCertifications ?? null,
        }),
      },
    }));
    return NextResponse.json(list);
  } catch (e) {
    console.error('GET /api/interviews error:', e);
    return NextResponse.json({ error: 'Failed to load interviews.' }, { status: 500 });
  }
}

const VALID_TYPES: InterviewType[] = ['phone', 'video', 'onsite'];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const applicationId = typeof b.applicationId === 'string' ? b.applicationId.trim() : '';
  const scheduledAtRaw = typeof b.scheduledAt === 'string' ? b.scheduledAt.trim() : '';
  const type = (typeof b.type === 'string' ? b.type.trim().toLowerCase() : '') as InterviewType;
  const locationOrLink = typeof b.locationOrLink === 'string' ? b.locationOrLink.trim() || undefined : undefined;
  const notes = typeof b.notes === 'string' ? b.notes.trim() || undefined : undefined;

  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId is required.' }, { status: 400 });
  }
  if (!scheduledAtRaw) {
    return NextResponse.json({ error: 'scheduledAt is required (ISO datetime).' }, { status: 400 });
  }
  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: 'scheduledAt must be a valid date/time.' }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'type must be one of: phone, video, onsite.' }, { status: 400 });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        scheduledAt,
        type,
        locationOrLink,
        notes,
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: { include: { client: true } },
          },
        },
      },
    });

    const out: InterviewWithDetails = {
      id: interview.id,
      applicationId: interview.applicationId,
      scheduledAt: interview.scheduledAt.toISOString(),
      type: interview.type as InterviewType,
      locationOrLink: interview.locationOrLink,
      notes: interview.notes,
      status: interview.status,
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
        job: jobToSummary({
          id: interview.application.job.id,
          title: interview.application.job.title,
          company: interview.application.job.company,
          location: interview.application.job.location,
          type: interview.application.job.type,
          category: interview.application.job.category,
          postedDate: interview.application.job.postedDate,
          isActive: interview.application.job.isActive,
          clientId: interview.application.job.clientId ?? null,
          clientName: interview.application.job.client?.name ?? null,
          minYearsExperience: interview.application.job.minYearsExperience ?? null,
          educationLevel: interview.application.job.educationLevel ?? null,
          educationQualification: interview.application.job.educationQualification ?? null,
          requiredCertifications: interview.application.job.requiredCertifications ?? null,
        }),
      },
    };
    return NextResponse.json(out);
  } catch (e) {
    console.error('POST /api/interviews error:', e);
    return NextResponse.json({ error: 'Failed to create interview.' }, { status: 500 });
  }
}
