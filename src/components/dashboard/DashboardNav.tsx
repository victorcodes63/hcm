'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types/dashboard';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserSearch,
  FileText,
  FolderOpen,
  ChevronRight,
  Building2,
  Banknote,
  CalendarDays,
  Clock4,
  CalendarOff,
  FileSignature,
  BadgeCheck,
  ListTodo,
  Fingerprint,
  Receipt,
  Landmark,
  BarChart3,
  BarChart2,
  Shield,
  ShieldAlert,
  UserCog,
  KeyRound,
  History,
  Settings,
  LayoutGrid,
  Wallet,
  FileStack,
  Scale,
} from 'lucide-react';

const NAV_STORAGE_KEY = 'dashboard-nav-expanded';
const SIDEBAR_COLLAPSED_KEY = 'dashboard-sidebar-collapsed';

interface DashboardNavProps {
  currentUserRole: UserRole | null;
  collapsed: boolean;
  /** When true, show Accounts section (admin or AccountsStaffAccess in dashboard API). */
  hasAccountsAccess?: boolean;
  /** Executive analytics (/dashboard/analytics) — admin or Director staff type. */
  canViewSystemAnalytics?: boolean;
}

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

type AccordionSection = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
};

const primarySections: AccordionSection[] = [
  {
    id: 'people-hr',
    label: 'People & HR',
    icon: Users,
    items: [
      { href: '/dashboard/employees', label: 'Employees', icon: Users },
      { href: '/dashboard/departments', label: 'Departments', icon: Building2 },
      { href: '/dashboard/people/contracts', label: 'Contracts', icon: FileSignature },
      { href: '/dashboard/credentials', label: 'Credentials', icon: BadgeCheck },
      { href: '/dashboard/performance', label: 'Performance', icon: BarChart2 },
      { href: '/dashboard/disciplinary', label: 'Disciplinary', icon: Shield },
      { href: '/dashboard/onboarding', label: 'Onboarding', icon: ListTodo },
    ],
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: Briefcase,
    items: [
      { href: '/dashboard/jobs', label: 'Job openings', icon: Briefcase },
      { href: '/dashboard/applications', label: 'Applications', icon: FileText },
      { href: '/dashboard/candidates', label: 'Talent pool', icon: UserSearch },
      { href: '/dashboard/interviews', label: 'Interviews', icon: CalendarDays },
      { href: '/dashboard/interviews/schedule', label: 'Interview calendar', icon: Clock4 },
      { href: '/dashboard/recruitment/profile', label: 'Careers profile', icon: Building2 },
    ],
  },
  {
    id: 'time-attendance',
    label: 'Time & Attendance',
    icon: CalendarDays,
    items: [
      { href: '/dashboard/rota', label: 'Rota & scheduling', icon: CalendarDays },
      { href: '/dashboard/attendance', label: 'Attendance', icon: Clock4 },
      { href: '/dashboard/leave', label: 'Leave', icon: CalendarOff },
      { href: '/dashboard/biometric-devices', label: 'Biometric devices', icon: Fingerprint },
    ],
  },
];

const hseComplianceSection: AccordionSection = {
  id: 'hse-compliance',
  label: 'HSE & Compliance',
  icon: ShieldAlert,
  items: [{ href: '/dashboard/hse', label: 'Incidents', icon: ShieldAlert }],
};

const payrollSection: AccordionSection = {
  id: 'payroll',
  label: 'Payroll',
  icon: Banknote,
  items: [
    { href: '/dashboard/payroll', label: 'Payroll runs', icon: Banknote },
    { href: '/dashboard/payroll/payslips', label: 'Payslips', icon: Receipt },
    { href: '/dashboard/payroll/statutory', label: 'Statutory', icon: Landmark },
  ],
};

