# Backlog

Outstanding work, open decisions, and gaps across EBC documentation and EBC APP. Items stay in their source docs too — this is the single index for prioritization.

**Status key:** `decision` = needs leadership sign-off · `docs` = fill in business/ops docs · `build` = implement in EBC APP · `infra` = platform/tooling

Last consolidated: 2026-07-03

---

## Cross-cutting decisions

| ID | Item | Type | Source |
|----|------|------|--------|
| X-01 | Primary day-to-day app users (office, pastor, ministry heads) | decision | [vision](engineering/vision.md) |
| X-02 | Highest-pain administrative tasks to prioritize | decision | [vision](engineering/vision.md) |
| X-03 | Member portal: staff-only first vs Phase 5 portal | decision | [vision](engineering/vision.md), [architecture](engineering/architecture/overview.md) |
| X-04 | Member PII system of record — Realm vs EBC APP database | decision | [architecture](engineering/architecture/overview.md), [members feature](engineering/requirements/features/members/README.md), [Realm](engineering/integrations/realm.md) |
| X-05 | Which Realm modules beyond giving (members, accounting, groups) | decision | [Realm](engineering/integrations/realm.md), [giving ops](operations/giving.md) |
| X-06 | Auth provider (Clerk, Auth.js, WorkOS, etc.) | decision | [stack](engineering/stack.md), [auth spec](engineering/requirements/features/auth-and-roles.md) |
| X-07 | Hosting provider and CI/CD pipeline | infra | [stack](engineering/stack.md), [architecture](engineering/architecture/overview.md) |
| X-08 | Email provider (Resend, SendGrid, manual) | decision | [stack](engineering/stack.md), [communications feature](engineering/requirements/features/communications/README.md) |
| X-09 | Component library final choice (shadcn/ui or similar) | decision | [stack](engineering/stack.md) |
| X-10 | Final RBAC role list signed off by pastor | decision | [auth spec](engineering/requirements/features/auth-and-roles.md) |
| X-11 | Can one user hold multiple roles? | decision | [auth spec](engineering/requirements/features/auth-and-roles.md) |
| X-12 | Integration priority: accounting, email, website calendar | decision | [architecture](engineering/architecture/overview.md) |
| X-13 | ebenezerbc.org calendar — sync direction (website vs EBC APP master) | decision | [events feature](engineering/requirements/features/events/README.md), [ebenezerbc.org](engineering/integrations/ebenezerbc-org.md) |
| X-14 | WordPress REST API for calendar sync | decision | [ebenezerbc.org](engineering/integrations/ebenezerbc-org.md) |
| X-15 | All feature specs reviewed and phased with leadership | decision | [requirements](engineering/requirements/README.md) |
| X-16 | Initialize git repo and scaffold Phase 0 app | infra | [getting started](engineering/development/getting-started.md) |
| X-17 | Counsel review of `/legal/privacy` and `/legal/terms` before production | decision | [data practices](governance/data-practices.md), [legal disclosures](engineering/requirements/features/legal-disclosures.md) |
| X-18 | Record retention periods (visitor notes, directory, prayer email) | decision | [data practices](governance/data-practices.md) |

---

## Leadership & governance

| ID | Item | Type | Source |
|----|------|------|--------|
| G-01 | Name church administrator and facility usage manager | docs | [leadership](governance/leadership.md) |
| G-02 | Assign **owner** role for each operations area (currently TBD) | docs | [operations index](operations/README.md) |
| G-03 | Trustee board meeting cadence and quorum rules | docs | [trustees ops](operations/trustees.md), [board meetings spec](engineering/requirements/features/trustees/board-meetings.md) |
| G-04 | Expenditure approval thresholds | docs | [trustees ops](operations/trustees.md) |
| G-05 | All trustees get app accounts vs officers only initially | decision | [trustees feature](engineering/requirements/features/trustees/README.md) |

---

## Business operations — content gaps

