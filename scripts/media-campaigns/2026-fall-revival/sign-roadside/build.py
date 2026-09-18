"""Render Fall Revival slides as crisp LED PNGs and a looping MP4."""

from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from config import (
    BLACK,
    FONT_CANDIDATES,
    GOLD,
    HOLD_SECONDS,
    OUTPUT_DIR,
    SERVICE_TIME,
    SIZES,
    SLIDES_STACKED,
    SLIDES_WIDE,
    WHITE,
)


def _font_path() -> str:
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return candidate
    raise FileNotFoundError("No bold system font found (need Arial Black or Impact).")


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(_font_path(), size=size)


def _text_bbox(text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int, int, int]:
    dummy = Image.new("L", (1, 1))
    return ImageDraw.Draw(dummy).textbbox((0, 0), text, font=font)


def _crisp_line(text: str, font: ImageFont.FreeTypeFont, fill: tuple[int, int, int]) -> Image.Image:
    left, top, right, bottom = _text_bbox(text, font)
    width = max(1, right - left)
    height = max(1, bottom - top)
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).text((-left, -top), text, font=font, fill=255)
    # Kill anti-alias gray so LEDs get hard edges, not mush.
    mask = mask.point(lambda pixel: 255 if pixel >= 140 else 0)
    line = Image.new("RGB", (width, height), BLACK)
    line.paste(Image.new("RGB", (width, height), fill), (0, 0), mask)
    return line


def _max_font_size(text: str, box_w: int, box_h: int) -> int:
    lo, hi, best = 8, 500, 8
    while lo <= hi:
        mid = (lo + hi) // 2
        font = _load_font(mid)
        left, top, right, bottom = _text_bbox(text, font)
        fits = (right - left) <= box_w and (bottom - top) <= box_h
        if fits:
            best = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return best


def _margin(width: int, height: int) -> int:
    # Tight on purpose — roadside type should almost touch the bezel.
    return 2 if min(width, height) >= 80 else 1


def _slides_for(width: int, height: int) -> tuple[dict[str, object], ...]:
    # Only true ribbon signs (about 3.5:1 and wider) stay on one line.
    # 192x64 and 96x32 read bigger as two lines.
    wide = width / height >= 3.5
    slides = list(SLIDES_WIDE if wide else SLIDES_STACKED)
    if SERVICE_TIME.strip():
        time_label = SERVICE_TIME.strip().upper()
        if wide:
            slides.append({"id": "08-time", "lines": (time_label,), "fill": WHITE})
        else:
            slides.append({"id": "08-time", "lines": (time_label, "NIGHTLY"), "fill": WHITE})
    return tuple(slides)


