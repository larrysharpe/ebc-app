# Volunteer scheduling

| Field | Value |
|-------|-------|
| **Module** | `src/modules/volunteers` |
| **Feature folder** | `features/volunteer-scheduling/` |
| **Route** | `/volunteers/schedule` |
| **Phase** | 2 |
| **Status** | Draft |
| **Business source** | [volunteers.md](../../../operations/volunteers.md) |

## Overview

Assign volunteers to roles by date — ushers, media/AV, nursery, etc. Supports rotation, substitute requests, and reminders before service.

## User stories

- As **usher ministry lead**, I want a Sunday rotation so that every slot is filled.
- As a **volunteer**, I want to see my upcoming assignments so that I can plan.
- As **media ministry**, I want AV roles on the worship event so that livestream is covered.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Role templates per ministry (Usher, AV camera, AV sound, Greeter, Nursery)
- [ ] FR-2: Build schedule for date range — drag or assign person to slot
- [ ] FR-3: Assignment statuses — `confirmed`, `pending`, `declined`, `needs_substitute`
- [ ] FR-4: Mark unavailable / request substitute
- [ ] FR-5: Link assignments to worship `Event` on calendar
- [ ] FR-6: Print/email weekly schedule for ministry lead

### Should have

- [ ] FR-7: Email reminder 3 days before assignment
- [ ] FR-8: Conflict detection if same person double-booked

### Won't have

- SMS reminders (until email provider integrated)

## Data

`VolunteerRole`, `VolunteerAssignment` — see module README.

## Dependencies

- [COUNT ME IN registry](count-me-in-registry.md)
- [Church calendar](../events/church-calendar.md)

## Acceptance criteria

- [ ] AC-1: Empty slot visible on schedule view before Sunday
- [ ] AC-2: Media ministry can filter AV roles only

## Open questions

- [ ] Usher board uses separate tool today — migrate or parallel?
