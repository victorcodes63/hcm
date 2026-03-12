'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Briefcase, Plus, ArrowRight, ExternalLink, Pencil, Search, Filter, Loader2 } from 'lucide-react';
import { JobListing } from '@/types/ats';

export default function DashboardJobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/jobs'); // no activeOnly – show all for dashboard
        if (!res.ok) throw new Error('Failed to load jobs');
        const data = await res.json();
        if (!cancelled) setJobs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load jobs');
          setJobs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchJobs();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const companies = useMemo(() => {
    const set = new Set(jobs.map((j) => j.company).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const categories = useMemo(() => {
    const set = new Set(jobs.map((j) => j.category).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const isJobExpired = (job: JobListing) =>
    !!job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
  const getJobEffectiveStatus = (job: JobListing): 'active' | 'expired' | 'closed' => {
    if (isJobExpired(job)) return 'expired';
    if (!job.isActive) return 'closed';
    return 'active';
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.trim().toLowerCase();
      if (q && !job.title.toLowerCase().includes(q) && !(job.referenceId ?? '').toLowerCase().includes(q)) return false;
      if (filterCompany && job.company !== filterCompany) return false;
      if (filterCategory && job.category !== filterCategory) return false;
      const status = getJobEffectiveStatus(job);
      if (filterStatus === 'active' && status !== 'active') return false;
      if (filterStatus === 'inactive' && status === 'active') return false;
      return true;
    });
  }, [jobs, searchQuery, filterCompany, filterCategory, filterStatus]);

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount ?? 0), 0);
  const activeCount = jobs.filter((j) => getJobEffectiveStatus(j) === 'active').length;

  const toggleJobStatus = async (job: JobListing) => {
    setTogglingId(job.id);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">Job openings</h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Manage job postings and add new roles to the careers page.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] sm:min-h-0 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          Post a job
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">Open roles</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary-900">{activeCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">Total applications</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary-900">{totalApplications}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by title or job ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Filter className="w-3.5 h-3.5" />
                Filters
              </span>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-0 max-w-[180px]"
                title="Filter by company"
              >
                <option value="">All companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-0 max-w-[180px]"
                title="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-0"
                title="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">No longer accepting</option>
              </select>
            </div>
          </div>
        </>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-100 rounded w-full" />
            <div className="h-4 bg-neutral-100 rounded w-5/6" />
            <div className="h-4 bg-neutral-100 rounded w-4/6" />
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">
            No job postings yet. Post your first job to show it on the careers page.
          </p>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post a job
          </Link>
          <div className="mt-6">
            <Link
              href="/careers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium"
            >
              View job board
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : filteredJobs.length === 0 && jobs.length > 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          <Filter className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">No jobs match your filters.</p>
          <p className="text-sm text-neutral-500 mb-4">Try changing the search or filter options above.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterCompany('');
              setFilterCategory('');
              setFilterStatus('all');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Job ID
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Job
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Company
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Category
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Posted
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Expires
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Applications
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm font-mono whitespace-nowrap">
                      {job.referenceId ?? '—'}
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className="font-medium text-primary-900 text-sm">{job.title}</span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm">
                      {job.company}
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      {job.category ? (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-primary-100 text-primary-800">
                          {job.category}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-neutral-500 text-sm tabular-nums whitespace-nowrap">
                      {formatDate(job.postedDate)}
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-neutral-500 text-sm tabular-nums whitespace-nowrap">
                      {job.applicationDeadline
                        ? formatDateTime(job.applicationDeadline)
                        : <span className="text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm tabular-nums">
                      {job.applicationCount ?? 0}
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      {getJobEffectiveStatus(job) === 'expired' ? (
                        <span
                          className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600"
                          title="Application deadline has passed"
                        >
                          Expired
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleJobStatus(job)}
                          disabled={!!togglingId}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-60 ${
                            job.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          }`}
                          title={job.isActive ? 'Click to stop accepting applications' : 'Click to reopen for applications'}
                        >
                          {togglingId === job.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : null}
                          {job.isActive ? 'Active' : 'No longer accepting'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/jobs/${job.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <a
                          href={`/careers/apply/${job.slug ?? job.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                        >
                          View
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <Link
            href="/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 font-medium transition-colors"
          >
            View job board on website
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
