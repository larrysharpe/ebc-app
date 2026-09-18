# Ministry registry

| Field | Value |
|-------|-------|
| **Module** | `src/modules/ministries` |
| **Feature folder** | `features/ministry-registry/` |
| **Route** | `/ministries` |
| **Phase** | 1 |
| **Status** | In progress |
| **Business source** | [ministries.md](../../../operations/ministries.md) |

## Overview

Browse and manage all Ebenezer ministries grouped by category (fellowship, outreach, leadership, etc.). Entry point for leaders and staff to open rosters and update ministry metadata.

## User stories

- As **office staff**, I want a complete ministry list so that I can direct visitors to the right program.
- As **admin**, I want to add a ministry and assign a director so that the registry stays current.
- As a **ministry leader**, I want to open my ministry page so that I can manage my roster.

## Functional requirements

### Must have (MVP)

- [x] FR-1: Card or table view grouped by category
- [x] FR-2: Fields — name, category, short description, primary leader name
- [ ] FR-3: Search by ministry name
- [x] FR-4: Click → [ministry roster](ministry-roster.md) / ministry detail
- [x] FR-5: Admin / ministry manager edit ministry metadata (name, category, description, meeting rhythm, website URL)
- [x] FR-6: Optional `website_url` link to ebenezerbc.org ministry page

### Should have

- [x] FR-7: Meeting schedule summary on card (e.g. "4th Tuesday", "Wed noon")
- [ ] FR-8: Participant count badge
- [ ] FR-9: Create new ministry from registry (admin)
- [ ] FR-10: Change URL slug (kept stable today so links do not break)

### Won't have

- Ministry budget management (finance / Realm)
- Full website CMS sync (manual or future integration)

## Data

`Ministry`, `MinistryLeader` — see module README.

## UI notes

Category sections with burgundy headings; ministry cards with green accent for outreach, gold for fellowship — subtle, not garish.

## Dependencies

- [Auth & roles](../auth-and-roles.md)
- Members module (person links)

## Acceptance criteria

- [ ] AC-1: Seed script loads all website-listed ministries for dev
- [ ] AC-2: `ministry_leader` users land on their ministry if scoped to one

## Open questions

- [ ] Display contact emails from website on registry or keep in roster only?
