'use client';

import { useContext, useEffect, useState } from 'react';
import { brand, DEFAULT_BRAND_LOGO_SRC } from '@/lib/brand';
import { BrandContext } from '@/components/BrandProvider';

/**
 * Prefer logo URL from `BrandProvider` (server snapshot) so SSR matches hydration.
 * Falls back to module `brand.logoSrc` when no provider (tests).
 */
export function useResolvedBrandLogoSrc(): string {
  const ctx = useContext(BrandContext);
  const [src, setSrc] = useState(() => ctx?.logoSrc ?? DEFAULT_BRAND_LOGO_SRC);
  useEffect(() => {
    setSrc(ctx?.logoSrc ?? brand.logoSrc);
  }, [ctx?.logoSrc]);
  return src;
}
