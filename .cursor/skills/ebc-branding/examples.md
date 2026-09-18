# EBC branding examples

## Copy

**App heading**
- Yes: `This Sunday`
- No: `Upcoming service plans`

**Empty state**
- Yes: `No Sunday plan yet — check back or ask your director.`
- No: `No entities found. Create your first resource.`

**RSVP**
- Yes: `Can you make Sunday?` with full-width Yes / No cards
- No: `Submit attendance response`

**Public invite**
- Yes: `Join us Sunday at 9:45 AM in the Chapel. We're Marching to Zion! Watch live on YouTube if you cannot be there.`
- No: `Don't miss our exciting worship experience and community engagement opportunities!`

**Giving**
- Yes: `Give` → church give page / Realm. No dollar amounts in the caption.
- No: `We’ve raised $12,400 this week — donate now!`

**Welcome splash (already in app)**
- Kicker: church name (uppercase tracking)
- Display: `We're Marching to Zion!` in Blacksword + gold
- Support: `Putting the Family Back Together`
- Then the person’s name — not another slogan

## Color + class

Primary save / continue:

```tsx
<button type="submit" className="ebc-action-primary">
  Save
</button>
```

Secondary:

```tsx
<button type="button" className="ebc-action-secondary">
  Cancel
</button>
```

Section kicker + burgundy title:

```tsx
<p className="ebc-section-label">This week</p>
<h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Choir plan</h2>
```

Display flourish (short only):

```tsx
<h2 className="font-display text-2xl text-ebc-burgundy">Visitor follow-up</h2>
```

Give (public / church-life card, not every app button):

```tsx
<a className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ebc-green px-5 py-3 text-base font-semibold text-white hover:bg-ebc-green-dark">
  Give
</a>
```

Logo on a white header:

```tsx
import { LOGO_ALT, LOGO_URL } from '@/lib/church';

<Image src={LOGO_URL} alt={LOGO_ALT} width={160} height={48} className="h-8 w-auto" />
```

Do not place `LOGO_URL` on `bg-ebc-burgundy`. Use gold/white type on burgundy instead (see `WelcomeSplash`).

## Graphics / social still

1. Photo of this congregation (or solid burgundy if no photo).
2. Dark burgundy overlay if text sits on a photo.
3. One line of news + time/place. Optional theme line in gold script.
4. Official logo only if the remaining field is light; otherwise skip the color logo.
5. Same facts as the website and bulletin.
