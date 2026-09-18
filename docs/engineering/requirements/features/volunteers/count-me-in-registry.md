# COUNT ME IN registry

| Field | Value |
|-------|-------|
| **Module** | `src/modules/volunteers` |
| **Feature folder** | `features/count-me-in-registry/` |
| **Route** | `/volunteers` |
| **Phase** | 2 |
| **Status** | Draft |
| **Business source** | [volunteers.md](../../../operations/volunteers.md) |

## Overview

Digital registry for Ebenezer's **COUNT ME IN!** program — volunteers, skills, ministry interests, and hours tracking. Replaces paper forms in FLC boxes and email to countmein@ebenezerbc.org.

## User stories

- As **volunteer coordinator**, I want to see all registered volunteers so that I can match skills to needs.
- As **office staff**, I want to log volunteer hours so that we honor service for reporting.
- As a **ministry leader**, I want to see who signed up for my area so that I can recruit.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: List volunteers — person, skills, interests, ministries, total hours
- [ ] FR-2: Register volunteer — link to Person or create via members module
- [ ] FR-3: Skills/interests tags (multi-select): AV, usher, nursery, kitchen, outreach, etc.
- [ ] FR-4: Log hours — date, hours, activity, ministry
- [ ] FR-5: Filter by skill, ministry, active/inactive
- [ ] FR-6: Export summary for leadership (audit logged)

### Should have

- [ ] FR-7: Import from paper form batch entry
- [ ] FR-8: Notify coordinators Deborah Eure / Charlie Parker on new signup (email)

### Won't have

- Public self-signup without staff account (phase 5 member portal)

## Data

`VolunteerProfile`, hour log entries linked to person_id.

## Dependencies

- [Member directory](../members/member-directory.md)
- [Ministries](../ministries/ministry-registry.md)

## Acceptance criteria

- [ ] AC-1: Duplicate volunteer registration warns if person already in registry
- [ ] AC-2: Hours report by ministry for date range

## Open questions

- [ ] Required fields on signup form vs website paper form?
