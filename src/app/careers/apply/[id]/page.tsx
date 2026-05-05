'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobApplicationForm from '@/components/ats/JobApplicationForm';
import { JobListing } from '@/types/ats';
import { useATS } from '@/lib/ats-api';
import {
  ArrowLeft, MapPin, Clock, CheckCircle,
  Link2, Linkedin, Twitter, Check, BriefcaseBusiness, CalendarClock, ShieldCheck,
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
  const shareTitle = job ? `${job.title} at Stabex International` : '';

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
              <h1 className="text-3xl font-bold text-primary-900 mb-4">Role not found</h1>
              <p className="text-neutral-600 mb-8">
                The job you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to careers
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
      <section className="bg-white pt-28 pb-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <Link
            href="/careers"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to careers
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-8">
              <header className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">Open role</p>
                <h1 className="mt-2 text-3xl font-semibold text-primary-900 sm:text-4xl">{job.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600">
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-4 w-4 text-neutral-400" />
                    Stabex International
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    {job.type}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                    {job.category}
                  </span>
                  {job.salary && (
                    <span className="text-sm text-neutral-600">
                      {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                    </span>
                  )}
                </div>
              </header>

              {job.description?.trim() && (
                <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-primary-900">Role overview</h2>
                  <p className="mt-3 whitespace-pre-line text-neutral-700 leading-7">{job.description}</p>
                </section>
              )}

              {hasSectionContent(job.requirements) && (
                <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-primary-900">Requirements</h2>
                  <div
                    className="prose prose-sm mt-3 max-w-none text-neutral-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_p]:my-2"
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
                </section>
              )}

              {hasSectionContent(job.responsibilities) && (
                <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-primary-900">Responsibilities</h2>
                  <div
                    className="prose prose-sm mt-3 max-w-none text-neutral-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_p]:my-2"
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
                </section>
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
                  <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-primary-900">Benefits</h2>
                    <div
                      className="prose prose-sm mt-3 max-w-none text-neutral-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_p]:my-2"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </section>
                ) : null;
              })()}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">
                  {isExpired ? 'Applications closed' : 'Apply for this role'}
                </p>
                <p className="mt-2 text-base font-semibold text-primary-900">{job.title}</p>
                <p className="mt-1 text-sm text-neutral-500">Stabex International — East Africa</p>

                {job.applicationDeadline && (
                  <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-amber-700">
                    <CalendarClock className="h-4 w-4" />
                    Closes {new Date(job.applicationDeadline).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Nairobi' })}
                  </p>
                )}

                <div className="mt-4">
                  {isExpired ? (
                    <Link
                      href="/careers"
                      className="block w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                    >
                      View other vacancies
                    </Link>
                  ) : applicationSubmitted ? (
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      Application submitted
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(true)}
                      className="w-full rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
                    >
                      Apply now
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">Share role</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 hover:bg-neutral-100"
                    title="Copy link"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4 text-primary-700" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 hover:bg-neutral-100"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle} — apply now`)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 hover:bg-neutral-100"
                    title="Share on X"
                  >
                    <Twitter className="h-4 w-4 text-neutral-800" />
                    X
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">Why join us</p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-700" /> Structured and fair recruitment</li>
                  <li className="inline-flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary-700" /> Credential-first clinical standards</li>
                </ul>
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
                Thank you for applying to {job.title}. We&apos;ll review your application and get back to you soon.
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
