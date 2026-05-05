/**
 * Central branding for the HRIS demo. Override via NEXT_PUBLIC_* env vars per deployment.
 */

import { resolve } from 'path';

function trimEnv(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

const DEFAULT_APP = 'HRIS Demo';
const DEFAULT_ORG = 'Stabex International';
const DEFAULT_TAGLINE =
  'Human resources, payroll, recruitment, and workforce operations in one place.';

/** Public path; must match the first paint in `BrandLogo` to avoid React hydration mismatches when env differs between server and client bundles. */
export const DEFAULT_BRAND_LOGO_SRC = '/brand/stabex-logo.png';

export const brand = {
  appName: trimEnv('NEXT_PUBLIC_APP_NAME') ?? DEFAULT_APP,
  orgName: trimEnv('NEXT_PUBLIC_ORG_NAME') ?? DEFAULT_ORG,
  tagline: trimEnv('NEXT_PUBLIC_APP_TAGLINE') ?? DEFAULT_TAGLINE,
  contactEmail: trimEnv('NEXT_PUBLIC_CONTACT_EMAIL') ?? 'hello@example.com',
  contactPhone: trimEnv('NEXT_PUBLIC_CONTACT_PHONE') ?? '',
  contactAddress: trimEnv('NEXT_PUBLIC_CONTACT_ADDRESS') ?? '',
  /** Public path for nav / metadata (SVG or raster). */
  logoSrc: trimEnv('NEXT_PUBLIC_BRAND_LOGO') ?? DEFAULT_BRAND_LOGO_SRC,
  /** PNG for PDFs and email CID embedding (same file as UI if using raster logo). */
  logoPngPath: trimEnv('NEXT_PUBLIC_BRAND_LOGO_PNG') ?? DEFAULT_BRAND_LOGO_SRC,
  /** Short line for payslip / letter headers when logo file is missing. */
  wordmark: trimEnv('NEXT_PUBLIC_BRAND_WORDMARK') ?? 'HRIS DEMO',
} as const;

export const mailFromName =
  trimEnv('SMTP_FROM_NAME') ?? `${brand.appName} HR`;

export const accountsMailFromName =
  trimEnv('ACCOUNTS_SMTP_FROM_NAME') ?? `${brand.appName} HR (Accounts)`;

export function getSiteUrl(): string {
  return (
    trimEnv('NEXT_PUBLIC_SITE_URL')?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}`.replace(/\/$/, '') : '') ||
    'http://localhost:3000'
  );
}

export function getPublicLogoUrl(): string {
  return `${getSiteUrl()}${brand.logoSrc.startsWith('/') ? brand.logoSrc : `/${brand.logoSrc}`}`;
}

export function getLogoFileAbsolutePath(): string {
  const rel = brand.logoPngPath.replace(/^\//, '');
  return resolve(process.cwd(), 'public', rel);
}

export function getMetadataTitle(suffix?: string): string {
  if (suffix) return `${suffix} | ${brand.appName}`;
  return brand.appName;
}

export const emailSubjectTag = `[${brand.appName}]`;

/** Serializable brand for client components — use `getPublicBrand()` in the root layout (server) and `usePublicBrand()` in the browser to avoid hydration mismatches when public env is only available in one bundle. */
export type PublicBrand = {
  orgName: string;
  appName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  logoSrc: string;
  logoPngPath: string;
  wordmark: string;
};

export function getPublicBrand(): PublicBrand {
  return {
    orgName: brand.orgName,
    appName: brand.appName,
    tagline: brand.tagline,
    contactEmail: brand.contactEmail,
    contactPhone: brand.contactPhone,
    contactAddress: brand.contactAddress,
    logoSrc: brand.logoSrc,
    logoPngPath: brand.logoPngPath,
    wordmark: brand.wordmark,
  };
}

/** Plain-text style footer for HTML emails (address optional). */
export function getEmailFooterPlain(): string {
  const bits: string[] = [mailFromName];
  if (brand.contactAddress) bits.push(brand.contactAddress);
  if (brand.contactPhone) bits.push(brand.contactPhone);
  bits.push(brand.contactEmail);
  return bits.join(' · ');
}
