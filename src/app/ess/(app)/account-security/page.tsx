'use client';

import { useState } from 'react';

export default function EssAccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/ess/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Unable to update password.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('Password updated successfully.');
    } catch {
      setError('Unable to update password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">Account security</h1>
      <section className="max-w-xl bg-white border border-neutral-200 rounded-xl p-4">
        <p className="text-sm text-neutral-600 mb-4">Use this page to reset your ESS password.</p>
        {error ? <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2 mb-3">{success}</p> : null}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Current password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">New password</label>
            <input
              type="password"
              minLength={6}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </section>
    </div>
  );
}
