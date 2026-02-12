'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';
import { LogOut } from 'lucide-react';
import type { UserSummary } from '@/types/dashboard';

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          throw new Error('unauthorized');
        }
        if (!r.ok) throw new Error('Failed to load current user');
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setCurrentUser(data as UserSummary);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setCurrentUser(null);
        if (error instanceof Error && error.message === 'unauthorized') {
          router.replace('/dashboard/login?error=inactive');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = currentUser?.name || 'Staff User';
  const displayEmail = currentUser?.email || 'staff@eaglehr.co.ke';
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'SU';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/dashboard/login';
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 bg-white flex-shrink-0 flex flex-col border-r border-neutral-200">
        <div className="p-5 flex justify-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/images/logo/logo_dark_ubxaCll.png"
              alt="Eagle HR Consultants"
              width={160}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>
        <DashboardNav currentUserRole={currentUser?.role ?? null} />
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary-700">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary-900 truncate">{displayName}</p>
              <p className="text-xs text-neutral-500 truncate">{displayEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-neutral-600 hover:text-primary-900 hover:bg-neutral-100 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area: topbar + content — responsive container for 14"–32" */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar currentUser={currentUser} />
        <main className="flex-1 overflow-auto">
          <div className="w-full min-w-0 max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
