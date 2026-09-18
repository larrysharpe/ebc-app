# Legal disclosures

| Field | Value |
|-------|-------|
| **Module** | `src/modules/legal` |
| **Feature folders** | `legal-document/`, `legal-links/`, `legal-page-shell/` |
| **Routes** | `/legal`, `/legal/privacy`, `/legal/terms` |
| **Phase** | 0 |
| **Status** | In progress |
| **Business source** | [Data practices](../../../governance/data-practices.md) |

## Overview

Public Privacy policy and Terms of use for EBC APP. Same rules church staff already follow in engineering standards — written in church language and linked from sign-in, the account menu, settings, and the sidebar.

## Users & roles

| Role | Access |
|------|--------|
| Anyone (not signed in) | May read `/legal/*` |
| Every signed-in user | Same pages + links in the account menu and sidebar |

## User stories

- As a **staff member**, I want to open Privacy and Terms from sign-in so I know what the church collects.
- As a **pastor or office staff**, I want prayer and visitor screens to say who will see the information.

## Functional requirements

### Must have (MVP)

- [x] FR-1: Public `/legal/privacy` and `/legal/terms` (no login)
- [x] FR-2: Links on login, user menu, settings, and sidebar
- [x] FR-3: Privacy names what we collect, what we do not, Realm giving, children, prayer, no sale of data, and safety limits
- [x] FR-4: Short notices on prayer, visitor intake, and giving screens

### Should have (later product work)

- [ ] FR-5: Prayer audience picker when requests are stored in-app (never public default)
- [ ] FR-6: Member “my information” request flow (view / correct / office deletion request)
- [ ] FR-7: Photo/media consent flags on people records used by communications
- [ ] FR-8: Audit log when someone exports a directory
- [ ] FR-9: Counsel review of the public pages before production launch
- [ ] FR-10: Split `admin` so account admins cannot open pastoral-care records if those are ever stored

### Won't have (this feature)

- A lawyer-signed statute compliance badge
- Collecting giving inside EBC APP
- Under-13 user accounts

## Data

These pages are static church policy. They do not collect new personal information.

## UI notes

- Mobile-first, large type, one document per page
- Login line: signing in means you agree to Terms and Privacy
- Follow [UX](../../standards/ux.md)

## Acceptance criteria

- [x] AC-1: `/legal/privacy` and `/legal/terms` load without a session
- [x] AC-2: Login, user menu, settings, and sidebar include the legal links
- [ ] AC-3: Church counsel has reviewed the wording (before production)

## Open questions

- [ ] Retention periods for visitor notes and directory records
- [ ] Official privacy contact if not the church office
