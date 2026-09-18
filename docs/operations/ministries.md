# Ministries & Programs

How Ebenezer organizes ministry teams, classes, and ongoing programs.

**Registry source:** [ebenezerbc.org/connect](https://ebenezerbc.org/connect) — full detail in [website reference](../church/website-reference.md).

> **Privacy:** Operations docs describe **roles and contacts by function** (e.g. Media lead, Deacon Chair). Named individuals belong in the EBC APP roster / church directory — not in these docs.

## Purpose

Equip the congregation to worship, learn, serve, and reach the community through structured ministries — each with clear leadership, purpose, and rhythm.

## Owner

| Role | Responsibility |
|------|----------------|
| **Pastor** | Overall ministry direction |
| **Ministry leaders** | Day-to-day leadership per ministry (below) |

## Ministry registry

### Christian education

| Ministry | Meets | Purpose | Leader role |
|----------|-------|---------|-------------|
| **Sunday School** | 1st & 4th Sun, 8:30 AM | Biblical teaching | Sunday School director (TBD) |
| **Wednesday Bible Study** | Wed, 7:00 PM (Zoom) | Mid-week teaching | Teaching pastor / assigned teacher |
| **Christian Education** | Courses, catalog on website | Life guidance from Scripture | [Page](https://ebenezerbc.org/connect/christian-education) |

### Fellowship ministries

| Ministry | Audience | Purpose | Leader role / schedule |
|----------|----------|---------|------------------------|
| **Youth Ministry** | Under 19 | Spiritual growth, mentoring, activities | Youth director |
| **Young Adult (YAMs)** | Ages 18–35 | Spiritual and social outreach | [Page](https://ebenezerbc.org/connect/fellowship-ministries/young-adult-ministry) |
| **Mountain Men** | Men | Iron Sharpens Iron; small groups | Annual retreat ~3rd week September |
| **Women's (Fruit of the Spirit)** | Women | Fellowship, Bible study, service | 4th Tuesday monthly fellowship |
| **Golden Eagles** | Seniors | Fellowship, prayer, lunch | Wed noon prayer + lunch; seasonal events |
| **JAMM** (Joseph's Army) | Boys (elem–HS) | Mentoring godly young men | [Page](https://ebenezerbc.org/connect/fellowship-ministries/jamm-ministry) |

### Outreach ministries

| Ministry | Purpose | Notes |
|----------|---------|-------|
| **Missionary (Annie B. Rose)** | Community service, food pantry, shelters, drives | Food drive; Belmont Bay Rehab service 3rd Sun @ 2 PM |
| **Prison** | Gospel and discipleship for incarcerated and families | |

### Church leadership ministries

| Ministry | Purpose | Officer roles |
|----------|---------|---------------|
| **Deacon** | Service, care, worship support | Deacon Chair · Vice Chair |
| **Deaconess** | Ordinances, visitations, member support | Deaconess Chair |
| **Trustee** | Property, finances, operations | Trustee Chair · Treasurer |

### Service & support ministries

| Ministry | Purpose | Contact / leader role |
|----------|---------|------------------------|
| **COUNT ME IN** | Church-wide volunteer recruitment | countmein@ebenezerbc.org · Volunteer coordinators |
| **Counseling** | Biblical family counseling | Counseling president |
| **Usher / Greeter** | Welcome, seating, safety | Usher board · 2nd Thursday meetings, 7 PM |
| **Media / AV** | Sound, livestream, slides, camera, digital sign, graphics, photo/video | mediaministry@ebenezerbc.org · Media lead |
| **Communications** | *Proposed* — one church voice for announcements, bulletin, website notes, social messaging (not AV). Pending leadership — [case](../strategy/case-for-communications.md) | TBD |
| **Music & choir** | Song catalog, service planning, choir parts | TBD — [music-ministry.md](music-ministry.md) |
| **Sports** | Recreation, wellness, outreach sports | Sports president |
| **Nehemiah Project** | Capital building campaign | Since 1995; sanctuary completion |

### Media Ministry — role model (not a named roster)

Roster with names lives in **EBC APP → Media Ministry → Roster**. Docs only define roles/duties:

| Structural role | Typical duties |
|-----------------|----------------|
| **Media lead** (director) | Overall Media Ministry |
| **Member** | Combinations of: in-service slides, camera, sound, streaming |
| **Digital sign** | Operator and/or creative (often same person as slides/camera). VNNOX board is **240 × 120**; typical uploads are ~1672 × 941 stills (Sunday Service style) or short video (VBS, car show). Campaign files and upload folders: [`scripts/media-campaigns/`](../../scripts/media-campaigns/README.md). |
| **Volunteer (open)** | Photographer · Videographer |

### Communications — pending leadership

Do not treat Communications as an established ministry until pastor/boards affirm it. Persuasion brief: [case for Communications](../strategy/case-for-communications.md).

When affirmed, roster and duties live in EBC APP; Media remains AV production. Seats, Sunday shot list, and platforms: [communications playbook](../strategy/communications-playbook.md).

## Key activities

- Weekly worship support (ushers, media, [music & choir](music-ministry.md))
- Wednesday Zoom prayer and Bible study
- Seasonal programs (VBS, Fall Fresh choir workshop, revivals)
- Community outreach and facility-based counseling
- Capital campaign and building (Nehemiah Project)

## Processes

### Joining a ministry

- Visitors explore via [New to EBC](https://ebenezerbc.org/about/new-to-ebc) opportunity links
- Women's Ministry: online signup for Fruit of the Spirit groups
- COUNT ME IN: forms at church, FLC boxes, or countmein@ebenezerbc.org

### Ministry operations (personnel, calendar, SOPs, media)

Each ministry maintains in EBC APP:

1. **Plan** — default landing: needs attention for the next 4 weeks plus a **cached AI suggested plan** (next 4 weeks). Plans refresh in the background (hourly cron, stale after 24h) and ministry managers can **Refresh** on the Plan tab.
2. **Roster** — directors, chairs, advisors, and members with **leadership roles** and **duty assignments** (person contact comes from the member directory)
3. **Duties** — per-ministry duty catalog (define/edit/deactivate; optional duty email; each duty should link to an SOP)
4. **Calendar** — ministry-specific meetings, outreach dates, and recurring rhythms, plus church-wide dates from the master [events](events.md) calendar
5. **SOPs** — standard operating procedures per the church [SOP standard](sop-standard.md) (CLC 2026-06-30):
   - **Ministry charter** — one operating manual (purpose, scope, structure, membership, meetings, procedures, review)
   - **Task procedures** — checklists for recurring work (safety, onboarding, event setup, handoffs)
6. **Media library** — photos, videos, and audio for that ministry
7. **Documents** — PDFs, forms, and ministry files (same folder pattern as media; local storage now; S3 later)

**Contacts:** Use the ministry **contact email** (and optional per-duty emails) for shared inboxes like `mediaministry@…`. Do not put ministry inboxes on a roster person’s personal contact.

**Suggested plans (background):** Cached markdown lives on each ministry (`suggestedPlan`). Vercel Cron hits `GET /api/cron/ministry-suggested-plans` hourly (Bearer `CRON_SECRET`) and regenerates up to 2 stale plans (older than 24h or never generated), then refreshes the **church-wide plan** at `/church/plan` when that cache is stale. Locally:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/ministry-suggested-plans?limit=5"
```

Ministry leaders/managers can **Refresh** on a ministry Plan tab. Pastor / office / admin can **Refresh** the church plan on **Church → Church plan**.

Ministry leaders draft and maintain their own ministry SOPs; office staff and admin can edit all. Pastor / administrator **approve** charters and SOPs that touch doctrine, safety, or church-wide policy. CLC calls for Joint Board sign-off on charter amendments — app maps that to pastor/admin until a board approval role ships.

**Membership rule (CLC):** Ministry positions are limited to **active members of Ebenezer Baptist Church** unless the Pastor grants an exception — encoded in the charter template membership section.

**Leadership controls (EBC APP):** Pastor, administrator, or designee manage church-wide SOP **templates**, **section guidance** (hints and placeholders), and **quality thresholds** under `/leadership` — ministry leaders consume these when writing SOPs but do not edit them.

### Starting a new ministry

TBD — approval path through pastor and church leadership.

## Related areas

- [Events](events.md) — calendar and special services
- [Volunteers](volunteers.md) — COUNT ME IN
- [Music ministry](music-ministry.md)
- [Communications Ministry](communications.md) · [Social media](social-media-community.md)
- [Facilities](facilities.md) · [Trustees](trustees.md)
- [SOP standard](sop-standard.md)
