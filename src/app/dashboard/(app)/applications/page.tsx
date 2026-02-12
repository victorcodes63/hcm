'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  FileText,
  X,
  Building2,
  Calendar,
  ZoomIn,
  ZoomOut,
  FileSpreadsheet,
  User,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
} from 'lucide-react';
import type {
  ApplicationWithDetails,
  ApplicationStatus,
  ApplicationFormData,
} from '@/types/dashboard';

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    pending: 'bg-amber-50 text-amber-700',
    reviewed: 'bg-blue-50 text-blue-700',
    shortlisted: 'bg-indigo-50 text-indigo-700',
    rejected: 'bg-red-50 text-red-700',
    hired: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

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

/** Approximate years between start and end date (end empty/"Present" = now). */
function yearsBetween(startDate: string, endDate: string): number {
  if (!startDate?.trim()) return 0;
  const start = new Date(startDate.trim());
  if (isNaN(start.getTime())) return 0;
  const endStr = (endDate || '').trim().toLowerCase();
  const end =
    !endStr || endStr === 'present' || endStr === 'current'
      ? new Date()
      : new Date(endDate.trim());
  if (isNaN(end.getTime())) return 0;
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, Math.round((months / 12) * 10) / 10);
}

function formatDateRange(start: string, end: string) {
  if (!start?.trim()) return '—';
  const endStr = (end || '').trim().toLowerCase();
  const endLabel = !endStr || endStr === 'present' || endStr === 'current' ? 'Present' : end;
  return `${start} – ${endLabel}`;
}

type ApplicantDetailTab = 'general' | 'experience' | 'education' | 'certifications';

