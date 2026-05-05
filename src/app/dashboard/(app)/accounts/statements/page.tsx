import type { Metadata } from 'next';
import AccountsModulePlaceholder from '@/components/dashboard/accounts/AccountsModulePlaceholder';

export const metadata: Metadata = {
  title: 'Statements | HRIS Demo (Accounts)',
};

export default function AccountsStatementsPage() {
  return (
    <AccountsModulePlaceholder
      title="Statements"
      summary="Client statements of account and company-level debtor/creditor views will live here—opening balance, invoices, receipts, and closing balance per accounts client; vendor aging for payables."
    />
  );
}
