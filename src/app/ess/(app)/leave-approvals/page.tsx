'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

type TeamLeaveRow = {
  id: string;
  employeeName: string;
  employeeNumber: string | null;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string | null;
};

type LeaveAuditRow = {
  id: string;
  action: string;
  actorEmail: string | null;
  metadata: { note?: string } | null;
  createdAt: string;
};

type LeaveAuditResponse = {
  items: LeaveAuditRow[];
  page: number;
  totalPages: number;
};

export default function EssLeaveApprovalsPage() {
  const [rows, setRows] = useState<TeamLeaveRow[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [auditOpen, setAuditOpen] = useState<Record<string, boolean>>({});
  const [audits, setAudits] = useState<Record<string, LeaveAuditRow[]>>({});
  const [auditAction, setAuditAction] = useState<Record<string, string>>({});
  const [auditPage, setAuditPage] = useState<Record<string, number>>({});
  const [auditTotalPages, setAuditTotalPages] = useState<Record<string, number>>({});
  const [auditSearch, setAuditSearch] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch('/api/ess/leave/team');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Could not load leave approvals.');
      return;
    }
    setRows(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load().catch(() => setError('Could not load leave approvals.'));
  }, []);

  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === 'pending').length,
    [rows],
  );

  async function review(id: string, status: 'approved' | 'rejected') {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/ess/leave/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: notes[id] || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not update leave status.');
        return;
      }
      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: data.status ?? status } : row,
        ),
      );
      setAuditOpen((prev) => ({ ...prev, [id]: true }));
      await loadAudit(id);
    } catch {
      setError('Could not update leave status.');
    } finally {
      setBusyId(null);
    }
  }

  async function loadAudit(id: string, opts?: { action?: string; page?: number }) {
    const action = opts?.action ?? auditAction[id] ?? '';
    const page = opts?.page ?? auditPage[id] ?? 1;
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    params.set('page', String(page));
    params.set('pageSize', '5');
    const res = await fetch(`/api/ess/leave/applications/${id}/audit?${params.toString()}`);
    const data = (await res.json().catch(() => ({}))) as LeaveAuditResponse;
    if (!res.ok) return;
    setAudits((prev) => ({ ...prev, [id]: Array.isArray(data?.items) ? data.items : [] }));
    setAuditTotalPages((prev) => ({
      ...prev,
      [id]: Number(data?.totalPages) > 0 ? Number(data.totalPages) : 1,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">Leave approvals</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Pending approvals: {pendingCount}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      ) : null}

      <section className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-3 py-2">Employee</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Start</th>
              <th className="text-left px-3 py-2">End</th>
              <th className="text-left px-3 py-2">Days</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Reason</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Fragment key={row.id}>
                <tr className="border-b border-neutral-100">
                  <td className="px-3 py-2">
                    <p className="font-medium text-neutral-900">{row.employeeName}</p>
                    <p className="text-xs text-neutral-500">{row.employeeNumber || '-'}</p>
                  </td>
                  <td className="px-3 py-2">{row.leaveTypeName}</td>
                  <td className="px-3 py-2">{new Date(row.startDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{new Date(row.endDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{row.days}</td>
                  <td className="px-3 py-2 capitalize">{row.status}</td>
                  <td className="px-3 py-2">{row.reason || '-'}</td>
                  <td className="px-3 py-2 space-y-2">
                    {row.status === 'pending' ? (
                      <>
                        <input
                          type="text"
                          value={notes[row.id] || ''}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                          placeholder="Approval note (optional)"
                          className="w-full px-2 py-1 border border-neutral-300 rounded text-xs"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => review(row.id, 'approved')}
                            className="px-2.5 py-1 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => review(row.id, 'rejected')}
                            className="px-2.5 py-1 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">Reviewed</span>
                        <button
                          type="button"
                          className="text-xs text-primary-700 hover:text-primary-800"
                          onClick={async () => {
                            const next = !auditOpen[row.id];
                            setAuditOpen((prev) => ({ ...prev, [row.id]: next }));
                              if (next) await loadAudit(row.id);
                          }}
                        >
                          {auditOpen[row.id] ? 'Hide history' : 'View history'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {auditOpen[row.id] ? (
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <td colSpan={8} className="px-3 py-2">
                      <div className="mb-2 grid sm:grid-cols-2 gap-2">
                        <select
                          value={auditAction[row.id] || ''}
                          onChange={async (e) => {
                            const action = e.target.value;
                            setAuditAction((prev) => ({ ...prev, [row.id]: action }));
                            setAuditPage((prev) => ({ ...prev, [row.id]: 1 }));
                            await loadAudit(row.id, { action, page: 1 });
                          }}
                          className="px-2 py-1 border border-neutral-300 rounded text-xs"
                        >
                          <option value="">All actions</option>
                          <option value="requested">Requested</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <input
                          type="text"
                          value={auditSearch[row.id] || ''}
                          onChange={(e) => setAuditSearch((prev) => ({ ...prev, [row.id]: e.target.value }))}
                          placeholder="Filter loaded history by actor/note..."
                          className="px-2 py-1 border border-neutral-300 rounded text-xs"
                        />
                      </div>
                      {(audits[row.id] || []).filter((event) => {
                        const q = (auditSearch[row.id] || '').toLowerCase().trim();
                        if (!q) return true;
                        const note = typeof event.metadata?.note === 'string' ? event.metadata.note : '';
                        return (
                          event.action.toLowerCase().includes(q) ||
                          (event.actorEmail || '').toLowerCase().includes(q) ||
                          note.toLowerCase().includes(q)
                        );
                      }).length ? (
                        <div className="space-y-1">
                          {(audits[row.id] || []).filter((event) => {
                            const q = (auditSearch[row.id] || '').toLowerCase().trim();
                            if (!q) return true;
                            const note = typeof event.metadata?.note === 'string' ? event.metadata.note : '';
                            return (
                              event.action.toLowerCase().includes(q) ||
                              (event.actorEmail || '').toLowerCase().includes(q) ||
                              note.toLowerCase().includes(q)
                            );
                          }).map((event) => (
                            <p key={event.id} className="text-xs text-neutral-700">
                              {new Date(event.createdAt).toLocaleString()} - {event.action} by {event.actorEmail || 'unknown'}
                              {event.metadata?.note ? ` (note: ${event.metadata.note})` : ''}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500">No audit history available.</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          type="button"
                          className="px-2 py-1 border border-neutral-300 rounded text-xs disabled:opacity-50"
                          disabled={(auditPage[row.id] || 1) <= 1}
                          onClick={async () => {
                            const nextPage = Math.max(1, (auditPage[row.id] || 1) - 1);
                            setAuditPage((prev) => ({ ...prev, [row.id]: nextPage }));
                            await loadAudit(row.id, { page: nextPage });
                          }}
                        >
                          Previous
                        </button>
                        <p className="text-xs text-neutral-500">
                          Page {auditPage[row.id] || 1} / {auditTotalPages[row.id] || 1}
                        </p>
                        <button
                          type="button"
                          className="px-2 py-1 border border-neutral-300 rounded text-xs disabled:opacity-50"
                          disabled={(auditPage[row.id] || 1) >= (auditTotalPages[row.id] || 1)}
                          onClick={async () => {
                            const nextPage = Math.min(
                              auditTotalPages[row.id] || 1,
                              (auditPage[row.id] || 1) + 1,
                            );
                            setAuditPage((prev) => ({ ...prev, [row.id]: nextPage }));
                            await loadAudit(row.id, { page: nextPage });
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-neutral-500">
                  No team leave requests found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
