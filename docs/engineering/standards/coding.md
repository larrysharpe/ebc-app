# Coding Standards

TypeScript and React conventions for EBC APP. **Cursor and all contributors must follow these standards on every code change.**

Related: [project structure & barrels](project-structure.md) · [UX](ux.md) · [security & privacy](security-and-privacy.md) · [testing](testing.md)

## Pre-change review (required)

Before submitting or completing any code change, verify:

- [ ] [Project structure](project-structure.md) — feature folders, colocated files, barrel imports
- [ ] [UX](ux.md) — mobile-first; one job above the fold; plain labels; large tap targets
- [ ] Module boundaries — services/repositories not bypassed; no cross-module deep imports
- [ ] Authorization on every mutating path — not UI-only hiding
- [ ] No PII, giving data, or secrets in logs, analytics, or client errors
- [ ] Zod validation on external inputs
- [ ] Loading, empty, and error UI for data views
- [ ] Tests for non-trivial service and util logic
- [ ] `Realm` remains system of record for giving — no contribution storage in EBC APP

## General principles

1. **Clarity over cleverness** — Future maintainers may be volunteers or part-time contributors.
2. **Types are documentation** — Avoid `any`; use explicit types at module and feature boundaries.
3. **Small, focused units** — One component, hook, or function per responsibility.
4. **Church data is sensitive** — Never log PII or giving amounts.
5. **Colocate by feature** — Component, styles, types, constants, hooks, and tests live together.

## TypeScript

- **Strict mode** — `strict: true` in `tsconfig.json`
- **Explicit return types** — On all exported functions and service methods
- **Unions over enums** — String unions or `as const` objects
- **Null safety** — Optional chaining; avoid `!` unless commented
- **`import type`** — Use for type-only imports

```typescript
type MembershipStatus = 'visitor' | 'attender' | 'member' | 'inactive';

const MEMBERSHIP_LABELS = {
  visitor: 'Visitor',
  attender: 'Regular Attender',
  member: 'Member',
  inactive: 'Inactive',
} as const;
```

## Naming

| Item | Convention | Example |
|------|------------|---------|
| Feature folders | kebab-case | `member-directory/` |
| Variables, functions | camelCase | `getMemberById` |
| Types, interfaces | PascalCase | `Member`, `MemberRowProps` |
| Constants (exported) | `*.constants.ts`, camelCase or `as const` | `member-directory.constants.ts` |
| React components | PascalCase | `MemberDirectory` |
| Component files | PascalCase `.tsx` | `MemberDirectory.tsx` |
| Hooks | `use-` prefix, kebab-case file | `use-member-directory.ts` |
| Services / repos | `*.service.ts`, `*.repository.ts` | `member.service.ts` |
| Utils | `*.utils.ts` | `member-directory.utils.ts` |
| Styles | `*.styles.ts` or `*.module.css` | `MemberRow.module.css` |
| Tests | colocated `*.test.ts(x)` | `MemberDirectory.test.tsx` |

Use domain language from [business operations](../../operations/README.md).

## Imports

Follow [project structure](project-structure.md) barrel rules strictly.

```typescript
// Order: external → @/ aliases → relative → type-only
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { listMembers } from '@/modules/members';

import { MemberRow } from './components/MemberRow';
import type { MemberDirectoryProps } from './member-directory.types';
```

- **No default exports** for components or services — named exports only (easier refactors and barrel re-exports)
- **No deep cross-module paths** — always `@/modules/<name>`
- **No circular imports** — extract shared types to `types/` if needed

Exception: Next.js `page.tsx`, `layout.tsx`, and `route.ts` may use `default export` per framework requirement.

## Layer responsibilities

