import Link from 'next/link';
import { getResolvedPublicBrand } from '@/lib/get-resolved-public-brand';
import { normalizeLogoSrc } from '@/lib/brand-constants';

/**
 * Server-rendered sidebar brand — keeps logo markup identical on SSR and hydration
 * (avoids stale client chunks swapping flex layout / org name).
 */
export default async function DashboardSidebarBrand() {
  const brand = await getResolvedPublicBrand();
  const logoSrc = normalizeLogoSrc(brand.logoSrc);

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 rounded-lg px-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-500/30"
      title={brand.appName}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt={brand.appName}
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
        decoding="async"
      />
      <div className="min-w-0">
        <span className="block truncate text-[13px] font-semibold leading-tight text-ink">{brand.orgName}</span>
        <span className="block truncate text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          {brand.appName}
        </span>
      </div>
    </Link>
  );
}
