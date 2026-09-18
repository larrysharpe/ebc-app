#!/usr/bin/env python3
"""Render the Come As You Are VNNOX loop (kinetic type + optional LED native)."""

from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

import config
import people


def active_beats() -> tuple[dict[str, object], ...]:
    beats: list[dict[str, object]] = []
    for beat in config.BEATS:
        if beat["kind"] == "time" and not config.SHOW_SUNDAY_TIME:
            continue
        beats.append(beat)
    return tuple(beats)


def total_seconds(beats: tuple[dict[str, object], ...] | None = None) -> float:
    chosen = beats if beats is not None else active_beats()
    return float(sum(float(beat["seconds"]) for beat in chosen))


def _font_path() -> str:
    for candidate in config.FONT_CANDIDATES:
        if Path(candidate).exists():
            return candidate
    raise FileNotFoundError("No bold system font found (need Impact or Arial Black).")


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(_font_path(), size=size)


def _text_bbox(text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int, int, int]:
    dummy = Image.new("L", (1, 1))
    return ImageDraw.Draw(dummy).textbbox((0, 0), text, font=font)


def _max_font_size(text: str, box_w: int, box_h: int, ceiling: int) -> int:
    lo, hi, best = 8, ceiling, 8
    while lo <= hi:
        mid = (lo + hi) // 2
        left, top, right, bottom = _text_bbox(text, _load_font(mid))
        if (right - left) <= box_w and (bottom - top) <= box_h:
            best = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return best


def _ease_out(t: float) -> float:
    clamped = min(1.0, max(0.0, t))
    return 1.0 - (1.0 - clamped) ** 3


def motion(frame: int, total: int, intro: int, outro: int) -> tuple[float, float, int]:
    """Return (scale, alpha, dy) for a kinetic slam-in / fade-out."""
    if total <= 0:
        return 1.0, 1.0, 0
    if frame < intro:
        t = _ease_out((frame + 1) / max(1, intro))
        return 0.78 + 0.22 * t, t, int((1.0 - t) * 36)
    remaining = total - frame
    if remaining <= outro:
        t = remaining / max(1, outro)
        return 1.0, t, 0
    return 1.0, 1.0, 0


def _logo_path() -> Path | None:
    for candidate in config.LOGO_CANDIDATES:
        if candidate.exists():
            return candidate
    return None


def _solid_background(width: int, height: int, *, led: bool) -> Image.Image:
    fill = config.BLACK if led else config.BURGUNDY
    canvas = Image.new("RGB", (width, height), fill)
    return people.add_gold_frame(canvas, config.GOLD, config.GOLD_SOFT, led=led)


def _background(width: int, height: int, *, led: bool) -> Image.Image:
    return _solid_background(width, height, led=led)


def _extract_people_frames(
    clip: dict[str, object],
    seconds: float,
    width: int,
    height: int,
    dest: Path,
) -> bool:
    src = people.clip_path(config.PEOPLE_DIR, clip)
    if not src.exists():
        print(f"People clip missing ({src.name}) — solid burgundy for this beat")
        return False
    ffmpeg = ffmpeg_bin()
    if ffmpeg is None:
        print("ffmpeg missing — solid burgundy (cannot extract people frames)")
        return False
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    even_w, even_h = even_size(width, height)
    start = float(clip.get("start") or 0.0)
    cmd = [
        ffmpeg,
        "-y",
        "-ss",
        f"{start:.2f}",
        "-i",
        str(src),
        "-t",
        f"{seconds:.2f}",
        "-vf",
        (
            f"scale={even_w}:{even_h}:force_original_aspect_ratio=increase,"
            f"crop={even_w}:{even_h},eq=brightness=-0.06:saturation=0.88"
        ),
        "-r",
        str(config.FPS),
        "-q:v",
        "3",
        str(dest / "frame_%04d.jpg"),
    ]
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)
    return any(dest.glob("frame_*.jpg"))


