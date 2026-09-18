# Application Layout

How the EBC APP codebase is organized — repository structure, feature folders, barrel exports, and module boundaries.

**Canonical detail:** [project structure & barrels](../standards/project-structure.md) · **Cursor enforcement:** `.cursor/rules/`

## Repository structure

```
EBC APP/
├── .cursor/rules/           # Cursor instructions for code changes
├── docs/                    # Business & engineering documentation
├── src/
│   ├── app/                 # Thin Next.js routes only
│   ├── modules/             # Domain modules → features → colocated files
│   ├── components/          # Shared UI (each with barrel)
│   ├── lib/                 # Cross-cutting utilities
│   └── styles/              # Global design tokens only
├── prisma/                  # Schema and migrations
├── tests/                   # Integration and e2e
├── scripts/
├── .github/
└── package.json
```

## Domain module structure

```
src/modules/members/
├── features/                # Feature-based grouping (primary organization)
│   ├── member-directory/
│   └── household-detail/
├── services/
├── repositories/
├── schemas/
├── types/                   # Shared across features in this module
├── constants/
├── integrations/
└── index.ts                 # Module barrel
```

### Feature folder (colocated files)

Each feature keeps related files together:

| Suffix / file | Role |
|---------------|------|
| `FeatureName.tsx` | Main component |
| `feature-name.types.ts` | Types and props |
| `feature-name.constants.ts` | Labels, config, `as const` maps |
| `feature-name.utils.ts` | Pure helpers |
| `use-feature-name.ts` | Hooks |
| `FeatureName.styles.ts` | Colocated styles |
| `FeatureName.test.tsx` | Tests |
| `components/` | Private subcomponents with own barrels |
| `index.ts` | Feature barrel |

### Module boundary rules

1. **Barrel imports only** — `import { ... } from '@/modules/members'`, never deep paths into `features/` or `repositories/` from outside the module.
2. **No cross-module repository access** — Call the other module's service.
3. **IDs across boundaries** — Pass `memberId`, not full entity graphs.
4. **Shared UI** — Only truly reusable pieces in `src/components/`; module UI stays in `features/`.

## Route layout

Routes compose features from module barrels. No business logic in `src/app/`.

**Shell:** `AppShell` → `AppShellLayout` (client) — mobile drawer navigation below `lg`, fixed sidebar at `lg+`, sticky header, centered main column. See [coding standards — responsive UI](../standards/coding.md#responsive-ui-mobile-first).

| Path prefix | Module | Example feature |
|-------------|--------|-----------------|
| `/` | — | Dashboard |
| `/legal` | legal | `legal-document`, `legal-links` (public) |
| `/members` | members | `member-directory`, `household-detail` |
| `/ministries` | ministries | ministry list, detail |
| `/events` | events | calendar, event detail |
| `/music` | music | `song-catalog`, `service-music-planner` |
| `/giving` | giving | Realm links, summaries (no contribution entry) |
| `/volunteers` | volunteers | schedule, roles |
| `/trustees` | trustees | duty management, board meetings |
| `/communications` | communications | announcements |
| `/social` | social | accounts, calendar, community events |
| `/facilities` | facilities | reservations |
| `/leadership` | leadership | SOP templates, guidance, quality settings |
| `/settings` | auth | users, roles |
| `/login` | auth | sign in |

## Shared components

Each shared component is its own folder with a barrel:

```
src/components/ui/Button/
├── Button.tsx
├── Button.types.ts
├── button.constants.ts
└── index.ts
```

Import: `import { Button } from '@/components/ui/Button'`

## Data model namespace

| Prefix / schema | Module |
|-----------------|--------|
| `members_*` | members |
| `ministries_*` | ministries |
| `events_*` | events |
| `music_*` | music |
| `giving_*` | giving (minimal — Realm is system of record) |
| `trustees_*` | trustees |
| `volunteers_*` | volunteers |
| `communications_*` | communications |
| `social_*` | social |
| `facilities_*` | facilities |
| `auth_*` / `audit_*` | Cross-cutting |

## Path aliases

| Alias | Target |
|-------|--------|
| `@/*` | `src/*` |

## Adding a new feature

1. Business area exists in [operations](../../operations/README.md).
2. Create `src/modules/<module>/features/<feature-name>/` per [project structure](../standards/project-structure.md).
3. Add `index.ts` barrels (feature → module).
4. Thin route in `src/app/<module>/`.
5. Requirements in [engineering/requirements](../requirements/README.md).
6. RBAC in auth config.

## Adding a new module

Same as above, plus: database migrations, module root `index.ts`, row in this doc's route table.
