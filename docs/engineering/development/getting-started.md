# Getting Started

Local development setup for EBC APP.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | LTS (see [stack](../stack.md)) |
| npm | Latest stable |
| Docker | For local PostgreSQL (recommended) |
| Git | 2.x |

## Quick start

```bash
cd "EBC APP"
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

`db:setup` starts PostgreSQL in Docker, runs migrations, and seeds ministries, leadership SOPs, music data, and **dev sign-in accounts**.

Open **http://localhost:3000** — you will be redirected to `/login`. Use a [dev account](#dev-sign-in-accounts) below.

After sign-in: staff dashboard with church branding, weekly schedule, ministries registry, music ministry, leadership settings, and platform settings (admin only).

### Without Docker

If you already have PostgreSQL 15+, set `DATABASE_URL` in `.env.local` and run:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

## Environment variables

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (default `http://localhost:3000`) |
| `AUTH_SECRET` | Session signing for staff login (required — 32+ characters) |
| `CURSOR_API_KEY` | Enables Ask Cursor and ministry suggested plans |
| `CRON_SECRET` | Bearer token for `/api/cron/*` jobs (required in production for Vercel Cron) |

Default Docker credentials (see `docker-compose.yml`):

```
postgresql://ebc:ebc_dev@localhost:5432/ebc_dev
```

## Common commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Auto-sync Prisma when schema changed, then start Next.js |
| `npm run dev:fresh` | Force Prisma sync, clear `.next`, start clean |
| `npm run build` | Force Prisma sync and production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript without emit |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:sync` | Force `prisma generate` + `prisma db push` |
| `npm run db:push` | Push schema to DB without a migration file |
| `npm run db:seed` | Seed database from app seed data |
| `npm run db:setup` | Up + migrate + seed (first-time setup) |
| `npm run db:studio` | Open Prisma Studio |
| Header **Ask Cursor** | Uses `@cursor/sdk` via `/api/cursor/prompt` (requires `CURSOR_API_KEY`) |

## Prisma schema changes

After editing `prisma/schema.prisma` (or adding migrations):

1. **Stop** the Next.js process (`Ctrl+C`), then run `npm run dev` again.
2. `npm run dev` runs `scripts/ensure-prisma.mjs`, which regenerates the client, pushes the DB, and **clears `.next`** when the schema hash changed — so you should not need a manual `db:sync` for normal local work.
3. If you still see a stale-client error, run `npm run dev:fresh`.

`src/lib/db/prisma.ts` checks for required models/fields and throws a short recovery message when the in-memory client is stale (usually means the server was not restarted after a schema edit).

## Dev sign-in accounts

After `npm run db:seed` (or `db:setup`), local PostgreSQL includes demo staff accounts for testing roles and permissions.

**Password for all dev accounts:** `EBCDev2026!`

Source of truth: `src/modules/auth/data/users.seed.ts` (re-run `npm run db:seed` to reset accounts). Full role matrix: [Auth & roles](../requirements/features/auth-and-roles.md).

| Group | Email | Roles | Ministry scope |
|-------|-------|-------|----------------|
| Platform | `superadmin@ebenezerbc.org` | Super Admin | — |
| Platform | `admin@ebenezerbc.org` | Administrator | — |
| Platform | `webmaster@ebenezerbc.org` | Webmaster (Cursor can edit app) | — |
| Church staff | `pastor@ebenezerbc.org` | Pastor | — |
| Church staff | `office@ebenezerbc.org` | Office Staff | — |
| Church staff | `finance@ebenezerbc.org` | Finance | — |
| Other | `trustee@ebenezerbc.org` | Trustee | — |
| Other | `facilities@ebenezerbc.org` | Facility Manager | — |
| Other | `facilities.assistant@ebenezerbc.org` | Facility Manager | — |
| Other | `social@ebenezerbc.org` | Social Manager | — |
| Other | `volunteer@ebenezerbc.org` | Volunteer | — |
| Music | `music@ebenezerbc.org` | Music Minister | — |
| Music | `choir@ebenezerbc.org` | Choir Director | — |
| Music | `choir.member@ebenezerbc.org` | Choir Member | — |
| Music | `band@ebenezerbc.org` | Band Director | — |
| Music | `band.member@ebenezerbc.org` | Band Member | — |
| Ministry leader | `youth.leader@ebenezerbc.org` | Ministry Leader | Youth Ministry |
| Ministry leader | `missionary.leader@ebenezerbc.org` | Ministry Leader | Missionary Ministry |
| Ministry leader | `media.leader@ebenezerbc.org` | Ministry Leader | Media Ministry |
| Ministry leader | `womens.leader@ebenezerbc.org` | Ministry Leader | Women's Ministry |
| Ministry leader | `usher.leader@ebenezerbc.org` | Ministry Leader | Usher & Greeter |
| **Multi-role** | `deacon.choir.jamm@ebenezerbc.org` | Deacon, Choir Member, Ministry Leader | JAMM |

`npm run db:seed` also prints this list in the terminal. **Do not use these credentials outside local development.**

### Dev account switcher

While running `npm run dev`, a **Dev** button appears in the bottom-right corner (and on the login page). Use it to switch between seed accounts without re-entering the password — useful when testing roles and permissions. This tool is disabled in production builds.

## Cursor agent (header prompt)

The app includes an always-visible Cursor prompt in the header (center). The browser calls a Next.js API route; the route uses the **Cursor TypeScript SDK** server-side so your API key never reaches the client.

1. Create an API key at [Cursor Dashboard → Integrations](https://cursor.com/dashboard/integrations)
2. Add to `.env.local`:

```bash
CURSOR_API_KEY=cursor_...
CURSOR_MODEL=composer-2.5
```

**Attachments:** paperclip accepts images (sent to the model), videos, and other files (saved under `.data/cursor-uploads/` and referenced in the prompt). Limits: images 10MB, docs 25MB, videos **200MB**, max 5 files.

**App control:** phrases like `open media ministry SOPs` or `go to Golden Eagles` navigate inside EBC APP immediately (allowlisted routes only). The agent can also emit an `APP_ACTION` navigate block for less common screens.

**Permissions:**
- Most roles get **ask-only** (plan mode) — Cursor explains and recommends but must not edit the app.
- Only the **`webmaster`** role can authorize Cursor to **edit the EBC APP codebase** (agent mode). Sign in as `webmaster@ebenezerbc.org` locally. Super Admin can assign the webmaster role; regular admins cannot.

**Local runtime (default):** agents run against this repo on the machine running `npm run dev`. Requires Node.js 22.13+ (see `@cursor/sdk`).

**Cloud runtime (production):** set `CURSOR_CLOUD_REPO` to your GitHub repo URL so agents run on Cursor's cloud VMs instead of the app server filesystem.

## Project orientation

New contributors should read in order:

1. [App vision](../vision.md)
2. [Architecture overview](../architecture/overview.md)
3. [Project structure & barrels](../standards/project-structure.md)
4. [Coding standards](../standards/coding.md)
5. `.cursor/rules/` — applied automatically in Cursor
6. Relevant [business operations](../../operations/README.md) doc for their feature area

## Current status

**Phase 0** — staff auth (email/password, RBAC, multi-role accounts), dashboard, ministries registry, music ministry (plans, songs, band roster), leadership SOP settings, and platform settings (`/settings`). Data persists in PostgreSQL via Prisma.
