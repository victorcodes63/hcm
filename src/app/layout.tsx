import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, '') || 'https://www.eaglehr.co.ke';

export const metadata: Metadata = {
  title: {
    default: "Eagle HR Consultants - Leading HR Excellence in Kenya",
    template: "%s | Eagle HR Consultants",
  },
  description: "Transform your organization with Kenya's premier HR consulting firm. Expert recruitment, training, HR outsourcing, and advisory services that drive success.",
  keywords: "HR consulting, recruitment, training, HR outsourcing, Kenya, Nairobi, human resources, executive search, payroll management",
  authors: [{ name: "Eagle HR Consultants" }],
  creator: "Eagle HR Consultants",
  publisher: "Eagle HR Consultants",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Eagle HR Consultants - Leading HR Excellence in Kenya",
    description: "Transform your organization with Kenya's premier HR consulting firm. Expert recruitment, training, HR outsourcing, and advisory services that drive success.",
    url: '/',
    siteName: 'Eagle HR Consultants',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Eagle HR Consultants - Professional HR Services in Kenya',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Eagle HR Consultants - Leading HR Excellence in Kenya",
    description: "Transform your organization with Kenya's premier HR consulting firm. Expert recruitment, training, HR outsourcing, and advisory services that drive success.",
    images: ['/og-image.svg'],
    creator: '@eaglehr',
    site: '@eaglehr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google:
      process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
      'DUsQ5vrza5zxhMwhGNFVVkzCxPU-Pon8Ybj8fh28uoY',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/logo/logo_dark_ubxaCll.png', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/webp',
    'twitter:image:alt': 'Eagle HR Consultants - Professional HR Services in Kenya',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="font-sans antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
