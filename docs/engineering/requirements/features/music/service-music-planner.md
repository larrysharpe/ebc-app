# Service music planner

| Field | Value |
|-------|-------|
| **Module** | `src/modules/music` |
| **Feature folder** | `features/service-music-planner/` |
| **Route** | `/music/plans`, `/music/plans/[id]` |
| **Phase** | 0 (preview) |
| **Status** | In progress — seeded plans from 2nd Sunday Chapel Choir emails |
| **Business source** | [music-ministry.md](../../../operations/music-ministry.md) |

## Overview

Directors build a **set list for a worship date** from the [song catalog](song-catalog.md), add keys and notes, then **send** the plan to choir and musicians — replacing email attachments and text threads.

## Users & roles

| Role | Access |
|------|--------|
| `music_director` | Create, edit, send, delete plans |
| `admin` | Same as director |
| `choir_member` / `musician` | View plans sent to them; access only songs/assets in plan |
| `pastor` | View plans for upcoming services |

## User stories

- As **music director**, I want to pick Sunday's songs from the catalog and set the key for each so that everyone is aligned.
- As **music director**, I want to send the plan to the choir on Thursday so that they rehearse Saturday.
- As a **choir member**, I want one link for this Sunday with lyrics and my alto part.
- As a **musician**, I want chord charts for every song in the set list in one place.
- As **pastor**, I want to preview next Sunday's music selections.

## Functional requirements

### Must have (MVP)

- [x] FR-1: Pick `service_date` — seeded Mother's Day & Youth/Senior Sunday plans
- [ ] FR-2: Add songs from catalog — drag reorder; per-song `key_override`, director notes (e.g. "verse 1 only")
- [x] FR-3: Plan statuses — `draft` → `sent` (preview)
- [x] FR-4: **Send plan** — marks `sent`, records `sent_at` (email/SMS integration later)
- [ ] FR-5: Recipient picker — all choir, all musicians, or individuals from music ministry roster
- [ ] FR-6: **Recipient view** — `/music/plans/[id]/view` — set list, lyrics expand, download only entitled assets
- [ ] FR-7: Email optional — summary with link to plan (via communications/email integration phase 3+)
- [ ] FR-8: Duplicate plan from previous Sunday or template
- [ ] FR-9: Print / PDF export — set list + lyrics for binder (director)

### Should have

- [ ] FR-10: Special service types — communion hymn slot, offertory, altar call flags on plan line
- [ ] FR-11: Rehearsal date field + reminder
- [ ] FR-12: Attach one-off PDF not in catalog (single-use arrangement) to plan only
- [ ] FR-13: Push to media ministry — song list for slides (title + first line) — manual export initially

### Won't have

- Live teleprompter during service (future)
- Automatic ProPresenter sync (future integration)

## Data

| Entity | Notes |
|--------|-------|
| `ServiceMusicPlan` | event_id?, service_date, title, status, director_id |
| `PlanSong` | plan_id, song_id, sort_order, key_override, notes, slot_type? |
| `PlanRecipient` | plan_id, person_id, role_snapshot |
| `PlanDistribution` | sent_at, channel |

## Integrations

| System | Use |
|--------|-----|
| [Song catalog](song-catalog.md) | Song references |
| [Church calendar](../events/church-calendar.md) | Worship event link |
| [Ministries](../ministries/ministry-roster.md) | Choir roster for recipients |
| Communications | Email send (phase 3) |

## UI notes

- Planner: left catalog search, right set list with drag-drop
- Send confirmation modal — recipient count, "includes lyrics and parts"
- Recipient mobile view: accordion per song — Lyrics | My part | Chords (if musician)

## Dependencies

- [Song catalog](song-catalog.md)
- [Auth & roles](../auth-and-roles.md)
- Events module (optional event link)
- Ministries roster (choir participants)

## Acceptance criteria

- [ ] AC-1: Sent plan immutable for recipients until director publishes revision
- [ ] AC-2: Recipient without alto part on file sees message, not 404 on other parts
- [ ] AC-3: Plan for date shows on music director dashboard upcoming widget
- [ ] AC-4: Removing song from catalog does not break historical plan (snapshot title on PlanSong)

## Open questions

- [ ] Snapshot song title/key on send for historical accuracy?
- [ ] Fall Fresh workshop — multi-day plan as one plan or series?
- [ ] Include Media Ministry on send by default?
