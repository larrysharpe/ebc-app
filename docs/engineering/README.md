# Engineering

Technical documentation for **EBC APP** and related software that supports Ebenezer Baptist Church operations.

## Relationship to business docs

Business documentation in [`docs/`](../README.md) describes **how the church runs**. Engineering documentation describes **what we build** to support those operations.

| Layer | Location | Audience |
|-------|----------|----------|
| **Business** | [`docs/`](../README.md) | Pastor, staff, ministry leaders, volunteers |
| **Engineering** | `docs/engineering/` | Developers, technical contributors |

When business processes change, update the [operations](../operations/README.md) doc first. Then update [requirements](requirements/README.md) if software behavior should follow.

## Documentation map

### Product

| Document | Description |
|----------|-------------|
| [App vision](vision.md) | Goals, principles, and scope for EBC APP |
| [Requirements](requirements/README.md) | Software requirements traced to business operations |
| [Feature specs](requirements/features/README.md) | Per-feature requirements, routes, and acceptance criteria |
| [Backlog](../BACKLOG.md) | Open decisions, doc gaps, phased build work |

### Architecture

| Document | Description |
|----------|-------------|
| [Architecture overview](architecture/overview.md) | System design, layers, and data flow |
| [Application layout](architecture/application-layout.md) | Repository structure, modules, and boundaries |
| [Sensitive data & third parties](architecture/sensitive-data-and-third-parties.md) | PII, giving data, and vendor strategy |
| [Technology stack](stack.md) | Languages, frameworks, and infrastructure choices |

### Standards

| Document | Description |
|----------|-------------|
| [Standards index](standards/README.md) | How standards fit together + Cursor rules |
| [Coding standards](standards/coding.md) | TypeScript, React, layers, pre-change review checklist |
| [Project structure & barrels](standards/project-structure.md) | Feature folders, colocation, `index.ts` exports |
| [Git & workflow](standards/git-and-workflow.md) | Branching, commits, and pull requests |
| [Security & privacy](standards/security-and-privacy.md) | Auth, data handling, and compliance |
| [Testing](standards/testing.md) | Test types, coverage expectations, and CI |

### Integrations

| Document | Description |
|----------|-------------|
| [Realm](integrations/realm.md) | Giving platform — in use |
| [ebenezerbc.org](integrations/ebenezerbc-org.md) | Public website — content reference & future sync |
| [Social platforms](integrations/social-platforms.md) | Meta, YouTube, community event feeds |

### Development

| Document | Description |
|----------|-------------|
| [Getting started](development/getting-started.md) | Local setup, environment, and first run |

### Future

Add as the project matures:

- API reference
- Deployment runbooks
- Architecture decision records (ADRs)

## Conventions

- Requirements reference business docs by path (e.g. `operations/members.md`), not the reverse.
- Technical decisions are recorded in engineering docs; operational policies stay in business docs.
- **Code changes** must follow [standards/](standards/README.md); Cursor rules in `.cursor/rules/` enforce them automatically.
