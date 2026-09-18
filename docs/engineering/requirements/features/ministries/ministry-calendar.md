# Ministry calendar

| Field | Value |
|-------|-------|
| **Module** | `src/modules/ministries` |
| **Feature folder** | `features/ministry-detail/components/CalendarPanel/` |
| **Route** | `/ministries/[slug]?tab=calendar` |
| **Phase** | 1 |
| **Status** | In progress (preview) |
| **Business source** | [ministries.md](../../../operations/ministries.md) |

## Overview

Ministry schedule for board meetings, outreach, rehearsals, and rhythms — built on the master [`ChurchEvent`](../../events/church-calendar.md) store. Each ministry calendar shows:

1. Events assigned to that ministry (`ministryId` set)
2. **Church-wide** master events (`ministryId` null) from Events → Calendar

Ministry leaders add ministry-scoped events here; those records also appear on the staff Events calendar. **Church-wide rows are always view-only on this tab** (edit them under Events → Calendar). Only people who can manage the ministry (`ministry_leader` for this ministry, or office/pastor/admin) get Edit / Publish / Cancel / Delete on **this ministry’s** events.

## User stories

- As a **ministry leader**, I want to add our meeting dates so volunteers know when to show up.
- As a **ministry leader**, I want to see church-wide dates on our calendar so we don’t miss shared events.
- As **office staff**, I want to see all ministry calendars so I can avoid room conflicts.

## Functional requirements

### Must have (MVP)

- [x] FR-1: List upcoming ministry events sorted by date
- [x] FR-2: Add event — title, optional date/time, location, notes, structured recurrence (expands ~90 days); ministry events default to **draft**
- [x] FR-3: Remove event (ministry-owned only on this tab; church-wide managed under Events)
- [x] FR-4: Include church-wide master calendar events on every ministry calendar
- [x] FR-4b: Toggle visibility of church-wide events on the ministry calendar (client filter; default on)
- [x] FR-4c: AI Suggest time — calendar + holiday conflict check (Cursor); apply fills date/time
- [x] FR-5: Edit existing ministry-owned event (this date only) + publish draft → scheduled
- [ ] FR-6: Link to [facilities](../../facilities/space-reservations.md) for room booking

### Should have

- [ ] FR-7: Promote ministry event to church-wide (clear `ministryId`)
- [ ] FR-7b: Edit / cancel whole recurrence series
- [ ] FR-8: iCal export per ministry
- [ ] FR-9: Reminder notifications

## Data

`ChurchEvent` (Prisma) with optional `ministryId`. Legacy JSON `Ministry.events` may still appear as read-only “Earlier local notes.”

## Acceptance criteria

- [x] AC-1: Events persist in the master calendar store
- [x] AC-2: Only ministry managers can edit **this ministry’s** events; church-wide is view-only on the ministry calendar tab
- [x] AC-3: Ministry calendar query uses `includeChurchWide: true`

## Open questions

- [ ] Surface `SundayService` rows on ministry calendars (e.g. Media / Music)?
