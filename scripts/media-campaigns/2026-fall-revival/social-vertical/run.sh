#!/usr/bin/env bash
# Fall Revival 2026 — vertical social cards + 20s stills reel
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt

CMD="${1:-build}"
shift || true

case "$CMD" in
  setup)
    echo "venv ready: $ROOT/.venv"
    python -c "from PIL import Image; print('pillow', Image.__version__)"
    command -v ffmpeg >/dev/null && echo "ffmpeg: $(command -v ffmpeg)" || echo "ffmpeg missing — PNGs still work"
    ;;
  build)
    python build.py
    echo "Open: $ROOT/output/1080x1920/index.html"
    echo "Cards: $ROOT/output/1080x1920/"
    ;;
  *)
    cat <<'EOF'
Fall Revival 2026 — YouTube Shorts / Facebook Reels

  ./run.sh setup
  ./run.sh build

Outputs:
  output/1080x1920/*.png          vertical stills
  output/1080x1920/revival-reel-20.mp4
  output/preview-1080x1920.png

Edit copy in config.py. Do not add a service time unless confirmed.
No QR codes — website stays as text.
EOF
    ;;
esac
