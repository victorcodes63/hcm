'use client';

import { usePublicBrand } from '@/components/BrandProvider';
import { normalizeLogoSrc } from '@/lib/brand-constants';

type BrandLogoProps = {
  className?: string;
  variant?: 'mark' | 'markSm' | 'markLg' | 'header' | 'sidebarExpanded' | 'sidebarCollapsed' | 'compact' | 'auth' | 'authPanel';
  priority?: boolean;
  alt?: string;
  /** Override URL — use when parent already has brand snapshot */
  src?: string;
};

/** Square platform mark sizes (width/height match class for stable SSR hydration). */
const variantClass: Record<NonNullable<BrandLogoProps['variant']>, string> = {
  mark: 'h-10 w-10 object-contain',
  markSm: 'h-9 w-9 object-contain',
  markLg: 'h-12 w-12 object-contain',
  header: 'h-9 w-9 object-contain',
  sidebarExpanded: 'h-9 w-9 object-contain',
  sidebarCollapsed: 'h-9 w-9 object-contain',
  compact: 'h-8 w-8 object-contain',
  auth: 'h-11 w-11 object-contain',
  authPanel: 'h-11 w-auto max-w-[11rem] object-contain object-left',
};

const variantSize: Record<NonNullable<BrandLogoProps['variant']>, number> = {
  mark: 40,
  markSm: 36,
  markLg: 48,
  header: 36,
  sidebarExpanded: 36,
  sidebarCollapsed: 36,
  compact: 32,
  auth: 44,
  authPanel: 44,
};

/**
 * Brand mark — native img (not next/image) to avoid hydration mismatches when
 * dev HMR serves stale client chunks. Logo URL comes from BrandProvider snapshot.
 */
export default function BrandLogo({
  className,
  variant = 'mark',
  alt,
  src,
}: BrandLogoProps) {
  const { appName, logoSrc: brandLogoSrc } = usePublicBrand();
  const size = variantSize[variant];
  const cls = className ?? variantClass[variant];
  const logoSrc = normalizeLogoSrc(src ?? brandLogoSrc);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      alt={alt ?? appName}
      width={size}
      height={size}
      className={cls}
      decoding="async"
    />
  );
}
