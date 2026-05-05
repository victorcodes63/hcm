'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getJurisdictionPolicy } from '@/lib/east-africa-hr-policy';

type Row = {
  id: string;
  caseNumber: string;
  type: string;
  status: string;
  severity: string;
  subject: string;
  laborJurisdiction: string;
  showCauseResponseDueAt: string | null;
  hearingAt: string | null;
  createdAt: string;
};

function label(s: string) {
  return s.replaceAll('_', ' ');
}

export default function EssDisciplinaryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch('/api/ess/disciplinary/cases');
      const data = await res.json().catch(() => []);
      if (!cancelled) {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-primary-900">My disciplinary cases</h1>
        <p className="mt-1 text-sm text-neutral-600">
          View the status of workplace disciplinary matters involving you. Submit grievances separately under{' '}
          <Link href="/ess/grievances" className="font-medium text-primary-700 underline">
            Grievances
          </Link>
          .
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Fair process & labour law</p>
        <p className="mt-1 text-amber-900/90">
          Your employer should follow written procedures, natural justice, and the labour laws that apply to your contract.
          This portal helps you track steps and acknowledge formal notices — it does not replace legal advice.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-neutral-600">You have no disciplinary cases on file.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="pb-2">Case</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Severity</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Law frame</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const pol = getJurisdictionPolicy(item.laborJurisdiction);
                return (
                  <tr key={item.id} className="border-t border-neutral-100">
                    <td className="py-2">
                      <Link className="font-medium text-primary-800 hover:underline" href={`/ess/disciplinary/cases/${item.id}`}>
                        {item.caseNumber}
                      </Link>
                      <div className="text-xs text-neutral-500">{item.subject}</div>
                    </td>
                    <td>{label(item.type)}</td>
                    <td>{label(item.severity)}</td>
                    <td>{label(item.status)}</td>
                    <td className="text-xs">{pol.label}</td>
                    <td className="text-right">
                      <Link className="text-primary-700 hover:underline" href={`/ess/disciplinary/cases/${item.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
