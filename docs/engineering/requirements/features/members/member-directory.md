# Member directory

| Field | Value |
|-------|-------|
| **Module** | `src/modules/members` |
| **Feature folder** | `features/member-directory/` |
| **Route** | `/members` |
| **Phase** | 1 |
| **Status** | Draft |
| **Business source** | [members.md](../../../operations/members.md) |

## Overview

Searchable, filterable list of people in the Ebenezer congregation. Primary tool for office staff and leaders to find members, check membership status, and open household records.

## Users & roles

See [members README](README.md) permission matrix.

## User stories

- As **office staff**, I want to search by name or phone so that I can quickly find a member when they call.
- As a **ministry leader**, I want to see only people in my ministry so that I can contact my team without accessing the full church directory.
- As **pastor**, I want to filter by membership status (visitor, member, inactive) so that I can plan follow-up.

## Functional requirements

### Must have (MVP)

- [x] FR-1: Paginated table — name, household, phone, email, membership status *(basic list shipped; household later)*
- [x] FR-2: Search by name (partial match), phone, email
- [ ] FR-3: Filter by membership status
- [ ] FR-4: Sort by last name, recently updated
- [ ] FR-5: Row click → [household detail](household-detail.md) or person panel
- [ ] FR-6: "Add visitor" CTA → [visitor intake](visitor-intake.md)
- [x] FR-7: Role-based access to `/members` *(ministry leaders can view; used by roster picker)*

### Should have

- [ ] FR-8: Filter by ministry affiliation
- [ ] FR-9: Export CSV (admin/office only; audit logged)
- [ ] FR-10: Link to Realm profile when `realm_person_id` present

### Won't have

- Public member directory for anonymous users
- Giving history on this screen

## Data

Reads `Person`, `Household`, `PersonHousehold` — see module README.

Display fields only; no sensitive notes on list view.

## Integrations

| System | Use |
|--------|-----|
| [Realm](../../integrations/realm.md) | Optional profile link |
| Ministries module | Ministry filter via service call |

## UI notes

- Data table with burgundy header row or accent
- Status badges: visitor (neutral), attender (blue), member (green), inactive (gray)
- Mobile: card list instead of table

## Dependencies

- [Auth & roles](../auth-and-roles.md)

## Acceptance criteria

- [ ] AC-1: Search returns results in &lt; 500ms for 2,000 members (staging)
- [ ] AC-2: `ministry_leader` never receives out-of-scope records in API response
- [ ] AC-3: Empty search shows helpful empty state, not error

## Open questions

- [ ] Include photo thumbnails?
- [ ] Directory print view needed?
