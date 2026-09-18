# EBC APP Features

Software feature specifications for EBC APP. Each feature traces to [business operations](../../operations/README.md) — policy lives there; this folder defines **what the app builds**.

## How to use

1. Read the business [operations](../../operations/README.md) doc for the domain
2. Open the module `README.md` for feature list and phase
3. Implement from the individual feature spec — folder names match [application layout](../architecture/application-layout.md)

## Writing new features

Copy [`_template.md`](_template.md). Place under the correct module folder. Link from the module `README.md`.

## Delivery phases

| Phase | Focus | Features |
|-------|--------|----------|
| **0 — Foundation** | Shell, auth, navigation | [Dashboard](dashboard.md), [Auth & roles](auth-and-roles.md) |
| **1 — People** | Directory and ministries | [Members](members/), [Ministries](ministries/) |
| **2 — Activity** | Calendar, volunteers, worship music | [Events](events/), [Volunteers](volunteers/), [Music](music/) |
| **3 — Operations** | Comms, social, facilities, trustees | [Communications](communications/), [Social](social/), [Facilities](facilities/), [Trustees](trustees/) |
| **4 — Stewardship** | Realm giving hub | [Giving](giving/) |
| **5 — Future** | Member portal, deep integrations | TBD |

Phases are sequential priorities — not strict releases. Adjust with church leadership.

## Feature index

### Cross-cutting

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Dashboard](dashboard.md) | `/` | 0 | Draft |
| [Auth & roles](auth-and-roles.md) | `/login`, `/settings` | 0 | Draft |
| [Legal disclosures](legal-disclosures.md) | `/legal`, `/legal/privacy`, `/legal/terms` | 0 | In progress |

### Members (`src/modules/members`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Member directory](members/member-directory.md) | `/members` | 1 | Draft |
| [Household detail](members/household-detail.md) | `/members/households/[id]` | 1 | Draft |
| [Visitor intake](members/visitor-intake.md) | `/members/visitors/new` | 1 | Draft |

### Ministries (`src/modules/ministries`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Ministry registry](ministries/ministry-registry.md) | `/ministries` | 1 | In progress |
| [Ministry roster / personnel](ministries/ministry-roster.md) | `/ministries/[slug]?tab=personnel` | 1 | In progress |
| [Ministry calendar](ministries/ministry-calendar.md) | `/ministries/[slug]?tab=calendar` | 1 | In progress |
| [Ministry SOPs](ministries/ministry-sops.md) | `/ministries/[slug]?tab=sops` | 1 | In progress (CLC charter + doc control) |

### Events (`src/modules/events`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Church calendar](events/church-calendar.md) | `/events` | 2 | Draft |
| [Recurring worship schedule](events/recurring-worship-schedule.md) | `/events/schedule` | 2 | Draft |

### Volunteers (`src/modules/volunteers`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [COUNT ME IN registry](volunteers/count-me-in-registry.md) | `/volunteers` | 2 | Draft |
| [Volunteer scheduling](volunteers/volunteer-scheduling.md) | `/volunteers/schedule` | 2 | Draft |

### Music (`src/modules/music`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Song catalog](music/song-catalog.md) | `/music/songs` | 2 | Draft |
| [Service music planner](music/service-music-planner.md) | `/music/plans` | 2 | Draft |

### Trustees (`src/modules/trustees`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Duty management](trustees/duty-management.md) | `/trustees` | 3 | Draft |
| [Board meetings](trustees/board-meetings.md) | `/trustees/meetings` | 3 | Draft |

### Social (`src/modules/social`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Flows (diagrams)](social/flows.md) | — | 3 | Draft |
| [Social accounts hub](social/social-accounts-hub.md) | `/social` | 3 | Draft |
| [Content calendar & suggestions](social/content-calendar-suggestions.md) | `/social/calendar` | 3 | Draft |
| [Community event discovery](social/community-event-discovery.md) | `/social/community-events` | 3–4 | Draft |

### Communications (`src/modules/communications`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Announcement workflow](communications/announcement-workflow.md) | `/communications` | 3 | Draft |

### Facilities (`src/modules/facilities`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Space reservations](facilities/space-reservations.md) | `/facilities` | 3 | Draft |

### Giving (`src/modules/giving`)

| Feature | Route | Phase | Status |
|---------|-------|-------|--------|
| [Realm giving hub](giving/realm-giving-hub.md) | `/giving` | 4 | Draft |

## Status legend

| Status | Meaning |
|--------|---------|
| **Draft** | Spec started; not approved by stakeholders |
| **Review** | Ready for church leadership / tech review |
| **Approved** | Ready for implementation |
| **In progress** | Active development |
| **Done** | Shipped |

## Related docs

- [Requirements index](../README.md)
- [App vision](../vision.md)
- [Application layout](../architecture/application-layout.md)
- [Branding](../../church/branding.md)
