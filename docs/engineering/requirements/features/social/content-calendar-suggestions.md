# Content calendar & suggestions

| Field | Value |
|-------|-------|
| **Module** | `src/modules/social` |
| **Feature folder** | `features/content-calendar-suggestions/` |
| **Route** | `/social/calendar` |
| **Phase** | 3 |
| **Status** | Draft |
| **Business source** | [social-media-community.md](../../../operations/social-media-community.md) |

## Overview

**Content calendar** for scheduled/draft posts across platforms, plus an **inbox of suggestions** that feeds Communications **Discover**. AI ranks and drafts; humans approve. Driven by church calendar, worship rhythm, announcements, Evaluate feedback, and posting gaps.

## User flow

See [Flow 3 — Content suggestions](flows.md#flow-3--content-suggestions-what-to-create--when) and [AI Discover → Execute → Evaluate](../communications/ai-discover-execute-evaluate.md).

## User stories

- As **social publisher**, I want Thursday Discover suggestions to promote Sunday worship so that we post consistently.
- As **social publisher**, I want VBS auto-suggested two weeks out with AI copy draft and image placeholder.
- As **social publisher**, I want a calendar view of scheduled posts so that I don't double-post.
- As **pastor**, I want to approve politically or doctrinally sensitive drafts before they go live.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: **Calendar view** — month/week; posts as blocks by platform color
- [ ] FR-2: **List view** — draft, scheduled, published, failed
- [ ] FR-3: **Post composer** — caption (char limits per platform), image/video upload, link URL, platform multi-select, schedule datetime
- [ ] FR-4: **Suggestions inbox** — cards with: title, rationale, suggested post time, draft caption, linked church event (if any), media hint ("use last Sunday photo", "sermon clip")
- [ ] FR-5: Suggestion actions — Use (→ composer), Dismiss, Snooze
- [ ] FR-6: **Suggestion engine** (MVP — rules + AI ranking via Communications Discover):
  - Event in 7–14 days → event promo suggestion
  - Thursday 10 AM → Sunday worship reminder (configurable)
  - Wednesday → Bible study / Zoom reminder
  - Approved [announcement](../communications/announcement-workflow.md) → social suggestion
  - No publish in 5 days → "stay active" nudge with pillar templates
  - Weekly Evaluate underused pillars → boosted Discover rank
- [ ] FR-7: **Content pillars** tags — worship, event, community, teaching, family, giving
- [ ] FR-8: Approval flag on post — `requires_pastor_approval`; blocks schedule until approved
- [ ] FR-9: Brand snippet — pull colors/fonts hint from [branding](../../../church/branding.md) in composer sidebar

### Should have

- [ ] FR-10: Template library — reusable captions with `{event_title}` placeholders
- [ ] FR-11: Best time hints per platform (static defaults: FB eve, IG midday — configurable)
- [ ] FR-12: YouTube new video → suggestion for clip post + link
- [ ] FR-13: AI caption draft and rewrite — **default on Execute**, always human approves; no PII sent to model
- [ ] FR-14: Media asset picker from approved church photo library
- [ ] FR-15: Hand-off from Communications Execute social channel → composer prefill

### Won't have

- Fully autonomous posting without human click
- Generating video edits in-app (link to Media Ministry tools)

## Suggestion types (catalog)

| Type | Trigger | Draft includes |
|------|---------|----------------|
| `worship_reminder` | Thu–Sat before Sunday | Service time, YouTube link, "We're Marching to Zion" optional |
| `event_promo` | Church event T-14, T-7, T-1 | Title, date, link to ebenezerbc.org |
| `bible_study` | Wednesday AM | Zoom link from schedule config |
| `announcement_sync` | Announcement approved | Excerpt + read more link |
| `seasonal` | Fixed dates (Homecoming, VBS) | Template from pillar library |
| `engagement_gap` | No post 5+ days | Pillar picker + generic prompts |
| `community_outreach` | OutreachPlan approved | See [community events](community-event-discovery.md) |

## Data

| Entity | Notes |
|--------|-------|
| `SocialPost` | content, media[], platforms[], scheduled_at, status, approval_status |
| `ContentSuggestion` | type, payload JSON, suggested_publish_at, status, dismissed_reason |
| `PostTemplate` | pillar, body_template, platforms |

## Integrations

| System | Use |
|--------|-----|
| Events module | Event triggers |
| Communications | Announcement triggers |
| Social accounts hub | Publish API |
| ebenezerbc.org | Links in posts |

## UI notes

- Split view: calendar top, suggestions inbox right (desktop)
- Suggestion cards show **why** ("VBS starts in 7 days") for trust
- Burgundy schedule blocks, gold for suggestions per branding

## Dependencies

- [Social accounts hub](social-accounts-hub.md)
- [Church calendar](../events/church-calendar.md)
- [Announcement workflow](../communications/announcement-workflow.md)

## Acceptance criteria

- [ ] AC-1: Suggestion for Sunday worship appears Thursday per config
- [ ] AC-2: Post requiring approval cannot publish until pastor approves
- [ ] AC-3: Dismissed suggestion does not reappear same day unless event changes
- [ ] AC-4: Character count warning for X/Twitter if added later

## Open questions

- [ ] Default posting times per platform?
- [x] AI for captions — yes, default via Communications Execute (Cursor / `CURSOR_API_KEY`); human always approves
- [ ] Which safe metrics feed Evaluate?