def render_slide(
    width: int,
    height: int,
    lines: tuple[str, ...],
    fill: tuple[int, int, int],
) -> Image.Image:
    canvas = Image.new("RGB", (width, height), BLACK)
    pad = _margin(width, height)
    gap = 2
    count = len(lines)
    box_w = width - pad * 2
    band_h = (height - pad * 2 - gap * (count - 1)) // count
    y = pad
    for line in lines:
        font = _load_font(_max_font_size(line, box_w, band_h))
        img = _crisp_line(line, font, fill)
        x = (width - img.width) // 2
        band_y = y + max(0, (band_h - img.height) // 2)
        canvas.paste(img, (x, band_y))
        y += band_h + gap
    return canvas


def _write_playlist_mp4(folder: Path, names: list[str], width: int, height: int) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        return
    # yuv420p needs even dimensions (all our presets are even).
    inputs: list[str] = []
    for name in names:
        inputs.extend(["-loop", "1", "-t", str(HOLD_SECONDS), "-i", str(folder / name)])
    n = len(names)
    concat = "".join(f"[{i}:v]" for i in range(n))
    filt = f"{concat}concat=n={n}:v=1:a=0,format=yuv420p"
    dest = folder / "playlist.mp4"
    cmd = [ffmpeg, "-y", *inputs, "-filter_complex", filt, "-an", str(dest)]
    subprocess.run(cmd, check=True, capture_output=True)
    # Unused except to keep even-size note next to the encode.
    _ = (width, height)


def _contact_sheet(slides: list[Image.Image], scale: int) -> Image.Image:
    scaled = [
        img.resize((img.width * scale, img.height * scale), Image.Resampling.NEAREST)
        for img in slides
    ]
    gap = max(8, scaled[0].height // 6)
    label_h = 28
    width = max(img.width for img in scaled)
    height = sum(img.height + label_h + gap for img in scaled) + gap
    sheet = Image.new("RGB", (width + gap * 2, height), (20, 20, 20))
    draw = ImageDraw.Draw(sheet)
    font = _load_font(18)
    y = gap
    for index, img in enumerate(scaled, start=1):
        label = f"{index} of {len(scaled)}"
        draw.text((gap, y), label, font=font, fill=GOLD)
        y += label_h
        x = gap + (width - img.width) // 2
        sheet.paste(img, (x, y))
        y += img.height + gap
    return sheet


def _slide_names(width: int, height: int) -> list[str]:
    return [f"{spec['id']}.png" for spec in _slides_for(width, height)]


def _write_preview_html(preview_dir: Path, built: list[tuple[int, int]]) -> None:
    cards = []
    for width, height in built:
        folder = f"{width}x{height}"
        names = _slide_names(width, height)
        thumbs = "".join(
            f'<img class="thumb" src="../{folder}/{name}" alt="" />' for name in names
        )
        first = names[0]
        cards.append(
            f"""
      <article class="card">
        <h2>{width} × {height}</h2>
        <p class="hint">True size, then enlarged (nearest-neighbor). Playlist: {HOLD_SECONDS}s each.</p>
        <img class="actual" src="../{folder}/{first}" width="{width}" height="{height}" alt="{width}x{height}" />
        <div class="thumbs">{thumbs}</div>
        <p><a href="../{folder}/playlist.mp4">playlist.mp4</a></p>
      </article>"""
        )
    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Fall Revival 2026 — digital sign</title>
  <style>
    :root {{ color-scheme: dark; }}
    body {{
      margin: 0; background: #111; color: #f4f4f4;
      font-family: "Arial", sans-serif; padding: 24px;
    }}
    h1 {{ color: #FEB01C; font-size: 1.4rem; }}
    .lead {{ max-width: 42rem; line-height: 1.45; color: #ddd; }}
    .grid {{ display: grid; gap: 28px; margin-top: 28px; }}
    .card {{
      background: #1b1b1b; border: 1px solid #333; border-radius: 10px;
      padding: 16px 18px;
    }}
    .card h2 {{ margin: 0 0 6px; font-size: 1.05rem; }}
    .hint {{ margin: 0 0 12px; color: #aaa; font-size: 0.85rem; }}
    img {{ image-rendering: pixelated; image-rendering: crisp-edges; }}
    img.actual {{
      background: #000; border: 1px solid #444; display: block; margin-bottom: 10px;
    }}
    .thumbs {{ display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; }}
    img.thumb {{
      height: 72px; width: auto; background: #000; border: 1px solid #444;
    }}
    a {{ color: #EBBF5F; }}
  </style>
</head>
<body>
  <h1>Fall Revival 2026 — VNNOX slides</h1>
  <p class="lead">
    Use the folder that matches the sign resolution in VNNOX
    (Studio → player / screen size). Upload the PNGs as a playlist
    at {HOLD_SECONDS} seconds each, or upload <code>playlist.mp4</code>.
    Play at native size — do not stretch or letterbox.
  </p>
  <div class="grid">{"".join(cards)}
  </div>
</body>
</html>
"""
    preview_dir.mkdir(parents=True, exist_ok=True)
    (preview_dir / "index.html").write_text(html, encoding="utf-8")


def build(sizes: tuple[tuple[int, int], ...] | None = None) -> list[tuple[int, int]]:
    chosen = sizes or SIZES
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    built: list[tuple[int, int]] = []
    for width, height in chosen:
        folder = OUTPUT_DIR / f"{width}x{height}"
        if folder.exists():
            shutil.rmtree(folder)
        folder.mkdir(parents=True)
        slides_spec = _slides_for(width, height)
        images: list[Image.Image] = []
        names: list[str] = []
        for spec in slides_spec:
            lines = spec["lines"]
            fill = spec["fill"]
            assert isinstance(lines, tuple)
            assert isinstance(fill, tuple)
            img = render_slide(width, height, lines, fill)
            if img.size != (width, height):
                raise RuntimeError(f"Slide is {img.size}, expected {(width, height)}")
            name = f"{spec['id']}.png"
            img.save(folder / name, format="PNG", optimize=True)
            images.append(img)
            names.append(name)
        _write_playlist_mp4(folder, names, width, height)
        scale = 4 if min(width, height) >= 80 else 8
        sheet = _contact_sheet(images, scale=scale)
        sheet.save(OUTPUT_DIR / f"preview-{width}x{height}.png", format="PNG")
        built.append((width, height))
    _write_preview_html(OUTPUT_DIR / "preview", built)
    return built


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Fall Revival VNNOX slides")
    parser.add_argument(
        "--size",
        action="append",
        metavar="WxH",
        help="Only this size (repeatable), e.g. --size 64x32",
    )
    args = parser.parse_args()
    sizes: tuple[tuple[int, int], ...] | None = None
    if args.size:
        parsed: list[tuple[int, int]] = []
        for item in args.size:
            w_str, h_str = item.lower().split("x", 1)
            parsed.append((int(w_str), int(h_str)))
        sizes = tuple(parsed)
    built = build(sizes)
    print(f"Wrote {len(built)} size(s) to {OUTPUT_DIR}")
    for width, height in built:
        print(f"  {width}x{height}")


if __name__ == "__main__":
    main()