| Area | Open items | Source |
|------|------------|--------|
| **Members** | Record system today; membership class owner; visitor follow-up timeline | [members](operations/members.md) |
| **Ministries** | Music director; Sunday School structure; internal contact roster | [ministries](operations/ministries.md) |
| **Events** | Event approval workflow; Zoom link owner for prayer/Bible study | [events](operations/events.md) |
| **Giving** | Count team roster; Realm modules beyond giving; budget doc location | [giving](operations/giving.md) |
| **Trustees** | Duty tracking method today; vendor master list | [trustees](operations/trustees.md) |
| **Music** | Director contact; CCLI licensing; where charts live; rehearsal schedule | [music-ministry](operations/music-ministry.md) |
| **Volunteers** | Volunteer database system; children's ministry screening | [volunteers](operations/volunteers.md) |
| **Communications** | Lead/roster; shared inbox; AI Discover/Execute/Evaluate metrics sources; Facebook URL; newsletter; Zoom distribution; announcement deadline/approver | [communications](operations/communications.md) |
| **Social** | All account owners; approval matrix; photo release; boosted-post budget; event data sources | [social-media-community](operations/social-media-community.md) |
| **Facilities** | Room capacity chart; rental fee schedule; sanctuary completion timeline | [facilities](operations/facilities.md) |
| **Branding** | Official brand guide PDF; logo vector; Blacksword license; social avatar/cover standards | [branding](church/branding.md) |

---

## Implementation roadmap (build)

Phases from [vision](engineering/vision.md) and [feature index](engineering/requirements/features/README.md). Each phase has detailed FRs in linked specs.

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | Auth, dashboard shell, RBAC | Not started |
| **1** | Members directory, households, visitor intake; ministry registry & roster | Not started |
| **2** | Church calendar, recurring worship; COUNT ME IN & scheduling; song catalog & service music planner | Not started |
| **3** | **Communications AI loop** (Discover → Execute → Evaluate); announcements; **social** (accounts, calendar/suggestions, community events); space reservations; trustee duties & board meetings | Not started |
| **4** | Realm giving hub (link-out, no contribution storage) | Not started |
| **5** | Member-facing portal (if desired) | TBD |

### Phase 0 — Foundation

- [x] Scaffold Next.js + PostgreSQL + Prisma per [stack](engineering/stack.md)
- [ ] Auth provider integration + session policy
- [ ] RBAC middleware on routes and API
- [ ] Dashboard shell with role-based widgets ([dashboard spec](engineering/requirements/features/dashboard.md))
- [ ] Audit log for auth events
- [ ] `.env.example`, CI pipeline, deployment

### Phase 1 — People & ministries

- [ ] Member directory, household detail, visitor intake
- [ ] Ministry registry and roster
- [ ] Resolve Realm vs EBC APP for member data before build

### Phase 2 — Calendar, volunteers, music

- [ ] Church calendar + recurring worship schedule
- [ ] COUNT ME IN registry and volunteer scheduling
- [ ] Song catalog (lyrics, parts, charts) and service music planner

### Phase 3 — Operations & outreach

- [ ] Announcement workflow
- [ ] Social accounts hub (OAuth: YouTube, Meta)
- [ ] Content calendar & rule-based suggestions
- [ ] Community event discovery & outreach plans
- [ ] Space reservations
- [ ] Trustee duty management and board meetings

### Phase 4 — Stewardship

- [ ] Realm giving hub (deep links, staff guidance — no PII duplication)

### Phase 5 — Future

- [ ] Member portal
- [ ] Deep integrations (accounting, email automation)
- [ ] Leadership reporting dashboards

---

## Feature-level open questions

Grouped by module — see each spec for full FR checklists.

### Auth & dashboard

| Item | Source |
|------|--------|
| Pastor's day-one dashboard widgets | [dashboard](engineering/requirements/features/dashboard.md) |
| Weather banner toggle role | [dashboard](engineering/requirements/features/dashboard.md) |

### Members

| Item | Source |
|------|--------|
| Children's records / guardian linkage | [members README](engineering/requirements/features/members/README.md) |
| Directory photos and print view | [member-directory](engineering/requirements/features/members/member-directory.md) |
| Household merge workflow; mailing labels | [household-detail](engineering/requirements/features/members/household-detail.md) |
| Visitor follow-up owner; website form sync | [visitor-intake](engineering/requirements/features/members/visitor-intake.md) |

### Ministries

| Item | Source |
|------|--------|
| Who edits ministry registry | [ministries README](engineering/requirements/features/ministries/README.md) |
| Contact emails on registry vs roster only | [ministry-registry](engineering/requirements/features/ministries/ministry-registry.md) |
| Sub-roles within ministry | [ministry-roster](engineering/requirements/features/ministries/ministry-roster.md) |
| Board Chair / Joint Board vs pastor/admin for charter approval | [ministry-sops](engineering/requirements/features/ministries/ministry-sops.md), [sop-standard](operations/sop-standard.md) |
| Required charter SOPs (youth, nursery, etc.) | [sop-standard](operations/sop-standard.md) |
| SOP revision log + annual review reminders (FR-12, FR-13) | [ministry-sops](engineering/requirements/features/ministries/ministry-sops.md) |

