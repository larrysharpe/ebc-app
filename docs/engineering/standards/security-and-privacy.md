# Security & Privacy

Protecting church member data, giving records, and pastoral information in EBC APP.

## Data classification

Align with church policy in [data practices](../../governance/data-practices.md). Public wording lives at `/legal/privacy`.

| Level | Examples | Handling |
|-------|----------|----------|
| **1 — Public** | Worship times, public events | May appear on website |
| **2 — Community** | Ministry involvement on a need-to-know roster | Authenticated assigned leaders |
| **3 — Restricted** | Directory contacts, household, visitor notes, attendance | Office, pastor, assigned ministry/deacon — not every volunteer |
| **4 — Sensitive** | Prayer requests, family/crisis notes, children’s records | Pastoral care / assigned leaders only |
| **5 — Highly restricted** | Counseling notes, abuse reports, discipline, payment credentials, giving history | **Not in EBC APP.** Giving stays in Realm. |

**Admin is not pastor.** `admin` / `webmaster` manage accounts. They do not automatically receive prayer, pastoral notes, or giving.

**Ops docs:** Prefer **roles and functional contacts** (Media lead, Deacon Chair, ministry email). Do not put personal names in `docs/operations/` — named rosters live in the app.

Align access rules with [governance](../../governance/leadership.md) and operations policies — especially [members](../../operations/members.md), [giving](../../operations/giving.md), and [data practices](../../governance/data-practices.md).

## Authentication

- All non-public routes require authentication
- Sessions expire after inactivity (duration TBD; recommend ≤ 8 hours for staff workstations)
- Password policy TBD when auth provider is chosen — minimum 12 characters or SSO
- Multi-factor authentication (MFA) encouraged for finance and admin roles; required before production if provider supports it

## Authorization (RBAC)

- **Deny by default** — No access until a role grants it
- **Check on every request** — Server-side enforcement; never rely on hiding UI alone
- **Least privilege** — Ministry leaders see their ministry's data, not the full giving ledger

### Proposed roles (refine with church leadership)

| Role | Typical access |
|------|----------------|
| `admin` | Full system configuration, user management |
| `pastor` | Broad read; pastoral notes; leadership reports |
| `office_staff` | Members, events, communications — day-to-day ops |
| `finance` | Giving and financial reports only |
| `ministry_leader` | Own ministry members, volunteers, events |
| `volunteer` | Own schedule and limited directory (TBD) |
| `member` | Portal self-service only (future) |

Map final roles to [governance](../../governance/leadership.md) decision authority.

## Audit logging

Log these events with actor, timestamp, and resource ID:

- Sign in / sign out (and failed attempts)
- Create, update, delete on member and household records
- All giving record changes
- Role and permission changes
- Export of sensitive reports

Audit logs are append-only and retained per church policy (TBD).

## Privacy

- **Minimum necessary** — Collect and display only data needed for the task
- **No sale** — Member data is not sold or sent to advertising networks
- **Name processors** — Realm, email, and hosting are third parties; do not claim “we never share”
- **Export & correction** — Members may request correction through the church office. Deletion is not always possible (membership, Realm giving, legal holds)
- **Children** — Under 13: no app login; parent/guardian is the account holder. Ages 13–17: limited roles only if issued. No public photos of EBC children without consent
- **Prayer** — Email today (`prayerrequests@`); not stored in EBC APP; never congregation-wide by default
- **Safety** — Confidentiality yields to abuse of a child/vulnerable adult, imminent danger, or legal duty. Point people in crisis to **988** / 911
- **Devices** — Do not request contacts, precise GPS, or ad trackers
- **AI** — Do not send prayer text, contact lists, giving amounts, or pastoral notes to models

## Third-party services

Member PII and giving data **may** be stored or processed by approved third parties (church management systems, auth providers, giving platforms, email services). Ebenezer remains the data controller; vendors must be vetted, documented, and covered by appropriate terms.

- **Never** store payment card or bank account numbers in EBC APP — use a payment processor
- **Never** put PII in analytics, logs, or error trackers without scrubbing
- **Do not** duplicate full member records across systems without a documented source of truth

Full guidance: [Sensitive data & third parties](../architecture/sensitive-data-and-third-parties.md).

## Technical controls

| Control | Requirement |
|---------|-------------|
| Transport | HTTPS everywhere in staging and production |
| Database | Encrypted at rest (managed provider default or explicit config) |
| Secrets | Environment variables / secret manager — never in code |
| Dependencies | Monitor CVEs; patch critical issues promptly |
| Backups | Automated daily backups; test restore quarterly |
| Local dev | No production data on developer machines; use seed/anonymized data |

## Logging

**Do not log:**

- Passwords or session tokens
- Full credit card or bank account numbers
- Giving amounts tied to identifiable members in application logs
- Social security numbers or government IDs (should not be stored unless legally required — default: do not store)

Use structured logging with correlation IDs for debugging production issues.

## Incident response

1. Contain — revoke compromised credentials, block access if needed
2. Notify — pastor and designated church leadership
3. Assess — what data was exposed, for how long
4. Remediate — patch vulnerability, rotate secrets
5. Document — post-incident summary in a private church record (not public repo)

## Compliance

- Follow applicable Virginia and federal requirements for charitable organizations and tax receipts
- Annual giving statements must match church finance policy in [operations/giving.md](../../operations/giving.md)
- Consult church legal counsel for retention and breach notification obligations

## Security review triggers

Require extra review before merge when a PR:

- Changes authentication or authorization
- Adds a new integration with external systems
- Exposes a new API endpoint
- Handles file uploads
- Touches giving or payment flows
