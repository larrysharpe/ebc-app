# Visitor intake

| Field | Value |
|-------|-------|
| **Module** | `src/modules/members` |
| **Feature folder** | `features/visitor-intake/` |
| **Route** | `/members/visitors/new` |
| **Phase** | 1 |
| **Status** | Draft |
| **Business source** | [members.md](../../../operations/members.md) · [New to EBC](https://ebenezerbc.org/about/new-to-ebc) |

## Overview

Capture first-time and returning visitors after greeters welcome them at the Chapel. Replaces paper connection cards for staff data entry and triggers follow-up tracking.

## User stories

- As **office staff**, I want a fast form after Sunday service so that visitor cards are entered before Tuesday follow-up.
- As **office staff**, I want visitors defaulted to `visitor` status so that membership workflow stays clear.
- As an **usher/greeter** (future), I want a tablet-friendly form so that I can enter visitors at the door.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Form — first name, last name, phone, email (optional), visit date, how they heard about EBC (optional)
- [ ] FR-2: Option to create new household or attach to existing
- [ ] FR-3: Set `membership_status = visitor` on save
- [ ] FR-4: Record `first_visit_date` and `visit_count`
- [ ] FR-5: Success → link to household detail + prompt for follow-up task (dashboard widget)
- [ ] FR-6: Zod validation; duplicate warning if name+phone matches existing person

### Should have

- [ ] FR-7: Prayer request flag → notifies pastoral workflow (email to prayerrequests@ — not stored publicly)
- [ ] FR-8: Interest checkboxes (membership class, COUNT ME IN, ministry) — feeds other modules
- [ ] FR-9: Mobile-optimized layout for tablet at welcome desk

### Won't have

- Public self-service visitor form (website has contact form)
- Automatic Realm person create (until integration confirmed)

## Data

| Entity / field | Notes |
|----------------|-------|
| `Person` | created with visitor status |
| `VisitorMeta` | first_visit_date, visit_count, source, follow_up_due, follow_up_completed |

## Integrations

| System | Use |
|--------|-----|
| Dashboard | Pending follow-up count |
| Volunteers | Optional COUNT ME IN interest flag |

## UI notes

- Large touch targets for tablet
- Gold CTA button "Save visitor" per branding
- Minimal fields for speed — expand optional section

## Dependencies

- [Auth & roles](../auth-and-roles.md)
- [Household detail](household-detail.md) (create flow)

## Acceptance criteria

- [ ] AC-1: Form submittable in under 30 seconds for typical case
- [ ] AC-2: Duplicate detection shows merge option, not silent overwrite
- [ ] AC-3: No visitor PII in client-side analytics

## Open questions

- [ ] Who owns follow-up within 48 hours?
- [ ] Sync with website "New Member Inquiry" form submissions?
