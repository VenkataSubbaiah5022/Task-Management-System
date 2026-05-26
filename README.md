# Flowboard — Task Management System

Collaborative Kanban: JWT auth, role-aware tasks, drag-and-drop boards, activity feeds, and realtime sync.

## Stack

- **Next.js 16** (App Router) — deploy on Vercel (`apps/web` as root directory)
- **SQLite + Prisma** — local file DB, no Docker or cloud account required
- **Turso** (optional) — same SQLite schema on Vercel production ([turso.tech](https://turso.tech), free tier)
- **Pusher** (optional) — realtime board updates

## Quick start

```bash
pnpm install
pnpm db:push    # creates packages/db/prisma/dev.db
pnpm dev        # http://localhost:3001
```

Copy `.env.example` to `.env` if you need to change paths. Defaults are already set for local dev.

**Demo board (no login):** [/boards/demo-product-launch](http://localhost:3001/boards/demo-product-launch)

## Database

| Environment | `DATABASE_URL` |
|-------------|----------------|
| Local | `file:./packages/db/prisma/dev.db` (default in `.env`) |
| Vercel | Turso `libsql://…` + `TURSO_AUTH_TOKEN` in project env vars |

Local SQLite is a single file — run `pnpm db:push` after schema changes.

### Turso on Vercel (production)

1. Create a free DB at [turso.tech](https://turso.tech)
2. In Vercel → Project → Settings → Environment Variables:
   - `DATABASE_URL` = your `libsql://…` URL
   - `TURSO_AUTH_TOKEN` = token from Turso dashboard
3. Redeploy

## Vercel deploy

1. Import repo, set **Root Directory** to `apps/web`
2. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL` (and Turso token if using Turso)
3. Build: `cd ../.. && pnpm turbo build --filter=@tms/web`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (:3001) |
| `pnpm db:push` | Apply schema to SQLite |
| `pnpm db:studio` | Prisma Studio |
