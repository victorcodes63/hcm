import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserSearch,
  FileText,
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
  Package,
  ClipboardList,
  Smartphone,
  CalendarClock,
  FileQuestion,
  PieChart,
  Coins,
  Megaphone,
  GraduationCap,
  Network,
  FolderOpen,
} from 'lucide-react';
import type { UserRole } from '@/types/dashboard';
import { isDashboardNavItemVisible, isNavSectionVisible, type EnabledModulesMap } from '@/lib/nav-modules';

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type DashboardNavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: DashboardNavItem[];
};

export type DashboardNavBuildOptions = {
  currentUserRole: UserRole | null;
  hasAccountsAccess: boolean;
  canViewSystemAnalytics: boolean;
  enabledModules?: EnabledModulesMap;
};

export const OVERVIEW_NAV_ITEM: DashboardNavItem = {
  href: '/dashboard',
  label: 'Overview',
  icon: LayoutDashboard,
};

const primarySections: DashboardNavSection[] = [
  {
    id: 'people-hr',
    label: 'People',
    icon: Users,
    items: [
      { href: '/dashboard/employees', label: 'Employees', icon: Users },
      { href: '/dashboard/departments', label: 'Departments', icon: Building2 },
      { href: '/dashboard/onboarding', label: 'Onboarding', icon: ListTodo },
      { href: '/dashboard/people/contracts', label: 'Contracts', icon: FileSignature },
      { href: '/dashboard/credentials', label: 'Credentials', icon: BadgeCheck },
      { href: '/dashboard/performance', label: 'Performance', icon: BarChart2 },
      { href: '/dashboard/disciplinary', label: 'Disciplinary', icon: Shield },
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

const hseComplianceSection: DashboardNavSection = {
  id: 'hse-compliance',
  label: 'HSE & Compliance',
  icon: ShieldAlert,
  items: [{ href: '/dashboard/hse', label: 'Incidents', icon: ShieldAlert }],
};

const payrollSection: DashboardNavSection = {
  id: 'payroll',
  label: 'Payroll',
  icon: Banknote,
  items: [
    { href: '/dashboard/payroll', label: 'Payroll runs', icon: Banknote },
    { href: '/dashboard/payroll/payslips', label: 'Payslips', icon: Receipt },
    { href: '/dashboard/payroll/statutory', label: 'Statutory', icon: Landmark },
  ],
};

const assetsSection: DashboardNavSection = {
  id: 'assets',
  label: 'Asset Manager',
  icon: Package,
  items: [
    { href: '/dashboard/assets', label: 'All assets', icon: Package },
    { href: '/dashboard/assets?assigned=1', label: 'Assignments', icon: ClipboardList },
  ],
};

const essSelfServiceSection: DashboardNavSection = {
  id: 'employee-self-service',
  label: 'Employee self-service',
  icon: Smartphone,
  items: [
    { href: '/dashboard/ess/portal-accounts', label: 'Portal accounts', icon: UserCog },
    { href: '/dashboard/ess/shifts', label: 'ESS & shifts', icon: CalendarClock },
    { href: '/dashboard/ess/document-requests', label: 'Document requests', icon: FileQuestion },
  ],
};

const adminSection: DashboardNavSection = {
  id: 'admin',
  label: 'Admin',
  icon: Shield,
  items: [
    { href: '/dashboard/admin/company-setup', label: 'Company setup', icon: Building2 },
    { href: '/dashboard/users/staff', label: 'System users', icon: Shield },
    { href: '/dashboard/admin/roles-permissions', label: 'Roles & permissions', icon: KeyRound },
    { href: '/dashboard/admin/holidays', label: 'Public holidays', icon: CalendarDays },
    { href: '/dashboard/admin/audit-log', label: 'Audit log', icon: History },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
};

const financeSection: DashboardNavSection = {
  id: 'finance',
  label: 'Finance',
  icon: Landmark,
  items: [
    { href: '/dashboard/accounts', label: 'Overview', icon: LayoutGrid },
    { href: '/dashboard/accounts/clients', label: 'Clients', icon: Building2 },
    { href: '/dashboard/accounts/invoices', label: 'Invoices', icon: FileText },
    { href: '/dashboard/accounts/receipts', label: 'Receipts & allocations', icon: Receipt },
    { href: '/dashboard/accounts/payment-accounts', label: 'Payment accounts', icon: Banknote },
    { href: '/dashboard/accounts/vendors', label: 'Vendors', icon: Wallet },
    { href: '/dashboard/accounts/vendor-bills', label: 'Vendor bills', icon: FileStack },
    { href: '/dashboard/accounts/expenses', label: 'Expense claims', icon: Receipt },
    { href: '/dashboard/accounts/statements', label: 'Statements', icon: Scale },
    { href: '/dashboard/accounts/budgets', label: 'Budgets', icon: PieChart },
    { href: '/dashboard/accounts/petty-cash', label: 'Petty cash', icon: Coins },
    { href: '/dashboard/accounts/financial-reports', label: 'Financial reports', icon: BarChart3 },
  ],
};

const communicationsSection: DashboardNavSection = {
  id: 'communications',
  label: 'Communications',
  icon: Megaphone,
  items: [
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/dashboard/company-documents', label: 'Company documents', icon: FolderOpen },
  ],
};

const developmentSection: DashboardNavSection = {
  id: 'development',
  label: 'Development',
  icon: GraduationCap,
  items: [
    { href: '/dashboard/training', label: 'Training programs', icon: GraduationCap },
    { href: '/dashboard/org-chart', label: 'Org chart', icon: Network },
  ],
};

function buildReportsSection(canViewSystemAnalytics: boolean): DashboardNavSection {
  const items: DashboardNavItem[] = [
    { href: '/dashboard/reports', label: 'All reports', icon: BarChart3 },
  ];
  if (canViewSystemAnalytics) {
    items.push({ href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 });
  }
  return {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    items,
  };
}

function filterSections(
  sections: DashboardNavSection[],
  enabled: EnabledModulesMap,
  options: DashboardNavBuildOptions,
): DashboardNavSection[] {
  return sections
    .filter((section) => {
      if (section.id === 'finance' && !options.hasAccountsAccess) return false;
      if (section.id === 'admin') {
        return (
          options.currentUserRole === 'admin' ||
          options.hasAccountsAccess ||
          options.canViewSystemAnalytics
        );
      }
      return isNavSectionVisible(section.id, enabled);
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.href === '/dashboard/analytics') return options.canViewSystemAnalytics;
        return isDashboardNavItemVisible(item.href, section.id, enabled);
      }),
    }))
    .filter((section) => section.items.length > 0);
}

