# QIPOS

Qonita Islamic Point Organization System untuk mengelola data santri,
pelanggaran, prestasi, dan akses wali santri.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` and `SESSION_SECRET`
- Linux deployment guide: `deploy/README.md`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sipos/` — React/Vite frontend
- `artifacts/api-server/` — Express API and session middleware
- `lib/db/src/schema/sipos.ts` — PostgreSQL/Drizzle schema
- `lib/api-spec/openapi.yaml` — API contract
- `scripts/src/seed-sipos.ts` — idempotent initial account/master-point seed
- `deploy/` — Linux build, Nginx, systemd, environment, and deployment guide

## Architecture decisions

- PostgreSQL is the source of truth for application data and sessions.
- The frontend is a static SPA; Nginx serves it and proxies `/api` to Express.
- Session cookies are HTTP-only and stored in PostgreSQL via `connect-pg-simple`.
- The default deployment uses one domain, while `VITE_API_BASE_URL` and
  `CORS_ORIGIN` support separate frontend/API domains.

## Product

- Admin mengelola pengguna, data santri, master poin, dan koneksi wali-santri.
- Sayyid menginput pelanggaran/prestasi dan melihat dashboard.
- Wali santri hanya melihat profil dan riwayat poin santri yang terhubung.

## User preferences

- Nama produk: QIPOS — Qonita Islamic Point Organization System.

## Gotchas

- `DATABASE_URL` wajib tersedia saat API start dan saat menjalankan `db:push` atau
  `db:seed`.
- Setelah mengubah schema, backup database production sebelum `pnpm run db:push`.
- Frontend route membutuhkan fallback Nginx ke `index.html`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
