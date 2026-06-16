'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardNav, { readSidebarCollapsed, writeSidebarCollapsed } from '@/components/dashboard/DashboardNav';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';
import { DashboardSetupBanner } from '@/components/dashboard/DashboardSetupBanner';
import { ChevronLeft, LogOut } from 'lucide-react';
import type { UserSummary } from '@/types/dashboard';
import { STAFF_USER_TYPE_LABELS } from '@/lib/staff-permissions';
import { EntityProvider, type Entity } from '@/components/EntitySwitcher';
import type { ModuleKey } from '@/lib/modules';
import { writeModuleAdminFlagsCookie } from '@/lib/module-cookie';
import { DashboardSessionProvider } from '@/contexts/dashboard-session';
import {
 DASHBOARD_MAIN_PADDING_BOTTOM,
 DASHBOARD_MAIN_PADDING_TOP,
 DASHBOARD_SHELL_GUTTER,
 DASHBOARD_SIDEBAR_WIDTH,
} from '@/lib/dashboard-layout';

type BootstrapPayload = {
 me?: UserSummary;
 modules?: Record<ModuleKey, boolean>;
 moduleAdminFlags?: Record<ModuleKey, boolean>;
 entities?: Entity[];
 defaultEntityId?: string;
 showEntitySwitcher?: boolean;
};

const ALL_MODULES_ON: Record<ModuleKey, boolean> = {
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
};

const SIDEBAR_WIDTH = DASHBOARD_SIDEBAR_WIDTH;

function getUserRoleLabel(user: UserSummary | null): string {
 if (!user) return 'Staff User';
 if (user.role === 'admin') return 'Administrator';
 if (user.role === 'viewer') return 'Viewer';
 return STAFF_USER_TYPE_LABELS[user.staffUserType] ?? 'Staff';
}

type DashboardAppLayoutClientProps = {
 children: ReactNode;
 sidebarBrand: ReactNode;
};

