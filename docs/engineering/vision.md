# App Vision & Goals

## What is EBC APP?

EBC APP is the software platform that supports **Ebenezer Baptist Church Woodbridge, VA** operations. It brings church management — people, programs, events, giving, and communications — into one organized system instead of scattered spreadsheets, email threads, and paper records.

Business context lives in the main [documentation hub](../README.md). This document covers software goals only.

## Mission alignment

Ebenezer's church mission is **Putting the Family Back Together** ([mission & vision](../strategy/mission-and-vision.md)). EBC APP supports that mission by:

- Keeping **families and households** connected to the church body
- Helping **ministry leaders** serve without administrative friction
- Making **events and worship** easier to plan and communicate
- Stewarding **resources** (time, talent, and treasure) with clarity and accountability

## Who it serves

| Audience | Primary needs |
|----------|---------------|
| **Pastor & church leadership** | Oversight, reporting, strategic planning |
| **Church office / administrators** | Day-to-day records, scheduling, correspondence |
| **Ministry leaders** | Rosters, events, volunteer coordination |
| **Members & families** | TBD — member portal scope to be defined |
| **Finance team** | Giving records, budgets, statements |

## Guiding principles

1. **Church-first** — Features serve ministry, not the other way around.
2. **Dignity & privacy** — Member data is handled with care; access is role-based.
3. **Simplicity** — Prefer clear workflows over feature bloat.
4. **Single source of truth** — Business docs define process; the app implements them faithfully.
5. **Inclusive access** — Consider members who join in person, online, or both.

## Scope

Phase 1 focuses on **documentation and requirements** — see [feature specs](docs/engineering/requirements/features/README.md).

Implementation phases:

- [ ] Phase 0 — Auth, dashboard shell ([features](docs/engineering/requirements/features/README.md))
- [ ] Phase 1 — Members & ministries directory
- [ ] Phase 2 — Events calendar, volunteers, **music & choir**
- [ ] Phase 3 — Communications, **social media**, facilities, trustee duties
- [ ] Phase 4 — Realm giving hub
- [ ] Phase 5 — Member-facing portal (if desired)

## Success criteria

EBC APP succeeds when church leaders can:

- Find accurate member and ministry information quickly
- Plan and announce events without duplicate effort
- Coordinate volunteers across ministries
- Report on giving and attendance with confidence
- Spend less time on administration and more time on ministry

## Open questions

- Who are the primary day-to-day users (office staff, pastors, ministry heads)?
- What systems or tools does the church use today? **Realm** (giving) — confirm other Realm modules and website CMS
- Is there a member portal goal, or is this staff-only initially?
- What are the highest-pain administrative tasks right now?
