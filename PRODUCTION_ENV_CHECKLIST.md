# Production Environment Checklist

Use this checklist before deploying the ATS to production.

## 1) Database

- [ ] `DATABASE_URL` points to your production PostgreSQL
- [ ] `prisma migrate deploy` has been run
- [ ] Seeded/created at least one active admin user in `User` table

## 2) Staff Authentication (Microsoft + domain policy)

- [ ] `STAFF_ALLOWED_DOMAIN=eaglehr.co.ke`
- [ ] `STAFF_SESSION_DAYS=7` (or your preferred value)
- [ ] `MS_TENANT_ID` set
- [ ] `MS_CLIENT_ID` set
- [ ] `MS_CLIENT_SECRET` set (secret **value**, not secret ID)
- [ ] Azure redirect URI includes:
  - [ ] `https://<your-domain>/api/auth/microsoft/callback`
- [ ] `MS_OAUTH_DEBUG` is unset or `false` in production

## 3) Email (SMTP)

- [ ] `SMTP_HOST=smtp.office365.com` (or your SMTP host)
- [ ] `SMTP_PORT=587` (or 465 for SSL)
- [ ] `SMTP_USER=recruitment@eaglehr.co.ke`
- [ ] `SMTP_PASS=<valid app password/credential>`
- [ ] `SMTP_FROM_NAME` set (optional but recommended)
- [ ] `NEXT_PUBLIC_SITE_URL=https://<your-domain>`

## 4) Monitoring / Alerts

- [ ] `MONITORING_WEBHOOK_URL` configured (Slack/Teams/webhook endpoint)
- [ ] Alert receiver is tested and receiving API failure notifications

## 5) Security and Operations

- [ ] No secrets committed in git
- [ ] `.env` exists only locally; production secrets set in host (e.g., Vercel env vars)
- [ ] Admin access reviewed (`/dashboard/staff` is admin-only)
- [ ] At least one backup admin account is active

## 6) Smoke Validation

Run:

```bash
npm run smoke:test
```

Expected:

- Login succeeds
- Job list loads
- Application submission succeeds
- Application status update succeeds
- Export endpoint returns XLSX
