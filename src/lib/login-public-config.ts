import type { DemoCredentialRow } from '@/lib/demo-credentials';
import {
  getDemoLoginEmailPlaceholder,
  getDemoPassword,
  getEssDemoCredentialRow,
  getStaffDemoCredentialRows,
} from '@/lib/demo-credentials';
import { isPublicDemoMode } from '@/lib/deployment-config';

/** Public login UI config — read on the server and passed as props to avoid hydration mismatches. */
export type LoginPublicConfig = {
  emailPlaceholder: string;
  showDemoHint: boolean;
  demoPassword: string;
  staffDemoRows: DemoCredentialRow[];
  essDemoRow: DemoCredentialRow;
};

function trimEnv(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function isCredentialsHintEnabled(): boolean {
  const showHint = trimEnv('NEXT_PUBLIC_SHOW_DEMO_LOGIN_HINT');
  if (showHint === 'false' || showHint === '0') return false;
  if (showHint === 'true' || showHint === '1') return true;
  return isPublicDemoMode();
}

export function getLoginPublicConfig(): LoginPublicConfig {
  return {
    emailPlaceholder: getDemoLoginEmailPlaceholder(),
    showDemoHint: isCredentialsHintEnabled(),
    demoPassword: getDemoPassword(),
    staffDemoRows: getStaffDemoCredentialRows(),
    essDemoRow: getEssDemoCredentialRow(),
  };
}
