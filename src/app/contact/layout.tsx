import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    "Get in touch with Eagle HR Consultants. Nairobi office, phone, email. We're here to help with recruitment, HR outsourcing, training, and advisory services.",
  openGraph: {
    title: 'Contact Us | Eagle HR Consultants',
    description:
      "Get in touch with Eagle HR Consultants. We're here to help with HR solutions.",
    url: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
