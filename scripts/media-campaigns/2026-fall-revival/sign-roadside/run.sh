#!/usr/bin/env bash
# Fall Revival 2026 — roadside LED / VNNOX slides
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
    python build.py "$@"
    python compose_marque.py
    echo "Open: $ROOT/output/preview/index.html"
    echo "Save-the-date loop: $ROOT/output/1672x941/"
    echo "Night-of (one folder per night): $ROOT/output/1672x941-nights/"
    ;;
  *)
    cat <<'EOF'
Fall Revival 2026 — VNNOX / roadside LED

  ./run.sh setup
  ./run.sh build
  ./run.sh build --size 64x32 --size 128x64

Outputs land in ./output/<width>x<height>/
Edit copy or add a service time in config.py
EOF
    ;;
esac
