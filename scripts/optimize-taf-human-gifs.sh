#!/usr/bin/env bash
# Download, trim, and optimize two exact-match, Commons-verified public-domain TAF demos.
# Source and reuse terms are documented in THIRD_PARTY_NOTICES.md.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/github-pages-assets/taf"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

curl -fL --retry 2 \
  'https://upload.wikimedia.org/wikipedia/commons/3/33/Descriptive_Zoopraxography_Athlete%2C_Standing_Long_Jump_Animated.gif' \
  -o "$TMP/jump-source.gif"
curl -fL --retry 2 \
  'https://upload.wikimedia.org/wikipedia/commons/e/e6/Navy-seal-buds-training-push-ups.ogv' \
  -o "$TMP/push-up-source.ogv"

# Preserve Muybridge's full sequence and 2.2:1 aspect ratio; reduce the original
# 1.42 MB source to a lightweight 360px looping GIF.
ffmpeg -hide_banner -loglevel error -y -i "$TMP/jump-source.gif" \
  -filter_complex '[0:v]fps=10,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer' \
  -loop 0 "$OUT/jump-real.gif"

# Keep the source's 43–48 s complete push-up repetition, including the starting
# and ending high-plank position; omit audio and resize to a mobile-friendly width.
ffmpeg -hide_banner -loglevel error -y -ss 43 -i "$TMP/push-up-source.ogv" -t 5 \
  -an -filter_complex '[0:v]fps=7,scale=300:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer' \
  -loop 0 "$OUT/push-up-real.gif"

for name in jump push-up; do
  ffmpeg -hide_banner -loglevel error -y -i "$OUT/$name-real.gif" -frames:v 1 \
    -vf 'scale=720:-1:flags=lanczos' -c:v libwebp -quality 84 "$OUT/$name-real-poster.webp"
  size="$(stat -c %s "$OUT/$name-real.gif")"
  if (( size >= 1048576 )); then
    echo "ERROR: $name-real.gif is $size bytes (must be < 1 MiB)" >&2
    exit 1
  fi
  printf '%s\t%s bytes\n' "$name-real.gif" "$size"
  file "$OUT/$name-real-poster.webp"
done
