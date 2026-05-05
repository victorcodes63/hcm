export interface ParsedEssSession {
  provider: 'local' | 'unknown';
  userId?: string;
  role?: string;
}

export function getEssSessionMaxAgeSeconds() {
  const rawDays = Number(process.env.ESS_SESSION_DAYS || 7);
  const safeDays = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 7;
  return Math.round(safeDays * 24 * 60 * 60);
}

export function parseEssSession(value: string): ParsedEssSession {
  if (!value) return { provider: 'unknown' };
  const parts = value.split(':');
  if (parts[0] === 'local' && parts.length >= 3) {
    return {
      provider: 'local',
      userId: parts[1],
      role: parts[2],
    };
  }
  return { provider: 'unknown' };
}
