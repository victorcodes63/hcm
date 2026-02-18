import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers & Job Board',
  description:
    "Find your next role in Kenya. Browse current job openings from top employers. Eagle HR's job board connects talented professionals with leading organisations.",
  openGraph: {
    title: 'Careers & Job Board | Eagle HR Consultants',
    description:
      "Find your next role in Kenya. Browse current job openings from top employers.",
    url: '/careers',
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
