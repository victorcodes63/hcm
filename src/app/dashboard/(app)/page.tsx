'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  FileCheck,
  Users,
  Briefcase,
  ArrowRight,
  Clock,
  Handshake,
  CalendarCheck,
  Loader2,
  Building2,
  Banknote,
  BarChart3,
  BookOpen,
  UserCog,
  LayoutGrid,
} from 'lucide-react';
import type { ApplicationWithDetails, ApplicationStatus } from '@/types/dashboard';
import type { InterviewWithDetails } from '@/types/dashboard';

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-green-100 text-green-800',
};

type JobItem = { id: string; title: string; company: string; isActive: boolean };
type ClientItem = { id: string; name: string; jobCount: number };
type CandidateItem = { id: string; firstName: string; lastName: string; email: string };

const capabilitySections: {
  title: string;
  blurb: string;
  items: { href: string; label: string; desc: string }[];
}[] = [
  {
    title: 'Recruitment (ATS)',
    blurb: 'End-to-end hiring: clients, roles, applications, talent pool, and interviews.',
    items: [
      { href: '/dashboard/clients', label: 'Clients', desc: 'Client companies & contacts' },
      { href: '/dashboard/jobs', label: 'Job openings', desc: 'Post roles, careers page, categories' },
      { href: '/dashboard/applications', label: 'Applications', desc: 'Pipeline, filters, export, bulk CVs & rejections' },
      { href: '/dashboard/candidates', label: 'Candidates', desc: 'Searchable database, resumes, profiles' },
      {
        href: '/dashboard/interviews',
        label: 'Interview management',
        desc: 'Bulk schedule, breaks, invites, PDF/HTML schedules',
      },
    ],
  },
  {
    title: 'Outsourcing',
    blurb: 'Deployed staff: clients, roster, payroll, leave, and attendance.',
    items: [
      { href: '/dashboard/outsourcing/clients', label: 'Clients', desc: 'Outsourcing client accounts' },
      { href: '/dashboard/outsourcing/employees', label: 'Employees', desc: 'Roster, imports, banking' },
      { href: '/dashboard/outsourcing/payroll', label: 'Payroll', desc: 'Runs & payslips' },
      { href: '/dashboard/outsourcing/leave', label: 'Leave', desc: 'Leave management' },
      { href: '/dashboard/outsourcing/attendance', label: 'Attendance', desc: 'Attendance tracking' },
    ],
  },
  {
    title: 'Content & admin',
    blurb: 'Insights, access control, and reporting.',
    items: [
      { href: '/dashboard/insights', label: 'Insights', desc: 'Articles & resources' },
      { href: '/dashboard/staff', label: 'Staff', desc: 'Team accounts (admin)' },
      { href: '/dashboard/analytics', label: 'Analytics', desc: 'Dashboard metrics' },
    ],
  },
];

