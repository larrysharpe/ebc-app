"""Come As You Are — Facebook posts, Reels, and YouTube Shorts.

Sunday time is 9:45 AM (confirmed). Footage is from EBC livestreams
(640×360 archive). Type and a burgundy veil do the work — do not crop
tight to faces.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAMPAIGN = ROOT.parent
OUTPUT_DIR = ROOT / "output"
WORK_DIR = ROOT / "work"
CLIPS_DIR = CAMPAIGN / "source" / "youtube" / "clips"
SHARED = CAMPAIGN.parent / "_shared"

BURGUNDY = (137, 22, 25)
GOLD = (254, 176, 28)
GOLD_SOFT = (235, 191, 95)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

WEBSITE = "EBENEZERBC.ORG"
CHURCH = "Ebenezer Baptist Church"
PLACE = "Woodbridge, VA"
SUNDAY = "SUNDAY 9:45 AM"

FPS = 30
VERTICAL = (1080, 1920)
SQUARE = (1080, 1080)

# Shorts / Reels chrome. Keep type inside this band.
SAFE_TOP = 250
SAFE_BOTTOM = 380

VEIL = 0.48
SHOW_LOGO = True
LOGO_CANDIDATES = (
    SHARED / "ebc-official-logo.png",
    CAMPAIGN.parent.parent.parent / "public" / "branding" / "ebc-official-logo.png",
)

FONT_HEAVY = "/System/Library/Fonts/Supplemental/Impact.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

# One clip per beat. Files live in source/youtube/clips/.
BEATS: tuple[dict[str, object], ...] = (
    {
        "id": "01-come-as-you-are",
        "seconds": 4.0,
        "clip": "ebc-congregation.mp4",
        "lines": (("COME", GOLD), ("AS YOU ARE", WHITE)),
    },
    {
        "id": "02-all-are-welcome",
        "seconds": 4.0,
        "clip": "ebc-choir.mp4",
        "lines": (("ALL ARE", WHITE), ("WELCOME", GOLD)),
    },
    {
        "id": "03-sunday",
        "seconds": 3.5,
        "clip": "ebc-speaker.mp4",
        "lines": (("SUNDAY", GOLD), ("9:45 AM", WHITE)),
    },
    {
        "id": "04-website",
        "seconds": 3.5,
        "clip": "ebc-pastor.mp4",
        "lines": ((WEBSITE, GOLD),),
    },
)

CAPTION = """Come As You Are.

Sunday worship 9:45 AM
All are welcome.

Ebenezer Baptist Church
Woodbridge, VA
ebenezerbc.org
"""

SHORTS_TITLE = "Come As You Are | Sunday 9:45 AM | Ebenezer Baptist Church"
