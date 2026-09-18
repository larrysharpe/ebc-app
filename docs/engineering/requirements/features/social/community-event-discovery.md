# Community event discovery

| Field | Value |
|-------|-------|
| **Module** | `src/modules/social` |
| **Feature folder** | `features/community-event-discovery/` |
| **Route** | `/social/community-events` |
| **Phase** | 3–4 |
| **Status** | Draft |
| **Business source** | [social-media-community.md](../../../operations/social-media-community.md) |

## Overview

Find and rank **local community events** where Ebenezer should have a presence — festivals, resource fairs, neighborhood gatherings, service opportunities — then plan outreach and optional social promotion.

Geographic focus: **Woodbridge, Lake Ridge, Occoquan**, Prince William County, VA.

## User flow

See [Flow 4 — Community event discovery](flows.md#flow-4--community-event-discovery--outreach).

## User stories

- As **missionary ministry lead**, I want a weekly list of nearby community events so that we don't miss tabling opportunities.
- As **social manager**, I want the app to suggest the **best** events for EBC based on family focus and outreach fit.
- As **pastor**, I want to approve presence at sensitive community events before we commit volunteers.
- As **volunteer coordinator**, I want approved events to spawn volunteer needs in COUNT ME IN.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: **Event feed** — list + map view; filter by date, distance, category, score
- [ ] FR-2: **Manual add** — staff paste URL or enter event (title, date, location, description, source)
- [ ] FR-3: **Ingest sources** (phase 3a manual + 3b automated):
  - Manual entry and CSV import
  - Prince William County / parks & rec public calendars (RSS/iCal if available)
  - Curated nonprofit partners (missionary ministry list)
  - TBD APIs — Eventbrite public search by geo (if licensed)
- [ ] FR-4: **Relevance scoring** (0–100) with explainable factors:
  - Distance from church (13020 Telegraph Rd)
  - Family / children friendly
  - Service & outreach alignment
  - Expected attendance (if known)
  - Conflicts with church calendar (penalty)
  - Duplicate detection
- [ ] FR-5: Show **score breakdown** — "12 mi · family festival · no Sunday conflict"
- [ ] FR-6: Actions — **Approve outreach**, Dismiss, Watch, Mark attended (after event)
- [ ] FR-7: **OutreachPlan** on approve — assign ministry (default missionary), volunteers, notes, optional church calendar event
- [ ] FR-8: Optional → create [content suggestion](content-calendar-suggestions.md) for social post
- [ ] FR-9: Link to [COUNT ME IN](../volunteers/count-me-in-registry.md) volunteer request

### Should have

- [ ] FR-10: Facebook public events search (Meta API — policy permitting)
- [ ] FR-11: School district community flyers feed (PWCS)
- [ ] FR-12: "Similar past events" — what EBC did before
- [ ] FR-13: Weather / indoor flag for planning
- [ ] FR-14: Partner org blocklist/allowlist (leadership config)

### Won't have

- Scraping private Facebook groups without authorization
- Automatic commitment to events without human approval
- Political campaign event promotion without explicit pastor approval workflow

## Scoring rubric (draft)

| Factor | Weight | Notes |
|--------|--------|-------|
| Distance ≤ 10 mi | +25 | Woodbridge core |
| Family / kids keywords | +20 | Aligns with mission |
| Food / resource / health fair | +15 | Missionary ministry fit |
| Known partner org | +15 | Allowlist |
| Weekend conflict with worship | −40 | Hard penalty |
| Low outreach fit (nightclub, etc.) | −50 | Auto-hide or bottom rank |
| Pastor flagged category | Hold | Requires approval |

Tune weights with leadership; store in config not code constants.

## Data

| Entity | Notes |
|--------|-------|
| `CommunityEvent` | external_id, source, title, description, start, end, lat, lng, url, raw_score, factors_json |
| `CommunityEventReview` | status: suggested, approved, dismissed, attended; reviewer_id |
| `OutreachPlan` | community_event_id, ministry_id, volunteer_ids[], calendar_event_id? |

## Integrations

| System | Use |
|--------|-----|
| Events | Conflict check, optional internal event |
| Volunteers | Staffing |
| Social calendar | Promo suggestion |
| Ministries | Missionary ministry default owner |

## Dependencies

- [Social accounts hub](social-accounts-hub.md) (optional promo path)
- [Missionary ministry](../../../operations/ministries.md) business process

## Acceptance criteria

- [ ] AC-1: Scoring explanation visible for every suggested event
- [ ] AC-2: Approved outreach creates auditable OutreachPlan record
- [ ] AC-3: Dismissed events hidden unless "show dismissed" filter
- [ ] AC-4: Ingest job failure does not delete existing events — stale flag only

## Open questions

- [ ] Official PW county event API or calendar URL?
- [ ] Maximum travel radius for "best" events?
- [ ] Black Baptist church coalition events — separate feed?
