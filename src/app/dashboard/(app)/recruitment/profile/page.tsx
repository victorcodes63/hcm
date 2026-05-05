'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Loader2 } from 'lucide-react';

type Settings = {
  employerName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  linkedClientId: string | null;
  updatedAt: string;
};

const inputClass =
  'w-full min-w-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30';

export default function RecruitmentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [employerName, setEmployerName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/recruitment-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Settings | null) => {
        if (cancelled || !data) return;
        setSettings(data);
        setEmployerName(data.employerName);
        setContactName(data.contactName ?? '');
        setContactEmail(data.contactEmail ?? '');
        setContactPhone(data.contactPhone ?? '');
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/recruitment-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerName: employerName.trim(),
          contactName: contactName.trim() || null,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to save.');
        setSaving(false);
        return;
      }
      setSettings(data);
      setSaving(false);
    } catch {
      setError('Something went wrong.');
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link href="/dashboard" className="hover:text-primary-700 transition-colors">
              Dashboard
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/dashboard/jobs" className="hover:text-primary-700 transition-colors">
              Recruitment
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-primary-900 font-medium" aria-current="page">
            Careers profile
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-primary-900 mb-1 flex items-center gap-2">
          <Building2 className="w-7 h-7 shrink-0" />
          Careers profile
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base">
          Configure how your organization appears on public job posts and on the careers page.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}

          <div>
            <label htmlFor="employerName" className="mb-1.5 block text-sm font-medium text-primary-900">
              Public employer name
            </label>
            <input
              id="employerName"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              className={inputClass}
              required
              autoComplete="organization"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Default name shown on new job postings. You can still override per job when needed.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-primary-900">Primary contact (optional)</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="cname" className="mb-1 block text-xs text-neutral-600">
                  Name
                </label>
                <input
                  id="cname"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cemail" className="mb-1 block text-xs text-neutral-600">
                  Email
                </label>
                <input
                  id="cemail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cphone" className="mb-1 block text-xs text-neutral-600">
                  Phone
                </label>
                <input
                  id="cphone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {settings?.updatedAt && (
            <p className="text-xs text-neutral-400">Last updated {new Date(settings.updatedAt).toLocaleString()}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
    </div>
  );
}

