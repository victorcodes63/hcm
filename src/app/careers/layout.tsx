import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Careers at Stabex International. Learn about open opportunities and how to apply.',
  openGraph: {
    title: 'Careers • Stabex International',
    description: 'Join our team — explore open roles and apply online.',
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
