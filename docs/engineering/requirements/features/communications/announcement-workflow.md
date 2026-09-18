# Announcement workflow

| Field | Value |
|-------|-------|
| **Module** | `src/modules/communications` |
| **Feature folder** | `features/announcement-workflow/` |
| **Route** | `/communications` |
| **Phase** | 3 |
| **Status** | Draft |
| **Business source** | [Communications Ministry](../../../operations/communications.md) |

## Overview

Draft, approve, and track church announcements before they go to website, bulletin, in-service, email, and social. Owned by **Communications Ministry** inside the **AI Discover → Execute → Evaluate** loop — AI drafts channel packages; humans approve. Reduces duplicate messages from ministry leaders.

## User stories

- As a **ministry leader**, I want to submit an announcement for my event so that it enters Discover and Communications can publish it consistently.
- As **Communications / office staff**, I want AI Execute drafts I can approve so that the homepage stays accurate without rewriting every channel.
- As **Media Ministry**, I want to see approved copy for Sunday slides.
- As **social publisher**, I want approved copy ready for the content calendar.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Announcement — title, body, start/end display dates, audience, linked event (optional)
- [ ] FR-2: Status workflow — `draft` → `submitted` → `approved` → `published` → `archived`
- [ ] FR-3: Ministry leaders create `submitted`; Communications lead or office_staff approves
- [ ] FR-4: Channels checklist — website, bulletin, in-service, email, social (manual tracking initially)
- [ ] FR-5: List view — filter by status, date, ministry
- [ ] FR-6: Link to ebenezerbc.org announcement URL when published (manual paste)

### Should have

- [ ] FR-7: Create announcement draft from approved calendar event (via Discover Accept)
- [ ] FR-8: WordPress REST API publish (future)
- [ ] FR-9: Email draft to churchadmin@ for website team
- [ ] FR-10: AI Execute package generates all channel bodies from one opportunity ([ai-discover-execute-evaluate](ai-discover-execute-evaluate.md))

### Won't have

- Social media posting API without human click (see social module)
- Mass email to full list without approval
- Auto-publish from AI without human approval

## Data

| Entity | Notes |
|--------|-------|
| `Announcement` | title, body, dates, status, ministry_id, event_id |
| `AnnouncementChannel` | enum flags per channel |

## Integrations

[ebenezerbc.org](../../integrations/ebenezerbc-org.md) — future sync.

## Dependencies

- [Church calendar](../events/church-calendar.md)
- [Auth & roles](../auth-and-roles.md)

## Acceptance criteria

- [ ] AC-1: Ministry leader cannot set status to `published`
- [ ] AC-2: Expired announcements auto-archive after end date (job)

## Open questions

- [ ] Weekly announcement deadline (e.g. Tuesday noon for Sunday)?
