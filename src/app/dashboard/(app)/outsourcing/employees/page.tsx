'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { Download, Mail, Pencil, Phone, Search, Trash2, Upload, UserPlus, Users } from 'lucide-react';
import { useEntity } from '@/components/EntitySwitcher';

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
  departmentId: string | null;
  departmentName: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountNumber: string | null;
}

type ImportResult = {
  created: number;
  skipped: number;
  errors: number;
  errorDetails?: { row: number; reason: string }[];
};

function EmployeesPageInner() {
  const { activeEntity } = useEntity();
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [workspaceName, setWorkspaceName] = useState('Stabex International');
  const [primaryWorkspaceClientId, setPrimaryWorkspaceClientId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDepartmentId, setBulkDepartmentId] = useState('');
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkSendingPayslips, setBulkSendingPayslips] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEmployees = async (opts?: { clearLoading?: boolean }) => {
    if (!opts?.clearLoading) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (departmentFilter.trim()) params.set('departmentId', departmentFilter.trim());
      if (positionFilter.trim()) params.set('jobTitle', positionFilter.trim());
      const res = await fetch(`/api/outsourcing/employees?${params.toString()}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || 'Failed to load employees');
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setEmployees([]);
      setError(e instanceof Error ? e.message : 'Failed to load employees');
    } finally {
      if (!opts?.clearLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadWorkspaceAndDepartments = async () => {
      try {
        const res = await fetch('/api/outsourcing/clients');
        const data = await res.json().catch(() => []);
        if (cancelled) return;

        const first = Array.isArray(data) && data[0] ? data[0] : null;
        if (first?.id) {
          setPrimaryWorkspaceClientId(String(first.id));
          if (first?.name) setWorkspaceName(String(first.name));

          const deptRes = await fetch(`/api/outsourcing/clients/${first.id}/departments`);
          const deptData = await deptRes.json().catch(() => []);
          if (!cancelled) setDepartments(Array.isArray(deptData) ? deptData : []);
        } else {
          setDepartments([]);
        }
      } catch {
        if (!cancelled) setDepartments([]);
      }
    };
    void loadWorkspaceAndDepartments();
    return () => {
      cancelled = true;
    };
  }, [activeEntity.id]);

  useEffect(() => {
    void fetchEmployees();
  }, [departmentFilter, positionFilter, activeEntity.id]);

  useEffect(() => {
    setSelectedIds(new Set());
    setBulkDepartmentId('');
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const haystack = [
        `${e.firstName} ${e.lastName}`,
        e.email ?? '',
        e.phone ?? '',
        e.employeeNumber ?? '',
        e.jobTitle ?? '',
        e.departmentName ?? '',
        e.kraPin ?? '',
        e.nssfNumber ?? '',
        e.nhifNumber ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [employees, searchQuery]);

  const uniquePositions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.jobTitle?.trim()) set.add(e.jobTitle.trim());
    });
    return Array.from(set).sort();
  }, [employees]);

  const totals = useMemo(() => {
    const total = filteredEmployees.length;
    const unassigned = filteredEmployees.filter((e) => !e.departmentId).length;
    const depts = new Set(filteredEmployees.filter((e) => e.departmentId).map((e) => e.departmentId as string)).size;
    return { total, unassigned, depts };
  }, [filteredEmployees]);

  const hasActiveFilters = !!searchQuery.trim() || !!departmentFilter.trim() || !!positionFilter.trim();

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setPositionFilter('');
    setImportResult(null);
    setSelectedIds(new Set());
    setBulkDepartmentId('');
  };

  const handleDownloadTemplate = () => {
    window.open('/api/outsourcing/employees/template', '_blank');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/outsourcing/employees/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setImportResult({
        created: data.created ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors ?? 0,
        errorDetails: data.errorDetails,
      });
      setDepartmentFilter('');
      setPositionFilter('');
      await fetchEmployees({ clearLoading: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allIds = filteredEmployees.map((e) => e.id);
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allIds);
    });
  };

  const handleBulkAssignDepartment = async () => {
    if (selectedIds.size === 0) return;
    setBulkAssigning(true);
    setError(null);
    try {
      const res = await fetch('/api/outsourcing/employees/bulk-assign-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeIds: Array.from(selectedIds),
          departmentId: bulkDepartmentId || null,
          clientId: primaryWorkspaceClientId || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Bulk assignment failed');
      setSelectedIds(new Set());
      setBulkDepartmentId('');
      await fetchEmployees({ clearLoading: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bulk assignment failed');
    } finally {
      setBulkAssigning(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected employee(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/outsourcing/employees/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeIds: Array.from(selectedIds),
          clientId: primaryWorkspaceClientId || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Bulk delete failed');
      setSelectedIds(new Set());
      await fetchEmployees({ clearLoading: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleViewSelectedPayslips = () => {
    if (selectedIds.size === 0) return;
    const params = new URLSearchParams();
    params.set('month', String(payrollMonth));
    params.set('year', String(payrollYear));
    params.set('employeeIds', Array.from(selectedIds).join(','));
    window.open(`/dashboard/payroll/payslips?${params.toString()}`, '_blank');
  };

  const handleSendSelectedPayslips = async () => {
    if (selectedIds.size === 0) return;
    setBulkSendingPayslips(true);
    setError(null);
    try {
      const res = await fetch('/api/outsourcing/payroll/send-payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: payrollMonth,
          year: payrollYear,
          employeeIds: Array.from(selectedIds),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send payslips');
      setImportResult({
        created: data.sent ?? 0,
        skipped: data.skipped ?? 0,
        errors: Array.isArray(data.errors) ? data.errors.length : 0,
        errorDetails: Array.isArray(data.errors)
          ? data.errors.slice(0, 20).map((reason: string, idx: number) => ({ row: idx + 1, reason }))
          : [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send payslips');
    } finally {
      setBulkSendingPayslips(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Employees</h1>
          <p className="page-description max-w-2xl">
            Manage workforce records, Excel imports, department assignment, and payslip actions for {workspaceName}.
          </p>
        </div>
      </div>

      {error ? <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}

      {importResult ? (
        <div className="mb-5 rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm">
          <p className="font-medium text-primary-900">Operation complete</p>
          <p className="text-primary-700">
            Completed: {importResult.created}
            {importResult.skipped > 0 && ` · Skipped: ${importResult.skipped}`}
            {importResult.errors > 0 && ` · Errors: ${importResult.errors}`}
          </p>
          {importResult.errorDetails?.length ? (
            <ul className="mt-2 space-y-0.5 text-xs text-amber-800">
              {importResult.errorDetails.map((item, index) => (
                <li key={index}>
                  Row {item.row}: {item.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-40 rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-100" />
            <div className="h-4 w-5/6 rounded bg-neutral-100" />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="mb-1 text-xs font-medium text-neutral-500">Employees in view</p>
              <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{totals.total}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="mb-1 text-xs font-medium text-neutral-500">Unassigned department</p>
              <p className="text-2xl font-semibold text-amber-700 tabular-nums">{totals.unassigned}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="mb-1 text-xs font-medium text-neutral-500">Departments in view</p>
              <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{totals.depts}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="mb-1 text-xs font-medium text-neutral-500">Facility</p>
              <p className="truncate text-base font-semibold text-neutral-900">{workspaceName}</p>
            </div>
          </div>

          <div className="filter-bar flex flex-col gap-3 rounded-t-lg border border-neutral-200 border-b-neutral-200 bg-neutral-50">
            <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 xl:max-w-4xl xl:grid-cols-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  placeholder="Search employee, email, EMP no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="">All departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="">All positions</option>
                {uniquePositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
              <Link
                href="/dashboard/employees/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
              >
                <UserPlus className="h-4 w-4" />
                Add employee
              </Link>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Download className="h-4 w-4" />
                Template
              </button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import Excel'}
              </button>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          {selectedIds.size > 0 ? (
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-primary-200 bg-primary-50/70 p-4 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-primary-900">{selectedIds.size} selected</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds(new Set());
                    setBulkDepartmentId('');
                  }}
                  className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-primary-200/70 pt-3">
                <label className="text-xs text-neutral-600">Payroll month</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(Math.min(12, Math.max(1, parseInt(e.target.value || '1', 10))))}
                  className="w-16 rounded-lg border border-neutral-300 bg-white px-2 py-2 text-sm"
                />
                <input
                  type="number"
                  min={2020}
                  max={2035}
                  value={payrollYear}
                  onChange={(e) => setPayrollYear(parseInt(e.target.value || String(new Date().getFullYear()), 10))}
                  className="w-24 rounded-lg border border-neutral-300 bg-white px-2 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleViewSelectedPayslips}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-50"
                >
                  <Download className="h-4 w-4" />
                  View payslips
                </button>
                <button
                  type="button"
                  onClick={handleSendSelectedPayslips}
                  disabled={bulkSendingPayslips}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-100 disabled:opacity-50"
                >
                  {bulkSendingPayslips ? 'Sending...' : 'Send payslips'}
                </button>
                <select
                  value={bulkDepartmentId}
                  onChange={(e) => setBulkDepartmentId(e.target.value)}
                  disabled={departments.length === 0}
                  className="min-w-[220px] rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                >
                  <option value="">Unassigned</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBulkAssignDepartment}
                  disabled={bulkAssigning}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bulkAssigning ? 'Assigning...' : 'Assign selected'}
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {bulkDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ) : null}

          {employees.length === 0 ? (
            <div className="table-empty-state rounded-lg border border-neutral-200 bg-white">
              <Users className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
              <h2 className="text-base font-semibold text-neutral-900">No employees found</h2>
              <p className="text-sm text-neutral-500">Try adjusting your search or filters.</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="table-empty-state rounded-lg border border-neutral-200 bg-white">
              <Search className="h-12 w-12 text-neutral-400" />
              <p className="text-base font-semibold text-neutral-900">No employees found</p>
              <p className="text-sm text-neutral-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="data-table-wrap min-w-0">
              <div className="overflow-x-auto">
                <table className="data-table min-w-[860px]">
                  <thead>
                    <tr>
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={filteredEmployees.length > 0 && selectedIds.size === filteredEmployees.length}
                          onChange={toggleSelectAll}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          aria-label="Select all employees"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">EMP No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">KRA / NSSF / NHIF</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Bank</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Contact</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        data-selected={selectedIds.has(employee.id)}
                        className="transition-colors"
                      >
                        <td className="px-4 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(employee.id)}
                            onChange={() => toggleSelect(employee.id)}
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            aria-label={`Select ${employee.firstName} ${employee.lastName}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium tabular-nums text-neutral-600">{employee.employeeNumber ?? '-'}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-primary-900">
                            {employee.firstName} {employee.lastName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{employee.jobTitle ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{employee.departmentName ?? '-'}</td>
                        <td className="px-4 py-3 text-xs font-mono text-neutral-600">
                          <div className="space-y-0.5">
                            {employee.kraPin && <div title="KRA PIN">{employee.kraPin}</div>}
                            {employee.nssfNumber && <div title="NSSF">{employee.nssfNumber}</div>}
                            {employee.nhifNumber && <div title="NHIF">{employee.nhifNumber}</div>}
                            {!employee.kraPin && !employee.nssfNumber && !employee.nhifNumber && '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          {employee.bankName || employee.bankBranch || employee.bankAccountNumber ? (
                            <div className="space-y-0.5">
                              {employee.bankName && <div className="font-medium">{employee.bankName}</div>}
                              {employee.bankBranch && <div>{employee.bankBranch}</div>}
                              {employee.bankAccountNumber && <div className="max-w-[120px] truncate tabular-nums">{employee.bankAccountNumber}</div>}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          <div className="space-y-0.5">
                            {employee.email ? (
                              <a
                                href={`mailto:${employee.email}`}
                                className="inline-flex max-w-[150px] items-center gap-1 truncate text-primary-600 hover:text-primary-800"
                                title={employee.email}
                              >
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{employee.email}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-neutral-400">No email</span>
                            )}
                            {employee.phone ? (
                              <a
                                href={`tel:${employee.phone}`}
                                className="inline-flex items-center gap-1 text-neutral-600 hover:text-primary-600"
                                title={employee.phone}
                              >
                                <Phone className="h-3 w-3 shrink-0" />
                                {employee.phone}
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/employees/${employee.id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
                Showing 1-{filteredEmployees.length} of {filteredEmployees.length}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-neutral-100" />}>
      <EmployeesPageInner />
    </Suspense>
  );
}

