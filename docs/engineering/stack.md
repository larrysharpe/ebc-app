# Technology Stack

Languages, frameworks, and infrastructure for EBC APP. Items marked **TBD** require a decision before implementation.

## Summary

| Layer | Choice | Status |
|-------|--------|--------|
| Language | TypeScript | In use |
| Runtime | Node.js (LTS) | In use |
| Framework | Next.js (App Router) | In use |
| UI | React + Tailwind CSS | In use |
| Components | shadcn/ui (or similar) | TBD |
| Database | PostgreSQL | In use |
| ORM | Prisma | In use |
| Validation | Zod | Proposed |
| Auth | TBD (Clerk, Auth.js, or custom) | TBD |
| Hosting | TBD (Vercel, Railway, AWS, etc.) | TBD |
| CI/CD | GitHub Actions | Proposed |
| Email | TBD (Resend, SendGrid, etc.) | TBD |

## Rationale

**TypeScript + Next.js** — Full-stack web app in one codebase; strong ecosystem; good fit for a staff-facing admin tool with future member portal on the same stack.

**PostgreSQL** — Relational data (members, households, giving, events) with ACID guarantees and mature backup tooling.

**Prisma** — Type-safe schema, migrations, and queries; pairs well with Next.js and TypeScript.

**Tailwind + component library** — Fast, consistent UI without a heavy custom design system upfront.

## Version policy

- **Node.js** — Active LTS only; upgrade within one month of a new LTS release.
- **Dependencies** — Pin major versions; review security advisories weekly in production.
- **Database** — Managed PostgreSQL preferred; self-hosted only if church IT requires it.

## Environment variables

Document all required variables in `.env.example` when the app is scaffolded:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Session / token signing |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL |
| TBD | Email, integrations |

Never commit secrets. Production secrets live in the hosting provider's secret store.

## Sensitive data vendors

Member PII and giving may be handled by third parties. See [sensitive data & third parties](architecture/sensitive-data-and-third-parties.md).

| Category | Choice | Status |
|----------|--------|--------|
| **Giving & stewardship** | **Realm** (ACS Technologies) | **In use** |
| Church management (PII) | Realm (if used) or TBD | TBD — confirm modules with church |
| Authentication | Clerk, Auth.js, WorkOS | TBD |
| Email | Resend, SendGrid | TBD |

## Integrations

| System | Purpose | Priority | Doc |
|--------|---------|----------|-----|
| **Realm** | Giving, contributions, statements | **High — in use** | [integrations/realm.md](integrations/realm.md) |
| **ebenezerbc.org** | Public site — events, sermons, give page | Medium | [integrations/ebenezerbc-org.md](integrations/ebenezerbc-org.md) |
| Zoom | Meeting links for prayer/Bible study | Low | TBD |
| YouTube | Worship stream links | Low | TBD |
| Email provider | Announcements, notifications | High | TBD |

## Alternatives considered

| Option | Why not (for now) |
|--------|-------------------|
| Separate API + SPA | Extra complexity for a single-team, single-church app |
| SQLite | Insufficient for multi-user production concurrency and backup needs |
| No ORM (raw SQL) | Slower development; Prisma gives type safety and migrations |
| Mobile-native apps | Responsive web covers staff needs initially |

Record changes to these choices in this file with date and reason.

## Open decisions

- [ ] Auth provider selection
- [ ] Hosting provider (cost, church IT constraints)
- [ ] Email provider
- [ ] Component library final choice
