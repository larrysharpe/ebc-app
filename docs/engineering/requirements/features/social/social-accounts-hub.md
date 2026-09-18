# Social accounts hub

| Field | Value |
|-------|-------|
| **Module** | `src/modules/social` |
| **Feature folder** | `features/social-accounts-hub/` |
| **Route** | `/social` |
| **Phase** | 3 |
| **Status** | Draft |
| **Business source** | [social-media-community.md](../../../operations/social-media-community.md) |

## Overview

Central place to **connect** church social accounts (YouTube, Facebook, Instagram), view connection health, and jump to calendar or community events. Does not replace native platform analytics entirely — aggregates essentials for staff.

## User flow

See [Flow 1 — Connect account](flows.md#flow-1--connect-a-social-account) and [Flow 2 — Publish](flows.md#flow-2--create-and-publish-a-post).

## User stories

- As **social manager**, I want to connect our Facebook page once so that the team can schedule posts without sharing passwords.
- As **media ministry**, I want to see which accounts are connected and token expiry warnings.
- As **admin**, I want to revoke access when a volunteer rotates off the team.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Account cards per platform — YouTube, Facebook (Instagram phase 3b)
- [ ] FR-2: OAuth connect flow — store refresh tokens in secret manager; never in client or logs
- [ ] FR-3: Disconnect / reconnect account
- [ ] FR-4: Status — `connected`, `expired`, `error` with last sync time
- [ ] FR-5: Quick stats — follower count if API allows (cache daily)
- [ ] FR-6: Nav tiles → [Content calendar](content-calendar-suggestions.md), [Community events](community-event-discovery.md), recent published posts list
- [ ] FR-7: Role gate — Communications Ministry scoped leaders, `admin` (optional interim `social_manager`)

### Should have

- [ ] FR-8: Instagram + Facebook via Meta Business Suite API
- [ ] FR-9: Post performance summary — impressions, engagement last 30 days
- [ ] FR-10: Multiple admins notified on token expiry

### Won't have

- Personal member social accounts
- DM inbox management (phase later)
- Comment moderation inbox (phase later)

## Data

| Entity | Notes |
|--------|-------|
| `SocialAccount` | platform enum, external_id, display_name, token_secret_ref, status |
| `SocialPost` | linked published/scheduled posts |

## Integrations

[social-platforms.md](../../integrations/social-platforms.md)

## Dependencies

- [Auth & roles](../auth-and-roles.md) — `social_manager`

## Acceptance criteria

- [ ] AC-1: Tokens never appear in browser network tab or logs
- [ ] AC-2: Disconnect invalidates tokens and removes scheduled post capability
- [ ] AC-3: Non-authorized role gets 403 on `/social`

## Open questions

- [ ] Facebook page URL and Business Manager admin contact
- [ ] Who holds YouTube channel owner role for OAuth?
