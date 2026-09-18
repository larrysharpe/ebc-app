# AI Discover → Execute → Evaluate

| Field | Value |
|-------|-------|
| **Module** | `src/modules/communications` |
| **Feature folder** | `features/ai-discover-execute-evaluate/` |
| **Route** | `/communications` (hub); nested `/communications/discover`, `/execute`, `/evaluate` |
| **Phase** | 3 |
| **Status** | Draft |
| **Business source** | [Communications Ministry](../../../operations/communications.md) |

## Overview

Primary Communications Ministry surface in EBC APP. Puts **AI at the forefront** of church messaging: continuously **discover** opportunities, **execute** multi-channel drafts for human approval, and **evaluate** outcomes to improve the next cycle. Announcement workflow and social calendar consume this loop — they are not separate manual silos.

## Users & roles

| Role | Access |
|------|--------|
| Communications Ministry (`ministry_leader` scoped) | Full loop — accept opportunities, edit drafts, publish checklist, view scorecard |
| `office_staff` / `admin` | Same as Communications for publish support |
| `pastor` | Sensitive approval queue; Evaluate summary |
| Media Ministry | Read Execute hand-offs (slide/asset hints); upload assets |
| Other ministry leaders | Submit promo → lands in Discover; cannot publish church-wide |

## User stories

- As **Communications lead**, I want an AI-ranked Discover inbox each week so that we do not miss events, worship reminders, or quiet streaks.
- As **announcements editor**, I want AI to execute multi-channel drafts from an accepted opportunity so that I edit once instead of rewriting per channel.
- As **social publisher**, I want Execute packages to open pre-filled in the social composer so that scheduling is one approval away.
- As **Communications lead**, I want a weekly Evaluate scorecard so that next Discover prioritizes weak pillars and missed deadlines.
- As **pastor**, I want doctrine-sensitive Execute items blocked until I approve so that AI never publishes theology or crisis copy alone.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: **Discover inbox** — ranked opportunity cards (title, rationale, suggested channels, source link, suggested window)
- [ ] FR-2: **Discover sources** (rule + AI ranking): church calendar events; weekly worship window; mid-week Zoom/Bible study; approved announcements without social; posting silence; seasonal templates; community-event suggestions (from social module)
- [ ] FR-3: Opportunity actions — Accept → Execute · Snooze · Dismiss (with reason)
- [ ] FR-4: **Execute workspace** — for accepted items, AI generates channel package: website blurb, bulletin line, in-service cue, email blurb, social caption; Media hand-off note
- [ ] FR-5: Human edit + approve per channel; status mirrors announcement workflow (`draft` → `approved` → `published`)
- [ ] FR-6: Sensitive flag — `requires_pastor_approval` blocks publish until pastor acts
- [ ] FR-7: **No auto-publish** — schedule/publish requires explicit human action
- [ ] FR-8: **Evaluate scorecard** (weekly) — coverage, on-time, channel completeness, pillar balance, quiet streaks; markdown or structured cards
- [ ] FR-9: Evaluate → Discover — scorecard priorities influence next Discover ranking (e.g. boost underused pillars)
- [ ] FR-10: **Prompt safety** — strip PII, prayer text, giving amounts before any model call; log prompt class only (not body with secrets)
- [ ] FR-11: Loading / empty / error states for Discover, Execute, Evaluate views
- [ ] FR-12: Graceful degradation — if Cursor/AI unavailable, rule-based Discover still works; Execute shows template stubs

### Should have

- [ ] FR-13: Background refresh of Discover (cron, similar to ministry suggested plans)
- [ ] FR-14: One-click “Open in social calendar” from Execute social channel
- [ ] FR-15: Brand-voice check on Execute drafts vs branding doc heuristics
- [ ] FR-16: Safe platform metrics in Evaluate (views/clicks aggregates only — no audience PII)
- [ ] FR-17: Ministry Plan tab for `communications-ministry` summarizes latest Evaluate + open Discover count

### Won't have (this feature)

- Fully autonomous posting or email blasts
- Sending prayer requests or pastoral notes to models
- Generating final video edits (Media tools)
- Replacing WordPress CMS (hand-off copy only)

## Data

| Entity / field | Notes |
|----------------|-------|
| `CommsOpportunity` | source_type, source_id, title, rationale, channels[], window_start/end, status, rank_score |
| `CommsPackage` | opportunity_id, channel_bodies{}, media_hint, status, requires_pastor_approval |
| `CommsEvaluation` | period_start/end, metrics JSON (no PII), narrative markdown, generated_at |
| Link to `Announcement` | Optional — Execute may create/update announcement records |

## Integrations

| System | Use |
|--------|-----|
| Cursor / configured AI (`CURSOR_API_KEY`) | Discover ranking narrative, Execute drafts, Evaluate narrative |
| Events module | Calendar sources for Discover |
| Social module | Posting gaps, community events, composer hand-off |
| Media Ministry assets | Hints only; binary assets stay in media library |
| ebenezerbc.org | Manual or future publish of approved website copy |

## UI notes

- Hub at `/communications` with three clear phases (not a dashboard of unrelated widgets)
- Brand first on ministry surfaces; follow [branding](../../../church/branding.md)
- Show AI provenance (“Suggested by AI — review before publish”) on every draft
- Loading, empty, and error required for each phase

## Dependencies

- [Announcement workflow](announcement-workflow.md)
- [Content calendar & suggestions](../social/content-calendar-suggestions.md)
- [Auth & roles](../auth-and-roles.md)
- [Church calendar](../events/church-calendar.md)
- Cursor prompt infrastructure (existing ministry suggested plans / SOP help)

## Acceptance criteria

- [ ] AC-1: Accepting a Discover card creates an Execute package with at least one channel draft
- [ ] AC-2: Publish actions fail closed if `requires_pastor_approval` and pastor has not approved
- [ ] AC-3: Model requests never include prayer request bodies, emails, phones, or giving amounts (unit-tested sanitizer)
- [ ] AC-4: Evaluate for a week is viewable even when platform metrics are empty (coverage/on-time still shown)
- [ ] AC-5: Without `CURSOR_API_KEY`, Discover still lists rule-based opportunities

## Open questions

- [ ] Default Discover refresh cadence (hourly vs daily)?
- [ ] Which Facebook/YouTube metrics APIs are approved for Evaluate?
- [ ] Should weather closures bypass Discover and jump to Execute templates?
