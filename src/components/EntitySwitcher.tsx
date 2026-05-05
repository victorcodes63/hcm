'use client';

import { createContext, useContext, useState, useLayoutEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Building2 } from 'lucide-react';
import { HRIS_ENTITY_COOKIE } from '@/lib/entity-constants';

export type Entity = {
  id: string;
  name: string;
  country: string;
  currency: string;
  flag: string;
  color: string;
};

export const ENTITIES: Entity[] = [
  {
    id: 'ke',
    name: 'Stabex Kenya Ltd',
    country: 'Kenya',
    currency: 'KES',
    flag: '🇰🇪',
    color: '#006600',
  },
  {
    id: 'ug',
    name: 'Stabex Uganda Ltd',
    country: 'Uganda',
    currency: 'UGX',
    flag: '🇺🇬',
    color: '#000000',
  },
];

const STORAGE_KEY = 'stabex_entity';

type EntityContextType = {
  activeEntity: Entity;
  setActiveEntity: (e: Entity) => void;
};

const EntityContext = createContext<EntityContextType>({
  activeEntity: ENTITIES[0],
  setActiveEntity: () => {},
});

function readCookieEntityId(): string | null {
  if (typeof document === 'undefined') return null;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    if (k !== HRIS_ENTITY_COOKIE) continue;
    const v = decodeURIComponent(trimmed.slice(eq + 1).trim()).toLowerCase();
    if (v === 'ke' || v === 'ug') return v;
  }
  return null;
}

/** Client-only: restore entity from localStorage, then cookie (must not run during SSR — hydration). */
function readPreferredEntity(): Entity {
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage === 'ke' || fromStorage === 'ug') {
    const found = ENTITIES.find((e) => e.id === fromStorage);
    if (found) return found;
  }
  const cid = readCookieEntityId();
  if (cid) {
    const found = ENTITIES.find((e) => e.id === cid);
    if (found) return found;
  }
  return ENTITIES[0];
}

function syncEntityCookie(entityId: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 400;
  document.cookie = `${HRIS_ENTITY_COOKIE}=${encodeURIComponent(entityId)};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function EntityProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Always match SSR/first paint (Kenya default). localStorage/cookie are applied in useLayoutEffect to avoid hydration mismatch (server cannot read localStorage).
  const [activeEntity, setActiveEntityState] = useState<Entity>(ENTITIES[0]);

  useLayoutEffect(() => {
    const preferred = readPreferredEntity();
    syncEntityCookie(preferred.id);
    setActiveEntityState(preferred);
  }, []);

  const setActiveEntity = (entity: Entity) => {
    if (entity.id === activeEntity.id) return;
    localStorage.setItem(STORAGE_KEY, entity.id);
    syncEntityCookie(entity.id);
    setActiveEntityState(entity);
    // Server Components and route handlers read entity from cookie — refresh so data matches selection without manual reload.
    router.refresh();
  };

  return (
    <EntityContext.Provider value={{ activeEntity, setActiveEntity }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity() {
  return useContext(EntityContext);
}

export function EntitySwitcher() {
  const { activeEntity, setActiveEntity } = useEntity();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700 shadow-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden />
        <span className="text-base leading-none">{activeEntity.flag}</span>
        <span className="hidden sm:inline truncate max-w-[140px] lg:max-w-[200px]">{activeEntity.name}</span>
        <span className="inline sm:hidden">{activeEntity.country}</span>
        <span className="ml-0.5 text-xs bg-primary-50 text-primary-800 px-1.5 py-0.5 rounded font-mono shrink-0">
          {activeEntity.currency}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/5"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-1.5 z-20 w-64 bg-white rounded-lg border border-neutral-200 shadow-medium overflow-hidden"
            role="listbox"
            aria-label="Switch entity"
          >
            <div className="px-3 py-2 border-b border-neutral-100">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Switch entity</p>
            </div>
            {ENTITIES.map((entity) => (
              <button
                key={entity.id}
                type="button"
                role="option"
                aria-selected={activeEntity.id === entity.id}
                onClick={() => {
                  setActiveEntity(entity);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-neutral-50 transition-colors ${
                  activeEntity.id === entity.id ? 'bg-primary-50' : ''
                }`}
              >
                <span className="text-2xl shrink-0">{entity.flag}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      activeEntity.id === entity.id ? 'text-primary-800' : 'text-ink'
                    }`}
                  >
                    {entity.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {entity.country} · {entity.currency}
                  </p>
                </div>
                {activeEntity.id === entity.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" aria-hidden />
                )}
              </button>
            ))}
            <div className="px-3 py-2 border-t border-neutral-100 bg-neutral-50">
              <p className="text-xs text-neutral-500">Multi-country payroll available in full setup</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
