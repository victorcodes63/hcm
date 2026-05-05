'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DISCIPLINARY_STATUSES, GRIEVANCE_STATUSES } from '@/lib/east-africa-hr-policy';

type CaseRow = {
  id: string;
  caseNumber: string;
  type: string;
  severity: string;
  status: string;
  subject: string;
  createdAt: string;
  actionCount: number;
  laborJurisdiction?: string;
  employee: { firstName: string; lastName: string; employeeNumber: string | null };
};

type GrievanceRow = {
  id: string;
  grievanceNumber: string;
  status: string;
  category: string;
  subject: string;
  submittedAt: string;
  employee: { firstName: string; lastName: string };
};

export default function DisciplinaryPage() {
  const [tab, setTab] = useState<'cases' | 'grievances'>('cases');
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [grievances, setGrievances] = useState<GrievanceRow[]>([]);
  const [caseStatusFilter, setCaseStatusFilter] = useState('');
  const [grievanceStatusFilter, setGrievanceStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [casesRes, grievancesRes] = await Promise.all([
        fetch(`/api/disciplinary/cases${caseStatusFilter ? `?status=${encodeURIComponent(caseStatusFilter)}` : ''}`),
        fetch(`/api/grievances${grievanceStatusFilter ? `?status=${encodeURIComponent(grievanceStatusFilter)}` : ''}`),
      ]);
      const [casesData, grievancesData] = await Promise.all([casesRes.json().catch(() => []), grievancesRes.json().catch(() => [])]);
      if (cancelled) return;
      setCases(Array.isArray(casesData) ? casesData : []);
      setGrievances(Array.isArray(grievancesData) ? grievancesData : []);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [caseStatusFilter, grievanceStatusFilter]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary-900">Disciplinary & Grievance Management</h1>
      <p className="max-w-3xl text-sm text-neutral-600">
        Case workflow follows progressive discipline, show-cause, and hearing stages aligned with configurable East African labour references (see each case file). Employees use ESS to acknowledge formal steps and to raise grievances separately.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'cases' ? 'bg-primary-900 text-white' : 'bg-neutral-100 text-primary-900 hover:bg-neutral-200'}`}
          onClick={() => setTab('cases')}
        >
          Cases
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'grievances' ? 'bg-primary-900 text-white' : 'bg-neutral-100 text-primary-900 hover:bg-neutral-200'}`}
          onClick={() => setTab('grievances')}
        >
          Grievances
        </button>
      </div>
      {tab === 'cases' ? (
        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-neutral-600">Filter</label>
            <select
              className="rounded border border-neutral-300 px-3 py-2 text-sm"
              value={caseStatusFilter}
              onChange={(e) => setCaseStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {DISCIPLINARY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="text-sm text-neutral-500">Loading...</p>
          ) : cases.length === 0 ? (
            <p className="text-sm text-neutral-600">No cases match this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="pb-2 font-medium">Case</th>
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Severity</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((item) => (
                    <tr key={item.id} className="border-t border-neutral-100">
                      <td className="py-2">
                        <Link className="font-medium text-primary-800 hover:underline" href={`/dashboard/disciplinary/cases/${item.id}`}>
                          {item.caseNumber}
                        </Link>
                        <div className="text-xs text-neutral-500">{item.subject}</div>
                      </td>
                      <td>
                        {item.employee.firstName} {item.employee.lastName}
                      </td>
                      <td>{item.type.replaceAll('_', ' ')}</td>
                      <td>{item.severity.replaceAll('_', ' ')}</td>
                      <td>{item.status.replaceAll('_', ' ')}</td>
                      <td>
                        <Link className="text-primary-700 hover:underline" href={`/dashboard/disciplinary/cases/${item.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-neutral-600">Filter</label>
            <select
              className="rounded border border-neutral-300 px-3 py-2 text-sm"
              value={grievanceStatusFilter}
              onChange={(e) => setGrievanceStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {GRIEVANCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="text-sm text-neutral-500">Loading...</p>
          ) : grievances.length === 0 ? (
            <p className="text-sm text-neutral-600">No grievances match this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="pb-2 font-medium">Grievance</th>
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((item) => (
                    <tr key={item.id} className="border-t border-neutral-100">
                      <td className="py-2">
                        <span className="font-medium text-neutral-900">{item.grievanceNumber}</span>
                        <div className="text-xs text-neutral-500">{item.subject}</div>
                      </td>
                      <td>
                        {item.employee.firstName} {item.employee.lastName}
                      </td>
                      <td>{item.category.replaceAll('_', ' ')}</td>
                      <td>{item.status.replaceAll('_', ' ')}</td>
                      <td>{new Date(item.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <Link className="text-primary-700 hover:underline" href={`/dashboard/disciplinary/grievances/${item.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