def _people_plate(frames_dir: Path, local: int, width: int, height: int) -> Image.Image | None:
    files = sorted(frames_dir.glob("frame_*.jpg"))
    if not files:
        return None
    path = files[min(local, len(files) - 1)]
    plate = Image.open(path).convert("RGB")
    if plate.size != (width, height):
        plate = plate.resize((width, height), Image.Resampling.LANCZOS)
    veiled = people.blend_people(plate, config.BURGUNDY, config.PEOPLE_VEIL)
    return people.add_gold_frame(veiled, config.GOLD, config.GOLD_SOFT, led=False)


def _crisp_line(text: str, font: ImageFont.FreeTypeFont, fill: tuple[int, int, int]) -> Image.Image:
    left, top, right, bottom = _text_bbox(text, font)
    width = max(1, right - left)
    height = max(1, bottom - top)
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).text((-left, -top), text, font=font, fill=255)
    mask = mask.point(lambda pixel: 255 if pixel >= 140 else 0)
    line = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    line.paste(Image.new("RGB", (width, height), fill), (0, 0), mask)
    return line


def _soft_line(text: str, font: ImageFont.FreeTypeFont, fill: tuple[int, int, int]) -> Image.Image:
    left, top, right, bottom = _text_bbox(text, font)
    width = max(1, right - left)
    height = max(1, bottom - top)
    line = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ImageDraw.Draw(line).text((-left, -top), text, font=font, fill=(*fill, 255))
    return line


