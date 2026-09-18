# Project Structure & Barrel Imports

How source files are grouped, colocated, and exported. **All code changes must follow this document.**

See also: [application layout](../architecture/application-layout.md), [coding standards](coding.md).

## Principles

1. **Feature-first** — Group by user-facing capability or domain workflow, not by file type at the repo root.
2. **Colocate** — Keep everything a feature needs in one folder (component, styles, types, constants, hooks, tests).
3. **Barrel exports** — Each feature and module exposes a public API through `index.ts`; consumers import from barrels, not deep paths.
4. **Thin routes** — `src/app/` pages only compose features; no business logic in route files.

## Repository layout

```
src/
├── app/                          # Next.js routes — thin wrappers only
├── modules/                      # Domain modules (members, events, …)
├── components/                   # Shared UI (design system)
│   └── ui/
│       └── Button/
│           ├── Button.tsx
│           ├── Button.types.ts
│           ├── button.constants.ts
│           └── index.ts
├── lib/                          # Cross-cutting utilities
└── styles/                       # Global tokens only
```

## Domain module layout

```
src/modules/members/
├── features/                     # User-facing capabilities
│   ├── member-directory/
│   └── household-detail/
├── services/                     # Business logic (module-wide)
├── repositories/                 # Data access (module-wide)
├── schemas/                      # Zod schemas shared across features
├── types/                        # Types shared across features
├── constants/                    # Constants shared across features
├── integrations/                 # External APIs (e.g. Realm links)
└── index.ts                      # Module barrel — public API
```

## Feature folder layout

Each feature is a self-contained unit. Name folders **kebab-case**; name React components **PascalCase**.

```
src/modules/members/features/member-directory/
├── MemberDirectory.tsx           # Main component (or feature entry)
├── MemberDirectory.test.tsx
├── member-directory.types.ts     # Feature-specific types
├── member-directory.constants.ts # Feature-specific constants
├── member-directory.utils.ts     # Feature-specific pure helpers
├── use-member-directory.ts       # Feature hooks
├── member-directory.styles.ts    # Styles (or MemberDirectory.module.css)
├── components/                   # Subcomponents used only by this feature
│   └── MemberRow/
│       ├── MemberRow.tsx
│       ├── MemberRow.types.ts
│       ├── member-row.constants.ts
│       └── index.ts              # Subcomponent barrel
└── index.ts                      # Feature barrel — export public surface only
```

### What goes in a feature folder

| File | Purpose |
|------|---------|
| `*.tsx` | Components |
| `*.types.ts` | Interfaces, type aliases, props types |
| `*.constants.ts` | Enums-as-const, labels, config, magic strings |
| `*.utils.ts` | Pure functions with no React or DB dependencies |
| `use-*.ts` | Hooks |
| `*.styles.ts` / `*.module.css` | Styles colocated with the component they serve |
| `*.test.tsx` / `*.test.ts` | Tests next to the code they cover |
| `index.ts` | Barrel — re-exports the feature public API |

### When to split into a subfolder under `components/`

Create `components/MemberRow/` when a subcomponent has its own types, constants, or styles. Keep the parent feature folder flat until complexity warrants nesting.

## Barrel imports (`index.ts`)

### Rules

1. **Every feature and shared component folder has an `index.ts`** that defines its public API.
2. **Every domain module has a root `index.ts`** re-exporting allowed cross-module surface (services, types, feature entry components).
3. **Import from barrels** — never reach into sibling implementation files across package boundaries.

```typescript
// ✅ GOOD — module barrel
import { MemberDirectory, getMemberById } from '@/modules/members';

// ✅ GOOD — feature barrel (within same module)
import { MemberRow } from './components/MemberRow';

// ✅ GOOD — shared UI barrel
import { Button } from '@/components/ui/Button';

// ❌ BAD — deep cross-module path
import { MemberDirectory } from '@/modules/members/features/member-directory/MemberDirectory';

// ❌ BAD — bypassing barrel from another module
import { memberRepository } from '@/modules/members/repositories/member.repository';
```

4. **Barrels export only what other modules need** — keep repositories and internal utils private to the module.
5. **No barrel cycles** — if A imports B and B imports A, extract shared code to `types/` or `lib/`.
6. **Explicit named exports** — prefer `export { MemberDirectory }` over `export *` except in module root re-exports of features.

### Feature barrel example

```typescript
// src/modules/members/features/member-directory/index.ts
export { MemberDirectory } from './MemberDirectory';
export type { MemberDirectoryProps } from './member-directory.types';
```

### Module barrel example

```typescript
// src/modules/members/index.ts
export { MemberDirectory } from './features/member-directory';
export { HouseholdDetail } from './features/household-detail';
export { getMemberById, listMembers } from './services/member.service';
export type { Member, Household } from './types';
// Do NOT export repositories — internal to module
```

### Shared component barrel example

```typescript
// src/components/ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

## Path aliases

| Alias | Maps to |
|-------|---------|
| `@/` | `src/` |
| `@/modules/*` | Domain modules |
| `@/components/*` | Shared UI |
| `@/lib/*` | Shared utilities |

Configure in `tsconfig.json` paths when the app is scaffolded.

## Route files (`src/app/`)

Pages import features and pass route params — nothing else.

```typescript
// src/app/members/page.tsx
import { MemberDirectory } from '@/modules/members';

export default function MembersPage() {
  return <MemberDirectory />;
}
```

## Services, repositories, schemas

- Live at **module root** (`services/`, `repositories/`, `schemas/`) when shared across multiple features in the module.
- Move into a **feature folder** only when used by a single feature and not anticipated to be shared.

## Adding a new feature

1. Create `src/modules/<module>/features/<feature-name>/` with the layout above.
2. Add `index.ts` barrel before importing the feature elsewhere.
3. Re-export from `src/modules/<module>/index.ts` if other modules or routes need it.
4. Add route under `src/app/` if user-facing.
5. Update [requirements](../requirements/README.md) traceability if new capability.

## Anti-patterns

| Anti-pattern | Fix |
|--------------|-----|
| `components/`, `hooks/`, `types/` at repo root by file type | Use `modules/<domain>/features/<feature>/` |
| 500-line component file | Split into feature subcomponents with barrels |
| Importing across modules via deep paths | Import from `@/modules/<name>` barrel only |
| Styles in global CSS for feature-specific UI | Colocate `*.styles.ts` or CSS module with component |
| Business logic in `page.tsx` | Move to `services/` |
