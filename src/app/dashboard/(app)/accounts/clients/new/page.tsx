'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Building2 } from 'lucide-react';

type AccountsClientType = 'custom' | 'recruitment' | 'outsourcing';

type RecOpt = { id: string; name: string };
type OutOpt = { id: string; name: string };

const inputClass =
  'w-full min-w-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30';

export default function NewAccountsClientPage() {
  const router = useRouter();
  const [type, setType] = useState<AccountsClientType>('custom');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [billingNotes, setBillingNotes] = useState('');
  const [recruitmentId, setRecruitmentId] = useState('');
  const [outsourcingId, setOutsourcingId] = useState('');

  const [recOptions, setRecOptions] = useState<RecOpt[]>([]);
  const [outOptions, setOutOptions] = useState<OutOpt[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    setLoadingOpts(true);
    try {
      const [acRes, settingsRes, ocRes] = await Promise.all([
        fetch('/api/accounts/clients'),
        fetch('/api/recruitment-settings'),
        fetch('/api/outsourcing/clients'),
      ]);
      const acJson = await acRes.json().catch(() => ({}));
      const settingsJson = (await settingsRes.json().catch(() => null)) as {
        linkedClientId?: string | null;
        employerName?: string;
      } | null;
      const ocJson = await ocRes.json().catch(() => []);

      const linkedRec = new Set(
        (acJson.clients as { recruitmentClientId?: string }[] | undefined)
          ?.map((c) => c.recruitmentClientId)
          .filter(Boolean) as string[],
      );
      const linkedOut = new Set(
        (acJson.clients as { outsourcingClientId?: string }[] | undefined)
          ?.map((c) => c.outsourcingClientId)
          .filter(Boolean) as string[],
      );

      const linkId = settingsJson?.linkedClientId?.trim() || '';
      const recList =
        linkId
          ? [{ id: linkId, name: settingsJson?.employerName?.trim() || 'Recruitment organization' }]
          : [];
      setRecOptions(
        recList
          .filter((c) => !linkedRec.has(c.id))
          .map((c) => ({ id: c.id, name: c.name })),
      );

      const outList = Array.isArray(ocJson) ? ocJson : [];
      setOutOptions(
        outList
          .filter((c: { id: string }) => !linkedOut.has(c.id))
          .map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })),
      );
    } catch {
      setRecOptions([]);
      setOutOptions([]);
    } finally {
      setLoadingOpts(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        type,
        name: name.trim() || undefined,
        currency: currency.trim() || 'KES',
        contactName: contactName.trim() || null,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        billingNotes: billingNotes.trim() || null,
      };
      if (type === 'recruitment') {
        body.recruitmentClientId = recruitmentId || null;
        body.outsourcingClientId = null;
      } else if (type === 'outsourcing') {
        body.outsourcingClientId = outsourcingId || null;
        body.recruitmentClientId = null;
      } else {
        body.recruitmentClientId = null;
        body.outsourcingClientId = null;
        if (!name.trim()) {
          setError('Name is required for a custom client.');
          setSubmitting(false);
          return;
        }
      }

      const r = await fetch('/api/accounts/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || `Failed (${r.status})`);
      if (j.id) router.push(`/dashboard/accounts/clients/${j.id}`);
      else router.push('/dashboard/accounts/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link href="/dashboard/accounts/clients" className="hover:text-primary-700">
              Billing clients
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-neutral-900 font-medium">New billing client</li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div className="flex gap-3 min-w-0">
          <Building2 className="w-9 h-9 sm:w-10 sm:h-10 text-primary-700 shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 tracking-tight">
              New billing client
            </h1>
            <p className="text-sm text-neutral-600 mt-2 max-w-xl">
              Default is a <strong className="font-semibold text-neutral-800">custom</strong> profile for clients you
              bill outside ATS or outsourcing (consulting, retainers, one-off projects). Sync still creates linked
              profiles for modules; use the advanced section only to attach an unlinked employer or company.
            </p>
          </div>
        </div>
        <aside className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm text-xs text-neutral-600 max-w-sm shrink-0 lg:text-right lg:max-w-xs">
          <p className="font-bold uppercase tracking-widest text-neutral-500 mb-1">After save</p>
          <p>
            You will land on the client&apos;s billing page to set invoice numbering and issue invoices against this
            ledger.
          </p>
        </aside>
      </div>

      {loadingOpts && (
        <div className="flex items-center gap-2 text-neutral-500 mt-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading link options…
        </div>
      )}

      {!loadingOpts && (
        <form onSubmit={submit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-4">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  Company
                </p>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Display name{' '}
                    {type === 'custom' ? (
                      <span className="text-red-600">*</span>
                    ) : (
                      <span className="text-neutral-400 font-normal">(optional)</span>
                    )}
                  </label>
                  <input
                    id="name"
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={type === 'custom' ? 'e.g. ABC Healthcare Ltd' : 'Override ledger name (optional)'}
                    required={type === 'custom'}
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Currency
                  </label>
                  <input
                    id="currency"
                    className={inputClass}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  Contact person
                </p>
                <div>
                  <label htmlFor="cn" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Contact name
                  </label>
                  <input
                    id="cn"
                    className={inputClass}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label htmlFor="ce" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Email
                  </label>
                  <input
                    id="ce"
                    type="email"
                    className={inputClass}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. jane@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="cp" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Phone
                  </label>
                  <input
                    id="cp"
                    className={inputClass}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +254 700 123 456"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <label htmlFor="bn" className="block text-sm font-medium text-neutral-800 mb-1.5">
                Internal engagement notes{' '}
                <span className="text-neutral-400 font-normal">(optional, not on invoice)</span>
              </label>
              <textarea
                id="bn"
                rows={4}
                className={`${inputClass} resize-y min-h-[100px]`}
                value={billingNotes}
                onChange={(e) => setBillingNotes(e.target.value)}
                placeholder="e.g. Interim HR lead Q1–Q2, ad hoc recruitment support, monthly retainer scope…"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
              Advanced — manual link
            </p>
            <p className="text-xs text-neutral-600 mb-4">
              Only if automatic sync missed an edge case. Prefer creating the company in Recruitment or Outsourcing
              first.
            </p>
            <label htmlFor="type" className="block text-sm font-medium text-neutral-800 mb-1.5">
              Client type
            </label>
            <select
              id="type"
              className={inputClass}
              value={type}
              onChange={(e) => setType(e.target.value as AccountsClientType)}
            >
              <option value="custom">Custom (standalone ledger)</option>
              <option value="recruitment">Recruitment employer (link)</option>
              <option value="outsourcing">Outsourcing client (link)</option>
            </select>

            {type === 'recruitment' && (
              <div className="mt-4">
                <label htmlFor="rec" className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Recruitment organization
                </label>
                <select
                  id="rec"
                  required
                  className={inputClass}
                  value={recruitmentId}
                  onChange={(e) => setRecruitmentId(e.target.value)}
                >
                  <option value="">Select…</option>
                  {recOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                {recOptions.length === 0 && (
                  <p className="text-xs text-amber-700 mt-1">
                    Open <Link href="/dashboard/recruitment/profile" className="underline">Recruitment / Careers profile</Link>{' '}
                    to create the single employer link, or sync billing from Accounts overview.
                  </p>
                )}
              </div>
            )}

            {type === 'outsourcing' && (
              <div className="mt-4">
                <label htmlFor="out" className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Outsourcing client
                </label>
                <select
                  id="out"
                  required
                  className={inputClass}
                  value={outsourcingId}
                  onChange={(e) => setOutsourcingId(e.target.value)}
                >
                  <option value="">Select…</option>
                  {outOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                {outOptions.length === 0 && (
                  <p className="text-xs text-amber-700 mt-1">
                    No unlinked outsourcing clients. Create or link from Outsourcing first.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create billing client
            </button>
            <Link
              href="/dashboard/accounts/clients"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
