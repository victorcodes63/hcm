'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Building2,
  Search,
  Filter,
  ChevronRight,
  LayoutList,
  LayoutGrid,
  SlidersHorizontal,
  X,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  Banknote,
  Tag,
} from 'lucide-react';
import { JobListing, JobSearchFilters } from '@/types/ats';
import { useATS } from '@/lib/ats-api';
import { getCategoryIcon } from '@/lib/job-category-icons';

interface DynamicJobListingsProps {
  initialFilters?: JobSearchFilters;
  showSearch?: boolean;
  limit?: number;
}

const DEFAULT_CATEGORY_OPTIONS = [
  'Executive',
  'Sales & Marketing',
  'Education & Training',
  'Technology',
  'Operations',
  'Finance & Accounting',
];

const TYPE_OPTIONS = ['Full Time', 'Part Time', 'Contract', 'Remote'];
const TIME_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
];

const CATEGORY_COLORS: Record<string, string> = {
  executive: 'bg-slate-100 text-slate-700',
  'sales & marketing': 'bg-blue-100 text-blue-700',
  'education & training': 'bg-indigo-100 text-indigo-700',
  technology: 'bg-violet-100 text-violet-700',
  operations: 'bg-emerald-100 text-emerald-700',
  'finance & accounting': 'bg-amber-100 text-amber-700',
};

const TYPE_COLORS: Record<string, string> = {
  'Full Time': 'bg-green-50 text-green-700 border-green-200',
  'Part Time': 'bg-blue-50 text-blue-700 border-blue-200',
  Contract: 'bg-orange-50 text-orange-700 border-orange-200',
  Remote: 'bg-purple-50 text-purple-700 border-purple-200',
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category.toLowerCase()] ?? 'bg-primary-100 text-primary-700';
}