def render_stack(
    lines: tuple[tuple[str, tuple[int, int, int]], ...],
    width: int,
    height: int,
    *,
    led: bool,
) -> Image.Image:
    pad = 2 if led else max(28, width // 28)
    gap = 1 if led else max(8, height // 48)
    box_w = width - pad * 2
    band_h = (height - pad * 2 - gap * (len(lines) - 1)) // len(lines)
    ceiling = 120 if led else 620
    rendered: list[Image.Image] = []
    for text, fill in lines:
        font = _load_font(_max_font_size(text, box_w, band_h, ceiling))
        rendered.append(_crisp_line(text, font, fill) if led else _soft_line(text, font, fill))
    stack_w = max(img.width for img in rendered)
    stack_h = sum(img.height for img in rendered) + gap * (len(rendered) - 1)
    stack = Image.new("RGBA", (stack_w, stack_h), (0, 0, 0, 0))
    y = 0
    for img in rendered:
        stack.paste(img, ((stack_w - img.width) // 2, y), img)
        y += img.height + gap
    return stack


def _paste_logo(canvas: Image.Image, *, led: bool) -> Image.Image:
    if not config.SHOW_LOGO or led:
        return canvas
    path = _logo_path()
    if path is None:
        return canvas
    logo = Image.open(path).convert("RGBA")
    max_h = max(48, canvas.height // 9)
    logo.thumbnail((int(canvas.width * 0.28), max_h), Image.Resampling.LANCZOS)
    x = (canvas.width - logo.width) // 2
    y = canvas.height - logo.height - max(18, canvas.height // 28)
    out = canvas.convert("RGBA")
    out.paste(logo, (x, y), logo)
    return out.convert("RGB")


def render_hold_frame(
    beat: dict[str, object],
    width: int,
    height: int,
    *,
    led: bool,
    plate: Image.Image | None = None,
) -> Image.Image:
    canvas = plate if plate is not None and not led else _background(width, height, led=led)
    lines = beat["lines"]
    assert isinstance(lines, tuple)
    stack = render_stack(lines, width, height, led=led)
    if not led:
        stack = people.stack_with_shadow(stack)
    x = (width - stack.width) // 2
    y = (height - stack.height) // 2
    out = canvas.convert("RGBA")
    out.paste(stack, (x, y), stack)
    return _paste_logo(out.convert("RGB"), led=led)


def render_motion_frame(
    stack: Image.Image,
    background: Image.Image,
    width: int,
    height: int,
    frame: int,
    total: int,
) -> Image.Image:
    canvas = background.copy()
    intro = max(6, int(config.FPS * 0.35))
    outro = max(5, int(config.FPS * 0.25))
    scale, alpha, dy = motion(frame, total, intro, outro)
    shadowed = people.stack_with_shadow(stack)
    sw = max(1, int(shadowed.width * scale))
    sh = max(1, int(shadowed.height * scale))
    scaled = shadowed.resize((sw, sh), Image.Resampling.BILINEAR)
    if alpha < 0.999:
        r, g, b, a = scaled.split()
        a = a.point(lambda pixel: int(pixel * alpha))
        scaled = Image.merge("RGBA", (r, g, b, a))
    x = (width - scaled.width) // 2
    y = (height - scaled.height) // 2 + dy
    canvas.paste(scaled, (x, y), scaled)
    return _paste_logo(canvas.convert("RGB"), led=False)


def even_size(width: int, height: int) -> tuple[int, int]:
    return width + (width % 2), height + (height % 2)


def ffmpeg_bin() -> str | None:
    return shutil.which("ffmpeg")


def _write_mp4_from_frames(frames_dir: Path, dest: Path, width: int, height: int) -> None:
    ffmpeg = ffmpeg_bin()
    if ffmpeg is None:
        print("ffmpeg missing — stills are in output/; install ffmpeg to encode MP4")
        return
    even_w, even_h = even_size(width, height)
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg,
        "-y",
        "-framerate",
        str(config.FPS),
        "-i",
        str(frames_dir / "frame_%04d.png"),
        "-vf",
        f"scale={even_w}:{even_h}:flags=neighbor,format=yuv420p",
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


def _scale_mp4(src: Path, dest: Path, width: int, height: int) -> None:
    ffmpeg = ffmpeg_bin()
    if ffmpeg is None or not src.exists():
        return
    even_w, even_h = even_size(width, height)
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(src),
        "-vf",
        f"scale={even_w}:{even_h}:flags=lanczos,format=yuv420p",
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


def _write_preview_html(outputs: list[Path], seconds: float) -> None:
    cards = []
    for path in outputs:
        rel = path.name
        cards.append(
            f"""
      <article class="card">
        <h2>{path.stem}</h2>
        <video src="{rel}" controls loop muted playsinline></video>
      </article>"""
        )
    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Come As You Are — VNNOX loop</title>
  <style>
    :root {{ color-scheme: dark; }}
    body {{
      margin: 0; background: #111; color: #f4f4f4;
      font-family: Arial, sans-serif; padding: 24px;
    }}
    h1 {{ color: #FEB01C; font-size: 1.4rem; }}
    .lead {{ max-width: 44rem; line-height: 1.45; color: #ddd; }}
    .grid {{ display: grid; gap: 28px; margin-top: 28px; }}
    .card {{
      background: #1b1b1b; border: 1px solid #333; border-radius: 10px;
      padding: 16px 18px;
    }}
    video {{ width: 100%; max-width: 960px; background: #000; display: block; }}
    a {{ color: #EBBF5F; }}
  </style>
</head>
<body>
  <h1>Come As You Are — roadside sign loop</h1>
  <p class="lead">
    {seconds:g}s silent loop with church-family people under the type
    (stock, not EBC members — see PEOPLE.md). Upload the 1672×941
    (padded even) or 1920×1080 file to VNNOX the way VBS and the car-show
    ad were uploaded. Native 240×120 stays snap-cut type only — faces
    will not read at board pixels.     No QR. Logo off. Sunday time is <strong>9:45 AM</strong>.
  </p>
  <div class="grid">{"".join(cards)}</div>
</body>
</html>
"""
    preview = config.OUTPUT_DIR / "preview.html"
    preview.write_text(html, encoding="utf-8")


def build(sizes: tuple[str, ...] | None = None) -> list[Path]:
    config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    config.WORK_DIR.mkdir(parents=True, exist_ok=True)
    beats = active_beats()
    chosen = {row[0] for row in config.RENDER_SIZES}
    if sizes:
        chosen = set(sizes)
    outputs: list[Path] = []
    upload_mp4: Path | None = None

    for name, (width, height), mode in config.RENDER_SIZES:
        if name not in chosen and name != "upload":
            continue
        if name not in chosen and name == "upload":
            # Still render upload if HD scale was requested.
            if not any(label in chosen for label, _ in config.SCALE_FROM_UPLOAD):
                continue
        folder = config.WORK_DIR / name
        if folder.exists():
            shutil.rmtree(folder)
        folder.mkdir(parents=True)
        stills = config.OUTPUT_DIR / "stills" / name
        stills.mkdir(parents=True, exist_ok=True)
        solid = _background(width, height, led=False).convert("RGBA")
        frame_i = 0
        for beat in beats:
            n = max(1, int(round(float(beat["seconds"]) * config.FPS)))
            people_dir = folder / f"people-{beat['id']}"
            plate: Image.Image | None = None
            use_people = (
                mode != "led"
                and config.USE_PEOPLE_VIDEO
                and people.clip_for_beat(str(beat["id"]), config.PEOPLE_CLIPS) is not None
            )
            clip = people.clip_for_beat(str(beat["id"]), config.PEOPLE_CLIPS)
            if use_people and clip is not None:
                extracted = _extract_people_frames(
                    clip, float(beat["seconds"]), width, height, people_dir
                )
                if extracted:
                    plate = _people_plate(people_dir, n // 2, width, height)
            hold = render_hold_frame(
                beat, width, height, led=mode == "led", plate=plate
            )
            hold.save(stills / f"{beat['id']}.png", format="PNG")
            lines = beat["lines"]
            assert isinstance(lines, tuple)
            stack = render_stack(lines, width, height, led=False)
            for local in range(n):
                if mode == "led":
                    frame = hold
                else:
                    live = (
                        _people_plate(people_dir, local, width, height)
                        if use_people and people_dir.exists()
                        else None
                    )
                    background = (
                        live.convert("RGBA") if live is not None else solid
                    )
                    frame = render_motion_frame(
                        stack, background, width, height, local, n
                    )
                frame.save(folder / f"frame_{frame_i:04d}.png", format="PNG")
                frame_i += 1
        dest = config.OUTPUT_DIR / f"caya-sign-{width}x{height}.mp4"
        _write_mp4_from_frames(folder, dest, width, height)
        if dest.exists():
            outputs.append(dest)
            if name == "upload":
                upload_mp4 = dest

    if upload_mp4 is not None:
        for label, (width, height) in config.SCALE_FROM_UPLOAD:
            if sizes and label not in chosen:
                continue
            dest = config.OUTPUT_DIR / f"caya-sign-{width}x{height}.mp4"
            _scale_mp4(upload_mp4, dest, width, height)
            if dest.exists():
                outputs.append(dest)

    _write_preview_html(outputs, total_seconds(beats))
    return outputs


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Come As You Are VNNOX loop")
    parser.add_argument(
        "--size",
        action="append",
        choices=["upload", "hd", "native"],
        help="Only this output (repeatable): upload | hd | native",
    )
    args = parser.parse_args()
    sizes = tuple(args.size) if args.size else None
    outputs = build(sizes)
    print(f"Duration: {total_seconds():g}s  ({config.FPS} fps)")
    print(config.TIME_NOTE)
    if config.SHOW_LOGO and _logo_path() is None:
        print("SHOW_LOGO is on but no logo file was found — website type only.")
    for path in outputs:
        print(f"  {path}")
    print(f"Preview: {config.OUTPUT_DIR / 'preview.html'}")


if __name__ == "__main__":
    main()
