'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types/dashboard';
import {
  LayoutDashboard,
  Briefcase,
  Handshake,
  Users,
  FileCheck,
  CalendarCheck,
  BarChart3,
  UserCog,
  BookOpen,
} from 'lucide-react';

interface DashboardNavProps {
  currentUserRole: UserRole | null;
}

export default function DashboardNav({ currentUserRole }: DashboardNavProps) {
  const pathname = usePathname();
  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/jobs', label: 'Job openings', icon: Briefcase },
    { href: '/dashboard/clients', label: 'Clients', icon: Handshake },
    { href: '/dashboard/candidates', label: 'Candidates', icon: Users },
    { href: '/dashboard/applications', label: 'Applications', icon: FileCheck },
    { href: '/dashboard/interviews', label: 'Interview Management', icon: CalendarCheck },
    { href: '/dashboard/insights', label: 'Insights', icon: BookOpen },
    ...(currentUserRole === 'admin'
      ? [{ href: '/dashboard/staff', label: 'Staff', icon: UserCog }]
      : []),
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-900 font-medium'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
