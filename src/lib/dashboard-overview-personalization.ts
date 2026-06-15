import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Inbox,
  Landmark,
  Plus,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import type { UserSummary } from '@/types/dashboard';
import { STAFF_USER_TYPE_LABELS } from '@/lib/staff-permissions';
import type { ModuleKey } from '@/lib/modules';

export type OverviewPersona =
  | 'admin'
  | 'director'
  | 'finance'
  | 'business_manager'
  | 'operations'
  | 'viewer';

export type OverviewShortcut = {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
};

export type OverviewPrimaryAction = {
  href: string;
  label: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary';
};

export type OverviewAttentionItem = {
  id: string;
  label: string;
  detail: string;
  href: string;
  tone: 'amber' | 'rose' | 'sky' | 'neutral';
};

export function resolveOverviewPersona(user: UserSummary | null): OverviewPersona {
  if (!user) return 'operations';
  if (user.role === 'admin') return 'admin';
  if (user.role === 'viewer') return 'viewer';
  if (user.staffUserType === 'director') return 'director';
  if (user.staffUserType === 'finance' || user.hasAccountsAccess) return 'finance';
  if (user.staffUserType === 'business_manager') return 'business_manager';
  return 'operations';
}

export function getOverviewGreeting(name: string): string {
  const first = name.trim().split(/\s+/)[0] || 'there';
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export function getOverviewRoleLabel(user: UserSummary | null): string {
  if (!user) return 'Staff';
  if (user.role === 'admin') return 'System Administrator';
  if (user.role === 'viewer') return 'Viewer';
  return STAFF_USER_TYPE_LABELS[user.staffUserType] ?? 'Staff';
}

export function getOverviewSubtitle(persona: OverviewPersona): string {
  switch (persona) {
    case 'admin':
      return 'People, time, payroll, and compliance — one operating system for your organisation.';
    case 'director':
      return 'Headcount, payroll, leave, and board-ready compliance signals at a glance.';
    case 'finance':
      return 'Statutory payroll, approvals, and disbursement shortcuts.';
    case 'business_manager':
      return 'Attendance, leave approvals, and people workflows for your team.';
    case 'viewer':
      return 'Read-only snapshot. Contact an administrator to request access changes.';
    default:
      return 'People, time, leave, and compliance tasks for today.';
  }
}

export function getOverviewPrimaryAction(
  user: UserSummary | null,
  persona: OverviewPersona,
  pendingLeave: number,
): OverviewPrimaryAction {
  if (persona === 'business_manager' && pendingLeave > 0) {
    return { href: '/dashboard/leave', label: 'Review leave queue', icon: Inbox, variant: 'primary' };
  }
  if (persona === 'director' && user?.canViewSystemAnalytics) {
    return { href: '/dashboard/analytics', label: 'Executive analytics', icon: BarChart3, variant: 'primary' };
  }
  if (persona === 'finance') {
    if (user?.hasAccountsAccess) {
      return { href: '/dashboard/accounts', label: 'Finance overview', icon: Landmark, variant: 'primary' };
    }
    return { href: '/dashboard/payroll', label: 'Open payroll', icon: Wallet, variant: 'primary' };
  }
  if (persona === 'viewer') {
    return { href: '/dashboard/employees', label: 'Browse employees', icon: Users, variant: 'secondary' };
  }
  return { href: '/dashboard/employees/new', label: 'Add employee', icon: Plus, variant: 'primary' };
}

export function getOverviewSecondaryAction(
  user: UserSummary | null,
  persona: OverviewPersona,
): OverviewPrimaryAction | null {
  if (persona === 'admin' && user?.canViewSystemAnalytics) {
    return { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, variant: 'secondary' };
  }
  if (persona === 'finance' && user?.hasAccountsAccess) {
    return { href: '/dashboard/accounts', label: 'Accounts', icon: Landmark, variant: 'secondary' };
  }
  if (persona === 'business_manager') {
    return { href: '/dashboard/onboarding', label: 'Onboarding', icon: UserPlus, variant: 'secondary' };
  }
  return { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, variant: 'secondary' };
}

export function buildDefaultShortcuts(
  user: UserSummary | null,
  persona: OverviewPersona,
  modules: Partial<Record<ModuleKey, boolean>>,
): OverviewShortcut[] {
  const on = (key: ModuleKey) => modules[key] !== false;
  const shortcuts: OverviewShortcut[] = [];

  if (on('payroll') && persona !== 'viewer') {
    shortcuts.push({
      href: '/dashboard/payroll',
      label: 'Payroll',
      desc: 'Runs & payslips',
      icon: Wallet,
    });
  }
  if (on('leave') && (user?.canApproveStaffLeave || persona === 'admin' || persona === 'business_manager')) {
    shortcuts.push({
      href: '/dashboard/leave',
      label: 'Leave queue',
      desc: 'Approve or decline',
      icon: CalendarDays,
    });
  }
  if (on('time')) {
    shortcuts.push({
      href: '/dashboard/attendance',
      label: 'Attendance',
      desc: 'Clock data & exceptions',
      icon: ClipboardList,
    });
  }
  if (on('core')) {
    shortcuts.push({
      href: '/dashboard/employees',
      label: 'Employees',
      desc: 'Directory & profiles',
      icon: Users,
    });
  }
  if (user?.hasAccountsAccess && on('accounts')) {
    shortcuts.push({
      href: '/dashboard/accounts',
      label: 'Finance',
      desc: 'Invoices & billing',
      icon: Landmark,
    });
  }
  if (persona === 'director' && user?.canViewSystemAnalytics) {
    shortcuts.unshift({
      href: '/dashboard/analytics',
      label: 'Analytics',
      desc: 'Executive summary',
      icon: BarChart3,
    });
  }

  return shortcuts.slice(0, 6);
}

export function buildAttentionItems(input: {
  pendingLeave: number;
  openAttendanceExceptions: number;
  credentialsExpiring: number;
  credentialsExpired: number;
  myOnboardingCount: number;
  unreadNotifications: number;
  persona: OverviewPersona;
  modules: Partial<Record<ModuleKey, boolean>>;
}): OverviewAttentionItem[] {
  const items: OverviewAttentionItem[] = [];
  const on = (key: ModuleKey) => input.modules[key] !== false;

  if (on('leave') && input.pendingLeave > 0 && input.persona !== 'viewer') {
    items.push({
      id: 'leave',
      label: 'Leave approvals',
      detail: `${input.pendingLeave} request${input.pendingLeave === 1 ? '' : 's'} awaiting action`,
      href: '/dashboard/leave',
      tone: 'amber',
    });
  }
  if (on('time') && input.openAttendanceExceptions > 0) {
    items.push({
      id: 'attendance',
      label: 'Attendance exceptions',
      detail: `${input.openAttendanceExceptions} open — review clock data`,
      href: '/dashboard/attendance',
      tone: 'rose',
    });
  }
  if (on('core') && (input.credentialsExpiring > 0 || input.credentialsExpired > 0)) {
    items.push({
      id: 'credentials',
      label: 'Credentials',
      detail: [
        input.credentialsExpiring > 0 ? `${input.credentialsExpiring} expiring soon` : null,
        input.credentialsExpired > 0 ? `${input.credentialsExpired} expired` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      href: '/dashboard/credentials',
      tone: 'amber',
    });
  }
  if (on('core') && input.myOnboardingCount > 0) {
    items.push({
      id: 'onboarding',
      label: 'Onboarding tasks',
      detail: `${input.myOnboardingCount} assigned to you`,
      href: '/dashboard/onboarding',
      tone: 'sky',
    });
  }
  if (input.unreadNotifications > 0) {
    items.push({
      id: 'notifications',
      label: 'Notifications',
      detail: `${input.unreadNotifications} unread update${input.unreadNotifications === 1 ? '' : 's'}`,
      href: '/dashboard/settings',
      tone: 'neutral',
    });
  }
  return items;
}

export function shouldShowPayrollBlock(persona: OverviewPersona, payrollDenied: boolean): boolean {
  if (payrollDenied) return persona === 'finance' || persona === 'admin' || persona === 'director';
  return persona !== 'viewer';
}
