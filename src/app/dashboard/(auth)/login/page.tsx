'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

const STAFF_LOGIN_PATH = '/api/auth/login';

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

function StaffLoginContent({ initialError }: { initialError: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(STAFF_LOGIN_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
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

  return (
    <div className="min-h-screen flex">
      {/* Left half – hero image (same overlay as home hero) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
          style={{ backgroundImage: 'url(/images/hero/Reception_comp.webp)' }}
        />
        <div className="absolute inset-0 bg-white/50" />
      </div>

      {/* Right half – login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white px-6 sm:px-12 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo – centred */}
          <div className="flex justify-center mb-10">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo/logo_dark_ubxaCll.png"
                alt="Eagle HR Consultants"
                width={180}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary-900 mb-2 text-center">
            Better hiring, all together.
          </h1>
          <p className="text-neutral-600 mb-8 text-center">
            Sign in to manage applications and your team.
          </p>

          {/* Microsoft sign-in */}
          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-neutral-300 rounded-lg font-medium text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
          >
            <MicrosoftIcon className="w-5 h-5" />
            Sign in with Microsoft
          </button>

          <div className="relative my-6">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </span>
            <span className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-neutral-500">or sign in with email</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  placeholder="you@eaglehr.co.ke"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                  Remember me
                </label>
              </div>
              <Link
                href="/dashboard/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-800"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-neutral-500 text-sm mt-8 text-center">
            <Link href="/" className="text-primary-600 hover:text-primary-800 font-medium">
              ← Back to website
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function StaffLoginWithSearchParams() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');
  let initialError = '';
  if (oauthError === 'domain') initialError = 'Use your @eaglehr.co.ke Microsoft account to sign in.';
  else if (oauthError === 'no_account') initialError = 'No active staff account exists for this email. Ask an admin to add you.';
  else if (oauthError === 'inactive') initialError = 'Your staff account is inactive. Contact an administrator.';
  else if (oauthError === 'oauth') initialError = 'Microsoft sign-in failed. Please try again.';

  return <StaffLoginContent initialError={initialError} />;
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<StaffLoginContent initialError="" />}>
      <StaffLoginWithSearchParams />
    </Suspense>
  );
}
