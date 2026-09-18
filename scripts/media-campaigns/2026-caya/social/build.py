#!/usr/bin/env python3
"""Render Come As You Are Reels / Shorts and Facebook post stills."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

import config


def _font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def _fit_font(text: str, max_w: int, max_h: int) -> ImageFont.FreeTypeFont:
    path = config.FONT_HEAVY if Path(config.FONT_HEAVY).exists() else config.FONT_BOLD
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


def _line(text: str, fill: tuple[int, int, int], max_w: int, max_h: int) -> Image.Image:
    font = _fit_font(text, max_w, max_h)
    dummy = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    left, top, right, bottom = dummy.textbbox((0, 0), text, font=font)
    width, height = max(1, right - left), max(1, bottom - top)
    line = Image.new("RGBA", (width + 24, height + 24), (0, 0, 0, 0))
    ImageDraw.Draw(line).text((12 - left + 4, 12 - top + 5), text, font=font, fill=(0, 0, 0, 190))
    line = line.filter(ImageFilter.GaussianBlur(5))
    ImageDraw.Draw(line).text((12 - left, 12 - top), text, font=font, fill=(*fill, 255))
    return line


def _stack(lines: tuple[tuple[str, tuple[int, int, int]], ...], width: int, height: int) -> Image.Image:
    usable = height - config.SAFE_TOP - config.SAFE_BOTTOM
    target_w = int(width * 0.88)
    band = usable // max(1, len(lines))
    rendered = [_line(text, fill, target_w, band) for text, fill in lines]
    gap = max(8, usable // 40)
    stack_w = max(img.width for img in rendered)
    stack_h = sum(img.height for img in rendered) + gap * (len(rendered) - 1)
    stack = Image.new("RGBA", (stack_w, stack_h), (0, 0, 0, 0))
    y = 0
    for img in rendered:
        stack.paste(img, ((stack_w - img.width) // 2, y), img)
        y += img.height + gap
    return stack


def _logo() -> Image.Image | None:
    if not config.SHOW_LOGO:
        return None
    path = next((p for p in config.LOGO_CANDIDATES if p.exists()), None)
    if path is None:
        return None
    logo = Image.open(path).convert("RGBA")
    logo.thumbnail((520, 130), Image.Resampling.LANCZOS)
    pad_x, pad_y = 22, 12
    plate = Image.new("RGBA", (logo.width + pad_x * 2, logo.height + pad_y * 2), (0, 0, 0, 0))
    ImageDraw.Draw(plate).rounded_rectangle(
        [0, 0, plate.width - 1, plate.height - 1],
        radius=14,
        fill=(255, 255, 255, 240),
    )
    plate.paste(logo, (pad_x, pad_y), logo)
    return plate


def _cover(src: Image.Image, width: int, height: int) -> Image.Image:
    scale = max(width / src.width, height / src.height)
    resized = src.resize(
        (max(1, int(src.width * scale)), max(1, int(src.height * scale))),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - width) // 2
    top = max(0, (resized.height - height) // 5)
    if top + height > resized.height:
        top = resized.height - height
    return resized.crop((left, top, left + width, top + height))


def _veil(photo: Image.Image) -> Image.Image:
    burgundy = Image.new("RGB", photo.size, config.BURGUNDY)
    return Image.blend(photo.convert("RGB"), burgundy, config.VEIL)


def _compose(
    plate: Image.Image,
    lines: tuple[tuple[str, tuple[int, int, int]], ...],
    width: int,
    height: int,
    *,
    safe: bool,
) -> Image.Image:
    canvas = _veil(plate).convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    inset = max(16, width // 40)
    draw.rectangle(
        [inset, inset, width - inset, height - inset],
        outline=config.GOLD,
        width=max(3, height // 280),
    )
    stack = _stack(lines, width, height)
    if safe:
        y = config.SAFE_TOP + (height - config.SAFE_TOP - config.SAFE_BOTTOM - stack.height) // 2
    else:
        y = (height - stack.height) // 2
    x = (width - stack.width) // 2
    canvas.paste(stack, (x, y), stack)
    logo = _logo()
    if logo is not None:
        lx = (width - logo.width) // 2
        ly = height - logo.height - (config.SAFE_BOTTOM // 3 if safe else 36)
        canvas.paste(logo, (lx, ly), logo)
    return canvas.convert("RGB")


def _ffmpeg() -> str | None:
    return shutil.which("ffmpeg")


def _extract_cover_frames(clip: Path, dest: Path, width: int, height: int, seconds: float) -> bool:
    ffmpeg = _ffmpeg()
    if ffmpeg is None or not clip.exists():
        return False
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    even_w, even_h = width + width % 2, height + height % 2
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(clip),
        "-t",
        f"{seconds:.2f}",
        "-vf",
        (
            f"scale={even_w}:{even_h}:force_original_aspect_ratio=increase,"
            f"crop={even_w}:{even_h},eq=brightness=-0.04:saturation=0.9"
        ),
        "-r",
        str(config.FPS),
        "-q:v",
        "4",
        str(dest / "frame_%04d.jpg"),
    ]
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)
    return any(dest.glob("frame_*.jpg"))


def _write_mp4(frames: Path, dest: Path, width: int, height: int) -> None:
    ffmpeg = _ffmpeg()
    if ffmpeg is None:
        print("ffmpeg missing — stills only")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg,
        "-y",
        "-framerate",
        str(config.FPS),
        "-i",
        str(frames / "frame_%04d.png"),
        "-vf",
        f"scale={width}:{height}:flags=lanczos,format=yuv420p",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
        "-an",
        "-movflags",
        "+faststart",
        str(dest),
    ]
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)


def _preview(outputs: list[Path]) -> None:
    cards = []
    for path in outputs:
        if path.suffix == ".mp4":
            body = f'<video src="{path.name}" controls loop muted playsinline></video>'
        else:
            body = f'<img src="{path.relative_to(config.OUTPUT_DIR)}" alt="{path.stem}" />'
        cards.append(f'<article class="card"><h2>{path.stem}</h2>{body}</article>')
    html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Come As You Are — social</title>
<style>
  :root {{ color-scheme: dark; }}
  body {{ margin:0; background:#111; color:#f4f4f4; font-family:Arial,sans-serif; padding:24px; }}
  h1 {{ color:#FEB01C; }}
  .lead {{ max-width:44rem; line-height:1.45; color:#ddd; }}
  .grid {{ display:grid; gap:24px; margin-top:24px; }}
  .card {{ background:#1b1b1b; border:1px solid #333; border-radius:10px; padding:16px; }}
  video, img {{ width:100%; max-width:420px; background:#000; display:block; }}
  pre {{ white-space:pre-wrap; background:#000; padding:12px; }}
</style></head>
<body>
<h1>Come As You Are — Reels, Shorts, Facebook</h1>
<p class="lead">
  15s silent vertical for Facebook Reels and YouTube Shorts (same file).
  Square stills for the Facebook feed. Footage is Ebenezer’s own livestream
  (360p archive) with burgundy over the type. Sunday time is <strong>9:45 AM</strong>.
</p>
<pre>{config.CAPTION}</pre>
<div class="grid">{"".join(cards)}</div>
</body></html>
"""
    (config.OUTPUT_DIR / "preview.html").write_text(html, encoding="utf-8")


