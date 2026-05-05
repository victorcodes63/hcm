'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Landmark, Loader2, Save, ShieldAlert } from 'lucide-react';
import useEntityConfig, { useCurrencyFormatter } from '@/hooks/useEntityConfig';
import { EntityContextBanner } from '@/components/EntityContextBanner';

type ItemStatus = 'pending' | 'prepared' | 'submitted' | 'paid' | 'overdue';

type StatutoryData = {
  period: { month: number; year: number };
  client: {
    id: string;
    name: string;
    currency: string;
    registrations: {
      kraPin: string | null;
      nssfEmployerNumber: string | null;
      shifEmployerNumber: string | null;
    };
  };
  totals: {
    employeeCount: number;
    payrollCount: number;
    totalGrossPay: number;
    totalPaye: number;
    totalNssfEmployee: number;
    totalNssfEmployer: number;
    totalShif: number;
    totalAhlEmployee: number;
    totalAhlEmployer: number;
    totalOtherDeductions: number;
  };
  compliance: {
    dueDate: string;
    returnId: string | null;
    status: string;
    coveragePct: number;
    employeeDataGaps: {
      idNumber: number;
      kraPin: number;
      nssfNumber: number;
      nhifNumber: number;
    };
  };
  obligations: Array<{
    id: string | null;
    obligationType: string;
    authority: string;
    employeeAmount: number;
    employerAmount: number;
    liabilityAmount: number;
    dueDate: string;
    status: ItemStatus;
    referenceNumber: string | null;
    paymentReference: string | null;
    notes: string | null;
    submittedAt: string | null;
    paidAt: string | null;
  }>;
  notes: string | null;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function statusClass(status: string) {
  if (status === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'submitted' || status === 'filed') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'prepared' || status === 'review_ready') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'overdue') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-neutral-50 text-neutral-700 border-neutral-200';
}

function statusLabel(status: string) {
  return status.replace('_', ' ');
}

