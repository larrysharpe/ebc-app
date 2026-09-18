"""People B-roll helpers for the Come As You Are sign loop.

Stock clips only — not EBC members. Swap files in source/people/ when
the church films its own greeters (do not use EBC kids without consent).
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


def veil_alpha(value: float) -> float:
    """Keep the burgundy wash strong enough for type, light enough for faces."""
    return min(0.85, max(0.15, float(value)))


def clip_for_beat(
    beat_id: str,
    clips: tuple[dict[str, object], ...],
) -> dict[str, object] | None:
    for clip in clips:
        if clip.get("beat_id") == beat_id:
            return clip
    return None


def clip_path(people_dir: Path, clip: dict[str, object]) -> Path:
    return people_dir / str(clip["file"])


def blend_people(
    people: Image.Image,
    color: tuple[int, int, int],
    alpha: float,
) -> Image.Image:
    plate = people.convert("RGB")
    veil = Image.new("RGB", plate.size, color)
    return Image.blend(plate, veil, veil_alpha(alpha))


def add_gold_frame(
    canvas: Image.Image,
    gold: tuple[int, int, int],
    gold_soft: tuple[int, int, int],
    *,
    led: bool,
) -> Image.Image:
    out = canvas.convert("RGB")
    draw = ImageDraw.Draw(out)
    width, height = out.size
    bar = 2 if led else max(8, height // 48)
    inset = 1 if led else max(16, width // 40)
    draw.rectangle([0, 0, width, bar], fill=gold)
    draw.rectangle([0, height - bar, width, height], fill=gold)
    if not led:
        draw.rectangle(
            [inset, bar + inset // 2, width - inset, height - bar - inset // 2],
            outline=gold_soft,
            width=max(2, height // 220),
        )
    return out


def stack_with_shadow(stack: Image.Image, offset: int = 5) -> Image.Image:
    """Dark drop shadow so gold/white type stays readable over faces."""
    width = stack.width + offset
    height = stack.height + offset
    out = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    _red, _green, _blue, alpha = stack.split()
    shadow = Image.merge(
        "RGBA",
        (
            Image.new("L", stack.size, 0),
            Image.new("L", stack.size, 0),
            Image.new("L", stack.size, 0),
            alpha.point(lambda pixel: int(pixel * 0.7)),
        ),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=2))
    out.paste(shadow, (offset, offset), shadow)
    out.paste(stack, (0, 0), stack)
    return out
