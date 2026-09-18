# Come As You Are — roadside VNNOX loop

Home: `scripts/media-campaigns/2026-caya/sign-roadside/`

Short silent motion-text loop for Ebenezer’s LED sign. Same job as the
VBS slideshow (10s) and Car Show Ad (15s): huge type a driver can read
in one glance.

Revival stills stay in `scripts/media-campaigns/2026-fall-revival/sign-roadside/`. This folder is
video only.

## Copy in this first pass

Nothing in the repo dated CAYA or named a theme verse. This loop is a
**weekly welcome**, not a dated campaign.

| Beat | Seconds | Type |
|------|---------|------|
| COME / AS YOU ARE | 4.0 | Gold + white |
| ALL ARE / WELCOME | 4.0 | White + gold — already used on revival social cards |
| SUNDAY / 9:45 AM | 3.5 | Confirmed board time |
| EBENEZERBC.ORG | 3.5 | Gold |

**15 seconds total.** Logo off. No QR (LED bloom; unreadable from the road).
Website is type, same as the revival stills.

People B-roll sits under the type on the large files (greeting, worship,
choir). Stock, not EBC members — see `PEOPLE.md`. Native 240×120 stays
type-only.

### Sunday time

The board says **9:45 AM** (same as the Sunday Service VNNOX graphic).
`docs/church/profile.md` and events still list 10:00 AM — update those
docs if worship actually starts at 9:45.

## Build

```bash
cd "scripts/media-campaigns/2026-caya/sign-roadside"
./run.sh build
```

Needs Python 3, Pillow (venv via `run.sh`), and `ffmpeg`.

```bash
./run.sh setup
./run.sh fetch-people           # licensed Pexels church-family clips
./run.sh build --size upload    # 1672×941 stills habit (MP4 padded to even 942)
./run.sh build --size hd        # 1920×1080 — same as the car-show ad
./run.sh build --size native    # 240×120 snap-cut block type
```

### Outputs

| File | Use |
|------|-----|
| `output/caya-sign-1672x941.mp4` | **Upload this** — same size family as Sunday Service / Pastor Lundy |
| `output/caya-sign-1920x1080.mp4` | Alternate, matches the car-show upload |
| `output/caya-sign-240x120.mp4` | Native board pixels (hard-edged, no fade) |
| `output/stills/` | One hold PNG per beat, for review or Envato reference |
| `output/preview.html` | Watch the loops in a browser |

VNNOX will scale the large file down to the 240 × 120 board. Keep the
words this short or they die from the road.

Edit beats, colors, or `SHOW_LOGO` in `config.py`. Official logo paths
checked: `public/branding/ebc-official-logo.png` and
`scripts/media-campaigns/_shared/`. Logo stays **off** the native
240×120 file even if you turn it on for the large upload.

## Put it on the sign

1. Upload `caya-sign-1672x941.mp4` (or the 1920×1080 file) to VNNOX.
2. Loop it. No audio on purpose — roadside board.
3. Do not add a QR.

## Later — swap in an Envato After Effects template

Past church sign videos were Envato templates. This ffmpeg loop is the
stand-in so there is something to watch now. When you pick a template:

**Search for:** kinetic typography, church opener, or “big text slideshow”
that is **10–20 seconds**, 2–4 phrases, full-screen type. Avoid templates
with six lines of body copy, lower-thirds, or a QR end card.

**Replace these layers**

| Layer / control | Put this |
|-----------------|----------|
| Headline 1 | COME AS YOU ARE |
| Headline 2 | ALL ARE WELCOME |
| Headline 3 | SUNDAY 9:45 AM |
| Headline 4 / end | EBENEZERBC.ORG |
| Logo | Leave off, or a small gold lockup — never instead of the website |
| QR / social icons | Delete |

**Recolor**

| Token | Hex |
|-------|-----|
| Burgundy | `#891619` |
| Gold (bright) | `#FEB01C` |
| Gold (soft) | `#EBBF5F` |
| Type | White on burgundy, or gold on burgundy |

**Duration & export**

- Comp length **15 seconds** (or 10s if you drop the time beat).
- Loop cleanly — last frame should cut or dissolve into the first.
- Export **H.264 MP4**, **no audio**, `yuv420p`.
- Size: **1672 × 941** (Sunday Service habit) or **1920 × 1080** (car-show habit).
  After Effects needs even axes for H.264 — **1672 × 942** is fine if 941 is rejected.
- Do not export 240 × 120 from AE unless the type is block-heavy; the
  large file is what they have been uploading.

Drop the exported MP4 into `output/` (or replace the ffmpeg file) and
upload it the same way as VBS / Car Show.

## Open questions

1. Is CAYA a **standing weekly welcome** on the board, or a **dated campaign**? If dated, what are the dates?
2. Is there a **theme verse** that should be on the sign? None is in the repo; a verse will only work if it is two or three huge words.
3. Church profile/events still say **10:00 AM**. Board now says **9:45 AM**. Update the docs if 9:45 is the real start.
