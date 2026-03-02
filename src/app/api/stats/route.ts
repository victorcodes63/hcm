import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ activeJobs: 0, companies: 0, candidates: 0, applications: 0 });
    }

    const [activeJobs, companies, candidates, applications] = await Promise.all([
      prisma.job.count({ where: { isActive: true } }),
      prisma.client.count(),
      prisma.candidate.count(),
      prisma.application.count(),
    ]);

    return NextResponse.json({ activeJobs, companies, candidates, applications });
  } catch (e) {
    console.error('[/api/stats]', e);
    return NextResponse.json({ activeJobs: 0, companies: 0, candidates: 0, applications: 0 });
  }
}
