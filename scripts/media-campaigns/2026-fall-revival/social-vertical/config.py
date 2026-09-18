"""Fall Revival 2026 — vertical social cards (YouTube Shorts / Facebook Reels).

Dates and guest preachers only. Do not invent a service time.
No QR codes — website as text.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "output"
ASSETS_DIR = ROOT / "assets"
SIGN_ASSETS = ROOT.parent / "sign-roadside" / "assets"
SHARED_ASSETS = ROOT.parent.parent / "_shared"

WIDTH = 1080
HEIGHT = 1920
HOLD_SECONDS = 4

BURGUNDY = (137, 22, 25)  # #891619
GOLD = (254, 176, 28)  # #FEB01C
GOLD_SOFT = (235, 191, 95)  # #EBBF5F
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

WEBSITE = "EBENEZERBC.ORG"
CHURCH = "Ebenezer Baptist Church"
PLACE = "Woodbridge, VA"

# Shorts / Reels chrome covers the top and bottom. Keep type in this band.
SAFE_TOP = 250
SAFE_BOTTOM = 400

FONT_HEAVY = "/System/Library/Fonts/Supplemental/Impact.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"

BG_BURGUNDY = "revival-bg-burgundy.png"
BG_SANCTUARY = "revival-bg-sanctuary.png"
LOGO_NAME = "ebc-official-logo.png"

# Each line: text, fill RGB, vertical share of the type stack, heavy Impact type.
CARDS: tuple[dict[str, object], ...] = (
    {
        "id": "01-save-the-date",
        "bg": BG_BURGUNDY,
        "lines": (
            ("SAVE THE DATE", GOLD, 0.12, True),
            ("FALL", WHITE, 0.22, True),
            ("REVIVAL", WHITE, 0.28, True),
            ("OCTOBER 6-8", GOLD, 0.14, True),
            ("7:00 PM", WHITE, 0.10, True),
            ("ALL ARE WELCOME", GOLD_SOFT, 0.08, False),
            (WEBSITE, GOLD, 0.12, False),
        ),
    },
    {
        "id": "02-three-nights",
        "bg": BG_SANCTUARY,
        "lines": (
            ("FALL REVIVAL", GOLD, 0.18, True),
            ("THREE NIGHTS", WHITE, 0.22, True),
            ("OCTOBER 6-8", WHITE, 0.20, True),
            ("TUE  WED  THU", GOLD_SOFT, 0.12, False),
            ("ALL ARE WELCOME", GOLD, 0.12, False),
            (WEBSITE, GOLD, 0.16, False),
        ),
    },
    {
        "id": "03-hargrove",
        "bg": BG_BURGUNDY,
        "lines": (
            ("TUESDAY  OCT 6", GOLD, 0.10, True),
            ("7:00 PM", GOLD, 0.10, True),
            ("REV. SHOMARI", WHITE, 0.18, True),
            ("HARGROVE", WHITE, 0.26, True),
            ("First Baptist Church", GOLD_SOFT, 0.10, False),
            ("Merrifield, VA", GOLD_SOFT, 0.10, False),
            (WEBSITE, GOLD, 0.14, False),
        ),
    },
    {
        "id": "04-ball",
        "bg": BG_BURGUNDY,
        "lines": (
            ("WEDNESDAY  OCT 7", GOLD, 0.10, True),
            ("7:00 PM", GOLD, 0.10, True),
            ("REV. DR. MARQUEZ", WHITE, 0.18, True),
            ("BALL", WHITE, 0.26, True),
            ("Uplift Church", GOLD_SOFT, 0.10, False),
            ("Hyattsville, MD", GOLD_SOFT, 0.10, False),
            (WEBSITE, GOLD, 0.14, False),
        ),
    },
    {
        "id": "05-jones",
        "bg": BG_BURGUNDY,
        "lines": (
            ("THURSDAY  OCT 8", GOLD, 0.10, True),
            ("7:00 PM", GOLD, 0.10, True),
            ("REV. KENNARD", WHITE, 0.18, True),
            ("JONES", WHITE, 0.26, True),
            ("First Baptist Church", GOLD_SOFT, 0.10, False),
            ("Vienna, VA", GOLD_SOFT, 0.10, False),
            (WEBSITE, GOLD, 0.14, False),
        ),
    },
    {
        "id": "06-welcome",
        "bg": BG_SANCTUARY,
        "lines": (
            ("COME WORSHIP", GOLD, 0.14, True),
            ("ALL ARE", WHITE, 0.20, True),
            ("WELCOME", WHITE, 0.26, True),
            (PLACE, GOLD_SOFT, 0.10, False),
            (WEBSITE, GOLD, 0.16, False),
        ),
    },
    {
        "id": "07-endcard",
        "bg": BG_BURGUNDY,
        "lines": (
            ("FALL REVIVAL", GOLD, 0.16, True),
            ("OCTOBER 6-8", WHITE, 0.22, True),
            ("Join us", GOLD_SOFT, 0.10, False),
            (CHURCH, WHITE, 0.10, False),
            (PLACE, GOLD_SOFT, 0.10, False),
            (WEBSITE, GOLD, 0.16, False),
        ),
    },
)

# 20s reel: save-the-date, three speakers, end card.
REEL_IDS: tuple[str, ...] = (
    "01-save-the-date",
    "03-hargrove",
    "04-ball",
    "05-jones",
    "07-endcard",
)
