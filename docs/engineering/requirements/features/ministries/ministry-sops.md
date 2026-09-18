# Ministry SOP editor

| Field | Value |
|-------|-------|
| **Module** | `src/modules/ministries` |
| **Feature folder** | `features/ministry-detail/components/SopPanel/` |
| **Route** | `/ministries/[slug]?tab=sops` |
| **Phase** | 1 |
| **Status** | In progress |
| **Business source** | [ministries.md](../../../operations/ministries.md) · [sop-standard.md](../../../operations/sop-standard.md) (CLC 2026-06-30) |

## Overview

Standard operating procedures (SOPs) document how each ministry is organized and how recurring work is done. Markdown-friendly guided sections; human-readable in app. Leaders keep procedures current without hunting through email or paper binders.

Church standard (CLC): two kinds — **ministry charter** (one operating manual per ministry) and **task procedures** (many checklists). Leadership owns templates and section guidance under `/leadership`.

## User stories

- As a **ministry leader**, I want a CLC-aligned charter for my ministry so purpose, scope, membership, and meetings are clear.
- As a **ministry leader**, I want to write a task SOP for our food drive so every volunteer follows the same steps.
- As **office staff**, I want to find Media Ministry's livestream checklist before Sunday.
- As **pastor / administrator**, I want to approve charters and safety-critical SOPs before they are treated as official.
- As **leadership**, I want to edit section hints and templates without a code deploy.

## Functional requirements

### Must have (MVP)

- [x] FR-1: List SOPs with title and last-updated metadata
- [x] FR-2: Create SOP — title + content (markdown-friendly plain text)
- [x] FR-3: Edit existing SOP
- [x] FR-4: Delete SOP
- [x] FR-5: Document control fields — version, status (`draft` \| `in_review` \| `approved` \| `archived`), prepared/reviewed/approved metadata, optional document # and effective date
- [x] FR-6: Approve / unapprove SOP (pastor, admin, super_admin) — records approver and timestamp; ministry leaders save drafts
- [x] FR-7: Guided editor with section prompts and live preview
- [x] FR-8: SOP templates including **Ministry charter (CLC)** plus task templates (outreach, youth, AV, onboarding, meetings)
- [x] FR-9: Quality score with actionable checklist (target configurable, default 70+)
- [x] FR-11: CLC charter sections — Scope, Structure, Membership, Meetings (charter-only in guided UI; task SOPs hide them unless already filled)
- [x] FR-16: Per-section AI help icon — Cursor coaching + optional suggested draft insert (requires `CURSOR_API_KEY`)
- [ ] FR-12: Revision history log (version, date, author, change) per CLC §VII
- [ ] FR-13: `nextReviewAt` and dashboard “SOPs due for review”

### Should have

- [ ] FR-10: Attach PDF from church office (signed paper copy)
- [ ] FR-14: Structured procedure rows (Step \| Procedure \| Responsible) as optional alternative to free-text steps
- [ ] FR-15: Joint Board / Board Chair approval role distinct from pastor

### Won't have

- Full document management system (SharePoint replacement)

## Data

`MinistrySop` on `Ministry` (JSON):

| Field | Notes |
|-------|--------|
| `id`, `title`, `content` | Body composed from guided sections |
| `updatedAt`, `updatedBy` | Last edit |
| `templateId` | Starting template (e.g. `ministry_charter`) |
| `kind` | `charter` \| `task` |
| `documentNumber`, `version`, `effectiveDate` | CLC cover |
| `status` | `draft` \| `in_review` \| `approved` \| `archived` |
| `preparedBy`, `reviewedBy`, `approvedBy`, `approvedAt` | Document control |
| `nextReviewAt` | Optional annual review target |
| `revisions` | Optional array — filled when FR-12 ships |

Leadership `SopConfig` sections include charter-only flags for Scope, Structure, Membership, Meetings.

## Acceptance criteria

- [x] AC-1: SOP edits persist (PostgreSQL / Prisma JSON)
- [x] AC-2: New SOP can start from Ministry charter (CLC) template with membership prefill
- [x] AC-3: Charter-only sections appear for charter template; task templates stay focused
- [x] AC-4: Status badge shows draft vs approved; only elevated roles can mark approved
- [ ] AC-5: Deleted SOP retained in audit log (when audit log ships)

## Open questions

- [ ] Required charter SOP per ministry type (youth safety, nursery)?
- [ ] Must Board Chair / Joint Board approve charters in-app, or is pastor/admin enough for Phase 1?
- [ ] Auto-assign document numbers (ministry slug + sequence)?
