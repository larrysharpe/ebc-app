# Household detail

| Field | Value |
|-------|-------|
| **Module** | `src/modules/members` |
| **Feature folder** | `features/household-detail/` |
| **Route** | `/members/households/[id]` |
| **Phase** | 1 |
| **Status** | Draft |
| **Business source** | [members.md](../../../operations/members.md) |

## Overview

Single view of a family unit — address, all members, membership status per person, ministry participation summary, and links to related activity (events, volunteer roles). Supports Ebenezer's family-centered mission.

## User stories

- As **office staff**, I want to see everyone at one address so that I can update the household correctly.
- As **office staff**, I want to add a spouse or child to a household so that records stay grouped.
- As a **ministry leader**, I want to see which ministries household members serve in (scoped) so that I can coordinate.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Display household address, primary phone, primary email
- [ ] FR-2: List all linked persons with role in household (head, spouse, child, other)
- [ ] FR-3: Edit household address and contact (office_staff+)
- [ ] FR-4: Add existing person to household or create new person inline
- [ ] FR-5: Remove person from household (not delete person record — soft unlink)
- [ ] FR-6: Per-person membership status edit with audit log
- [ ] FR-7: Activity sidebar: ministries (from ministries module), upcoming events (from events module)

### Should have

- [ ] FR-8: Visitor follow-up notes (restricted visibility — pastor/office)
- [ ] FR-9: Realm link per person

### Won't have

- Full pastoral counseling notes (future restricted module)
- Giving history (Realm only)

## Data

| Entity / field | Notes |
|----------------|-------|
| `Household` | address lines, city, state, zip, primary_phone, primary_email |
| `Person` | linked via `PersonHousehold` |
| `membership_status` | on Person |
| `household_notes` | optional; role-restricted |

## Integrations

Ministries and events modules via service IDs only.

## UI notes

- Household header card; member cards below
- Edit mode inline or slide-over — not separate page for simple updates

## Dependencies

- [Member directory](member-directory.md)
- Ministries module (read-only participation)

## Acceptance criteria

- [ ] AC-1: Audit log records membership status changes with actor
- [ ] AC-2: Cannot add same person to two households without explicit transfer workflow
- [ ] AC-3: `finance` role cannot access this route

## Open questions

- [ ] Household merge workflow when duplicates found?
- [ ] Mailing label export?
