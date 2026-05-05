'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // TODO: wire to API – e.g. POST /api/auth/forgot-password { email }
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left half – hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
          style={{ backgroundImage: 'url(/images/hero/Reception_comp.webp)' }}
        />
        <div className="absolute inset-0 bg-white/50" />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white px-6 sm:px-12 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="flex justify-center mb-10">
            <Link href="/" className="inline-block">
              <BrandLogo variant="header" priority />
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary-900 mb-2 text-center">
            Forgot password?
          </h1>
          <p className="text-neutral-600 mb-8 text-center">
            Enter your work email and we&apos;ll send you a link to reset your password.
          </p>

          {submitted ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-6">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>If an account exists for that email, we&apos;ve sent reset instructions. Check your inbox.</span>
              </div>
            </div>
          ) : (
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
                    placeholder="you@example.com"
                  />
                </div>
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
                    Send reset link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6">
            <Link href="/dashboard/login" className="text-primary-600 hover:text-primary-800 font-medium">
              ← Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
