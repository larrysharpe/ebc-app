# UX Standards — Mobile-first & easy for everyone

Product and UI conventions for EBC APP. **Apply on every UI change.** Goal: seniors and less tech-fluent volunteers can use the app on a phone without training.

Related: [coding](coding.md) · [project structure](project-structure.md) · [vision](../vision.md)

## Dual mandate

1. **Mobile-first** — Design the phone layout first; desktop is an enhancement, not the default.
2. **Plain & large** — Church words, one primary job per screen, targets seniors can tap comfortably.

When those conflict, prefer **clarity on a small screen** over denser desktop layouts.

## Core principles

### 1. One job above the fold
Every hub and detail landing answers the user’s real question first:

| Area | First question |
|------|----------------|
| Home | What needs attention this week? |
| Music | What are we doing this Sunday — and can you be there? |
| Ministry | What needs attention for my team? |
| Events | What’s coming up? |
| People | Find someone |

Admin tools (setup, people assignment, settings, AI coaches) never compete with that primary job.

### 2. Mobile-first layout
- **Single column by default** — Stack sections vertically; use multi-column only at `lg+` when it helps scanning.
- **No horizontal tables as the only view** — Prefer cards on small screens; tables are an enhancement for wide viewports.
- **Full-width primary actions** on phone (`w-full sm:w-auto`) for the main CTA.
- **Avoid chip soup** — Don’t wrap 6–8 equal nav pills at the top of a hub; use one primary CTA + a short secondary list.
- **Thumb-friendly** — Sticky or bottom-reachable actions when a flow needs a decisive save (RSVP, submit).
- **Test at ~390px width** before signing off a screen.

### 3. Words people already use
| Prefer | Avoid |
|--------|--------|
| Songs | Song catalog |
| My choirs / Choirs | Choir setup (unless managing setup) |
| Shared with choir | `sent` |
| Still drafting | `draft` |
| Can you make Sunday? | Your response / Attendance |
| New musician | Musician intake |
| This Sunday | Upcoming plans / Recently sent |

Use the same label in sidebar, hub, and page title.

### 4. Large, obvious controls
- Primary actions: at least **44px** tall (`min-h-11`), **`text-base`**, clear burgundy/green fill.
- Use shared classes: `ebc-action-primary`, `ebc-action-secondary`, `ebc-choice`.
- Don’t rely on tiny `text-[10px]` badges for critical info.
- Radio/choice rows for RSVP-style decisions should be full-width cards, not tiny radios.

### 5. Shallow paths
- Ideal: **hub → one tap → do the job**.
- Don’t bury RSVP / confirm under long content; put it first or sticky.
- Empty states say what to do next in plain language (“No Sunday plan yet — check back or ask your director”).

### 6. Progressive disclosure
- Show the job; collapse comments, advanced fields, and admin under “More” / Manage.
- Role-aware nav: members see daily jobs; setup tools appear only for roles that need them.

### 7. Information architecture
- **Sidebar** — Job links first; Manage/setup last.
- **Hubs** — Primary card → supporting lists → tools.
- **One source of truth** for module nav labels (sidebar + hub share constants / builders).

## Shared UI building blocks

| Class / pattern | Use |
|-----------------|-----|
| `.ebc-action-primary` | Main CTA (Save, Practice, Add) |
| `.ebc-action-secondary` | Secondary CTA |
| `.ebc-choice` | Large selectable option (RSVP yes/no) |
| `.ebc-card` | Content card |
| Next-up / job card | Full-width card with title, date, 1–2 large buttons |

## Checklist (UI PRs)

- [ ] Phone layout designed first; no critical info only in desktop tables
- [ ] One clear primary action above the fold
- [ ] Labels match church language (see table)
- [ ] Primary controls ≥ 44px / `text-base`
- [ ] Admin/setup not ahead of the user’s job
- [ ] Empty / error / loading states present
- [ ] Sidebar and page titles use the same words

## Out of scope for “extra polish”

Don’t prioritize decorative motion, dense dashboards, or desktop-only power tools over the checklist above.
