# Branding — Ebenezer Baptist Church

Visual identity captured from [ebenezerbc.org](https://ebenezerbc.org/) for consistent use in EBC APP and church materials.

| Field | Value |
|-------|-------|
| **Source** | https://ebenezerbc.org/ |
| **Theme** | Kadence child + My Church Website Design custom CSS |
| **Last captured** | 2026-07-03 |

---

## Brand voice (from site)

| Element | Usage on site |
|---------|----------------|
| **Theme line** | We're Marching to Zion! |
| **Mission** | Putting the Family Back Together |
| **Tone** | Warm, family-centered, traditional Baptist with modern web presence |
| **Hero CTA** | NEW TO EBC? |
| **Primary actions** | Give · Watch Live · Menu |

---

## Logo

| Asset | Location |
|-------|----------|
| **Official logo (app)** | `public/branding/ebc-official-logo.png` — RGBA PNG (transparent background); burgundy & gold artwork |
| **Website header logo** | https://ebenezerbc.org/wp-content/uploads/logo-eb.png (white treatment for dark hero) |
| **Favicon (legacy web)** | https://ebenezerbc.org/wp-content/uploads/cropped-logo-eb-32x32.png |

### Official logo (staff app)

- Gold stylized **cross** with burgundy swoosh arc
- **Ebenezer** in burgundy script
- **BAPTIST CHURCH** in burgundy uppercase sans-serif
- Use on **white or light** backgrounds (header, sidebar white panel)
- Source file provided by church office — do not substitute web-scraped variants in the app
- If replacing the file, use a **true PNG with alpha** (not JPEG saved as `.png` — that loses transparency and shows a black box)

### Website logo (reference)

- White cross and wordmark for **dark / photo / burgundy** hero backgrounds on ebenezerbc.org

> Use official logo files from church office for print and app store assets — do not upscale low-res web copies.

---

## Color palette

Colors extracted from `kadence-child` theme CSS (`style.css`, `design.css`, `backfront-custom.css`).

### Primary

| Name | Hex | Usage on website |
|------|-----|------------------|
| **Burgundy** | `#891619` | Menu button, hero overlay, primary buttons, accent borders, headings |
| **Burgundy dark** | `#781D24` / `#881A23` / `#8A1619` | Button borders, hover states, text accents |
| **Burgundy bright** | `#B91C20` / `#CC4848` | Secondary red accents |

### Secondary

| Name | Hex | Usage on website |
|------|-----|------------------|
| **Gold** | `#EBBF5F` | NEW TO EBC button, decorative borders, Give menu accent |
| **Gold bright** | `#FEB01C` | Heading accents (e.g. “HAPPENING”) |

### Accent

| Name | Hex | Usage on website |
|------|-----|------------------|
| **Olive green** | `#527E4C` | **Give** button (header) |
| **Forest green** | `#376052` | Green section backgrounds |
| **Light green** | `#7CBC8C` | Hover / secondary green states |
| **Teal / navy** | `#003E60` | Link and text accents |
| **Cyan** | `#13A3C4` | Secondary link color |

### Neutrals

| Name | Hex | Usage |
|------|-----|--------|
| **White** | `#FFFFFF` | Backgrounds, text on dark |
| **Black** | `#000000` | Body text, outline buttons |

### Suggested EBC APP tokens

For engineering UI (Tailwind / CSS variables):

```css
:root {
  --ebc-burgundy: #891619;
  --ebc-burgundy-dark: #781D24;
  --ebc-gold: #EBBF5F;
  --ebc-gold-bright: #FEB01C;
  --ebc-green: #527E4C;
  --ebc-green-dark: #376052;
  --ebc-navy: #003E60;
  --ebc-white: #FFFFFF;
  --ebc-black: #000000;

  --ebc-font-display: 'Blacksword', cursive;
  --ebc-font-body: 'Roboto Condensed', sans-serif;
}
```

Confirm final tokens with church leadership before production UI.

---

## Typography

| Role | Font | Weights | Usage |
|------|------|---------|--------|
| **Display / script** | [Blacksword](https://fonts.cdnfonts.com/css/blacksword) | — | Logo wordmark, hero emphasis (“Zion!”, “What's”), decorative headings |
| **Body / UI** | [Roboto Condensed](https://fonts.google.com/specimen/Roboto+Condensed) | 300, 400, 700 | Navigation, buttons, body copy, schedules |
| **Icons** | Font Awesome 5 Pro | — | UI icons on site |

### Type patterns on site

- **Hero:** Large sans-serif headline + script accent word in gold
- **Section titles:** Script first word + gold uppercase sans second word (e.g. What's **HAPPENING**)
- **Buttons:** Uppercase sans-serif, bold; outlined black or filled burgundy/gold/green
- **Body:** ~15px on content modules; clean and readable

### EBC APP guidance

- Use **Roboto Condensed** for all functional UI (tables, forms, nav) — accessibility first
- Reserve **Blacksword** for marketing headers and empty states — not long paragraphs
- Minimum body size 16px in app (site often uses 15px; app can improve readability)

---

## UI patterns (website)

| Pattern | Description |
|---------|-------------|
| **Header** | Logo left; Give (green) + Menu (burgundy) right; sticky on scroll |
| **Hero carousel** | Full-width photography + burgundy gradient overlay + white/script text |
| **CTA buttons** | Gold fill (NEW TO EBC), green fill (Give), burgundy fill (Menu) |
| **Content sections** | White background; burgundy + gold heading treatment |
| **Cards** | Announcement grid with images; burgundy outline on “Read more” |
| **Footer** | Quick links, weekly times, contact block, social icons |

---

## Photography & imagery

- Hero and welcome slides: congregation, worship, community life
- Warm, people-centered photography with dark overlay for text contrast
- No stock branding guide published — match tone: authentic, multigenerational, African American church family

---

## Digital brand touchpoints

| Touchpoint | Brand note |
|------------|------------|
| Website | Primary public brand expression |
| YouTube | [@EBCWoodbridgeVA](https://www.youtube.com/@EBCWoodbridgeVA) — video thumbnails follow church events |
| Realm Connect app | “Connect – Our Church Community” — Apple/Google |
| Online giving | Burgundy/green CTA culture; secure giving messaging |

---

## Engineering reference

When EBC APP UI is built, align with:

- [Coding standards](../engineering/standards/coding.md) — design tokens in `src/styles/`, not hardcoded hex in features
- [Project structure](../engineering/standards/project-structure.md) — shared `components/ui` uses brand tokens

## Open items

- [ ] Official brand guide PDF from church (if one exists beyond website)
- [ ] Logo vector (.svg / .ai) from church office
- [ ] Confirm whether Blacksword is licensed for app embedding (CDN vs self-hosted)
- [ ] Social profile avatar / cover image standards
