# Members module — features

| Module | `src/modules/members` |
| **Business source** | [Congregation & membership](../../../operations/members.md) |
| **Phase** | 1 |

## Purpose in EBC APP

Staff-facing tools for the congregation directory, households, visitors, and membership status. May sync or link to **Realm** person IDs if Realm is also the member directory — TBD.

## Features

| Feature | Spec | Route |
|---------|------|-------|
| Member directory | [member-directory.md](member-directory.md) | `/members` |
| Household detail | [household-detail.md](household-detail.md) | `/members/households/[id]` |
| Visitor intake | [visitor-intake.md](visitor-intake.md) | `/members/visitors/new` |

## Shared data model (module)

| Entity | Description |
|--------|-------------|
| `Person` | Individual — name, contact, membership status |
| `Household` | Family unit — address, primary contact |
| `PersonHousehold` | Link person to household with role (head, spouse, child) |
| `realm_person_id` | Optional external ID |

## Membership statuses

Align with [operations](../../../operations/members.md): `visitor` · `attender` · `member` · `inactive`

## Permissions (draft)

| Action | admin | office_staff | pastor | ministry_leader | finance |
|--------|-------|--------------|--------|-----------------|---------|
| View directory | ✓ | ✓ | ✓ | Scoped | — |
| View contact detail | ✓ | ✓ | ✓ | Scoped | — |
| Create / edit | ✓ | ✓ | ✓ | — | — |
| Change membership status | ✓ | ✓ | ✓ | — | — |
| Export directory | ✓ | TBD | TBD | — | — |

`ministry_leader` scoped = people in their ministry roster only.

## Open questions

- [ ] Is Realm the member directory of record, or EBC APP database?
- [ ] Children's records — guardian linkage rules
