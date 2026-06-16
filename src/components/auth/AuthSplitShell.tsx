'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { usePublicBrand } from '@/components/BrandProvider';

type AuthSplitShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Decorative brand panel — ribbon animates only after hydration to avoid SSR/client drift. */
function AuthBrandBackground() {
  const hydrated = useHydrated();

  return (
    <div className="auth-split-shader pointer-events-none absolute inset-0" aria-hidden>
      {hydrated ? (
        <div className="auth-split-ribbon">
          <div className="auth-split-ribbon-sweep auth-split-ribbon-sweep--primary" />
          <div className="auth-split-ribbon-sweep auth-split-ribbon-sweep--secondary" />
          <div className="auth-split-ribbon-sweep auth-split-ribbon-sweep--accent" />
        </div>
      ) : null}
      <div className="auth-split-brand-overlay" />
      <div className="auth-split-vignette" />
    </div>
  );
}

export function AuthSplitShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthSplitShellProps) {
  const { orgName, privacyPolicyUrl, termsUrl } = usePublicBrand();
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col font-pub lg:flex-row">
      <div className="auth-split-brand relative flex flex-col justify-between overflow-hidden px-7 py-8 sm:px-10 lg:min-h-screen lg:w-[min(100%,28rem)] lg:flex-shrink-0 lg:px-12 lg:py-11 xl:w-[32rem]">
        <AuthBrandBackground />

        <div className="relative z-10">
          <Link href="/careers" className="inline-flex">
            <BrandLogo variant="authPanel" priority />
          </Link>
        </div>

        <div className="relative z-10 mt-12 lg:mt-0">
          <p className="auth-split-eyebrow text-[0.6875rem] font-semibold uppercase tracking-[0.1em]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-[22rem] text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] lg:text-[2rem]">
            {title}
          </h1>
          <p className="auth-split-subtitle mt-4 max-w-[22rem] text-pretty text-[0.875rem] leading-[1.65]">
            {subtitle}
          </p>
        </div>

        <footer className="auth-split-footer relative z-10 mt-12 hidden lg:mt-0 lg:block">
          <p className="max-w-[20rem] text-[0.75rem] leading-relaxed text-white/45" suppressHydrationWarning>
            © {year}{' '}
            <span className="text-white/70">{orgName}</span>
          </p>
          <nav className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.75rem]">
            <Link href="/careers" className="transition-colors">
              Careers
            </Link>
            <Link href={privacyPolicyUrl || '/privacy'} className="transition-colors">
              Privacy
            </Link>
            <Link href={termsUrl || '/terms'} className="transition-colors">
              Terms
            </Link>
          </nav>
        </footer>
      </div>

      <div className="auth-split-form relative flex flex-1 flex-col">
        <div className="auth-split-form-bg pointer-events-none absolute inset-0" aria-hidden>
          <div className="auth-split-form-mesh" />
          <div className="auth-split-form-glow" />
        </div>
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10 lg:px-16">
            <div className="w-full max-w-[380px]">{children}</div>
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}

export function LoginCard({
  children,
  footer,
  className = '',
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`auth-login-card w-full overflow-hidden rounded-xl bg-white ${className}`.trim()}>
      <div className="px-7 pb-7 pt-8">{children}</div>
      {footer ? <div className="border-t border-[#e3e8ee]/90 bg-white/50 px-7 py-3.5">{footer}</div> : null}
    </div>
  );
}
