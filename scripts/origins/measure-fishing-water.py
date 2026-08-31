"""Measures where the float, the splash and the rod tip land on a rendered avatar.

`vortex-imager` runs the engine's own avatar pipeline, so what it draws is what a room draws.
Everything below is read off pixels rather than derived: the float is the only red in the frame and
the splash the only blue.

    pnpm imager                      # then, from this directory
    python measure-fishing-water.py  # renders 8 directions and prints tip -> float

⚠ Run it with `DRAW_LINE = False` in build-fishing-rod.py. The line is drawn in the rod's own black,
so with it on the topmost non-water pixel in the frame is the top of the LINE — which `TIP_TO_FLOAT`
placed — and the reading just echoes what is already there. The tell is a residual identical in
every direction.
"""
import collections
import os
import pathlib
import tempfile
import urllib.request

from PIL import Image

DIRECTIONS = 8

# The float's own palette, straight out of `h_hooked_object_0_0`.
FLOAT_COLOURS = {(178, 23, 23), (217, 54, 54), (102, 0, 0), (235, 217, 184)}

# The splash's, out of `h_fishing_splash_0_0`. The float shares its two darkest blues, so a pixel is
# only splash when it is blue AND not inside the float's own box.
SPLASH_COLOURS = {(56, 120, 149), (65, 141, 173), (43, 97, 121), (255, 255, 255)}


def masks(image):
    pixels = image.load()
    water, splash, avatar = [], [], []

    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]

            if a == 0:
                continue

            if (r, g, b) in FLOAT_COLOURS:
                water.append((x, y))
            elif (r, g, b) in SPLASH_COLOURS:
                splash.append((x, y))
            else:
                avatar.append((x, y))

    return water, splash, avatar


def box(points):
    if not points:
        return None

    xs = [x for x, _ in points]
    ys = [y for _, y in points]

    return min(xs), min(ys), max(xs), max(ys)


IMAGER = os.environ.get("VORTEX_IMAGER_URL", "http://localhost:8081")

# Any figure will do; this one is the plain male the rod was fitted against, and changing it changes
# the measurement by a pixel or two because the avatar's union box changes with it.
FIGURE = "hd-180-1.ch-210-66.lg-270-82.sh-290-80"

EFFECT_ID = 8100


def render(direction, into):
    url = (
        f"{IMAGER}/habbo-imaging/avatarimage?figure={FIGURE}"
        f"&direction={direction}&head_direction={direction}"
        f"&size=m&effect={EFFECT_ID}&frame=0"
    )

    with urllib.request.urlopen(url) as response:
        into.write_bytes(response.read())


def report():
    out = pathlib.Path(tempfile.mkdtemp(prefix="vortex-fishing-"))

    for direction in range(DIRECTIONS):
        frame = out / f"rod_d{direction}.png"
        render(direction, frame)
        image = Image.open(frame).convert("RGBA")
        water, splash, avatar = masks(image)

        wb, sb, ab = box(water), box(splash), box(avatar)

        if ab is None:
            print(direction, "no avatar pixels")
            continue

        # The feet: the bottom row of the avatar mask, and the x it spans there.
        bottom = ab[3]
        feetXs = [x for x, y in avatar if y >= bottom - 2]
        feet = (round(sum(feetXs) / len(feetXs)), bottom)

        # The rod tip: the topmost avatar pixel, which is the rod on every direction but the ones
        # where it points down — the head is never above it in this pose.
        top = ab[1]
        tipXs = [x for x, y in avatar if y <= top + 1]
        tip = (round(sum(tipXs) / len(tipXs)), top)

        floatCentre = None if wb is None else ((wb[0] + wb[2]) // 2, (wb[1] + wb[3]) // 2)
        splashCentre = None if sb is None else ((sb[0] + sb[2]) // 2, (sb[1] + sb[3]) // 2)

        print(
            f"d{direction} size={image.size} feet={feet} tip={tip} "
            f"float={floatCentre} splash={splashCentre} "
            f"float-feet={None if floatCentre is None else (floatCentre[0] - feet[0], floatCentre[1] - feet[1])}"
        )


if __name__ == "__main__":
    report()
