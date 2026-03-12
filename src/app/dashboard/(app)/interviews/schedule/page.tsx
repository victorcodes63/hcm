'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Users, Loader2, Search, X } from 'lucide-react';
import type { InterviewType, InterviewDurationMinutes } from '@/types/dashboard';
import { parseDateTimeAsNairobi } from '@/lib/timezone';
import type { ApplicationWithDetails } from '@/types/dashboard';

const DURATION_OPTIONS: { value: InterviewDurationMinutes; label: string }[] = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hr' },
];

const MAX_BULK = 10;

type JobWithShortlisted = {
  id: string;
  title: string;
  company?: string;
  clientId?: string | null;
  clientName?: string | null;
  shortlistedCount: number;
  scheduledCount: number;
};

export default function ScheduleInterviewsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [jobsWithShortlisted, setJobsWithShortlisted] = useState<JobWithShortlisted[]>([]);
  const [jobsWithShortlistedLoading, setJobsWithShortlistedLoading] = useState(true);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkClientFilter, setBulkClientFilter] = useState('');
  const [bulkClientInputValue, setBulkClientInputValue] = useState('');
  const [bulkClientDropdownOpen, setBulkClientDropdownOpen] = useState(false);
  const [shortlistedApps, setShortlistedApps] = useState<ApplicationWithDetails[]>([]);
  const [shortlistedLoading, setShortlistedLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [bulkFormError, setBulkFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    applicationId: '',
    scheduledAt: '',
    durationMinutes: 45 as InterviewDurationMinutes,
    type: 'video' as InterviewType,
    locationOrLink: '',
    notes: '',
  });

  const [bulkJobId, setBulkJobId] = useState('');
  const [singleSearch, setSingleSearch] = useState('');
  const [singleClientFilter, setSingleClientFilter] = useState('');
  const [singleClientInputValue, setSingleClientInputValue] = useState('');
  const [singleClientDropdownOpen, setSingleClientDropdownOpen] = useState(false);
  const [singleJobId, setSingleJobId] = useState('');
  const [singleShortlistedApps, setSingleShortlistedApps] = useState<ApplicationWithDetails[]>([]);
  const [singleShortlistedLoading, setSingleShortlistedLoading] = useState(false);
  const [bulkDate, setBulkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bulkStartTime, setBulkStartTime] = useState('09:00');
  const [bulkDuration, setBulkDuration] = useState<InterviewDurationMinutes>(45);
  const [bulkType, setBulkType] = useState<InterviewType>('video');
  const [bulkLocation, setBulkLocation] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkSelectedAppIds, setBulkSelectedAppIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const y = parts.find((p) => p.type === 'year')?.value ?? '';
    const m = parts.find((p) => p.type === 'month')?.value ?? '';
    const d = parts.find((p) => p.type === 'day')?.value ?? '';
    const h = parts.find((p) => p.type === 'hour')?.value ?? '';
    const min = parts.find((p) => p.type === 'minute')?.value ?? '';
    setForm((f) => ({ ...f, scheduledAt: `${y}-${m}-${d}T${h}:${min}` }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setJobs(data.map((j: { id: string; title: string }) => ({ id: j.id, title: j.title })));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setJobsWithShortlistedLoading(true);
    fetch('/api/interviews/jobs-with-shortlisted')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setJobsWithShortlisted(data);
      })
      .catch(() => { if (!cancelled) setJobsWithShortlisted([]); })
      .finally(() => { if (!cancelled) setJobsWithShortlistedLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setClients(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const bulkClientSuggestions = useMemo(() => {
    const v = bulkClientInputValue.trim().toLowerCase();
    if (!v) return clients.slice(0, 20);
    return clients.filter((c) => c.name.toLowerCase().includes(v)).slice(0, 20);
  }, [clients, bulkClientInputValue]);

  const bulkJobFilterOptions = useMemo(() => {
    let list = jobsWithShortlisted;
    const q = bulkSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.company ?? '').toLowerCase().includes(q) ||
          (j.clientName ?? '').toLowerCase().includes(q)
      );
    }
    if (bulkClientFilter) {
      list = list.filter((j) => j.clientId === bulkClientFilter);
    }
    return list;
  }, [jobsWithShortlisted, bulkSearch, bulkClientFilter]);

  useEffect(() => {
    if (bulkJobId && !bulkJobFilterOptions.some((j) => j.id === bulkJobId)) {
      setBulkJobId('');
    }
  }, [bulkJobId, bulkJobFilterOptions]);

  const singleClientSuggestions = useMemo(() => {
    const v = singleClientInputValue.trim().toLowerCase();
    if (!v) return clients.slice(0, 20);
    return clients.filter((c) => c.name.toLowerCase().includes(v)).slice(0, 20);
  }, [clients, singleClientInputValue]);

  const singleJobFilterOptions = useMemo(() => {
    let list = jobsWithShortlisted;
    const q = singleSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.company ?? '').toLowerCase().includes(q) ||
          (j.clientName ?? '').toLowerCase().includes(q)
      );
    }
    if (singleClientFilter) {
      list = list.filter((j) => j.clientId === singleClientFilter);
    }
    return list;
  }, [jobsWithShortlisted, singleSearch, singleClientFilter]);

  useEffect(() => {
    if (singleJobId && !singleJobFilterOptions.some((j) => j.id === singleJobId)) {
      setSingleJobId('');
      setForm((f) => ({ ...f, applicationId: '' }));
    }
  }, [singleJobId, singleJobFilterOptions]);

  useEffect(() => {
    if (!singleJobId) {
      setSingleShortlistedApps([]);
      setForm((f) => ({ ...f, applicationId: '' }));
      return;
    }
    setSingleShortlistedLoading(true);
    fetch(`/api/applications?jobId=${encodeURIComponent(singleJobId)}&status=shortlisted`)
      .then((r) => r.json())
      .then((data) => {
        setSingleShortlistedApps(Array.isArray(data) ? data : []);
        setForm((f) => ({ ...f, applicationId: '' }));
      })
      .catch(() => setSingleShortlistedApps([]))
      .finally(() => setSingleShortlistedLoading(false));
  }, [singleJobId]);

  useEffect(() => {
    if (!bulkJobId) {
      setShortlistedApps([]);
      return;
    }
    setShortlistedLoading(true);
    fetch(`/api/applications?jobId=${encodeURIComponent(bulkJobId)}&status=shortlisted`)
      .then((r) => r.json())
      .then((data) => {
        setShortlistedApps(Array.isArray(data) ? data : []);
        setBulkSelectedAppIds(new Set());
      })
      .catch(() => setShortlistedApps([]))
      .finally(() => setShortlistedLoading(false));
  }, [bulkJobId]);

  const toggleBulkApp = (appId: string) => {
    setBulkSelectedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else if (next.size < MAX_BULK) next.add(appId);
      return next;
    });
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.applicationId.trim()) {
      setFormError('Please select a candidate.');
      return;
    }
    if (!form.locationOrLink.trim()) {
      setFormError('Location or meeting link is required so applicants know where to attend.');
      return;
    }
    const scheduledAt = parseDateTimeAsNairobi(form.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      setFormError('Please set a valid date and time.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: form.applicationId,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: form.durationMinutes,
          type: form.type,
          locationOrLink: form.locationOrLink.trim(),
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create interview.');
        return;
      }
      router.push('/dashboard/interviews');
      router.refresh();
    } catch {
      setFormError('Failed to create interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkFormError(null);
    if (!bulkJobId.trim()) {
      setBulkFormError('Select a job.');
      return;
    }
    if (bulkSelectedAppIds.size === 0) {
      setBulkFormError('Select at least one application (max 10).');
      return;
    }
    if (!bulkLocation.trim()) {
      setBulkFormError('Location or meeting link is required so applicants know where to attend.');
      return;
    }
    setBulkSubmitting(true);
    try {
      const res = await fetch('/api/interviews/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: bulkJobId,
          date: bulkDate,
          startTime: bulkStartTime,
          durationMinutes: bulkDuration,
          type: bulkType,
          applicationIds: Array.from(bulkSelectedAppIds),
          locationOrLink: bulkLocation.trim(),
          notes: bulkNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBulkFormError(data.error || 'Failed to create interviews.');
        return;
      }
      router.push('/dashboard/interviews');
      router.refresh();
    } catch {
      setBulkFormError('Failed to create interviews.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const inputClass = 'w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base';

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4 sm:mb-5" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link href="/dashboard/interviews" className="hover:text-primary-700 transition-colors">
              Interview management
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-primary-900 font-medium" aria-current="page">
            Schedule interviews
          </li>
        </ol>
      </nav>

      <div className="mb-6 sm:mb-8 w-full min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
          Schedule interviews
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base w-full">
          Bulk schedule up to 10 interviews from a shortlisted job, or add a single interview. Times are auto-spaced for bulk.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Bulk schedule (max 10) */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 sm:p-6 lg:p-8">
          <h2 className="text-base sm:text-lg font-semibold text-primary-900 flex items-center gap-2 mb-5 sm:mb-6">
            <Users className="w-5 h-5 shrink-0" />
            Bulk schedule (max 10)
          </h2>

          {/* Step 1: Filters – Search, Client, Job (only jobs with shortlisted candidates) */}
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 mb-6">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">1. Select a job</p>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by job title or company..."
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  aria-label="Search jobs"
                />
              </div>
              <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                <input
                  type="text"
                  placeholder="Filter by client..."
                  value={bulkClientInputValue}
                  onChange={(e) => {
                    setBulkClientInputValue(e.target.value);
                    setBulkClientFilter('');
                    setBulkClientDropdownOpen(true);
                  }}
                  onFocus={() => setBulkClientDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setBulkClientDropdownOpen(false), 200)}
                  className={`w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white ${bulkClientFilter ? 'pr-9' : ''}`}
                  aria-label="Filter by client"
                />
                {bulkClientDropdownOpen && bulkClientSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 py-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    {bulkClientSuggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setBulkClientFilter(c.id);
                          setBulkClientInputValue(c.name);
                          setBulkClientDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {bulkClientFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setBulkClientFilter('');
                      setBulkClientInputValue('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label="Clear client filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0 sm:min-w-[200px]">
                <select
                  id="bulk-job"
                  value={bulkJobId}
                  onChange={(e) => setBulkJobId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  aria-label="Select job"
                >
                  <option value="">Select job (shortlisted only)</option>
                  {jobsWithShortlistedLoading ? (
                    <option value="" disabled>Loading…</option>
                  ) : (
                    bulkJobFilterOptions.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} {j.company ? `· ${j.company}` : ''} ({j.shortlistedCount} shortlisted)
                      </option>
                    ))
                  )}
                </select>
              </div>
              {(bulkSearch || bulkClientFilter || bulkJobId) && (
                <button
                  type="button"
                  onClick={() => {
                    setBulkSearch('');
                    setBulkClientFilter('');
                    setBulkClientInputValue('');
                    setBulkJobId('');
                  }}
                  className="shrink-0 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5"
                  aria-label="Clear filters"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              {jobsWithShortlistedLoading ? 'Loading…' : jobsWithShortlisted.length === 0
                ? 'No jobs have shortlisted candidates yet. Shortlist applicants from the Applications page first.'
                : 'Only jobs with shortlisted candidates are shown.'}
            </p>
          </div>

          <form id="bulk-schedule-form" onSubmit={handleBulkCreate} className="flex flex-col lg:flex-row lg:gap-8">
            {/* Left: schedule options */}
            <div className="flex-1 min-w-0 space-y-4 lg:max-w-md">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">2. Set schedule details</p>
              {bulkFormError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {bulkFormError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="bulk-date" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="bulk-date"
                    type="date"
                    value={bulkDate}
                    onChange={(e) => setBulkDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bulk-time" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Start time
                  </label>
                  <input
                    id="bulk-time"
                    type="time"
                    value={bulkStartTime}
                    onChange={(e) => setBulkStartTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="bulk-duration" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Duration
                  </label>
                  <select
                    id="bulk-duration"
                    value={bulkDuration}
                    onChange={(e) => setBulkDuration(Number(e.target.value) as InterviewDurationMinutes)}
                    className={inputClass}
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="bulk-type" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Type
                  </label>
                  <select
                    id="bulk-type"
                    value={bulkType}
                    onChange={(e) => setBulkType(e.target.value as InterviewType)}
                    className={inputClass}
                  >
                    <option value="phone">Phone</option>
                    <option value="video">Video</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="bulk-location" className="block text-sm font-medium text-primary-900 mb-1.5">
                  Location / link <span className="text-red-600">*</span>
                </label>
                <input
                  id="bulk-location"
                  type="text"
                  value={bulkLocation}
                  onChange={(e) => setBulkLocation(e.target.value)}
                  placeholder="e.g. Zoom link or office address"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="bulk-notes" className="block text-sm font-medium text-primary-900 mb-1.5">
                  Notes
                </label>
                <textarea
                  id="bulk-notes"
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  placeholder="e.g. Please bring ID, certificates, or other documents. These notes will be included in the invite email."
                  rows={3}
                  className={inputClass + ' resize-y'}
                />
              </div>
            </div>
            {/* Right: candidates */}
            <div className="flex-1 min-w-0 mt-6 lg:mt-0 lg:min-w-[280px]">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">3. Select candidates</p>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Shortlisted candidates (select up to 10)
              </label>
              {shortlistedLoading ? (
                <p className="text-sm text-neutral-500 py-8">Loading…</p>
              ) : shortlistedApps.length === 0 ? (
                <div className="border border-dashed border-neutral-200 rounded-lg p-8 text-center">
                  <p className="text-sm text-neutral-500">
                    {bulkJobId ? 'No shortlisted candidates for this job.' : 'Select a job above to see shortlisted candidates.'}
                  </p>
                </div>
              ) : (
                <ul className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 max-h-64 lg:max-h-80 overflow-y-auto">
                  {shortlistedApps.map((app) => (
                    <li key={app.id} className="flex items-center gap-2 px-4 py-3 hover:bg-neutral-50/50">
                      <input
                        type="checkbox"
                        checked={bulkSelectedAppIds.has(app.id)}
                        onChange={() => toggleBulkApp(app.id)}
                        disabled={!bulkSelectedAppIds.has(app.id) && bulkSelectedAppIds.size >= MAX_BULK}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-900">
                        {app.candidate.firstName} {app.candidate.lastName}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {bulkSelectedAppIds.size > 0 && (
                <p className="mt-2 text-xs text-neutral-500">{bulkSelectedAppIds.size} selected (max {MAX_BULK})</p>
              )}
            </div>
          </form>
          <div className="pt-6 mt-6 border-t border-neutral-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard/interviews"
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 min-h-[44px] sm:min-h-0 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors inline-flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="bulk-schedule-form"
              disabled={bulkSubmitting || bulkSelectedAppIds.size === 0}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 min-h-[44px] sm:min-h-0 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {bulkSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {bulkSubmitting ? 'Adding…' : `Add ${bulkSelectedAppIds.size} interview(s)`}
            </button>
          </div>
        </div>

        {/* Add single interview */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 sm:p-6 lg:p-8">
          <h2 className="text-base sm:text-lg font-semibold text-primary-900 flex items-center gap-2 mb-5 sm:mb-6">
            <CalendarCheck className="w-5 h-5 shrink-0" />
            Add single interview
          </h2>

          {/* Step 1: Filters – Search, Client, Job */}
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 mb-6">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">1. Select a job</p>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by job title or company..."
                  value={singleSearch}
                  onChange={(e) => setSingleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  aria-label="Search jobs"
                />
              </div>
              <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                <input
                  type="text"
                  placeholder="Filter by client..."
                  value={singleClientInputValue}
                  onChange={(e) => {
                    setSingleClientInputValue(e.target.value);
                    setSingleClientFilter('');
                    setSingleClientDropdownOpen(true);
                  }}
                  onFocus={() => setSingleClientDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setSingleClientDropdownOpen(false), 200)}
                  className={`w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white ${singleClientFilter ? 'pr-9' : ''}`}
                  aria-label="Filter by client"
                />
                {singleClientDropdownOpen && singleClientSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 py-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    {singleClientSuggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSingleClientFilter(c.id);
                          setSingleClientInputValue(c.name);
                          setSingleClientDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {singleClientFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setSingleClientFilter('');
                      setSingleClientInputValue('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label="Clear client filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0 sm:min-w-[200px]">
                <select
                  value={singleJobId}
                  onChange={(e) => setSingleJobId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  aria-label="Select job"
                >
                  <option value="">Select job (shortlisted only)</option>
                  {jobsWithShortlistedLoading ? (
                    <option value="" disabled>Loading…</option>
                  ) : (
                    singleJobFilterOptions.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} {j.company ? `· ${j.company}` : ''} ({j.shortlistedCount} shortlisted)
                      </option>
                    ))
                  )}
                </select>
              </div>
              {(singleSearch || singleClientFilter || singleJobId) && (
                <button
                  type="button"
                  onClick={() => {
                    setSingleSearch('');
                    setSingleClientFilter('');
                    setSingleClientInputValue('');
                    setSingleJobId('');
                  }}
                  className="shrink-0 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5"
                  aria-label="Clear filters"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              {jobsWithShortlistedLoading ? 'Loading…' : jobsWithShortlisted.length === 0
                ? 'No jobs have shortlisted candidates yet. Shortlist applicants from the Applications page first.'
                : 'Only jobs with shortlisted candidates are shown.'}
            </p>
          </div>

          <form onSubmit={handleSubmitSingle} className="space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {formError}
              </div>
            )}

            {/* Step 2: Select candidate */}
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">2. Select candidate</p>
              <label htmlFor="single-application" className="block text-sm font-medium text-primary-900 mb-1.5">
                Candidate <span className="text-red-600">*</span>
              </label>
              <select
                id="single-application"
                value={form.applicationId}
                onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}
                className={inputClass}
                required
                disabled={singleShortlistedLoading}
              >
                <option value="">
                  {!singleJobId ? 'Select a job above first' : singleShortlistedLoading ? 'Loading…' : 'Select candidate'}
                </option>
                {singleShortlistedApps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.candidate.firstName} {a.candidate.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Schedule details */}
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">3. Set schedule details</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="single-datetime" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Date & time <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="single-datetime"
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="single-duration" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Duration
                  </label>
                  <select
                    id="single-duration"
                    value={form.durationMinutes}
                    onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) as InterviewDurationMinutes }))}
                    className={inputClass}
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="single-type" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Type
                  </label>
                  <select
                    id="single-type"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as InterviewType }))}
                    className={inputClass}
                  >
                    <option value="phone">Phone</option>
                    <option value="video">Video</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="single-location" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Location or meeting link <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="single-location"
                    type="text"
                    value={form.locationOrLink}
                    onChange={(e) => setForm((f) => ({ ...f, locationOrLink: e.target.value }))}
                    placeholder="e.g. Zoom link or office address"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="single-notes" className="block text-sm font-medium text-primary-900 mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    id="single-notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-4">
              <Link
                href="/dashboard/interviews"
                className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 min-h-[44px] sm:min-h-0 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors inline-flex items-center justify-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 min-h-[44px] sm:min-h-0 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? 'Scheduling…' : 'Schedule interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
