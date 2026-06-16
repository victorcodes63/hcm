'use client';

import { useEffect, useId, useState } from 'react';
import { Info } from 'lucide-react';
import type { DemoCredentialRow } from '@/lib/demo-credentials';

type DemoLoginCredentialsHintProps = {
  /** Staff dashboard login vs employee self-service login */
  variant: 'staff' | 'ess';
  visible: boolean;
  demoPassword: string;
  staffDemoRows: DemoCredentialRow[];
  essDemoRow: DemoCredentialRow;
  onSelectEmail?: (email: string) => void;
};

/**
 * Subtle info control on login — lists seeded accounts by access level.
 * Enabled when NEXT_PUBLIC_DEMO_MODE=true (disable with NEXT_PUBLIC_SHOW_DEMO_LOGIN_HINT=false).
 */
export function DemoLoginCredentialsHint({
  variant,
  visible,
  demoPassword,
  staffDemoRows,
  essDemoRow,
  onSelectEmail,
}: DemoLoginCredentialsHintProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Defer to the client so SSR markup always matches the first hydration pass.
  if (!visible || !mounted) {
    return null;
  }

  const rows = variant === 'staff' ? [...staffDemoRows, essDemoRow] : [essDemoRow, ...staffDemoRows];

  return (
    <div className="mt-6 flex flex-col items-center">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c1c9d2] bg-white text-[#425466] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-[#635bff] hover:text-[#635bff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff]/30"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Hide accounts' : 'Show accounts'}
        onClick={() => setOpen((o) => !o)}
      >
        <Info className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
      </button>

      {open ? (
        <div
          id={panelId}
          className="mt-3 w-full rounded-lg border border-[#e3e8ee] bg-[#f6f9fc] px-3 py-3 text-left shadow-sm"
        >
          <p className="mb-2 text-xs text-[#425466]">
            Password{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#0a2540]">
              {demoPassword}
            </code>
          </p>
          <div className="overflow-x-auto rounded-md border border-[#e3e8ee] bg-white">
            <table className="w-full min-w-[280px] text-left text-xs text-[#425466]">
              <thead>
                <tr className="border-b border-[#e3e8ee] bg-[#f6f9fc] text-[10px] font-semibold uppercase tracking-wide text-[#6b7f99]">
                  <th className="px-2.5 py-2">Role</th>
                  <th className="px-2.5 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.role}-${row.email}`} className="border-b border-[#e3e8ee] last:border-0">
                    <td className="px-2.5 py-2 font-medium text-[#0a2540]">{row.role}</td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-[#0a2540]">
                      {onSelectEmail && variant === 'staff' && row.role !== 'Employee portal' ? (
                        <button
                          type="button"
                          className="text-left underline-offset-2 hover:text-[#635bff] hover:underline"
                          onClick={() => onSelectEmail(row.email)}
                        >
                          {row.email}
                        </button>
                      ) : (
                        row.email
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
