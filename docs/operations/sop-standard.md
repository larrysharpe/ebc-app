# Ministry SOP standard (CLC)

Church-wide standard for ministry standard operating procedures, adopted from the **CLC Follow-up Church Meeting** (2026-06-30) SOP template.

**Source:** [Church Meeting CLC Follow-up - Final.pptx](../context%20stuff/Church%20Meeting%20CLC%20Follow-up%20-%20Final.pptx) (slides 15–20)

**Software:** [Ministry SOP editor](../engineering/requirements/features/ministries/ministry-sops.md) in EBC APP

## Why SOPs

SOPs give step-by-step instructions for ministry tasks and for how a ministry is organized. They:

- Keep activities consistent when volunteers or leaders change
- Clarify roles and accountability within church policy
- Improve internal communication
- Protect the ministry, empower people, and create operational consistency

Each SOP should be **reviewed at least annually** (or when leadership, policy, or operations change).

## Two document kinds

| Kind | Purpose | Typical count per ministry |
|------|---------|----------------------------|
| **Ministry charter** | How the ministry is organized — purpose, scope, structure, membership, meetings, core procedures, review | One (recommended) |
| **Task procedure** | How to run a specific recurring task (visit, AV Sunday, youth event, onboarding) | Many |

EBC APP supports both. The CLC paper template is the **charter** shape; task procedures use a lighter guided section set.

## Ministry charter outline (CLC)

### Cover / document control

| Field | Notes |
|-------|--------|
| Ministry name | Matches ministry registry |
| Document # | Optional church filing number |
| Effective date | When the approved version takes effect |
| Version # | e.g. `1.0`, `1.1` |
| Prepared by / date | Ministry leader or designee |
| Reviewed by / date | Reviewer before board sign-off |
| Approved by / date | Ministry leader + Board Chair / Joint Board |

### Body sections

| # | Section | Content |
|---|---------|---------|
| I | **Purpose** | Concise goals and objectives of the ministry |
| II | **Scope** | What and who the SOP covers; boundaries vs other ministries |
| III | **Structure** | Roles and duties & responsibilities (table or linked personnel roster) |
| IV | **Membership** | Positions limited to **active members of Ebenezer Baptist Church** unless Pastor grants an exception |
| V | **Meetings** | Type, frequency, location, time; schedule changes communicated at least **24 hours** in advance |
| VI | **Procedures** | Step-by-step operational tasks; each step names a responsible person/role |
| — | **Safety & contacts** | Required where minors, outreach, or emergencies apply (app extension of CLC) |
| VII | **Review and updates** | Amendments require an approved change request from the Ministry Leader, signed off by the **Joint Board**; keep a revision log (version, date, author, change) |

### Approval signatures (CLC)

- Ministry Leader — date
- Board Chair — date

In EBC APP, charter approval is recorded as status `approved` with approver metadata (electronic workflow; paper signatures optional via PDF attach later).

## Task procedure outline (app)

Used for day-to-day checklists. Guided sections:

Purpose · When to use · Who is responsible · Before you start · Step-by-step · After / follow-up · Safety & compliance · Contacts & escalation

Leadership manages templates and section guidance under `/leadership`.

## Ownership

| Role | Responsibility |
|------|----------------|
| **Ministry leader** | Draft and maintain charter + task SOPs for their ministry |
| **Pastor / administrator** | Church-wide templates, guidance, quality thresholds; approve safety-critical and charter SOPs |
| **Joint Board / Board Chair** | Sign-off on charter amendments (CLC); app maps to pastor/admin approval until board workflow is built |
| **Official Board** | Technological infrastructure for SOP storage (EBC APP) |

## Open items

- [ ] Confirm whether Board Chair / Joint Board must approve every charter in-app, or pastor/admin is sufficient for Phase 1
- [ ] Required charters for youth, nursery, and other safety-sensitive ministries
- [ ] Annual review reminders on the staff dashboard

Last reviewed: 2026-07-10
