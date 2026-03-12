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

export default function DashboardOverviewPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
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
        setCandidates(Array.isArray(candidatesRes) ? candidatesRes : []);
        setApplications(Array.isArray(appsRes) ? appsRes : []);
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
    const appTotal = applications.length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;
    const hired = applications.filter((a) => a.status === 'hired').length;
    const scheduledInterviews = interviews.filter((i) => i.status === 'scheduled').length;
    const now = new Date();
    const upcomingInterviews = interviews.filter(
      (i) => i.status === 'scheduled' && new Date(i.scheduledAt) >= now
    );
    return {
      jobs: activeJobs,
      jobsTotal: jobs.length,
      clients: clients.length,
      candidates: candidates.length,
      applications: appTotal,
      pending,
      shortlisted,
      hired,
      interviewsScheduled: scheduledInterviews,
      upcomingInterviews,
    };
  }, [jobs, clients, candidates, applications, interviews]);

  const recentApplications = useMemo(
    () => applications.slice(0, 5),
    [applications]
  );

  const upcomingInterviewsList = useMemo(() => {
    const now = new Date();
    return interviews
      .filter((i) => i.status === 'scheduled' && new Date(i.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);
  }, [interviews]);

  if (loading) {
    return (
      <div className="w-full min-w-0 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-w-0">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Overview
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
          Overview
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base max-w-prose">
          Snapshot of job openings, clients, candidates, applications, and interviews.
        </p>
      </div>

      {/* Top-level stats: Jobs, Clients, Candidates, Applications, Interviews */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">
                Job openings
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary-900">
                {stats.jobs}
                {stats.jobsTotal !== stats.jobs && (
                  <span className="text-sm font-normal text-neutral-500"> / {stats.jobsTotal}</span>
                )}
              </p>
            </div>
            <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 opacity-80 shrink-0" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">Clients</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-900">{stats.clients}</p>
            </div>
            <Handshake className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 opacity-80 shrink-0" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">Candidates</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-900">{stats.candidates}</p>
            </div>
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 opacity-80 shrink-0" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">
                Applications
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary-900">{stats.applications}</p>
            </div>
            <FileCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 opacity-80 shrink-0" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">
                Interviews
              </p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                {stats.interviewsScheduled}
              </p>
            </div>
            <CalendarCheck className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 opacity-80 shrink-0" />
          </div>
        </motion.div>
      </div>

      {/* Application pipeline breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 rounded-xl p-4 border border-amber-200 min-w-0"
        >
          <p className="text-xs sm:text-sm font-medium text-amber-800">Pending</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-700">{stats.pending}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 min-w-0"
        >
          <p className="text-xs sm:text-sm font-medium text-indigo-800">Shortlisted</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-700">{stats.shortlisted}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 min-w-0"
        >
          <p className="text-xs sm:text-sm font-medium text-emerald-800">Hired</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700">{stats.hired}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 min-w-0"
        >
          <p className="text-xs sm:text-sm font-medium text-neutral-600">Upcoming interviews</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-800">
            {stats.upcomingInterviews.length}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Recent applications */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden min-w-0">
          <div className="px-4 sm:px-6 py-4 border-b border-neutral-200 flex items-center justify-between gap-3 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 truncate">
              Recent applications
            </h2>
            <Link
              href="/dashboard/applications"
              className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1 shrink-0"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentApplications.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-neutral-500 text-sm">
                No applications yet.
              </div>
            ) : (
              recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href="/dashboard/applications"
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-neutral-50 transition-colors min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-700">
                      {app.candidate.firstName[0]}
                      {app.candidate.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary-900">
                      {app.candidate.firstName} {app.candidate.lastName}
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {app.job.title} · {app.job.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(app.appliedDate)}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[app.status]}`}
                    >
                      {app.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming interviews */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden min-w-0">
          <div className="px-4 sm:px-6 py-4 border-b border-neutral-200 flex items-center justify-between gap-3 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 truncate">
              Upcoming interviews
            </h2>
            <Link
              href="/dashboard/interviews"
              className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1 shrink-0"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {upcomingInterviewsList.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-neutral-500 text-sm">
                No upcoming interviews.
              </div>
            ) : (
              upcomingInterviewsList.map((i) => (
                <Link
                  key={i.id}
                  href="/dashboard/interviews"
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-neutral-50 transition-colors min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-indigo-700">
                      {i.application.candidate.firstName[0]}
                      {i.application.candidate.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary-900">
                      {i.application.candidate.firstName}{' '}
                      {i.application.candidate.lastName}
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {i.application.job.title} · {i.type}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(i.scheduledAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick links: Jobs, Clients, Candidates, Applications, Interviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/dashboard/jobs"
          className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 transition-colors min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-900 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-primary-900 text-sm sm:text-base">Job openings</p>
            <p className="text-xs sm:text-sm text-neutral-600 truncate sm:line-clamp-2">
              Manage jobs and add new roles to the careers page.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary-600 shrink-0" />
        </Link>
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-primary-900 text-sm sm:text-base">Clients</p>
            <p className="text-xs sm:text-sm text-neutral-600 truncate sm:line-clamp-2">
              Manage client companies and contacts.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-400 shrink-0" />
        </Link>
        <Link
          href="/dashboard/candidates"
          className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-primary-900 text-sm sm:text-base">Candidates</p>
            <p className="text-xs sm:text-sm text-neutral-600 truncate sm:line-clamp-2">
              Browse and search all candidates.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-400 shrink-0" />
        </Link>
        <Link
          href="/dashboard/applications"
          className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-primary-900 text-sm sm:text-base">Applications</p>
            <p className="text-xs sm:text-sm text-neutral-600 truncate sm:line-clamp-2">
              Review and manage job applications.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-400 shrink-0" />
        </Link>
        <Link
          href="/dashboard/interviews"
          className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-primary-900 text-sm sm:text-base">
              Interview management
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 truncate sm:line-clamp-2">
              Schedule and manage interviews.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-600 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
