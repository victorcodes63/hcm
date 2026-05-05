'use client';

import { Loader2 } from 'lucide-react';
import {
  getInvoiceBankDetails,
  INVOICE_PAYMENT_BANK_OPTIONS,
  type InvoicePaymentBankKind,
} from '@/lib/invoice-bank-accounts';

export function InvoiceBankDisplay({ kind }: { kind: InvoicePaymentBankKind }) {
  const b = getInvoiceBankDetails(kind);
  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/90 print:border-neutral-300 print:bg-neutral-100 print:p-3 text-left print:[print-color-adjust:exact]">
      <p className="text-sm font-bold text-primary-900 mb-3 print:text-xs">Payment details</p>
      <div className="text-sm text-neutral-700 space-y-2 print:text-[9px]">
        <p>Bank: {b.bank}</p>
        <p className="tabular-nums">Account number: {b.accountNumber}</p>
        <p className="tabular-nums">Bank code: {b.bankCode}</p>
        <p className="tabular-nums">Branch code: {b.branchCode}</p>
        <p className="tabular-nums">SWIFT: {b.swiftCode}</p>
      </div>
    </div>
  );
}

type SelectProps = {
  value: InvoicePaymentBankKind;
  onChange: (v: InvoicePaymentBankKind) => void;
  disabled?: boolean;
  saving?: boolean;
  compact?: boolean;
};

export function InvoicePaymentBankSelect({
  value,
  onChange,
  disabled,
  saving,
  compact,
}: SelectProps) {
  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 print:hidden">
        Payment account on invoice
      </label>
      <div className="relative print:hidden">
        <select
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-60"
          value={value}
          disabled={disabled || saving}
          onChange={(e) => onChange(e.target.value as InvoicePaymentBankKind)}
        >
          {INVOICE_PAYMENT_BANK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {saving && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
          </span>
        )}
      </div>
      <p className="text-[11px] text-neutral-500 print:hidden">
        Chooses which HRIS Demo Equity account appears on the PDF and when printing. Payroll remittances should use
        the payroll-only account.
      </p>
    </div>
  );
}
