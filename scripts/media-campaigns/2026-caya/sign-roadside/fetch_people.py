#!/usr/bin/env python3
"""Download licensed Pexels church-family clips into source/people/."""

from __future__ import annotations

import urllib.request
from pathlib import Path

import config

USER_AGENT = "EBC-media-campaigns/caya (church volunteer build; +https://ebenezerbc.org)"


def _url(clip: dict[str, object]) -> str:
    pexels_id = clip["pexels_id"]
    fps = clip["fps"]
    return (
        f"https://videos.pexels.com/video-files/{pexels_id}/"
        f"{pexels_id}-hd_1280_720_{fps}fps.mp4"
    )


def fetch_one(clip: dict[str, object]) -> Path:
    dest = config.PEOPLE_DIR / str(clip["file"])
    if not clip.get("pexels_id"):
        if dest.exists():
            print(f"have {dest.name} (EBC clip — not from Pexels)")
        else:
            print(f"missing {dest.name} — copy from ../source/youtube/clips/")
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 10_000:
        print(f"have {dest.name}")
        return dest
    url = _url(clip)
    print(f"GET {dest.name}")
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=90) as response:
        dest.write_bytes(response.read())
    print(f"  {dest.stat().st_size} bytes")
    return dest


def main() -> None:
    config.PEOPLE_DIR.mkdir(parents=True, exist_ok=True)
    for clip in config.PEOPLE_CLIPS:
        fetch_one(clip)
    print(f"Clips: {config.PEOPLE_DIR}")
    print("License notes: PEOPLE.md  (Pexels — free to use, attribution kept)")


if __name__ == "__main__":
    main()
