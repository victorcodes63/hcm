/** Query param values for GET /api/outsourcing/attendance — matches Stabex-style employee numbers (STB-UG-*, STB-KE-*). */
export type AttendanceRegionParam = 'uganda' | 'kenya';

export function parseAttendanceRegionParam(raw: string | null | undefined): AttendanceRegionParam | null {
  const v = (raw || '').trim().toLowerCase();
  if (v === 'uganda' || v === 'ug') return 'uganda';
  if (v === 'kenya' || v === 'ke') return 'kenya';
  return null;
}

/** Prisma `startsWith` prefix for Employee.employeeNumber when filtering attendance by region. */
export function employeeNumberPrefixForAttendanceRegion(region: AttendanceRegionParam): string {
  return region === 'uganda' ? 'STB-UG' : 'STB-KE';
}
