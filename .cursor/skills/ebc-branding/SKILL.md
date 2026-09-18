---
name: ebc-branding
description: Apply Ebenezer Baptist Church (EBC, Woodbridge VA) visual identity, voice, and UI tokens. Use when designing, styling, writing copy, building UI, creating social/graphics, reviewing screens, or when the user mentions branding, brand, colors, logo, fonts, burgundy, gold, or church language.
---

# EBC branding

Ebenezer Baptist Church of Woodbridge, VA. Warm, family-centered, traditional Baptist with a modern public presence. Audience includes seniors and less tech-fluent volunteers. Clarity on a phone beats decorative polish.

Canonical app source: `docs/church/branding.md`. If this skill and the live CSS disagree, follow `src/styles/globals.css` + `tailwind.config.ts` and note the drift.

## Identity (do not rewrite)

| Field | Exact wording |
|-------|----------------|
| Full name | Ebenezer Baptist Church of Woodbridge, VA |
| Short name | Ebenezer Baptist Church |
| Mission | Putting the Family Back Together |
| Theme | We're Marching to Zion! |
| Scripture line | With God all things are possible |
| Website | https://ebenezerbc.org/ |
| YouTube | https://www.youtube.com/@EBCWoodbridgeVA |

Use mission/theme as **emphasis**, not wallpaper. One of them on a splash, empty state, or public invite is enough. Do not invent new taglines.

App constants: `CHURCH`, `LOGO_URL`, `LOGO_ALT` from `@/lib/church`.

## Voice

Warm, direct, congregational. Write like a church bulletin, not a SaaS product.

**Do**
- Church words people already use (Songs, Choirs, This Sunday, Give, Watch Live)
- Short sentences; one job per screen or caption
- Welcome guests; invite, don’t pressure
- Same Sunday time, event name, and date on every channel

**Don’t**
- Corporate / product jargon (`catalog`, `dashboard`, `users`, `optimize`, `leverage`, `sent`/`draft` as member-facing labels)
- Cute or ironic tone
- Stock “church clipart” energy
- Public copy that names giving amounts, prayer lists, illness, or anyone who did not consent

| Prefer | Avoid |
|--------|--------|
| Songs | Song catalog |
| My choirs / Choirs | Choir setup (unless managing setup) |
| Shared with choir | `sent` |
| Still drafting | `draft` |
| Can you make Sunday? | Your response / Attendance |
| New musician | Musician intake |
| This Sunday | Upcoming plans / Recently sent |
| People | Users / contacts |
| Give | Donate / checkout |

Public guest-facing worship time in Communications work: **Sunday 9:45 AM**. Staff-app weekly rhythm still shows **10:00 AM** until church docs are aligned — do not silently pick one; use the value already on that surface.

## Color

Use tokens, never raw hex in feature UI.

| Token | Hex | Role |
|-------|-----|------|
| `ebc-burgundy` | `#891619` | Primary fill, headings, key actions |
| `ebc-burgundy-dark` | `#781D24` | Hover / darker burgundy |
| `ebc-gold` | `#EBBF5F` | Theme line, decorative accents |
| `ebc-gold-bright` | `#FEB01C` | Small uppercase labels (`.ebc-section-label`) |
| `ebc-green` | `#527E4C` | **Give** only (website header pattern) |
| `ebc-green-dark` | `#376052` | Green hover / dark green fields |
| `ebc-navy` | `#003E60` | Links, dark panels, Watch Live |
| white / black | `#FFFFFF` / `#000000` | Surfaces and body |

App chrome: `bg-slate-50` page, `bg-white` cards, `text-slate-900` body, burgundy headings.

**Pairing rules**
- Primary button = burgundy fill + white text
- Secondary button = white fill + burgundy text + burgundy border
- Give (public site / giving CTA) = green fill + white text
- Guest highlight (NEW TO EBC pattern) = gold fill
- Gold is accent, not long-run body text on white (contrast)
- Do not introduce a fourth “brand” color (purple, orange, pink, generic blue)

Tailwind: `bg-ebc-burgundy`, `text-ebc-gold`, `font-display`, etc.

## Type

| Role | Face | Where |
|------|------|--------|
| UI / body | Roboto Condensed 300/400/700 | Nav, forms, tables, buttons, body |
| Display / script | Blacksword | Theme line, hub titles, empty-state flourish |
| Fallback | `system-ui`, sans-serif | If webfonts fail |

- App body **≥ 16px** (`text-base`)
- Blacksword: short phrases only — never paragraphs, never form labels
- Buttons: sentence or church title case in the **app**; website marketing buttons are often uppercase
- Headings: `font-bold text-ebc-burgundy`; display titles may use `font-display text-ebc-burgundy`

## Logo

| Use | File |
|-----|------|
| App / light backgrounds | `public/branding/ebc-official-logo.png` (`LOGO_URL`) |
| Dark / photo heroes (site) | White wordmark treatment — do not put the burgundy official PNG on a dark photo |

Artwork: gold cross, burgundy swoosh, “Ebenezer” script, “BAPTIST CHURCH” sans caps.

- Official file from church office only — no scraped / upscaled web copies in the app
- True PNG with alpha. JPEG saved as `.png` shows a black box
- Light header/sidebar: official color logo. Dark splash: type + gold, not the color logo
- Do not recolor, add drop shadows, or set it on burgundy
- Alt: `Ebenezer Baptist Church — cross, Ebenezer script, Baptist Church`

## UI building blocks (app)

Reuse these; don’t restyle one-off buttons.

| Class | Use |
|-------|-----|
| `.ebc-action-primary` | Main CTA — burgundy, `min-h-11`, full width on phone |
| `.ebc-action-secondary` | Secondary — outlined burgundy |
| `.ebc-action-quiet` | Tertiary |
| `.ebc-choice` + selected/idle | Large RSVP / yes-no rows |
| `.ebc-card` | White card, slate border, `rounded-xl` |
| `.ebc-section-label` | Tiny gold uppercase kicker |

Layout: phone first (~390px), one job above the fold, primary controls ≥ 44px, admin/setup never ahead of the member’s job. Loading / empty / error on every async view.

Cards on small screens; tables only as a wide-viewport extra.

## Surfaces outside the app

**Website / print / social**
- Hero: real congregation photography + burgundy overlay + white/script type
- Photography: authentic, multigenerational, this church family — not stock
- No kids in public posts without written parent/guardian consent
- Giving asks: link only, no amounts, no pressure copy
- Doctrine, crisis, politics, funerals, named illness → pastor approves before publish

**Color map for graphics**
- Burgundy field + gold type for worship invites
- Green only when the action is Give
- Gold rule / divider, not gold walls of text

## Workflow

When the task is UI, copy, graphics, or review:

1. Name the surface: app screen, public web, social, sign, print.
2. Pick **one** primary action and the matching color (burgundy / green Give / gold guest).
3. Use church words from the table; pull identity strings from `CHURCH` when coding.
4. Type: Roboto Condensed for function; Blacksword only for a short flourish.
5. Logo: official PNG on light; never on dark burgundy.
6. Check contrast, 44px targets, empty/error copy in plain language.
7. If you need a new color or font, **stop** — do not invent a brand extension.

## Done when

- [ ] Tokens or existing classes, not new hex
- [ ] Mission/theme used exactly or not at all
- [ ] Labels match church language
- [ ] Logo on a correct background
- [ ] Phone layout holds; primary control ≥ 44px
- [ ] No PII, giving amounts, or unconsented names in public copy

## Extra detail

- Before/after copy and class examples: [examples.md](examples.md)
- Source capture from the public site: `docs/church/branding.md`
