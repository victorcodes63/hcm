'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  AlertCircle,
  Plus,
  ExternalLink,
  Search,
  Pencil,
  FileText,
  Briefcase,
  RefreshCw,
} from 'lucide-react';

type ClientRow = {
  id: string;
  type: string;
  name: string;
  currency: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  billingNotes: string | null;
  recruitmentClientId: string | null;
  outsourcingClientId: string | null;
  recruitmentClientName: string | null;
  outsourcingClientName: string | null;
  counts: { invoices: number; contracts: number; payments: number; payrolls: number };
};

type TypeFilter = 'all' | 'custom' | 'recruitment' | 'outsourcing';

function typeLabel(t: string) {
  switch (t) {
    case 'recruitment':
      return 'Recruitment';
    case 'outsourcing':
      return 'Outsourcing';
    default:
      return 'Custom';
  }
}

function typePill(t: string) {
  const base = 'inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide';
  if (t === 'recruitment') return `${base} bg-primary-100 text-primary-900`;
  if (t === 'outsourcing') return `${base} bg-amber-100 text-amber-900`;
  return `${base} bg-neutral-100 text-neutral-700`;
}

function contactSummary(c: ClientRow): string {
  const parts = [c.contactName, c.contactEmail, c.contactPhone].filter(Boolean);
  return parts.join(' · ');
}

type ClientsApiResponse = {
  clients?: ClientRow[];
  sync?: { deletedDemoCount: number; recruitmentSynced: number; outsourcingSynced: number };
};

