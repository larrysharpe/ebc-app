# Social module — features

| Module | `src/modules/social` |
| **Business source** | [Social media & community presence](../../../operations/social-media-community.md) · parent [Communications Ministry](../../../operations/communications.md) |
| **Phase** | 3 (with communications; community discovery may extend to phase 4) |

## Purpose in EBC APP

Manage church **social accounts**, **schedule posts**, get **content suggestions** tied to church life, and **discover community events** where Ebenezer should show up — with clear flows and human approval before anything goes public.

**Ops ownership:** Communications Ministry (social publisher duty). Runs inside AI Discover → Execute → Evaluate. Media supplies assets; Missionary owns boots-on-ground outreach.

## Features

| Feature | Spec | Route |
|---------|------|-------|
| Social accounts hub | [social-accounts-hub.md](social-accounts-hub.md) | `/social` |
| Content calendar & suggestions | [content-calendar-suggestions.md](content-calendar-suggestions.md) | `/social/calendar` |
| Community event discovery | [community-event-discovery.md](community-event-discovery.md) | `/social/community-events` |

## End-to-end flows

See [flows.md](flows.md) for diagram index.

## Shared data model

| Entity | Description |
|--------|-------------|
| `SocialAccount` | platform, account_name, token_ref, status |
| `SocialPost` | content, media_refs, platforms[], scheduled_at, status |
| `ContentSuggestion` | type, title, body_draft, suggested_at, source, status |
| `CommunityEvent` | title, location, start, source_url, relevance_score, status |
| `OutreachPlan` | community_event_id, ministry_id, volunteers[], notes |

## Permissions (draft)

Prefer scoping via **Communications Ministry** (`ministry_leader` + `communications-ministry`) rather than a separate `social_manager` role long-term. Until that ships, draft matrix:

| Action | communications ministry | media ministry | pastor | missionary lead | admin |
|--------|-------------------------|----------------|--------|-----------------|-------|
| Connect accounts | ✓ | — | — | — | ✓ |
| Draft / schedule post | ✓ | — | — | — | ✓ |
| Attach Media assets | ✓ | ✓ (upload) | — | — | ✓ |
| Approve sensitive post | lead / designee | — | ✓ | — | ✓ |
| Publish | ✓ | — | After approval | — | ✓ |
| View suggestions | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve community outreach | ✓ (promo) | — | ✓ | ✓ (presence) | ✓ |

## Integrations

See [social platforms](../../integrations/social-platforms.md).

## Open questions

- [x] Dedicated `social_manager` role or fold into Communications Ministry? → **Fold into Communications** (ministry-scoped); keep optional role only if needed for non-roster staff.
- [ ] Auto-post ever allowed for worship reminders only?
