'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, UserPlus, Download, Upload } from 'lucide-react';

const inputClass =
  'w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base bg-white';

function NewEmployeeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preClientId = searchParams.get('clientId')?.trim() ?? '';

  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [clientId, setClientId] = useState(preClientId);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeNumber: '',
    jobTitle: '',
    departmentId: '',
    idNumber: '',
    kraPin: '',
    nssfNumber: '',
    nhifNumber: '',
    dateOfJoining: '',
    bankName: '',
    bankBranch: '',
    bankAccountNumber: '',
    baseSalary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    errors: number;
    createdNames?: string[];
    errorDetails?: { row: number; reason: string }[];
    skippedDetails?: { row: number; reason: string }[];
  } | null>(null);
  const [pendingImport, setPendingImport] = useState<{ file: File; clientId: string } | null>(null);
  const [departmentPrompt, setDepartmentPrompt] = useState<{ missingDepartments: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  type ImportEmployeesResponse = {
    needsDepartmentCreation?: boolean;
    missingDepartments?: string[];
    created?: number;
    skipped?: number;
    errors?: number;
    createdNames?: string[];
    errorDetails?: { row: number; reason: string }[];
    skippedDetails?: { row: number; reason: string }[];
    error?: string;
  };

  useEffect(() => {
    fetch('/api/outsourcing/clients')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (preClientId) setClientId(preClientId);
  }, [preClientId]);

  useEffect(() => {
    if (!clientId.trim()) {
      setDepartments([]);
      return;
    }
    fetch(`/api/outsourcing/clients/${clientId.trim()}/departments`)
      .then((r) => r.json())
      .then((data) => {
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(() => setDepartments([]));
  }, [clientId]);

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!clientId.trim()) {
      setError('Select a client.');
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    const emailTrim = form.email.trim();
    if (emailTrim && !/\S+@\S+\.\S+/.test(emailTrim)) {
      setError('Please enter a valid email address, or leave email blank.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/outsourcing/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          ...(form.employeeNumber.trim()
            ? { employeeNumber: form.employeeNumber.trim() }
            : {}), // omit empty → API assigns PREFIX-001
          jobTitle: form.jobTitle.trim() || null,
          departmentId: form.departmentId.trim() || null,
          idNumber: form.idNumber.trim() || null,
          kraPin: form.kraPin.trim() || null,
          nssfNumber: form.nssfNumber.trim() || null,
          nhifNumber: form.nhifNumber.trim() || null,
          dateOfJoining: form.dateOfJoining.trim() || null,
          bankName: form.bankName.trim() || null,
          bankBranch: form.bankBranch.trim() || null,
          bankAccountNumber: form.bankAccountNumber.trim() || null,
          ...(form.baseSalary.trim()
            ? { baseSalary: parseFloat(form.baseSalary.replace(/,/g, '')) || 0 }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to add employee.');
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/outsourcing/employees?clientId=${encodeURIComponent(clientId.trim())}`);
      router.refresh();
    } catch {
      setError('Something went wrong.');
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (!clientId.trim()) {
      setImportError('Select a client first to download a template with the right departments list.');
      return;
    }
    setImportError(null);
    window.open(
      `/api/outsourcing/employees/template?clientId=${encodeURIComponent(clientId.trim())}`,
      '_blank'
    );
  };

  const importEmployeesFromExcel = async (
    file: File,
    clientIdValue: string,
    autoCreateDepartments: boolean
  ): Promise<ImportEmployeesResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', clientIdValue);
    if (autoCreateDepartments) formData.append('autoCreateDepartments', 'true');

    const res = await fetch('/api/outsourcing/employees/import', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Import failed');
    }
    return data as ImportEmployeesResponse;
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!clientId.trim()) {
      setImportError('Select a client first, then choose your Excel file.');
      return;
    }
    setPendingImport({ file, clientId: clientId.trim() });
    setDepartmentPrompt(null);
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const data = await importEmployeesFromExcel(file, clientId.trim(), false);
      if (data?.needsDepartmentCreation) {
        setDepartmentPrompt({
          missingDepartments: Array.isArray(data.missingDepartments) ? data.missingDepartments : [],
        });
        return;
      }

      setImportResult({
        created: data.created ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors ?? 0,
        createdNames: data.createdNames,
        errorDetails: data.errorDetails,
        skippedDetails: data.skippedDetails,
      });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link href="/dashboard/outsourcing/employees" className="hover:text-primary-700">
              Employees
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-neutral-900 font-medium">Add employee</li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <Link
            href={
              clientId
                ? `/dashboard/outsourcing/clients/${clientId}`
                : '/dashboard/outsourcing/employees'
            }
            className="mt-1 text-neutral-500 hover:text-primary-700 shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <UserPlus className="w-7 h-7 text-primary-600 shrink-0" />
              Add employee
            </h1>
            <p className="text-neutral-600 text-sm mt-1 lg:max-w-2xl">
              Add one person below, or import many at once with the Excel template (select client first).
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">{error}</div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 lg:p-8 shadow-sm space-y-8">
          <div>
            <label htmlFor="clientId" className="block text-sm font-semibold text-neutral-900 mb-2">
              Client <span className="text-red-600">*</span>
            </label>
            <select
              id="clientId"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setForm((f) => ({ ...f, departmentId: '' }));
                setImportResult(null);
                setImportError(null);
              }}
              required
              className={inputClass}
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-amber-800 mt-2">
                No clients yet.{' '}
                <Link href="/dashboard/outsourcing/clients/new" className="font-medium underline">
                  Add an outsourcing client first
                </Link>
                .
              </p>
            )}
          </div>

          {/* Bulk import — same API as Employees list */}
          <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-bold text-primary-900 uppercase tracking-wide">
                  Import multiple (Excel)
                </h2>
                <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
                  Download the template, fill rows (First Name and Last Name required; Email optional—add later in Edit if needed). Department names must match
                  this client’s departments or leave blank. EMP No. optional — auto-numbered like single add.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={!clientId.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary-300 bg-white text-primary-900 text-sm font-medium hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={!clientId.trim() || importing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-semibold hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  {importing ? 'Importing…' : 'Import Excel'}
                </button>
              </div>
            </div>
            {importError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {importError}
              </div>
            )}
            {importResult && (
              <div className="mt-3 p-4 bg-white border border-primary-100 rounded-lg text-sm">
                <p className="font-semibold text-primary-900 mb-2">Import finished</p>
                <p className="text-neutral-700">
                  Created: <strong>{importResult.created}</strong>
                  {importResult.skipped > 0 && (
                    <>
                      {' '}
                      · Skipped: <strong>{importResult.skipped}</strong>
                    </>
                  )}
                  {importResult.errors > 0 && (
                    <>
                      {' '}
                      · Row errors: <strong>{importResult.errors}</strong>
                    </>
                  )}
                </p>
                {importResult.errorDetails && importResult.errorDetails.length > 0 && (
                  <ul className="mt-2 text-xs text-red-800 list-disc list-inside space-y-0.5">
                    {importResult.errorDetails.map((rowErr, i) => (
                      <li key={i}>
                        Row {rowErr.row}: {rowErr.reason}
                      </li>
                    ))}
                  </ul>
                )}
                {importResult.skippedDetails && importResult.skippedDetails.length > 0 && (
                  <ul className="mt-2 text-xs text-amber-800 list-disc list-inside space-y-0.5">
                    {importResult.skippedDetails.map((rowErr, i) => (
                      <li key={i}>
                        Row {rowErr.row}: {rowErr.reason}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/outsourcing/employees?clientId=${encodeURIComponent(clientId.trim())}`}
                    className="inline-flex px-4 py-2 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
                  >
                    View employees for this client
                  </Link>
                  <button
                    type="button"
                    onClick={() => setImportResult(null)}
                    className="inline-flex px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

        {departmentPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-neutral-200 p-5 sm:p-6">
              <h3 className="text-base font-semibold text-neutral-900">Create missing departments?</h3>
              <p className="text-sm text-neutral-600 mt-1">
                These departments exist in your Excel file, but they don&apos;t exist for this client yet. Create them and continue importing?
              </p>
              <div className="mt-4">
                <div className="text-sm font-medium text-neutral-800 mb-2">Missing departments</div>
                <ul className="text-sm text-neutral-700 list-disc list-inside space-y-1 max-h-44 overflow-auto">
                  {departmentPrompt.missingDepartments.map((d, idx) => (
                    <li key={`${d}-${idx}`}>{d}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-800 hover:bg-neutral-50"
                  onClick={() => setDepartmentPrompt(null)}
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-primary-900 text-white hover:bg-primary-800 disabled:opacity-50"
                  onClick={async () => {
                    if (!pendingImport) return;
                    setDepartmentPrompt(null);
                    setImporting(true);
                    setImportError(null);
                    try {
                      const data = await importEmployeesFromExcel(
                        pendingImport.file,
                        pendingImport.clientId,
                        true
                      );
                      setImportResult({
                        created: data.created ?? 0,
                        skipped: data.skipped ?? 0,
                        errors: data.errors ?? 0,
                        createdNames: data.createdNames,
                        errorDetails: data.errorDetails,
                        skippedDetails: data.skippedDetails,
                      });
                      // Refresh department list so newly created departments are selectable immediately.
                      const deptRes = await fetch(`/api/outsourcing/clients/${pendingImport.clientId}/departments`);
                      const deptData = await deptRes.json().catch(() => []);
                      if (Array.isArray(deptData)) setDepartments(deptData);
                    } catch (err) {
                      setImportError(err instanceof Error ? err.message : 'Import failed');
                    } finally {
                      setImporting(false);
                    }
                  }}
                  disabled={importing || !pendingImport}
                >
                  Create & Import
                </button>
              </div>
            </div>
          </div>
        )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 border-t border-neutral-100 pt-8">
            {/* Left column — person */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
                Person
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    First name <span className="text-red-600">*</span>
                  </label>
                  <input id="firstName" value={form.firstName} onChange={update('firstName')} className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Last name <span className="text-red-600">*</span>
                  </label>
                  <input id="lastName" value={form.lastName} onChange={update('lastName')} className={inputClass} required />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Email <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  className={inputClass}
                  placeholder="Leave blank for hard-copy / casual only"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Phone
                  </label>
                  <input id="phone" type="tel" value={form.phone} onChange={update('phone')} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Job title
                  </label>
                  <input id="jobTitle" value={form.jobTitle} onChange={update('jobTitle')} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Right column — assignment */}
            <div className="space-y-4 lg:border-l lg:border-neutral-100 lg:pl-10">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
                Assignment
              </h2>
              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Department
                </label>
                <select
                  id="departmentId"
                  value={form.departmentId}
                  onChange={update('departmentId')}
                  disabled={!clientId || departments.length === 0}
                  className={inputClass}
                >
                  <option value="">— None (assign later) —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {clientId && departments.length === 0 && (
                  <p className="text-xs text-neutral-500 mt-1.5">
                    Add departments on the{' '}
                    <Link
                      href={`/dashboard/outsourcing/departments?clientId=${encodeURIComponent(clientId)}`}
                      className="text-primary-700 font-medium hover:underline"
                    >
                      Departments
                    </Link>{' '}
                    page.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="employeeNumber" className="block text-sm font-medium text-neutral-800 mb-1.5">
                  EMP No. <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  id="employeeNumber"
                  value={form.employeeNumber}
                  onChange={update('employeeNumber')}
                  placeholder="Auto e.g. SRK-001 if left blank"
                  className={inputClass}
                />
                <p className="text-xs text-neutral-500 mt-1.5">
                  Client <strong>Employee ID prefix</strong> (edit client) or derived initials.
                </p>
              </div>
              <div>
                <label htmlFor="dateOfJoining" className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Date of joining
                </label>
                <input
                  id="dateOfJoining"
                  type="date"
                  value={form.dateOfJoining}
                  onChange={update('dateOfJoining')}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="baseSalary" className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Monthly basic salary (KES){' '}
                  <span className="text-neutral-400 font-normal">optional</span>
                </label>
                <input
                  id="baseSalary"
                  type="number"
                  min={0}
                  step={1}
                  value={form.baseSalary}
                  onChange={update('baseSalary')}
                  placeholder="e.g. 110625 — pre-fills payroll"
                  className={inputClass}
                />
                <p className="text-xs text-neutral-500 mt-1.5">
                  Used when you <strong>Generate payroll</strong> for a month. Edit per month in payroll if pay varies.
                </p>
              </div>
            </div>
          </div>
        </div>

        <details className="rounded-2xl border border-neutral-200 bg-neutral-50/50 open:bg-white open:shadow-sm">
          <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-neutral-800 list-none flex items-center justify-between">
            <span>Tax, ID & bank (optional)</span>
            <span className="text-neutral-400 text-xs font-normal">Click to expand</span>
          </summary>
          <div className="px-5 pb-5 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 border-t border-neutral-100 mt-2">
            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-neutral-900 mb-2">
                National ID
              </label>
              <input id="idNumber" value={form.idNumber} onChange={update('idNumber')} className={inputClass} />
            </div>
            <div>
              <label htmlFor="kraPin" className="block text-sm font-medium text-neutral-900 mb-2">
                KRA PIN
              </label>
              <input id="kraPin" value={form.kraPin} onChange={update('kraPin')} className={inputClass} />
            </div>
            <div>
              <label htmlFor="nssfNumber" className="block text-sm font-medium text-neutral-900 mb-2">
                NSSF
              </label>
              <input id="nssfNumber" value={form.nssfNumber} onChange={update('nssfNumber')} className={inputClass} />
            </div>
            <div>
              <label htmlFor="nhifNumber" className="block text-sm font-medium text-neutral-900 mb-2">
                NHIF
              </label>
              <input id="nhifNumber" value={form.nhifNumber} onChange={update('nhifNumber')} className={inputClass} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-neutral-900 mb-2">
                  Bank name
                </label>
                <input id="bankName" value={form.bankName} onChange={update('bankName')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="bankBranch" className="block text-sm font-medium text-neutral-900 mb-2">
                  Branch
                </label>
                <input id="bankBranch" value={form.bankBranch} onChange={update('bankBranch')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-neutral-900 mb-2">
                  Account no.
                </label>
                <input
                  id="bankAccountNumber"
                  value={form.bankAccountNumber}
                  onChange={update('bankAccountNumber')}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </details>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Link
            href={clientId ? `/dashboard/outsourcing/clients/${clientId}` : '/dashboard/outsourcing/employees'}
            className="inline-flex justify-center px-6 py-3 border border-neutral-300 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !clientId}
            className="inline-flex justify-center px-6 py-3 bg-primary-900 text-white rounded-xl font-semibold hover:bg-primary-800 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Add employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewEmployeePage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse h-40 bg-neutral-100 rounded-2xl w-full" />
      }
    >
      <NewEmployeeForm />
    </Suspense>
  );
}
