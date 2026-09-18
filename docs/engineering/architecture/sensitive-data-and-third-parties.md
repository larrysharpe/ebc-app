# Sensitive Data & Third Parties

How EBC APP handles member PII and other sensitive data — including when to use third-party services.

## Short answer

**Yes.** Using vetted third parties for sensitive data is a valid and often **recommended** approach. Most churches already do this indirectly (email providers, online giving, website hosts). The requirement is not “keep everything in-house” — it is **know what lives where**, **contract appropriately**, and **limit what EBC APP stores and exposes**.

## Church responsibility

Ebenezer remains the **data controller** — the organization responsible for member data and how it is used. Third parties act as **data processors** when they store or handle data on the church’s behalf.

Before adopting a vendor for PII or financial data:

1. **Church leadership approves** the vendor and use case
2. **Review terms** — privacy policy, data processing agreement (DPA), subprocessors
3. **Confirm export** — church can retrieve full data if switching vendors
4. **Document** the vendor in the table below and in church records (not public repo)

Consult church legal counsel for contracts involving member or giving data.

## What counts as sensitive

| Data | Classification | Typical handling |
|------|----------------|------------------|
| Name, address, phone, email | Confidential (PII) | Restricted access; third party OK with DPA |
| Household relationships | Confidential | Same as PII |
| Membership status | Internal / confidential | EBC APP or ChMS |
| Giving history | Highly sensitive | Dedicated giving platform or strict RBAC |
| Payment card / bank details | Highly sensitive | **Never in EBC APP** — payment processor only |
| Pastoral notes | Highly restricted (level 5) | **Not in EBC APP** unless leadership later approves a locked store |
| Background check results | Highly sensitive | Specialized vendor; minimal retention in EBC APP |
| Credentials (passwords) | Highly sensitive | Auth provider; never store plaintext |

## Architectural options

### Option A — Third party as system of record (ChMS)

Use an established **church management system** (e.g. Planning Center, Breeze, Tithe.ly ChMS) as the primary store for member PII and giving. EBC APP focuses on workflows Ebenezer needs that the ChMS does not cover, or acts as a unified UI via API.

| Pros | Cons |
|------|------|
| Vendor specializes in church data security | Monthly cost; vendor lock-in risk |
| Less PII in custom code / database | Integration complexity |
| Often includes giving, check-in, groups | Less customization |

**EBC APP stores:** external person IDs, cached non-sensitive fields (if needed), links — not full PII duplicate unless justified.

### Option B — Hybrid (recommended default to evaluate)

Sensitive categories go to **purpose-built vendors**; EBC APP holds operational data and **references** external records.

| Domain | Third party | EBC APP holds |
|--------|-------------|---------------|
| Authentication | Clerk, Auth.js + managed IdP, etc. | User ID, role mapping |
| Member PII | Realm **or** other ChMS **or** self-hosted DB | Member ID, ministry links — see [Realm integration](../integrations/realm.md) |
| Giving | **Realm** (ACS Technologies) — in use | Links, fund-level summaries — **not** donor giving history |
| Email lists | Resend, SendGrid, Mailchimp | Audience IDs, send history metadata |
| Background checks | Provider required by policy | Status flag only (passed/pending), not report details |

| Pros | Cons |
|------|------|
| Reduces PCI and credential scope | Multiple systems to administer |
| Best-of-breed per domain | Sync and consistency work |

### Option C — Self-hosted in EBC APP database

All member PII in PostgreSQL (managed host such as Railway, Supabase, AWS RDS).

| Pros | Cons |
|------|------|
| Single system; full control | Church inherits full security burden |
| No per-seat ChMS fees | Requires strong RBAC, encryption, backups, incident response |
| Simplest data model | Developers must not mishandle PII |

Acceptable when using **managed PostgreSQL** (encryption at rest, TLS), strict [security standards](../standards/security-and-privacy.md), and no raw payment data in the app.

## What must never go to a generic third party

Without explicit legal review and a appropriate DPA:

- Unencrypted exports of full member directory emailed or stored in personal Google Drive / Dropbox
- PII in analytics tools (Google Analytics, Mixpanel) — use privacy-safe analytics or none
- PII in error tracking (Sentry) — scrub before send
- Production member data on developer laptops or in git

## Third-party evaluation checklist

Use before connecting any vendor to member or giving data:

- [ ] SOC 2 Type II or comparable security attestation (preferred)
- [ ] DPA or terms clearly defining processor role and church ownership of data
- [ ] Encryption in transit (TLS) and at rest
- [ ] Data residency acceptable (US-only if required)
- [ ] Subprocessor list published
- [ ] Export API or bulk download for church records
- [ ] Breach notification terms
- [ ] MFA available for admin accounts
- [ ] Pricing sustainable for church budget

## Approved vendors

Record church-approved vendors here as decisions are made.

| Vendor | Purpose | Data held | Status | Approved by | Date |
|--------|---------|-----------|--------|-------------|------|
| **Realm** (ACS Technologies) | Giving & stewardship | Contributions, funds, donor giving history, payment processing | **In use** | TBD | TBD |
| TBD | Authentication | Credentials, email | TBD | TBD | TBD |
| TBD | Member PII (if not Realm) | Full directory | TBD | TBD | TBD |
| TBD | Email | Names, emails | TBD | TBD | TBD |
| TBD | Database host | EBC APP operational data | TBD | TBD | TBD |

## Implementation rules (EBC APP)

Regardless of option chosen:

1. **Minimize duplication** — Do not copy full PII into EBC APP if another system is already the source of truth.
2. **Reference by ID** — Store `externalPersonId`, not a second copy of address book unless needed for offline/reporting with documented retention.
3. **API boundaries** — All third-party access through `src/modules/*/integrations/` adapters, not scattered fetch calls.
4. **Secrets** — API keys in environment / secret manager only.
5. **Logging** — No PII in application logs (see [security & privacy](../standards/security-and-privacy.md)).
6. **Sync direction** — Document whether ChMS → EBC APP, EBC APP → ChMS, or bidirectional; one system wins on conflict.

## Decision

| Question | Decision |
|----------|----------|
| Use third parties for sensitive data? | **Yes — allowed and expected** with church approval and DPAs |
| Giving & contributions | **Realm** — system of record; EBC APP integrates, does not replace |
| Member PII | TBD — confirm if Realm profiles are also directory of record |
| Default architecture | **Option B (hybrid)** — Realm for giving; evaluate Realm vs other stores for PII |
| Payment card data | **Realm** processor — never EBC APP database |

Update this table when church leadership and engineering align on vendors.
