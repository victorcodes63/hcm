'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, BadgeCheck, Pencil, Plus, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { CREDENTIAL_CATEGORIES, credentialCategoryLabel } from '@/lib/credential-categories';

type EmployeeOption = {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string | null;
  jobTitle: string | null;
};

type CredentialRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  jobTitle: string | null;
  departmentName: string | null;
  category: string;
  credentialName: string;
  credentialNumber: string | null;
  issuingAuthority: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  reminderDays: number;
  status: string;
  effectiveStatus: string;
  scopeOfPractice: string | null;
  notes: string | null;
};

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'expiring_soon', label: 'Expiring soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'revoked', label: 'Revoked' },
] as const;

const emptyForm = {
  employeeId: '',
  category: 'medical_license',
  credentialName: '',
  credentialNumber: '',
  issuingAuthority: '',
  issueDate: '',
  expiryDate: '',
  reminderDays: '30',
  status: 'active',
  scopeOfPractice: '',
  notes: '',
};

export default function CredentialsPage() {
  const searchParams = useSearchParams();
  const employeeIdFilterFromUrl = searchParams.get('employeeId') || '';
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [credentialsRes, employeesRes] = await Promise.all([
        fetch(
          employeeIdFilterFromUrl
            ? `/api/credentials?employeeId=${encodeURIComponent(employeeIdFilterFromUrl)}`
            : '/api/credentials'
        ),
        fetch('/api/outsourcing/employees'),
      ]);
      const credentialsData = await credentialsRes.json().catch(() => []);
      const employeesData = await employeesRes.json().catch(() => []);
      if (!credentialsRes.ok) throw new Error(credentialsData.error || 'Failed to load credentials');
      if (!employeesRes.ok) throw new Error(employeesData.error || 'Failed to load employees');
      setCredentials(Array.isArray(credentialsData) ? credentialsData : []);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  }, [employeeIdFilterFromUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return credentials.filter((item) => {
      if (statusFilter && item.effectiveStatus !== statusFilter) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (!q) return true;
      const haystack = [
        item.employeeName,
        item.employeeNumber ?? '',
        item.jobTitle ?? '',
        item.credentialName,
        item.credentialNumber ?? '',
        item.issuingAuthority ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [credentials, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = credentials.length;
    const expiring = credentials.filter((c) => c.effectiveStatus === 'expiring_soon').length;
    const expired = credentials.filter((c) => c.effectiveStatus === 'expired').length;
    const active = credentials.filter((c) => c.effectiveStatus === 'active').length;
    return { total, expiring, expired, active };
  }, [credentials]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (record: CredentialRecord) => {
    setEditingId(record.id);
    setForm({
      employeeId: record.employeeId,
      category: record.category,
      credentialName: record.credentialName,
      credentialNumber: record.credentialNumber ?? '',
      issuingAuthority: record.issuingAuthority ?? '',
      issueDate: record.issueDate ?? '',
      expiryDate: record.expiryDate ?? '',
      reminderDays: String(record.reminderDays ?? 30),
      status: record.status,
      scopeOfPractice: record.scopeOfPractice ?? '',
      notes: record.notes ?? '',
    });
  };

  const saveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.employeeId || !form.credentialName.trim()) {
      setError('Employee and credential name are required.');
      return;
    }
    const payload = {
      employeeId: form.employeeId,
      category: form.category,
      credentialName: form.credentialName.trim(),
      credentialNumber: form.credentialNumber.trim() || null,
      issuingAuthority: form.issuingAuthority.trim() || null,
      issueDate: form.issueDate || null,
      expiryDate: form.expiryDate || null,
      reminderDays: Math.max(0, Math.min(365, parseInt(form.reminderDays || '30', 10) || 30)),
      status: form.status,
      scopeOfPractice: form.scopeOfPractice.trim() || null,
      notes: form.notes.trim() || null,
    };
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/credentials/${editingId}` : '/api/credentials', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save credential');
      await load();
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save credential');
    } finally {
      setSaving(false);
    }
  };

  const removeCredential = async (id: string) => {
    if (!window.confirm('Delete this credential record?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete credential');
      setCredentials((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete credential');
    }
  };

  const badgeStyle = (status: string) => {
    if (status === 'expired') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'expiring_soon') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'suspended' || status === 'revoked') return 'bg-neutral-100 text-neutral-700 border-neutral-300';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900">Credentials & licences</h1>
        <p className="text-sm text-neutral-600">
          Track clinical registrations and oil & gas industry competence (e.g. OPITO survival, IWCF well control, site
          permits) with expiry dates and reminders for compliant staffing.
        </p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-3"><p className="text-xs text-neutral-500">Total</p><p className="text-xl font-semibold">{stats.total}</p></div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3"><p className="text-xs text-neutral-500">Active</p><p className="text-xl font-semibold text-emerald-700">{stats.active}</p></div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3"><p className="text-xs text-neutral-500">Expiring soon</p><p className="text-xl font-semibold text-amber-700">{stats.expiring}</p></div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3"><p className="text-xs text-neutral-500">Expired</p><p className="text-xl font-semibold text-red-700">{stats.expired}</p></div>
      </div>

      <form onSubmit={saveCredential} className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <Plus className="h-4 w-4" />
          {editingId ? 'Update credential' : 'Add credential'}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" required>
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} {e.employeeNumber ? `(${e.employeeNumber})` : ''}
              </option>
            ))}
          </select>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            {CREDENTIAL_CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input value={form.credentialName} onChange={(e) => setForm((f) => ({ ...f, credentialName: e.target.value }))} placeholder="Credential name" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" required />
          <input value={form.credentialNumber} onChange={(e) => setForm((f) => ({ ...f, credentialNumber: e.target.value }))} placeholder="License / cert number" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input value={form.issuingAuthority} onChange={(e) => setForm((f) => ({ ...f, issuingAuthority: e.target.value }))} placeholder="Issuing authority" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input type="number" min={0} max={365} value={form.reminderDays} onChange={(e) => setForm((f) => ({ ...f, reminderDays: e.target.value }))} placeholder="Reminder days" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            {STATUSES.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input value={form.scopeOfPractice} onChange={(e) => setForm((f) => ({ ...f, scopeOfPractice: e.target.value }))} placeholder="Scope / site or practice area (optional)" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm md:col-span-2" />
          <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Notes" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm md:col-span-2" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button disabled={saving} type="submit" className="rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60">
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add credential'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff, credential or number..." className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-sm" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            <option value="">All categories</option>
            {CREDENTIAL_CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {STATUSES.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading credentials...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-500">No credentials match the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th className="px-3 py-2">Staff</th>
                  <th className="px-3 py-2">Credential</th>
                  <th className="px-3 py-2">Authority</th>
                  <th className="px-3 py-2">Issue</th>
                  <th className="px-3 py-2">Expiry</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-neutral-800">{item.employeeName}</div>
                      <div className="text-xs text-neutral-500">{item.jobTitle ?? 'No role'} {item.employeeNumber ? `· ${item.employeeNumber}` : ''}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-neutral-800">{item.credentialName}</div>
                      <div className="text-xs text-neutral-500">
                        {item.credentialNumber ?? 'No number'} · {credentialCategoryLabel(item.category)}
                      </div>
                    </td>
                    <td className="px-3 py-2">{item.issuingAuthority ?? '-'}</td>
                    <td className="px-3 py-2">{item.issueDate ?? '-'}</td>
                    <td className="px-3 py-2">{item.expiryDate ?? '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeStyle(item.effectiveStatus)}`}>
                        {item.effectiveStatus === 'expired' ? <ShieldAlert className="h-3 w-3" /> : item.effectiveStatus === 'expiring_soon' ? <AlertTriangle className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
                        {item.effectiveStatus.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => startEdit(item)} className="mr-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"><Pencil className="h-3.5 w-3.5" />Edit</button>
                      <button onClick={() => removeCredential(item.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
