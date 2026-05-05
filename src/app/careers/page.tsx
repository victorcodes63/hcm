import { ArrowRight, BriefcaseBusiness, CalendarClock, HeartPulse, ShieldCheck } from 'lucide-react';
import DynamicJobListings from '@/components/ats/DynamicJobListings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { brand } from '@/lib/brand';

type CareersPageProps = {
  searchParams?: Promise<{
    keyword?: string | string[];
  }>;
};

export default async function CareersPage({ searchParams }: CareersPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedKeywordRaw = params?.keyword;
  const selectedKeyword =
    typeof selectedKeywordRaw === 'string'
      ? selectedKeywordRaw
      : Array.isArray(selectedKeywordRaw)
        ? selectedKeywordRaw[0] || ''
        : '';

  return (
    <main className="min-h-screen bg-white text-neutral-700">
      <Navbar />

      <section className="border-b border-neutral-200 bg-white pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-14 md:px-8 md:py-16 xl:px-12">
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
            <div className="max-w-4xl space-y-6">
              <p className="text-sm font-medium text-primary-600">Careers · {brand.orgName}</p>
              <h1 className="text-3xl font-semibold text-ink md:text-5xl md:leading-tight">
                Join a modern workplace powered by an integrated HR platform
              </h1>
              <p className="max-w-3xl text-base leading-7 text-neutral-700">
                Explore open roles across departments. This demo showcases recruitment workflows — configure your
                employer name and branding via environment variables for your own organization.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a href="#job-openings" className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
                  View vacancies
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </a>
                <Link href="/" className="inline-flex items-center rounded-md border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                  Back to website
                </Link>
              </div>
            </div>
            <aside className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">Recruitment snapshot</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-700">
                <li className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-primary-600" strokeWidth={1.75} /> Single-workspace roles only</li>
                <li className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary-600" strokeWidth={1.75} /> Clear application deadlines</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-600" strokeWidth={1.75} /> Structured, fair hiring process</li>
              </ul>
            </aside>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border border-neutral-200 bg-white p-6">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                <HeartPulse className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="text-lg font-semibold text-ink">Patient-centred culture</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Join teams focused on safety, empathy, precision, and outcomes in every patient interaction.
              </p>
            </article>
            <article className="rounded-lg border border-neutral-200 bg-white p-6">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="text-lg font-semibold text-ink">Transparent process</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Applications move through screening, interview, and decision stages with clear communication.
              </p>
            </article>
            <article className="rounded-lg border border-neutral-200 bg-white p-6">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="text-lg font-semibold text-ink">Credential-focused hiring</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Clinical roles are assessed with strict licensing and compliance standards before onboarding.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="job-openings" className="bg-white py-10 md:py-12">
        <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8 xl:px-12">
          <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">Job board</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Current vacancies</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-500">
              Search by role, department, or location. Open any vacancy to review details and apply directly.
            </p>
          </div>
          <DynamicJobListings
            showSearch={true}
            initialFilters={selectedKeyword ? { keyword: selectedKeyword } : {}}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}

