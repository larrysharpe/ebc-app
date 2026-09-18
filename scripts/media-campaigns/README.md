# Media campaigns

One folder per church campaign. Inside each: **channel** (roadside sign vs social), then **output** ready to upload.

These are volunteer scripts (Python + ffmpeg). They are not part of the EBC APP website.

## What to upload

| Campaign | Channel | Upload this | Where it goes |
|----------|---------|-------------|---------------|
| **Fall Revival 2026** | VNNOX roadside sign | `2026-fall-revival/sign-roadside/output/1672x941/` (save-the-date loop) | VNNOX player — same size as Sunday Service |
| **Fall Revival 2026** | VNNOX night-of | `2026-fall-revival/sign-roadside/output/1672x941-nights/{tue-hargrove,wed-ball,thu-jones}/` | Swap the published solution each morning Oct 6–8 |
| **Fall Revival 2026** | Facebook / Instagram / YouTube | `2026-fall-revival/social-vertical/output/1080x1920/revival-reel-20.mp4` | YouTube Shorts, Facebook Reels, IG Reels |
| **Come As You Are** | VNNOX roadside sign | `2026-caya/sign-roadside/output/caya-sign-1672x941.mp4` | VNNOX loop (silent, people under type). Alternate: `caya-sign-1920x1080.mp4` |
| **Come As You Are** | Facebook Reels / YouTube Shorts | `2026-caya/social/output/1080x1920/caya-reel-15.mp4` | Same 15s file for both. Sunday 9:45 AM. |
| **Come As You Are** | Facebook feed | `2026-caya/social/output/1080x1080/` | Square stills + `captions.txt` |
| **Fall Fresh 2026** | Facebook / Instagram / YouTube | `2026-fall-fresh/promo/output/fall-fresh-reel-15.mp4` (and 30s cuts) | Social only — assembler still lives in `scripts/fall-fresh-promo/` |

Native 240 × 120 LED files sit next to the upload folders if you ever need board-pixel stills. The usual habit is the 1672 × 941 (or 1920 × 1080) file; VNNOX scales it down.

## Folder layout

```
scripts/media-campaigns/
  README.md                 ← you are here
  _shared/                  ← official logo + brand notes
  2026-fall-revival/
    sign-roadside/          ← VNNOX stills
    social-vertical/        ← 1080×1920 cards + reel
  2026-caya/
    sign-roadside/          ← 15s welcome loop
    social/                 ← Reels / Shorts / Facebook stills
    source/youtube/clips/   ← cuts from EBC livestreams
  2026-fall-fresh/
    promo → ../../fall-fresh-promo   ← link only; do not move that tree
```

## Rebuild

From each channel folder:

```bash
./run.sh build
```

| Campaign | Folder to run from |
|----------|--------------------|
| Fall Revival sign | `scripts/media-campaigns/2026-fall-revival/sign-roadside/` |
| Fall Revival social | `scripts/media-campaigns/2026-fall-revival/social-vertical/` |
| Come As You Are sign | `scripts/media-campaigns/2026-caya/sign-roadside/` |
| Come As You Are social | `scripts/media-campaigns/2026-caya/social/` |
| Fall Fresh videos | `scripts/fall-fresh-promo/` (or `2026-fall-fresh/promo/`) |

Needs Python 3 and, for video, `ffmpeg`. First run creates a local `.venv`.

## Adding a new campaign

1. Create `YYYY-short-name/`.
2. Add a channel folder (`sign-roadside/`, `social-vertical/`, …) with its own `run.sh`, `output/`, and `.gitignore` (ignore `output/` and `.venv/`).
3. Add a row to the table above.
4. Keep generators and outputs in the same folder so a rebuild does not dump files in two places.