export default function DashboardAppLayoutClient({
 children,
 sidebarBrand,
}: DashboardAppLayoutClientProps) {
 const router = useRouter();
 const pathname = usePathname();
 const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
 const [enabledModules, setEnabledModules] = useState<Record<ModuleKey, boolean>>(ALL_MODULES_ON);
 const [entityBootstrap, setEntityBootstrap] = useState<BootstrapPayload | null>(null);
 const [sidebarOpen, setSidebarOpen] = useState(true);
 const [hasMounted, setHasMounted] = useState(false);
 const [isMobileNav, setIsMobileNav] = useState(false);

 useEffect(() => {
 setSidebarOpen(!readSidebarCollapsed());
 setHasMounted(true);
 }, []);

 useEffect(() => {
 const mq = window.matchMedia('(max-width: 1023px)');
 const sync = () => setIsMobileNav(mq.matches);
 sync();
 mq.addEventListener('change', sync);
 return () => mq.removeEventListener('change', sync);
 }, []);

 useEffect(() => {
 let cancelled = false;

 const applyBootstrap = (data: BootstrapPayload | null) => {
 if (!data) return;
 if (data.me) setCurrentUser(data.me);
 if (data.modules) setEnabledModules(data.modules);
 if (data.moduleAdminFlags) writeModuleAdminFlagsCookie(data.moduleAdminFlags);
 setEntityBootstrap(data);
 };

 const loadBootstrap = () => {
 fetch('/api/dashboard/bootstrap', { credentials: 'include' })
 .then((r) => {
 if (r.status === 401 || r.status === 403) throw new Error('unauthorized');
 if (!r.ok) throw new Error('Failed to load dashboard session');
 return r.json() as Promise<BootstrapPayload>;
 })
 .then((data) => {
 if (!cancelled) applyBootstrap(data);
 })
 .catch((error: unknown) => {
 if (cancelled) return;
 setCurrentUser(null);
 if (error instanceof Error && error.message === 'unauthorized') {
 router.replace('/dashboard/login?error=inactive');
 }
 });
 };

 loadBootstrap();
 const onModulesUpdated = () => {
 fetch('/api/config/deployment', { credentials: 'include' })
 .then((r) => (r.ok ? r.json() : null))
 .then((data: BootstrapPayload | null) => {
 if (!cancelled && data?.modules) {
 setEnabledModules(data.modules);
 if (data.moduleAdminFlags) writeModuleAdminFlagsCookie(data.moduleAdminFlags);
 }
 })
 .catch(() => {});
 };
 window.addEventListener('hris:modules-updated', onModulesUpdated);
 return () => {
 cancelled = true;
 window.removeEventListener('hris:modules-updated', onModulesUpdated);
 };
 }, [router]);

 const setSidebar = useCallback((open: boolean) => {
 setSidebarOpen(open);
 writeSidebarCollapsed(!open);
 }, []);

 const toggleSidebar = useCallback(() => {
 setSidebar(!sidebarOpen);
 }, [setSidebar, sidebarOpen]);

 const displayName = currentUser?.name || 'Staff User';
 const displayEmail = currentUser?.email || 'staff@example.com';
 const roleLabel = getUserRoleLabel(currentUser);
 const showRoleBadge = roleLabel.toLowerCase() !== displayName.trim().toLowerCase();
 const initials =
 displayName
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

 const closeSidebarOnMobile = () => {
 if (window.matchMedia('(max-width: 1023px)').matches) setSidebar(false);
 };

 const showBackdrop = hasMounted && sidebarOpen && isMobileNav;

 return (
 <EntityProvider
 initialConfig={
 entityBootstrap
 ? {
 entities: entityBootstrap.entities,
 defaultEntityId: entityBootstrap.defaultEntityId,
 showSwitcher: entityBootstrap.showEntitySwitcher,
 }
 : null
 }
 >
 <div className="dashboard-canvas h-screen overflow-hidden">
 {showBackdrop ? (
 <button
 type="button"
 className="print:hidden fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-[1px] transition-opacity"
 aria-label="Close navigation menu"
 onClick={() => setSidebar(false)}
 />
 ) : null}

 {hasMounted && sidebarOpen ? (
 <button
 type="button"
 onClick={toggleSidebar}
 className="print:hidden fixed top-1/2 z-[60] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-soft transition-[left] duration-300 ease-out hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
 style={{ left: SIDEBAR_WIDTH }}
 title="Close navigation menu"
 aria-expanded
 aria-label="Close navigation menu"
 >
 <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
 </button>
 ) : null}

 <aside
 className={`print:hidden fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/60 bg-white/90 shadow-[4px_0_24px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-transform duration-300 ease-out ${
 hasMounted && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
 } ${sidebarOpen && !isMobileNav ? 'lg:shadow-none' : 'shadow-large'}`}
 style={{ width: SIDEBAR_WIDTH }}
 aria-hidden={hasMounted && !sidebarOpen}
 >
 <div
 className="flex-shrink-0 border-b border-neutral-100/80 px-3.5 py-3"
 onClick={closeSidebarOnMobile}
 >
 {sidebarBrand}
 </div>

 <DashboardNav
 currentUserRole={currentUser?.role ?? null}
 hasAccountsAccess={currentUser?.hasAccountsAccess ?? false}
 canViewSystemAnalytics={currentUser?.canViewSystemAnalytics ?? false}
 enabledModules={enabledModules}
 onNavigate={closeSidebarOnMobile}
 />

 <div className="mt-auto flex-shrink-0 border-t border-neutral-200/50 bg-gradient-to-t from-neutral-50/80 to-transparent p-2.5">
 <div className="flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/60 px-2 py-2 shadow-sm backdrop-blur-sm">
 <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700">
 <span className="text-xs font-bold text-white">{initials}</span>
 </div>
 <div className="min-w-0 flex-1">
 <p className="truncate text-[13px] font-semibold leading-tight text-ink">{displayName}</p>
 {showRoleBadge ? (
 <p className="truncate text-[10px] font-medium leading-tight text-primary-600">{roleLabel}</p>
 ) : null}
 <p className="truncate text-[11px] leading-tight text-neutral-500">{displayEmail}</p>
 </div>
 <button
 type="button"
 onClick={handleLogout}
 title="Sign out"
 aria-label="Sign out"
 className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
 >
 <LogOut className="h-4 w-4" strokeWidth={1.75} />
 </button>
 </div>
 </div>
 </aside>

 <div
 className={`flex h-screen min-h-0 min-w-0 flex-col transition-[margin] duration-300 ease-out ${
 hasMounted && sidebarOpen && !isMobileNav ? 'lg:ml-[280px]' : ''
 }`}
 >
 <DashboardTopbar
 currentUser={currentUser}
 sidebarOpen={sidebarOpen}
 onToggleSidebar={toggleSidebar}
 enabledModules={enabledModules}
 contentGutterClass={DASHBOARD_SHELL_GUTTER}
 />
 <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
 <div
 className={`w-full min-w-0 ${DASHBOARD_SHELL_GUTTER} ${DASHBOARD_MAIN_PADDING_TOP} ${DASHBOARD_MAIN_PADDING_BOTTOM}`}
 >
          <DashboardSetupBanner />
          <DashboardSessionProvider user={currentUser} modules={enabledModules}>
          {children}
          </DashboardSessionProvider>
 </div>
 </main>
 </div>
 </div>
 </EntityProvider>
 );
}
