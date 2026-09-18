"""Come As You Are — roadside VNNOX motion loop.

Copy is welcome language only. No campaign date was found in the repo.
Sunday time on the board is 9:45 AM (confirmed). Profile/events docs
still list 10:00 AM — update those separately if worship really starts
at 9:45.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORK_DIR = ROOT / "work"
OUTPUT_DIR = ROOT / "output"
ASSETS_DIR = ROOT / "assets"
PEOPLE_DIR = ROOT / "source" / "people"
CAMPAIGNS_DIR = ROOT.parent.parent

# Brand — docs/church/branding.md
BURGUNDY = (137, 22, 25)  # #891619
GOLD = (254, 176, 28)  # #FEB01C
GOLD_SOFT = (235, 191, 95)  # #EBBF5F
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

WEBSITE = "EBENEZERBC.ORG"
FPS = 30

# Board time confirmed 9:45 (matches the Sunday Service VNNOX graphic).
# docs/church/profile.md and events.md still say 10:00 AM.
SHOW_SUNDAY_TIME = True
SUNDAY_TIME_LINES = ("SUNDAY", "9:45 AM")

# Revival stills left the logo off and used the website as type.
# Default matches that. Logo is optional and stays off the 240×120 board.
SHOW_LOGO = False
LOGO_CANDIDATES = (
    CAMPAIGNS_DIR.parent.parent / "public" / "branding" / "ebc-official-logo.png",
    CAMPAIGNS_DIR / "_shared" / "ebc-official-logo.png",
    CAMPAIGNS_DIR / "2026-fall-revival" / "sign-roadside" / "assets" / "ebc-official-logo.png",
    ASSETS_DIR / "ebc-official-logo.png",
)

# Primary upload size matches Sunday Service / Pastor Lundy stills.
# 941 is odd; H.264 yuv420p needs even axes, so the MP4 is padded to 942.
UPLOAD_SIZE = (1672, 941)
HD_SIZE = (1920, 1080)
NATIVE_SIZE = (240, 120)

# Kinetic type on the large files. Native LED uses snap cuts + hard edges.
RENDER_SIZES: tuple[tuple[str, tuple[int, int], str], ...] = (
    ("upload", UPLOAD_SIZE, "kinetic"),
    ("native", NATIVE_SIZE, "led"),
)
SCALE_FROM_UPLOAD: tuple[tuple[str, tuple[int, int]], ...] = (
    ("hd", HD_SIZE),
)

# Two-line stacks so type can stay huge on a 2:1 ribbon.
# "ALL ARE WELCOME" is existing church language (revival social cards).
# No theme verse or campaign date was in the repo — do not invent one.
BEATS: tuple[dict[str, object], ...] = (
    {
        "id": "01-come-as-you-are",
        "kind": "welcome",
        "seconds": 4.0,
        "lines": (("COME", GOLD), ("AS YOU ARE", WHITE)),
    },
    {
        "id": "02-all-are-welcome",
        "kind": "welcome",
        "seconds": 4.0,
        "lines": (("ALL ARE", WHITE), ("WELCOME", GOLD)),
    },
    {
        "id": "03-sunday",
        "kind": "time",
        "seconds": 3.5,
        "lines": ((SUNDAY_TIME_LINES[0], GOLD), (SUNDAY_TIME_LINES[1], WHITE)),
    },
    {
        "id": "04-website",
        "kind": "web",
        "seconds": 3.5,
        "lines": ((WEBSITE, GOLD),),
    },
)

# People B-roll under the type on the large files. Native 240×120 stays
# text-only — faces die at board pixels. Stock is Pexels (see PEOPLE.md).
# Not EBC members. Drop church-shot clips in PEOPLE_DIR to replace these.
USE_PEOPLE_VIDEO = True
PEOPLE_VEIL = 0.52
PEOPLE_CLIPS: tuple[dict[str, object], ...] = (
    {
        "beat_id": "01-come-as-you-are",
        "file": "greeting-congregation.mp4",
        "pexels_id": "8776902",
        "fps": 25,
        "start": 0.6,
    },
    {
        "beat_id": "02-all-are-welcome",
        "file": "ebc-choir.mp4",
        "start": 0.4,
    },
    {
        "beat_id": "03-sunday",
        "file": "ebc-congregation.mp4",
        "start": 0.4,
    },
    {
        "beat_id": "04-website",
        "file": "gospel-choir.mp4",
        "pexels_id": "16864283",
        "fps": 30,
        "start": 2.0,
    },
)

FONT_CANDIDATES = (
    "/System/Library/Fonts/Supplemental/Impact.ttf",
    "/System/Library/Fonts/Supplemental/Arial Black.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial.ttf",
)

TIME_NOTE = (
    "Sunday time on this loop is 9:45 AM (confirmed). "
    "docs/church/profile.md and docs/operations/events.md still say 10:00 AM."
)
