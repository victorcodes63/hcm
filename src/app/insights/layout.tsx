import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HR Insights & Articles',
  description:
    "Expert HR insights, best practices, and industry trends from Kenya's leading HR consultancy. Stay updated with recruitment, compliance, and people strategy.",
  openGraph: {
    title: 'HR Insights & Articles | Eagle HR Consultants',
    description:
      "Expert HR insights and best practices from Kenya's leading HR consultancy.",
    url: '/insights',
  },
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
