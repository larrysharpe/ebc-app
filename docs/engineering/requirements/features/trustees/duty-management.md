# Trustee duty management

| Field | Value |
|-------|-------|
| **Module** | `src/modules/trustees` |
| **Feature folder** | `features/duty-management/` |
| **Route** | `/trustees` |
| **Phase** | 3 |
| **Status** | Draft |
| **Business source** | [trustees.md](../../../operations/trustees.md) |

## Overview

Board dashboard for trustee **duties** — create assignments, track due dates, mark complete, and surface overdue items for meetings. Replaces scattered email and spreadsheet tracking.

## Users & roles

See [trustees README](README.md). Primary users: trustee officers and board members with `trustee` role.

## User stories

- As **Trustee Chair**, I want to assign a property walk-through to a board member so that FLC maintenance is covered before winter.
- As **Trustee Treasurer**, I want a recurring monthly duty to review Realm reports so that nothing is missed.
- As a **trustee**, I want to see my open duties on one screen so that I know what is due this week.
- As **Trustee Secretary**, I want overdue duties on the meeting agenda so that the board follows up.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Duty list — filters: assignee, category, status, due date range
- [ ] FR-2: Categories — `financial`, `property`, `capital`, `governance`, `compliance` (from operations)
- [ ] FR-3: Create duty — title, description, category, assignee (person from members), due date
- [ ] FR-4: Recurrence — none, weekly, monthly, quarterly, annual
- [ ] FR-5: Status — `open`, `in_progress`, `completed`, `blocked`, `cancelled`
- [ ] FR-6: Assignee marks complete with optional note
- [ ] FR-7: **My duties** view for logged-in trustee
- [ ] FR-8: Overdue highlight and count on dashboard widget (trustee roles only)
- [ ] FR-9: Link duty to [facilities](../facilities/space-reservations.md) reservation or Nehemiah milestone (optional reference field)

### Should have

- [ ] FR-10: Email notification on assign and 3-day reminder
- [ ] FR-11: Attach file (vendor quote, inspection report) — stored securely
- [ ] FR-12: Quick link to [Realm giving hub](../giving/realm-giving-hub.md) for financial duties

### Won't have

- Full accounting / GL (Realm)
- Legal document e-sign

## Data

| Entity / field | Notes |
|----------------|-------|
| `TrusteeDuty` | all FR fields + created_by, completed_at |
| `DutyComment` | optional thread on blocked items |
| `recurrence_rule` | structured or RRULE |

## Integrations

| System | Use |
|--------|-----|
| Members | Assignee person_id |
| Giving / Realm | Link card for financial duties |
| Facilities | Optional reservation_id |
| Dashboard | Overdue widget |

## UI notes

- Board table aesthetic — clear, professional; burgundy accents per [branding](../../../church/branding.md)
- Status chips: overdue (red), due soon (gold), complete (green)

## Dependencies

- [Auth & roles](../auth-and-roles.md) — `trustee` role
- [Member directory](../members/member-directory.md) — assignees

## Acceptance criteria

- [ ] AC-1: Non-trustee users cannot access `/trustees`
- [ ] AC-2: Completing duty records actor and timestamp in audit log
- [ ] AC-3: Recurring duty spawns next instance on completion

## Open questions

- [ ] Which officers can assign vs all trustees?
- [ ] Tie-in to Junior Trustees program (youth page)?
