# Fall Revival 2026 — digital sign (VNNOX)

Home: `scripts/media-campaigns/2026-fall-revival/sign-roadside/`

Roadside LED slides for Ebenezer’s Fall Revival. The sign is small and
hard to read from the street, so this is a **rotating playlist**, not one
crowded flyer.

Each slide is two or three words, hard-edged type, black background.

## Playlist (6 seconds each)

1. SAVE THE DATE / FALL REVIVAL / OCT 6-8 / 7:00 PM
2. TUE OCT 6 / REV. SHOMARI HARGROVE
3. WED OCT 7 / REV. DR. MARQUEZ BALL
4. THU OCT 8 / REV. KENNARD JONES

Then the loop starts over.

Home churches and full first names stay off the sign — they will not read
from the road. Put those on the bulletin and social posts.

## Build

```bash
./run.sh build
```

One known size:

```bash
./run.sh build --size 64x32
```

## Put it on the sign

Upload the **1672 × 941** set — same size as Sunday Service and Pastor Lundy
in VNNOX. The player will scale it to the 240 × 120 board.

`output/1672x941/` — four PNGs or `playlist.mp4`

Night-of (during the event, not save-the-date):

`output/1672x941-nights/`

- `tue-hargrove/` — TONIGHT + Rev. Shomari Hargrove, 7:00 PM
- `wed-ball/` — TONIGHT + Rev. Dr. Marquez Ball, 7:00 PM
- `thu-jones/` — TONIGHT + Rev. Kennard Jones, 7:00 PM

Two stills per night (loop them) or upload that folder’s `playlist.mp4`.

Native 240 × 120 block type is still in `output/240x120/` if you need it.

## How to swap (leave save-the-date up until the week of)

Keep the **1672×941 save-the-date loop** published until **Tuesday morning, Oct 6**.

Then swap the published solution (or playlist) on the player:

| When | Play this |
| --- | --- |
| Until Tue Oct 6 morning | `output/1672x941/` (save-the-date + speakers) |
| Tue Oct 6 morning through that night | `1672x941-nights/tue-hargrove/` |
| Wed Oct 7 morning through that night | `1672x941-nights/wed-ball/` |
| Thu Oct 8 morning through that night | `1672x941-nights/thu-jones/` |
| After Thu night | Back to Sunday Service / usual content |

In VNNOX: Media → new solution named like `tue-hargrove` → add the two PNGs (6 seconds each) or the MP4 → **Publish** to the roadside player. Repeat the next morning with the next folder.

Do **not** count on a leftover/default solution filling the gaps unless you are on **VNNOX AD** (see below). On **VNNOX Standard** (`us.vnnox.com` for most US church accounts), the reliable volunteer pattern is this morning swap.

### If you want the calendar to switch it (Standard)

VNNOX Standard has **no idle/default solution**. A **schedule** is a calendar of time boxes. You must fill leftover hours yourself.

1. Create four solutions: save-the-date, `tue-hargrove`, `wed-ball`, `thu-jones`.
2. **Schedule** → New schedule → **Add Solution** for each of those four.
3. Calendar view → add time frames:
   - Save-the-date: Repeat **Every day**, 00:00–24:00.
   - Tuesday night: 18:00–22:00 on Oct 6. Repeat **Never** only works if the date is **today or the next 7 days**. Before then, use **Every year** (Oct 6) or wait until the week of.
   - Wednesday 18:00–22:00 Oct 7; Thursday 18:00–22:00 Oct 8. Same Repeat rule.
4. Drag the night time boxes **left** so they sit on top of the all-day box (left = higher priority when times overlap).
5. **Publish** the schedule to the player.

### If the account is VNNOX AD

AD can set **Non-Scheduled Content** (one image or video) on the player. That plays in empty timeslots. Use `1672x941/playlist.mp4` as that leftover, then schedule the three night solutions 18:00–22:00. **VNNOX Care** is monitoring only — it does not publish content.

## Later — Come As You Are (video)

The board plays video (VBS slideshow, car-show ad). Fall Revival stays
stills. Next motion set: **Come As You Are** — animated text, built in
Envato the way past sign videos were made. Keep type huge; 240 × 120
still has to read from the road.

## Optional time slide

If nights start at a set hour, set this in `config.py` and rebuild:

```python
SERVICE_TIME = "7 PM"
```