const adminSection: AccordionSection = {
  id: 'admin',
  label: 'Admin',
  icon: Shield,
  items: [
    { href: '/dashboard/users/staff', label: 'System users', icon: Shield },
    { href: '/dashboard/admin/roles-permissions', label: 'Roles & permissions', icon: KeyRound },
    { href: '/dashboard/admin/holidays', label: 'Public holidays', icon: CalendarDays },
    { href: '/dashboard/admin/audit-log', label: 'Audit log', icon: History },
    { href: '/dashboard/admin/ess-portal-users', label: 'ESS portal users', icon: UserCog },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
};

const reportsSection: AccordionSection = {
  id: 'reports',
  label: 'Reports',
  icon: BarChart3,
  items: [
    { href: '/dashboard/reports', label: 'All reports', icon: BarChart3 },
  ],
};

/** Billing / AR-AP — same gate as Accounts APIs (`hasAccountsAccess`: admin always, or AccountsStaffAccess). */
const financeSection: AccordionSection = {
  id: 'finance',
  label: 'Finance',
  icon: Landmark,
  items: [
    { href: '/dashboard/accounts', label: 'Accounts overview', icon: LayoutGrid },
    { href: '/dashboard/accounts/clients', label: 'Billing clients', icon: Building2 },
    { href: '/dashboard/accounts/invoices', label: 'Invoices', icon: FileText },
    { href: '/dashboard/accounts/receipts', label: 'Receipts', icon: Receipt },
    { href: '/dashboard/accounts/vendors', label: 'Vendors', icon: Wallet },
    { href: '/dashboard/accounts/vendor-bills', label: 'Vendor bills', icon: FileStack },
    { href: '/dashboard/accounts/statements', label: 'Statements', icon: Scale },
    { href: '/dashboard/accounts/payroll', label: 'Payroll (accounts)', icon: Banknote },
  ],
};

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
      title={label}
      className={`relative flex h-9 items-center gap-3 rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
        indent ? 'ml-2 pl-3 pr-2' : 'px-3'
      } ${
        isActive
          ? 'bg-blue-50 text-blue-900 font-medium border border-blue-200'
          : 'text-neutral-700 hover:bg-neutral-50 hover:text-ink border border-transparent'
      }`}
    >
      {isActive ? (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-600" />
      ) : null}
      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavLinkIcon({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
}) {
  const isActive =
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center w-9 h-9 mx-auto rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
        isActive
          ? 'bg-blue-50 text-blue-900'
          : 'text-neutral-500 hover:bg-neutral-50 hover:text-ink'
      }`}
    >
      <Icon className="w-5 h-5" />
    </Link>
  );
}

function getStoredExpanded(fallbackSectionIds: string[]): Set<string> {
  if (typeof window === 'undefined') return new Set(fallbackSectionIds);
  try {
    const raw = localStorage.getItem(NAV_STORAGE_KEY);
    if (!raw) return new Set(fallbackSectionIds);
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set(fallbackSectionIds);
  }
}

function setStoredExpanded(expanded: Set<string>) {
  try {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify([...expanded]));
  } catch {
    /* ignore */
  }
}

export function readSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export default function DashboardNav({
  currentUserRole,
  collapsed,
  hasAccountsAccess = false,
  canViewSystemAnalytics = false,
}: DashboardNavProps) {
  const pathname = usePathname();
  const sections = useMemo<AccordionSection[]>(() => {
    const chunks: AccordionSection[] = [...primarySections, hseComplianceSection, payrollSection, reportsSection];
    if (hasAccountsAccess) chunks.push(financeSection);
    if (currentUserRole === 'admin' || hasAccountsAccess || canViewSystemAnalytics) chunks.push(adminSection);
    return chunks;
  }, [canViewSystemAnalytics, currentUserRole, hasAccountsAccess]);

  const [expanded, setExpanded] = useState<Set<string>>(
    () =>
      new Set([
        ...primarySections.map((s) => s.id),
        hseComplianceSection.id,
        payrollSection.id,
        reportsSection.id,
        financeSection.id,
        adminSection.id,
      ])
  );

  useEffect(() => {
    const stored = getStoredExpanded(sections.map((s) => s.id));
    const expandedSet = new Set(stored);
    for (const section of sections) {
      const isActive = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + '/')
      );
      if (isActive) expandedSet.add(section.id);
    }
    setExpanded(expandedSet);
  }, [pathname, sections]);

  const toggleSection = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setStoredExpanded(next);
      return next;
    });
  };

  if (collapsed) {
    const flatItems: NavItem[] = [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      ...sections.flatMap((s) => s.items),
    ];
    return (
      <nav className="flex-1 py-2 px-1 overflow-y-auto overflow-x-hidden flex flex-col items-center gap-1">
        {flatItems.map((item) => (
          <NavLinkIcon key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
      <p className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-[0.06em] text-neutral-400">Menu</p>
      <NavLink href="/dashboard" label="Overview" icon={LayoutDashboard} pathname={pathname} />

      {sections.map((section) => {
        const isExpanded = expanded.has(section.id);
        const FolderIcon = isExpanded ? FolderOpen : section.icon;
        return (
          <div key={section.id} className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left transition-colors text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
              aria-expanded={isExpanded}
              aria-controls={`nav-section-${section.id}`}
              id={`nav-trigger-${section.id}`}
            >
              <ChevronRight
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 text-neutral-400 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
              <FolderIcon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1 text-xs font-semibold uppercase tracking-[0.06em]">{section.label}</span>
            </button>
            <div
              id={`nav-section-${section.id}`}
              role="region"
              aria-labelledby={`nav-trigger-${section.id}`}
              className={`overflow-hidden transition-all duration-200 ${
                isExpanded ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {/* Right padding so active state (border) is not clipped by overflow-hidden */}
              <div className="mt-1 space-y-1 border-l border-neutral-200 ml-4 pl-2 pr-2 pb-1">
                {section.items.map((item) => (
                  <NavLink key={item.href} {...item} pathname={pathname} indent />
                ))}
              </div>
            </div>
          </div>
        );
      })}

    </nav>
  );
}
