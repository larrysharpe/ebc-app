# Realm giving hub

| Field | Value |
|-------|-------|
| **Module** | `src/modules/giving` |
| **Feature folder** | `features/realm-giving-hub/` |
| **Route** | `/giving` |
| **Phase** | 4 |
| **Status** | Draft |
| **Business source** | [giving.md](../../../operations/giving.md) · [Realm integration](../../integrations/realm.md) |

## Overview

Finance landing page in EBC APP — deep links to Realm for batch entry, statements, and reports; optional fund-level totals; public giving channel reference (website, Cash App). **No donor-level data stored in EBC APP** unless leadership approves secured integration.

## Users & roles

| Role | Access |
|------|--------|
| `finance` | Full hub |
| `admin` | Full hub |
| `trustee` | Trustee hub; fund summaries per policy |
| All others | **No access** |

## User stories

- As **finance**, I want one-click access to Realm batch entry so that I don't bookmark multiple URLs.
- As **finance**, I want fund totals for the current month so that I can report to trustees without exporting twice.
- As **office staff**, I want the public give page link to share with members — not access to giving records.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Role gate — only `finance` and `admin`
- [ ] FR-2: **Open Realm** buttons — configured `REALM_PORTAL_URL` deep links (batch, reports, statements — TBD with ACS)
- [ ] FR-3: **Public giving links** card — ebenezerbc.org/give, Cash App $EBCWOODBRIDGEVA, mail instructions
- [ ] FR-4: Support email display — onlinegiving@ebenezerbc.org
- [ ] FR-5: No contribution create/edit UI in EBC APP

### Should have

- [ ] FR-6: Fund summary widgets from scheduled Realm export (CSV ingest — aggregate only)
- [ ] FR-7: Link from [household detail](../members/household-detail.md) to Realm person (if `realm_person_id` mapped)

### Won't have

- Payment processing
- Donor giving history in EBC APP database
- Tithe calculator (website has one — link out)

## Data

| Entity | Notes |
|--------|-------|
| `giving_fund_summary` | Optional — fund_id, period, total_amount (no donor PII) |
| `realm_person_id` on Person | Cross-link only |

## Integrations

[Realm](../../integrations/realm.md) — primary.

## Dependencies

- [Auth & roles](../auth-and-roles.md)
- Members module (optional person link)

## Acceptance criteria

- [ ] AC-1: Non-finance roles receive 403 on `/giving`
- [ ] AC-2: No giving amounts in application logs
- [ ] AC-3: Page clearly states Realm is system of record

## Open questions

- [ ] Realm portal URL and deep link paths from ACS
- [ ] Trustee role in RBAC vs finance only?
- [ ] Monthly export automation who runs it?
