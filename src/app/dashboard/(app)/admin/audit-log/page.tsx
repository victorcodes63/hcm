'use client';

import { useEffect, useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import type { AuditEventSummary } from '@/types/dashboard';

export default function AuditLogPage() {
  const [rows, setRows] = useState<AuditEventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [actorUserId, setActorUserId] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ limit: '300' });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (action) params.set('action', action);
    if (entityType) params.set('entityType', entityType);
    if (actorUserId) params.set('actorUserId', actorUserId);
    fetch(`/api/admin/audit-log?${params.toString()}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Failed to load audit log.');
        return data;
      })
      .then((data) => {
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load audit log.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [action, actorUserId, entityType, from, to]);

  const actionOptions = Array.from(new Set(rows.map((row) => row.action))).sort();
  const entityOptions = Array.from(new Set(rows.map((row) => row.entityType))).sort();
  const actorOptions = Array.from(
    new Map(
      rows
        .filter((row) => row.actorUserId)
        .map((row) => [row.actorUserId as string, row.actorNameOrEmail])
    ).entries()
  ).map(([value, label]) => ({ value, label }));

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <History className="w-6 h-6 text-primary-600" />
          Audit log
        </h1>
        <p className="text-sm text-neutral-600 mt-1">Immutable history of administrative and security-sensitive actions.</p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-100">{error}</p>}
      <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            aria-label="Filter from date"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            aria-label="Filter to date"
          />
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            aria-label="Filter by action"
          >
            <option value="">All actions</option>
            {actionOptions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            aria-label="Filter by resource"
          >
            <option value="">All resources</option>
            {entityOptions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <select
            value={actorUserId}
            onChange={(e) => setActorUserId(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            aria-label="Filter by user"
          >
            <option value="">All users</option>
            {actorOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[980px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase">When</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase">Actor</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase">Action</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase">Entity</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase">Route</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-100 align-top">
                    <td className="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{row.actorNameOrEmail}</td>
                    <td className="px-4 py-3 text-sm font-medium text-primary-900">{row.action}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{row.entityType}{row.entityId ? ` (${row.entityId})` : ''}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{row.route || '—'}</td>
                    <td className="px-4 py-3 text-xs text-neutral-600 max-w-[24rem]">
                      <pre className="whitespace-pre-wrap break-words">{row.metadata ? JSON.stringify(row.metadata, null, 2) : '—'}</pre>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-500">
                      No audit events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
