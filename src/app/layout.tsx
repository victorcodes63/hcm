import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { ToastViewport } from "@/components/ui/toast";
import { BrandProvider } from "@/components/BrandProvider";
import { brand, getPublicBrand, getSiteUrl } from "@/lib/brand";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl = getSiteUrl();
const defaultDescription = `${brand.orgName} — ${brand.tagline}`;
const keywords =
  "HRIS, HR software, payroll, recruitment, ATS, leave management, workforce, human resources";

export const metadata: Metadata = {
  title: {
    default: brand.appName,
    template: `%s | ${brand.appName}`,
  },
  description: defaultDescription,
  keywords,
  authors: [{ name: brand.orgName }],
  creator: brand.orgName,
  publisher: brand.orgName,
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
    title: brand.appName,
    description: defaultDescription,
    url: '/',
    siteName: brand.appName,
    images: [
      {
        url: brand.logoSrc.startsWith('/') ? brand.logoSrc : `/${brand.logoSrc}`,
        width: 1200,
        height: 630,
        alt: brand.orgName,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: brand.appName,
    description: defaultDescription,
    images: [brand.logoSrc.startsWith('/') ? brand.logoSrc : `/${brand.logoSrc}`],
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
    google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
  },
  icons: {
    icon: [
      {
        url: brand.logoSrc.startsWith('/') ? brand.logoSrc : `/${brand.logoSrc}`,
        sizes: 'any',
        type: brand.logoSrc.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
      },
    ],
    shortcut: brand.logoSrc.startsWith('/') ? brand.logoSrc : `/${brand.logoSrc}`,
    apple: brand.logoSrc.startsWith('/') ? brand.logoSrc : `/${brand.logoSrc}`,
  },
  other: {
    'twitter:image:alt': brand.orgName,
  },
};

const jsonLd = (baseUrl: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: brand.orgName,
      url: baseUrl,
      logo: { '@type': 'ImageObject', url: `${baseUrl}${brand.logoSrc.startsWith('/') ? brand.logoSrc : `/${brand.logoSrc}`}` },
      ...(brand.contactPhone
        ? {
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: brand.contactPhone,
              contactType: 'customer service',
              email: brand.contactEmail,
            },
          }
        : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: brand.appName,
      description: defaultDescription,
      publisher: { '@id': `${baseUrl}/#organization` },
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/careers?keyword={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(siteUrl)) }}
        />
        <BrandProvider value={getPublicBrand()}>{children}</BrandProvider>
        <ToastViewport />
        <CookieConsent />
      </body>
    </html>
  );
}