export default function DashboardOverviewPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [candidatesTotal, setCandidatesTotal] = useState(0);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [appStats, setAppStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    hired: 0,
  });
  const [interviews, setInterviews] = useState<InterviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/jobs').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/candidates').then((r) => r.json()),
      fetch('/api/applications').then((r) => r.json()),
      fetch('/api/interviews').then((r) => r.json()),
    ])
      .then(([jobsRes, clientsRes, candidatesRes, appsRes, interviewsRes]) => {
        if (cancelled) return;
        setJobs(Array.isArray(jobsRes) ? jobsRes : []);
        setClients(Array.isArray(clientsRes) ? clientsRes : []);
        const cands = candidatesRes?.candidates ?? (Array.isArray(candidatesRes) ? candidatesRes : []);
        setCandidates(Array.isArray(cands) ? cands : []);
        setCandidatesTotal(candidatesRes?.total ?? cands.length);
        const apps = appsRes?.applications ?? (Array.isArray(appsRes) ? appsRes : []);
        setApplications(Array.isArray(apps) ? apps : []);
        if (appsRes?.total != null) {
          setAppStats({
            total: appsRes.total ?? 0,
            pending: appsRes.pending ?? 0,
            shortlisted: appsRes.shortlisted ?? 0,
            hired: appsRes.hired ?? 0,
          });
        }
        setInterviews(Array.isArray(interviewsRes) ? interviewsRes : []);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load overview data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((j) => j.isActive).length;
    const appTotal = appStats.total || applications.length;
    const pending = appStats.pending ?? applications.filter((a) => a.status === 'pending').length;
    const shortlisted = appStats.shortlisted ?? applications.filter((a) => a.status === 'shortlisted').length;
    const hired = appStats.hired ?? applications.filter((a) => a.status === 'hired').length;
    const scheduledInterviews = interviews.filter((i) => i.status === 'scheduled').length;
    const now = new Date();
    const upcomingInterviews = interviews.filter(
      (i) => i.status === 'scheduled' && new Date(i.scheduledAt) >= now
    );
    return {
      jobs: activeJobs,
      jobsTotal: jobs.length,
      clients: clients.length,
      candidates: candidatesTotal || candidates.length,
      applications: appTotal,
      pending,
      shortlisted,
      hired,
      interviewsScheduled: scheduledInterviews,
      upcomingInterviews,
    };
  }, [jobs, clients, candidates, candidatesTotal, applications, interviews, appStats]);

  const recentApplications = useMemo(() => applications.slice(0, 5), [applications]);

  const upcomingInterviewsList = useMemo(() => {
    const now = new Date();
    return interviews
      .filter((i) => i.status === 'scheduled' && new Date(i.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);
  }, [interviews]);

  if (loading) {
    return (
      <div className="w-full min-w-0 flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-9 h-9 text-primary-600 animate-spin" />
        <p className="text-sm text-neutral-500">Loading overview…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-w-0 max-w-lg">
        <h1 className="text-2xl font-bold text-primary-900 mb-4">Overview</h1>
        <div className="rounded-2xl border border-red-100 bg-red-50/80 p-5 text-red-800 text-sm">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active jobs',
      value: stats.jobs,
      sub: stats.jobsTotal !== stats.jobs ? `of ${stats.jobsTotal} total` : 'On careers page',
      icon: Briefcase,
      tone: 'primary' as const,
    },
    { label: 'Clients', value: stats.clients, sub: 'Recruitment', icon: Handshake, tone: 'primary' as const },
    { label: 'Candidates', value: stats.candidates, sub: 'In database', icon: Users, tone: 'primary' as const },
    {
      label: 'Applications',
      value: stats.applications,
      sub: 'All statuses',
      icon: FileCheck,
      tone: 'primary' as const,
    },
    {
      label: 'Interviews',
      value: stats.interviewsScheduled,
      sub: 'Scheduled',
      icon: CalendarCheck,
      tone: 'indigo' as const,
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-8 sm:space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-l-2xl" aria-hidden />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pl-1 sm:pl-2">
          <div className="min-w-0 space-y-3">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-700">
              Dashboard home
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Overview
            </h1>
            <p className="text-neutral-600 text-sm sm:text-[15px] max-w-2xl leading-relaxed">
              Live snapshot of recruitment activity. Use the sidebar for ATS, outsourcing, insights, and analytics.
            </p>
          </div>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-900 text-white text-sm font-semibold shadow-md shadow-primary-900/15 hover:bg-primary-800 hover:shadow-lg hover:shadow-primary-900/20 transition-all shrink-0"
          >
            <LayoutGrid className="w-4 h-4 opacity-90" />
            Jump to applications
          </Link>
        </div>
      </div>

      {/* What’s in the platform */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">What you can do here</h2>
            <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
              Hiring and outsourcing in one place—each link matches the sidebar.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {capabilitySections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 flex flex-col min-h-0 hover:border-neutral-300 transition-colors"
            >
              <h3 className="text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">{section.title}</h3>
              <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{section.blurb}</p>
              <ul className="space-y-1 flex-1 border-t border-neutral-100 pt-4">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-start gap-3 rounded-lg px-2 py-2.5 -mx-2 hover:bg-primary-50/60 transition-colors"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0 group-hover:bg-primary-600 transition-colors" />
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold text-sm text-neutral-900 group-hover:text-primary-800 flex items-center gap-1">
                          {item.label}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-600" />
                        </span>
                        <span className="block text-xs text-neutral-500 mt-0.5 leading-snug">{item.desc}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live stats */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 pb-1 border-b border-neutral-200">Live snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            const iconBg =
              s.tone === 'indigo' ? 'bg-indigo-100/80 text-indigo-700' : 'bg-primary-100/80 text-primary-800';
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 hover:border-neutral-300 transition-colors"
              >
                <div className={`inline-flex rounded-lg p-2 mb-3 ${iconBg}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  {s.label}
                </p>
                <p
                  className={`text-2xl sm:text-3xl font-bold tabular-nums ${
                    s.tone === 'indigo' ? 'text-indigo-700' : 'text-primary-900'
                  }`}
                >
                  {s.value}
                  {s.label === 'Active jobs' && stats.jobsTotal !== stats.jobs && (
                    <span className="text-sm font-semibold text-neutral-400">/{stats.jobsTotal}</span>
                  )}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">{s.sub}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: stats.pending, className: 'bg-amber-50/90 border-amber-200/60 text-amber-950' },
            { label: 'Shortlisted', value: stats.shortlisted, className: 'bg-indigo-50/90 border-indigo-200/60 text-indigo-950' },
            { label: 'Hired', value: stats.hired, className: 'bg-emerald-50/90 border-emerald-200/60 text-emerald-950' },
            {
              label: 'Upcoming interviews',
              value: stats.upcomingInterviews.length,
              className: 'bg-neutral-100/80 border-neutral-200 text-neutral-900',
            },
          ].map((row) => (
            <div
              key={row.label}
              className={`rounded-xl border px-4 py-3.5 ${row.className}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{row.label}</p>
              <p className="text-xl font-bold tabular-nums mt-0.5">{row.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden min-w-0 shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between gap-3">
            <h2 className="font-bold text-neutral-900">Recent applications</h2>
            <Link
              href="/dashboard/applications"
              className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentApplications.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-neutral-500">No applications yet.</div>
            ) : (
              recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href="/dashboard/applications"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm">
                    <span className="text-sm font-bold text-primary-800">
                      {app.candidate.firstName[0]}
                      {app.candidate.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-primary-900 truncate">
                      {app.candidate.firstName} {app.candidate.lastName}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {app.job.title} · {app.job.company}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(app.appliedDate)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${STATUS_STYLES[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden min-w-0 shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between gap-3">
            <h2 className="font-bold text-neutral-900">Upcoming interviews</h2>
            <Link
              href="/dashboard/interviews"
              className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {upcomingInterviewsList.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-neutral-500">No upcoming interviews.</div>
            ) : (
              upcomingInterviewsList.map((i) => (
                <Link
                  key={i.id}
                  href="/dashboard/interviews"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-50/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-indigo-800">
                      {i.application.candidate.firstName[0]}
                      {i.application.candidate.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-primary-900">
                      {i.application.candidate.firstName} {i.application.candidate.lastName}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {i.application.job.title} · {i.type}
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 shrink-0 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(i.scheduledAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick entry tiles */}
      <section className="space-y-4 pb-2">
        <h2 className="text-lg font-bold text-neutral-900 pb-1 border-b border-neutral-200">Quick entry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              href: '/dashboard/jobs',
              title: 'Job openings',
              desc: 'Post roles & careers page',
              icon: Briefcase,
              highlight: true,
            },
            { href: '/dashboard/clients', title: 'Clients', desc: 'Recruitment clients', icon: Handshake },
            { href: '/dashboard/candidates', title: 'Candidates', desc: 'Talent database', icon: Users },
            { href: '/dashboard/applications', title: 'Applications', desc: 'Pipeline & export', icon: FileCheck },
            {
              href: '/dashboard/interviews',
              title: 'Interviews',
              desc: 'Schedule & PDF schedules',
              icon: CalendarCheck,
              highlight: true,
            },
            {
              href: '/dashboard/outsourcing/employees',
              title: 'Outsourcing employees',
              desc: 'Roster & payroll',
              icon: Building2,
            },
            { href: '/dashboard/outsourcing/payroll', title: 'Payroll', desc: 'Runs & payslips', icon: Banknote },
            { href: '/dashboard/insights', title: 'Insights', desc: 'Content', icon: BookOpen },
            { href: '/dashboard/analytics', title: 'Analytics', desc: 'Reporting', icon: BarChart3 },
          ].map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
                  tile.highlight
                    ? 'bg-primary-900 text-white border-primary-900 hover:bg-primary-800'
                    : 'bg-white border-neutral-200 hover:border-primary-300 hover:bg-primary-50/40'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    tile.highlight ? 'bg-white/15' : 'bg-primary-50 text-primary-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${tile.highlight ? 'text-white' : ''}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-bold text-sm ${tile.highlight ? 'text-white' : 'text-primary-900'}`}>
                    {tile.title}
                  </p>
                  <p
                    className={`text-xs truncate ${tile.highlight ? 'text-primary-100' : 'text-neutral-500'}`}
                  >
                    {tile.desc}
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 ${tile.highlight ? 'text-white' : 'text-neutral-300'}`} />
              </Link>
            );
          })}
          <Link
            href="/dashboard/staff"
            className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-white hover:border-amber-200 hover:bg-amber-50/20 transition-all sm:col-span-2 xl:col-span-1"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-800 shrink-0">
              <UserCog className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-primary-900">Staff</p>
              <p className="text-xs text-neutral-500">Admin · team accounts</p>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-300 shrink-0" />
          </Link>
        </div>
      </section>
    </div>
  );
}
