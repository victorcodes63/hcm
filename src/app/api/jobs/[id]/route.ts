import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInMemoryJobById, getInMemoryJobBySlugOrId, getInMemoryJobRaw, updateInMemoryJob, UpdateJobInput } from '@/lib/jobs-store';
import { JobListing } from '@/types/ats';
import { ensureUniqueSlug, jobSlugBase } from '@/lib/slug';
import { parseDateTimeAsNairobi } from '@/lib/timezone';

type PrismaJobForListing = {
  id: string;
  referenceId: string | null;
  slug: string | null;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  postedDate: Date;
  description: string;
  requirements: unknown;
  responsibilities: unknown;
  benefits: unknown;
  salary: unknown;
  experience: string | null;
  education: string | null;
  skills: unknown;
  isActive: boolean;
  applicationCount: number;
  views: number;
  applicationStartAt: Date | null;
  applicationDeadline: Date | null;
  _count?: { applications: number };
};

function prismaJobToListing(job: PrismaJobForListing): JobListing {
  const requirements = typeof job.requirements === 'string' ? job.requirements : (Array.isArray(job.requirements) ? job.requirements : []);
  const responsibilities = typeof job.responsibilities === 'string' ? job.responsibilities : (Array.isArray(job.responsibilities) ? job.responsibilities : []);
  const benefits = typeof job.benefits === 'string' ? job.benefits : (Array.isArray(job.benefits) ? job.benefits : []);
  const skills = Array.isArray(job.skills) ? job.skills : [];
  const salary =
    job.salary && typeof job.salary === 'object' && 'min' in job.salary && 'max' in job.salary
      ? (job.salary as { min: number; max: number; currency: string })
      : undefined;
  const applicationCount = job._count?.applications ?? job.applicationCount;
  return {
    id: job.id,
    referenceId: job.referenceId ?? undefined,
    slug: job.slug ?? undefined,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type as JobListing['type'],
    category: job.category,
    postedDate: job.postedDate.toISOString(),
    description: job.description,
    requirements: requirements as string[] | string,
    responsibilities: responsibilities as string[] | string,
    benefits: benefits as string[] | string,
    salary,
    experience: job.experience ?? '',
    education: job.education ?? '',
    skills: skills as string[],
    isActive: job.isActive,
    applicationStartAt: job.applicationStartAt ? job.applicationStartAt.toISOString() : undefined,
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.toISOString() : undefined,
    applicationCount: typeof applicationCount === 'number' ? applicationCount : job.applicationCount,
    views: job.views,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Job id required' }, { status: 400 });
  }
  const internal = request.nextUrl.searchParams.get('internal') === 'true';

  try {
    if (process.env.DATABASE_URL) {
      // Try by id first (supports existing CUID links and bookmarks), then by slug
      let job = await prisma.job.findUnique({
        where: { id },
        include: { client: true, _count: { select: { applications: true } } },
      });
      if (!job && id) {
        job = await prisma.job.findUnique({
          where: { slug: id },
          include: { client: true, _count: { select: { applications: true } } },
        });
      }
      if (job) {
        const jobWithStart = job as { applicationStartAt?: Date | null };
        if (!internal && jobWithStart.applicationStartAt != null && jobWithStart.applicationStartAt > new Date()) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        const listing = prismaJobToListing(job as unknown as PrismaJobForListing);
        if (!internal) {
          if (job.concealCompany || job.client?.isAnonymous) listing.company = 'Confidential';
          if (!(job as { salaryPublic?: boolean }).salaryPublic) listing.salary = undefined;
        } else {
          const out = listing as JobListing & {
            concealCompany?: boolean;
            clientId?: string | null;
            salaryPublic?: boolean;
            minYearsExperience?: number | null;
            educationLevel?: string | null;
            educationQualification?: string | null;
            requiredCertifications?: string | null;
          };
          out.concealCompany = job.concealCompany ?? false;
          out.clientId = job.clientId ?? null;
          out.salaryPublic = (job as { salaryPublic?: boolean }).salaryPublic ?? false;
          out.minYearsExperience = (job as { minYearsExperience?: number | null }).minYearsExperience ?? null;
          out.educationLevel = (job as { educationLevel?: string | null }).educationLevel ?? null;
          out.educationQualification = (job as { educationQualification?: string | null }).educationQualification ?? null;
          out.requiredCertifications = (job as { requiredCertifications?: string | null }).requiredCertifications ?? null;
        }
        return NextResponse.json(listing);
      }
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
  } catch (_e) {
    // Fall through to in-memory
  }

  if (internal) {
    const job = getInMemoryJobById(id, false);
    const raw = getInMemoryJobRaw(id);
    if (job && raw) {
      return NextResponse.json({
        ...job,
        concealCompany: raw.concealCompany ?? false,
        clientId: raw.clientId ?? null,
        salaryPublic: raw.salaryPublic ?? false,
        minYearsExperience: raw.minYearsExperience ?? null,
        educationLevel: raw.educationLevel ?? null,
        educationQualification: raw.educationQualification ?? null,
        requiredCertifications: raw.requiredCertifications ?? null,
      });
    }
  } else {
    const job = getInMemoryJobById(id, true) ?? getInMemoryJobBySlugOrId(id, true);
    if (job) {
      if (job.applicationStartAt && job.applicationStartAt > new Date().toISOString()) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return NextResponse.json(job);
    }
  }
  return NextResponse.json({ error: 'Job not found' }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Job id required' }, { status: 400 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const clientId = typeof b.clientId === 'string' ? b.clientId.trim() || undefined : undefined;
  let company = typeof b.company === 'string' ? b.company.trim() : undefined;
  const title = typeof b.title === 'string' ? b.title.trim() : undefined;
  const location = typeof b.location === 'string' ? b.location.trim() : undefined;
  const type = typeof b.type === 'string' ? b.type.trim() : undefined;
  const category = typeof b.category === 'string' ? b.category.trim() : undefined;
  const description = typeof b.description === 'string' ? b.description.trim() : undefined;
  const requirements = typeof b.requirements === 'string'
    ? b.requirements.trim() || undefined
    : Array.isArray(b.requirements)
      ? (b.requirements as unknown[]).map((x) => (typeof x === 'string' ? x.trim() : String(x))).filter(Boolean)
      : undefined;
  const responsibilities = typeof b.responsibilities === 'string'
    ? b.responsibilities.trim() || undefined
    : Array.isArray(b.responsibilities)
      ? (b.responsibilities as unknown[]).map((x) => (typeof x === 'string' ? x.trim() : String(x))).filter(Boolean)
      : undefined;
  const benefits =
    !('benefits' in b)
      ? undefined
      : typeof b.benefits === 'string'
        ? b.benefits.trim()
        : Array.isArray(b.benefits)
          ? (b.benefits as unknown[]).map((x) => (typeof x === 'string' ? x.trim() : String(x))).filter(Boolean)
          : '';
  const concealCompany = typeof b.concealCompany === 'boolean' ? b.concealCompany : undefined;
  const salaryPublic = typeof b.salaryPublic === 'boolean' ? b.salaryPublic : undefined;
  const salary =
    b.salary !== undefined && b.salary !== null && typeof b.salary === 'object' && 'min' in b.salary && 'max' in b.salary
      ? {
          min: Number((b.salary as { min: unknown }).min) || 0,
          max: Number((b.salary as { max: unknown }).max) || 0,
          currency: String((b.salary as { currency?: unknown }).currency || 'KES'),
        }
      : undefined;
  const applicationStartAt =
    b.applicationStartAt !== undefined
      ? b.applicationStartAt === null || b.applicationStartAt === ''
        ? null
        : typeof b.applicationStartAt === 'string'
          ? parseDateTimeAsNairobi(b.applicationStartAt.trim())
          : undefined
      : undefined;
  if (
    applicationStartAt !== undefined &&
    applicationStartAt !== null &&
    Number.isNaN(applicationStartAt.getTime())
  ) {
    return NextResponse.json({ error: 'Invalid application start date/time.' }, { status: 400 });
  }
  const applicationDeadline =
    b.applicationDeadline !== undefined
      ? b.applicationDeadline === null || b.applicationDeadline === ''
        ? null
        : typeof b.applicationDeadline === 'string'
          ? parseDateTimeAsNairobi(b.applicationDeadline.trim())
          : undefined
      : undefined;
  if (
    applicationDeadline !== undefined &&
    applicationDeadline !== null &&
    Number.isNaN(applicationDeadline.getTime())
  ) {
    return NextResponse.json({ error: 'Invalid application deadline date.' }, { status: 400 });
  }
  const minYearsExperience =
    b.minYearsExperience !== undefined
      ? b.minYearsExperience === null || b.minYearsExperience === ''
        ? null
        : typeof b.minYearsExperience === 'number'
          ? b.minYearsExperience
          : parseInt(String(b.minYearsExperience).trim(), 10)
      : undefined;
  const educationLevel =
    b.educationLevel !== undefined
      ? b.educationLevel === null || b.educationLevel === ''
        ? null
        : typeof b.educationLevel === 'string'
          ? b.educationLevel.trim() || null
          : undefined
      : undefined;
  const educationQualification =
    b.educationQualification !== undefined
      ? b.educationQualification === null || b.educationQualification === ''
        ? null
        : typeof b.educationQualification === 'string'
          ? b.educationQualification.trim() || null
          : undefined
      : undefined;
  const isActive = typeof b.isActive === 'boolean' ? b.isActive : undefined;

  const requiredCertifications =
    b.requiredCertifications !== undefined
      ? b.requiredCertifications === null || b.requiredCertifications === ''
        ? null
        : typeof b.requiredCertifications === 'string'
          ? b.requiredCertifications.trim() || null
          : undefined
      : undefined;

  let resolvedClientId: string | null | undefined = clientId;
  let resolvedCompany: string | undefined = company;

  if (clientId && company === undefined) {
    try {
      if (process.env.DATABASE_URL) {
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (client) resolvedCompany = client.isAnonymous ? 'Confidential' : client.name;
      } else {
        const { getInMemoryClientById } = await import('@/lib/clients-store');
        const client = getInMemoryClientById(clientId);
        if (client) resolvedCompany = client.isAnonymous ? 'Confidential' : client.name;
      }
    } catch (_e) {
      // ignore
    }
  } else if (company !== undefined && company !== '' && !clientId) {
    // No client selected but company provided: find or create client so it appears on Clients page
    try {
      const trimmed = company.trim();
      if (process.env.DATABASE_URL) {
        const existing = await prisma.client.findFirst({
          where: { name: { equals: trimmed, mode: 'insensitive' } },
        });
        if (existing) {
          resolvedClientId = existing.id;
          resolvedCompany = existing.isAnonymous ? 'Confidential' : existing.name;
        } else {
          const created = await prisma.client.create({
            data: { name: trimmed, isAnonymous: false },
          });
          resolvedClientId = created.id;
          resolvedCompany = created.name;
        }
      } else {
        const { getInMemoryClientByName, createInMemoryClient } = await import('@/lib/clients-store');
        const existing = getInMemoryClientByName(company);
        if (existing) {
          resolvedClientId = existing.id;
          resolvedCompany = existing.isAnonymous ? 'Confidential' : existing.name;
        } else {
          const created = createInMemoryClient({ name: trimmed, isAnonymous: false });
          resolvedClientId = created.id;
          resolvedCompany = created.name;
        }
      }
    } catch (_e) {
      // ignore; keep original company and no clientId
    }
  }

  const payload: UpdateJobInput = {};
  if (title !== undefined) payload.title = title;
  if (resolvedCompany !== undefined) payload.company = resolvedCompany;
  if (resolvedClientId !== undefined) payload.clientId = resolvedClientId ?? undefined;
  if (location !== undefined) payload.location = location;
  if (type !== undefined) payload.type = type;
  if (category !== undefined) payload.category = category;
  if (description !== undefined) payload.description = description;
  if (requirements !== undefined) payload.requirements = requirements;
  if (responsibilities !== undefined) payload.responsibilities = responsibilities;
  if (benefits !== undefined) payload.benefits = benefits;
  if (concealCompany !== undefined) payload.concealCompany = concealCompany;
  if (salaryPublic !== undefined) payload.salaryPublic = salaryPublic;
  if (salary !== undefined) payload.salary = salary;
  if (applicationStartAt !== undefined)
    payload.applicationStartAt =
      applicationStartAt === null ? null : applicationStartAt.toISOString();
  if (applicationDeadline !== undefined)
    payload.applicationDeadline =
      applicationDeadline === null ? null : applicationDeadline.toISOString();
  if (minYearsExperience !== undefined) payload.minYearsExperience = minYearsExperience;
  if (educationLevel !== undefined) payload.educationLevel = educationLevel;
  if (educationQualification !== undefined) payload.educationQualification = educationQualification;
  if (requiredCertifications !== undefined) payload.requiredCertifications = requiredCertifications;
  if (isActive !== undefined) payload.isActive = isActive;

  try {
    if (process.env.DATABASE_URL) {
      const existing = await prisma.job.findUnique({
        where: { id },
        select: { slug: true, title: true, location: true },
      });
      const updateData: Record<string, unknown> = {
        ...(payload.title !== undefined && { title: payload.title }),
        ...(payload.company !== undefined && { company: payload.company }),
        ...(payload.clientId !== undefined && { clientId: payload.clientId }),
        ...(payload.location !== undefined && { location: payload.location }),
        ...(payload.type !== undefined && { type: payload.type }),
        ...(payload.category !== undefined && { category: payload.category }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.requirements !== undefined && { requirements: payload.requirements }),
        ...(payload.responsibilities !== undefined && { responsibilities: payload.responsibilities }),
        ...(payload.benefits !== undefined && { benefits: payload.benefits }),
        ...(payload.concealCompany !== undefined && { concealCompany: payload.concealCompany }),
        ...(payload.salaryPublic !== undefined && { salaryPublic: payload.salaryPublic }),
        ...(payload.salary !== undefined && { salary: payload.salary }),
        ...(payload.applicationStartAt !== undefined && { applicationStartAt: payload.applicationStartAt }),
        ...(payload.applicationDeadline !== undefined && { applicationDeadline: payload.applicationDeadline }),
        ...(payload.minYearsExperience !== undefined && { minYearsExperience: payload.minYearsExperience }),
        ...(payload.educationLevel !== undefined && { educationLevel: payload.educationLevel }),
        ...(payload.educationQualification !== undefined && { educationQualification: payload.educationQualification }),
        ...(payload.requiredCertifications !== undefined && { requiredCertifications: payload.requiredCertifications }),
        ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      };
      if (existing?.slug == null) {
        const baseSlug = jobSlugBase(
          payload.title ?? existing.title,
          payload.location ?? existing.location,
          id.slice(0, 8)
        );
        const slug = await ensureUniqueSlug(baseSlug, async (s) => {
          const other = await prisma.job.findFirst({
            where: { slug: s, id: { not: id } },
          });
          return !!other;
        });
        updateData.slug = slug;
      }
      const job = await prisma.job.update({
        where: { id },
        data: updateData as Parameters<typeof prisma.job.update>[0]['data'],
      });
      const listing = prismaJobToListing(job as unknown as PrismaJobForListing);
      return NextResponse.json(listing);
    }
  } catch (_e) {
    // Prisma failed (e.g. DB unreachable) — fall through to in-memory so mem-* jobs can still be edited
  }

  const updated = updateInMemoryJob(id, payload);
  if (updated) return NextResponse.json(updated);
  return NextResponse.json({ error: 'Job not found' }, { status: 404 });
}
