"""Fall Fresh 2026 promo — editable scene plan and brand settings.

Cut philosophy (per Lydia/Josh): lead with Will Harris face/conducting,
then splice choir/concert energy around him.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / "source"
WORK_DIR = ROOT / "work"
OUTPUT_DIR = ROOT / "output"
ASSETS_DIR = ROOT / "assets"

# One registration URL everywhere (QR + captions). Override with env FALL_FRESH_REGISTER_URL.
REGISTER_URL = "https://ebenezerbc.org/"

BRAND = {
    "burgundy": (137, 22, 25),  # #891619
    "gold": (235, 191, 95),  # #EBBF5F
    "gold_bright": (254, 176, 28),  # #FEB01C
    "white": (255, 255, 255),
    "black": (0, 0, 0),
}

LOGO_FULL = ASSETS_DIR / "ebc-logo-full-color.png"
LOGO_TRANSPARENT = ASSETS_DIR / "ebc-logo-transparent.png"
WILL_PORTRAIT = ASSETS_DIR / "will-harris-portrait.png"
WILL_FLYER = ASSETS_DIR / "will-harris-flyer.png"
LOWER_THIRD_01 = ASSETS_DIR / "lower-third-01.mp4"
LOWER_THIRD_02 = ASSETS_DIR / "lower-third-02.mp4"

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Avenir Next.ttc",
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]

SOURCES = {
    "glory": {
        "id": "bVWf8Pj0uAw",
        "url": "https://www.youtube.com/watch?v=bVWf8Pj0uAw",
        "title": "Give God The Glory - Lewis Chapel",
        "file": SOURCE_DIR / "glory.mp4",
    },
    "old_time": {
        "id": "vRYF-lnUQa0",
        "url": "https://www.youtube.com/watch?v=vRYF-lnUQa0",
        "title": "Church in the Old Time Way Medley",
        "file": SOURCE_DIR / "old_time.mp4",
    },
    "metropolitan": {
        "id": "AAlJ60Dj_Vg",
        "url": "https://www.youtube.com/watch?v=AAlJ60Dj_Vg",
        "title": "He Decided to Die | Matthew 28 Medley",
        "file": SOURCE_DIR / "metropolitan.mp4",
    },
    "plans": {
        "id": "VqHpmnc1ObU",
        "url": "https://www.youtube.com/watch?v=VqHpmnc1ObU",
        "title": "I Have Plans For You - Lewis Chapel",
        "file": SOURCE_DIR / "plans.mp4",
    },
    # New sources (Will-forward)
    "interview": {
        "id": "tPG-1tMgvyc",
        "url": "https://www.youtube.com/watch?v=tPG-1tMgvyc",
        "title": "Build a Global Gospel Legacy — Dr Will Harris Interview",
        "file": SOURCE_DIR / "interview.mp4",
    },
    "even_me": {
        "id": "QvFQVDnxh8g",
        "url": "https://www.youtube.com/watch?v=QvFQVDnxh8g",
        "title": 'Will Harris plays the hymn "Even Me"',
        "file": SOURCE_DIR / "extra.mp4",
    },
    "friends_live": {
        "id": "N4OS-J1hF6w",
        "url": "https://www.youtube.com/watch?v=N4OS-J1hF6w",
        "title": "Will Harris & Friends Live Recording",
        "file": SOURCE_DIR / "friends_live.mp4",
    },
    # Still / motion-graphic assets (no YouTube download)
    "will_portrait": {
        "id": "still-portrait",
        "url": "",
        "title": "Will Harris portrait",
        "file": WILL_PORTRAIT,
    },
    "will_flyer": {
        "id": "still-flyer",
        "url": "",
        "title": "Fall Fresh flyer clinician panel",
        "file": WILL_FLYER,
    },
    "lower_third_01": {
        "id": "asset-lower-third-01",
        "url": "",
        "title": "Lower Third 01",
        "file": LOWER_THIRD_01,
    },
    "lower_third_02": {
        "id": "asset-lower-third-02",
        "url": "",
        "title": "Lower Third 2",
        "file": LOWER_THIRD_02,
    },
}

# 15s Reel — Will-first, then choir, then CTA
REEL_15 = {
    "name": "reel-15",
    "width": 1080,
    "height": 1920,
    "scenes": [
        {
            "kind": "still",
            "source": "will_portrait",
            "duration": 3.0,
            "lower_third": "lower_third_01",
            "audio_from": "old_time",
            "audio_start": 20.0,
        },
        {
            "kind": "video",
            "source": "friends_live",
            "start": 1180.0,
            "duration": 3.0,
            "lower_third": "lower_third_02",
        },
        {
            "kind": "video",
            "source": "old_time",
            "start": 22.0,
            "duration": 2.5,
            "label": "Sept 18–20 · Woodbridge",
        },
        {
            "kind": "video",
            "source": "even_me",
            "start": 28.0,
            "duration": 2.0,
            "label": "All singers welcome",
        },
        {
            "kind": "video",
            "source": "glory",
            "start": 40.0,
            "duration": 2.0,
            "label": "Register today",
        },
    ],
    "end_card_seconds": 2.5,
}

# 30s main — portrait+LT01 → live+LT02 → singing → piano → choir → CTA
MAIN_30 = {
    "name": "main-30",
    "width": 1920,
    "height": 1080,
    "scenes": [
        {
            "kind": "still",
            "source": "will_portrait",
            "duration": 5.0,
            "lower_third": "lower_third_01",
            "audio_from": "friends_live",
            "audio_start": 1180.0,
        },
        {
            "kind": "video",
            "source": "friends_live",
            "start": 1175.0,
            "duration": 5.0,
            "lower_third": "lower_third_02",
        },
        {
            "kind": "video",
            "source": "old_time",
            "start": 20.0,
            "duration": 4.0,
            "label": "Director of Music & Arts",
        },
        {
            "kind": "video",
            "source": "even_me",
            "start": 25.0,
            "duration": 3.5,
            "label": "Fall Fresh 2026",
        },
        {
            "kind": "video",
            "source": "metropolitan",
            "start": 30.0,
            "duration": 3.0,
            "label": "Sept 18–20 · Woodbridge",
        },
        {
            "kind": "video",
            "source": "plans",
            "start": 55.0,
            "duration": 3.0,
            "label": "All singers welcome",
        },
    ],
    "end_card_seconds": 6.5,
}

MAIN_30_VERTICAL = {
    **MAIN_30,
    "name": "main-30-vertical",
    "width": 1080,
    "height": 1920,
}
