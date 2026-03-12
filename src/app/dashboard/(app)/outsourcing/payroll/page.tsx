'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Banknote, FileText, Mail, Loader2, Pencil, Calculator } from 'lucide-react';
import PayrollEditModal from '@/components/payroll/PayrollEditModal';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  clientName: string;
  departmentName: string | null;
  month: number;
  year: number;
  basicPay: string;
  grossPay: string;
  paye: string;
  nssf: string;
  nhif: string;
  netPay: string;
  status: string;
}

interface ClientOption {
  id: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  name: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function OutsourcingPayrollPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [scope, setScope] = useState<'all' | 'client' | 'department'>('all');
  const [clientId, setClientId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [editPayrollId, setEditPayrollId] = useState<string | null>(null);
  const [editEmployeeName, setEditEmployeeName] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('month', String(month));
      params.set('year', String(year));
      if (scope === 'client' && clientId.trim()) params.set('clientId', clientId.trim());
      if (scope === 'department' && departmentId.trim()) params.set('departmentId', departmentId.trim());
      const res = await fetch(`/api/outsourcing/payroll?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load payroll');
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payroll');
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/outsourcing/clients');
      const data = await res.json().catch(() => []);
      if (res.ok && Array.isArray(data)) {
        setClients(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      }
    } catch {
      setClients([]);
    }
  };

  const fetchDepartments = async (cid: string) => {
    try {
      const res = await fetch(`/api/outsourcing/clients/${cid}/departments`);
      const data = await res.json().catch(() => []);
      if (res.ok && Array.isArray(data)) {
        setDepartments(data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
      } else {
        setDepartments([]);
      }
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [month, year, scope, clientId, departmentId]);

  useEffect(() => {
    if (scope === 'department' && clientId.trim()) {
      fetchDepartments(clientId.trim());
    } else {
      setDepartments([]);
      setDepartmentId('');
    }
  }, [scope, clientId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateResult(null);
    setError(null);
    try {
      const body: Record<string, unknown> = { month, year };
      if (scope === 'client' && clientId.trim()) body.clientId = clientId.trim();
      if (scope === 'department' && departmentId.trim()) body.departmentId = departmentId.trim();
      const res = await fetch('/api/outsourcing/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setGenerateResult(data.message || `Created ${data.created ?? 0} payroll record(s).`);
      await fetchPayrolls();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  const payslipUrl = () => {
    const params = new URLSearchParams();
    params.set('month', String(month));
    params.set('year', String(year));
    if (scope === 'client' && clientId.trim()) params.set('clientId', clientId.trim());
    if (scope === 'department' && departmentId.trim()) params.set('departmentId', departmentId.trim());
    return `/dashboard/outsourcing/payroll/payslips?${params}`;
  };

  const canGenerate = scope === 'all' || (scope === 'client' && clientId.trim()) || (scope === 'department' && departmentId.trim());

  const handleSendPayslip = async (employeeId: string, employeeName: string) => {
    setSendingId(employeeId);
    try {
      const res = await fetch('/api/outsourcing/payroll/send-payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, employeeIds: [employeeId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      if (data.errors?.length) {
        setError(data.errors[0] || 'Failed to send payslip');
      } else if (data.sent > 0) {
        setGenerateResult(`Payslip sent to ${employeeName}.`);
      } else if (data.skipped > 0) {
        setError(`${employeeName} has no email on file.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send payslip');
    } finally {
      setSendingId(null);
    }
  };

  const handleRecalculateStatutory = async () => {
    setRecalculating(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { month, year };
      if (scope === 'client' && clientId.trim()) body.clientId = clientId.trim();
      if (scope === 'department' && departmentId.trim()) body.departmentId = departmentId.trim();
      const res = await fetch('/api/outsourcing/payroll/recalculate-statutory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to recalculate');
      setGenerateResult(data.message || `Recalculated statutory for ${data.updated ?? 0} record(s).`);
      await fetchPayrolls();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to recalculate statutory');
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4 sm:mb-5" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link href="/dashboard/outsourcing/clients" className="hover:text-primary-700 transition-colors">
              Outsourcing
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-primary-900 font-medium" aria-current="page">
            Payroll
          </li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Payroll
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Generate payroll and payslips by month. Scope by all employees, client, or department.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {generateResult && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg text-primary-800 text-sm flex items-center justify-between">
          <span>{generateResult}</span>
          <button type="button" onClick={() => setGenerateResult(null)} className="text-primary-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-primary-600" />
          Payroll run
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
              min={2020}
              max={2030}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm w-24 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as 'all' | 'client' | 'department')}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All employees</option>
              <option value="client">By client</option>
              <option value="department">By department</option>
            </select>
          </div>
          {scope === 'client' && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 min-w-[200px]"
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          {scope === 'department' && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => { setClientId(e.target.value); setDepartmentId(''); }}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 min-w-[200px]"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={!clientId.trim()}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 min-w-[180px] disabled:opacity-50"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating…' : 'Generate payroll'}
            </button>
            <Link
              href={payslipUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <FileText className="w-4 h-4" />
              View payslips
            </Link>
            <button
              type="button"
              onClick={handleRecalculateStatutory}
              disabled={payrolls.length === 0 || recalculating}
              title="Recalculate PAYE, NSSF, NHIF for all employees in scope using current Kenyan rates"
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Recalculate statutory (all)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <h2 className="text-base font-semibold text-primary-900 px-4 sm:px-6 py-4 border-b border-neutral-100">
          Payroll records ({month}/{year})
        </h2>
        {loading ? (
          <div className="p-8 animate-pulse">
            <div className="h-4 bg-neutral-100 rounded w-full mb-4" />
            <div className="h-4 bg-neutral-100 rounded w-5/6 mb-4" />
            <div className="h-4 bg-neutral-100 rounded w-4/6" />
          </div>
        ) : payrolls.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No payroll records for this period. Use &quot;Generate payroll&quot; to create draft records for employees in scope.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Employee</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Dept</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Basic</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Gross</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">PAYE</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">NSSF</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">NHIF</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Net pay</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                  <th className="w-10 px-4 py-3 text-center font-medium text-neutral-600">Edit</th>
                  <th className="w-10 px-4 py-3 text-right font-medium text-neutral-600">Send</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-primary-900">{p.employeeName}</span>
                      {p.employeeNumber && (
                        <span className="block text-xs text-neutral-500">{p.employeeNumber}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{p.clientName}</td>
                    <td className="px-4 py-3 text-neutral-600">{p.departmentName ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{Number(p.basicPay).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{Number(p.grossPay).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{Number(p.paye).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{Number(p.nssf).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{Number(p.nhif).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{Number(p.netPay).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        p.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                        p.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => { setEditPayrollId(p.id); setEditEmployeeName(p.employeeName); }}
                        title={`Edit pay for ${p.employeeName}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleSendPayslip(p.employeeId, p.employeeName)}
                        disabled={sendingId === p.employeeId}
                        title={`Send payslip for ${MONTHS[month - 1]} ${year} to ${p.employeeName}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sendingId === p.employeeId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editPayrollId && (
        <PayrollEditModal
          payrollId={editPayrollId}
          employeeName={editEmployeeName}
          month={month}
          year={year}
          onClose={() => { setEditPayrollId(null); setEditEmployeeName(''); }}
          onSaved={fetchPayrolls}
        />
      )}
    </div>
  );
}
