'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileStack, Loader2, AlertCircle, Plus } from 'lucide-react';
import useEntityConfig, { useDisplayMoney } from '@/hooks/useEntityConfig';
import { EntityContextBanner } from '@/components/EntityContextBanner';

type BillRow = {
  id: string;
  vendorId: string;
  vendorName: string;
  billRef: string | null;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  status: string;
  subtotalExVat: number;
  vatAmount: number;
  totalIncVat: number;
  lineCount: number;
};

function VendorBillsListInner() {
  const entityConfig = useEntityConfig();
  const displayMoney = useDisplayMoney();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterVendorId = searchParams.get('vendorId')?.trim() || undefined;

  const [bills, setBills] = useState<BillRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const q = filterVendorId ? `?vendorId=${encodeURIComponent(filterVendorId)}` : '';
    fetch(`/api/accounts/vendor-bills${q}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || `Failed (${r.status})`);
        return data as { bills?: BillRow[] };
      })
      .then((data) => {
        setBills(Array.isArray(data.bills) ? data.bills : []);
        setError(null);
        const first = data.bills?.[0];
        if (filterVendorId && first?.vendorName) setVendorName(first.vendorName);
        else if (!filterVendorId) setVendorName(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load');
        setBills([]);
      })
      .finally(() => setLoading(false));
  }, [filterVendorId]);

  useEffect(() => {
    load();
  }, [load]);

  const openBill = (id: string) => router.push(`/dashboard/accounts/vendor-bills/${id}`);

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                Vendor bills
              </li>
            </ol>
          </nav>
          <h1 className="text-2xl font-bold text-primary-900 tracking-tight flex items-center gap-2">
            <FileStack className="w-7 h-7 text-primary-700" />
            Vendor bills
          </h1>
          <EntityContextBanner />
          <p className="text-neutral-600 text-sm mt-1">
            Creditor invoices (AP): multi-line, {entityConfig.tax.vatLabel}, payment allocations update status.{' '}
            {entityConfig.tax.whtLabel}: {entityConfig.tax.whtRates}.
          </p>
        </div>
        <Link
          href={
            filterVendorId
              ? `/dashboard/accounts/vendor-bills/new?vendorId=${encodeURIComponent(filterVendorId)}`
              : '/dashboard/accounts/vendor-bills/new'
          }
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800 shrink-0"
        >
          <Plus className="w-5 h-5" />
          New bill
        </Link>
      </div>

      {filterVendorId && (
        <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50/60 px-3 py-2 text-sm text-primary-900 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            Filtered by vendor{vendorName ? `: ${vendorName}` : ''}.
          </span>
          <Link href="/dashboard/accounts/vendor-bills" className="font-medium underline hover:no-underline">
            Show all bills
          </Link>
          <Link
            href={`/dashboard/accounts/vendors/${filterVendorId}`}
            className="font-medium underline hover:no-underline"
          >
            Vendor profile
          </Link>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-neutral-600 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading bills…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && bills && bills.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-600 text-sm space-y-4">
          <p>No vendor bills yet.</p>
          <Link
            href={
              filterVendorId
                ? `/dashboard/accounts/vendor-bills/new?vendorId=${encodeURIComponent(filterVendorId)}`
                : '/dashboard/accounts/vendor-bills/new'
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800"
          >
            <Plus className="w-4 h-4" />
            New bill
          </Link>
        </div>
      )}

      {!loading && !error && bills && bills.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/90">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Vendor</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Reference</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Issued</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Due</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">Ex-VAT</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">{entityConfig.tax.vatLabel}</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, index) => (
                  <tr
                    key={bill.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openBill(bill.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openBill(bill.id);
                      }
                    }}
                    className={`border-b border-neutral-100 cursor-pointer transition-colors ${
                      index % 2 === 0 ? 'bg-white hover:bg-neutral-50/80' : 'bg-neutral-50/50 hover:bg-neutral-100/80'
                    }`}
                  >
                    <td className="px-4 py-3 text-neutral-800">{bill.vendorName}</td>
                    <td className="px-4 py-3 font-medium text-primary-800">
                      {bill.billRef || bill.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 tabular-nums">{bill.issueDate}</td>
                    <td className="px-4 py-3 text-neutral-600 tabular-nums">{bill.dueDate ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-800">
                      {displayMoney(bill.subtotalExVat, bill.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                      {displayMoney(bill.vatAmount, bill.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-primary-900">
                      {displayMoney(bill.totalIncVat, bill.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          bill.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800'
                            : bill.status === 'partial'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {bill.status}
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

export default function VendorBillsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-neutral-600 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading bills…
        </div>
      }
    >
      <VendorBillsListInner />
    </Suspense>
  );
}
