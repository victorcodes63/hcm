import type { Metadata } from 'next';

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, '') ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return { title: 'Insight' };

  try {
    const res = await fetch(`${baseUrl}/api/insights/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: 'Article' };
    const data = (await res.json()) as { title?: string; excerpt?: string; image?: string };
    const title = data.title || 'Article';
    const description = data.excerpt?.slice(0, 160) || undefined;
    return {
      title,
      description,
      openGraph: {
        title: `${title} | Eagle HR Consultants`,
        description,
        url: `/insights/${slug}`,
        type: 'article',
        ...(data.image && { images: [{ url: data.image }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Eagle HR Consultants`,
        description,
      },
    };
  } catch {
    return { title: 'Article' };
  }
}

export default function InsightSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
