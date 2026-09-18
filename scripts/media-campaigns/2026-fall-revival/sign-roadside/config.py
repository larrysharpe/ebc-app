"""Fall Revival 2026 — VNNOX / roadside LED sign.

Road signs are glanced at for 1–2 seconds. One idea per slide, huge type,
black background, no home churches, no full sentences.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "output"

# Bright gold reads on LED; white is the fallback if their yellows look dim.
BURGUNDY = (137, 22, 25)
GOLD = (254, 176, 28)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

HOLD_SECONDS = 6

SERVICE_TIME = "7 PM"

# EBC roadside VNNOX sign. Build native pixels — do not upload a larger
# file and let the player scale it down (that is what softens the type).
SIZES: tuple[tuple[int, int], ...] = (
    (240, 120),
)

# Two-line copy for nearly-square / short signs (64x32, 128x64, …).
SLIDES_STACKED: tuple[dict[str, object], ...] = (
    {"id": "01-save-the-date", "lines": ("SAVE THE", "DATE"), "fill": GOLD},
    {"id": "03-when", "lines": ("OCT 6-8", "7 PM"), "fill": GOLD},
    {"id": "04-tue", "lines": ("TUE 6  7PM", "HARGROVE"), "fill": WHITE},
    {"id": "05-wed", "lines": ("WED 7  7PM", "REV DR BALL"), "fill": WHITE},
    {"id": "06-thu", "lines": ("THU 8  7PM", "JONES"), "fill": WHITE},
)

# One-line copy for wide ribbon signs (128x32, 192x32, …).
SLIDES_WIDE: tuple[dict[str, object], ...] = (
    {"id": "01-save-the-date", "lines": ("SAVE THE DATE",), "fill": GOLD},
    {"id": "03-when", "lines": ("OCTOBER 6-8",), "fill": GOLD},
    {"id": "04-tue", "lines": ("TUE 6  HARGROVE",), "fill": WHITE},
    {"id": "05-wed", "lines": ("WED 7  BALL",), "fill": WHITE},
    {"id": "06-thu", "lines": ("THU 8  JONES",), "fill": WHITE},
)

# Impact first: condensed, so long words (HARGROVE, REVIVAL) can be taller.
FONT_CANDIDATES = (
    "/System/Library/Fonts/Supplemental/Impact.ttf",
    "/System/Library/Fonts/Supplemental/Arial Black.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial.ttf",
)
