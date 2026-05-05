'use client';

import { useEffect, useState } from 'react';

type PayslipRow = {
  id: string;
  month: number;
  year: number;
  basicPay: number;
  grossPay: number;
  netPay: number;
  paye: number;
  nssf: number;
  nhif: number;
  ahl: number;
  status: string;
};

export default function EssPayslipsPage() {
  const [rows, setRows] = useState<PayslipRow[]>([]);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (year) params.set('year', year);
    if (month) params.set('month', month);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('pageSize', '10');
    fetch(`/api/ess/payslips?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        setRows(items);
        setTotalPages(Number(data?.totalPages) > 0 ? Number(data.totalPages) : 1);
      })
      .catch(() => {
        setRows([]);
        setTotalPages(1);
      });
  }, [month, page, status, year]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">Payslips</h1>
      <section className="bg-white border border-neutral-200 rounded-xl p-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            type="number"
            min={2000}
            max={3000}
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            placeholder="Year"
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          />
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          >
            <option value="">All months</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Month {i + 1}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setYear('');
              setMonth('');
              setStatus('');
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Clear filters
          </button>
        </div>
      </section>
      <section className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-3 py-2">Period</th>
              <th className="text-left px-3 py-2">Basic</th>
              <th className="text-left px-3 py-2">Gross</th>
              <th className="text-left px-3 py-2">PAYE</th>
              <th className="text-left px-3 py-2">NSSF</th>
              <th className="text-left px-3 py-2">SHIF</th>
              <th className="text-left px-3 py-2">AHL</th>
              <th className="text-left px-3 py-2">Net</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-neutral-100">
                <td className="px-3 py-2">{row.month}/{row.year}</td>
                <td className="px-3 py-2">KES {row.basicPay.toLocaleString()}</td>
                <td className="px-3 py-2">KES {row.grossPay.toLocaleString()}</td>
                <td className="px-3 py-2">KES {row.paye.toLocaleString()}</td>
                <td className="px-3 py-2">KES {row.nssf.toLocaleString()}</td>
                <td className="px-3 py-2">KES {row.nhif.toLocaleString()}</td>
                <td className="px-3 py-2">KES {row.ahl.toLocaleString()}</td>
                <td className="px-3 py-2 font-semibold">KES {row.netPay.toLocaleString()}</td>
                <td className="px-3 py-2 capitalize">{row.status}</td>
                <td className="px-3 py-2">
                  <a
                    href={`/api/ess/payslips/${row.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-700 hover:text-primary-800 font-medium"
                  >
                    Download PDF
                  </a>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-neutral-500">No payslips available yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 rounded-md border border-neutral-300 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <p className="text-sm text-neutral-600">
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1.5 rounded-md border border-neutral-300 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