export default function AccountsClientsPage() {
  const [clients, setClients] = useState<ClientRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const load = useCallback((opts?: { sync?: boolean }) => {
    const runSync = Boolean(opts?.sync);
    if (runSync) {
      setSyncing(true);
      setSyncMessage(null);
    } else {
      setLoading(true);
    }
    const q = runSync ? '?sync=1' : '';
    fetch(`/api/accounts/clients${q}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || `Failed (${r.status})`);
        return data as ClientsApiResponse;
      })
      .then((data) => {
        setClients(Array.isArray(data.clients) ? data.clients : []);
        setError(null);
        if (data.sync) {
          setSyncMessage(
            `Updated from ATS & outsourcing: ${data.sync.recruitmentSynced} recruitment, ${data.sync.outsourcingSynced} outsourcing profiles.`,
          );
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load');
        setClients([]);
      })
      .finally(() => {
        if (runSync) setSyncing(false);
        else setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const rows = clients ?? [];
    const totalClients = rows.length;
    const recruitment = rows.filter((c) => c.type === 'recruitment').length;
    const outsourcing = rows.filter((c) => c.type === 'outsourcing').length;
    const custom = rows.filter((c) => c.type === 'custom').length;
    const totalInvoices = rows.reduce((s, c) => s + c.counts.invoices, 0);
    return {
      totalClients,
      recruitment,
      outsourcing,
      custom,
      totalInvoices,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const rows = clients ?? [];
    const byType =
      typeFilter === 'all' ? rows : rows.filter((c) => c.type === typeFilter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((c) => {
      const blob = [
        c.name,
        c.currency,
        typeLabel(c.type),
        c.recruitmentClientName,
        c.outsourcingClientName,
        c.contactName,
        c.contactEmail,
        c.contactPhone,
        c.billingNotes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [clients, searchQuery, typeFilter]);

  const hasActiveFilters = !!searchQuery.trim() || typeFilter !== 'all';
  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
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
                Billing clients
              </li>
            </ol>
          </nav>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 flex items-center gap-2">
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary-700 shrink-0" />
            Billing clients
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base max-w-2xl">
            Every invoice is tied to a billing client. Sync pulls recruitment employers and outsourcing companies;
            add a <strong className="font-medium text-neutral-700">custom client</strong> for work outside those modules
            (consulting, one-off projects, external billables) with optional internal engagement notes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center shrink-0">
          <button
            type="button"
            disabled={syncing || loading}
            onClick={() => load({ sync: true })}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] sm:min-h-0 rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-primary-900 hover:bg-neutral-50 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync from modules'}
          </button>
          <Link
            href="/dashboard/accounts/clients/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] sm:min-h-0 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add billing client
          </Link>
        </div>
      </div>

      {syncMessage && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm text-emerald-900">
          {syncMessage}
        </div>
      )}

      {loading ? null : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              Total clients
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-primary-900 tabular-nums">{totals.totalClients}</p>
            <p className="text-[11px] text-neutral-500 mt-1">Billing profiles in Accounts</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              Recruitment
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-primary-700 tabular-nums">
              {totals.recruitment}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">ATS employers</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              Outsourcing
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-800 tabular-nums">
              {totals.outsourcing}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">Outsourcing companies</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              Custom / other
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
              {totals.custom}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              {totals.totalInvoices} invoice{totals.totalInvoices === 1 ? '' : 's'} total
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-100 rounded w-full" />
            <div className="h-4 bg-neutral-100 rounded w-5/6" />
          </div>
        </div>
      ) : (clients?.length ?? 0) === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4 max-w-md mx-auto text-sm sm:text-base">
            No billing clients yet. Run <strong className="font-medium text-neutral-800">Sync from modules</strong> to
            import ATS and outsourcing companies, or add a custom billing client for external work.
          </p>
          <Link
            href="/dashboard/accounts/clients/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add billing client
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative max-w-xs sm:max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search by name, type, contact, or internal notes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  aria-label="Search billing clients"
                />
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 shrink-0 self-start sm:self-center"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by client type">
              {(
                [
                  ['all', 'All types'],
                  ['custom', 'Custom / off-system'],
                  ['recruitment', 'Recruitment'],
                  ['outsourcing', 'Outsourcing'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
                    typeFilter === value
                      ? 'border-primary-800 bg-primary-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
              <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No clients match your search.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80">
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Client &amp; type
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Contact
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Source
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Invoices
                      </th>
                      <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredClients.map((c, index) => {
                      const contact = contactSummary(c);
                      return (
                        <tr
                          key={c.id}
                          className={`transition-colors ${
                            index % 2 === 0
                              ? 'bg-white hover:bg-neutral-50/70'
                              : 'bg-neutral-50/50 hover:bg-neutral-50/80'
                          }`}
                        >
                          <td className="px-4 sm:px-5 py-3">
                            <Link
                              href={`/dashboard/accounts/clients/${c.id}`}
                              className="font-medium text-primary-900 text-sm hover:text-primary-700 hover:underline"
                            >
                              {c.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className={typePill(c.type)}>{typeLabel(c.type)}</span>
                              <span className="text-[11px] text-neutral-500 tabular-nums">{c.currency}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm">
                            {contact ? (
                              <span
                                className="truncate min-w-0 max-w-[14rem] sm:max-w-[20rem] lg:max-w-[28rem] xl:max-w-[36rem] block"
                                title={contact}
                              >
                                {contact}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-neutral-600 text-xs">
                            {c.recruitmentClientId && (
                              <Link
                                href="/dashboard/recruitment/profile"
                                className="inline-flex items-center gap-1 text-primary-800 hover:underline font-medium"
                              >
                                <Briefcase className="w-3.5 h-3.5 opacity-70 shrink-0" />
                                {c.recruitmentClientName ?? 'Recruitment'}
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </Link>
                            )}
                            {c.outsourcingClientId && (
                              <Link
                                href={`/dashboard/outsourcing/clients/${c.outsourcingClientId}`}
                                className={`inline-flex items-center gap-1 text-primary-800 hover:underline font-medium ${
                                  c.recruitmentClientId ? 'mt-1.5 block' : ''
                                }`}
                              >
                                <Building2 className="w-3.5 h-3.5 opacity-70 shrink-0" />
                                {c.outsourcingClientName ?? 'Outsourcing'}
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </Link>
                            )}
                            {!c.recruitmentClientId && !c.outsourcingClientId && (
                              <span className="text-neutral-500">
                                {c.type === 'custom' ? 'Off-system / manual' : '—'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-neutral-400" />
                              {c.counts.invoices}
                            </span>
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/dashboard/accounts/clients/${c.id}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Billing
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
