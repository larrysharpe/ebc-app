# Social & outreach flows

User and system flows for the `social` module. Pair with individual feature specs.

## Flow 1 — Connect a social account

```mermaid
flowchart TD
    A[Social manager opens /social] --> B{Account connected?}
    B -->|No| C[Click Connect platform]
    C --> D[OAuth to Meta / YouTube / etc.]
    D --> E{Authorized?}
    E -->|Yes| F[Store encrypted token]
    F --> G[Show account health + permissions]
    E -->|No| H[Show error — retry or contact admin]
    B -->|Yes| G
    G --> I[Ready to schedule posts]
```

## Flow 2 — Create and publish a post

```mermaid
flowchart TD
    A[Start: blank or from suggestion] --> B[Write caption + attach media]
    B --> C[Select platforms + date/time]
    C --> D{Sensitive topic?}
    D -->|Yes| E[Submit for pastor approval]
    E --> F{Approved?}
    F -->|No| G[Return to draft with feedback]
    F -->|Yes| H[Schedule or publish now]
    D -->|No| H
    H --> I[Call platform API]
    I --> J{Success?}
    J -->|Yes| K[Log post URL + mark published]
    J -->|No| L[Show error + retry queue]
```

**Sensitive topics:** politics, tragedy, doctrine disputes, member photos without release — configurable list.

## Flow 3 — Content suggestions (what to create & when)

```mermaid
flowchart TD
    subgraph triggers [Daily job / on calendar change]
        T1[Church event in 7-14 days]
        T2[Worship this Sunday — Thu-Sat window]
        T3[New sermon on YouTube]
        T4[No post in 5+ days]
        T5[Seasonal template — Easter, VBS, etc.]
    end

    triggers --> G[Suggestion engine]
    G --> H[Build draft: copy + media hint + best time]
    H --> I[Queue in Content suggestions inbox]
    I --> J[Social manager reviews]
    J --> K{Action}
    K -->|Use| L[Open post composer pre-filled]
    K -->|Dismiss| M[Mark dismissed + reason]
    K -->|Snooze| N[Remind later]
    L --> Flow2[Flow 2 — publish]
```

Suggestion sources (MVP → later):

| Source | MVP | Later |
|--------|-----|-------|
| EBC [events calendar](../events/church-calendar.md) | ✓ | |
| [Recurring worship](../events/recurring-worship-schedule.md) | ✓ | |
| [Announcements](../communications/announcement-workflow.md) | ✓ | |
| YouTube new upload | | API poll |
| AI copy refinement | | Optional, pastor-approved |

## Flow 4 — Community event discovery → outreach

```mermaid
flowchart TD
    A[Scheduled ingest job] --> B[Fetch from sources]
    B --> C[Normalize CommunityEvent records]
    C --> D[Score relevance for EBC]
    D --> E[Surface ranked list /social/community-events]
    E --> F[Missionary or outreach lead reviews]
    F --> G{Decision}
    G -->|Promote outreach| H[Create OutreachPlan]
    H --> I[Assign ministry + volunteers]
    I --> J[Add to church calendar optional]
    J --> K[Optional: draft social post Flow 2]
    G -->|Dismiss| L[Hide + reason]
    G -->|Save watch| M[Monitor list]
```

## Flow 5 — Suggestion → community event link

When a **church** event and **community** event align (same weekend, shared theme):

```mermaid
flowchart LR
    CE[Community event: back-to-school fair] --> S[Suggestion: table + invite cards]
    CH[EBC event: VBS nearby dates] --> S
    S --> P[Combined outreach post draft]
```

## Role touchpoints

| Step | Typical role |
|------|----------------|
| Connect accounts | Communications Ministry, admin |
| Review suggestions | Communications (social publisher), Media (assets) |
| Approve sensitive posts | pastor |
| Approve community outreach | missionary lead, pastor |
| Staff event table | missionary volunteers |
