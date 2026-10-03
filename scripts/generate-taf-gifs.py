#!/usr/bin/env python3
"""Generate original, loopable schematic GIF demonstrations for the MONSTER FIT TAF library.

Run from the repository root with Python 3 and Pillow installed:
  python3 scripts/generate-taf-gifs.py

The GIFs use deterministic vector-like drawing at 2x resolution and are written into
GitHub Pages' existing asset source directory. They contain no externally sourced pixels.
"""
from __future__ import annotations

import math
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "github-pages-assets" / "taf"
W, H, SCALE = 360, 180, 2
FRAMES = 24
DURATION_MS = 90
BG = "#fbf4f7"
BG2 = "#f7eaf0"
DARK = "#765368"
ROSE = "#c85f89"
LIGHT = "#e6b4c8"
GROUND = "#d6bfca"
SKIN = "#fff9fb"

Pose = dict[str, tuple[float, float]]


def point(x: float, y: float) -> tuple[int, int]:
    return round(x * SCALE), round(y * SCALE)


def line(draw: ImageDraw.ImageDraw, coords: list[tuple[float, float]], fill: str, width: float = 3, joint: str = "curve") -> None:
    draw.line([point(x, y) for x, y in coords], fill=fill, width=round(width * SCALE), joint=joint)


def circle(draw: ImageDraw.ImageDraw, xy: tuple[float, float], radius: float, fill: str, outline: str | None = None, width: float = 2) -> None:
    x, y = xy
    box = (round((x-radius)*SCALE), round((y-radius)*SCALE), round((x+radius)*SCALE), round((y+radius)*SCALE))
    draw.ellipse(box, fill=fill, outline=outline, width=round(width*SCALE) if outline else 1)


def draw_person(draw: ImageDraw.ImageDraw, p: Pose) -> None:
    # Rear-side limbs first, followed by a rose torso, front-side limbs and head.
    line(draw, [p["neck"], p["hip"]], ROSE, 9)
    for side in ("r", "l"):
        line(draw, [p["neck"], p[f"elbow_{side}"], p[f"hand_{side}"]], DARK, 6)
        line(draw, [p["hip"], p[f"knee_{side}"], p[f"foot_{side}"]], DARK, 7)
    circle(draw, p["head"], 8, SKIN, DARK, 3)
    for name in ("neck", "elbow_l", "elbow_r", "knee_l", "knee_r"):
        circle(draw, p[name], 3.5, ROSE)
    for name in ("hand_l", "hand_r"):
        circle(draw, p[name], 2.5, DARK)
    for name in ("foot_l", "foot_r"):
        x, y = p[name]
        line(draw, [(x-5, y), (x+5, y)], DARK, 3)


def lerp(a: Pose, b: Pose, t: float) -> Pose:
    return {k: (a[k][0] + (b[k][0]-a[k][0])*t, a[k][1] + (b[k][1]-a[k][1])*t) for k in a}


def base_pose(cx: float, head_y: float, neck: tuple[float,float], hip: tuple[float,float], elbows, hands, knees, feet) -> Pose:
    return {"head": (cx,head_y), "neck": neck, "hip": hip,
            "elbow_l": elbows[0], "elbow_r": elbows[1], "hand_l": hands[0], "hand_r": hands[1],
            "knee_l": knees[0], "knee_r": knees[1], "foot_l": feet[0], "foot_r": feet[1]}


def make_canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (W*SCALE,H*SCALE), BG)
    d = ImageDraw.Draw(img)
    # Quiet rose wash and ground plane preserve legibility against both app themes.
    d.rounded_rectangle((12*SCALE,12*SCALE,348*SCALE,168*SCALE), radius=15*SCALE, fill=BG2)
    d.ellipse((74*SCALE,18*SCALE,284*SCALE,160*SCALE), fill="#fbf7f9")
    line(d, [(24,143),(336,143)], GROUND, 1.5)
    return img, d


def add_motion_chevrons(d: ImageDraw.ImageDraw, x: float, y: float, direction: int = 1) -> None:
    for offset in (0, 9, 18):
        xx = x + direction*offset
        if direction >= 0:
            line(d, [(xx,y-3),(xx+5,y),(xx,y+3)], LIGHT, 2)
        else:
            line(d, [(xx,y-3),(xx-5,y),(xx,y+3)], LIGHT, 2)


