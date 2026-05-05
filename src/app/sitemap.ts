import type { MetadataRoute } from 'next';

export const revalidate = 3600; // Revalidate sitemap every hour

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, '') ||
  'https://www.example.com';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  { url: `${baseUrl}/careers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${baseUrl}/insights`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${baseUrl}/services/recruitment`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/services/hr-outsourcing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/services/training-development`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/services/hr-compliance`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/services/salary-surveys`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/services/hr-documentation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/services/psychometric-testing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/resources/interview-checklist-employers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${baseUrl}/resources/interview-checklist-candidates`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${baseUrl}/resources/interview-checklist-employees`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [...staticRoutes];

  try {
    const [jobsRes, insightsRes] = await Promise.all([
      fetch(`${baseUrl}/api/jobs?activeOnly=true`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/insights`, { next: { revalidate: 3600 } }),
    ]);

    if (jobsRes.ok) {
      const jobs = (await jobsRes.json()) as Array<{ id: string; slug?: string | null }>;
      for (const job of Array.isArray(jobs) ? jobs : []) {
        const path = job.slug ?? job.id;
        routes.push({
          url: `${baseUrl}/careers/apply/${path}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    if (insightsRes.ok) {
      const insights = (await insightsRes.json()) as Array<{ slug?: string | null }>;
      for (const insight of Array.isArray(insights) ? insights : []) {
        if (insight.slug) {
          routes.push({
            url: `${baseUrl}/insights/${insight.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      }
    }
  } catch {
    // If API fails (e.g. at build time without DB), sitemap still returns static routes
  }

  return routes;
}
