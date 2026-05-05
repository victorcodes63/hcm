'use client';

import { useEffect, useState } from 'react';

type LeaveType = { id: string; name: string; daysPerYear: number };
type LeaveBalance = {
  leaveTypeId: string;
  leaveTypeName: string;
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
};
type LeaveRow = {
  id: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string | null;
};

export default function EssLeavePage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [rows, setRows] = useState<LeaveRow[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });

  async function load() {
    const [typesRes, rowsRes, balancesRes] = await Promise.all([
      fetch('/api/ess/leave/types'),
      fetch('/api/ess/leave/applications'),
      fetch('/api/ess/leave/balances'),
    ]);
    const t = await typesRes.json().catch(() => []);
    const r = await rowsRes.json().catch(() => []);
    const b = await balancesRes.json().catch(() => []);
    setTypes(Array.isArray(t) ? t : []);
    setRows(Array.isArray(r) ? r : []);
    setBalances(Array.isArray(b) ? b : []);
    if (Array.isArray(t) && t[0] && !form.leaveTypeId) {
      setForm((prev) => ({ ...prev, leaveTypeId: t[0].id }));
    }
  }

  useEffect(() => {
    load().catch(() => {
      setTypes([]);
      setRows([]);
      setBalances([]);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/ess/leave/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not submit leave request.');
        return;
      }
      setRows((prev) => [data as LeaveRow, ...prev]);
      setForm((prev) => ({ ...prev, startDate: '', endDate: '', reason: '' }));
      await load();
    } catch {
      setError('Could not submit leave request.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">Leave</h1>

      <section className="bg-white border border-neutral-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Balance summary</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {balances.map((balance) => (
            <div key={balance.leaveTypeId} className="border border-neutral-200 rounded-lg p-3">
              <p className="text-sm font-medium text-neutral-900">{balance.leaveTypeName}</p>
              <p className="text-xs text-neutral-600 mt-1">
                Entitled: {balance.entitled} | Used: {balance.used} | Pending: {balance.pending}
              </p>
              <p className={`text-sm mt-1 font-semibold ${balance.remaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                Remaining: {balance.remaining}
              </p>
            </div>
          ))}
          {!balances.length ? (
            <p className="text-sm text-neutral-500">No balance records found for current year.</p>
          ) : null}
        </div>

        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Request leave</h2>
        {error ? <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3">{error}</p> : null}
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-3">
          <select
            value={form.leaveTypeId}
            onChange={(e) => setForm((f) => ({ ...f, leaveTypeId: e.target.value }))}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.daysPerYear} days/year)
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            required
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            required
          />
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            placeholder="Reason (optional)"
          />
          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? 'Submitting...' : 'Submit leave request'}
          </button>
        </form>
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Start</th>
              <th className="text-left px-3 py-2">End</th>
              <th className="text-left px-3 py-2">Days</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-neutral-100">
                <td className="px-3 py-2">{row.leaveTypeName}</td>
                <td className="px-3 py-2">{new Date(row.startDate).toLocaleDateString()}</td>
                <td className="px-3 py-2">{new Date(row.endDate).toLocaleDateString()}</td>
                <td className="px-3 py-2">{row.days}</td>
                <td className="px-3 py-2 capitalize">{row.status}</td>
                <td className="px-3 py-2">{row.reason || '-'}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">No leave requests found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
