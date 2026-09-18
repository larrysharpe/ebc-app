"""Fall Revival 2026 — VNNOX upload graphics in EBC’s existing style.

Their library is ~1672×941 photos with the official logo and huge gold type.
VNNOX scales those down to the 240×120 board. Design at that upload size so
the revival spots sit next to Sunday Service and Pastor Lundy.
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from config import GOLD, HOLD_SECONDS, OUTPUT_DIR, WHITE

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
BG_BURGUNDY = ASSETS / "revival-bg-burgundy.png"
BG_SANCTUARY = ASSETS / "revival-bg-sanctuary.png"

# Same size as ebc sunday service / Pastor Lundy in VNNOX.
WIDTH, HEIGHT = 1672, 941
GOLD_RGB = GOLD
WEBSITE = "EBENEZERBC.ORG"
SERVICE_TIME = "7:00 PM"
# Type block fills this share of the frame (rest is margin).
TEXT_FILL = 0.85

FONT_HEAVY = "/System/Library/Fonts/Supplemental/Impact.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

SLIDES: tuple[dict[str, object], ...] = (
    {
        "id": "01-save-the-date",
        "bg": BG_BURGUNDY,
        "lines": (
            ("SAVE THE DATE", GOLD_RGB, 0.14),
            ("FALL REVIVAL", WHITE, 0.38),
            ("OCTOBER 6-8", GOLD_RGB, 0.18),
            (SERVICE_TIME, WHITE, 0.16),
            (WEBSITE, GOLD_RGB, 0.14),
        ),
    },
    {
        "id": "03-hargrove",
        "bg": BG_BURGUNDY,
        "lines": (
            ("TUESDAY  OCT 6", GOLD_RGB, 0.14),
            (SERVICE_TIME, GOLD_RGB, 0.12),
            ("REV. SHOMARI", WHITE, 0.24),
            ("HARGROVE", WHITE, 0.36),
            (WEBSITE, GOLD_RGB, 0.14),
        ),
    },
    {
        "id": "04-ball",
        "bg": BG_BURGUNDY,
        "lines": (
            ("WEDNESDAY  OCT 7", GOLD_RGB, 0.14),
            (SERVICE_TIME, GOLD_RGB, 0.12),
            ("REV. DR. MARQUEZ", WHITE, 0.24),
            ("BALL", WHITE, 0.36),
            (WEBSITE, GOLD_RGB, 0.14),
        ),
    },
    {
        "id": "05-jones",
        "bg": BG_BURGUNDY,
        "lines": (
            ("THURSDAY  OCT 8", GOLD_RGB, 0.14),
            (SERVICE_TIME, GOLD_RGB, 0.12),
            ("REV. KENNARD", WHITE, 0.24),
            ("JONES", WHITE, 0.36),
            (WEBSITE, GOLD_RGB, 0.14),
        ),
    },
)

# Night-of set: TONIGHT + preacher + 7:00 PM. One folder per night for VNNOX.
NIGHTS: tuple[dict[str, object], ...] = (
    {
        "id": "tue-hargrove",
        "slides": (
            {
                "id": "01-tonight",
                "bg": BG_BURGUNDY,
                "lines": (
                    ("TONIGHT", GOLD_RGB, 0.48),
                    (SERVICE_TIME, WHITE, 0.32),
                ),
            },
            {
                "id": "02-hargrove",
                "bg": BG_BURGUNDY,
                "lines": (
                    ("REV. SHOMARI", WHITE, 0.28),
                    ("HARGROVE", WHITE, 0.44),
                    (SERVICE_TIME, GOLD_RGB, 0.16),
                ),
            },
        ),
    },
    {
        "id": "wed-ball",
        "slides": (
            {
                "id": "01-tonight",
                "bg": BG_BURGUNDY,
                "lines": (
                    ("TONIGHT", GOLD_RGB, 0.48),
                    (SERVICE_TIME, WHITE, 0.32),
                ),
            },
            {
                "id": "02-ball",
                "bg": BG_BURGUNDY,
                "lines": (
                    ("REV. DR. MARQUEZ", WHITE, 0.26),
                    ("BALL", WHITE, 0.44),
                    (SERVICE_TIME, GOLD_RGB, 0.16),
                ),
            },
        ),
    },
    {
        "id": "thu-jones",
        "slides": (
            {
                "id": "01-tonight",
                "bg": BG_BURGUNDY,
                "lines": (
                    ("TONIGHT", GOLD_RGB, 0.48),
                    (SERVICE_TIME, WHITE, 0.32),
                ),
            },
            {
                "id": "02-jones",
                "bg": BG_BURGUNDY,
                "lines": (
                    ("REV. KENNARD", WHITE, 0.28),
                    ("JONES", WHITE, 0.44),
                    (SERVICE_TIME, GOLD_RGB, 0.16),
                ),
            },
        ),
    },
)


def _font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def _fit_font(text: str, max_w: int, max_h: int, path: str) -> ImageFont.FreeTypeFont:
    lo, hi, best = 24, 620, 24
    dummy = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    while lo <= hi:
        mid = (lo + hi) // 2
        font = _font(path, mid)
        left, top, right, bottom = dummy.textbbox((0, 0), text, font=font)
        if (right - left) <= max_w and (bottom - top) <= max_h:
            best = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return _font(path, best)


def _cover(path: Path) -> Image.Image:
    src = Image.open(path).convert("RGB")
    scale = max(WIDTH / src.width, HEIGHT / src.height)
    resized = src.resize(
        (max(1, int(src.width * scale)), max(1, int(src.height * scale))),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - WIDTH) // 2
    top = (resized.height - HEIGHT) // 2
    return resized.crop((left, top, left + WIDTH, top + HEIGHT))


def _render_line(text: str, fill: tuple[int, int, int], max_w: int, max_h: int, heavy: bool) -> Image.Image:
    font = _fit_font(text, max_w, max_h, FONT_HEAVY if heavy else FONT_BOLD)
    dummy = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    left, top, right, bottom = dummy.textbbox((0, 0), text, font=font)
    w, h = max(1, right - left), max(1, bottom - top)
    line = Image.new("RGBA", (w + 16, h + 16), (0, 0, 0, 0))
    ImageDraw.Draw(line).text((8 - left + 3, 8 - top + 5), text, font=font, fill=(0, 0, 0, 170))
    line = line.filter(ImageFilter.GaussianBlur(4))
    ImageDraw.Draw(line).text((8 - left, 8 - top), text, font=font, fill=(*fill, 255))
    return line


def _stack_lines(lines: tuple[object, ...]) -> Image.Image:
    target_w = int(WIDTH * TEXT_FILL)
    target_h = int(HEIGHT * TEXT_FILL)
    rendered: list[Image.Image] = []
    for index, (text, fill, share) in enumerate(lines):
        band_h = max(40, int(target_h * float(share)))
        is_site = str(text) == WEBSITE
        heavy = not is_site
        rendered.append(_render_line(str(text), fill, target_w, band_h, heavy=heavy))
    gap = max(4, int(target_h * 0.012))
    stack_w = max(img.width for img in rendered)
    stack_h = sum(img.height for img in rendered) + gap * (len(rendered) - 1)
    stack = Image.new("RGBA", (stack_w, stack_h), (0, 0, 0, 0))
    y = 0
    for img in rendered:
        stack.paste(img, ((stack_w - img.width) // 2, y), img)
        y += img.height + gap
    scale = min(target_w / stack.width, target_h / stack.height)
    new_size = (max(1, int(stack.width * scale)), max(1, int(stack.height * scale)))
    return stack.resize(new_size, Image.Resampling.LANCZOS)


def render_slide(spec: dict[str, object]) -> Image.Image:
    canvas = _cover(Path(str(spec["bg"])))
    veil = Image.new("RGB", canvas.size, (40, 8, 10))
    canvas = Image.blend(canvas, veil, 0.22)
    lines = spec["lines"]
    assert isinstance(lines, tuple)
    stack = _stack_lines(lines)
    x = (WIDTH - stack.width) // 2
    y = (HEIGHT - stack.height) // 2
    out = canvas.convert("RGBA")
    out.paste(stack, (x, y), stack)
    return out.convert("RGB")


def _write_mp4(folder: Path, names: list[str]) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        return
    inputs: list[str] = []
    for name in names:
        inputs.extend(["-loop", "1", "-t", str(HOLD_SECONDS), "-i", str(folder / name)])
    n = len(names)
    concat = "".join(f"[{i}:v]" for i in range(n))
    filt = f"{concat}concat=n={n}:v=1:a=0,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p"
    subprocess.run(
        [ffmpeg, "-y", *inputs, "-filter_complex", filt, "-an", str(folder / "playlist.mp4")],
        check=True,
        capture_output=True,
    )


def _write_folder(folder: Path, specs: tuple[dict[str, object], ...]) -> None:
    folder.mkdir(parents=True)
    names: list[str] = []
    for spec in specs:
        img = render_slide(spec)
        if img.size != (WIDTH, HEIGHT):
            raise RuntimeError(f"Slide is {img.size}, expected {(WIDTH, HEIGHT)}")
        name = f"{spec['id']}.png"
        img.save(folder / name, format="PNG", optimize=True)
        names.append(name)
    _write_mp4(folder, names)


def build() -> Path:
    folder = OUTPUT_DIR / "1672x941"
    if folder.exists():
        shutil.rmtree(folder)
    _write_folder(folder, SLIDES)
    return folder


def build_nights() -> Path:
    root = OUTPUT_DIR / "1672x941-nights"
    if root.exists():
        shutil.rmtree(root)
    for night in NIGHTS:
        slides = night["slides"]
        assert isinstance(slides, tuple)
        _write_folder(root / str(night["id"]), slides)
    return root


if __name__ == "__main__":
    dest = build()
    nights = build_nights()
    print(f"Wrote {dest}")
    print(f"Wrote {nights}")
