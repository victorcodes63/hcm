'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Clock, 
  Building2, 
  ChevronDown, 
  CheckCircle, 
  Star,
  ArrowRight,
  Search,
  Filter,
  Users,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { JobListing, JobSearchFilters } from '@/types/ats';
import { useATS } from '@/lib/ats-api';

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

const DynamicJobListings = ({ 
  initialFilters = {}, 
  showSearch = true, 
  limit 
}: DynamicJobListingsProps) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [filters, setFilters] = useState<JobSearchFilters>(initialFilters);
  const [searchKeyword, setSearchKeyword] = useState(initialFilters.keyword || '');
  const [selectedLocation, setSelectedLocation] = useState(initialFilters.location || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORY_OPTIONS);
  
  const { getJobListings } = useATS();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const currentFilters = {
        ...filters,
        keyword: searchKeyword,
        location: selectedLocation,
        category: selectedCategory,
      };
      const jobData = await getJobListings(currentFilters);
      const limitedJobs = limit ? jobData.slice(0, limit) : jobData;
      setJobs(limitedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [getJobListings, filters, searchKeyword, selectedLocation, selectedCategory, limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    // Keep component in sync when parent updates initial filters (e.g. category cards).
    setFilters(initialFilters);
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
            .sort((a, b) => String(a).localeCompare(String(b)));
          setCategoryOptions(merged as string[]);
        }
      })
      .catch(() => {
        if (!cancelled) setCategoryOptions(DEFAULT_CATEGORY_OPTIONS);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      keyword: searchKeyword,
      location: selectedLocation,
      category: selectedCategory,
    }));
  };

  const getJobIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'executive':
        return Users;
      case 'sales & marketing':
        return ArrowRight;
      case 'education & training':
        return BookOpen;
      case 'technology':
        return ShieldCheck;
      default:
        return Users;
    }
  };

  const getJobColors = (category: string) => {
    const colorMap: Record<string, { color: string; bgColor: string }> = {
      'executive': { color: 'from-slate-600 to-slate-700', bgColor: 'from-slate-100 to-gray-200' },
      'sales & marketing': { color: 'from-blue-600 to-blue-700', bgColor: 'from-blue-100 to-sky-200' },
      'education & training': { color: 'from-indigo-600 to-indigo-700', bgColor: 'from-indigo-100 to-blue-200' },
      'technology': { color: 'from-indigo-600 to-indigo-700', bgColor: 'from-indigo-100 to-blue-200' },
    };
    return colorMap[category.toLowerCase()] || { color: 'from-slate-600 to-slate-700', bgColor: 'from-slate-100 to-gray-200' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-amber-800 font-medium mb-2">Unable to load jobs</p>
        <p className="text-amber-700 text-sm mb-4">Please check your connection and try again.</p>
        <button
          type="button"
          onClick={() => fetchJobs()}
          className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search and Filters */}
      {showSearch && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search row: input + button on mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, keywords..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300 flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
            {/* Filters: full-width dropdowns on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-3">
              <div className="relative min-w-0">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                >
                  <option value="">All Locations</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Kisumu">Kisumu</option>
                  <option value="Nakuru">Nakuru</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div className="relative min-w-0">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No jobs found</h3>
            <p className="text-neutral-600">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        ) : (
          jobs.map((job, index) => {
            const Icon = getJobIcon(job.category);
            const colors = getJobColors(job.category);
            const isActive = activeJob === index;
            
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Job Header */}
                <motion.button
                  onClick={() => setActiveJob(isActive ? null : index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 sm:p-6 rounded-xl border-2 transition-all duration-500 ${
                    isActive 
                      ? `bg-gradient-to-r ${colors.bgColor} border-${colors.color.split('-')[1]}-300 shadow-lg` 
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br ${colors.color} rounded-lg flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-heading font-bold text-primary-900 leading-snug break-words">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-neutral-600">
                          <span className="flex items-center shrink-0">
                            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0" />
                            {job.company}
                          </span>
                          <span className="flex items-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0" />
                            {job.location}
                          </span>
                          <span className="flex items-center shrink-0">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0" />
                            {job.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {job.category}
                          </span>
                          {job.applicationDeadline && (
                            <span className="text-amber-700 text-xs sm:text-sm font-medium">
                              Apply by: {new Date(job.applicationDeadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {job.salary && (
                            <span className="text-green-600 text-xs sm:text-sm font-medium">
                              {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t border-neutral-100 sm:border-0 pt-2 sm:pt-0">
                      <span className="text-xs sm:text-sm text-neutral-500">{formatDate(job.postedDate)}</span>
                      <motion.div
                        animate={{ rotate: isActive ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-500" />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>

                {/* Job Details */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className={`bg-gradient-to-br ${colors.bgColor} rounded-b-xl p-4 sm:p-6 border-l-2 border-r-2 border-b-2 border-${colors.color.split('-')[1]}-300`}>
                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                          {/* Left Column - Job Description */}
                          <div>
                            <h4 className="text-lg font-semibold text-primary-900 mb-4">Job Description:</h4>
                            <p className="text-neutral-700 leading-relaxed mb-6">
                              {job.description}
                            </p>
                            
                            <h4 className="text-lg font-semibold text-primary-900 mb-3">Requirements:</h4>
                            <ul className="space-y-2 mb-6">
                              {job.requirements.map((req, reqIndex) => (
                                <motion.li
                                  key={reqIndex}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.4, delay: reqIndex * 0.1 }}
                                  className="flex items-start space-x-2"
                                >
                                  <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-neutral-700">{req}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Right Column - Responsibilities & Benefits */}
                          <div>
                            <h4 className="text-lg font-semibold text-primary-900 mb-3">Key Responsibilities:</h4>
                            <ul className="space-y-2 mb-6">
                              {job.responsibilities.map((resp, respIndex) => (
                                <motion.li
                                  key={respIndex}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.4, delay: respIndex * 0.1 }}
                                  className="flex items-start space-x-2"
                                >
                                  <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-neutral-700">{resp}</span>
                                </motion.li>
                              ))}
                            </ul>
                            
                            <h4 className="text-lg font-semibold text-primary-900 mb-3">Benefits:</h4>
                            <ul className="space-y-2 mb-6">
                              {job.benefits.map((benefit, benefitIndex) => (
                                <motion.li
                                  key={benefitIndex}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.4, delay: benefitIndex * 0.1 }}
                                  className="flex items-start space-x-2"
                                >
                                  <Star className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-neutral-700">{benefit}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Apply Button */}
                        <div className="mt-6 pt-6 border-t border-neutral-300">
                          <a
                            href={`/careers/apply/${job.id}`}
                            className="group inline-flex items-center bg-primary-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-all duration-300"
                          >
                            Apply for This Position
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DynamicJobListings;
