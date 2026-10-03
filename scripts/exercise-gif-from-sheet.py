#!/usr/bin/env python3
"""Convert a 2x2 AI-generated exercise pose sheet into a lightweight looping GIF.

The input sheet is split into four equal frames in row-major order. The return
sequence (start -> mid -> peak -> return -> peak -> mid) is looped at natural
speed. The converter preserves the original pose content, removes no subject
content, resizes proportionally, and keeps each resulting GIF under 1 MB.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps

MAX_BYTES = 1_000_000
SEQUENCE = (0, 1, 2, 3, 2, 1)


def crop_grid(image: Image.Image) -> list[Image.Image]:
    width, height = image.size
    mid_x, mid_y = width // 2, height // 2
    boxes = (
        (0, 0, mid_x, mid_y),
        (mid_x, 0, width, mid_y),
        (0, mid_y, mid_x, height),
        (mid_x, mid_y, width, height),
    )
    # The generator may draw thin white grid lines. Trim a small fraction from
    # each cell edge; the requested full-body margin keeps the athlete intact.
    inset_x = max(1, round(mid_x * 0.012))
    inset_y = max(1, round(mid_y * 0.012))
    return [image.crop((left + inset_x, top + inset_y, right - inset_x, bottom - inset_y)) for left, top, right, bottom in boxes]


def make_frames(sheet: Image.Image, width: int, colors: int) -> list[Image.Image]:
    poses = crop_grid(sheet)
    target_height = max(1, round(width * poses[0].height / poses[0].width))
    resized = [pose.resize((width, target_height), resample=Image.Resampling.LANCZOS) for pose in poses]
    # Build one palette from all distinct poses so colors remain stable in motion.
    palette_source = Image.new("RGB", (width, target_height * len(resized)))
    for index, frame in enumerate(resized):
        palette_source.paste(frame, (0, index * target_height))
    palette = palette_source.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    return [resized[index].quantize(palette=palette, dither=Image.Dither.NONE) for index in SEQUENCE]


def export(sheet_path: Path, output_path: Path) -> int:
    with Image.open(sheet_path) as source:
        sheet = source.convert("RGB")
    if sheet.width < 8 or sheet.height < 8:
        raise ValueError("A imagem precisa conter uma folha 2×2 com resolução suficiente.")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    attempts = ((320, 128), (280, 112), (240, 96), (220, 80))
    for width, colors in attempts:
        frames = make_frames(sheet, width, colors)
        temporary = output_path.with_suffix(".tmp.gif")
        frames[0].save(
            temporary,
            format="GIF",
            save_all=True,
            append_images=frames[1:],
            duration=150,
            loop=0,
            optimize=True,
            disposal=2,
        )
        size = temporary.stat().st_size
        if size <= MAX_BYTES:
            temporary.replace(output_path)
            return size
        temporary.unlink()
    raise ValueError("Não foi possível otimizar o GIF abaixo de 1 MB; confira a folha de origem.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sheet", type=Path, help="PNG/JPG com quatro poses em grade 2×2")
    parser.add_argument("output", type=Path, help="Destino .gif")
    args = parser.parse_args()
    if args.output.suffix.lower() != ".gif":
        parser.error("O arquivo de destino precisa ter extensão .gif")
    try:
        size = export(args.sheet, args.output)
    except Exception as error:  # Keep CLI errors concise and actionable.
        print(f"Erro: {error}", file=sys.stderr)
        return 1
    print(f"{args.output}: {size:,} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