export default function PayrollStatutoryPage() {
  const entityConfig = useEntityConfig();
  const formatCurrency = useCurrencyFormatter();
  const money = (amount: number) => formatCurrency(Number(amount || 0));
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<StatutoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [itemBusy, setItemBusy] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ month: String(month), year: String(year) });
      const res = await fetch(`/api/payroll/statutory?${params.toString()}`);
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to load statutory page');
      const typed = payload as StatutoryData;
      setData(typed);
      setNotes(typed.notes || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load statutory data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const totals = data?.totals;
  const totalLiability = useMemo(() => {
    if (!data) return 0;
    return data.obligations.reduce((acc, item) => acc + Number(item.liabilityAmount || 0), 0);
  }, [data]);

  const saveSnapshot = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/payroll/statutory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, notes }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to save snapshot');
      setMessage(payload.message || 'Snapshot saved');
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save snapshot');
    } finally {
      setSaving(false);
    }
  };

  const updateItemStatus = async (itemId: string, status: ItemStatus) => {
    setItemBusy(itemId);
    setError(null);
    try {
      const res = await fetch(`/api/payroll/statutory/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to update item');
      await fetchData();
      setMessage(`Marked as ${statusLabel(status)}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update item');
    } finally {
      setItemBusy(null);
    }
  };

  const gaps = data?.compliance.employeeDataGaps;
  const hasCriticalGaps = Boolean(gaps && (gaps.kraPin > 0 || gaps.idNumber > 0));

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Statutory · {entityConfig.payroll.runLabel}
          </h1>
          <EntityContextBanner />
          <p className="text-neutral-600 text-sm sm:text-base">{entityConfig.payroll.statutoryComplianceIntro}</p>
          {data?.client && (
            <p className="text-xs text-neutral-500 mt-2">
              Employer: <span className="font-medium text-neutral-700">{data.client.name}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
            className="w-28 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            min={2020}
            max={2100}
          />
          <button
            type="button"
            onClick={saveSnapshot}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-semibold hover:bg-primary-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save filing snapshot
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-neutral-500 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading statutory data...
        </div>
      ) : !data || !totals ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-neutral-500 text-sm">
          No statutory data available for this period.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Gross payroll</p>
              <p className="text-lg font-semibold text-primary-900 mt-1">{money(totals.totalGrossPay)}</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Total statutory liability</p>
              <p className="text-lg font-semibold text-primary-900 mt-1">{money(totalLiability)}</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Payroll coverage</p>
              <p className="text-lg font-semibold text-primary-900 mt-1">{data.compliance.coveragePct.toFixed(1)}%</p>
              <p className="text-xs text-neutral-500 mt-1">
                {totals.payrollCount} payroll records / {totals.employeeCount} employees
              </p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Return status</p>
              <span className={`inline-flex mt-2 px-2.5 py-1 rounded border text-xs font-medium ${statusClass(data.compliance.status)}`}>
                {statusLabel(data.compliance.status)}
              </span>
              <p className="text-xs text-neutral-500 mt-2">
                Due by{' '}
                {new Date(data.compliance.dueDate).toLocaleDateString(entityConfig.currency.locale, {
                  dateStyle: 'medium',
                })}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-primary-700" />
              Statutory obligations
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">Obligation</th>
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">Authority</th>
                    <th className="text-right px-3 py-2 font-medium text-neutral-600">Employee</th>
                    <th className="text-right px-3 py-2 font-medium text-neutral-600">Employer</th>
                    <th className="text-right px-3 py-2 font-medium text-neutral-600">Total due</th>
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">Due date</th>
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">Status</th>
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.obligations.map((item) => (
                    <tr key={item.obligationType} className="border-b border-neutral-100">
                      <td className="px-3 py-3 font-medium text-neutral-900 uppercase tracking-wide text-xs">{item.obligationType.replace('_', ' ')}</td>
                      <td className="px-3 py-3 text-neutral-600">{item.authority}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{money(item.employeeAmount)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{money(item.employerAmount)}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold">{money(item.liabilityAmount)}</td>
                      <td className="px-3 py-3 text-neutral-600">
                        {new Date(item.dueDate).toLocaleDateString(entityConfig.currency.locale, {
                          dateStyle: 'medium',
                        })}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded border text-xs font-medium ${statusClass(item.status)}`}>
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.id ? (
                            <>
                              <button
                                type="button"
                                className="px-2 py-1 text-xs rounded border border-neutral-300 hover:bg-neutral-50"
                                onClick={() => updateItemStatus(item.id!, 'prepared')}
                                disabled={itemBusy === item.id}
                              >
                                Prepared
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 text-xs rounded border border-blue-300 text-blue-700 hover:bg-blue-50"
                                onClick={() => updateItemStatus(item.id!, 'submitted')}
                                disabled={itemBusy === item.id}
                              >
                                Submitted
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 text-xs rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => updateItemStatus(item.id!, 'paid')}
                                disabled={itemBusy === item.id}
                              >
                                Paid
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-neutral-500">Save snapshot first</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-primary-900 mb-3">Statutory coverage (reference)</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {entityConfig.payroll.statutoryItems.map((item) => (
                <li
                  key={item.key}
                  className="rounded-lg border border-neutral-100 bg-neutral-50/80 px-3 py-2.5 text-sm"
                >
                  <span className="inline-flex items-center rounded bg-primary-100 text-primary-900 text-[10px] font-bold px-1.5 py-0.5 mr-2">
                    {item.badge}
                  </span>
                  <span className="font-medium text-neutral-900">{item.label}</span>
                  <p className="text-xs text-neutral-500 mt-1">{item.sublabel}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-500 mt-3">
              Returns: {entityConfig.payroll.reportLabels.monthly} · {entityConfig.payroll.reportLabels.annual}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`rounded-xl border p-4 ${hasCriticalGaps ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <h3 className="text-sm font-semibold flex items-center gap-2 text-neutral-900">
                {hasCriticalGaps ? <ShieldAlert className="w-4 h-4 text-amber-700" /> : <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                Employee filing readiness
              </h3>
              <div className="mt-3 text-sm text-neutral-700 space-y-1">
                <p>Missing National ID: <span className="font-medium">{gaps?.idNumber ?? 0}</span></p>
                <p>
                  Missing {entityConfig.payroll.taxPinLabel}:{' '}
                  <span className="font-medium">{gaps?.kraPin ?? 0}</span>
                </p>
                <p>Missing NSSF Number: <span className="font-medium">{gaps?.nssfNumber ?? 0}</span></p>
                <p>
                  Missing {entityConfig.payroll.missingHealthSchemeGapLabel}:{' '}
                  <span className="font-medium">{gaps?.nhifNumber ?? 0}</span>
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary-700" />
                Filing notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Capture filing references, audit comments, and payment confirmations."
                className="mt-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
