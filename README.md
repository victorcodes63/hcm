# HRIS Demo

Next.js **human resources information system** demo: workforce records, payroll, recruitment / ATS, leave, rota, outsourcing clients, accounts, and employee self-service (ESS). Branding defaults follow the bundled demo tenant (**Stabex International** / **HRIS Demo**); override with `NEXT_PUBLIC_*` env vars per deployment.

## Requirements

- Node.js 20+
- PostgreSQL (e.g. Neon) — set `DATABASE_URL`

## Quick start

```bash
cd hris-demo
npm install
cp .env.example .env.local   # if present; configure DATABASE_URL and auth secrets
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Staff dashboard: `/dashboard/login`. ESS: `/ess/login`.

## Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run seed:demo` | Full demo seed (requires `DATABASE_URL`) |
| `npm run db:seed-disciplinary` | Sample disciplinary + grievance rows |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:migrate:deploy` | Apply migrations (CI / production) |

## Documentation

- [`docs/MODULE_AGENTS.md`](./docs/MODULE_AGENTS.md) — module ownership and parallel workstreams  
- [`docs/STAFF-LEAVE.md`](./docs/STAFF-LEAVE.md) — staff leave module notes  
- [`docs/RESET-AND-GO-LIVE.md`](./docs/RESET-AND-GO-LIVE.md) — reset / go-live operations  
- [`docs/archive/`](./docs/archive/) — older setup and ATS notes (paths may predate this rename)

## License

Private / proprietary — use and distribution per your organisation’s agreement.
