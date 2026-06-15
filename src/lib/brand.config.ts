/**
 * Imara product identity — single source for platform naming and GTM positioning.
 * Override per-tenant copy via env (NEXT_PUBLIC_*) or Admin → Company Setup.
 */

export const IMARA_PRODUCT_NAME = 'Imara';
export const IMARA_PRODUCT_DESCRIPTOR = 'The Vertical BMS';

export const brandConfig = {
  productName: IMARA_PRODUCT_NAME,
  productDescriptor: IMARA_PRODUCT_DESCRIPTOR,
  companyLegal: 'Raven Tech Group',
  /** Primary beachhead per strategy roadmap (June 2026). */
  beachhead: 'sacco' as const,
  tagline:
    'The operating system for regulated East African organisations — payroll, people, and compliance built for how you actually work.',
  shortTagline: 'People, time, and payroll — M-Pesa-native, SASRA-ready.',
  /** Default theme when env / Company Setup do not set colors. */
  theme: {
    primary: '#0D9488',
    secondary: '#0F172A',
  },
  demo: {
    saccoOrgName: 'Nyati SACCO Society Ltd',
    saccoTagline:
      'Member-trusted payroll and workforce operations — compliant, M-Pesa-native, board-ready.',
  },
  supportEmail: 'hello@raventechgroup.com',
} as const;

export type BrandConfig = typeof brandConfig;
