'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AlertTriangle, LayoutDashboard } from 'lucide-react';
import { getModuleLabel, type ModuleKey } from '@/lib/modules';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

function ModuleUnavailableContent() {
  const searchParams = useSearchParams();
  const moduleKey = (searchParams.get('module') ?? 'core') as ModuleKey;
  const fromPath = searchParams.get('from') ?? '';
  const label = getModuleLabel(moduleKey);

  return (
    <DashboardPage>
      <div className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50/80 p-8">
        <DashboardPageHeader
          icon={AlertTriangle}
          iconClassName="h-7 w-7 shrink-0 text-amber-700"
          title="Module not available"
          description={
            <>
              <strong>{label}</strong> is not enabled on this deployment.
              {fromPath ? (
                <>
                  {' '}
                  You tried to open <code className="rounded bg-white/80 px-1 py-0.5 text-xs">{fromPath}</code>.
                </>
              ) : null}
            </>
          }
        />
        <p className="mt-4 text-sm text-neutral-600">
          Contact your system administrator if you believe you should have access. Modules are licensed per
          organisation instance.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <LayoutDashboard className="h-4 w-4" />
          Back to overview
        </Link>
      </div>
    </DashboardPage>
  );
}

export default function ModuleUnavailablePage() {
  return (
    <Suspense
      fallback={
        <DashboardPage>
          <div className="mx-auto max-w-lg dashboard-surface p-8 text-center text-sm text-neutral-500">
            Loading…
          </div>
        </DashboardPage>
      }
    >
      <ModuleUnavailableContent />
    </Suspense>
  );
}
