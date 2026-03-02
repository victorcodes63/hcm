'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const inputClass =
  'w-full min-w-0 px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base';

export default function NewOutsourcingClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    kraPin: '',
    nssfEmployerNumber: '',
    nhifEmployerNumber: '',
    companyRegistrationNumber: '',
    vatNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankBranch: '',
    bankSwiftCode: '',
    currency: 'KES',
    billingCycle: '',
    serviceFeeType: '',
    serviceFeeAmount: '',
    paymentTerms: '',
    postalAddress: '',
    county: '',
    contractStartDate: '',
    contractEndDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const trimmed = form.name.trim();
    if (!trimmed) {
      setError('Client name is required.');
      setSubmitting(false);
      return;
    }
    const payload: Record<string, unknown> = {
      name: trimmed,
      contactName: form.contactName.trim() || null,
      contactEmail: form.contactEmail.trim() || null,
      contactPhone: form.contactPhone.trim() || null,
      kraPin: form.kraPin.trim() || null,
      nssfEmployerNumber: form.nssfEmployerNumber.trim() || null,
      nhifEmployerNumber: form.nhifEmployerNumber.trim() || null,
      companyRegistrationNumber: form.companyRegistrationNumber.trim() || null,
      vatNumber: form.vatNumber.trim() || null,
      bankName: form.bankName.trim() || null,
      bankAccountNumber: form.bankAccountNumber.trim() || null,
      bankBranch: form.bankBranch.trim() || null,
      bankSwiftCode: form.bankSwiftCode.trim() || null,
      currency: form.currency.trim() || null,
      billingCycle: form.billingCycle.trim() || null,
      serviceFeeType: form.serviceFeeType.trim() || null,
      serviceFeeAmount: form.serviceFeeAmount.trim() ? parseFloat(form.serviceFeeAmount) : null,
      paymentTerms: form.paymentTerms.trim() || null,
      postalAddress: form.postalAddress.trim() || null,
      county: form.county.trim() || null,
      contractStartDate: form.contractStartDate.trim() || null,
      contractEndDate: form.contractEndDate.trim() || null,
    };
    try {
      const res = await fetch('/api/outsourcing/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to create client.');
        setSubmitting(false);
        return;
      }
      router.push('/dashboard/outsourcing/clients');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4 sm:mb-5" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link
              href="/dashboard/outsourcing/clients"
              className="hover:text-primary-700 transition-colors"
            >
              Outsourcing Clients
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-primary-900 font-medium" aria-current="page">
            Add client
          </li>
        </ol>
      </nav>
      <div className="mb-6 sm:mb-8 w-full min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
          Add outsourcing client
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base w-full">
          Add a company you provide HR outsourcing services to. You can add departments and
          employees within each client.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 sm:space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary-900 mb-2">
              Client / company name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. ABC Healthcare Ltd"
              required
              className={inputClass}
            />
          </div>

          <div className="border-t border-neutral-100 pt-5 sm:pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 sm:mb-4">
              Contact person
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-primary-900 mb-2">Contact name</label>
                <input id="contactName" type="text" value={form.contactName} onChange={update('contactName')} placeholder="e.g. Jane Doe" className={inputClass} />
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-primary-900 mb-2">Email</label>
                <input id="contactEmail" type="email" value={form.contactEmail} onChange={update('contactEmail')} placeholder="e.g. jane@company.com" className={inputClass} />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-primary-900 mb-2">Phone</label>
                <input id="contactPhone" type="tel" value={form.contactPhone} onChange={update('contactPhone')} placeholder="e.g. +254 700 123 456" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5 sm:pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 sm:mb-4">Tax & registration (Kenya)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label htmlFor="kraPin" className="block text-sm font-medium text-primary-900 mb-2">KRA PIN</label>
                <input id="kraPin" type="text" value={form.kraPin} onChange={update('kraPin')} placeholder="e.g. P051234567X" className={inputClass} />
              </div>
              <div>
                <label htmlFor="nssfEmployerNumber" className="block text-sm font-medium text-primary-900 mb-2">NSSF employer number</label>
                <input id="nssfEmployerNumber" type="text" value={form.nssfEmployerNumber} onChange={update('nssfEmployerNumber')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="nhifEmployerNumber" className="block text-sm font-medium text-primary-900 mb-2">NHIF employer number</label>
                <input id="nhifEmployerNumber" type="text" value={form.nhifEmployerNumber} onChange={update('nhifEmployerNumber')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="companyRegistrationNumber" className="block text-sm font-medium text-primary-900 mb-2">Company registration number</label>
                <input id="companyRegistrationNumber" type="text" value={form.companyRegistrationNumber} onChange={update('companyRegistrationNumber')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="vatNumber" className="block text-sm font-medium text-primary-900 mb-2">VAT number</label>
                <input id="vatNumber" type="text" value={form.vatNumber} onChange={update('vatNumber')} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5 sm:pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 sm:mb-4">Banking & billing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-primary-900 mb-2">Bank name</label>
                <input id="bankName" type="text" value={form.bankName} onChange={update('bankName')} placeholder="e.g. KCB Bank" className={inputClass} />
              </div>
              <div>
                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-primary-900 mb-2">Account number</label>
                <input id="bankAccountNumber" type="text" value={form.bankAccountNumber} onChange={update('bankAccountNumber')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="bankBranch" className="block text-sm font-medium text-primary-900 mb-2">Branch</label>
                <input id="bankBranch" type="text" value={form.bankBranch} onChange={update('bankBranch')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="bankSwiftCode" className="block text-sm font-medium text-primary-900 mb-2">Swift / BIC code</label>
                <input id="bankSwiftCode" type="text" value={form.bankSwiftCode} onChange={update('bankSwiftCode')} placeholder="e.g. KCBLKENX" className={inputClass} />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-primary-900 mb-2">Currency</label>
                <select id="currency" value={form.currency} onChange={update('currency')} className={inputClass}>
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label htmlFor="billingCycle" className="block text-sm font-medium text-primary-900 mb-2">Billing cycle</label>
                <select id="billingCycle" value={form.billingCycle} onChange={update('billingCycle')} className={inputClass}>
                  <option value="">—</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi_weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label htmlFor="serviceFeeType" className="block text-sm font-medium text-primary-900 mb-2">Service fee type</label>
                <select id="serviceFeeType" value={form.serviceFeeType} onChange={update('serviceFeeType')} className={inputClass}>
                  <option value="">—</option>
                  <option value="fixed">Fixed amount</option>
                  <option value="percentage">Percentage</option>
                  <option value="per_employee">Per employee</option>
                </select>
              </div>
              <div>
                <label htmlFor="serviceFeeAmount" className="block text-sm font-medium text-primary-900 mb-2">Service fee amount</label>
                <input id="serviceFeeAmount" type="number" step="0.01" min="0" value={form.serviceFeeAmount} onChange={update('serviceFeeAmount')} placeholder="e.g. 15000 or 15" className={inputClass} />
              </div>
              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-primary-900 mb-2">Payment terms</label>
                <input id="paymentTerms" type="text" value={form.paymentTerms} onChange={update('paymentTerms')} placeholder="e.g. Net 15, Net 30" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5 sm:pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 sm:mb-4">Address & contract</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="sm:col-span-2">
                <label htmlFor="postalAddress" className="block text-sm font-medium text-primary-900 mb-2">Postal address</label>
                <input id="postalAddress" type="text" value={form.postalAddress} onChange={update('postalAddress')} placeholder="P.O. Box 12345, Nairobi" className={inputClass} />
              </div>
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-primary-900 mb-2">County</label>
                <input id="county" type="text" value={form.county} onChange={update('county')} placeholder="e.g. Nairobi" className={inputClass} />
              </div>
              <div>
                <label htmlFor="contractStartDate" className="block text-sm font-medium text-primary-900 mb-2">Contract start date</label>
                <input id="contractStartDate" type="date" value={form.contractStartDate} onChange={update('contractStartDate')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="contractEndDate" className="block text-sm font-medium text-primary-900 mb-2">Contract end date</label>
                <input id="contractEndDate" type="date" value={form.contractEndDate} onChange={update('contractEndDate')} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-neutral-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard/outsourcing/clients"
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 min-h-[44px] sm:min-h-0 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors inline-flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 min-h-[44px] sm:min-h-0 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Adding…' : 'Add client'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
