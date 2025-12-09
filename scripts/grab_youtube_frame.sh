#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/grab_youtube_frame.sh <youtube_url_or_id> <output_path> [time_sec]
# Example:
#   ./scripts/grab_youtube_frame.sh https://youtu.be/kCoPdMCVcN4 content/projects/畑ロボット/silver-cart/images/cover.jpg 5
#
# Requires: yt-dlp, ffmpeg

if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "[error] yt-dlp not found. Install: pipx install yt-dlp (or brew install yt-dlp)" >&2
  exit 1
fi
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "[error] ffmpeg not found. Install: brew install ffmpeg (or your platform equivalent)" >&2
  exit 1
fi

YURL="${1:-}"
OUT="${2:-}"
TSEC="${3:-5}"

if [[ -z "$YURL" || -z "$OUT" ]]; then
  echo "Usage: $0 <youtube_url_or_id> <output_path> [time_sec]" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"

tmpdir="$(mktemp -d 2>/dev/null || mktemp -d -t ytf)"
trap 'rm -rf "$tmpdir"' EXIT

echo "[info] Downloading best mp4 stream..."
yt-dlp -f 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best' -o "$tmpdir/video.%(ext)s" "$YURL" -q

vid="$(ls -1 "$tmpdir"/video.* | head -n1)"
if [[ ! -f "$vid" ]]; then
  echo "[error] failed to download video" >&2
  exit 1
fi

echo "[info] Extracting frame at ${TSEC}s -> $OUT"
ffmpeg -hide_banner -loglevel error -ss "$TSEC" -i "$vid" -frames:v 1 -q:v 2 "$OUT"

echo "[done] Wrote: $OUT"

