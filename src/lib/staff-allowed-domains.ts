/**
 * Staff password + OAuth login may only accept emails whose domain is listed in
 * `STAFF_ALLOWED_DOMAIN` (comma-separated). When unset, allow demo seeds (@stabexintl.com)
 * and legacy seeds (@example.com).
 */
export const DEFAULT_STAFF_ALLOWED_DOMAIN_ENV = 'stabexintl.com,example.com';

export function getStaffAllowedDomains(): string[] {
  return (process.env.STAFF_ALLOWED_DOMAIN || DEFAULT_STAFF_ALLOWED_DOMAIN_ENV)
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}
