#!/usr/bin/env bash
# Fall Fresh promo — script-only runner (Python + ffmpeg)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required. Install: brew install ffmpeg" >&2
  exit 1
fi

CMD="${1:-}"
shift || true

case "$CMD" in
  setup)
    echo "venv ready: $ROOT/.venv"
    echo "ffmpeg: $(command -v ffmpeg)"
    python -c "import yt_dlp, PIL, qrcode; print('python deps ok')"
    ;;
  download)
    python assemble.py download
    ;;
  smoke)
    # Synthetic sources so you can verify the pipeline without YouTube.
    mkdir -p source
    for name in glory old_time metropolitan plans; do
      if [[ ! -f "source/${name}.mp4" ]]; then
        ffmpeg -y -f lavfi -i "testsrc=size=1280x720:rate=30" \
          -f lavfi -i "sine=frequency=440:sample_rate=48000" \
          -t 60 -c:v libx264 -pix_fmt yuv420p -c:a aac "source/${name}.mp4"
      fi
    done
    python assemble.py build "${1:-reel}"
    ;;
  build)
    python assemble.py build "${1:-all}"
    ;;
  endcard)
    python assemble.py endcard
    ;;
  *)
    cat <<'EOF'
Fall Fresh 2026 — script-only assembler

  ./run.sh setup
  ./run.sh download           # tries YouTube; if blocked, drop files into source/
  ./run.sh smoke              # fake clips + build 15s (pipeline test)
  ./run.sh build              # 15s reel + 30s landscape + 30s vertical
  ./run.sh build reel         # 15s only
  ./run.sh build main         # 30s only
  ./run.sh endcard            # QR end-card PNGs only

Manual sources (if YouTube blocks download):
  source/glory.mp4
  source/old_time.mp4
  source/metropolitan.mp4
  source/plans.mp4

Optional env:
  FALL_FRESH_REGISTER_URL=https://ebenezerbc.org/your-form ./run.sh build
  FALL_FRESH_VO=/path/to/vo.wav ./run.sh build main

Outputs land in ./output/
Edit scene times in config.py if a cut feels off.
EOF
    ;;
esac
