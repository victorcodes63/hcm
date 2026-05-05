'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';

const DEMO_PASSWORD = 'Demo@2026!';

const STAFF_DEMO_ROWS = [
  { role: 'Admin', email: 'demo@stabexintl.com' },
  { role: 'HR', email: 'diana.namutebi@stabexintl.com' },
  { role: 'Finance', email: 'james.mwangi@stabexintl.com' },
] as const;

const ESS_DEMO_ROW = { role: 'ESS (employee portal)', email: 'moses.okello@stabexintl.com' } as const;

type DemoLoginCredentialsHintProps = {
  /** Staff dashboard login vs employee self-service login */
  variant: 'staff' | 'ess';
};

/**
 * Demo-only: reveals seeded Stabex accounts after `npm run seed:demo`.
 * Hide in production with `NEXT_PUBLIC_SHOW_DEMO_LOGIN_HINT=false`.
 */
export function DemoLoginCredentialsHint({ variant }: DemoLoginCredentialsHintProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN_HINT === 'false') {
    return null;
  }

  return (
    <div className="mt-5 border-t border-neutral-200 pt-5">
      <button
        type="button"
        className="mx-auto flex w-full max-w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-primary-700"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <Info className="h-4 w-4 shrink-0 text-primary-600" aria-hidden />
        <span>Demo sign-in details</span>
        <span className="text-xs font-normal text-neutral-400">(tap to {open ? 'hide' : 'show'})</span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-3 text-left shadow-sm"
        >
          <p className="mb-2 text-xs font-medium text-amber-900">
            Seeded demo — password for every account below:{' '}
            <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[11px] text-neutral-800">{DEMO_PASSWORD}</code>
          </p>
          <div className="overflow-x-auto rounded border border-amber-100/80 bg-white/60">
            <table className="w-full min-w-[280px] text-left text-xs text-neutral-800">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                  <th className="px-2 py-1.5">Role</th>
                  <th className="px-2 py-1.5">Email</th>
                </tr>
              </thead>
              <tbody>
                {variant === 'staff' ? (
                  <>
                    {STAFF_DEMO_ROWS.map((row) => (
                      <tr key={row.email} className="border-b border-neutral-100 last:border-0">
                        <td className="px-2 py-1.5 font-medium text-neutral-700">{row.role}</td>
                        <td className="px-2 py-1.5 font-mono text-[11px] text-neutral-900">{row.email}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-neutral-100 last:border-0">
                      <td className="px-2 py-1.5 font-medium text-neutral-700">{ESS_DEMO_ROW.role}</td>
                      <td className="px-2 py-1.5 font-mono text-[11px] text-neutral-900">{ESS_DEMO_ROW.email}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td className="px-2 py-1.5 font-medium text-neutral-700">ESS</td>
                    <td className="px-2 py-1.5 font-mono text-[11px] text-neutral-900">{ESS_DEMO_ROW.email}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {variant === 'staff' ? (
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">
              Employee self-service (Moses):{' '}
              <Link href="/ess/login" className="font-medium text-primary-700 underline-offset-2 hover:underline">
                /ess/login
              </Link>{' '}
              — same password.
            </p>
          ) : (
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">
              Staff dashboard (admin / HR / finance):{' '}
              <Link href="/dashboard/login" className="font-medium text-primary-700 underline-offset-2 hover:underline">
                /dashboard/login
              </Link>{' '}
              — same password.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
