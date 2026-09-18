# Ministry roster

| Field | Value |
|-------|-------|
| **Module** | `src/modules/ministries` |
| **Feature folder** | `features/ministry-roster/` |
| **Route** | `/ministries/[id]` |
| **Phase** | 1 |
| **Status** | Draft |
| **Business source** | [ministries.md](../../../operations/ministries.md) |

## Overview

Detail page for one ministry — leaders, participants, meeting info, and link to related events and volunteer needs. Example: Youth Ministry shows a **Youth director** plus advisors on the roster.

## User stories

- As a **ministry leader**, I want to add and remove participants so that my roster is accurate.
- As a **ministry leader**, I want to assign **duties** (e.g. slides, camera, sound) so Sunday coverage is clear.
- As **office staff**, I want to see all leaders for a ministry so that I can contact the right person.
- As a **ministry leader**, I want to email my roster (export) so that I can send a ministry update.

## Functional requirements

### Must have (MVP)

- [x] FR-1: Ministry header — name, description, category, website link
- [x] FR-2: Leaders / roster — structural role, duties, contact
- [x] FR-3: Participants table — name, role, duties, phone, email (permission-scoped)
- [x] FR-4: Add participant via **church member** search (`personId`)
- [x] FR-5: Remove participant
- [x] FR-6: Edit roster (admin or assigned ministry_leader for own ministry)
- [x] FR-6b: Multi-select **duties** separate from leadership role
- [x] FR-6c: Open-role vacancies allowed without a member link

### Should have

- [ ] FR-7: Related events filtered to this ministry
- [ ] FR-8: Open volunteer slots from volunteers module
- [ ] FR-9: CSV export of roster (audit logged)

### Won't have

- Ministry-specific chat or messaging

## Data

`MinistryPerson` — **`personId`** → `Person` (church directory), structural `role`, optional `duties[]`, title, contact snapshot. Open roles use `isOpenRole` without `personId`. Named people live in Members; ops docs use roles only.

## Dependencies

- [Ministry registry](ministry-registry.md)
- [Member directory](../members/member-directory.md)
- Events, volunteers (read-only links)

## Acceptance criteria

- [ ] AC-1: Youth director can manage Youth roster only
- [ ] AC-2: Adding participant does not duplicate Person record

## Open questions

- [x] Sub-roles within ministry — **duties enum** (slides, camera, sound, …) plus free-text title when needed
