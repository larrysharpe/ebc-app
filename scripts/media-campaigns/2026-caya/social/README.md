# Come As You Are — Facebook + YouTube Shorts

Home: `scripts/media-campaigns/2026-caya/social/`

Same welcome language as the roadside loop. Footage is **Ebenezer’s
own Sunday livestream** (August 16, 2026 archive), not stock.

## What to upload

| File | Where |
|------|--------|
| `output/1080x1920/caya-reel-15.mp4` | **Facebook Reels** and **YouTube Shorts** (same 15s file) |
| `output/1080x1080/*.png` | Facebook **feed** posts (one still per beat, or the first) |
| `output/1080x1920/*.png` | Facebook Stories / a still if the reel is not ready |
| `output/captions.txt` | Caption for every post |
| `output/shorts-title.txt` | YouTube Shorts title |

Sunday time is **9:45 AM**. No QR. Website is type.

## Footage (honest)

YouTube archives are **640×360**. Today’s stream (Aug 23) was not
downloadable yet. These cuts are from last Sunday, after the countdown
slides:

| Clip | What you see |
|------|----------------|
| `ebc-congregation.mp4` | Chapel pews — Sunday clothes and everyday clothes |
| `ebc-choir.mp4` | Praise team, white and khaki |
| `ebc-speaker.mp4` | Welcome from the floor, casual shirt |
| `ebc-pastor.mp4` | Pastor Lundy at the pulpit |

360p cropped to 9:16 is soft. The burgundy veil and huge type are there
on purpose. Next Sunday, film these same moments **vertical on a phone**
and drop the files in `source/youtube/clips/` to replace them.

Do not post close-ups of children. Giving plates and Cash App slides
were left out.

## Build

```bash
cd "scripts/media-campaigns/2026-caya/social"
./run.sh build
```

## Posting

**YouTube Shorts** — Studio → Create → Upload `caya-reel-15.mp4`.
Title from `shorts-title.txt`. Paste `captions.txt`.

**Facebook Reel** — same MP4. Same caption.

**Facebook feed** — upload `1080x1080/01-come-as-you-are.png` (or all
four as a short album). Same caption. Do not post the whole August
announcements deck.

Caption:

```
Come As You Are.

Sunday worship 9:45 AM
All are welcome.

Ebenezer Baptist Church
Woodbridge, VA
ebenezerbc.org
```