const APPLICANT_TABS: { id: ApplicantDetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', label: 'General & CV', icon: User },
  { id: 'experience', label: 'Work experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'certifications', label: 'Certifications', icon: Award },
];

function WorkExperienceTab({ formData }: { formData: ApplicationFormData | null }) {
  const entries = formData?.employmentHistory?.filter(
    (e) => e.jobTitle?.trim() || e.companyName?.trim()
  ) ?? [];
  const totalYears = entries.reduce(
    (sum, e) => {
      const end = e.isCurrentJob ? new Date().toISOString().slice(0, 7) : e.endDate;
      return sum + yearsBetween(e.startDate, end);
    },
    0
  );
  return (
    <div className="space-y-4">
      {entries.length > 0 && (
        <div className="rounded-lg bg-primary-50/50 border border-primary-100 px-3 py-2">
          <p className="text-sm font-medium text-primary-900">
            Total relevant experience: <span className="tabular-nums">{totalYears}</span> years
          </p>
        </div>
      )}
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500">No work experience provided.</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((e, i) => (
            <li key={i} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
              <p className="font-medium text-primary-900">{e.jobTitle || '—'}</p>
              <p className="text-sm text-neutral-600">{e.companyName || '—'}</p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                <span>{e.industry || '—'}</span>
                <span>{e.employmentType}</span>
                <span className="tabular-nums">
                  {formatDateRange(e.startDate, e.isCurrentJob ? 'Present' : (e.endDate || ''))}
                  {' · '}
                  {yearsBetween(e.startDate, e.isCurrentJob ? 'Present' : (e.endDate || ''))} yrs
                </span>
                {e.isCurrentJob && <span className="text-primary-600">Current job</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EducationTab({ formData }: { formData: ApplicationFormData | null }) {
  const entries = formData?.education?.filter(
    (e) => e.institution?.trim() || e.grade?.trim() || (e.discipline ?? '').trim() || e.level
  ) ?? [];
  const levelLabel = (level: string) =>
    level.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500">No education details provided.</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((e, i) => (
            <li key={i} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
              <p className="font-medium text-primary-900">{levelLabel(e.level)}</p>
              <p className="text-sm text-neutral-600">{e.institution || '—'}</p>
              {e.grade && (
                <p className="text-sm text-neutral-600 mt-0.5">Grade: {e.grade}</p>
              )}
              {(e.discipline ?? '').trim() && (
                <p className="text-sm text-neutral-600 mt-0.5">Discipline: {e.discipline}</p>
              )}
              {e.certificatePath && (
                <div className="mt-2">
                  <a
                    href={e.certificatePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    <FileText className="w-4 h-4" />
                    View certificate
                  </a>
                  <div className="mt-2 rounded border border-neutral-200 bg-white overflow-hidden min-h-[200px] max-h-[320px]">
                    <iframe
                      title={`Certificate ${e.level}`}
                      src={e.certificatePath}
                      className="w-full h-[280px] border-0"
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CertificationsTab({ formData }: { formData: ApplicationFormData | null }) {
  const list = formData?.professionalCertificationsList ?? [];
  const memberships = formData?.professionalMemberships ?? [];
  const legacyText = formData?.professionalCertifications?.trim();
  const legacyPath = formData?.professionalCertificationsPath?.trim();
  const hasList = list.length > 0;
  const hasMemberships = memberships.length > 0;
  const hasLegacy = legacyText || legacyPath;
  const hasAny = hasList || hasMemberships || hasLegacy;
  return (
    <div className="space-y-4">
      {!hasAny ? (
        <p className="text-sm text-neutral-500">No professional certifications or memberships provided.</p>
      ) : (
        <>
          {list.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Professional certifications</h3>
              <ul className="space-y-3">
                {list.map((c, i) => (
                  <li key={i} className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                    <p className="font-medium text-neutral-800">{c.name}</p>
                    {c.certificatePath && (
                      <a
                        href={c.certificatePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline mt-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View certificate
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {memberships.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Professional memberships</h3>
              <ul className="space-y-3">
                {memberships.map((m, i) => (
                  <li key={i} className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                    <p className="font-medium text-neutral-800">{m.name || '—'}</p>
                    <p className="text-sm text-neutral-600">Membership no.: {m.membershipNo || '—'}</p>
                    {m.certificatePath && (
                      <a
                        href={m.certificatePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline mt-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View certificate
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasLegacy && (
            <>
              {legacyText && (
                <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Certifications (legacy)</h3>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">{legacyText}</p>
                </div>
              )}
              {legacyPath && (
                <div>
                  <a
                    href={legacyPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View proof document
                  </a>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

const EDUCATION_LEVEL_OPTIONS = [
  { value: '', label: 'All education levels' },
  { value: 'high_school', label: 'High School' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'masters', label: 'Masters' },
  { value: 'phd', label: 'PhD / Doctorate' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'All employment types' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
];

const STATUS_OPTIONS: { value: 'all' | ApplicationStatus; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
];

type ClientOption = { id: string; name: string };
type JobOption = { id: string; title: string; company: string };

export default function DashboardApplicationsPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [homeCountyFilter, setHomeCountyFilter] = useState('');
  const [educationLevelFilter, setEducationLevelFilter] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [certificateFilter, setCertificateFilter] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(
    null
  );
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(
    null
  );
  const [applicantDetailTab, setApplicantDetailTab] = useState<ApplicantDetailTab>('general');
  const [notesDraft, setNotesDraft] = useState('');
  const [pdfZoom, setPdfZoom] = useState(100);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/jobs').then((r) => r.json()),
    ]).then(([clientsData, jobsData]) => {
      if (!cancelled && Array.isArray(clientsData)) {
        setClients(clientsData.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      }
      if (!cancelled && Array.isArray(jobsData)) {
        setJobs(
          jobsData.map((j: { id: string; title: string; company: string }) => ({
            id: j.id,
            title: j.title,
            company: j.company,
          }))
        );
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (jobFilter.trim()) params.set('jobId', jobFilter.trim());
    if (clientFilter.trim()) params.set('clientId', clientFilter.trim());
    if (nationalityFilter.trim()) params.set('nationality', nationalityFilter.trim());
    if (homeCountyFilter.trim()) params.set('homeCounty', homeCountyFilter.trim());
    if (educationLevelFilter.trim()) params.set('educationLevel', educationLevelFilter.trim());
    if (disciplineFilter.trim()) params.set('discipline', disciplineFilter.trim());
    if (certificateFilter.trim()) params.set('certificate', certificateFilter.trim());
    if (membershipFilter.trim()) params.set('membership', membershipFilter.trim());
    if (employmentTypeFilter.trim()) params.set('employmentType', employmentTypeFilter.trim());
    fetch(`/api/applications?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setApplications(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load applications.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [
    statusFilter,
    jobFilter,
    clientFilter,
    nationalityFilter,
    homeCountyFilter,
    educationLevelFilter,
    disciplineFilter,
    certificateFilter,
    membershipFilter,
    employmentTypeFilter,
  ]);

  useEffect(() => {
    if (selectedApp) setApplicantDetailTab('general');
  }, [selectedApp?.id]);

  useEffect(() => {
    setNotesDraft(selectedApp?.notes ?? '');
  }, [selectedApp?.id, selectedApp?.notes]);

  const saveNotesIfDirty = async () => {
    if (!selectedApp) return;
    const current = selectedApp.notes ?? '';
    if (notesDraft === current) return;
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, notes: updated.notes } : a))
      );
      setSelectedApp((prev) =>
        prev && prev.id === selectedApp.id ? { ...prev, notes: updated.notes } : prev
      );
    } catch {
      // keep draft on error
    }
  };

  const allApplications = applications;

  const hasActiveFilters =
    statusFilter !== 'all' ||
    !!jobFilter.trim() ||
    !!clientFilter.trim() ||
    !!nationalityFilter.trim() ||
    !!homeCountyFilter.trim() ||
    !!educationLevelFilter.trim() ||
    !!disciplineFilter.trim() ||
    !!certificateFilter.trim() ||
    !!membershipFilter.trim() ||
    !!employmentTypeFilter.trim();

  const clearFilters = () => {
    setStatusFilter('all');
    setJobFilter('');
    setClientFilter('');
    setNationalityFilter('');
    setHomeCountyFilter('');
    setEducationLevelFilter('');
    setDisciplineFilter('');
    setCertificateFilter('');
    setMembershipFilter('');
    setEmploymentTypeFilter('');
  };

  const exportParams = useMemo(
    () =>
      new URLSearchParams({
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(jobFilter.trim() && { jobId: jobFilter.trim() }),
        ...(clientFilter.trim() && { clientId: clientFilter.trim() }),
        ...(nationalityFilter.trim() && { nationality: nationalityFilter.trim() }),
        ...(homeCountyFilter.trim() && { homeCounty: homeCountyFilter.trim() }),
        ...(educationLevelFilter.trim() && { educationLevel: educationLevelFilter.trim() }),
        ...(disciplineFilter.trim() && { discipline: disciplineFilter.trim() }),
        ...(certificateFilter.trim() && { certificate: certificateFilter.trim() }),
        ...(membershipFilter.trim() && { membership: membershipFilter.trim() }),
        ...(employmentTypeFilter.trim() && { employmentType: employmentTypeFilter.trim() }),
      }).toString(),
    [
      statusFilter,
      jobFilter,
      clientFilter,
      nationalityFilter,
      homeCountyFilter,
      educationLevelFilter,
      disciplineFilter,
      certificateFilter,
      membershipFilter,
      employmentTypeFilter,
    ]
  );

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return allApplications;
    const q = searchQuery.toLowerCase();
    return allApplications.filter(
      (a) =>
        `${a.candidate.firstName} ${a.candidate.lastName}`.toLowerCase().includes(q) ||
        a.candidate.email.toLowerCase().includes(q) ||
        a.job.title.toLowerCase().includes(q)
    );
  }, [allApplications, searchQuery]);

  const stats = useMemo(
    () => ({
      total: allApplications.length,
      pending: allApplications.filter((a) => a.status === 'pending').length,
      shortlisted: allApplications.filter((a) => a.status === 'shortlisted')
        .length,
      hired: allApplications.filter((a) => a.status === 'hired').length,
    }),
    [allApplications]
  );

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    setStatusDropdownOpen(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: updated.status } : a))
      );
      setSelectedApp((prev) =>
        prev && prev.id === applicationId
          ? { ...prev, status: newStatus }
          : prev
      );
    } catch (_e) {
      // keep UI state
    }
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Applications
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Review and manage job applications. Update status to notify
            applicants via email.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 opacity-80 shrink-0" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">Shortlisted</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                {stats.shortlisted}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 truncate">Hired</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.hired}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
        {/* Row 1: Search + Application filters + Actions */}
        <div className="p-4 border-b border-neutral-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Search &amp; application
          </p>
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center flex-wrap">
            <div className="flex-1 relative min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, email, or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                aria-label="Search applications"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[120px] text-sm"
                aria-label="Status"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[160px] max-w-[240px] text-sm truncate"
                aria-label="Job"
              >
                <option value="">All jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} · {j.company}
                  </option>
                ))}
              </select>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[130px] text-sm"
                aria-label="Client"
              >
                <option value="">All clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 lg:ml-auto shrink-0">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 text-sm font-medium transition-colors"
                >
                  Clear filters
                </button>
              )}
              <a
                href={exportParams ? `/api/applications/export?${exportParams}` : '/api/applications/export'}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary-200 bg-primary-50 text-primary-800 hover:bg-primary-100 text-sm font-medium transition-colors"
                download
                title="Export applications (current filters)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export
              </a>
            </div>
          </div>
        </div>

        {/* Row 2: Candidate & qualifications (education + certs + memberships + location + employment) */}
        <div className="p-4 bg-neutral-50/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Candidate &amp; qualifications
          </p>
          <p className="text-xs text-neutral-500 mb-3">
            Match job requirements: e.g. Education = Masters + Nursing, Certificate = BioHacking, Membership = KPMDU (combine with Status/Job/Client above).
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={educationLevelFilter}
              onChange={(e) => setEducationLevelFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[150px] text-sm"
              aria-label="Education level"
              title="Education level (e.g. Masters)"
            >
              {EDUCATION_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              placeholder="Discipline (e.g. Nursing)"
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[140px] text-sm"
              aria-label="Education discipline"
            />
            <input
              type="text"
              value={certificateFilter}
              onChange={(e) => setCertificateFilter(e.target.value)}
              placeholder="Certificate (e.g. BioHacking)"
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[160px] text-sm"
              aria-label="Professional certificate name"
            />
            <input
              type="text"
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              placeholder="Membership (e.g. KPMDU)"
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[140px] text-sm"
              aria-label="Professional membership name"
            />
            <input
              type="text"
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              placeholder="Nationality"
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[120px] text-sm"
              aria-label="Nationality"
            />
            <input
              type="text"
              value={homeCountyFilter}
              onChange={(e) => setHomeCountyFilter(e.target.value)}
              placeholder="Home county"
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[120px] text-sm"
              aria-label="Home county"
            />
            <select
              value={employmentTypeFilter}
              onChange={(e) => setEmploymentTypeFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[140px] text-sm"
              aria-label="Employment type"
            >
              {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          <p className="text-neutral-600">Loading applications...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600">
            No applications match your filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-5 py-3">
                    Candidate
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-5 py-3">
                    Job
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-5 py-3">
                    Client
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-5 py-3">
                    Applied
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
              {filteredApplications.map((app) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-neutral-50/70 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-semibold text-sm">
                          {app.candidate.firstName[0]}
                          {app.candidate.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-primary-900 text-sm">
                          {app.candidate.firstName} {app.candidate.lastName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {app.candidate.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-primary-900 text-sm">
                        {app.job.title}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {app.job.company} · {app.job.location}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-neutral-600 text-sm">
                    {app.job.clientName ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-neutral-600 text-sm tabular-nums">
                    {formatDate(app.appliedDate)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setStatusDropdownOpen(
                            statusDropdownOpen === app.id ? null : app.id
                          )
                        }
                        className="inline-flex items-center gap-1"
                      >
                        <StatusBadge status={app.status} />
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </button>
                      {statusDropdownOpen === app.id && (
                        <div className="absolute left-0 top-full mt-1 py-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                          {(
                            STATUS_OPTIONS.filter(
                              (o) => o.value !== 'all'
                            ) as { value: ApplicationStatus; label: string }[]
                          ).map((o) => (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() =>
                                handleStatusChange(app.id, o.value)
                              }
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {selectedApp && (() => {
        const currentIndex = filteredApplications.findIndex((a) => a.id === selectedApp.id);
        const total = filteredApplications.length;
        const hasPrev = currentIndex > 0;
        const hasNext = currentIndex >= 0 && currentIndex < total - 1;
        const prevApp = hasPrev ? filteredApplications[currentIndex - 1] : null;
        const nextApp = hasNext ? filteredApplications[currentIndex + 1] : null;
        return (
        <>
          <div
            className="fixed inset-0 bg-neutral-900/20 z-40"
            onClick={() => setSelectedApp(null)}
            aria-hidden
          />
          <div
            className="fixed right-0 top-0 bottom-0 w-[66.666vw] min-w-[24rem] max-w-[56rem] bg-white border-l border-neutral-200 shadow-sm z-50 flex flex-col rounded-l-xl"
          >
            <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 rounded-tl-xl">
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-primary-900 truncate min-w-0">
                  Application details
                </h2>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      await saveNotesIfDirty();
                      if (prevApp) setSelectedApp(prevApp);
                    }}
                    disabled={!hasPrev}
                    className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-primary-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Previous candidate"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-neutral-500 tabular-nums min-w-[4rem] text-center">
                    {currentIndex + 1} of {total}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await saveNotesIfDirty();
                      if (nextApp) setSelectedApp(nextApp);
                    }}
                    disabled={!hasNext}
                    className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-primary-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Next candidate"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await saveNotesIfDirty();
                      setSelectedApp(null);
                    }}
                    className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex border-t border-neutral-100">
                {APPLICANT_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={async () => {
                      if (applicantDetailTab === 'general') await saveNotesIfDirty();
                      setApplicantDetailTab(id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-medium transition-colors border-b-2 ${
                      applicantDetailTab === id
                        ? 'border-transparent text-neutral-900'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {applicantDetailTab === 'general' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                      Candidate
                    </h3>
                    <p className="text-xl font-semibold text-primary-900">
                      {selectedApp.candidate.firstName}{' '}
                      {selectedApp.candidate.lastName}
                    </p>
                    <div className="mt-2 space-y-1 text-sm text-neutral-600">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                        {selectedApp.candidate.email}
                      </p>
                      {selectedApp.candidate.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                          {selectedApp.candidate.phone}
                        </p>
                      )}
                      {selectedApp.candidate.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                          {selectedApp.candidate.location}
                        </p>
                      )}
                      {selectedApp.candidate.nationality && (
                        <p>Nationality: {selectedApp.candidate.nationality}</p>
                      )}
                      {selectedApp.candidate.homeCounty && (
                        <p>Home county: {selectedApp.candidate.homeCounty}</p>
                      )}
                      {selectedApp.formData?.gender && (
                        <p>Gender: {selectedApp.formData.gender}</p>
                      )}
                      <p>
                        {selectedApp.candidate.experience} years experience
                        {selectedApp.candidate.education &&
                          ` · ${selectedApp.candidate.education}`}
                      </p>
                      {selectedApp.salaryExpectations && (
                        <p>
                          <span className="font-medium text-neutral-500">Minimum expected salary:</span>{' '}
                          {selectedApp.salaryExpectations}
                        </p>
                      )}
                    </div>
                  </div>

                  {(selectedApp.candidate.resumePath || selectedApp.resumePath) && (
                    <div className="pt-4 border-t border-neutral-100">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
                          Resume
                        </h3>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPdfZoom((z) => Math.max(50, z - 25))}
                            className="p-1.5 rounded-md text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-colors"
                            title="Zoom out"
                            aria-label="Zoom out"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-neutral-500 min-w-[2.5rem] text-center tabular-nums">
                            {pdfZoom}%
                          </span>
                          <button
                            type="button"
                            onClick={() => setPdfZoom((z) => Math.min(200, z + 25))}
                            className="p-1.5 rounded-md text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-colors"
                            title="Zoom in"
                            aria-label="Zoom in"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="rounded-lg border border-neutral-200 bg-neutral-50 overflow-auto min-h-[280px] h-[45vh] max-h-[380px]">
                        <div
                          className="origin-top-left"
                          style={{
                            transform: `scale(${pdfZoom / 100})`,
                            width: `${(100 * 100) / pdfZoom}%`,
                            height: `${(360 * 100) / pdfZoom}px`,
                            minHeight: `${(280 * 100) / pdfZoom}px`,
                          }}
                        >
                          <iframe
                            title="Resume preview"
                            src={(selectedApp.resumePath || selectedApp.candidate.resumePath) || ''}
                            className="w-full border-0 min-h-[280px] h-[360px]"
                          />
                        </div>
                      </div>
                      <a
                        href={(selectedApp.resumePath || selectedApp.candidate.resumePath) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-primary-600 hover:text-primary-800"
                      >
                        <FileText className="w-4 h-4" />
                        View resume in new tab
                      </a>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                      Minimum qualifications for this role
                    </h3>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li>
                        <span className="font-medium text-neutral-500">Experience:</span>{' '}
                        {selectedApp.job.minYearsExperience != null
                          ? `Minimum ${selectedApp.job.minYearsExperience} years`
                          : 'Not specified'}
                      </li>
                      <li>
                        <span className="font-medium text-neutral-500">Education:</span>{' '}
                        {selectedApp.job.educationLevel?.trim() || selectedApp.job.educationQualification?.trim()
                          ? [selectedApp.job.educationLevel, selectedApp.job.educationQualification].filter(Boolean).join(' · ')
                          : 'Not specified'}
                      </li>
                      <li>
                        <span className="font-medium text-neutral-500">Certifications:</span>{' '}
                        {selectedApp.job.requiredCertifications?.trim() || 'Not specified'}
                      </li>
                    </ul>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-3 pt-3 border-t border-neutral-100">
                      <Building2 className="w-4 h-4 shrink-0" />
                      Applied to {selectedApp.job.title} · {selectedApp.job.company}
                    </p>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      Applied {formatDate(selectedApp.appliedDate)}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={selectedApp.status} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                      Cover letter
                    </h3>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-4 rounded-lg min-h-[4rem]">
                      {selectedApp.coverLetter?.trim() || (
                        <span className="text-neutral-400 italic">No cover letter provided.</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                      Internal notes
                    </h3>
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Add internal notes (saves when you switch tab or candidate)..."
                      rows={4}
                      className="w-full text-sm text-neutral-700 bg-amber-50/50 p-4 rounded-lg border border-amber-100 focus:ring-2 focus:ring-amber-200 focus:border-amber-300 resize-y min-h-[6rem]"
                    />
                  </div>

                  <div className="pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-3">
                      Update status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(STATUS_OPTIONS.filter(
                        (o) => o.value !== 'all'
                      ) as { value: ApplicationStatus; label: string }[]).map(
                        (o) => (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => {
                              handleStatusChange(selectedApp.id, o.value);
                              setSelectedApp({
                                ...selectedApp,
                                status: o.value,
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              selectedApp.status === o.value
                                ? 'bg-primary-900 text-white'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            {o.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {applicantDetailTab === 'experience' && (
                <WorkExperienceTab formData={selectedApp.formData} />
              )}

              {applicantDetailTab === 'education' && (
                <EducationTab formData={selectedApp.formData} />
              )}

              {applicantDetailTab === 'certifications' && (
                <CertificationsTab formData={selectedApp.formData} />
              )}
            </div>
          </div>
        </>
        );
      })()}
    </div>
  );
}
