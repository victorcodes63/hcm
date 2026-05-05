'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, Building2, ExternalLink } from 'lucide-react';

type ClientDetail = {
  id: string;
  type: string;
  name: string;
  currency: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  billingNotes: string | null;
  nextInvoiceNumber: number;
  recruitmentClientId: string | null;
  outsourcingClientId: string | null;
  recruitmentClientName: string | null;
  outsourcingClientName: string | null;
  counts: { invoices: number; contracts: number; payments: number; payrolls: number };
};

const inputClass =
  'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30';

function typeLabel(t: string) {
  switch (t) {
    case 'recruitment':
      return 'Recruitment (linked)';
    case 'outsourcing':
      return 'Outsourcing (linked)';
    default:
      return 'Custom / off-system';
  }
}

export default function AccountsClientDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [data, setData] = useState<ClientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [billingNotes, setBillingNotes] = useState('');
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('1');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/accounts/clients/${id}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Failed');
      const c = j as ClientDetail;
      setData(c);
      setName(c.name);
      setCurrency(c.currency);
      setContactName(c.contactName ?? '');
      setContactEmail(c.contactEmail ?? '');
      setContactPhone(c.contactPhone ?? '');
      setBillingNotes(c.billingNotes ?? '');
      setNextInvoiceNumber(String(c.nextInvoiceNumber));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const nextNum = parseInt(nextInvoiceNumber, 10);
      const r = await fetch(`/api/accounts/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          currency: currency.trim(),
          contactName: contactName.trim() || null,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          billingNotes: billingNotes.trim() || null,
          nextInvoiceNumber: Number.isFinite(nextNum) ? nextNum : undefined,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Save failed');
      setSaveMsg('Saved.');
      await load();
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return <p className="text-sm text-red-600">Invalid client.</p>;
  }

  if (loading) {
    return (
      <div className="w-full min-w-0">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-neutral-200 rounded w-40" />
            <div className="h-8 bg-neutral-200 rounded w-2/3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-neutral-100 rounded-2xl" />
              ))}
            </div>
            <div className="h-64 bg-neutral-100 rounded-xl mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full min-w-0">
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
            <li>
              <Link href="/dashboard/accounts" className="hover:text-primary-700 transition-colors">
                Accounts
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/dashboard/accounts/clients" className="hover:text-primary-700 transition-colors">
                Billing clients
              </Link>
            </li>
          </ol>
        </nav>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error || 'Not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link href="/dashboard/accounts" className="hover:text-primary-700">
              Accounts
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/dashboard/accounts/clients" className="hover:text-primary-700">
              Clients
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-neutral-900 font-medium truncate max-w-[200px] sm:max-w-md">{data.name}</li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex gap-3 min-w-0">
          <Building2 className="w-9 h-9 sm:w-10 sm:h-10 text-primary-700 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 tracking-tight">
              {data.name}
            </h1>
            <p className="text-sm text-neutral-600 mt-1">{typeLabel(data.type)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href={`/dashboard/accounts/invoices/new?clientId=${encodeURIComponent(data.id)}`}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
          >
            New invoice
          </Link>
          <Link
            href={`/dashboard/accounts/invoices?clientId=${encodeURIComponent(data.id)}`}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-primary-900 hover:bg-neutral-50 transition-colors"
          >
            All invoices
          </Link>
          <Link
            href={`/dashboard/accounts/receipts?clientId=${encodeURIComponent(data.id)}`}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-primary-900 hover:bg-neutral-50 transition-colors"
          >
            Receipts
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          ['Invoices', data.counts.invoices],
          ['Contracts', data.counts.contracts],
          ['Receipts', data.counts.payments],
          ['Payrolls', data.counts.payrolls],
        ].map(([label, n]) => (
          <div
            key={label}
            className="rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-sm"
          >
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-primary-900 tabular-nums mt-1">{n}</p>
          </div>
        ))}
      </div>

      {(data.recruitmentClientId || data.outsourcingClientId) && (
        <div className="rounded-2xl border border-neutral-200/90 bg-white shadow-sm px-4 sm:px-5 py-4 mb-8 text-sm">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-3">
            Linked records
          </p>
          {data.recruitmentClientId && (
            <p className="text-neutral-800">
              Recruitment:{' '}
              <Link
                href="/dashboard/recruitment/profile"
                className="text-primary-700 hover:underline inline-flex items-center gap-1 font-medium"
              >
                {data.recruitmentClientName ?? 'Open'}
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </p>
          )}
          {data.outsourcingClientId && (
            <p className="text-neutral-800 mt-1">
              Outsourcing:{' '}
              <Link
                href={`/dashboard/outsourcing/clients/${data.outsourcingClientId}`}
                className="text-primary-700 hover:underline inline-flex items-center gap-1 font-medium"
              >
                {data.outsourcingClientName ?? 'Open'}
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-primary-900 mb-1">Profile &amp; billing</h2>
        <p className="text-sm text-neutral-600 mb-6 max-w-2xl">
          Ledger details for invoices and correspondence. Linked clients sync from ATS or outsourcing; internal notes
          stay private (never shown on invoice PDFs).
        </p>
        <form onSubmit={save} className="space-y-6">
          {saveMsg && (
            <p className={`text-sm ${saveMsg === 'Saved.' ? 'text-emerald-700' : 'text-red-600'}`}>{saveMsg}</p>
          )}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
            <div className="space-y-4">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                Ledger
              </p>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">Display name</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required name="displayName" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">Currency</label>
                <input className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)} required name="currency" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">Next invoice number</label>
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  value={nextInvoiceNumber}
                  onChange={(e) => setNextInvoiceNumber(e.target.value)}
                  name="nextInvoiceNumber"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Used when issuing the next manual invoice for this client.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                Contact person
              </p>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">Contact name</label>
                <input className={inputClass} value={contactName} onChange={(e) => setContactName(e.target.value)} name="contactName" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">Contact email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  name="contactEmail"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">Contact phone</label>
                <input className={inputClass} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} name="contactPhone" />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <label htmlFor="billingNotes" className="block text-sm font-medium text-neutral-800 mb-1.5">
              Internal engagement notes{' '}
              <span className="text-neutral-400 font-normal">(optional — not on invoice)</span>
            </label>
            <textarea
              id="billingNotes"
              name="billingNotes"
              rows={4}
              className={`${inputClass} resize-y min-h-[100px]`}
              value={billingNotes}
              onChange={(e) => setBillingNotes(e.target.value)}
              placeholder="Scope of work, billable setup, project references…"
            />
          </div>
          <div className="pt-2 border-t border-neutral-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
