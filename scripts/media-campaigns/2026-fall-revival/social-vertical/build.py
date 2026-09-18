"""Render Fall Revival 2026 vertical (1080x1920) social cards and a stills reel."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from config import (
    ASSETS_DIR,
    BG_BURGUNDY,
    BG_SANCTUARY,
    CARDS,
    GOLD,
    HEIGHT,
    HOLD_SECONDS,
    LOGO_NAME,
    OUTPUT_DIR,
    REEL_IDS,
    SAFE_BOTTOM,
    SAFE_TOP,
    SHARED_ASSETS,
    SIGN_ASSETS,
    WIDTH,
    FONT_BOLD,
    FONT_HEAVY,
)

# Soft burgundy veil — keeps photo depth under the type.
BURGUNDY_VEIL = (40, 8, 10)


def _asset(name: str) -> Path:
    for folder in (ASSETS_DIR, SIGN_ASSETS, SHARED_ASSETS):
        candidate = folder / name
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        f"Missing asset {name}. Expected in {ASSETS_DIR}, {SIGN_ASSETS}, or {SHARED_ASSETS}"
    )


def _font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def _fit_font(text: str, max_w: int, max_h: int, path: str) -> ImageFont.FreeTypeFont:
    lo, hi, best = 22, 420, 22
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
    # Keep the upper glow / aisle; do not crop the bright top off.
    top = min(80, max(0, resized.height - HEIGHT))
    return resized.crop((left, top, left + WIDTH, top + HEIGHT))


def _render_line(text: str, fill: tuple[int, int, int], max_w: int, max_h: int, heavy: bool) -> Image.Image:
    path = FONT_HEAVY if heavy and Path(FONT_HEAVY).exists() else FONT_BOLD
    font = _fit_font(text, max_w, max_h, path)
    dummy = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    left, top, right, bottom = dummy.textbbox((0, 0), text, font=font)
    w, h = max(1, right - left), max(1, bottom - top)
    line = Image.new("RGBA", (w + 20, h + 20), (0, 0, 0, 0))
    ImageDraw.Draw(line).text((10 - left + 3, 10 - top + 5), text, font=font, fill=(0, 0, 0, 180))
    line = line.filter(ImageFilter.GaussianBlur(5))
    ImageDraw.Draw(line).text((10 - left, 10 - top), text, font=font, fill=(*fill, 255))
    return line


def _stack_lines(lines: tuple[object, ...]) -> Image.Image:
    usable_h = HEIGHT - SAFE_TOP - SAFE_BOTTOM - 180
    target_w = int(WIDTH * 0.88)
    rendered: list[Image.Image] = []
    for text, fill, share, heavy in lines:
        band_h = max(36, int(usable_h * float(share)))
        rendered.append(_render_line(str(text), fill, target_w, band_h, bool(heavy)))
    gap = max(6, int(usable_h * 0.012))
    stack_w = max(img.width for img in rendered)
    stack_h = sum(img.height for img in rendered) + gap * (len(rendered) - 1)
    stack = Image.new("RGBA", (stack_w, stack_h), (0, 0, 0, 0))
    y = 0
    for img in rendered:
        stack.paste(img, ((stack_w - img.width) // 2, y), img)
        y += img.height + gap
    scale = min(target_w / stack.width, usable_h / stack.height, 1.0)
    new_size = (max(1, int(stack.width * scale)), max(1, int(stack.height * scale)))
    return stack.resize(new_size, Image.Resampling.LANCZOS)


def _logo_plate() -> Image.Image:
    logo = Image.open(_asset(LOGO_NAME)).convert("RGBA")
    max_w, max_h = 620, 150
    logo.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    pad_x, pad_y = 28, 16
    plate = Image.new("RGBA", (logo.width + pad_x * 2, logo.height + pad_y * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(plate)
    draw.rounded_rectangle([0, 0, plate.width - 1, plate.height - 1], radius=16, fill=(255, 255, 255, 242))
    plate.paste(logo, (pad_x, pad_y), logo)
    return plate


def _gold_bar(width: int) -> Image.Image:
    bar = Image.new("RGBA", (width, 8), (0, 0, 0, 0))
    ImageDraw.Draw(bar).rectangle([0, 0, width, 8], fill=(*GOLD, 255))
    return bar


def render_card(spec: dict[str, object]) -> Image.Image:
    canvas = _cover(_asset(str(spec["bg"])))
    veil = Image.new("RGB", canvas.size, BURGUNDY_VEIL)
    canvas = Image.blend(canvas, veil, 0.28 if spec["bg"] == BG_SANCTUARY else 0.18)
    out = canvas.convert("RGBA")

    logo = _logo_plate()
    lx = (WIDTH - logo.width) // 2
    ly = SAFE_TOP + 8
    out.paste(logo, (lx, ly), logo)

    bar = _gold_bar(int(WIDTH * 0.42))
    bx = (WIDTH - bar.width) // 2
    out.paste(bar, (bx, ly + logo.height + 18), bar)

    lines = spec["lines"]
    assert isinstance(lines, tuple)
    stack = _stack_lines(lines)
    sx = (WIDTH - stack.width) // 2
    content_top = ly + logo.height + 40
    content_bottom = HEIGHT - SAFE_BOTTOM
    sy = content_top + max(0, (content_bottom - content_top - stack.height) // 2)
    out.paste(stack, (sx, sy), stack)

    out.paste(bar, (bx, HEIGHT - SAFE_BOTTOM + 36), bar)
    return out.convert("RGB")


def _write_reel(folder: Path, names: list[str]) -> Path | None:
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        print("ffmpeg not found — cards written, reel skipped")
        return None
    id_to_name = {name.split(".")[0]: name for name in names}
    reel_files = [id_to_name[card_id] for card_id in REEL_IDS if card_id in id_to_name]
    if not reel_files:
        return None
    inputs: list[str] = []
    for name in reel_files:
        inputs.extend(["-loop", "1", "-t", str(HOLD_SECONDS), "-i", str(folder / name)])
    n = len(reel_files)
    concat = "".join(f"[{i}:v]" for i in range(n))
    filt = (
        f"{concat}concat=n={n}:v=1:a=0,"
        f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=disable,"
        "format=yuv420p"
    )
    dest = folder / "revival-reel-20.mp4"
    # Silent reel — captions carry the invite. Platforms require an audio track.
    cmd = [
        ffmpeg,
        "-y",
        *inputs,
        "-f",
        "lavfi",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-filter_complex",
        filt,
        "-shortest",
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        str(dest),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return dest


def _contact_sheet(images: list[Image.Image], ids: list[str]) -> Image.Image:
    thumb_w = 270
    thumb_h = int(thumb_w * HEIGHT / WIDTH)
    gap = 24
    cols = 4
    rows = (len(images) + cols - 1) // cols
    sheet = Image.new(
        "RGB",
        (cols * thumb_w + gap * (cols + 1), rows * (thumb_h + 36) + gap * (rows + 1) + 48),
        (20, 20, 20),
    )
    draw = ImageDraw.Draw(sheet)
    font = _font(FONT_BOLD if Path(FONT_BOLD).exists() else FONT_HEAVY, 16)
    draw.text((gap, 16), "Fall Revival 2026 — 1080x1920 social", font=font, fill=GOLD)
    for index, (img, card_id) in enumerate(zip(images, ids)):
        col, row = index % cols, index // cols
        x = gap + col * (thumb_w + gap)
        y = 56 + row * (thumb_h + 36 + gap)
        thumb = img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, y))
        draw.text((x, y + thumb_h + 6), card_id, font=font, fill=(220, 220, 220))
    return sheet


def _write_preview_html(folder: Path, names: list[str]) -> None:
    thumbs = "".join(
        f'<figure><img src="{name}" alt="" /><figcaption>{name}</figcaption></figure>'
        for name in names
    )
    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Fall Revival 2026 — social cards</title>
  <style>
    :root {{ color-scheme: dark; }}
    body {{
      margin: 0; background: #111; color: #f4f4f4;
      font-family: Arial, sans-serif; padding: 24px;
    }}
    h1 {{ color: #FEB01C; font-size: 1.3rem; }}
    .lead {{ max-width: 40rem; line-height: 1.45; color: #ddd; }}
    .grid {{
      display: grid; gap: 20px; margin-top: 24px;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }}
    figure {{ margin: 0; }}
    img {{ width: 100%; height: auto; background: #000; border: 1px solid #333; }}
    figcaption {{ color: #aaa; font-size: 0.8rem; margin-top: 6px; }}
    a {{ color: #EBBF5F; }}
  </style>
</head>
<body>
  <h1>Fall Revival 2026 — 9:16 cards</h1>
  <p class="lead">
    1080 × 1920. Type sits in the Shorts / Reels safe area.
    Website as text — no QR. Post the stills or
    <a href="revival-reel-20.mp4">revival-reel-20.mp4</a>.
  </p>
  <div class="grid">{thumbs}</div>
</body>
</html>
"""
    (folder / "index.html").write_text(html, encoding="utf-8")


