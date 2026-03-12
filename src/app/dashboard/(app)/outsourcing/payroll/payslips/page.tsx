'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Mail, Loader2, Printer } from 'lucide-react';

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeNumber: string | null;
  clientName: string;
  departmentName: string | null;
  month: number;
  year: number;
  basicPay: string;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossPay: string;
  paye: string;
  nssf: string;
  nhif: string;
  netPay: string;
  status: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatAmount(val: string | number): string {
  return Number(val).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

function PayslipsContent() {
  const searchParams = useSearchParams();
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
  const clientId = searchParams.get('clientId') || '';
  const departmentId = searchParams.get('departmentId') || '';

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; skipped: number; errors?: string[] } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('month', String(month));
    params.set('year', String(year));
    if (clientId) params.set('clientId', clientId);
    if (departmentId) params.set('departmentId', departmentId);
    fetch(`/api/outsourcing/payroll?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPayrolls(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => {
        setPayrolls([]);
        setError('Failed to load payroll');
      })
      .finally(() => setLoading(false));
  }, [month, year, clientId, departmentId]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendPayslips = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/outsourcing/payroll/send-payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          year,
          ...(clientId ? { clientId } : {}),
          ...(departmentId ? { departmentId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendResult({ sent: 0, skipped: 0, errors: [data.error || 'Failed to send payslips'] });
        return;
      }
      setSendResult({
        sent: data.sent ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors,
      });
    } catch {
      setSendResult({ sent: 0, skipped: 0, errors: ['Network error'] });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-neutral-100 rounded w-full mb-2" />
        <div className="h-4 bg-neutral-100 rounded w-5/6" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="print:hidden flex items-center justify-between gap-4 mb-6 flex-wrap">
        <Link
          href="/dashboard/outsourcing/payroll"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-700"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to payroll
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSendPayslips}
            disabled={sending || payrolls.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {sending ? 'Sending…' : 'Send payslips via email'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800"
          >
            <Printer className="w-4 h-4" />
            Print payslips
          </button>
        </div>
      </div>

      {sendResult && (
        <div className="print:hidden mb-6 p-4 rounded-lg text-sm border bg-neutral-50 border-neutral-200">
          <p className="font-medium text-neutral-800">
            Sent: {sendResult.sent} · Skipped (no email): {sendResult.skipped}
          </p>
          {sendResult.errors && sendResult.errors.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-red-600 text-xs">
              {sendResult.errors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {sendResult.errors.length > 5 && (
                <li>…and {sendResult.errors.length - 5} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="print:hidden mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {payrolls.length === 0 ? (
        <div className="p-8 text-center text-neutral-500">
          No payroll records for {MONTHS[month - 1]} {year}.
        </div>
      ) : (
        <div className="space-y-8 print:space-y-0">
          {Array.from({ length: Math.ceil(payrolls.length / 4) }, (_, pageIndex) => {
            const pagePayrolls = payrolls.slice(pageIndex * 4, pageIndex * 4 + 4);
            const isLastPage = pageIndex === Math.ceil(payrolls.length / 4) - 1;
            return (
              <div
                key={pageIndex}
                className={`grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-4 print:min-h-[275mm] print:place-content-start ${!isLastPage ? 'print:break-after-page' : ''}`}
              >
                <p className="print:col-span-2 print:text-[10px] print:text-red-600 print:font-medium print:mb-0 print:pb-1 hidden print:block">
                  Cut along dotted lines to separate payslips
                </p>
                {pagePayrolls.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 print:rounded-none print:border-2 print:border-dashed print:border-red-600 print:break-inside-avoid print:shadow-none print:p-3 print:min-h-[135mm]"
              >
                {/* Compact header for print (4 per A4) */}
                <div className="mb-6 pb-4 border-b-2 border-primary-900 print:mb-2 print:pb-1 print:border-b">
                  <div className="flex items-center gap-3 print:gap-1">
                    <Image src="/images/logo/logo_dark_ubxaCll.png" alt="Eagle HR" width={120} height={36} className="h-9 w-auto print:h-5" />
                    <span className="text-sm font-medium text-neutral-600 print:text-[9px]">Eagle HR Consultants</span>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-6 print:mb-2">
                  <div>
                    <h1 className="text-xl font-bold text-primary-900 print:text-xs print:font-semibold">Payslip</h1>
                    <p className="text-sm text-neutral-600 mt-1 print:text-[9px] print:mt-0">
                      {MONTHS[month - 1]} {year}
                    </p>
                  </div>
                  <div className="text-right text-sm print:text-[9px]">
                    <p className="font-semibold text-primary-900">{p.employeeName}</p>
                    {p.employeeNumber && <p className="text-neutral-500 text-xs print:text-[8px]">No: {p.employeeNumber}</p>}
                    <p className="text-neutral-600 mt-1 print:mt-0">{p.clientName}</p>
                    {p.departmentName && <p className="text-neutral-500 text-xs print:text-[8px]">{p.departmentName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:gap-2 print:grid-cols-2">
                  <div className="border border-neutral-200 rounded-lg p-4 print:border-neutral-300 print:p-2 print:rounded-sm">
                    <h2 className="text-xs font-semibold uppercase text-neutral-600 mb-3 print:mb-1 print:text-[8px]">Earnings</h2>
                    <table className="w-full text-sm print:text-[9px]">
                      <tbody>
                        <tr>
                          <td className="py-1 print:py-0">Basic pay</td>
                          <td className="text-right tabular-nums font-medium">KES {formatAmount(p.basicPay)}</td>
                        </tr>
                        {Array.isArray(p.allowances) && p.allowances.length > 0 && p.allowances.map((a, i) => (
                          <tr key={i}>
                            <td className="py-1 print:py-0">{a.name}</td>
                            <td className="text-right tabular-nums">KES {formatAmount(a.amount)}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-neutral-200 font-semibold print:border-t-neutral-300">
                          <td className="py-2 print:py-0.5">Gross</td>
                          <td className="text-right tabular-nums">KES {formatAmount(p.grossPay)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="border border-neutral-200 rounded-lg p-4 print:border-neutral-300 print:p-2 print:rounded-sm">
                    <h2 className="text-xs font-semibold uppercase text-neutral-600 mb-3 print:mb-1 print:text-[8px]">Deductions</h2>
                    <table className="w-full text-sm print:text-[9px]">
                      <tbody>
                        <tr>
                          <td className="py-1 print:py-0">PAYE</td>
                          <td className="text-right tabular-nums">KES {formatAmount(p.paye)}</td>
                        </tr>
                        <tr>
                          <td className="py-1 print:py-0">NSSF</td>
                          <td className="text-right tabular-nums">KES {formatAmount(p.nssf)}</td>
                        </tr>
                        <tr>
                          <td className="py-1 print:py-0">NHIF</td>
                          <td className="text-right tabular-nums">KES {formatAmount(p.nhif)}</td>
                        </tr>
                        {Array.isArray(p.deductions) && p.deductions.length > 0 && p.deductions.map((d, i) => (
                          <tr key={i}>
                            <td className="py-1 print:py-0">{d.name}</td>
                            <td className="text-right tabular-nums">KES {formatAmount(d.amount)}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-neutral-200 font-semibold print:border-t-neutral-300">
                          <td className="py-2 print:py-0.5">Net pay</td>
                          <td className="text-right tabular-nums text-primary-700">KES {formatAmount(p.netPay)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="mt-6 text-xs text-neutral-500 print:mt-1 print:text-[7px] print:hidden">
                  Computer-generated. Contact Eagle HR for queries.
                </p>
              </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PayslipsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-neutral-100 rounded w-full mb-2" />
        <div className="h-4 bg-neutral-100 rounded w-5/6" />
      </div>
    }>
      <PayslipsContent />
    </Suspense>
  );
}
