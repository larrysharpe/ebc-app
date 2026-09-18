# Church calendar

| Field | Value |
|-------|-------|
| **Module** | `src/modules/events` |
| **Feature folder** | `features/church-calendar/` |
| **Route** | `/events` |
| **Phase** | 2 |
| **Status** | Draft |
| **Business source** | [events.md](../../../operations/events.md) |

## Overview

Internal master calendar for staff — one-time and recurring events, Activity Request fields, approvals, and facility bookings. Complements public [ebenezerbc.org calendar](https://ebenezerbc.org/event/calendar).

## User stories

- As **office staff**, I want month/week/list views so that I can plan around conflicts.
- As a **ministry leader**, I want to submit an Activity Request for approval so that it appears on the calendar and announcements.
- As **office staff or a trustee**, I want to approve or return pending requests in-app.
- As **office staff**, I want to see VBS, anniversaries, and nursing home visits on one calendar.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Month and list views
- [x] FR-2: Create event — title, date/time, location, type, ministry, description, Activity Request steps
- [x] FR-3: Event statuses — `draft`, `pending_approval`, `scheduled`, `cancelled`
- [x] FR-4: Approval / return for `office_staff` or `trustee` (plus platform admins/pastor)
- [x] FR-5a: Event types — `worship`, `education`, `meeting`, `outreach`, `special`, `other`
- [x] FR-5b: Relevance — choir plans only see worship/special; ministry calendars get own events + congregation-wide worship/special/outreach (not other ministries’ classes/meetings)
- [x] FR-5c: Activity Request wizard — People, Kitchen, Media, Floor plan, Coordination, Review + acknowledgements; optional voice coach (listen + spoken guidance)
- [x] FR-5d: Lead-time guidance — 90-day tip, 4-week flexible, &lt;3-day emergency path
- [ ] FR-5: Filter UI by ministry, type, status on `/events`
- [ ] FR-6: Cancelled events show weather/policy reason (optional note)
- [x] FR-7: Link to facility / room booking with conflict warning

### Should have

- [ ] FR-8: iCal export for staff
- [ ] FR-9: Push approved events to communications module for announcement draft
- [ ] FR-10: Read-only embed of public website events (future API)

### Won't have (v1)

- Public anonymous calendar (website handles that)
- Room layout / seating charts
- Full kitchen quantity grid from the paper PDF
- Cognito / mediaministry email auto-submit

## Data

`ChurchEvent` with `activityRequest` JSON (contacts, media, coordination, acknowledgements, lead-time / approval metadata). Status includes `pending_approval`.

## Integrations

| System | Use |
|--------|-----|
| Facilities | Space booking + conflict checks |
| Communications | Announcement draft (later) |
| [ebenezerbc.org](../../integrations/ebenezerbc-org.md) | Future sync |

## UI notes

Calendar uses burgundy for worship events, gold for special observances, green for outreach. Pending approval uses a burgundy badge; drafts stay gold/dashed.

## Dependencies

- [Auth & roles](../auth-and-roles.md)
- [Recurring worship schedule](recurring-worship-schedule.md) (displays on same calendar)
- Facilities module

## Acceptance criteria

- [x] AC-1: Double-booking same room shows warning before save
- [ ] AC-2: Published events visible on dashboard upcoming widget
- [x] AC-3: Ministry leaders submit for approval; office/trustee can Approve or Return
- [x] AC-4: Lead-time banners appear from the event date on the When step

## Open questions

- [x] Who approves events — **office_staff or trustee** (plus admins/pastor)
