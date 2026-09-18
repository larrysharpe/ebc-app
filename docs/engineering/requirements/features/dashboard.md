# Dashboard

| Field | Value |
|-------|-------|
| **Module** | `src/modules/dashboard` (or `src/app` + shared widgets) |
| **Feature folder** | `src/modules/dashboard/features/staff-dashboard/` |
| **Route** | `/` |
| **Phase** | 0 |
| **Status** | Draft |
| **Business source** | Cross-cutting — supports all [operations](../../../operations/README.md) |

## Overview

Staff landing page after sign-in. Surfaces at-a-glance church activity — today's schedule, recent visitors, pending tasks, and quick links to Realm, website, and frequent workflows — without duplicating full module UIs.

## Users & roles

| Role | Access |
|------|--------|
| `admin` | Full dashboard widgets |
| `office_staff` | Operations widgets (members, events, communications) |
| `pastor` | Leadership summary widgets |
| `finance` | Giving summary + Realm link only |
| `ministry_leader` | Own ministry widgets (events, volunteers, roster) |

## User stories

- As **office staff**, I want to see today's worship schedule and any calendar conflicts so that I can answer questions quickly.
- As a **ministry leader**, I want to see my ministry's upcoming events and open volunteer slots so that I can follow up before Sunday.
- As **finance**, I want a link to Realm and fund-level totals (if available) so that I don't hunt for systems.
- As **any staff user**, I want quick actions (add visitor, new event, COUNT ME IN) so that common tasks are one click away.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Authenticated users land on `/` after login
- [ ] FR-2: **Weekly rhythm** card — Sunday School, worship, Wednesday prayer/Bible study (from [church profile](../../../church/profile.md))
- [ ] FR-3: **Quick links** — Realm giving, ebenezerbc.org calendar, YouTube live, prayer email
- [ ] FR-4: Role-based widget visibility (hide finance widgets from ministry_leader, etc.)
- [ ] FR-5: Responsive layout — usable on office desktop and tablet

### Should have

- [ ] FR-6: Upcoming events (next 7 days) from events module
- [ ] FR-7: Pending visitor follow-ups count from members module
- [ ] FR-8: Weather closure banner when leadership flags inclement weather (manual toggle initially)

### Won't have (this feature)

- Full analytics or leadership reporting (future reporting module)
- Member-facing portal content
- Giving donor detail

## Data

| Entity / field | Notes |
|----------------|-------|
| `dashboard_preferences` | Optional per-user pinned widgets (future) |
| No persistent dashboard-specific business data | Aggregates from other modules |

## Integrations

| System | Use |
|--------|-----|
| Internal modules | Read-only aggregates via services |
| [Realm](../integrations/realm.md) | Link card for finance roles |
| [ebenezerbc.org](../integrations/ebenezerbc-org.md) | External links |

## UI notes

- Header: EBC logo + app nav; burgundy primary per [branding](../../../church/branding.md)
- Widget cards on white background; gold accent for section labels
- Empty state for new install: welcome message + setup checklist for admins

## Dependencies

- [Auth & roles](auth-and-roles.md)

## Acceptance criteria

- [ ] AC-1: Each role sees only permitted widgets
- [ ] AC-2: Weekly schedule matches church profile without hardcoding stale times in components (load from config or church settings)
- [ ] AC-3: Quick links open correct external URLs in new tab
- [ ] AC-4: Dashboard loads in &lt; 2s on staging with seed data

## Open questions

- [ ] Which widgets does pastor want on day one?
- [ ] Manual weather banner — who can toggle (office_staff vs admin)?
