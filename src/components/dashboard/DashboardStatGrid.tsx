import type { ReactNode } from 'react';
import { DASHBOARD_STAT_CARD_CLASS } from '@/lib/dashboard-layout';

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

type Columns = 2 | 3 | 4;

export type DashboardStatTone = 'primary' | 'success' | 'warning' | 'violet' | 'sky';

const TONE_STYLES: Record<
  DashboardStatTone,
  { bar: string; wash: string; value?: string }
> = {
  primary: {
    bar: 'bg-primary-500',
    wash: 'from-primary-50/80 to-white',
  },
  success: {
    bar: 'bg-emerald-500',
    wash: 'from-emerald-50/70 to-white',
  },
  warning: {
    bar: 'bg-amber-500',
    wash: 'from-amber-50/80 to-white',
    value: 'text-amber-800',
  },
  violet: {
    bar: 'bg-violet-500',
    wash: 'from-violet-50/70 to-white',
  },
  sky: {
    bar: 'bg-sky-500',
    wash: 'from-sky-50/70 to-white',
  },
};

const columnClass: Record<Columns, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
};

export function DashboardStatGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode;
  columns?: Columns;
  className?: string;
}) {
  return <div className={cn('grid gap-3', columnClass[columns], className)}>{children}</div>;
}

export function DashboardStatCard({
  label,
  value,
  hint,
  trend,
  className,
  tone = 'primary',
  warn,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: ReactNode;
  className?: string;
  /** Coloured accent strip + subtle card wash */
  tone?: DashboardStatTone;
  warn?: boolean;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        DASHBOARD_STAT_CARD_CLASS,
        'relative overflow-hidden bg-gradient-to-br shadow-sm',
        styles.wash,
        className,
      )}
    >
      <div
        className={cn('absolute inset-y-0 left-0 w-1.5', styles.bar)}
        aria-hidden
      />
      <div className="relative pl-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className={cn('text-2xl font-semibold tabular-nums', warn ? styles.value ?? 'text-amber-800' : 'text-ink')}>
            {value}
          </p>
          {trend ? <div className="text-xs text-neutral-500">{trend}</div> : null}
        </div>
        {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
      </div>
    </div>
  );
}