def build() -> Path:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    for name in (BG_BURGUNDY, BG_SANCTUARY, LOGO_NAME):
        dest = ASSETS_DIR / name
        if dest.exists():
            continue
        for folder in (SIGN_ASSETS, SHARED_ASSETS):
            src = folder / name
            if src.exists():
                shutil.copy2(src, dest)
                break

    folder = OUTPUT_DIR / "1080x1920"
    if folder.exists():
        shutil.rmtree(folder)
    folder.mkdir(parents=True)

    images: list[Image.Image] = []
    names: list[str] = []
    ids: list[str] = []
    for spec in CARDS:
        img = render_card(spec)
        if img.size != (WIDTH, HEIGHT):
            raise RuntimeError(f"Card is {img.size}, expected {(WIDTH, HEIGHT)}")
        name = f"{spec['id']}.png"
        img.save(folder / name, format="PNG", optimize=True)
        images.append(img)
        names.append(name)
        ids.append(str(spec["id"]))

    _write_reel(folder, names)
    sheet = _contact_sheet(images, ids)
    sheet.save(OUTPUT_DIR / "preview-1080x1920.png", format="PNG")
    _write_preview_html(folder, names)
    return folder


def main() -> None:
    dest = build()
    print(f"Wrote {dest}")
    print(f"Preview: {OUTPUT_DIR / 'preview-1080x1920.png'}")


if __name__ == "__main__":
    main()
