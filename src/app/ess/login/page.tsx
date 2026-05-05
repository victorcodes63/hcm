'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DemoLoginCredentialsHint } from '@/components/DemoLoginCredentialsHint';

export default function EssLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = searchParams.get('from') || '/ess';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ess/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Unable to sign in.');
        return;
      }
      router.replace(from);
      router.refresh();
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-primary-900">Employee Self Service</h1>
        <p className="text-sm text-neutral-600 mt-1">Sign in to access your leave, profile, and payslips.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <p className="text-sm rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2">{error}</p>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <DemoLoginCredentialsHint variant="ess" />
      </div>
    </div>
  );
}
