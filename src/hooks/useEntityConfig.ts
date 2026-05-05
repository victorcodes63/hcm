'use client';

import { useCallback, useMemo } from 'react';
import { useEntity } from '@/components/EntitySwitcher';
import { formatDisplayMoney, getEntityConfig, type EntityConfig, type EntityId } from '@/lib/entityConfig';

function coerceEntityId(id: string): EntityId {
  return id === 'ug' ? 'ug' : 'ke';
}

export default function useEntityConfig(): EntityConfig {
  const { activeEntity } = useEntity();
  return useMemo(() => getEntityConfig(coerceEntityId(activeEntity.id)), [activeEntity.id]);
}

export function useCurrencyFormatter() {
  const config = useEntityConfig();
  return useCallback(
    (amount: number) =>
      new Intl.NumberFormat(config.currency.locale, {
        style: 'currency',
        currency: config.currency.code,
        minimumFractionDigits: config.currency.decimals,
        maximumFractionDigits: config.currency.decimals,
      }).format(amount),
    [config.currency.code, config.currency.decimals, config.currency.locale],
  );
}

/** Format amounts stored in a given ISO currency (e.g. invoice rows) using matching entity locale/decimals. */
export function useDisplayMoney() {
  return useCallback((amount: number, currencyCode: string) => formatDisplayMoney(amount, currencyCode), []);
}
