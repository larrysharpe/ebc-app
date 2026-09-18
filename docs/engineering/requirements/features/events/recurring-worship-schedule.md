# Recurring worship schedule

| Field | Value |
|-------|-------|
| **Module** | `src/modules/events` |
| **Feature folder** | `features/recurring-worship-schedule/` |
| **Route** | `/events/schedule` |
| **Phase** | 2 |
| **Status** | Draft |
| **Business source** | [events.md](../../../operations/events.md) · [church profile](../../../church/profile.md) |

## Overview

System-managed recurring patterns for Ebenezer's rhythm of worship — Sunday School (1st & 4th Sundays), weekly worship, Wednesday prayer and Bible study, nursing home visitation (3rd Sunday), etc. Powers dashboard and calendar without re-entering each week.

## Standing schedule (from church profile)

| Pattern | Activity | Time | Format |
|---------|----------|------|--------|
| 1st & 4th Sun | Sunday School | 8:30 AM | In person |
| Every Sun | Worship | 10:00 AM | Chapel + YouTube/Facebook |
| Every Wed | Noon prayer | 12:00 PM | Zoom |
| Every Wed | Bible study | 7:00 PM | Zoom |
| 3rd Sun | Nursing home service | 2:00 PM | Belmont Bay Rehab |
| 2nd & 4th Thu | With Angels Wings | 7:00 PM | In person / Zoom |

## User stories

- As **office staff**, I want standing schedule pre-loaded so that the calendar is correct out of the box.
- As **admin**, I want to edit recurrence rules when church changes service times so that all views update together.
- As **any staff user**, I want worship times on the dashboard from this config.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: `RecurrenceRule` records for each standing item above
- [ ] FR-2: Admin UI to edit times, location notes, Zoom links (stored as fields, not hardcoded in components)
- [ ] FR-3: Generate calendar instances for next 90 days from rules
- [ ] FR-4: Exceptions table — skip or override single occurrence (e.g. weather cancellation)
- [ ] FR-5: Read API used by dashboard and church calendar views

### Should have

- [ ] FR-6: Annual observances — March anniversary, May Rally, October Homecoming as yearly events

### Won't have

- Automatic NOVA/PWCS weather API — manual exception until integrated

## Data

| Entity | Notes |
|--------|-------|
| `RecurrenceRule` | title, rrule, location, format, ministry_id, metadata (zoom_url) |
| `ScheduleException` | rule_id, date, cancelled or override fields |

## Dependencies

- [Church calendar](church-calendar.md)
- [Dashboard](../dashboard.md)

## Acceptance criteria

- [ ] AC-1: Sunday School instances only on 1st and 4th Sundays
- [ ] AC-2: Exception on a date removes instance from generated calendar

## Open questions

- [ ] Store Zoom URLs here or in communications module?
