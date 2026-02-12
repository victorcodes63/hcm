import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getInMemoryJobs,
  createInMemoryJob,
  CreateJobInput,
} from '@/lib/jobs-store';
import { JobListing } from '@/types/ats';

type PrismaJobForListing = {
  id: string;
  referenceId: string | null;
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
  applicationDeadline: Date | null;
  _count?: { applications: number };
};

function prismaJobToListing(job: PrismaJobForListing): JobListing {
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];
  const skills = Array.isArray(job.skills) ? job.skills : [];
  const salary =
    job.salary && typeof job.salary === 'object' && 'min' in job.salary && 'max' in job.salary
      ? (job.salary as { min: number; max: number; currency: string })
      : undefined;
  const applicationCount = job._count?.applications ?? job.applicationCount;
  return {
    id: job.id,
    referenceId: job.referenceId ?? undefined,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type as JobListing['type'],
    category: job.category,
    postedDate: job.postedDate.toISOString(),
    description: job.description,
    requirements: requirements as string[],
    responsibilities: responsibilities as string[],
    benefits: benefits as string[],
    salary,
    experience: job.experience ?? '',
    education: job.education ?? '',
    skills: skills as string[],
    isActive: job.isActive,
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.toISOString() : undefined,
    applicationCount: typeof applicationCount === 'number' ? applicationCount : job.applicationCount,
    views: job.views,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('activeOnly') === 'true';
  const keyword = searchParams.get('keyword')?.toLowerCase();
  const location = searchParams.get('location')?.toLowerCase();
  const category = searchParams.get('category');

  try {
    if (process.env.DATABASE_URL) {
      const now = new Date();
      const jobs = await prisma.job.findMany({
        where: {
          ...(activeOnly
            ? {
                isActive: true,
                OR: [
                  { applicationDeadline: null },
                  { applicationDeadline: { gt: now } },
                ],
              }
            : {}),
          ...(keyword
            ? {
                OR: [
                  { title: { contains: keyword, mode: 'insensitive' } },
                  { company: { contains: keyword, mode: 'insensitive' } },
                  { description: { contains: keyword, mode: 'insensitive' } },
                ],
              }
            : {}),
          ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
          ...(category ? { category } : {}),
        },
        include: { client: true, _count: { select: { applications: true } } },
        orderBy: { postedDate: 'desc' },
      });
      const list = jobs.map((job) => {
        const listing = prismaJobToListing(job as unknown as PrismaJobForListing);
        if (activeOnly) {
          if (job.concealCompany || job.client?.isAnonymous) listing.company = 'Confidential';
          if (!(job as { salaryPublic?: boolean }).salaryPublic) listing.salary = undefined;
        }
        return listing;
      });
      return NextResponse.json(list);
    }
  } catch (_e) {
    // DATABASE_URL set but Prisma failed (e.g. not migrated) — fall through to in-memory
  }

  const list = getInMemoryJobs(activeOnly, activeOnly);
  let filtered = list;
  if (keyword) {
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(keyword) ||
        j.company.toLowerCase().includes(keyword) ||
        j.description.toLowerCase().includes(keyword)
    );
  }
  if (location) {
    filtered = filtered.filter((j) => j.location.toLowerCase().includes(location));
  }
  if (category) {
    filtered = filtered.filter((j) => j.category === category);
  }
  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const clientId = typeof b.clientId === 'string' ? b.clientId.trim() || undefined : undefined;
  let company = typeof b.company === 'string' ? b.company.trim() : '';
  const title = typeof b.title === 'string' ? b.title.trim() : '';
  const location = typeof b.location === 'string' ? b.location.trim() : '';
  const type = typeof b.type === 'string' ? b.type.trim() : 'Full Time';
  const category = typeof b.category === 'string' ? b.category.trim() : '';
  const description = typeof b.description === 'string' ? b.description.trim() : '';
  const requirements = Array.isArray(b.requirements)
    ? (b.requirements as unknown[]).map((x) => (typeof x === 'string' ? x.trim() : String(x))).filter(Boolean)
    : [];
  const responsibilities = Array.isArray(b.responsibilities)
    ? (b.responsibilities as unknown[]).map((x) => (typeof x === 'string' ? x.trim() : String(x))).filter(Boolean)
    : [];
  const benefits = Array.isArray(b.benefits)
    ? (b.benefits as unknown[]).map((x) => (typeof x === 'string' ? x.trim() : String(x))).filter(Boolean)
    : [];

  if (!title || !description || requirements.length === 0 || responsibilities.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields: title, description, requirements, and responsibilities are required.' },
      { status: 400 }
    );
  }
  let resolvedClientId: string | undefined = clientId;

  if (clientId) {
    // Resolve company from selected client (name or "Confidential" if anonymous)
    try {
      if (process.env.DATABASE_URL) {
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (client) company = client.isAnonymous ? 'Confidential' : client.name;
        else return NextResponse.json({ error: 'Client not found.' }, { status: 400 });
      } else {
        const { getInMemoryClientById } = await import('@/lib/clients-store');
        const client = getInMemoryClientById(clientId);
        if (client) company = client.isAnonymous ? 'Confidential' : client.name;
        else return NextResponse.json({ error: 'Client not found.' }, { status: 400 });
      }
    } catch (_e) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 400 });
    }
  } else if (company) {
    // No client selected: find or create a client by company name so it appears on Clients page
    try {
      if (process.env.DATABASE_URL) {
        const existing = await prisma.client.findFirst({
          where: { name: { equals: company.trim(), mode: 'insensitive' } },
        });
        if (existing) {
          resolvedClientId = existing.id;
          company = existing.isAnonymous ? 'Confidential' : existing.name;
        } else {
          const created = await prisma.client.create({
            data: { name: company.trim(), isAnonymous: false },
          });
          resolvedClientId = created.id;
          company = created.name;
        }
      } else {
        const { getInMemoryClientByName, createInMemoryClient } = await import('@/lib/clients-store');
        const existing = getInMemoryClientByName(company);
        if (existing) {
          resolvedClientId = existing.id;
          company = existing.isAnonymous ? 'Confidential' : existing.name;
        } else {
          const created = createInMemoryClient({ name: company.trim(), isAnonymous: false });
          resolvedClientId = created.id;
          company = created.name;
        }
      }
    } catch (_e) {
      return NextResponse.json({ error: 'Failed to find or create client.' }, { status: 500 });
    }
  }

  if (!company) {
    return NextResponse.json({ error: 'Company is required (or select a client).' }, { status: 400 });
  }
  if (!location) {
    return NextResponse.json({ error: 'Location is required.' }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
  }

  const salary =
    b.salary && typeof b.salary === 'object' && b.salary !== null && 'min' in b.salary && 'max' in b.salary
      ? {
          min: Number((b.salary as { min: unknown }).min) || 0,
          max: Number((b.salary as { max: unknown }).max) || 0,
          currency: String((b.salary as { currency?: unknown }).currency || 'KES'),
        }
      : undefined;
  const experience = typeof b.experience === 'string' ? b.experience.trim() : undefined;
  const education = typeof b.education === 'string' ? b.education.trim() : undefined;
  const minYearsExperience =
    typeof b.minYearsExperience === 'number'
      ? b.minYearsExperience
      : typeof b.minYearsExperience === 'string' && b.minYearsExperience.trim() !== ''
        ? parseInt(b.minYearsExperience.trim(), 10)
        : undefined;
  const educationLevel = typeof b.educationLevel === 'string' ? b.educationLevel.trim() || undefined : undefined;
  const educationQualification = typeof b.educationQualification === 'string' ? b.educationQualification.trim() || undefined : undefined;
  const requiredCertifications = typeof b.requiredCertifications === 'string' ? b.requiredCertifications.trim() || undefined : undefined;
  const skills = Array.isArray(b.skills)
    ? (b.skills as unknown[]).map((x) => (typeof x === 'string' ? x.trim() : String(x))).filter(Boolean)
    : [];
  const concealCompany = b.concealCompany === true;
  const salaryPublic = b.salaryPublic === true;
  const applicationDeadline =
    typeof b.applicationDeadline === 'string' && b.applicationDeadline.trim()
      ? new Date(b.applicationDeadline.trim())
      : undefined;
  if (applicationDeadline !== undefined && Number.isNaN(applicationDeadline.getTime())) {
    return NextResponse.json({ error: 'Invalid application deadline date.' }, { status: 400 });
  }

  const input: CreateJobInput = {
    title,
    company,
    location,
    type,
    category,
    description,
    requirements,
    responsibilities,
    benefits: benefits.length ? benefits : undefined,
    salary,
    experience,
    education,
    minYearsExperience: minYearsExperience != null && !Number.isNaN(minYearsExperience) ? minYearsExperience : undefined,
    educationLevel,
    educationQualification,
    requiredCertifications,
    skills: skills.length ? skills : undefined,
    clientId: resolvedClientId,
    concealCompany,
    salaryPublic,
    applicationDeadline: applicationDeadline ? applicationDeadline.toISOString() : undefined,
  };

  try {
    if (process.env.DATABASE_URL) {
      const year = new Date().getFullYear();
      const prefix = `JOB-${year}-`;
      const existing = await prisma.job.findMany({
        where: { referenceId: { startsWith: prefix } },
        select: { referenceId: true },
        orderBy: { referenceId: 'desc' },
        take: 1,
      });
      const nextNum = existing.length === 0
        ? 1
        : (parseInt(existing[0].referenceId?.replace(prefix, '') || '0', 10) + 1);
      const referenceId = `${prefix}${String(nextNum).padStart(4, '0')}`;

      const job = await prisma.job.create({
        data: {
          referenceId,
          title: input.title,
          company: input.company,
          location: input.location,
          type: input.type,
          category: input.category,
          description: input.description,
          requirements: input.requirements,
          responsibilities: input.responsibilities,
          benefits: input.benefits ?? [],
          salary: input.salary ?? undefined,
          experience: input.experience ?? null,
          education: input.education ?? null,
          minYearsExperience: input.minYearsExperience ?? null,
          educationLevel: input.educationLevel ?? null,
          educationQualification: input.educationQualification ?? null,
          requiredCertifications: input.requiredCertifications ?? null,
          skills: input.skills ?? [],
          clientId: resolvedClientId ?? null,
          concealCompany: input.concealCompany ?? false,
          salaryPublic: input.salaryPublic ?? false,
          applicationDeadline: applicationDeadline ?? null,
        },
      });
      return NextResponse.json(prismaJobToListing(job as unknown as PrismaJobForListing));
    }
  } catch (_e) {
    // Fall through to in-memory
  }

  const job = createInMemoryJob(input);
  return NextResponse.json(job);
}
