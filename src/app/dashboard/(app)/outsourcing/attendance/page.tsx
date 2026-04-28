'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, Plus } from 'lucide-react';

type Client = { id: string; name: string };
type Summary = {
  id: string;
  employeeId: string;
  workDate: string;
  firstInAt: string | null;
  lastOutAt: string | null;
  minutesWorked: number;
  lateMinutes: number;
  overtimeMinutes: number;
  holidayOvertimeMinutes?: number;
  publicHolidayName?: string | null;
  status: 'draft' | 'reconciled' | 'approved';
  employee: { firstName: string; lastName: string; employeeNumber: string | null };
};
type Exception = {
  id: string;
  employeeId: string;
  workDate: string;
  type: string;
  status: 'open' | 'resolved' | 'ignored';
  description: string;
  employee: { firstName: string; lastName: string; employeeNumber: string | null };
};

export default function OutsourcingAttendancePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [from, setFrom] = useState(new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [employeeId, setEmployeeId] = useState('');
  const [observedAt, setObservedAt] = useState('');
  const [kind, setKind] = useState<'check_in' | 'check_out'>('check_in');
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [clientsRes, attendanceRes] = await Promise.all([
        fetch('/api/outsourcing/clients', { cache: 'no-store' }),
        fetch(`/api/outsourcing/attendance?clientId=${encodeURIComponent(selectedClientId)}&from=${from}&to=${to}`, {
          cache: 'no-store',
        }),
      ]);
      const clientsJson = await clientsRes.json();
      const attendanceJson = await attendanceRes.json();
      if (!clientsRes.ok) throw new Error(clientsJson.error || 'Failed to load clients');
      if (!attendanceRes.ok) throw new Error(attendanceJson.error || 'Failed to load attendance');
      setClients(clientsJson);
      if (!selectedClientId && clientsJson[0]?.id) setSelectedClientId(clientsJson[0].id);
      setSummaries(attendanceJson.summaries ?? []);
      setExceptions(attendanceJson.exceptions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [selectedClientId, from, to]);

  const openExceptions = useMemo(() => exceptions.filter((item) => item.status === 'open').length, [exceptions]);
  const exceptionByEmployeeDate = useMemo(() => {
    const map = new Map<string, Exception[]>();
    for (const item of exceptions) {
      const key = `${item.employeeId}:${item.workDate.slice(0, 10)}`;
      const bucket = map.get(key) ?? [];
      bucket.push(item);
      map.set(key, bucket);
    }
    return map;
  }, [exceptions]);

  async function addManualEvent() {
    if (!employeeId || !observedAt) return;
    setError(null);
    const res = await fetch('/api/outsourcing/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, observedAt, kind }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Failed to save attendance event.');
      return;
    }
    setEmployeeId('');
    setObservedAt('');
    await load();
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Attendance
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Reconciled day summaries with manual override support.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4 mb-4">
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="h-10 rounded border border-neutral-300 px-3 text-sm bg-white"
        >
          <option value="">Select facility</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded border border-neutral-300 px-3 text-sm bg-white" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded border border-neutral-300 px-3 text-sm bg-white" />
        <div className="h-10 rounded border border-amber-200 bg-amber-50 px-3 text-sm text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Open exceptions: {openExceptions}
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 mb-4">
        <h2 className="text-sm font-semibold text-neutral-800 mb-2 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Manual attendance override
        </h2>
        <div className="grid gap-2 sm:grid-cols-4">
          <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Employee ID" className="h-9 rounded border border-neutral-300 px-2 text-sm" />
          <input type="datetime-local" value={observedAt} onChange={(e) => setObservedAt(e.target.value)} className="h-9 rounded border border-neutral-300 px-2 text-sm" />
          <select value={kind} onChange={(e) => setKind(e.target.value as 'check_in' | 'check_out')} className="h-9 rounded border border-neutral-300 px-2 text-sm">
            <option value="check_in">Check in</option>
            <option value="check_out">Check out</option>
          </select>
          <button type="button" onClick={() => void addManualEvent()} className="h-9 rounded bg-primary-700 text-white text-sm inline-flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Save event
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Employee</th>
              <th className="text-left px-3 py-2">Clock in</th>
              <th className="text-left px-3 py-2">Clock out</th>
              <th className="text-left px-3 py-2">Worked</th>
              <th className="text-left px-3 py-2">Late</th>
              <th className="text-left px-3 py-2">Overtime</th>
              <th className="text-left px-3 py-2">Holiday</th>
              <th className="text-left px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <tr key={summary.id} className="border-t border-neutral-100">
                <td className="px-3 py-2">{summary.workDate.slice(0, 10)}</td>
                <td className="px-3 py-2">
                  {summary.employee.employeeNumber ? `${summary.employee.employeeNumber} - ` : ''}
                  {summary.employee.firstName} {summary.employee.lastName}
                </td>
                <td className="px-3 py-2">{summary.firstInAt ? new Date(summary.firstInAt).toLocaleString() : '—'}</td>
                <td className="px-3 py-2">{summary.lastOutAt ? new Date(summary.lastOutAt).toLocaleString() : 'Missing'}</td>
                <td className="px-3 py-2">{(summary.minutesWorked / 60).toFixed(2)}h</td>
                <td className="px-3 py-2">{summary.lateMinutes}m</td>
                <td className="px-3 py-2">
                  {summary.publicHolidayName ? (
                    <div className="flex flex-col gap-1">
                      <span>{summary.overtimeMinutes}m</span>
                      <span className="inline-flex w-fit rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Holiday 2x
                      </span>
                    </div>
                  ) : (
                    `${summary.overtimeMinutes}m`
                  )}
                </td>
                <td className="px-3 py-2">
                  {summary.publicHolidayName ? (
                    <span className="inline-flex rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {summary.publicHolidayName}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-3 py-2">
                  {(() => {
                    const key = `${summary.employeeId}:${summary.workDate.slice(0, 10)}`;
                    const rowExceptions = exceptionByEmployeeDate.get(key) ?? [];
                    const missingOut = rowExceptions.some((item) => item.type === 'missing_check_out' && item.status === 'open');
                    const label = missingOut ? 'pending_review' : summary.status === 'approved' ? 'corrected' : 'complete';
                    const cls =
                      label === 'complete'
                        ? 'bg-emerald-50 text-emerald-700'
                        : label === 'pending_review'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700';
                    return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
                  })()}
                </td>
              </tr>
            ))}
            {!loading && summaries.length === 0 ? (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-neutral-500">No attendance summaries found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
