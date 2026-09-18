# Auth & roles

| Field | Value |
|-------|-------|
| **Module** | `src/modules/auth` |
| **Feature folders** | `sign-in/`, `user-management/`, `access-overview/`, `settings-hub/` |
| **Routes** | `/login`, `/settings`, `/settings/users`, `/settings/access` |
| **Phase** | 0 |
| **Status** | Implemented (dev) |
| **Business source** | [Governance](../../../governance/leadership.md) · [Security standards](../../standards/security-and-privacy.md) |

## Overview

Authentication and role-based access for EBC APP staff and leaders. Maps church governance to software permissions — deny by default, enforce on server on every request (middleware + server actions).

**Local dev accounts:** see [Getting started — Dev sign-in accounts](../../development/getting-started.md#dev-sign-in-accounts).

## Users & roles

Each account has **one or more roles**. Effective permissions are the **union** of all assigned roles (e.g. Deacon + Choir Member + JAMM Leader gets dashboard, music plans, and scoped JAMM ministry access).

| Role | Description |
|------|-------------|
| `super_admin` | Full platform access; can assign any role including `webmaster` |
| `admin` | User management, all modules; cannot create or edit `super_admin` / `webmaster` accounts |
| `webmaster` | Broad module access; **only role** that may authorize the header Cursor agent to edit the EBC APP codebase |
| `pastor` | Leadership hub, broad read across ministries and music |
| `office_staff` | Visitors, ministries (all), day-to-day operations |
| `finance` | Giving module |
| `trustee` | Trustees module, giving read |
| `deacon` | Dashboard access (church officer role) |
| `facility_manager` | Facilities module — campus space inventory and future reservations |
| `music_minister` | Full music ministry authority (choir + band branches) |
| `choir_director` | Choir plans, song picks, send plans |
| `choir_member` | View service plans and song catalog |
| `band_director` | Band roster management |
| `band_member` | View band roster |
| `social_manager` | Social module |
| `ministry_leader` | Scoped to assigned ministry/ministries — roster, events, SOPs for own team |
| `volunteer` | Dashboard only (future: own schedule) |

Legacy stored values `music_director` and `musician` are normalized to `music_minister` and `band_member`.

### Ministry scoping

`ministry_leader` users carry `ministryIds` (one or more). They can view and manage only those ministries unless they also hold a global role (`pastor`, `office_staff`, etc.).

### Choir director scoping

`choir_director` users carry `choirIds` (one or more chapel choir ids, e.g. `adult`, `senior`). They only finish and edit plans for those choirs. Music ministers and platform admins see all choirs. If `choirIds` is empty on an older account, the app falls back to choirs where that person is listed as a roster leader.

### Music hierarchy

Two branches under the music minister:

- **Choir:** `choir_member` → `choir_director` → `music_minister`
- **Band:** `band_member` → `band_director` → `music_minister`

Fine-grained music permissions live in `permissions.constants.ts`.

### Route access

Module-level access is defined in `src/modules/auth/constants/auth.constants.ts` (`ROUTE_ACCESS`). Platform settings (`/settings`) are limited to `super_admin` and `admin`.

**Church life** (`/church`, `/church/deacon`, `/church/prayer`, `/church/giving`, `/church/calendar`) is available to **every signed-in user** regardless of role — deacon contact, prayer requests, giving links, and the public church calendar.

## User stories

- As **office staff**, I want to sign in with my church email so that I can access member records securely.
- As an **admin**, I want to assign multiple roles to staff so that people only see what their jobs require.
- As **finance**, I want giving data restricted to my role so that member giving stays confidential.
- As a **deacon who also leads JAMM and sings in choir**, I want one login that reflects all three roles.

## Functional requirements

### Must have (MVP)

- [x] FR-1: Email/password sign-in (dev); JWT session cookie
- [x] FR-2: Session expires after 8 hours
- [x] FR-3: RBAC middleware on app routes; permission checks on server actions
- [x] FR-4: Admin can create/edit/disable users; assign multiple roles and ministry scopes
- [ ] FR-5: Audit log: sign-in, sign-out, failed attempts, role changes
- [x] FR-6: Unauthorized route access redirects authenticated users to `/?denied=1`

### Should have

- [ ] FR-7: MFA for `admin`, `super_admin`, and `finance` roles
- [x] FR-8: `ministryIds` scope on `ministry_leader` users (supports multiple ministries)

### Won't have (this feature)

- Public self-registration (church issues accounts)
- SSO with ebenezerbc.org WordPress staff login (separate systems unless integrated later)
- Member portal auth (phase 5)

## Data

Prisma `User` model (`prisma/schema.prisma`):

| Field | Notes |
|-------|-------|
| `id` | CUID |
| `email` | Unique, lowercased |
| `name` | Display name |
| `passwordHash` | bcrypt (dev); replace with external auth in production |
| `roles` | `String[]` — current role slugs |
| `ministryIds` | `String[]` — ministry leader scope |
| `status` | `active` \| `disabled` |

Sessions are signed JWTs in the `ebc_session` httpOnly cookie (`session.utils.ts`). No server-side session table yet.

Seed data: `src/modules/auth/data/users.seed.ts`.

## Integrations

| System | Use |
|--------|-----|
| App sessions | JWT + `AUTH_SECRET` (current) |
| Realm | No shared login — deep links only; giving stays in Realm |

## UI

- **Sign-in** (`/login`): church logo, email + password
- **Settings** (`/settings`): hub for platform admins
- **Staff accounts** (`/settings/users`): table, multi-role checkboxes, ministry assignment
- **Roles & permissions** (`/settings/access`): read-only ACL reference
- Header shows combined role badge; sidebar filters nav by effective permissions

## Dependencies

None — foundational module.

## Acceptance criteria

- [x] AC-1: User without any permitted role cannot access protected module routes
- [ ] AC-2: `finance` cannot open member PII beyond what policy allows (define per members feature)
- [ ] AC-3: Role change appears in audit log within 1 minute
- [x] AC-4: No session token or PII in application logs

## Open questions

- [ ] Production auth provider (Clerk, Auth.js, Entra, etc.) vs retained email/password
- [ ] Final role list signed off by pastor
- [ ] Whether `deacon` needs additional module access beyond dashboard

## Code reference

| Area | Path |
|------|------|
| Route access | `src/modules/auth/constants/auth.constants.ts` |
| Fine-grained permissions | `src/modules/auth/constants/permissions.constants.ts` |
| Ministry scope | `src/modules/auth/constants/ministry-scope.constants.ts` |
| Middleware | `src/middleware.ts` |
| Dev seed users | `src/modules/auth/data/users.seed.ts` |
