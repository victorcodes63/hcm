import { notFound } from 'next/navigation';
import ClientDetailView from './ClientDetailView';

export default async function OutsourcingClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  return <ClientDetailView clientId={id} />;
}
