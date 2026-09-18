# Ebenezer Baptist Church — Business Documentation

Central documentation for managing **Ebenezer Baptist Church of Woodbridge, VA**. This is the church's operational knowledge base — how the congregation is organized, how work gets done, and who is responsible.

Software built to support the church lives separately under [engineering/](engineering/README.md).

## Purpose

- Capture how Ebenezer operates as an organization
- Give leaders and staff a single reference for processes, schedules, and responsibilities
- Document decisions so knowledge is not lost when roles change
- Provide the business context that engineering uses when building tools

## Documentation map

### Foundation

| Document | Description |
|----------|-------------|
| [Church profile](church/profile.md) | Identity, contact, worship schedule, and history |
| [Branding](church/branding.md) | Colors, fonts, logo, and UI patterns from the public website |
| [Website reference](church/website-reference.md) | Full capture of [ebenezerbc.org](https://ebenezerbc.org/) |
| [Mission & vision](strategy/mission-and-vision.md) | Church mission, values, and strategic direction |
| [Case for Communications](strategy/case-for-communications.md) | Leadership brief — why a Communications team (pending decision) |
| [Communications playbook](strategy/communications-playbook.md) | Team seats, original photo/video, platforms, weekly scorecard |
| [Governance & leadership](governance/leadership.md) | Pastor, staff, boards, and decision authority |
| [Data practices](governance/data-practices.md) | What EBC APP may collect; who may see it; children, prayer, giving |

### Operations

Day-to-day church management by functional area.

| Area | Document |
|------|----------|
| Congregation & membership | [operations/members.md](operations/members.md) |
| Ministries & programs | [operations/ministries.md](operations/ministries.md) |
| Ministry SOP standard (CLC) | [operations/sop-standard.md](operations/sop-standard.md) |
| Events & worship | [operations/events.md](operations/events.md) |
| Stewardship & finance | [operations/giving.md](operations/giving.md) |
| Trustee ministry & duties | [operations/trustees.md](operations/trustees.md) |
| Music & choir | [operations/music-ministry.md](operations/music-ministry.md) |
| Volunteers | [operations/volunteers.md](operations/volunteers.md) |
| Communications | [operations/communications.md](operations/communications.md) |
| Social media & community | [operations/social-media-community.md](operations/social-media-community.md) |
| Facilities | [operations/facilities.md](operations/facilities.md) |

See the [operations index](operations/README.md) for how these areas connect.

### Engineering

Technical documentation for EBC APP and related systems.

| Document | Description |
|----------|-------------|
| [Engineering overview](engineering/README.md) | How software docs relate to business docs |
| [App vision](engineering/vision.md) | Goals and scope for the management platform |
| [Requirements](engineering/requirements/README.md) | Software requirements derived from operations |
| [Backlog](BACKLOG.md) | Open decisions, doc gaps, and phased implementation work |

## How to use this folder

1. **Leaders & staff** — Start with [church profile](church/profile.md) and the relevant [operations](operations/README.md) doc for your area.
2. **New volunteers or ministry heads** — Read mission & vision, then your ministry or volunteer area.
3. **Engineering** — Business docs are the source of truth; translate workflows here into [requirements](engineering/requirements/README.md), not the other way around.
4. **Keep it current** — When a process, leader, or policy changes, update the business doc first.

## Conventions

- Dates use `YYYY-MM-DD`.
- **EBC** = Ebenezer Baptist Church. **EBC APP** = the management software (engineering only).
- Placeholder sections are marked `TBD` until confirmed with church leadership.
- Each operations doc should name an **owner** (role or person) responsible for keeping it accurate.
