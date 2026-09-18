# Communications module — features

| Module | `src/modules/communications` |
| **Business source** | [Communications Ministry](../../../operations/communications.md) |
| **Phase** | 3 |

## Ministry home

Roster, duties, and SOPs live on the ministry record: `/ministries/communications-ministry`. This module owns the **AI Discover → Execute → Evaluate** loop and related messaging tools.

## Operating principle

**AI at the forefront** — Discover opportunities, Execute multi-channel drafts, Evaluate weekly outcomes. Humans approve; nothing auto-publishes. See ops: [communications.md](../../../operations/communications.md).

## Features

| Feature | Spec | Route |
|---------|------|-------|
| AI Discover → Execute → Evaluate | [ai-discover-execute-evaluate.md](ai-discover-execute-evaluate.md) | `/communications` |
| Announcement workflow | [announcement-workflow.md](announcement-workflow.md) | `/communications` (Execute packages + list) |

## Boundary

| This module | Media Ministry | Social module |
|-------------|----------------|---------------|
| Discover inbox, Execute drafts, Evaluate scorecard, announcement checklist | Slides, stream, capture assets | Accounts, calendar, publish APIs (consumes Execute social channel) |

## Open questions

- [ ] Email send via Resend/SendGrid or manual copy to church email?
- [ ] Shared `communications@` inbox vs churchadmin@ for ministry contact
- [ ] Discover cron cadence (hourly vs daily)