export function buildDashboardNavSections(options: DashboardNavBuildOptions): DashboardNavSection[] {
  const enabledModules = options.enabledModules ?? ALL_MODULES_ENABLED;
  const resolvedOptions = { ...options, enabledModules };
  const chunks: DashboardNavSection[] = [
    ...primarySections,
    payrollSection,
    hseComplianceSection,
    assetsSection,
    developmentSection,
    communicationsSection,
    essSelfServiceSection,
    buildReportsSection(options.canViewSystemAnalytics),
  ];
  if (options.hasAccountsAccess) chunks.push(financeSection);
  if (
    options.currentUserRole === 'admin' ||
    options.hasAccountsAccess ||
    options.canViewSystemAnalytics
  ) {
    chunks.push(adminSection);
  }
  return filterSections(chunks, enabledModules, resolvedOptions);
}

export function flattenDashboardNavItems(
  sections: DashboardNavSection[],
  includeOverview = true,
): DashboardNavItem[] {
  const items: DashboardNavItem[] = includeOverview ? [OVERVIEW_NAV_ITEM] : [];
  for (const section of sections) {
    for (const item of section.items) {
      items.push(item);
    }
  }
  return items;
}

export function resolveDashboardNavItems(
  hrefs: string[],
  sections: DashboardNavSection[],
  includeOverview = true,
): DashboardNavItem[] {
  const catalog = new Map(
    flattenDashboardNavItems(sections, includeOverview).map((item) => [item.href, item]),
  );
  return hrefs.map((href) => catalog.get(href)).filter((item): item is DashboardNavItem => Boolean(item));
}

export const ALL_MODULES_ENABLED = {
  core: true,
  leave: true,
  time: true,
  payroll: true,
  ats: true,
  performance: true,
  hse: true,
  accounts: true,
  disciplinary: true,
  reports: true,
  assets: true,
  ess: true,
  communications: true,
  training: true,
  documents: true,
} satisfies EnabledModulesMap;

export const DASHBOARD_NAV_EXPANDABLE_SECTION_IDS = [
  ...primarySections.map((s) => s.id),
  payrollSection.id,
  hseComplianceSection.id,
  assetsSection.id,
  developmentSection.id,
  communicationsSection.id,
  essSelfServiceSection.id,
  'reports',
  financeSection.id,
  adminSection.id,
];

/** Navigation groups with labeled headers for sidebar visual hierarchy. */
export const DASHBOARD_NAV_GROUPS = [
  { label: 'Core HR', startSectionId: 'people-hr' },
  { label: 'Operations', startSectionId: 'time-attendance' },
  { label: 'Resources', startSectionId: 'assets' },
  { label: 'Insights', startSectionId: 'employee-self-service' },
  { label: 'Administration', startSectionId: 'finance' },
] as const;

/** @deprecated Use DASHBOARD_NAV_GROUPS */
export const DASHBOARD_NAV_GROUP_STARTS = DASHBOARD_NAV_GROUPS.map((g) => g.startSectionId);
