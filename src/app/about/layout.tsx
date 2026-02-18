import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Learn about Eagle HR Consultants – Kenya's premier HR consultancy. Our mission, team, and commitment to transforming organisations through exceptional people practices.",
  openGraph: {
    title: 'About Us | Eagle HR Consultants',
    description:
      "Kenya's premier HR consultancy. Our mission, team, and commitment to transforming organisations.",
    url: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