function getTypeColor(type: string) {
  return TYPE_COLORS[type] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isNew(dateString: string) {
  return Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000) <= 3;
}

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-2xl border border-primary-100 p-5">
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-primary-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-primary-100 rounded w-2/3" />
        <div className="h-4 bg-primary-50 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-primary-50 rounded-full" />
          <div className="h-6 w-16 bg-primary-50 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export default function DynamicJobListings({
  initialFilters = {},
  showSearch = true,
  limit,
}: DynamicJobListingsProps) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState(initialFilters.keyword || '');
  const [selectedLocation, setSelectedLocation] = useState(initialFilters.location || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<JobSearchFilters>(initialFilters);

  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORY_OPTIONS);
  const { getJobListings } = useATS();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const jobData = await getJobListings({
        ...appliedFilters,
        type: selectedType || undefined,
        postedWithin: selectedTime || undefined,
      });
      setJobs(limit ? jobData.slice(0, limit) : jobData);
    } catch {
      setJobs([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [getJobListings, appliedFilters, selectedType, selectedTime, limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setAppliedFilters(initialFilters);
    setSearchKeyword(initialFilters.keyword || '');
    setSelectedLocation(initialFilters.location || '');
    setSelectedCategory(initialFilters.category || '');
  }, [initialFilters]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/jobs/categories')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          const merged = [...new Set([...DEFAULT_CATEGORY_OPTIONS, ...data])]
            .filter(Boolean)
            .sort((a: unknown, b: unknown) => String(a).localeCompare(String(b)));
          setCategoryOptions(merged as string[]);
        }
      })
      .catch(() => { if (!cancelled) setCategoryOptions(DEFAULT_CATEGORY_OPTIONS); });
    return () => { cancelled = true; };
  }, []);

  const handleSearch = () => {
    setAppliedFilters({
      keyword: searchKeyword,
      location: selectedLocation,
      category: selectedCategory,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilter = (key: 'keyword' | 'location' | 'category' | 'type' | 'time') => {
    if (key === 'keyword') { setSearchKeyword(''); setAppliedFilters((p) => ({ ...p, keyword: '' })); }
    if (key === 'location') { setSelectedLocation(''); setAppliedFilters((p) => ({ ...p, location: '' })); }
    if (key === 'category') { setSelectedCategory(''); setAppliedFilters((p) => ({ ...p, category: '' })); }
    if (key === 'type') setSelectedType('');
    if (key === 'time') setSelectedTime('');
  };

  const activeChips = [
    appliedFilters.keyword && { key: 'keyword' as const, label: appliedFilters.keyword },
    appliedFilters.location && { key: 'location' as const, label: appliedFilters.location },
    appliedFilters.category && { key: 'category' as const, label: appliedFilters.category },
    selectedType && { key: 'type' as const, label: selectedType },
    selectedTime && { key: 'time' as const, label: TIME_OPTIONS.find((t) => t.value === selectedTime)?.label || selectedTime },
  ].filter(Boolean) as { key: 'keyword' | 'location' | 'category' | 'type' | 'time'; label: string }[];

  return (
    <div className="w-full">
      {showSearch && (
        <div className="mb-6">
          {/* Main search bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4.5 h-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Job title, company, or keywords…"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-primary-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base text-neutral-800 placeholder-neutral-400 transition"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-6 py-3.5 bg-primary-900 text-white rounded-xl font-semibold text-base hover:bg-primary-800 active:scale-95 transition-all shadow-sm shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-3.5 rounded-xl border text-base font-medium transition-all shadow-sm shrink-0 ${
                filtersOpen || activeChips.length > 0
                  ? 'bg-primary-100 border-primary-300 text-primary-700'
                  : 'bg-white border-primary-100 text-neutral-600 hover:bg-primary-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeChips.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-900 text-white text-xs flex items-center justify-center font-bold">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-primary-100 mb-3"
              >
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 border border-primary-100 rounded-lg bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none text-neutral-700"
                  >
                    <option value="">All locations</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 border border-primary-100 rounded-lg bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none text-neutral-700"
                  >
                    <option value="">All categories</option>
                    {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 border border-primary-100 rounded-lg bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none text-neutral-700"
                  >
                    <option value="">All types</option>
                    {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 border border-primary-100 rounded-lg bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none text-neutral-700"
                  >
                    {TIME_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => clearFilter(chip.key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 text-sm font-medium hover:bg-primary-200 transition-colors"
                >
                  {chip.label}
                  <X className="w-3 h-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword(''); setSelectedLocation(''); setSelectedCategory('');
                  setSelectedType(''); setSelectedTime('');
                  setAppliedFilters({});
                }}
                className="text-sm text-neutral-500 hover:text-neutral-700 underline underline-offset-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results count + view toggle */}
          <div className="flex items-center justify-between">
            <p className="text-base text-neutral-500">
              {loading ? 'Loading…' : (
                <span>
                  <span className="font-semibold text-neutral-800">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''} found
                </span>
              )}
            </p>
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white text-primary-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                aria-label="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white text-primary-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className={view === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-3'}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error state */}
      {!loading && fetchError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-neutral-800 mb-1">Couldn't load jobs</h3>
          <p className="text-sm text-neutral-500 mb-4">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={fetchJobs}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-neutral-300" />
          </div>
          <h3 className="text-base font-semibold text-neutral-800 mb-1">No jobs found</h3>
          <p className="text-sm text-neutral-500">Try adjusting your search or filters, or check back soon.</p>
        </div>
      )}

      {/* Job listings */}
      {!loading && !fetchError && jobs.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={view === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-3'}
          >
            {jobs.map((job, index) => {
              const Icon = getCategoryIcon(job.category);
              const categoryColor = getCategoryColor(job.category);
              const typeColor = getTypeColor(job.type);
              const jobIsNew = isNew(job.postedDate);

              if (view === 'grid') {
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <Link
                      href={`/careers/apply/${job.slug ?? job.id}`}
                      className="group block bg-white rounded-2xl border border-primary-100 hover:border-primary-300 hover:shadow-md transition-all duration-200 p-5 h-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                          <Icon className="w-5 h-5 text-primary-500 group-hover:text-primary-700 transition-colors" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {jobIsNew && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-600 border border-secondary-200">
                              New
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-primary-900 leading-snug mb-1.5 group-hover:text-primary-700 transition-colors line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-sm text-neutral-500 mb-3 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 shrink-0" />
                        {job.company}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor}`}>
                          {job.category}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColor}`}>
                          {job.type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-neutral-400 border-t border-primary-50 pt-3">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatDate(job.postedDate)}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              }

              // List view
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                >
                    <Link
                      href={`/careers/apply/${job.slug ?? job.id}`}
                      className="group flex items-center gap-4 bg-white rounded-2xl border border-primary-100 hover:border-primary-300 hover:shadow-md transition-all duration-200 p-5 sm:p-6"
                    >
                    {/* Icon */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 group-hover:text-primary-700 transition-colors" />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-primary-900 group-hover:text-primary-700 transition-colors leading-snug">
                          {job.title}
                        </h3>
                        {jobIsNew && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary-50 text-secondary-600 border border-secondary-200 shrink-0">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-neutral-500 mb-2.5 flex items-center gap-1.5 truncate">
                        <Building2 className="w-4 h-4 shrink-0" />
                        {job.company}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor}`}>
                          {job.category}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColor}`}>
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-neutral-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                            <Banknote className="w-3.5 h-3.5" />
                            {job.salary.currency} {job.salary.min.toLocaleString()}–{job.salary.max.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
                      <span className="text-sm text-neutral-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(job.postedDate)}
                      </span>
                      {job.applicationDeadline && (
                        <span className="text-sm text-amber-600 font-medium whitespace-nowrap">
                          Closes {new Date(job.applicationDeadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
