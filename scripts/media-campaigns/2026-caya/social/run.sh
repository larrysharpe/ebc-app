#!/usr/bin/env bash
# Come As You Are — Facebook / YouTube Shorts
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
    command -v ffmpeg >/dev/null && echo "ffmpeg: $(command -v ffmpeg)" || echo "ffmpeg missing"
    ;;
  test)
    python -m unittest test_social.py
    ;;
  build)
    python build.py "$@"
    echo "Open: $ROOT/output/preview.html"
    echo "Reels / Shorts: $ROOT/output/1080x1920/caya-reel-15.mp4"
    echo "Facebook feed:  $ROOT/output/1080x1080/"
    echo "Caption:        $ROOT/output/captions.txt"
    ;;
  *)
    cat <<'EOF'
Come As You Are — Facebook Reels, feed posts, YouTube Shorts

  ./run.sh setup
  ./run.sh test
  ./run.sh build

Need the EBC clips in ../source/youtube/clips/ first.
EOF
    ;;
esac
