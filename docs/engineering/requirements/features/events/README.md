# Events module — features

| Module | `src/modules/events` |
| **Business source** | [Events & worship](../../../operations/events.md) |
| **Phase** | 2 |

## Features

| Feature | Spec | Route |
|---------|------|-------|
| Church calendar | [church-calendar.md](church-calendar.md) | `/events` |
| Recurring worship schedule | [recurring-worship-schedule.md](recurring-worship-schedule.md) | `/events/schedule` |

## Shared data model

| Entity | Description |
|--------|-------------|
| `Event` | title, start, end, location, type, status, ministry_id |
| `RecurrenceRule` | RRULE or structured recurrence |
| `EventApproval` | draft → approved → published |

Event types: `worship` · `class` · `meeting` · `outreach` · `special` · `rental`

## Open questions

- [ ] Sync to ebenezerbc.org calendar or EBC APP as master?
