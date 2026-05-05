'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, FileSpreadsheet, Loader2, AlertCircle, Plus } from 'lucide-react';
import useEntityConfig, { useDisplayMoney } from '@/hooks/useEntityConfig';
import { EntityContextBanner } from '@/components/EntityContextBanner';

type InvoiceRow = {
  id: string;
  invoiceNumber: number;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  status: string;
  subtotalExVat: number;
  vatAmount: number;
  totalIncVat: number;
  lineCount: number;
};

function AccountsInvoicesPageInner() {
  const entityConfig = useEntityConfig();
  const displayMoney = useDisplayMoney();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterClientId = searchParams.get('clientId')?.trim() || undefined;

  const [invoices, setInvoices] = useState<InvoiceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadList = useCallback(() => {
    setLoading(true);
    const q = filterClientId ? `?clientId=${encodeURIComponent(filterClientId)}` : '';
    fetch(`/api/accounts/invoices${q}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(data.error || `Failed (${r.status})`);
        }
        return data as { invoices?: InvoiceRow[] };
      })
      .then((data) => {
        setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load');
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  }, [filterClientId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openInvoice = (id: string) => {
    router.push(`/dashboard/accounts/invoices/${id}`);
  };

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <nav className="mb-3 sm:mb-4" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
                <li>
                  <Link href="/dashboard/accounts" className="hover:text-primary-700 transition-colors">
                    Accounts
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-primary-900 font-medium" aria-current="page">
                  Invoices
                </li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-primary-900 tracking-tight flex items-center gap-2">
              <FileText className="w-7 h-7 text-primary-700" />
              Invoices
            </h1>
            <EntityContextBanner />
            <p className="text-neutral-600 text-sm mt-1">
              Open an invoice for the full view, PDF, and payment details. {entityConfig.tax.vatLabel}: round(sum of
              line ex-VAT × rate, 2 dp). {entityConfig.tax.whtLabel}: {entityConfig.tax.whtRates}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href={
                filterClientId
                  ? `/api/accounts/invoices/export?clientId=${encodeURIComponent(filterClientId)}`
                  : '/api/accounts/invoices/export'
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-800 text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Download Excel
            </a>
            <Link
              href={
                filterClientId
                  ? `/dashboard/accounts/invoices/new?clientId=${encodeURIComponent(filterClientId)}`
                  : '/dashboard/accounts/invoices/new'
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New invoice
            </Link>
          </div>
        </div>
        {filterClientId && (
          <div className="mt-3 rounded-lg border border-primary-100 bg-primary-50/60 px-3 py-2 text-sm text-primary-900 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Showing invoices for one billing client.</span>
            <Link href="/dashboard/accounts/invoices" className="font-medium underline hover:no-underline">
              Show all invoices
            </Link>
            <Link
              href={`/dashboard/accounts/clients/${filterClientId}`}
              className="font-medium underline hover:no-underline"
            >
              Client profile
            </Link>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-neutral-600 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading invoices…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
            {error.includes('No access') && (
              <p className="mt-2 text-amber-800">
                Ask an admin to grant Accounts access, or run{' '}
                <code className="bg-amber-100/80 px-1 rounded text-xs">npm run db:seed-accounts</code> for a dev user
                with permissions.
              </p>
            )}
          </div>
        </div>
      )}

      {!loading && !error && invoices && invoices.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-600 text-sm">
          {filterClientId ? (
            <div className="space-y-4">
              <p>No invoices for this client yet.</p>
              <Link
                href={`/dashboard/accounts/invoices/new?clientId=${encodeURIComponent(filterClientId)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800"
              >
                <Plus className="w-4 h-4" />
                New invoice for this client
              </Link>
            </div>
          ) : (
            <>
              <p>No invoices yet.</p>
              <Link
                href="/dashboard/accounts/invoices/new"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800"
              >
                <Plus className="w-4 h-4" />
                New invoice
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && !error && invoices && invoices.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/90">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Issue</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Due</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">Ex-VAT</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">{entityConfig.tax.vatLabel}</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, index) => (
                  <tr
                    key={inv.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openInvoice(inv.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openInvoice(inv.id);
                      }
                    }}
                    className={`border-b border-neutral-100 cursor-pointer transition-colors ${
                      index % 2 === 0 ? 'bg-white hover:bg-neutral-50/80' : 'bg-neutral-50/50 hover:bg-neutral-100/80'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-primary-800">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-800">{inv.clientName}</td>
                    <td className="px-4 py-3 text-neutral-600 tabular-nums">{inv.issueDate}</td>
                    <td className="px-4 py-3 text-neutral-600 tabular-nums">{inv.dueDate ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-800">
                      {displayMoney(inv.subtotalExVat, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                      {displayMoney(inv.vatAmount, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-primary-900">
                      {displayMoney(inv.totalIncVat, inv.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800'
                            : inv.status === 'partial'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountsInvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-neutral-600 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading invoices…
        </div>
      }
    >
      <AccountsInvoicesPageInner />
    </Suspense>
  );
}
