#!/usr/bin/env python3
"""Build compact 2-frame exercise GIFs from matched Free Exercise DB image pairs.

The upstream repository is yuhonas/free-exercise-db; its repository license is
The Unlicense. This script downloads only explicitly mapped exercise pairs and
writes optimized, looping GIFs to github-pages-assets/exercises/.
"""
from __future__ import annotations

import io
from pathlib import Path

import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "github-pages-assets" / "exercises"
BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"
USER_AGENT = "MONSTER-FIT exercise GIF build (https://github.com/jailtoncp/MONSTER-FIT)"

# Catalog ID -> exact upstream exercise directory.
EXERCISES = {
    "encolhimento": "Dumbbell_Shrug",
    "supino-inclinado": "Incline_Dumbbell_Press",
    "crucifixo-maquina": "Butterfly",
    "desenvolvimento-maquina": "Machine_Shoulder_Military_Press",
    "elevacao-lateral-cabo": "Cable_Seated_Lateral_Raise",
    "posterior-maquina": "Reverse_Machine_Flyes",
    "rosca-scott": "Machine_Preacher_Curls",
    "rosca-cabo": "Standing_Biceps_Cable_Curl",
    "triceps-corda": "Triceps_Pushdown_-_Rope_Attachment",
    "triceps-coice": "Tricep_Dumbbell_Kickback",
    "mergulho-banco": "Bench_Dips",
    "abdominal-cabo": "Cable_Crunch",
    "abdominal-roda": "Ab_Roller",
    "dead-bug": "Dead_Bug",
    "mountain-climber": "Mountain_Climbers",
    "caminhada-elastico": "Monster_Walk",
    "rosca-elastico": "Close-Grip_EZ-Bar_Curl_with_Band",
    "prancha-lateral": "Side_Bridge",
    "levantamento-lateral-caneleira": "Side_Leg_Raises",
}


def load_frame(session: requests.Session, directory: str, index: int) -> Image.Image:
    url = f"{BASE}/{directory}/{index}.jpg"
    response = session.get(url, timeout=30)
    response.raise_for_status()
    image = Image.open(io.BytesIO(response.content)).convert("RGB")
    # Preserve the whole source image while producing consistent lightweight frames.
    image.thumbnail((320, 240), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (320, 240), "white")
    canvas.paste(image, ((320 - image.width) // 2, (240 - image.height) // 2))
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    for exercise_id, directory in EXERCISES.items():
        frames = [load_frame(session, directory, index) for index in (0, 1)]
        # A shared palette avoids flicker between the source pair's two frames.
        palette = frames[0].quantize(colors=128, method=Image.Quantize.FASTOCTREE)
        frames = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
        # Loop the two distinct source positions; the GIF container repeats the pair.
        sequence = [frames[0], frames[1]]
        path = OUT / f"{exercise_id}.gif"
        sequence[0].save(
            path,
            save_all=True,
            append_images=sequence[1:],
            duration=[700, 700],
            loop=0,
            optimize=True,
            disposal=2,
        )
        with Image.open(path) as check:
            if check.format != "GIF" or check.n_frames < 2 or path.stat().st_size >= 1_000_000:
                raise RuntimeError(f"Invalid or oversized output: {path}")
        print(f"{exercise_id}: {path.stat().st_size:,} bytes, 320x240, {check.n_frames} frames ({directory})")

    # Bird-dog poses photographed by PTPioneer. All three Commons file pages
    # identify CC BY 2.0 and the same photographer/source account.
    bird_dog_urls = [
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bird_dog_exercise.jpg",
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Girl_doing_bird_dog_yoga_pose.jpg",
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Girl_doing_bird_dog_yoga_pose_2.jpg",
    ]
    frames = []
    for url in bird_dog_urls:
        response = session.get(url, timeout=30)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        image = ImageOps.contain(image, (320, 240), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (320, 240), "white")
        canvas.paste(image, ((320 - image.width) // 2, (240 - image.height) // 2))
        frames.append(canvas)
    palette = frames[0].quantize(colors=128, method=Image.Quantize.FASTOCTREE)
    frames = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
    bird_path = OUT / "bird-dog.gif"
    frames[0].save(
        bird_path,
        save_all=True,
        append_images=frames[1:],
        duration=[900, 900, 900],
        loop=0,
        optimize=True,
        disposal=2,
    )
    with Image.open(bird_path) as check:
        if check.format != "GIF" or check.n_frames < 2 or bird_path.stat().st_size >= 1_000_000:
            raise RuntimeError(f"Invalid or oversized output: {bird_path}")
        print(f"bird-dog: {bird_path.stat().st_size:,} bytes, 320x240, {check.n_frames} frames (PTPioneer / CC BY 2.0)")


if __name__ == "__main__":
    main()
