import Link from 'next/link';
import { redirect } from 'next/navigation';

type CareersLoginPageProps = {
  searchParams?: {
    direct?: string | string[];
  };
};

export default function CareersLoginPage({ searchParams }: CareersLoginPageProps) {
  const direct = searchParams?.direct;
  const directFlag = Array.isArray(direct) ? direct[0] : direct;

  // Keep a visible handoff page by default; allow direct redirect when needed.
  if (directFlag === '1') {
    redirect('/dashboard/login');
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-neutral-900">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-secondary-700">Staff Login</h1>
        <p className="mt-3 text-sm text-neutral-600">
          This careers portal uses the central HRIS staff login.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/login"
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Continue to Login
          </Link>
          <Link
            href="/careers"
            className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Back to Careers
          </Link>
        </div>
      </div>
    </main>
  );
}
