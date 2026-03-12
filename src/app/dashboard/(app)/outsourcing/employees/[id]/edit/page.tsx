'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Pencil } from 'lucide-react';

const inputClass =
  'w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base';

interface DepartmentOption {
  id: string;
  name: string;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [form, setForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    idNumber: '',
    kraPin: '',
    nssfNumber: '',
    nhifNumber: '',
    dateOfJoining: '',
    bankName: '',
    bankBranch: '',
    bankAccountNumber: '',
    departmentId: '',
  });
  const [clientName, setClientName] = useState('');
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/outsourcing/employees/${id}`);
        if (!res.ok) throw new Error('Failed to load employee');
        const emp = await res.json();
        if (cancelled) return;
        setForm({
          employeeNumber: emp.employeeNumber ?? '',
          firstName: emp.firstName ?? '',
          lastName: emp.lastName ?? '',
          email: emp.email ?? '',
          phone: emp.phone ?? '',
          jobTitle: emp.jobTitle ?? '',
          idNumber: emp.idNumber ?? '',
          kraPin: emp.kraPin ?? '',
          nssfNumber: emp.nssfNumber ?? '',
          nhifNumber: emp.nhifNumber ?? '',
          dateOfJoining: emp.dateOfJoining ?? '',
          bankName: emp.bankName ?? '',
          bankBranch: emp.bankBranch ?? '',
          bankAccountNumber: emp.bankAccountNumber ?? '',
          departmentId: emp.departmentId ?? '',
        });
        setClientName(emp.clientName ?? '');
        if (emp.clientId) {
          const deptRes = await fetch(`/api/outsourcing/clients/${emp.clientId}/departments`);
          const deptData = await deptRes.json().catch(() => []);
          if (!cancelled && Array.isArray(deptData)) {
            setDepartments(deptData.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load employee');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setSubmitting(true);
    const fn = form.firstName.trim();
    const ln = form.lastName.trim();
    const em = form.email.trim();
    if (!fn) {
      setError('First name is required.');
      setSubmitting(false);
      return;
    }
    if (!ln) {
      setError('Last name is required.');
      setSubmitting(false);
      return;
    }
    if (!em) {
      setError('Email is required.');
      setSubmitting(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(em)) {
      setError('Please enter a valid email address.');
      setSubmitting(false);
      return;
    }
    const payload = {
      employeeNumber: form.employeeNumber.trim() || null,
      firstName: fn,
      lastName: ln,
      email: em,
      phone: form.phone.trim() || null,
      jobTitle: form.jobTitle.trim() || null,
      idNumber: form.idNumber.trim() || null,
      kraPin: form.kraPin.trim() || null,
      nssfNumber: form.nssfNumber.trim() || null,
      nhifNumber: form.nhifNumber.trim() || null,
      dateOfJoining: form.dateOfJoining.trim() || null,
      bankName: form.bankName.trim() || null,
      bankBranch: form.bankBranch.trim() || null,
      bankAccountNumber: form.bankAccountNumber.trim() || null,
      departmentId: form.departmentId.trim() || null,
    };
    try {
      const res = await fetch(`/api/outsourcing/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to update employee.');
        setSubmitting(false);
        return;
      }
      router.push('/dashboard/outsourcing/employees');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (!id) return null;
  if (loading) {
    return (
      <div className="w-full min-w-0">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="h-10 bg-neutral-100 rounded w-full" />
          <div className="h-10 bg-neutral-100 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4 sm:mb-5" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link href="/dashboard/outsourcing/employees" className="hover:text-primary-700 transition-colors">
              Employees
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-primary-900 font-medium" aria-current="page">
            Edit employee
          </li>
        </ol>
      </nav>
      <div className="mb-6 sm:mb-8 w-full min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
          Edit employee
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base w-full">
          Update {form.firstName} {form.lastName}
          {clientName && ` at ${clientName}`}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 sm:space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label htmlFor="employeeNumber" className="block text-sm font-medium text-primary-900 mb-2">EMP No.</label>
              <input id="employeeNumber" type="text" value={form.employeeNumber} onChange={update('employeeNumber')} placeholder="e.g. 001" className={inputClass} />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-primary-900 mb-2">First name <span className="text-red-600">*</span></label>
              <input id="firstName" type="text" value={form.firstName} onChange={update('firstName')} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-primary-900 mb-2">Last name <span className="text-red-600">*</span></label>
              <input id="lastName" type="text" value={form.lastName} onChange={update('lastName')} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-900 mb-2">Email <span className="text-red-600">*</span></label>
              <input id="email" type="email" value={form.email} onChange={update('email')} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary-900 mb-2">Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={update('phone')} placeholder="+254 700 123 456" className={inputClass} />
            </div>
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-primary-900 mb-2">Position / Job title</label>
              <input id="jobTitle" type="text" value={form.jobTitle} onChange={update('jobTitle')} placeholder="e.g. Accountant, Cleaner" className={inputClass} />
            </div>
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-primary-900 mb-2">Department</label>
              <select id="departmentId" value={form.departmentId} onChange={update('departmentId')} className={inputClass}>
                <option value="">— No department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dateOfJoining" className="block text-sm font-medium text-primary-900 mb-2">Date of joining</label>
              <input id="dateOfJoining" type="date" value={form.dateOfJoining} onChange={update('dateOfJoining')} className={inputClass} />
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5 sm:pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 sm:mb-4">Tax & ID (Kenya)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-primary-900 mb-2">National ID</label>
                <input id="idNumber" type="text" value={form.idNumber} onChange={update('idNumber')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="kraPin" className="block text-sm font-medium text-primary-900 mb-2">KRA PIN</label>
                <input id="kraPin" type="text" value={form.kraPin} onChange={update('kraPin')} placeholder="e.g. A001234567K" className={inputClass} />
              </div>
              <div>
                <label htmlFor="nssfNumber" className="block text-sm font-medium text-primary-900 mb-2">NSSF number</label>
                <input id="nssfNumber" type="text" value={form.nssfNumber} onChange={update('nssfNumber')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="nhifNumber" className="block text-sm font-medium text-primary-900 mb-2">NHIF number</label>
                <input id="nhifNumber" type="text" value={form.nhifNumber} onChange={update('nhifNumber')} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5 sm:pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 sm:mb-4">Bank details (salary disbursement)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-primary-900 mb-2">Bank name</label>
                <input id="bankName" type="text" value={form.bankName} onChange={update('bankName')} placeholder="e.g. Equity, KCB" className={inputClass} />
              </div>
              <div>
                <label htmlFor="bankBranch" className="block text-sm font-medium text-primary-900 mb-2">Branch</label>
                <input id="bankBranch" type="text" value={form.bankBranch} onChange={update('bankBranch')} placeholder="e.g. Westlands" className={inputClass} />
              </div>
              <div>
                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-primary-900 mb-2">Account number</label>
                <input id="bankAccountNumber" type="text" value={form.bankAccountNumber} onChange={update('bankAccountNumber')} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-neutral-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard/outsourcing/employees"
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 min-h-[44px] sm:min-h-0 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors inline-flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 min-h-[44px] sm:min-h-0 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
