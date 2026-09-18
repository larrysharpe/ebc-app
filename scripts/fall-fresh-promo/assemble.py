#!/usr/bin/env python3
"""
Fall Fresh 2026 promo assembler — script-only (Python + ffmpeg).

No CapCut / Premiere required.

Usage:
  ./run.sh download
  ./run.sh build              # reel-15 + main-30 + main-30-vertical
  ./run.sh build reel         # 15s only
  ./run.sh build main         # 30s landscape + vertical
  ./run.sh endcard            # regenerate end-card stills only

Optional:
  FALL_FRESH_REGISTER_URL=https://yoursite/register ./run.sh build
  FALL_FRESH_VO=/path/to/vo.wav ./run.sh build main   # mix VO under main cut
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont

import config


def run(cmd: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    print("+", " ".join(cmd))
    return subprocess.run(cmd, check=check, text=True, capture_output=False)


def ensure_dirs() -> None:
    for path in (config.SOURCE_DIR, config.WORK_DIR, config.OUTPUT_DIR, config.ASSETS_DIR):
        path.mkdir(parents=True, exist_ok=True)


def register_url() -> str:
    return os.environ.get("FALL_FRESH_REGISTER_URL", config.REGISTER_URL).strip()


def pick_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in config.FONT_CANDIDATES:
        path = Path(candidate)
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def _normalize_source_name(key: str, out: Path) -> None:
    """Accept glory.mp4 / glory.webm / glory.mkv and normalize to configured path."""
    if out.exists() and out.stat().st_size > 100_000:
        return
    candidates = sorted(config.SOURCE_DIR.glob(f"{out.stem}.*"))
    # Also accept human drop-ins: glory.mp4 already handled; try key.* 
    candidates += sorted(config.SOURCE_DIR.glob(f"{key}.*"))
    seen: set[Path] = set()
    uniq: list[Path] = []
    for c in candidates:
        if c in seen or c.name.startswith("."):
            continue
        seen.add(c)
        uniq.append(c)
    if not uniq:
        return
    preferred = next((c for c in uniq if c.suffix.lower() == ".mp4"), uniq[0])
    if preferred.resolve() != out.resolve():
        if out.exists():
            out.unlink()
        # Convert non-mp4 to mp4 for consistent concat
        if preferred.suffix.lower() != ".mp4":
            run(
                [
                    ffmpeg_bin(),
                    "-y",
                    "-i",
                    str(preferred),
                    "-c",
                    "copy",
                    str(out),
                ],
                check=False,
            )
            if not out.exists():
                run(
                    [
                        ffmpeg_bin(),
                        "-y",
                        "-i",
                        str(preferred),
                        "-c:v",
                        "libx264",
                        "-c:a",
                        "aac",
                        str(out),
                    ]
                )
        else:
            preferred.rename(out)


def download_sources() -> None:
    ensure_dirs()
    try:
        import yt_dlp
    except ImportError as exc:
        raise SystemExit("yt-dlp missing. Run: ./run.sh setup") from exc

    for key, meta in config.SOURCES.items():
        out: Path = meta["file"]
        if not meta.get("url") or str(meta.get("id", "")).startswith("still-"):
            if out.exists():
                print(f"skip still/asset ({key}): {out.name}")
            else:
                print(f"missing still/asset ({key}): {out}")
            continue
        _normalize_source_name(key, out)
        if out.exists() and out.stat().st_size > 100_000:
            print(f"skip download ({key}): {out.name}")
            continue
        print(f"downloading {key}: {meta['title']}")
        opts: dict[str, Any] = {
            "outtmpl": str(config.SOURCE_DIR / f"{out.stem}.%(ext)s"),
            "merge_output_format": "mp4",
            # Progressive MP4 (format 18) is most reliable when SABR/PO tokens break dash.
            "format": "18/bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b",
            "quiet": False,
            "noplaylist": True,
            "extractor_args": {"youtube": {"player_client": ["android", "ios", "tv"]}},
        }
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                ydl.download([meta["url"]])
        except Exception as exc:  # noqa: BLE001 — surface and continue guidance
            print(f"AUTO-DOWNLOAD FAILED for {key}: {exc}")
            print(
                f"  Manual fix: save the video as:\n"
                f"    {out}\n"
                f"  (or any {out.stem}.* in {config.SOURCE_DIR}) then re-run ./run.sh download"
            )
            continue
        _normalize_source_name(key, out)
        if out.exists():
            print(f"saved {out}")
        else:
            print(f"still missing: {out}")

    present = [k for k, m in config.SOURCES.items() if m["file"].exists()]
    missing = [k for k in config.SOURCES if k not in present]
    print(f"sources ready: {', '.join(present) or '(none)'}")
    if missing:
        print(f"sources missing: {', '.join(missing)}")
        print("Drop files into source/ then run: ./run.sh build")


def make_qr(path: Path, url: str, box_size: int = 10) -> None:
    import qrcode

    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=box_size, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    img.save(path)


def make_end_card(width: int, height: int, out_path: Path) -> None:
    burgundy = config.BRAND["burgundy"]
    gold = config.BRAND["gold"]
    white = config.BRAND["white"]

    img = Image.new("RGB", (width, height), burgundy)
    draw = ImageDraw.Draw(img)

    # Soft gold accent bar
    bar_h = max(8, height // 80)
    draw.rectangle([0, height // 5, width, height // 5 + bar_h], fill=gold)
    draw.rectangle([0, (height * 4) // 5, width, (height * 4) // 5 + bar_h], fill=gold)

    logo_path = config.LOGO_TRANSPARENT if config.LOGO_TRANSPARENT.exists() else config.LOGO_FULL
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        max_w = int(width * 0.55)
        max_h = int(height * 0.22)
        logo.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        lx = (width - logo.width) // 2
        ly = int(height * 0.12)
        img.paste(logo, (lx, ly), logo)

    title_font = pick_font(max(36, width // 22))
    sub_font = pick_font(max(28, width // 30))
    small_font = pick_font(max(22, width // 40))

    def center_text(text: str, y: int, font: ImageFont.ImageFont, fill: tuple[int, int, int]) -> None:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        draw.text(((width - tw) // 2, y), text, font=font, fill=fill)

    center_text("FALL FRESH 2026", int(height * 0.38), title_font, gold)
    center_text("Choir Workshop", int(height * 0.38) + int(height * 0.06), sub_font, white)
    center_text("Sept 18–20 · Ebenezer Baptist", int(height * 0.38) + int(height * 0.12), small_font, white)
    center_text("All singers welcome", int(height * 0.38) + int(height * 0.17), small_font, gold)

    qr_path = config.WORK_DIR / "qr.png"
    make_qr(qr_path, register_url(), box_size=12 if width >= 1080 else 8)
    qr = Image.open(qr_path).convert("RGB")
    qr_size = int(min(width, height) * 0.22)
    qr = qr.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
    qx = (width - qr_size) // 2
    qy = int(height * 0.68)
    # white pad behind QR
    pad = 16
    draw.rectangle([qx - pad, qy - pad, qx + qr_size + pad, qy + qr_size + pad], fill=white)
    img.paste(qr, (qx, qy))
    center_text("Scan to register", qy + qr_size + pad + 8, small_font, white)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)
    print(f"end card -> {out_path}")


def make_label_png(text: str, width: int, height: int, out_path: Path) -> None:
    """Transparent lower-third style label."""
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    font = pick_font(max(28, width // 24))
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad_x, pad_y = 28, 16
    box_w, box_h = tw + pad_x * 2, th + pad_y * 2
    x = (width - box_w) // 2
    y = int(height * 0.78)
    draw.rounded_rectangle([x, y, x + box_w, y + box_h], radius=12, fill=(137, 22, 25, 210))
    draw.text((x + pad_x, y + pad_y), text, font=font, fill=config.BRAND["gold"] + (255,))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)


def ffmpeg_bin() -> str:
    path = shutil.which("ffmpeg")
    if not path:
        raise SystemExit("ffmpeg not found. Install with: brew install ffmpeg")
    return path


def _lt_overlay_filter(width: int, height: int, lt_input: str = "1") -> str:
    """Scale lower-third to frame, key out black, center overlay."""
    return (
        f"[{lt_input}:v]scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"format=rgba,colorkey=0x000000:0.18:0.12[ltk];"
    )


def render_scene_clip(
    *,
    source_file: Path,
    start: float,
    duration: float,
    width: int,
    height: int,
    label: str,
    out_file: Path,
    lower_third: Path | None = None,
) -> None:
    base = (
        f"[0:v]scale={width}:{height}:force_original_aspect_ratio=increase,"
        f"crop={width}:{height},setsar=1[bg];"
    )
    cmd = [
        ffmpeg_bin(),
        "-y",
        "-ss",
        str(start),
        "-t",
        str(duration),
        "-i",
        str(source_file),
    ]

    if lower_third and lower_third.exists():
        cmd += ["-i", str(lower_third)]
        filter_complex = (
            base
            + _lt_overlay_filter(width, height, "1")
            + "[bg][ltk]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p[v]"
        )
    else:
        label_png = out_file.with_suffix(".label.png")
        make_label_png(label, width, height, label_png)
        cmd += ["-i", str(label_png)]
        filter_complex = (
            base
            + "[1:v]format=rgba[ov];"
            + "[bg][ov]overlay=0:0:format=auto,format=yuv420p[v]"
        )

    cmd += [
        "-filter_complex",
        filter_complex,
        "-map",
        "[v]",
        "-map",
        "0:a?",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
        "-r",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-t",
        str(duration),
        str(out_file),
    ]
    run(cmd)


def image_to_video(image: Path, seconds: float, width: int, height: int, out_file: Path) -> None:
    cmd = [
        ffmpeg_bin(),
        "-y",
        "-loop",
        "1",
        "-framerate",
        "30",
        "-t",
        str(seconds),
        "-i",
        str(image),
        "-f",
        "lavfi",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-t",
        str(seconds),
        "-vf",
        f"scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p",
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-r",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-t",
        str(seconds),
        str(out_file),
    ]
    run(cmd)


def make_still_frame(
    image_path: Path,
    width: int,
    height: int,
    out_path: Path,
    *,
    full_bleed: bool = False,
    # 0.0 = favor top of photo (keeps head in frame), 0.5 = center, 1.0 = bottom
    vertical_bias: float = 0.18,
) -> None:
    """Portrait still — full-bleed cover when pairing with a lower-third graphic."""
    photo = Image.open(image_path).convert("RGB")
    if full_bleed:
        # Cover-crop to exact frame (no burgundy letterbox)
        scale = max(width / photo.width, height / photo.height)
        nw, nh = int(photo.width * scale), int(photo.height * scale)
        photo = photo.resize((nw, nh), Image.Resampling.LANCZOS)
        left = (nw - width) // 2
        excess_y = max(0, nh - height)
        bias = min(1.0, max(0.0, vertical_bias))
        top = int(excess_y * bias)
        canvas = photo.crop((left, top, left + width, top + height))
    else:
        burgundy = config.BRAND["burgundy"]
        gold = config.BRAND["gold"]
        canvas = Image.new("RGB", (width, height), burgundy)
        draw = ImageDraw.Draw(canvas)
        bar_h = max(6, height // 90)
        draw.rectangle([0, int(height * 0.08), width, int(height * 0.08) + bar_h], fill=gold)
        draw.rectangle([0, int(height * 0.92), width, int(height * 0.92) + bar_h], fill=gold)

        photo_rgba = photo.convert("RGBA")
        max_w = int(width * 0.62)
        max_h = int(height * 0.72)
        photo_rgba.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        px = (width - photo_rgba.width) // 2
        py = (height - photo_rgba.height) // 2
        pad = 10
        draw.rectangle(
            [px - pad, py - pad, px + photo_rgba.width + pad, py + photo_rgba.height + pad],
            outline=gold,
            width=4,
        )
        canvas.paste(photo_rgba, (px, py), photo_rgba)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path)


def render_still_scene(
    *,
    image_path: Path,
    duration: float,
    width: int,
    height: int,
    label: str,
    audio_from: Path,
    audio_start: float,
    out_file: Path,
    lower_third: Path | None = None,
) -> None:
    still_png = out_file.with_suffix(".still.png")
    use_lt = bool(lower_third and lower_third.exists())
    make_still_frame(image_path, width, height, still_png, full_bleed=use_lt)

    cmd = [
        ffmpeg_bin(),
        "-y",
        "-loop",
        "1",
        "-framerate",
        "30",
        "-t",
        str(duration),
        "-i",
        str(still_png),
    ]

    if use_lt:
        assert lower_third is not None
        cmd += ["-i", str(lower_third)]
        filter_complex = (
            f"[0:v]scale={width}:{height},setsar=1[bg];"
            + _lt_overlay_filter(width, height, "1")
            + "[bg][ltk]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p[v]"
        )
        audio_map_index = "2:a"
        cmd += [
            "-ss",
            str(audio_start),
            "-t",
            str(duration),
            "-i",
            str(audio_from),
        ]
    else:
        label_png = out_file.with_suffix(".label.png")
        make_label_png(label, width, height, label_png)
        cmd += ["-i", str(label_png)]
        filter_complex = (
            f"[0:v]scale={width}:{height},setsar=1[bg];"
            f"[1:v]format=rgba[ov];"
            f"[bg][ov]overlay=0:0:format=auto,format=yuv420p[v]"
        )
        audio_map_index = "2:a"
        cmd += [
            "-ss",
            str(audio_start),
            "-t",
            str(duration),
            "-i",
            str(audio_from),
        ]

    cmd += [
        "-filter_complex",
        filter_complex,
        "-map",
        "[v]",
        "-map",
        audio_map_index,
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-r",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-t",
        str(duration),
        str(out_file),
    ]
    run(cmd)


def concat_clips(clips: list[Path], out_file: Path) -> None:
    list_file = config.WORK_DIR / f"{out_file.stem}_concat.txt"
    lines = []
    for clip in clips:
        # concat demuxer needs escaped single quotes
        escaped = str(clip.resolve()).replace("'", "'\\''")
        lines.append(f"file '{escaped}'")
    list_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
    cmd = [
        ffmpeg_bin(),
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(list_file),
        "-vf",
        "fps=30,format=yuv420p",
        "-af",
        "aresample=48000",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
        "-r",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-movflags",
        "+faststart",
        str(out_file),
    ]
    run(cmd)


def mix_vo(video: Path, vo_path: Path, out_file: Path) -> None:
    """Keep music quieter under voiceover."""
    cmd = [
        ffmpeg_bin(),
        "-y",
        "-i",
        str(video),
        "-i",
        str(vo_path),
        "-filter_complex",
        "[0:a]volume=0.35[a0];[1:a]volume=1.0[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[a]",
        "-map",
        "0:v",
        "-map",
        "[a]",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        str(out_file),
    ]
    run(cmd)


def build_edit(edit: dict[str, Any]) -> Path:
    ensure_dirs()
    name = edit["name"]
    width = int(edit["width"])
    height = int(edit["height"])
    work = config.WORK_DIR / name
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)

    missing = []
    for scene in edit["scenes"]:
        src = config.SOURCES[scene["source"]]["file"]
        if not src.exists():
            missing.append(str(src))
        if scene.get("kind") == "still":
            audio_key = scene.get("audio_from")
            if audio_key:
                audio_file = config.SOURCES[audio_key]["file"]
                if not audio_file.exists():
                    missing.append(str(audio_file))
        lt_key = scene.get("lower_third")
        if lt_key:
            lt_file = config.SOURCES[lt_key]["file"]
            if not lt_file.exists():
                missing.append(str(lt_file))
    if missing:
        raise SystemExit(
            "Missing source clips. Run: ./run.sh download\n  - " + "\n  - ".join(missing)
        )

    clips: list[Path] = []
    for idx, scene in enumerate(edit["scenes"]):
        src = config.SOURCES[scene["source"]]["file"]
        out = work / f"scene_{idx:02d}.mp4"
        kind = scene.get("kind", "video")
        lt_key = scene.get("lower_third")
        lt_path = config.SOURCES[lt_key]["file"] if lt_key else None
        if kind == "still":
            audio_key = str(scene["audio_from"])
            audio_file = config.SOURCES[audio_key]["file"]
            print(
                f"[{name}] scene {idx}: STILL {scene['source']} "
                f"({scene['duration']}s) audio={audio_key}@{scene.get('audio_start', 0)}s"
                + (f" lt={lt_key}" if lt_key else "")
            )
            render_still_scene(
                image_path=src,
                duration=float(scene["duration"]),
                width=width,
                height=height,
                label=str(scene.get("label", "")),
                audio_from=audio_file,
                audio_start=float(scene.get("audio_start", 0)),
                out_file=out,
                lower_third=lt_path,
            )
        else:
            print(
                f"[{name}] scene {idx}: {scene['source']} "
                f"@ {scene['start']}s ({scene['duration']}s)"
                + (f" lt={lt_key}" if lt_key else "")
            )
            render_scene_clip(
                source_file=src,
                start=float(scene["start"]),
                duration=float(scene["duration"]),
                width=width,
                height=height,
                label=str(scene.get("label", "")),
                out_file=out,
                lower_third=lt_path,
            )
        clips.append(out)

    end_img = work / "endcard.png"
    make_end_card(width, height, end_img)
    end_vid = work / "endcard.mp4"
    image_to_video(end_img, float(edit["end_card_seconds"]), width, height, end_vid)
    clips.append(end_vid)

    final = config.OUTPUT_DIR / f"fall-fresh-{name}.mp4"
    concat_clips(clips, final)

    vo = os.environ.get("FALL_FRESH_VO", "").strip()
    if vo and Path(vo).exists() and "main" in name:
        mixed = config.OUTPUT_DIR / f"fall-fresh-{name}-vo.mp4"
        mix_vo(final, Path(vo), mixed)
        print(f"with VO -> {mixed}")

    print(f"DONE -> {final}")
    return final


def build_all( whichtarget: str) -> None:
    if whichtarget in ("all", "reel"):
        build_edit(config.REEL_15)
    if whichtarget in ("all", "main"):
        build_edit(config.MAIN_30)
        build_edit(config.MAIN_30_VERTICAL)


def write_endcards_only() -> None:
    ensure_dirs()
    make_end_card(1080, 1920, config.OUTPUT_DIR / "endcard-9x16.png")
    make_end_card(1920, 1080, config.OUTPUT_DIR / "endcard-16x9.png")
    print(f"QR points to: {register_url()}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fall Fresh 2026 script-only promo assembler")
    parser.add_argument(
        "command",
        choices=["setup", "download", "build", "endcard"],
        help="setup | download | build | endcard",
    )
    parser.add_argument(
        "target",
        nargs="?",
        default="all",
        choices=["all", "reel", "main"],
        help="for build: all | reel | main",
    )
    args = parser.parse_args()

    if args.command == "setup":
        print("Dependencies live in .venv — use ./run.sh (it creates/uses the venv).")
        return
    if args.command == "download":
        download_sources()
        return
    if args.command == "endcard":
        write_endcards_only()
        return
    if args.command == "build":
        build_all(args.target)
        return


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        print(f"ffmpeg failed with exit {exc.returncode}", file=sys.stderr)
        sys.exit(exc.returncode)
