import type { Metadata } from 'next';
import ContractsPageClient from '@/components/contracts/ContractsPageClient';

export const metadata: Metadata = {
  title: 'Contracts | HRIS Demo',
};

export default function PeopleContractsListPage() {
  return <ContractsPageClient />;
}

