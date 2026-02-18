import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources & Tools',
  description:
    "Free HR resources: salary calculators (gross, net, PAYE), interview checklists for employers and candidates. Eagle HR tools for Kenya.",
  openGraph: {
    title: 'Resources & Tools | Eagle HR Consultants',
    description: 'Free HR resources and calculators for Kenya.',
    url: '/resources',
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
