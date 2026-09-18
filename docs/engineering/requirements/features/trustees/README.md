# Trustees module — features

| Module | `src/modules/trustees` |
| **Business source** | [Trustee ministry & duties](../../../operations/trustees.md) |
| **Phase** | 3 |

## Purpose in EBC APP

Tools for the Trustee board to assign, track, and report **duties** — recurring and one-time — across financial, property, capital, and governance work. Complements [giving](../giving/) (Realm) and [facilities](../facilities/) without replacing them.

## Features

| Feature | Spec | Route |
|---------|------|-------|
| Duty management | [duty-management.md](duty-management.md) | `/trustees` |
| Board meetings | [board-meetings.md](board-meetings.md) | `/trustees/meetings` |

## Shared data model

| Entity | Description |
|--------|-------------|
| `TrusteeDuty` | title, category, assignee (person_id), due_date, recurrence, status |
| `TrusteeMeeting` | date, agenda, minutes_url, status |
| `MeetingActionItem` | meeting_id, duty_id or standalone task |

## Permissions (draft)

| Action | trustee | admin | pastor | finance | office_staff |
|--------|---------|-------|--------|---------|--------------|
| View duties | ✓ | ✓ | Read | Scoped | — |
| Create / assign | Officers | ✓ | — | — | — |
| Complete own duty | ✓ | — | — | — | — |
| View financial duties detail | ✓ | ✓ | ✓ | ✓ | — |

`trustee` role maps to board members; officer flags (chair, treasurer) may widen assign permissions — TBD.

## Open questions

- [ ] All trustees get app accounts or officers only initially?
