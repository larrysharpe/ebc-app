#!/usr/bin/env bash
# Come As You Are — roadside VNNOX motion loop
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
    command -v ffmpeg >/dev/null && echo "ffmpeg: $(command -v ffmpeg)" || echo "ffmpeg missing — stills still work"
    ;;
  fetch-people)
    python fetch_people.py
    ;;
  test)
    python -m unittest test_people.py
    ;;
  build)
    python build.py "$@"
    echo "Open: $ROOT/output/preview.html"
    echo "Upload (Sunday Service size): $ROOT/output/caya-sign-1672x941.mp4"
    echo "Or HD (car-show size):        $ROOT/output/caya-sign-1920x1080.mp4"
    ;;
  *)
    cat <<'EOF'
Come As You Are — VNNOX / roadside LED loop

  ./run.sh setup
  ./run.sh fetch-people
  ./run.sh test
  ./run.sh build
  ./run.sh build --size upload
  ./run.sh build --size hd
  ./run.sh build --size native

Edit copy, Sunday time, people clips, or logo in config.py
People notes: PEOPLE.md
Outputs land in ./output/
EOF
    ;;
esac
