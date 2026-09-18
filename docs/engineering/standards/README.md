# Technical Standards

Engineering standards for EBC APP. **Cursor applies these on every code change** via `.cursor/rules/`. All contributors follow them unless a doc records an approved exception.

## Standards documents

| Standard | Scope |
|----------|-------|
| [Coding](coding.md) | TypeScript, React, layers, imports, review checklist |
| [Project structure & barrels](project-structure.md) | Feature folders, colocation, `index.ts` export rules |
| [UX](ux.md) | Mobile-first, senior-friendly IA, plain labels, large controls |
| [Git & workflow](git-and-workflow.md) | Branches, commits, pull requests, releases |
| [Security & privacy](security-and-privacy.md) | Auth, PII, giving data, Realm boundaries |
| [Testing](testing.md) | Unit, integration, e2e, and CI expectations |

## Cursor rules

| Rule file | When it applies |
|-----------|-----------------|
| `.cursor/rules/ebc-engineering.mdc` | **Always** — mandatory pre-change review |
| `.cursor/rules/ebc-project-structure.mdc` | `src/**` — features, barrels, colocation |
| `.cursor/rules/ebc-typescript-react.mdc` | `*.{ts,tsx}` — TypeScript and React patterns |

Full detail lives in the docs above; rules are concise enforcement summaries.

## Hierarchy

When guidance conflicts, prefer in this order:

1. **Security & privacy**
2. **Business operations docs** — software implements church process
3. **Architecture docs** — module boundaries and layers
4. **Project structure & coding standards**
5. **Git workflow**

## Enforcement

- **Cursor** — Rules in `.cursor/rules/` instruct the agent before editing code
- **Pull requests** — Reviewer checks standards compliance before merge
- **CI** — Lint, typecheck, and tests must pass (once configured)

## Updating standards

1. Propose change in a PR with rationale
2. Update the relevant doc in `docs/engineering/standards/`
3. Update `.cursor/rules/` if enforcement summary changes
4. Migrate existing code in a follow-up if needed
