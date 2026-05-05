'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock,
  ClipboardList,
  Inbox,
  Landmark,
  Plus,
  ShieldAlert,
  Users,
  Wallet,
} from 'lucide-react';
import { useEntity } from '@/components/EntitySwitcher';
import type { UserSummary } from '@/types/dashboard';

type AttendanceRow = {
  id: string;
  employee?: { firstName?: string; lastName?: string };
  workDate: string;
  firstInAt?: string | null;
  lateMinutes?: number;
};
type MyTaskRow = {
  id: string;
  title: string;
  dueDate?: string | null;
  status: string;
  workflow: { employee: { firstName: string; lastName: string } };
};
type CredentialRow = { id: string; employeeId: string; effectiveStatus: string; credentialName: string };

function formatMoney(amount: number, currency: string) {
  try {
    const opts: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'UGX' ? 0 : 2,
      maximumFractionDigits: currency === 'UGX' ? 0 : 2,
    };
    return new Intl.NumberFormat(currency === 'UGX' ? 'en-UG' : 'en-KE', opts).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}

export default function DashboardOverviewPage() {
  const { activeEntity } = useEntity();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<UserSummary | null>(null);
  const [totalStaff, setTotalStaff] = useState(0);
  const [onDuty, setOnDuty] = useState(0);
  const [onLeave, setOnLeave] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [openAttendanceExceptions, setOpenAttendanceExceptions] = useState(0);
  const [grossTotal, setGrossTotal] = useState(0);
  const [netTotal, setNetTotal] = useState(0);
  const [deductionsTotal, setDeductionsTotal] = useState(0);
  const [payrollDenied, setPayrollDenied] = useState(false);
  const [myOnboardingTasks, setMyOnboardingTasks] = useState<MyTaskRow[]>([]);
  const [credentialsExpiring, setCredentialsExpiring] = useState(0);
  const [credentialsExpired, setCredentialsExpired] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const todayStr = now.toISOString().slice(0, 10);
    const periodLabel = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const run = async () => {
      try {
        const [
          meRes,
          employeesRes,
          attendanceRes,
          statsRes,
          payrollRes,
          tasksRes,
          credRes,
        ] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/outsourcing/employees', { credentials: 'include' }),
          fetch(`/api/outsourcing/attendance?from=${todayStr}&to=${todayStr}`, { credentials: 'include' }),
          fetch('/api/outsourcing/overview-stats', { credentials: 'include' }),
          fetch(`/api/outsourcing/payroll?month=${month}&year=${year}`, { credentials: 'include' }),
          fetch('/api/onboarding/tasks?mine=true&statuses=PENDING,OVERDUE', { credentials: 'include' }),
          fetch('/api/credentials', { credentials: 'include' }),
        ]);

        if (cancelled) return;

        const meJson = meRes.ok ? ((await meRes.json()) as UserSummary) : null;
        setMe(meJson);

        const employees = employeesRes.ok ? ((await employeesRes.json()) as unknown[]) : [];
        const employeeList = Array.isArray(employees) ? employees : [];
        const employeeIds = new Set(
          employeeList.map((e: { id?: string }) => e.id).filter(Boolean) as string[],
        );

        const attendanceJson = attendanceRes.ok ? await attendanceRes.json() : {};
        const attendanceList = Array.isArray((attendanceJson as { summaries?: unknown }).summaries)
          ? (attendanceJson as { summaries: AttendanceRow[] }).summaries
          : [];
        const exceptions = Array.isArray((attendanceJson as { exceptions?: unknown }).exceptions)
          ? (attendanceJson as { exceptions: { status?: string }[] }).exceptions
          : [];
        const openEx = exceptions.filter((ex) => ex.status === 'open').length;

        const leaveStats = statsRes.ok ? await statsRes.json() : {};

        let payrollList: { grossPay?: string; netPay?: string; paye?: string; nssf?: string; nhif?: string; ahl?: string }[] =
          [];
        let denied = false;
        if (payrollRes.ok) {
          const p = await payrollRes.json();
          payrollList = Array.isArray(p) ? p : [];
        } else if (payrollRes.status === 403) {
          denied = true;
        }

        let credExpiring = 0;
        let credExpired = 0;
        if (credRes.ok) {
          const creds = (await credRes.json()) as CredentialRow[];
          const list = Array.isArray(creds) ? creds : [];
          const scoped = list.filter((c) => employeeIds.has(c.employeeId));
          credExpiring = scoped.filter((c) => c.effectiveStatus === 'expiring_soon').length;
          credExpired = scoped.filter((c) => c.effectiveStatus === 'expired').length;
        }

        const tasksRaw = tasksRes.ok ? await tasksRes.json() : [];
        const taskList = Array.isArray(tasksRaw) ? tasksRaw : [];

        setTotalStaff(employeeList.length);
        setOnDuty(attendanceList.filter((r: AttendanceRow) => Boolean(r.firstInAt)).length);
        setOnLeave(typeof (leaveStats as { onLeaveToday?: number }).onLeaveToday === 'number' ? (leaveStats as { onLeaveToday: number }).onLeaveToday : 0);
        setPendingApprovals(
          typeof (leaveStats as { pendingApprovals?: number }).pendingApprovals === 'number'
            ? (leaveStats as { pendingApprovals: number }).pendingApprovals
            : 0,
        );
        setAttendanceRows(attendanceList.slice(0, 10));
        setOpenAttendanceExceptions(openEx);
        setPayrollDenied(denied);
        setGrossTotal(payrollList.reduce((sum, r) => sum + Number(r.grossPay ?? 0), 0));
        setNetTotal(payrollList.reduce((sum, r) => sum + Number(r.netPay ?? 0), 0));
        setDeductionsTotal(
          payrollList.reduce(
            (sum, r) => sum + Number(r.paye ?? 0) + Number(r.nssf ?? 0) + Number(r.nhif ?? 0) + Number(r.ahl ?? 0),
            0,
          ),
        );
        setMyOnboardingTasks(taskList.slice(0, 5));
        setCredentialsExpiring(credExpiring);
        setCredentialsExpired(credExpired);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [activeEntity.id]);

  const onDutyRate = useMemo(() => (totalStaff ? Math.round((onDuty / totalStaff) * 100) : 0), [onDuty, totalStaff]);

  const fx = useMemo(
    () => (amount: number) => formatMoney(amount, activeEntity.currency),
    [activeEntity.currency],
  );

  const quickLinks = useMemo(() => {
    const base = [
      { href: '/dashboard/payroll', label: 'Run payroll', icon: Wallet, desc: 'Monthly runs & payslips' },
      { href: '/dashboard/leave', label: 'Leave queue', icon: CalendarDays, desc: 'Approve or decline' },
      { href: '/dashboard/outsourcing/attendance', label: 'Attendance', icon: Clock, desc: 'Clock data & exceptions' },
      { href: '/dashboard/rota', label: 'Rota', icon: ClipboardList, desc: 'Shifts & scheduling' },
      { href: '/dashboard/credentials', label: 'Credentials', icon: BadgeCheck, desc: 'Licences & certifications' },
      { href: '/dashboard/hse', label: 'HSE incidents', icon: ShieldAlert, desc: 'Safety & compliance' },
    ];
    if (me?.hasAccountsAccess) {
      base.push({ href: '/dashboard/accounts', label: 'Finance', icon: Landmark, desc: 'Invoices & billing' });
    }
    return base;
  }, [me?.hasAccountsAccess]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const statTiles = [
    {
      label: 'Total staff',
      value: totalStaff,
      note: `${activeEntity.country} · retail, stations & depots`,
      icon: Users,
      accent: 'border-l-[4px] border-l-primary-500',
    },
    {
      label: 'On duty today',
      value: onDuty,
      note: `${onDutyRate}% clocked in`,
      icon: Clock,
      accent: 'border-l-[4px] border-l-emerald-600',
    },
    {
      label: 'On leave',
      value: onLeave,
      note: 'Approved leave today',
      icon: CalendarDays,
      accent: 'border-l-[4px] border-l-amber-600',
    },
    {
      label: 'Pending leave',
      value: pendingApprovals,
      note: 'Awaiting approval',
      icon: Inbox,
      accent: 'border-l-[4px] border-l-sky-700',
    },
  ];

  return (
    <div className="page-shell space-y-8 max-w-[1200px]">
      <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title">Overview</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
              <span aria-hidden>{activeEntity.flag}</span>
              <Building2 className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
              {activeEntity.name}
            </span>
          </div>
          <p className="page-description max-w-2xl text-neutral-600">
            Live snapshot for <strong>{activeEntity.name}</strong> — workforce, time & attendance, leave, payroll, and
            compliance. Switch entity in the header to view{' '}
            {activeEntity.id === 'ke' ? 'Uganda' : 'Kenya'} operations.
          </p>
        </div>
        <Link href="/dashboard/employees/new" className="btn-primary inline-flex items-center justify-center gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add employee
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statTiles.map((tile) => (
          <article
            key={tile.label}
            className={`relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md ${tile.accent}`}
          >
            <tile.icon
              className="absolute right-4 top-4 h-6 w-6 text-neutral-200"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">{tile.label}</p>
            <p className="mt-2 text-[34px] font-semibold leading-none text-ink tabular-nums">{tile.value}</p>
            <p className="mt-2 text-sm text-neutral-500">{tile.note}</p>
          </article>
        ))}
      </section>

      {(credentialsExpiring > 0 || credentialsExpired > 0) ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <BadgeCheck className="h-5 w-5 shrink-0 text-amber-700" />
          <span>
            <strong>Credentials:</strong>{' '}
            {credentialsExpiring > 0 ? (
              <>
                {credentialsExpiring} expiring soon
                {credentialsExpired > 0 ? '; ' : '.'}
              </>
            ) : null}
            {credentialsExpired > 0 ? <>{credentialsExpired} expired (renew or replace).</> : null}
          </span>
          <Link href="/dashboard/credentials" className="ml-auto font-medium text-amber-900 underline-offset-2 hover:underline">
            Review credentials
          </Link>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3 data-table-wrap overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <h2 className="text-base font-semibold text-ink">Today&apos;s attendance</h2>
            <Link
              href="/dashboard/outsourcing/attendance"
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Open attendance
            </Link>
          </div>
          {attendanceRows.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-neutral-500">
              No attendance events for today in this entity. Staff appear here after clock-in or device sync.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.firstInAt ? new Date(r.firstInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{`${r.employee?.firstName ?? ''} ${r.employee?.lastName ?? ''}`.trim() || 'Unknown'}</td>
                    <td>{new Date(r.workDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span
                        className={`badge-status ${
                          Number(r.lateMinutes ?? 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {Number(r.lateMinutes ?? 0) > 0 ? 'Late' : 'On time'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Alerts</h2>
            <div className="mt-3 space-y-3">
              {pendingApprovals > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                  <span className="font-medium">Leave approvals:</span> {pendingApprovals} pending
                </div>
              ) : (
                <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 text-sm text-neutral-600">
                  No pending leave approvals.
                </div>
              )}
              {openAttendanceExceptions > 0 ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                  <span className="font-medium">Attendance exceptions:</span> {openAttendanceExceptions} open — review clock
                  data.
                </div>
              ) : (
                <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 text-sm text-neutral-600">
                  No open attendance exceptions.
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link href="/dashboard/leave" className="text-sm font-medium text-primary-700 hover:text-primary-800">
                  Leave queue →
                </Link>
                <Link
                  href="/dashboard/outsourcing/attendance"
                  className="text-sm font-medium text-primary-700 hover:text-primary-800"
                >
                  Attendance →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-base font-semibold text-ink">Payroll summary</h2>
            <p className="text-xs text-neutral-500">
              {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} · {activeEntity.currency}
            </p>
          </div>
          {payrollDenied ? (
            <p className="text-sm text-neutral-600">
              Payroll totals are restricted. Sign in with a finance or admin account to view gross, net, and deductions for{' '}
              {activeEntity.name}.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">Gross</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{fx(grossTotal)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">Net</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{fx(netTotal)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">Statutory & taxes</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{fx(deductionsTotal)}</p>
              </div>
            </div>
          )}
          {!payrollDenied ? (
            <Link
              href="/dashboard/payroll"
              className="mt-4 inline-flex text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Open payroll →
            </Link>
          ) : null}
        </div>
        <div className="xl:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-ink">Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:bg-primary-50/50"
              >
                <action.icon className="h-5 w-5 text-primary-600" strokeWidth={1.75} />
                <p className="mt-2 text-sm font-semibold text-ink group-hover:text-primary-900">{action.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-ink">My onboarding tasks ({myOnboardingTasks.length})</h2>
        <div className="mt-3 space-y-2">
          {myOnboardingTasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 text-sm">
              <p className="font-medium text-neutral-900">
                {task.title} — {task.workflow.employee.firstName} {task.workflow.employee.lastName}
              </p>
              <p className={`text-xs ${task.status === 'OVERDUE' ? 'text-red-700' : 'text-neutral-500'}`}>
                {task.status}
                {task.dueDate ? ` · Due ${new Date(task.dueDate).toLocaleDateString()}` : ''}
              </p>
            </div>
          ))}
          {myOnboardingTasks.length === 0 ? (
            <p className="text-sm text-neutral-500">No pending onboarding tasks assigned to you.</p>
          ) : null}
          <Link href="/dashboard/onboarding" className="mt-2 inline-block text-sm font-medium text-primary-700 hover:text-primary-800">
            Onboarding workspace →
          </Link>
        </div>
      </section>
    </div>
  );
}
