'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { usePublicBrand } from '@/components/BrandProvider';

const aboutLinks = [
  { name: 'Careers', href: '/careers', external: false },
  { name: 'Privacy', href: '/privacy', external: false },
  { name: 'Terms', href: '/terms', external: false },
];

const navLinks = [
  { name: 'Careers', href: '/careers' },
  { name: 'Staff login', href: '/dashboard/login' },
];

export default function Navbar() {
  const { orgName } = usePublicBrand();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur transition-shadow ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2" aria-label={`${orgName} home`}>
          <BrandLogo variant="header" priority />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-800 hover:text-secondary-600"
            >
              Explore
              <ChevronDown className={`h-4 w-4 transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
            </button>
            {aboutOpen && (
              <div className="absolute left-0 top-full mt-2 w-44 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
                {aboutLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-secondary-600"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-neutral-800 hover:text-secondary-600"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex rounded-md p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 lg:hidden">
          <div className="space-y-1">
            {aboutLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 hover:text-secondary-600"
              >
                {item.name}
              </Link>
            ))}
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 hover:text-secondary-600"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
