'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobApplicationForm from '@/components/ats/JobApplicationForm';
import { JobListing } from '@/types/ats';
import { useATS } from '@/lib/ats-api';
import {
  ArrowLeft, MapPin, Clock, Building2, CheckCircle,
  Link2, Linkedin, Twitter, Check,
} from 'lucide-react';
import { prepareJobItemContent, sanitizeAndScopeJobSection } from '@/lib/sanitize-html';

function hasSectionContent(raw: unknown): boolean {
  if (typeof raw === 'string') return raw.replace(/<[^>]+>/g, '').trim().length > 0;
  if (Array.isArray(raw)) return raw.some((x) => typeof x === 'string' && x.replace(/<[^>]+>/g, '').trim().length > 0);
  return false;
}
import Link from 'next/link';

export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params.id as string;
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const { getJobById } = useATS();

  useEffect(() => {
    const fetchJob = async () => {
      if (!slugOrId) return;

      setLoading(true);
      try {
        const jobData = await getJobById(slugOrId);
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slugOrId, getJobById]);

  // Redirect to canonical slug URL when user landed on CUID (old or shared link)
  useEffect(() => {
    if (!job?.slug || slugOrId === job.slug) return;
    router.replace(`/careers/apply/${job.slug}`, { scroll: false });
  }, [job?.slug, slugOrId, router]);

  const handleApplicationSuccess = () => {
    setApplicationSubmitted(true);
    setShowApplicationForm(false);
  };

  const [copied, setCopied] = useState(false);

  const isExpired =
    !!job?.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = job ? `${job.title} at ${job.company}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the URL from address bar
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <Navbar />
        <div className="pt-28 pb-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="max-w-2xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-neutral-200 rounded w-32" />
                <div className="bg-white rounded-xl border border-neutral-200 p-8">
                  <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-neutral-100 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-neutral-100 rounded w-2/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-primary-900 mb-4">Job Not Found</h1>
              <p className="text-neutral-600 mb-8">
                The job you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Job Board
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <Navbar />
      
      {/* Job Header + Layout */}
      <section className="pt-28 pb-16 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Board
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Main content - job details */}
            <div className="flex-1 min-w-0 lg:max-w-[65%]">
              <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-3">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-neutral-400 shrink-0" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                      {job.type}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800">
                      {job.category}
                    </span>
                  </div>
                  {job.salary && (
                    <p className="mt-4 pt-4 border-t border-neutral-100 text-sm text-neutral-600">
                      <span className="font-medium text-neutral-700">Salary:</span>{' '}
                      {job.salary.currency} {job.salary.min.toLocaleString()} – {job.salary.max.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Details - only show sections that have content */}
              <div className="mt-8 space-y-8">
                {job.description?.trim() && (
                  <div>
                    <h2 className="text-lg font-semibold text-primary-900 mb-3">Job Description</h2>
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>
                )}

                {hasSectionContent(job.requirements) && (
                  <div>
                    <h2 className="text-lg font-semibold text-primary-900 mb-3">Requirements</h2>
                    <div
                      className="prose prose-sm max-w-none text-neutral-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:my-1 [&_strong]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_em]:italic [&_ul_ul]:ml-6 [&_ol_ul]:ml-6"
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const raw = job.requirements;
                          if (typeof raw === 'string' && raw.trim()) return sanitizeAndScopeJobSection(raw, 'requirements');
                          const arr = Array.isArray(raw) ? raw.filter((r): r is string => typeof r === 'string') : [];
                          return arr.length > 0
                            ? sanitizeAndScopeJobSection(`<ul>${arr.map((r) => `<li>${prepareJobItemContent(r)}</li>`).join('')}</ul>`, 'requirements')
                            : '';
                        })(),
                      }}
                    />
                  </div>
                )}

                {hasSectionContent(job.responsibilities) && (
                  <div>
                    <h2 className="text-lg font-semibold text-primary-900 mb-3">Key Responsibilities</h2>
                    <div
                      className="prose prose-sm max-w-none text-neutral-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:my-1 [&_strong]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_em]:italic [&_ul_ul]:ml-6 [&_ol_ul]:ml-6"
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const raw = job.responsibilities;
                          if (typeof raw === 'string' && raw.trim()) return sanitizeAndScopeJobSection(raw, 'responsibilities');
                          const arr = Array.isArray(raw) ? raw.filter((r): r is string => typeof r === 'string') : [];
                          return arr.length > 0
                            ? sanitizeAndScopeJobSection(`<ul>${arr.map((r) => `<li>${prepareJobItemContent(r)}</li>`).join('')}</ul>`, 'responsibilities')
                            : '';
                        })(),
                      }}
                    />
                  </div>
                )}

                {hasSectionContent(job.benefits) && (() => {
                  const raw = job.benefits;
                  let html: string;
                  if (typeof raw === 'string' && raw.trim()) {
                    html = sanitizeAndScopeJobSection(raw, 'benefits');
                  } else if (Array.isArray(raw) && raw.filter((b): b is string => typeof b === 'string').length > 0) {
                    html = sanitizeAndScopeJobSection(`<ul>${(raw as string[]).map((b) => `<li>${prepareJobItemContent(b)}</li>`).join('')}</ul>`, 'benefits');
                  } else {
                    html = '';
                  }
                  return html ? (
                    <div>
                      <h2 className="text-lg font-semibold text-primary-900 mb-3">Benefits</h2>
                      <div
                        className="prose prose-sm max-w-none text-neutral-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:my-1 [&_strong]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_em]:italic [&_ul_ul]:ml-6 [&_ol_ul]:ml-6"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Sidebar — two symmetrical sticky cards */}
            <aside className="lg:w-[300px] shrink-0">
              <div className="lg:sticky lg:top-28 space-y-4">

                {/* Apply card */}
                <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
                    {isExpired ? 'Application closed' : 'Apply for this role'}
                  </p>
                  <p className="text-base font-semibold text-primary-900 mb-0.5 leading-snug">
                    {job.title}
                  </p>
                  <p className="text-sm text-neutral-500 mb-4">{job.company}</p>

                  {isExpired ? (
                    <>
                      <p className="text-sm text-neutral-500 mb-4">
                        This posting has closed. Browse current openings below.
                      </p>
                      <Link
                        href="/careers"
                        className="block w-full text-center px-6 py-3 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
                      >
                        Browse other jobs
                      </Link>
                    </>
                  ) : (
                    <>
                      {job.applicationDeadline && (
                        <p className="text-sm text-amber-700 font-medium mb-4">
                          Closes {new Date(job.applicationDeadline).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Nairobi' })}
                        </p>
                      )}
                      {applicationSubmitted ? (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium py-3">
                          <CheckCircle className="w-4 h-4" />
                          Application submitted
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowApplicationForm(true)}
                          className="w-full px-6 py-3 bg-primary-900 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 active:scale-95 transition-all"
                        >
                          Apply Now
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Share card */}
                <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
                    Share this role
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Copy link */}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-100 hover:border-primary-300 transition-all group"
                      title="Copy link"
                    >
                      {copied
                        ? <Check className="w-5 h-5 text-emerald-600" />
                        : <Link2 className="w-5 h-5 text-primary-600 group-hover:text-primary-800" />
                      }
                      <span className="text-xs text-neutral-500 group-hover:text-neutral-700">
                        {copied ? 'Copied!' : 'Copy link'}
                      </span>
                    </button>

                    {/* LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary-50 hover:bg-[#0A66C2]/10 border border-primary-100 hover:border-[#0A66C2]/30 transition-all group"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                      <span className="text-xs text-neutral-500 group-hover:text-neutral-700">LinkedIn</span>
                    </a>

                    {/* X / Twitter */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle} — apply now`)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary-50 hover:bg-neutral-100 border border-primary-100 hover:border-neutral-300 transition-all group"
                      title="Share on X"
                    >
                      <Twitter className="w-5 h-5 text-neutral-800" />
                      <span className="text-xs text-neutral-500 group-hover:text-neutral-700">X / Twitter</span>
                    </a>
                  </div>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Application Success Message */}
      {applicationSubmitted && (
        <section className="py-10 sm:py-12 bg-neutral-50">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="max-w-xl mx-auto text-center bg-white rounded-xl p-8 border border-neutral-200 shadow-sm">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Application submitted</h3>
              <p className="text-neutral-600 mb-6 text-sm">
                Thank you for applying to {job.title} at {job.company}. We&apos;ll review your application and get back to you soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/careers"
                  className="px-5 py-2.5 bg-primary-900 text-white text-sm font-semibold rounded-lg hover:bg-primary-800 transition-colors"
                >
                  Browse more jobs
                </Link>
                <Link
                  href="/"
                  className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Application Form Modal - only when not expired */}
      {showApplicationForm && !isExpired && (
        <JobApplicationForm
          job={job}
          onSuccess={handleApplicationSuccess}
          onClose={() => setShowApplicationForm(false)}
        />
      )}

      <Footer />
    </main>
  );
}
