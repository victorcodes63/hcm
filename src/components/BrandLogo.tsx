'use client';

import Image from 'next/image';
import { usePublicBrand } from '@/components/BrandProvider';
import { useResolvedBrandLogoSrc } from '@/hooks/useResolvedBrandLogoSrc';

type BrandLogoProps = {
  className?: string;
  /** Navbar / marketing header */
  variant?: 'header' | 'sidebarExpanded' | 'sidebarCollapsed' | 'compact' | 'auth';
  priority?: boolean;
  /** Override alt text (e.g. empty string for decorative collapsed sidebar icon). */
  alt?: string;
};

const variantClass: Record<NonNullable<BrandLogoProps['variant']>, string> = {
  header: 'h-10 w-auto',
  sidebarExpanded: 'h-10 w-auto max-w-[11rem] object-contain mx-auto',
  sidebarCollapsed: 'h-10 w-10 object-contain mx-auto',
  compact: 'h-8 w-auto',
  auth: 'h-16 w-auto object-contain',
};

const variantSize: Record<NonNullable<BrandLogoProps['variant']>, { w: number; h: number }> = {
  header: { w: 120, h: 40 },
  sidebarExpanded: { w: 150, h: 45 },
  sidebarCollapsed: { w: 40, h: 40 },
  compact: { w: 120, h: 40 },
  auth: { w: 220, h: 64 },
};

/**
 * Single source for product logo — keep public header and dashboard sidebar in sync.
 */
export default function BrandLogo({ className, variant = 'header', priority, alt }: BrandLogoProps) {
  const { appName } = usePublicBrand();
  const logoSrc = useResolvedBrandLogoSrc();
  const dims = variantSize[variant];
  const cls = className ?? variantClass[variant];
  return (
    <Image
      src={logoSrc}
      alt={alt ?? appName}
      width={dims.w}
      height={dims.h}
      className={cls}
      priority={priority}
    />
  );
}
