export interface ParsedStaffSession {
  provider: 'local' | 'ms' | 'legacy' | 'unknown';
  userId?: string;
  role?: string;
  email?: string;
}

export function getStaffSessionMaxAgeSeconds() {
  const rawDays = Number(process.env.STAFF_SESSION_DAYS || 7);
  const safeDays = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 7;
  return Math.round(safeDays * 24 * 60 * 60);
}

export function parseStaffSession(value: string): ParsedStaffSession {
  if (!value) return { provider: 'unknown' };

  const parts = value.split(':');
  const provider = parts[0];

  if (provider === 'local' && parts.length >= 3) {
    return {
      provider: 'local',
      userId: parts[1],
      role: parts[2],
    };
  }

  if (provider === 'ms' && parts.length >= 4) {
    return {
      provider: 'ms',
      userId: parts[1],
      role: parts[2],
      email: parts.slice(3).join(':'),
    };
  }

  if (provider === 'legacy' && parts.length >= 2) {
    return {
      provider: 'legacy',
      email: parts.slice(1).join(':'),
    };
  }

  return { provider: 'unknown' };
}
