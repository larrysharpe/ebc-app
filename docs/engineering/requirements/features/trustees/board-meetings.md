# Trustee board meetings

| Field | Value |
|-------|-------|
| **Module** | `src/modules/trustees` |
| **Feature folder** | `features/board-meetings/` |
| **Route** | `/trustees/meetings` |
| **Phase** | 3 |
| **Status** | Draft |
| **Business source** | [trustees.md](../../../operations/trustees.md) |

## Overview

Schedule trustee board meetings, capture agendas and minutes links, and track **action items** that become duties or standalone follow-ups.

## User stories

- As **Trustee Secretary**, I want to publish an agenda with linked open duties so that meetings stay focused.
- As **Trustee Chair**, I want action items assigned at the meeting to appear on assignees' duty lists.
- As a **trustee**, I want to read past minutes so that continuity is preserved.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Meeting list — date, status (`scheduled`, `held`, `cancelled`)
- [ ] FR-2: Agenda builder — ordered items, optional link to `TrusteeDuty` for discussion
- [ ] FR-3: Minutes — URL or uploaded PDF (storage TBD)
- [ ] FR-4: Action items — text, assignee, due date; option to **promote to duty**
- [ ] FR-5: Attendance record — which trustees attended (optional MVP)

### Should have

- [ ] FR-6: Auto-include all overdue duties on agenda draft
- [ ] FR-7: Export agenda PDF for distribution

### Won't have

- Video conferencing integration

## Data

`TrusteeMeeting`, `MeetingAgendaItem`, `MeetingActionItem` — see module README.

## Dependencies

- [Duty management](duty-management.md)

## Acceptance criteria

- [ ] AC-1: Promoted action item creates linked `TrusteeDuty`
- [ ] AC-2: Minutes file access restricted to trustee/admin/pastor

## Open questions

- [ ] Meeting cadence — monthly or quarterly?
