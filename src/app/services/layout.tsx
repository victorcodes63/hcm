import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    "HR consulting services in Kenya: recruitment & executive search, HR outsourcing, training & development, compliance, salary surveys, and psychometric testing.",
  openGraph: {
    title: 'Our Services | Eagle HR Consultants',
    description:
      "Recruitment, HR outsourcing, training, compliance, and more. Kenya's leading HR consultancy.",
    url: '/services',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
