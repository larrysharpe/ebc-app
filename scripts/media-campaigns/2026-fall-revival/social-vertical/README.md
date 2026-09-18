# Fall Revival 2026 — Shorts / Reels

Home: `scripts/media-campaigns/2026-fall-revival/social-vertical/`

Vertical 9:16 cards and a 20-second stills reel for Ebenezer Baptist Church.
Script-only (Python + ffmpeg). Not an app feature.

## Facts used (do not invent a time)

- **SAVE THE DATE / FALL REVIVAL**
- Tue Oct 6, 2026 — Rev. Shomari Hargrove (First Baptist Church – Merrifield, VA)
- Wed Oct 7, 7:00 PM — Rev. Dr. Marquez Ball (Uplift Church – Hyattsville, MD)
- Thu Oct 8 — Rev. Kennard Jones (First Baptist Church – Vienna, VA)
- Website: ebenezerbc.org
- Brand: burgundy `#891619`, gold `#FEB01C` / `#EBBF5F`
- No QR codes. Website as text.

## Build

```bash
./run.sh build
```

`output/1080x1920/` — seven PNGs + `revival-reel-20.mp4`

Backgrounds and logo come from `../sign-roadside/assets/` (or `_shared/`) on first build.

## Why there is no YouTube sermon cut

Download works (same `yt-dlp` pattern as `scripts/fall-fresh-promo/`, linked from `2026-fall-fresh/promo`). It is still the wrong source:

- Sunday archives and 2025 revival nights are **640×360**. Cropped to 9:16 they look soft.
- Today’s livestream (Aug 23, 2026) was **1080p while live**. Use Media’s local file if they kept it — not the 360p archive.
- Last year’s revival clip is a **guest in the pulpit**. Posting it for 2026 names the wrong preacher.

Use the stills reel now. Film new vertical clips next Sunday (see shot list below).

## Shot list / hook scripts (15–30s)

Plain church language. No slang. One idea per clip.

1. **Three nights** — Text on screen: “Three nights. Three preachers. One church family.” Then Oct 6–8 and the website. Film: empty center aisle, then congregation standing.
2. **Tuesday** — “Tuesday, October 6. Rev. Shomari Hargrove. First Baptist Church, Merrifield.” Hold 4 seconds. End card.
3. **Wednesday** — Same form for Rev. Marquez Ball, Uplift Church, Hyattsville.
4. **Thursday** — Same form for Rev. Kennard Jones, First Baptist Church, Vienna.
5. **Pastor invite** — Pastor (or First Lady) looks at the phone, not the livestream camera: “Fall Revival is October 6, 7, and 8. Come worship with us. All are welcome.” End card with ebenezerbc.org.
6. **Choir swell** — 8–12 seconds of singing, then cut to the end card. No lyric captions unless Media has the rights.

Caption for every post (copy/paste):

> Fall Revival | October 6–8
> Rev. Shomari Hargrove · Rev. Marquez Ball · Rev. Kennard Jones
> All are welcome. Ebenezer Baptist Church, Woodbridge, VA
> ebenezerbc.org

Do not add a clock time until the office confirms it.

## What to film next Sunday

Phone **vertical** (hold it tall). 1080p if the phone allows. Stay out of the livestream camera’s way.

| Clip | Length | Shot |
|------|--------|------|
| Aisle walk | 8s | Walk the center aisle toward the cross. No talking. |
| Choir | 10s | Faces and hands, not a wide blurry balcony shot. |
| Welcome | 8s | Greeter at the Chapel door. Ask before filming. |
| Pastor to camera | 12s | Hook script 5, arm’s length, quiet hallway or chapel front. |
| Bulletin | 5s | Hands holding the Fall Revival announcement. |

Do not film children unless you have photo consent. Keep giving plates and donation talk off these clips.

## Posting — exact next step

### YouTube Shorts

1. Open [YouTube Studio](https://studio.youtube.com) on the **EBC Woodbridge, VA** channel (`@EBCWoodbridgeVA`).
2. **Create → Upload videos**.
3. Upload `output/1080x1920/revival-reel-20.mp4`.
4. Title: `Fall Revival | October 6–8 | Ebenezer Baptist Church`
5. Paste the caption above. Add `ebenezerbc.org` in the description.
6. Custom thumbnail: `01-save-the-date.png` (YouTube may letterbox a 9:16 still — that is fine).
7. Visibility: Public. Publish. It becomes a Short because it is vertical and under 60 seconds.

Then upload the three speaker stills as a **community post** or as the cover image on follow-up Shorts (hooks 2–4) once you have Sunday footage.

### Facebook Reels

1. Open the church Facebook Page (confirm the URL with the office — it is still TBD in `docs/operations/social-media-community.md`).
2. **Create reel**.
3. Upload the same `revival-reel-20.mp4`.
4. Cover frame: first card (Save the Date).
5. Paste the same caption. Link: `https://ebenezerbc.org/`
6. Share to the Page feed.

Also post a **photo album** of the seven PNGs. Event graphics often get more shares as photos than as a silent reel.

Pastor or Communications should approve before anything with guest names goes public.
