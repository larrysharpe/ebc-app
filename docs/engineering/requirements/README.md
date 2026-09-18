# Software Requirements

Requirements for EBC APP, traced to [business operations](../../operations/README.md). Do not define church policy here — document policy in operations and reflect it in requirements below.

## Feature specifications

**Start here:** [features/README.md](features/README.md) — phased roadmap, feature index, and specs per module.

| Phase | Focus |
|-------|--------|
| 0 | [Dashboard](features/dashboard.md), [Auth & roles](features/auth-and-roles.md) |
| 1 | [Members](features/members/), [Ministries](features/ministries/) |
| 2 | [Events](features/events/), [Volunteers](features/volunteers/), [Music](features/music/) |
| 3 | [Communications](features/communications/), [Social](features/social/), [Facilities](features/facilities/), [Trustees](features/trustees/) |
| 4 | [Giving](features/giving/) — Realm hub |

New features: copy [features/_template.md](features/_template.md).

## Traceability

| Business area | Operations doc | Feature specs |
|---------------|----------------|---------------|
| Congregation & membership | [members.md](../../operations/members.md) | [members/](features/members/) |
| Ministries & programs | [ministries.md](../../operations/ministries.md) | [ministries/](features/ministries/) |
| Events & worship | [events.md](../../operations/events.md) | [events/](features/events/) |
| Music & choir | [music-ministry.md](../../operations/music-ministry.md) | [music/](features/music/) |
| Stewardship & finance | [giving.md](../../operations/giving.md) | [giving/realm-giving-hub.md](features/giving/realm-giving-hub.md) |
| Trustee ministry | [trustees.md](../../operations/trustees.md) | [trustees/](features/trustees/) |
| Volunteers | [volunteers.md](../../operations/volunteers.md) | [volunteers/](features/volunteers/) |
| Communications Ministry | [communications.md](../../operations/communications.md) | [communications/](features/communications/) |
| Social media & community | [social-media-community.md](../../operations/social-media-community.md) | [social/](features/social/) |
| Facilities | [facilities.md](../../operations/facilities.md) | [facilities/](features/facilities/) |

## Cross-cutting technical concerns

| Concern | Spec / doc |
|---------|------------|
| Authentication & roles | [auth-and-roles.md](features/auth-and-roles.md) · [governance](../../governance/leadership.md) |
| Audit trail | [security standards](../standards/security-and-privacy.md) |
| Reporting | Future — leadership dashboards beyond phase 4 |
| Integrations | [Realm](../integrations/realm.md), [ebenezerbc.org](../integrations/ebenezerbc-org.md), [social platforms](../integrations/social-platforms.md) |
| UI / branding | [branding](../../church/branding.md) |

## Status

Feature docs **drafted** — pending review with church leadership and prioritization within phases. Track open work in [backlog](../BACKLOG.md).