def build() -> list[Path]:
    config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    config.WORK_DIR.mkdir(parents=True, exist_ok=True)
    vertical_dir = config.OUTPUT_DIR / "1080x1920"
    square_dir = config.OUTPUT_DIR / "1080x1080"
    vertical_dir.mkdir(parents=True, exist_ok=True)
    square_dir.mkdir(parents=True, exist_ok=True)
    (config.OUTPUT_DIR / "captions.txt").write_text(config.CAPTION, encoding="utf-8")
    (config.OUTPUT_DIR / "shorts-title.txt").write_text(config.SHORTS_TITLE + "\n", encoding="utf-8")

    outputs: list[Path] = []
    reel_frames = config.WORK_DIR / "reel"
    if reel_frames.exists():
        shutil.rmtree(reel_frames)
    reel_frames.mkdir(parents=True)
    frame_i = 0
    vw, vh = config.VERTICAL
    sw, sh = config.SQUARE

    for beat in config.BEATS:
        clip = config.CLIPS_DIR / str(beat["clip"])
        lines = beat["lines"]
        assert isinstance(lines, tuple)
        people = config.WORK_DIR / f"people-{beat['id']}"
        seconds = float(beat["seconds"])
        extracted = _extract_cover_frames(clip, people, vw, vh, seconds)
        files = sorted(people.glob("frame_*.jpg")) if extracted else []
        mid = Image.open(files[len(files) // 2]).convert("RGB") if files else Image.new(
            "RGB", (vw, vh), config.BURGUNDY
        )
        still_v = _compose(mid, lines, vw, vh, safe=True)
        still_path = vertical_dir / f"{beat['id']}.png"
        still_v.save(still_path, format="PNG")
        outputs.append(still_path)

        square_src = _cover(mid, sw, sh) if files else Image.new("RGB", (sw, sh), config.BURGUNDY)
        still_s = _compose(square_src, lines, sw, sh, safe=False)
        square_path = square_dir / f"{beat['id']}.png"
        still_s.save(square_path, format="PNG")
        outputs.append(square_path)

        n = max(1, int(round(seconds * config.FPS)))
        for local in range(n):
            if files:
                plate = Image.open(files[min(local, len(files) - 1)]).convert("RGB")
            else:
                plate = Image.new("RGB", (vw, vh), config.BURGUNDY)
            frame = _compose(plate, lines, vw, vh, safe=True)
            frame.save(reel_frames / f"frame_{frame_i:04d}.png", format="PNG")
            frame_i += 1

    reel = vertical_dir / "caya-reel-15.mp4"
    _write_mp4(reel_frames, reel, vw, vh)
    if reel.exists():
        outputs.append(reel)
    _preview(outputs)
    return outputs


if __name__ == "__main__":
    built = build()
    print(f"Duration: {sum(float(b['seconds']) for b in config.BEATS):g}s")
    for path in built:
        print(f"  {path}")
    print(f"Preview: {config.OUTPUT_DIR / 'preview.html'}")