### Events

| Item | Source |
|------|--------|
| Event approval authority | [church-calendar](engineering/requirements/features/events/church-calendar.md) |
| Zoom URLs in events vs communications | [recurring-worship](engineering/requirements/features/events/recurring-worship-schedule.md) |

### Volunteers

| Item | Source |
|------|--------|
| COUNT ME IN vs existing volunteer database | [volunteers README](engineering/requirements/features/volunteers/README.md) |
| Signup form required fields | [count-me-in](engineering/requirements/features/volunteers/count-me-in-registry.md) |
| Usher board — migrate or parallel tool | [volunteer-scheduling](engineering/requirements/features/volunteers/volunteer-scheduling.md) |

### Music

| Item | Source |
|------|--------|
| CCLI song number field | [music README](engineering/requirements/features/music/README.md) |
| Choir portal login vs read-only links | [music README](engineering/requirements/features/music/README.md) |
| Max asset size; song approval; ChordPro | [song-catalog](engineering/requirements/features/music/song-catalog.md) |
| Snapshot on send; Fall Fresh plans; Media on send | [service-music-planner](engineering/requirements/features/music/service-music-planner.md) |

### Communications

| Item | Source |
|------|--------|
| Weekly announcement deadline | [announcement-workflow](engineering/requirements/features/communications/announcement-workflow.md) |
| Communications lead + shared inbox | [communications](operations/communications.md) |
| Discover cron cadence; Evaluate metrics APIs | [ai-discover-execute-evaluate](engineering/requirements/features/communications/ai-discover-execute-evaluate.md) |

### Social

| Item | Source |
|------|--------|
| ~~`social_manager` vs Media~~ → fold into Communications Ministry | [social README](engineering/requirements/features/social/README.md) |
| Auto-post worship reminders only? | [social README](engineering/requirements/features/social/README.md) |
| Facebook URL; YouTube OAuth owner; Meta Business verification | [social-accounts-hub](engineering/requirements/features/social/social-accounts-hub.md), [social-platforms](engineering/integrations/social-platforms.md) |
| Default posting times; AI captions (Execute default) | [content-calendar-suggestions](engineering/requirements/features/social/content-calendar-suggestions.md) |
| PW county event API; travel radius; coalition events feed | [community-event-discovery](engineering/requirements/features/social/community-event-discovery.md) |
| Eventbrite / paid API budget | [social-platforms](engineering/integrations/social-platforms.md) |

### Facilities

| Item | Source |
|------|--------|
| Rental fee schedule in app vs trustee records | [space-reservations](engineering/requirements/features/facilities/space-reservations.md) |

### Trustees

| Item | Source |
|------|--------|
| Who can assign duties | [duty-management](engineering/requirements/features/trustees/duty-management.md) |
| Junior Trustees program tie-in | [duty-management](engineering/requirements/features/trustees/duty-management.md) |

### Giving

| Item | Source |
|------|--------|
| Realm portal deep link paths | [realm-giving-hub](engineering/requirements/features/giving/realm-giving-hub.md) |
| Trustee role in RBAC vs finance only | [realm-giving-hub](engineering/requirements/features/giving/realm-giving-hub.md) |
| Monthly export automation owner | [realm-giving-hub](engineering/requirements/features/giving/realm-giving-hub.md) |

---

## Social module — later enhancements

Captured in specs as post-MVP (Phase 3b / 4):

- Instagram scheduling via Meta Business Suite API
- YouTube upload detection → clip suggestions
- AI caption draft/rewrite via Communications Execute (human approval required)
- Template library with placeholders
- Facebook public events search
- PWCS school flyer feed
- Post performance aggregates for Communications Evaluate (no audience PII)
- Approved church photo library picker

---

## How to use this backlog

1. **Leadership sessions** — Work top-down: cross-cutting decisions (X-*) unblock multiple features.
2. **Operations owners** — Close business doc gaps before engineering builds workflows.
3. **Engineering** — Pull from phase sections; mark items done in source specs and remove or check off here when consolidated.
4. **Prioritization** — Not every open item blocks Phase 0. Auth, hosting, and dashboard can start while Realm/PII decisions proceed in parallel.

When an item is resolved, update the source doc and delete or strike through the row here on the next consolidation pass.