def rower_pose(t: float) -> Pose:
    a = base_pose(75, 101, (88,104),(186,112), ((72,99),(70,111)), ((49,95),(46,117)), ((223,115),(235,120)), ((267,125),(277,129)))
    b = base_pose(170, 54, (170,67),(163,111), ((185,82),(188,96)), ((207,94),(215,108)), ((207,119),(215,121)), ((227,134),(237,132)))
    p = lerp(a,b,t)
    # A simple floor mat and directional cue establish the starting posture.
    return p


def sprint_pose(i: int) -> Pose:
    phase = 2*math.pi*i/FRAMES
    cx = 172 + 4*math.sin(phase)
    stride = math.sin(phase)
    lift = max(0, math.cos(phase))
    return base_pose(cx-9, 42, (cx-8,55),(cx,91),
        ((cx-18,68+6*stride),(cx+13,68-6*stride)),
        ((cx-34,55+4*stride),(cx+31,54-4*stride)),
        ((cx-15,107+12*stride),(cx+17,105-12*stride)),
        ((cx-35-12*stride,128-11*lift),(cx+37+12*stride,128-11*(1-lift))))


def static_bar_pose(i: int) -> Pose:
    sway = math.sin(2*math.pi*i/FRAMES)*1.4
    return base_pose(164+sway, 33+sway, (164+sway,49),(164+sway,103),
        ((145+sway,52),(183+sway,51)), ((133+sway,43),(195+sway,43)),
        ((153+sway,116),(175+sway,116)), ((148+sway,128),(180+sway,128)))


def jump_pose(t: float) -> Pose:
    # A broad-jump loop: crouch, arm swing/take-off, flight, landing, then recover.
    if t < .23:
        u=t/.23
        return lerp(base_pose(137,66,(137,79),(137,112),((124,91),(150,91)),((118,111),(156,111)),((124,126),(151,126)),((117,140),(157,140))),
                    base_pose(146,61,(146,74),(147,107),((130,87),(162,87)),((116,71),(178,71)),((131,119),(160,119)),((122,133),(168,133))),u)
    if t < .67:
        u=(t-.23)/.44
        return lerp(base_pose(146,61,(146,74),(147,107),((130,87),(162,87)),((116,71),(178,71)),((131,119),(160,119)),((122,133),(168,133))),
                    base_pose(181,38,(181,51),(181,88),((157,63),(204,63)),((138,48),(229,50)),((164,105),(205,105)),((147,126),(222,124))),u)
    u=(t-.67)/.33
    return lerp(base_pose(181,38,(181,51),(181,88),((157,63),(204,63)),((138,48),(229,50)),((164,105),(205,105)),((147,126),(222,124))),
                base_pose(137,66,(137,79),(137,112),((124,91),(150,91)),((118,111),(156,111)),((124,126),(151,126)),((117,140),(157,140))),u)


def rope_pose(i: int) -> Pose:
    t=(1-math.cos(2*math.pi*i/FRAMES))/2
    y=104-30*t
    x=196+3*math.sin(2*math.pi*i/FRAMES)
    return base_pose(x,y-53,(x,y-40),(x+3,y+5),
        ((x-13,y-46),(x+17,y-56)), ((224,y-48),(224,y-72)),
        ((x-8,y+21),(x+14,y+24)), ((224,y+6),(x+25,y+27)))


def shuttle_pose(i: int) -> tuple[Pose,float]:
    # Runner shuttles between two visible turn markers, then reverses direction.
    cycle=(2*i/FRAMES)
    if cycle <= 1:
        progress=cycle; direction=1
    else:
        progress=2-cycle; direction=-1
    x=80+progress*200
    near=1-min(1,min(progress,1-progress)*9)
    lean=direction*(4+10*near)
    head=(x-10*direction,43+near*8)
    hip=(x,95+near*7)
    return base_pose(head[0],head[1],(x-8*direction,57+near*7),hip,
        ((x-18*direction,72),(x+14*direction,72)),
        ((x-34*direction,61),(x+28*direction,61)),
        ((x-17*direction-lean,111),(x+18*direction+lean,108)),
        ((x-37*direction-lean,132),(x+39*direction+lean,132))),direction


def pushup_pose(i: int) -> Pose:
    t=(1-math.cos(2*math.pi*i/FRAMES))/2
    shoulder_y=83+28*t
    hip_y=96+15*t
    return base_pose(200,shoulder_y-8,(192,shoulder_y),(119,hip_y),
        ((164,shoulder_y+8),(169,shoulder_y+11)),
        ((146,132),(153,132)),
        ((85,hip_y+7),(80,hip_y+8)),
        ((61,129),(58,129)))


