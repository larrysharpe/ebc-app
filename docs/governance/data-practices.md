# Data practices

How Ebenezer Baptist Church of Woodbridge, VA handles people’s information in **EBC APP** and related church systems.

This is **church policy**, not a claim that a particular privacy statute automatically applies. Leadership should have counsel review before public launch. Members read the same rules in the app at `/legal/privacy` and `/legal/terms`.

**Owner:** Church office · [churchadmin@ebenezerbc.org](mailto:churchadmin@ebenezerbc.org)

## Principles (what to keep from typical privacy guidance)

Collect the **minimum** needed for a named church purpose. Tell people what is collected and why. Treat religious life, prayer, giving, children, and pastoral care as **sensitive**, not marketing data. Use **need-to-know** access. Do **not** sell member information. Name third-party processors (Realm, email, hosting) instead of saying “we never share.”

## Additions and corrections to generic church-app advice

| Topic | EBC rule |
|-------|----------|
| **State privacy laws** | Follow these practices anyway. Do not wait on Virginia or Maryland coverage thresholds. Do not advertise consumer “rights” the church cannot actually fulfill. |
| **Giving** | Stays in **Realm**. EBC APP does not store contribution amounts, donor history, cards, or bank numbers. Finance and trustee roles may open Realm — they do not get a giving ledger in this app. |
| **Admin is not pastor** | `admin` / `webmaster` manage accounts and configuration. They do **not** automatically see prayer text, pastoral notes, or giving. |
| **Trustees / Joint Board** | Property and finance stewardship — not pastoral-care files. |
| **Children** | Under 13: **Person** record + household only; **no app login**. Ages 13–17: limited roles (choir/band/volunteer) if leadership issues an account. Parent/guardian is the contact for younger children. |
| **Prayer** | Today: email to `prayerrequests@ebenezerbc.org` — not stored in EBC APP. Never default to congregation-wide. If the app later stores requests, require an audience picker (prayer team / leadership / private). |
| **Pastoral counseling** | Notes, abuse reports, discipline, and legal matters stay **out of EBC APP** unless leadership later approves a locked store. |
| **Safety override** | Confidentiality is not a promise of secrecy when a child or vulnerable adult may be abused, someone is in imminent danger, or the church is legally required to report or produce records. Crisis: **988** / 911. |
| **Correction vs deletion** | People may ask the office to correct their record. Some records (membership, giving in Realm, legal holds) must be kept. |
| **Devices** | Do not request contacts, precise GPS, or advertising trackers. |
| **AI / comms tools** | Do not send prayer text, contact lists, giving amounts, or pastoral notes to models or social suggestion tools. |
| **Photos** | No EBC children in public media without consent. See [communications playbook](../strategy/communications-playbook.md). |
| **Retention** | Lengths TBD with leadership. Until then: keep only what the current ministry task needs. |

## Sensitivity levels

| Level | Examples | Who may see it |
|-------|----------|----------------|
| **1 — Public** | Service time, public events, sermons | Anyone |
| **2 — Community** | Name, ministry involvement on a need-to-know roster | Assigned leaders + office |
| **3 — Restricted** | Phone, email, birthday, household, visitor notes, attendance, volunteer screening status | Office, pastor, assigned ministry/deacon — not every volunteer |
| **4 — Sensitive** | Prayer requests, health/family crisis notes, children’s records | Pastoral care / assigned leaders only |
| **5 — Highly restricted** | Counseling notes, abuse reports, discipline, legal, payment credentials | **Not in EBC APP.** Giving lives in Realm. |

## What EBC APP may collect

**Directory / household:** name, suffix, email, phone, birthday (for age gates), membership status, household links, ministry roles, follow-up notes.

**Visitor follow-up:** name, visit date, optional email/phone, how they heard, staff notes.

**Accounts:** email, name, roles, notification preferences.

**Operations:** ministry SOPs, music plans, events, facilities — not a second giving database.

**Do not collect in EBC APP:** payment cards, bank accounts, SSNs, precise location, phone contacts, advertising IDs.

## Related

- Public pages: `/legal/privacy`, `/legal/terms`
- [Security & privacy (engineering)](../engineering/standards/security-and-privacy.md)
- [Sensitive data & third parties](../engineering/architecture/sensitive-data-and-third-parties.md)
- [Members](../operations/members.md) · [Giving](../operations/giving.md)

Last reviewed: 2026-09-01
