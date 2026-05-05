'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { usePublicBrand } from '@/components/BrandProvider';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getMetadataTitle } from '@/lib/brand';
import { DemoLoginCredentialsHint } from '@/components/DemoLoginCredentialsHint';

const STAFF_LOGIN_PATH = '/api/auth/login';
const hasMicrosoftOAuth = Boolean(process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID?.trim());
const hasGoogleOAuth = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#f25022" d="M1 1h9v9H1z" />
      <path fill="#00a4ef" d="M11 1h9v9h-9z" />
      <path fill="#7fba00" d="M1 11h9v9H1z" />
      <path fill="#ffb900" d="M11 11h9v9h-9z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function StaffLoginContent({ initialError }: { initialError: string }) {
  const { tagline, orgName, contactAddress } = usePublicBrand();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    document.title = getMetadataTitle('Login');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(STAFF_LOGIN_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftSignIn = () => {
    window.location.href = '/api/auth/microsoft/start';
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google/start';
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-9 flex justify-center">
            <Link href="/" className="inline-block">
              <BrandLogo variant="auth" priority />
            </Link>
          </div>

          <p className="mb-8 text-center text-sm text-neutral-500">{tagline}</p>

          {(hasMicrosoftOAuth || hasGoogleOAuth) && (
            <div className="mb-5 space-y-2.5">
              {hasMicrosoftOAuth && (
                <button
                  type="button"
                  onClick={handleMicrosoftSignIn}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <MicrosoftIcon className="h-4 w-4" />
                  Continue with Microsoft
                </button>
              )}
              {hasGoogleOAuth && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <GoogleIcon className="h-4 w-4" />
                  Continue with Google
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="demo@stabexintl.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-10 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Sign in'
              )}
            </button>

            <Link href="/dashboard/forgot-password" className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </form>

          <DemoLoginCredentialsHint variant="staff" />
        </div>
      </main>

      <footer className="border-t border-neutral-200 pb-6 pt-4 text-center">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-500">
          <Link href="/careers" className="hover:text-primary-600">Careers</Link>
          <Link href="/privacy" className="hover:text-primary-600">Privacy</Link>
          <Link href="/terms" className="hover:text-primary-600">Terms</Link>
        </nav>
        <p className="text-xs text-neutral-400">
          {orgName}
          {contactAddress ? ` · ${contactAddress}` : ''}
        </p>
      </footer>
    </div>
  );
}

function StaffLoginWithSearchParams() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');
  let initialError = '';
  if (oauthError === 'domain') initialError = 'Use your organization-issued work account (Microsoft or Google) to sign in.';
  else if (oauthError === 'no_account') initialError = 'No active staff account exists for this email. Ask an admin to add you.';
  else if (oauthError === 'inactive') initialError = 'Your staff account is inactive. Contact an administrator.';
  else if (oauthError === 'oauth') initialError = 'Sign-in with Microsoft or Google failed. Please try again.';
  return <StaffLoginContent initialError={initialError} />;
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<StaffLoginContent initialError="" />}>
      <StaffLoginWithSearchParams />
    </Suspense>
  );
}
