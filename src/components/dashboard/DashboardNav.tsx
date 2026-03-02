'use client';

import { useState, useEffect } from 'react';
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
  Folder,
  FolderOpen,
  ChevronRight,
  Building2,
  Banknote,
  CalendarDays,
  Clock,
} from 'lucide-react';

interface DashboardNavProps {
  currentUserRole: UserRole | null;
}

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

type AccordionSection = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
};

const accordionSections: AccordionSection[] = [
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: Folder,
    items: [
      { href: '/dashboard/clients', label: 'Clients', icon: Handshake },
      { href: '/dashboard/jobs', label: 'Job openings', icon: Briefcase },
      { href: '/dashboard/applications', label: 'Applications', icon: FileCheck },
      { href: '/dashboard/candidates', label: 'Candidates', icon: Users },
      { href: '/dashboard/interviews', label: 'Interview Management', icon: CalendarCheck },
    ],
  },
  {
    id: 'outsourcing',
    label: 'Outsourcing',
    icon: Folder,
    items: [
      { href: '/dashboard/outsourcing/clients', label: 'Clients', icon: Building2 },
      { href: '/dashboard/outsourcing/employees', label: 'Employees', icon: Users },
      { href: '/dashboard/outsourcing/payroll', label: 'Payroll', icon: Banknote },
      { href: '/dashboard/outsourcing/leave', label: 'Leave Management', icon: CalendarDays },
      { href: '/dashboard/outsourcing/attendance', label: 'Attendance', icon: Clock },
    ],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  indent = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  indent?: boolean;
}) {
  const isActive =
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg transition-colors focus:outline-none focus-visible:ring-0 ${
        indent ? 'ml-4 pl-3 py-2.5' : 'px-4 py-3'
      } ${
        isActive
          ? 'bg-primary-50 text-primary-900 font-medium'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-900'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

const STORAGE_KEY = 'dashboard-nav-expanded';

function getStoredExpanded(): Set<string> {
  if (typeof window === 'undefined') return new Set(accordionSections.map((s) => s.id));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(accordionSections.map((s) => s.id));
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set(accordionSections.map((s) => s.id));
  }
}

function setStoredExpanded(expanded: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]));
  } catch {
    /* ignore */
  }
}

export default function DashboardNav({ currentUserRole }: DashboardNavProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    new Set(accordionSections.map((s) => s.id))
  );

  // Hydrate from localStorage and auto-expand section containing current route
  useEffect(() => {
    const stored = getStoredExpanded();
    const expandedSet = new Set(stored);
    for (const section of accordionSections) {
      const isActive = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + '/')
      );
      if (isActive) expandedSet.add(section.id);
    }
    setExpanded(expandedSet);
  }, [pathname]);

  const toggleSection = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setStoredExpanded(next);
      return next;
    });
  };

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      <NavLink href="/dashboard" label="Overview" icon={LayoutDashboard} pathname={pathname} />

      {accordionSections.map((section) => {
        const isExpanded = expanded.has(section.id);
        const FolderIcon = isExpanded ? FolderOpen : section.icon;

        return (
          <div key={section.id} className="pt-3">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center gap-2 px-4 py-2 rounded-lg text-left transition-colors text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
              aria-expanded={isExpanded}
              aria-controls={`nav-section-${section.id}`}
              id={`nav-trigger-${section.id}`}
            >
              <ChevronRight
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 text-neutral-400 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
              <FolderIcon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-xs font-semibold uppercase tracking-wider">
                {section.label}
              </span>
            </button>
            <div
              id={`nav-section-${section.id}`}
              role="region"
              aria-labelledby={`nav-trigger-${section.id}`}
              className={`overflow-hidden transition-all duration-200 ${
                isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} {...item} pathname={pathname} indent />
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className="pt-1">
        <NavLink href="/dashboard/insights" label="Insights" icon={BookOpen} pathname={pathname} />
      </div>

      {currentUserRole === 'admin' && (
        <NavLink href="/dashboard/staff" label="Staff" icon={UserCog} pathname={pathname} />
      )}

      <NavLink href="/dashboard/analytics" label="Analytics" icon={BarChart3} pathname={pathname} />
    </nav>
  );
}
