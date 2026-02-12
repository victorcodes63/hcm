import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInMemoryCandidates } from '@/lib/applications-store';
import type { CandidateSummary } from '@/types/dashboard';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId') || undefined;
  const minExperience = searchParams.get('minExperience');
  const maxExperience = searchParams.get('maxExperience');
  const education = searchParams.get('education') || undefined;
  const search = searchParams.get('search') || undefined;

  const minExp = minExperience !== null && minExperience !== undefined && minExperience !== ''
    ? parseInt(minExperience, 10)
    : undefined;
  const maxExp = maxExperience !== null && maxExperience !== undefined && maxExperience !== ''
    ? parseInt(maxExperience, 10)
    : undefined;

  try {
    if (process.env.DATABASE_URL) {
      // When jobId is set, we want candidates who applied to this job; otherwise all candidates.
      let candidateIds: string[] | undefined;
      if (jobId) {
        const apps = await prisma.application.findMany({
          where: { jobId },
          select: { candidateId: true },
        });
        candidateIds = [...new Set(apps.map((a) => a.candidateId))];
        if (candidateIds.length === 0) {
          return NextResponse.json([]);
        }
      }

      const where: Record<string, unknown> = {};
      if (candidateIds?.length) {
        where.id = { in: candidateIds };
      }
      if (minExp != null && !Number.isNaN(minExp) && (maxExp == null || Number.isNaN(maxExp))) {
        where.experience = { gte: minExp };
      } else if (maxExp != null && !Number.isNaN(maxExp) && (minExp == null || Number.isNaN(minExp))) {
        where.experience = { lte: maxExp };
      } else if (minExp != null && !Number.isNaN(minExp) && maxExp != null && !Number.isNaN(maxExp)) {
        where.experience = { gte: minExp, lte: maxExp };
      }
      if (education?.trim()) {
        where.education = { contains: education.trim(), mode: 'insensitive' };
      }
      if (search?.trim()) {
        const q = search.trim();
        where.OR = [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ];
      }

      const candidates = await prisma.candidate.findMany({
        where: Object.keys(where).length ? where : undefined,
        orderBy: { createdAt: 'desc' },
      });

      const list: CandidateSummary[] = candidates.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        location: c.location,
        nationality: c.nationality ?? null,
        homeCounty: c.homeCounty ?? null,
        experience: c.experience,
        education: c.education,
        resumePath: c.resumePath,
        createdAt: c.createdAt.toISOString(),
      }));

      return NextResponse.json(list);
    }
  } catch (_e) {
    // fall through to in-memory
  }

  const list = getInMemoryCandidates({
    jobId,
    minExperience: minExp,
    maxExperience: maxExp,
    education,
    search,
  });
  return NextResponse.json(list);
}
