'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
 AlertTriangle,
 CheckCircle2,
 ChevronDown,
 Clock,
 Landmark,
 Loader2,
 Save,
 ShieldAlert,
 TrendingUp,
} from 'lucide-react';
import useEntityConfig, { useCurrencyFormatter } from '@/hooks/useEntityConfig';
import { EntityContextBanner } from '@/components/EntityContextBanner';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

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

function statusBorderColor(status: string) {
 if (status === 'paid') return 'border-l-emerald-500';
 if (status === 'submitted' || status === 'filed') return 'border-l-blue-500';
 if (status === 'prepared' || status === 'review_ready') return 'border-l-amber-500';
 if (status === 'overdue') return 'border-l-rose-500';
 return 'border-l-neutral-300';
}

function statusBadgeClass(status: string) {
 if (status === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
 if (status === 'submitted' || status === 'filed') return 'bg-blue-50 text-blue-700 border-blue-200';
 if (status === 'prepared' || status === 'review_ready') return 'bg-amber-50 text-amber-700 border-amber-200';
 if (status === 'overdue') return 'bg-rose-50 text-rose-700 border-rose-200';
 return 'bg-neutral-100 text-neutral-600 border-neutral-200';
}

function statusLabel(status: string) {
 return status.replace('_', ' ');
}

function countdownClass(days: number) {
 if (days <= 3) return 'bg-rose-100 text-rose-800 border-rose-200';
 if (days <= 7) return 'bg-amber-100 text-amber-800 border-amber-200';
 return 'bg-emerald-100 text-emerald-800 border-emerald-200';
}

function nextAction(status: ItemStatus): { label: string; target: ItemStatus; style: string } | null {
 if (status === 'pending') return { label: 'Mark prepared', target: 'prepared', style: 'bg-neutral-800 text-white hover:bg-neutral-700' };
 if (status === 'prepared') return { label: 'Mark submitted', target: 'submitted', style: 'bg-blue-600 text-white hover:bg-blue-700' };
 if (status === 'submitted') return { label: 'Confirm payment', target: 'paid', style: 'bg-emerald-600 text-white hover:bg-emerald-700' };
 return null;
}

function obligationIcon(type: string) {
 if (type === 'paye') return '🏛️';
 if (type === 'nssf') return '🛡️';
 if (type === 'shif') return '🏥';
 if (type === 'housing_levy') return '🏠';
 return '📋';
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
 const [refOpen, setRefOpen] = useState(false);

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

 const filedCount = useMemo(() => {
 if (!data) return 0;
 return data.obligations.filter((o) => o.status === 'paid' || o.status === 'submitted').length;
 }, [data]);

 const daysUntilDue = useMemo(() => {
 if (!data) return null;
 const due = new Date(data.compliance.dueDate);
 const diff = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
 return diff;
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
 setTimeout(() => setMessage(null), 3000);
 } catch (e) {
 setError(e instanceof Error ? e.message : 'Failed to update item');
 } finally {
 setItemBusy(null);
 }
 };

 const gaps = data?.compliance.employeeDataGaps;
 const hasCriticalGaps = Boolean(gaps && (gaps.kraPin > 0 || gaps.idNumber > 0));
 const progressPct = data ? (filedCount / data.obligations.length) * 100 : 0;

 return (
 <DashboardPage>
 <DashboardPageHeader
 title={`Statutory · ${entityConfig.payroll.runLabel}`}
 icon={Landmark}
 description={
 <>
 <EntityContextBanner />
 <p className="mt-2">{entityConfig.payroll.statutoryComplianceIntro}</p>
 </>
 }
 meta={
 data?.client ? (
 <>
 Employer: <span className="font-medium text-neutral-700">{data.client.name}</span>
 </>
 ) : undefined
 }
 actions={
 <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
 <select
 value={month}
 onChange={(e) => setMonth(parseInt(e.target.value, 10))}
 className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
 >
 {MONTHS.map((m, idx) => (
 <option key={m} value={idx + 1}>{m}</option>
 ))}
 </select>
 <input
 type="number"
 value={year}
 onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
 className="w-28 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
 min={2020}
 max={2100}
 />
 <button
 type="button"
 onClick={saveSnapshot}
 disabled={saving || loading}
 className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
 >
 {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
 Save filing snapshot
 </button>
 </div>
 }
 />

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
 <div className="dashboard-surface p-8 text-neutral-500 text-sm flex items-center gap-2">
 <Loader2 className="w-4 h-4 animate-spin" /> Loading statutory data...
 </div>
 ) : !data || !totals ? (
 <div className="dashboard-surface p-8 text-neutral-500 text-sm">
 No statutory data available for this period.
 </div>
 ) : (
 <>
 {/* Compliance Progress Bar */}
 <div className="dashboard-stat-card sm:p-5 mb-6 shadow-sm">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
 <TrendingUp className="w-5 h-5 text-primary-700" />
 </div>
 <div>
 <p className="text-sm font-semibold text-primary-900">
 {filedCount} of {data.obligations.length} obligations filed
 </p>
 <p className="text-xs text-neutral-500">
 {MONTHS[month - 1]} {year} compliance cycle
 </p>
 </div>
 </div>
 {daysUntilDue !== null && (
 <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${countdownClass(daysUntilDue)}`}>
 <Clock className="w-3.5 h-3.5" />
 {daysUntilDue > 0 ? `${daysUntilDue} days until deadline` : daysUntilDue === 0 ? 'Due today' : `${Math.abs(daysUntilDue)} days overdue`}
 </div>
 )}
 </div>
 <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
 <div
 className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500"
 style={{ width: `${progressPct}%` }}
 />
 </div>
 </div>

 {/* Obligation Cards Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 {data.obligations.map((item) => {
 const action = nextAction(item.status);
 return (
 <div
 key={item.obligationType}
 className={`dashboard-surface border-l-4 ${statusBorderColor(item.status)} shadow-sm overflow-hidden`}
 >
 <div className="p-4">
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-2">
 <span className="text-lg">{obligationIcon(item.obligationType)}</span>
 <div>
 <p className="text-sm font-bold text-primary-900 uppercase tracking-wide">
 {item.obligationType.replace('_', ' ')}
 </p>
 <p className="text-[11px] text-neutral-500">{item.authority}</p>
 </div>
 </div>
 </div>

 <div className="space-y-2 mb-3">
 <div className="flex justify-between text-xs">
 <span className="text-neutral-500">Employee</span>
 <span className="font-medium text-neutral-700 tabular-nums">{money(item.employeeAmount)}</span>
 </div>
 {item.employerAmount > 0 && (
 <div className="flex justify-between text-xs">
 <span className="text-neutral-500">Employer</span>
 <span className="font-medium text-neutral-700 tabular-nums">{money(item.employerAmount)}</span>
 </div>
 )}
 <div className="flex justify-between text-sm pt-1 border-t border-neutral-100">
 <span className="font-medium text-neutral-700">Total due</span>
 <span className="font-bold text-primary-900 tabular-nums">{money(item.liabilityAmount)}</span>
 </div>
 </div>

 <div className="flex items-center justify-between mb-3">
 <span className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(item.status)}`}>
 {statusLabel(item.status)}
 </span>
 <span className="text-[11px] text-neutral-400 tabular-nums">
 Due {new Date(item.dueDate).toLocaleDateString(entityConfig.currency.locale, { day: 'numeric', month: 'short' })}
 </span>
 </div>
 </div>

 <div className="px-4 pb-4">
 {item.id && action ? (
 <button
 type="button"
 onClick={() => updateItemStatus(item.id!, action.target)}
 disabled={itemBusy === item.id}
 className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${action.style}`}
 >
 {itemBusy === item.id ? 'Updating...' : action.label}
 </button>
 ) : item.id && item.status === 'paid' ? (
 <div className="w-full py-2 rounded-lg text-xs font-semibold text-center bg-emerald-50 text-emerald-700 border border-emerald-200">
 <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
 Payment confirmed
 </div>
 ) : (
 <div className="w-full py-2 rounded-lg text-xs text-center text-neutral-500 bg-neutral-50 border border-neutral-200">
 Save snapshot to enable actions
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {/* Summary Stats Row */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
 <div className="dashboard-stat-card shadow-sm">
 <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500">Gross payroll</p>
 <p className="text-lg font-bold text-primary-900 mt-1 tabular-nums">{money(totals.totalGrossPay)}</p>
 </div>
 <div className="dashboard-stat-card shadow-sm">
 <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500">Total liability</p>
 <p className="text-lg font-bold text-primary-900 mt-1 tabular-nums">{money(totalLiability)}</p>
 </div>
 <div className="dashboard-stat-card shadow-sm">
 <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500">Coverage</p>
 <p className="text-lg font-bold text-primary-900 mt-1 tabular-nums">{data.compliance.coveragePct.toFixed(1)}%</p>
 <p className="text-[10px] text-neutral-500 mt-0.5">
 {totals.payrollCount} records / {totals.employeeCount} staff
 </p>
 </div>
 <div className="dashboard-stat-card shadow-sm">
 <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500">Return status</p>
 <span className={`inline-flex mt-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusBadgeClass(data.compliance.status)}`}>
 {statusLabel(data.compliance.status)}
 </span>
 </div>
 </div>

 {/* Filing Readiness + Notes */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
 <div className={`rounded-xl border p-5 shadow-sm ${hasCriticalGaps ? 'border-amber-200 bg-amber-50/50' : 'border-emerald-200 bg-emerald-50/50'}`}>
 <h3 className="text-sm font-semibold flex items-center gap-2 text-neutral-900 mb-4">
 {hasCriticalGaps ? <ShieldAlert className="w-4 h-4 text-amber-700" /> : <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
 Employee filing readiness
 </h3>
 <div className="grid grid-cols-2 gap-3">
 <div className="rounded-lg bg-white/80 border border-neutral-200/60 p-3">
 <p className="text-[10px] uppercase tracking-wide text-neutral-500 font-medium">National ID</p>
 <p className="text-lg font-bold text-neutral-900 tabular-nums">{gaps?.idNumber ?? 0}</p>
 <p className="text-[10px] text-neutral-500">missing</p>
 </div>
 <div className="rounded-lg bg-white/80 border border-neutral-200/60 p-3">
 <p className="text-[10px] uppercase tracking-wide text-neutral-500 font-medium">{entityConfig.payroll.taxPinLabel}</p>
 <p className="text-lg font-bold text-neutral-900 tabular-nums">{gaps?.kraPin ?? 0}</p>
 <p className="text-[10px] text-neutral-500">missing</p>
 </div>
 <div className="rounded-lg bg-white/80 border border-neutral-200/60 p-3">
 <p className="text-[10px] uppercase tracking-wide text-neutral-500 font-medium">NSSF Number</p>
 <p className="text-lg font-bold text-neutral-900 tabular-nums">{gaps?.nssfNumber ?? 0}</p>
 <p className="text-[10px] text-neutral-500">missing</p>
 </div>
 <div className="rounded-lg bg-white/80 border border-neutral-200/60 p-3">
 <p className="text-[10px] uppercase tracking-wide text-neutral-500 font-medium">{entityConfig.payroll.missingHealthSchemeGapLabel}</p>
 <p className="text-lg font-bold text-neutral-900 tabular-nums">{gaps?.nhifNumber ?? 0}</p>
 <p className="text-[10px] text-neutral-500">missing</p>
 </div>
 </div>
 </div>

 <div className="dashboard-surface p-5 shadow-sm">
 <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2 mb-3">
 <AlertTriangle className="w-4 h-4 text-primary-700" />
 Filing notes
 </h3>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={6}
 placeholder="Capture filing references, audit comments, and payment confirmations."
 className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
 />
 </div>
 </div>

 {/* Collapsible Reference Section */}
 <div className="dashboard-surface shadow-sm overflow-hidden">
 <button
 type="button"
 onClick={() => setRefOpen(!refOpen)}
 className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
 >
 <span className="flex items-center gap-2">
 <Landmark className="w-4 h-4 text-primary-600" />
 Statutory coverage reference
 </span>
 <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${refOpen ? 'rotate-180' : ''}`} />
 </button>
 {refOpen && (
 <div className="px-5 pb-5 border-t border-neutral-100">
 <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
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
 )}
 </div>
 </>
 )}
 </DashboardPage>
 );
}