| Layer | Location | Allowed |
|-------|----------|---------|
| Route / page | `src/app/` | Compose features, read params, metadata |
| Feature UI | `modules/*/features/` | Presentation, local state, hooks calling services |
| Service | `modules/*/services/` | Business rules, authorization checks, orchestration |
| Repository | `modules/*/repositories/` | Database queries only |
| Schema | `modules/*/schemas/` | Zod validation |
| Integration | `modules/*/integrations/` | Third-party APIs (Realm, etc.) |

**Never** call repositories from components. **Never** put SQL/Prisma in components or route handlers.

## React / Next.js

- **Server Components by default** — `'use client'` only for interactivity, browser APIs, or hooks
- **One main component per feature file** — extract subcomponents to `components/` subfolders
- **Props types** in `*.types.ts` when props are non-trivial or reused
- **Accessibility** — Semantic HTML, associated labels, keyboard support, focus management in modals
- **Data states** — Every async view handles `loading`, `empty`, `error`, and `success`

```typescript
// Client boundary — minimal surface
'use client';

import { useMemberDirectory } from './use-member-directory';
import type { MemberDirectoryProps } from './member-directory.types';

export function MemberDirectory({ ministryId }: MemberDirectoryProps) {
  const { members, status, error } = useMemberDirectory(ministryId);

  if (status === 'loading') return <MemberDirectorySkeleton />;
  if (status === 'error') return <ErrorState message={error.message} />;
  if (members.length === 0) return <EmptyState title="No members found" />;

  return (/* ... */);
}
```

## Styling

- **Tailwind** for utility classes on shared/layout components
- **Colocated styles** for complex or repeated feature styles (`*.module.css` or `*.styles.ts`)
- **No global styles** for feature-specific UI — only tokens in `src/styles/`
- **Design tokens** — spacing, color, typography from shared config; no magic hex in features

## Responsive UI (mobile-first)

EBC APP is **mobile-first**: default styles target phones; `sm:`, `md:`, `lg:`, and `xl:` enhance layout on larger screens.

- **Navigation** — `AppShell` uses a slide-out drawer below `lg`; persistent sidebar at `lg+`
- **Touch targets** — Interactive controls at least **44×44px** on mobile (nav links, menu button)
- **Tables** — Card/list layout on small screens; table + horizontal scroll from `md`/`lg` when needed
- **Typography** — Truncate long titles in headers; avoid horizontal overflow (`overflow-x-hidden` on `body`)
- **Content width** — Main content uses `max-w-6xl` / `xl:max-w-7xl` so wide monitors stay readable
- **Safe areas** — Respect notches/home indicators via viewport `viewportFit: cover` and `.safe-*` utilities when needed
- **Test** — Verify new UI at ~375px width before desktop-only polish

## Error handling

- **User-facing** — Plain language; no stack traces
- **Services** — Typed errors (`NotFoundError`, `ForbiddenError`); never empty `catch`
- **API routes** — `{ error: string, code?: string }` consistently
- **Never expose** — DB errors, paths, auth internals

## Security (code-level)

- Check permissions in **services**, not only in UI
- Sanitize and validate all inputs with Zod
- No `dangerouslySetInnerHTML` without explicit review
- No member or giving data in `console.log`, Sentry, or analytics payloads

## Dependencies

- Add packages deliberately; document why in PR if non-obvious
- Run `npm audit` on upgrades; no critical unresolved CVEs
- Prefer built-ins and existing `lib/` utilities

## Comments & TODOs

- Explain **why**, not **what**
- `// TODO(ebc): description — see docs/path` format
- No commented-out code in merged work

## Code review checklist

- [ ] Feature-based folder structure with colocated types/constants/styles/tests
- [ ] Barrel `index.ts` updated; no new deep imports across modules
- [ ] Layer boundaries respected (component → service → repository)
- [ ] Authorization verified for the operation
- [ ] No sensitive data in logs
- [ ] Types, Zod schemas, and explicit return types on exports
- [ ] Tests for services and utils
- [ ] Accessible UI and async states handled
- [ ] Mobile-first layout verified (phone width + desktop breakpoint)
