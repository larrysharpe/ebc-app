# Space reservations

| Field | Value |
|-------|-------|
| **Module** | `src/modules/facilities` |
| **Feature folder** | `features/space-reservations/` |
| **Route** | `/facilities` |
| **Phase** | 3 |
| **Status** | Draft |
| **Business source** | [facilities.md](../../../operations/facilities.md) |

## Overview

Book FLC gym, classrooms, kitchen, and Chapel for church and approved external events. Supports facility manager workflow (703-307-0207) and conflict detection with [calendar](../events/church-calendar.md).

## User stories

- As **ministry leader**, I want to request the gym for an event so that I don't double-book.
- As **facility manager**, I want to approve requests and see a room calendar so that setup staff is scheduled.
- As **office staff**, I want to record external rental inquiries so that nothing is lost.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Space inventory — name, capacity, setup notes
- [ ] FR-2: Reservation request — space, date/time, event link, requester, notes
- [ ] FR-3: Status — `requested` → `approved` → `denied` → `completed`
- [ ] FR-4: Calendar view per space and combined
- [ ] FR-5: Conflict prevention on approve
- [ ] FR-6: Contact block for Facility Usage Manager on reservation detail

### Should have

- [ ] FR-7: External rental flag + wedding contact (cherita@smlsignatureevents.com)
- [ ] FR-8: Setup/teardown task checklist for facility staff

### Won't have

- Payment processing for rentals
- Nehemiah capital project tracking (separate reporting; see ministries)

## Data

`Space`, `Reservation` — see module README.

## Dependencies

- [Church calendar](../events/church-calendar.md)
- [Auth & roles](../auth-and-roles.md)

## Acceptance criteria

- [ ] AC-1: Two approved reservations cannot overlap same space
- [ ] AC-2: Chapel worship Sundays show as recurring block from schedule

## Open questions

- [ ] Fee schedule stored in app or trustee records only?
