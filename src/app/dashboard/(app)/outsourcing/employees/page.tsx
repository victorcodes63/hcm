'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Users, Search, Building2, Mail, Phone, Pencil, Download, Upload } from 'lucide-react';

interface EmployeeRecord {
  id: string;
  employeeNumber: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  kraPin: string | null;
  nssfNumber: string | null;
  nhifNumber: string | null;
  idNumber: string | null;
  dateOfJoining: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountNumber: string | null;
  clientId: string;
  clientName: string;
  departmentId: string | null;
  departmentName: string | null;
}

interface ClientOption {
  id: string;
  name: string;
}

export default function OutsourcingEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; errors: number; createdNames?: string[]; errorDetails?: { row: number; reason: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (clientFilter.trim()) params.set('clientId', clientFilter.trim());
      if (departmentFilter.trim()) params.set('departmentId', departmentFilter.trim());
      if (positionFilter.trim()) params.set('jobTitle', positionFilter.trim());
      const res = await fetch(`/api/outsourcing/employees?${params}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || 'Failed to load employees');
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load employees');
      setEmployees([]);
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

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchDepartments = async (cid: string) => {
    try {
      const res = await fetch(`/api/outsourcing/clients/${cid}/departments`);
      const data = await res.json().catch(() => []);
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [clientFilter, departmentFilter, positionFilter]);

  useEffect(() => {
    if (clientFilter.trim()) {
      fetchDepartments(clientFilter.trim());
    } else {
      setDepartments([]);
      setDepartmentFilter('');
    }
  }, [clientFilter]);

  const uniquePositions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.jobTitle?.trim()) set.add(e.jobTitle.trim());
    });
    return Array.from(set).sort();
  }, [employees]);

  const handleDownloadTemplate = () => {
    const qs = clientFilter.trim() ? `?clientId=${encodeURIComponent(clientFilter.trim())}` : '';
    window.open(`/api/outsourcing/employees/template${qs}`, '_blank');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !clientFilter.trim()) {
      if (!clientFilter.trim()) setError('Select a client first, then choose the Excel file to import.');
      return;
    }
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', clientFilter.trim());
      const res = await fetch('/api/outsourcing/employees/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }
      setImportResult({
        created: data.created ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors ?? 0,
        createdNames: data.createdNames,
        errorDetails: data.errorDetails,
      });
      await fetchEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const name = `${e.firstName} ${e.lastName}`.toLowerCase();
      const email = (e.email ?? '').toLowerCase();
      const empNo = (e.employeeNumber ?? '').toLowerCase();
      const job = (e.jobTitle ?? '').toLowerCase();
      const client = (e.clientName ?? '').toLowerCase();
      const dept = (e.departmentName ?? '').toLowerCase();
      const kra = (e.kraPin ?? '').toLowerCase();
      const nssf = (e.nssfNumber ?? '').toLowerCase();
      const nhif = (e.nhifNumber ?? '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        empNo.includes(q) ||
        job.includes(q) ||
        client.includes(q) ||
        dept.includes(q) ||
        kra.includes(q) ||
        nssf.includes(q) ||
        nhif.includes(q)
      );
    });
  }, [employees, searchQuery]);

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Employees
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Manage employees by client and department. View KRA PIN, NSSF, NHIF, and bank details.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-100 rounded w-full" />
            <div className="h-4 bg-neutral-100 rounded w-5/6" />
          </div>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">No employees yet</h2>
          <p className="text-neutral-600 text-sm max-w-md mx-auto mb-6">
            Add employees to outsourcing clients from the client detail page, or run the seed script
            to populate sample data.
          </p>
          <Link
            href="/dashboard/outsourcing/clients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Go to outsourcing clients
          </Link>
        </div>
      ) : (
        <>
          {importResult && (
            <div className="mb-5 p-4 bg-primary-50 border border-primary-200 rounded-lg text-sm">
              <p className="font-medium text-primary-900 mb-1">Import complete</p>
              <p className="text-primary-700">
                Created: {importResult.created}
                {importResult.skipped > 0 && ` · Skipped: ${importResult.skipped}`}
                {importResult.errors > 0 && ` · Errors: ${importResult.errors}`}
              </p>
              {importResult.errorDetails && importResult.errorDetails.length > 0 && (
                <ul className="mt-2 text-amber-800 text-xs space-y-0.5">
                  {importResult.errorDetails.map((e, i) => (
                    <li key={i}>Row {e.row}: {e.reason}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => setImportResult(null)}
                className="mt-2 text-primary-600 hover:text-primary-800 font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
          <div className="mb-5 flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="relative max-w-xs sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by name, email, EMP No., job…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              />
            </div>
            <select
              value={clientFilter}
              onChange={(e) => { setClientFilter(e.target.value); setDepartmentFilter(''); setImportResult(null); }}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent max-w-[200px]"
            >
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent max-w-[180px]"
              disabled={!clientFilter.trim()}
              title={!clientFilter.trim() ? 'Select a client first' : 'Filter by department'}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent max-w-[180px]"
              title="Filter by position"
            >
              <option value="">All positions</option>
              {uniquePositions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                title={clientFilter.trim() ? 'Download Excel template for selected client' : 'Download generic Excel template (select client when importing)'}
              >
                <Download className="w-4 h-4" />
                Download template
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!clientFilter.trim() || importing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={!clientFilter.trim() ? 'Select a client first' : 'Import employees from Excel'}
              >
                <Upload className="w-4 h-4" />
                {importing ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
              <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No employees match your search or filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80">
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        EMP No.
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Name
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Position
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Client
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Dept
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        KRA / NSSF / NHIF
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Bank
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Contact
                      </th>
                      <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredEmployees.map((e) => (
                      <tr key={e.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm tabular-nums font-medium">
                          {e.employeeNumber ?? '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3">
                          <span className="font-medium text-primary-900 text-sm">
                            {e.firstName} {e.lastName}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm">
                          {e.jobTitle ?? '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3">
                          <Link
                            href={`/dashboard/outsourcing/clients/${e.clientId}`}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            {e.clientName}
                          </Link>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm">
                          {e.departmentName ?? '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-xs font-mono">
                          <div className="space-y-0.5">
                            {e.kraPin && <div title="KRA PIN">{e.kraPin}</div>}
                            {e.nssfNumber && <div title="NSSF">{e.nssfNumber}</div>}
                            {e.nhifNumber && <div title="NHIF">{e.nhifNumber}</div>}
                            {!e.kraPin && !e.nssfNumber && !e.nhifNumber && '—'}
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-xs">
                          {e.bankName || e.bankBranch || e.bankAccountNumber ? (
                            <div className="space-y-0.5" title={`${e.bankName ?? ''} ${e.bankBranch ?? ''} ${e.bankAccountNumber ?? ''}`.trim()}>
                              {e.bankName && <div className="font-medium">{e.bankName}</div>}
                              {e.bankBranch && <div>{e.bankBranch}</div>}
                              {e.bankAccountNumber && (
                                <div className="tabular-nums truncate max-w-[100px]" title={e.bankAccountNumber}>
                                  {e.bankAccountNumber}
                                </div>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm">
                          <div className="space-y-0.5">
                            <a
                              href={`mailto:${e.email}`}
                              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 truncate max-w-[140px]"
                              title={e.email}
                            >
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{e.email}</span>
                            </a>
                            {e.phone && (
                              <a
                                href={`tel:${e.phone}`}
                                className="inline-flex items-center gap-1 text-neutral-600 hover:text-primary-600"
                                title={e.phone}
                              >
                                <Phone className="w-3 h-3 shrink-0" />
                                {e.phone}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-right">
                          <Link
                            href={`/dashboard/outsourcing/employees/${e.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