def draw_scene(name: str, i: int) -> Image.Image:
    img,d=make_canvas()
    t=(1-math.cos(2*math.pi*i/FRAMES))/2
    if name=="rower":
        # Mat under the body; flexion direction is animated, not implied as an ergometer.
        d.rounded_rectangle((42*SCALE,128*SCALE,249*SCALE,138*SCALE), radius=4*SCALE, fill="#eddde5")
        add_motion_chevrons(d, 220, 54, -1)
        draw_person(d,rower_pose(t))
    elif name=="sprint":
        for y in (112,128,144): line(d,[(18,y),(342,y)],"#e9d9e1",1)
        add_motion_chevrons(d, 258, 48, 1)
        draw_person(d,sprint_pose(i))
    elif name=="static-bar":
        line(d,[(96,46),(232,46)],DARK,4)
        line(d,[(108,46),(108,64)],GROUND,3); line(d,[(220,46),(220,64)],GROUND,3)
        line(d,[(125,51),(203,51)],LIGHT,1.5)
        draw_person(d,static_bar_pose(i))
        # The chin remains above the bar throughout; tiny pulse marks convey a timed hold.
        for x in (245,256,267): circle(d,(x,55),1.8,ROSE)
    elif name=="jump":
        for x in (42,50,58,66,74,82,90): line(d,[(x,131),(x,142)],GROUND,1)
        for x in (270,278,286,294,302,310,318): line(d,[(x,131),(x,142)],GROUND,1)
        line(d,[(96,125),(264,125)],LIGHT,2)
        add_motion_chevrons(d, 115, 60, 1)
        draw_person(d,jump_pose(t))
    elif name=="rope":
        line(d,[(224,17),(224,143)],"#ad8d70",5)
        line(d,[(224,17),(224,143)],"#e1cdb6",1.5)
        line(d,[(203,17),(245,17)],GROUND,3)
        draw_person(d,rope_pose(i))
    elif name=="shuttle":
        line(d,[(34,123),(326,123)],"#e4d1da",2)
        for x in (54,306):
            line(d,[(x-9,123),(x,101),(x+9,123)],ROSE,2)
            circle(d,(x,99),2.6,LIGHT)
        for y in (115,131): line(d,[(26,y),(334,y)],"#f0e4e9",1)
        pose,direction=shuttle_pose(i)
        add_motion_chevrons(d, 100 if direction>0 else 260, 51, direction)
        draw_person(d,pose)
    elif name=="push-up":
        line(d,[(35,135),(325,135)],GROUND,2)
        draw_person(d,pushup_pose(i))
    else:
        raise ValueError(name)
    return img


def save_gif(name: str) -> tuple[str,int]:
    frames=[draw_scene(name,i) for i in range(FRAMES)]
    palette=frames[0].quantize(colors=96,method=Image.Quantize.FASTOCTREE)
    pal_frames=[frame.quantize(palette=palette,dither=Image.Dither.NONE) for frame in frames]
    path=OUT/f"{name}.gif"
    pal_frames[0].save(path,save_all=True,append_images=pal_frames[1:],duration=DURATION_MS,loop=0,optimize=True,disposal=2)
    return path.name,path.stat().st_size


def save_reduced_motion_posters() -> None:
    """Create static WebP first-frame posters for every looping GIF."""
    for name in ("rower","running","sprint","static-bar","pull-up","jump","rope","shuttle","push-up","distance-run-human"):
        source=Image.open(OUT/f"{name}.gif")
        source.seek(0)
        frame=source.convert("RGB")
        if max(frame.size)>720:
            ratio=720/max(frame.size)
            frame=frame.resize((round(frame.width*ratio),round(frame.height*ratio)),Image.Resampling.LANCZOS)
        path=OUT/f"{name}-poster.webp"
        frame.save(path,"WEBP",quality=82,method=6)
        print(f"{path.name}\t{path.stat().st_size} bytes")


def main() -> None:
    OUT.mkdir(parents=True,exist_ok=True)
    for name in ("rower","sprint","static-bar","jump","rope","shuttle","push-up"):
        filename,size=save_gif(name)
        print(f"{filename}\t{size} bytes")
    save_reduced_motion_posters()


if __name__=="__main__":
    main()
