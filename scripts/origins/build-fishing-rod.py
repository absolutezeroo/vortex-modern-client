"""Builds the fishing rod as an avatar EFFECT, out of Habbo Origins' own artwork.

Not a carry item. Origins anchors `h_fishing_rod_0..7` to the avatar's own origin across eight
directions; Habbo's carry items are anchored to the hand, by geometry this port would have to
re-derive. An effect's `adds: [{align: "rightitem"}]` places a sprite in exactly the way Origins
does, and `Torch.nitro` is the shipped bundle this one copies.

`ri` is mirrored by the client for directions 4, 5 and 6 (`AvatarDirectionAngle.DIRECTION_IS_FLIPPED`)
with no direction remap, unlike a body part, which would resolve direction 4's art from direction 2.
Origins draws all eight rods for real and none of them is another's mirror, so the art for those
three is **pre-mirrored here** and the client's own mirror restores it.

The obvious alternative -- cancelling the mirror with `flipH: true` on the alias, since
`effectiveFlipH = isPartFlipped !== totalAssetFlipH` -- does not work: a 3x3 probe effect built that
way renders nothing at all on 4, 5 and 6, and renders on all eight with `flipH: false`. Torch, the
shipped effect this copies, also sets `flipH: false` throughout. That probe is `build_probe.py`.

**Every offset below is measured, not derived.** Two runs of the probe fixed the avatar's anchor in
the rendered image, and the hand position per direction was read off a render of Habbo's own carry
item 2 -- the arm pose is the same `CarryItem`, so where that item sits is where the hand is. What
remains is per-direction arithmetic the mirror makes fiddly, so CORRECTION carries the residual
measured off a render of this bundle itself. Attempting the same numbers analytically produced a rod
through the avatar's head twice.

The grip is the centroid of the bottom fifth of the sprite's opaque pixels -- the handle, which is
what the hand closes on.
"""
import json
import pathlib
import struct
import tempfile
import zlib

from PIL import Image, ImageDraw

from lib import paths

SPRITES = paths.SPRITES
OUT_DIR = paths.EFFECTS

LIBRARY = "VortexFishingRod"

# The Vortex band, which effectmap.xml uses none of -- its highest shipped id is 236.
EFFECT_ID = 8100
BASE = f"fx{EFFECT_ID}_1"

DIRECTIONS = 8

# The two sprites that go in the water beside the avatar, both drawn by Origins in ONE direction
# only: `h_hooked_object_0_0` is the red-and-white float and `h_fishing_splash_0_0..3` the ripple it
# sits in. One drawing for eight directions means Origins moves them in Lingo, so the per-direction
# offsets below are DERIVED — they place the float a tile in front of the avatar, on the side the rod
# points, and no cast member records what Origins used.
FLOAT_MEMBER = "h_hooked_object_0_0"
SPLASH_MEMBERS = [f"h_fishing_splash_0_{i}" for i in range(4)]

# One tile in front of the avatar, per direction.
#
# The tile deltas are Habbo's own (direction 0 is north, 2 east, 4 south, 6 west) put through the
# isometric projection `screen = ((tx - ty) * 32, (tx + ty) * 16)`.
#
# A `directionList` dx/dy is ADDED, unlike an asset's x/y, which is subtracted. Torch settles it: its
# flame follows a hand that moves left across directions 0 to 4, and its own dx goes 0 to -43 over
# the same span — a subtracted offset would have to go the other way.
TILE_DELTAS = {
    0: (0, -1), 1: (1, -1), 2: (1, 0), 3: (1, 1),
    4: (0, 1), 5: (-1, 1), 6: (-1, 0), 7: (-1, -1),
}

# How far the sole of the shoe sits below the avatar's origin, which is the floor plane the water
# has to lie on -- the tile delta is measured from there and not from the origin itself.
#
# MEASURED, not `scale / 4`. `updateMainSprite` places the body at `-height + scale / 4`, so the
# texture's bottom EDGE is at +16, and taking that as the floor put the whole set ten pixels low.
# The avatar image carries nine rows of empty margin under the shoe: rendered, the last shoe pixel
# of `sh-290-80` is at +6.
FEET_DROP = 6

FLOAT_OFFSETS = {
    d: ((tx - ty) * 32, (tx + ty) * 16 + FEET_DROP)
    for d, (tx, ty) in TILE_DELTAS.items()
}

# Depth follows the tile, not the sprite. A spot the avatar faces north-west sits two rows BEHIND
# it -- `(-1, -1)` is 32px straight up the screen -- and an isometric room hides it behind the
# avatar; one to the south is in front and must not be. `AvatarVisualization` gives an extra sprite
# `-0.01 - 0.001 * spriteCount * dz`, so a larger dz draws further forward, and `tx + ty` is Habbo's
# own depth axis. The four spare steps leave room for the three water sprites to stack inside a row.
TILE_DEPTH = {d: (tx + ty) * 4 for d, (tx, ty) in TILE_DELTAS.items()}

# Directions the client mirrors for a right-hand item (AvatarDirectionAngle.DIRECTION_IS_FLIPPED).
FLIPPED_DIRECTIONS = {4, 5, 6}

# Where the avatar's anchor lands in a `size=m` render, from the probe: an asset at (x, y) draws its
# top-left at (-x + 13, -y + 114).
ANCHOR = (13, 114)

# Where the hand is in that same render, per direction: the bbox centre of Habbo's carry item 2 on
# an avatar in the CarryItem pose. Directions 6 and 7 draw no carried item at all -- a Habbo avatar
# does not show one with its back turned -- so they borrow the neighbour whose hand is closest.
HAND = {
    0: (67, 80),
    1: (60, 86),
    2: (52, 90),
    3: (41, 88),
    4: (27, 84),
    5: (31, 85),
    6: (31, 85),
    7: (67, 80),
}

# Residual per direction, measured off a magenta silhouette of this very bundle (`build_rod_sil.py`
# renders one and reports where the grip landed against HAND). Everything but direction 3 was
# already inside a pixel; 3 is the narrow head-on drawing, whose handle is off-centre in its own
# sprite.
CORRECTION = {0: (0, 0), 1: (0, 0), 2: (0, 0), 3: (-4, 0), 4: (-1, 0), 5: (-1, 0), 6: (-1, 0), 7: (0, 0)}


def grip(image):
    """Where the hand closes on the rod: the centroid of the bottom fifth of the handle."""
    pixels = image.load()
    opaque = [
        (x, y)
        for y in range(image.height)
        for x in range(image.width)
        if pixels[x, y][3] > 0
    ]

    top = min(y for _, y in opaque)
    bottom = max(y for _, y in opaque)
    handle = [(x, y) for x, y in opaque if y >= bottom - (bottom - top) * 0.2]

    return sum(x for x, _ in handle) / len(handle), sum(y for _, y in handle) / len(handle)


def rod(direction):
    """One direction's sprite and its nitro offsets, with the grip on the hand."""
    image = Image.open(SPRITES / f"h_fishing_rod_{direction}.png").convert("RGBA")

    if direction in FLIPPED_DIRECTIONS:
        # Pre-mirrored so the client's own mirror puts it back; see the module docstring.
        image = image.transpose(Image.FLIP_LEFT_RIGHT)

    gripX, gripY = grip(image)
    handX, handY = HAND[direction]
    fixX, fixY = CORRECTION[direction]

    return (
        image,
        round(gripX + ANCHOR[0] - handX + fixX),
        round(gripY + ANCHOR[1] - handY + fixY),
    )


def write(path, files):
    """The bundle format NitroBundleLoader.extractFiles reads: every member is zlib-deflated."""
    out = bytearray(struct.pack(">h", len(files)))

    for name, data in files:
        blob = zlib.compress(data)
        out += struct.pack(">h", len(name)) + name.encode() + struct.pack(">i", len(blob)) + blob

    path.write_bytes(out)


assets, aliases, frames, packed = {}, {}, {}, []

for direction in range(DIRECTIONS):
    image, x, y = rod(direction)
    packed.append((f"h_std_{BASE}_1_{direction}_0", image, x, y))

    aliases[f"h_crr_ri_{BASE}_{direction}_0"] = {
        "link": f"h_std_{BASE}_1_{direction}_0",
        # Always false. True here renders nothing on 4/5/6; see the module docstring.
        "flipH": False,
        "flipV": False,
    }

# The float and the ripple: one drawing each, moved per direction by the `directionList` below, the
# way Torch moves its flame.
#
# Their Director regPoints are NOT used. They are the cast's own, in Lingo's convention, and reading
# them as Nitro offsets put the float and the ripple 11 and 15 pixels apart and both of them a tile
# short. Every sprite here is instead centred on the effect's origin — `x = width / 2 - scale / 2`,
# which is what an asset offset of that value means once `GraphicAssetCollection` negates it — and
# `FLOAT_OFFSETS` then carries the pair out to the water together. Two numbers instead of four, and
# the only thing that decides where they land is the tile delta.
FLOAT_SPRITE = f"fx{EFFECT_ID}_2"
SPLASH_SPRITE = f"fx{EFFECT_ID}_3"

water = [(f"h_std_{FLOAT_SPRITE}_1_0_0", FLOAT_MEMBER)]
water += [
    (f"h_std_{SPLASH_SPRITE}_1_0_{frame}", member)
    for frame, member in enumerate(SPLASH_MEMBERS)
]

# How high the float rides in the ripple: its centre sits above the ripple's, because the ripple is
# drawn as a spout with its water line about a third down.
FLOAT_RIDE = 4


def centred(image, rise=0):
    """The bundle offsets that put an image's centre on the effect's origin."""
    return image.width // 2 - 32, image.height // 2 + rise


floatBundle = None

for name, member in water:
    image = Image.open(SPRITES / f"{member}.png").convert("RGBA")
    offset = centred(image, FLOAT_RIDE if member == FLOAT_MEMBER else 0)

    if member == FLOAT_MEMBER:
        floatBundle, floatSize = offset, image.size

    packed.append((name, image, *offset))

# The line. Origins has no sprite for one -- there is no line member anywhere in `hh_fishing.cst`,
# under any name -- so its Lingo draws it, and this draws the same: a 1px run in the rod's own
# outline colour, from the tip down to where the float meets the water.
#
# **Its two ends cannot be derived.** The float's position is arithmetic, but the rod's is not: the
# rod is a body part, composited into the avatar's union image, which `updateMainSprite` then places
# bottom-anchored and horizontally centred -- so where the tip lands depends on the union box of
# every part the avatar happens to be wearing. TIP_TO_FLOAT is therefore MEASURED, exactly as HAND
# and CORRECTION above are: `measure_water.py` renders this bundle through vortex-imager and prints
# the vector from the rod's topmost pixel to the float's centre, per direction. It is canvas-
# independent -- both ends are read out of the same frame -- but it does depend on the rod's own
# offsets, so re-run it after touching HAND or CORRECTION.
LINE_SPRITE = f"fx{EFFECT_ID}_4"

# The rod is outlined in pure black and nothing else in the cast is; the line is the same stroke.
LINE_COLOUR = (0, 0, 0, 255)

# ⚠ Measure it with DRAW_LINE off. The line is drawn in the rod's own black, so with it on the
# topmost non-water pixel in the frame is the top of the LINE -- which this table placed -- and the
# reading just echoes whatever is already here. The tell is a residual identical in every direction.
DRAW_LINE = True

TIP_TO_FLOAT = {
    0: (-1, 72), 1: (38, 84), 2: (14, 96), 3: (-1, 123),
    4: (-29, 100), 5: (-65, 83), 6: (-33, 67), 7: (-23, 67),
}

# The line stops on the float's shoulder rather than its centre, which is where a real one enters
# the water.
FLOAT_ENTRY = 3

for direction in range(DIRECTIONS) if DRAW_LINE else []:
    toCentreX, toCentreY = TIP_TO_FLOAT[direction]
    toEndX, toEndY = toCentreX, toCentreY - FLOAT_ENTRY

    image = Image.new("RGBA", (abs(toEndX) + 1, abs(toEndY) + 1), (0, 0, 0, 0))
    startX = 0 if toEndX >= 0 else image.width - 1
    startY = 0 if toEndY >= 0 else image.height - 1

    ImageDraw.Draw(image).line(
        (startX, startY, image.width - 1 - startX, image.height - 1 - startY),
        fill=LINE_COLOUR,
        width=1,
    )

    # Placed against the FLOAT rather than against the origin, because that is the end of it this
    # bundle knows the position of. Both sprites carry the same `directionList` offset, so the
    # difference between their bundle offsets is the difference between their top-left corners --
    # and the line's, relative to the tip, is `min(0, to…)` on each axis.
    deltaX = min(0, toEndX) - (toCentreX - floatSize[0] // 2)
    deltaY = min(0, toEndY) - (toCentreY - floatSize[1] // 2)

    packed.append((
        f"h_std_{LINE_SPRITE}_1_{direction}_0",
        image,
        floatBundle[0] - deltaX,
        floatBundle[1] - deltaY,
    ))

sheet = Image.new(
    "RGBA",
    (max(p[1].width for p in packed), sum(p[1].height for p in packed)),
    (0, 0, 0, 0),
)

top = 0

for name, image, x, y in packed:
    sheet.paste(image, (0, top))
    assets[name] = {"x": x, "y": y}
    frames[f"{LIBRARY}_{name}"] = {
        "frame": {"x": 0, "y": top, "w": image.width, "h": image.height},
        "rotated": False,
        "trimmed": False,
        "spriteSourceSize": {"x": 0, "y": 0, "w": image.width, "h": image.height},
        "sourceSize": {"w": image.width, "h": image.height},
        "pivot": {"x": 0.5, "y": 0.5},
    }
    top += image.height

# Into a temporary directory, not the working one: the sheet is an intermediate the bundle carries a
# copy of, and writing it beside the script leaves an untracked PNG in the repository every run.
png = pathlib.Path(tempfile.mkdtemp(prefix="vortex-origins-")) / f"{LIBRARY}.png"
sheet.save(png)

index = {
    "name": LIBRARY,
    "assets": assets,
    "aliases": aliases,
    "animations": {
        LIBRARY: {
            "name": f"fx.{EFFECT_ID}",
            "desc": LIBRARY,
            # The rod goes in the hand; the float and the ripple are fx sprites beside the avatar,
            # the way Torch adds its flame. Origins has no LINE sprite anywhere in the cast — not
            # under any Finnish name either — so either its Lingo draws one as a Director shape or
            # there is none. Nothing here invents one.
            "adds": [{"id": "ri", "align": "rightitem", "base": BASE}],
            "sprites": [
                {
                    "id": FLOAT_SPRITE,
                    "member": f"std_{FLOAT_SPRITE}_1",
                    "ink": 36,
                    "directionList": [
                        {"id": d, "dx": FLOAT_OFFSETS[d][0], "dy": FLOAT_OFFSETS[d][1], "dz": TILE_DEPTH[d] + 2}
                        for d in range(DIRECTIONS)
                    ],
                },
                {
                    "id": SPLASH_SPRITE,
                    "member": f"std_{SPLASH_SPRITE}_1",
                    "ink": 36,
                    # Behind the float, so the ripple reads as water around it.
                    "directionList": [
                        {"id": d, "dx": FLOAT_OFFSETS[d][0], "dy": FLOAT_OFFSETS[d][1], "dz": TILE_DEPTH[d] + 1}
                        for d in range(DIRECTIONS)
                    ],
                },
                {
                    "id": LINE_SPRITE,
                    "member": f"std_{LINE_SPRITE}_1",
                    "ink": 36,
                    # The only sprite here with art of its own per direction, because the vector it
                    # spans is different in each -- `directions: 1` is what makes the lookup use the
                    # avatar's direction instead of 0. Hoverboard's board declares it the same way.
                    "directions": 1,
                    "directionList": [
                        {"id": d, "dx": FLOAT_OFFSETS[d][0], "dy": FLOAT_OFFSETS[d][1], "dz": TILE_DEPTH[d] + 2}
                        for d in range(DIRECTIONS)
                    ],
                },
            ],
            # Four frames: the ripple cycles and the float rides it. The rod itself is one drawing
            # per direction — Origins animates the cast and the reel in Lingo, which is unread.
            "frames": [
                {
                    "fxs": [
                        {"id": LINE_SPRITE, "frame": 0, "action": "Default"},
                        {"id": FLOAT_SPRITE, "frame": 0, "action": "Default"},
                        {"id": SPLASH_SPRITE, "frame": frame, "action": "Default"},
                    ],
                    "bodyparts": [
                        {"id": "rightarm", "frame": 0, "action": "CarryItem"},
                        {"id": "rightitem", "frame": 0, "base": BASE, "action": "CarryItem"},
                    ],
                }
                for frame in range(len(SPLASH_MEMBERS))
            ],
        }
    },
    "spritesheet": {
        "frames": frames,
        "meta": {
            "image": f"{LIBRARY}.png",
            "format": "RGBA8888",
            "size": {"w": sheet.width, "h": sheet.height},
            "scale": 1,
        },
    },
}

write(
    OUT_DIR / f"{LIBRARY}.nitro",
    [(f"{LIBRARY}.json", json.dumps(index).encode()), (f"{LIBRARY}.png", png.read_bytes())],
)

print(f"{LIBRARY}: effect {EFFECT_ID}, {len(assets)} assets, sheet {sheet.width}x{sheet.height}")
print("offsets:", {i: (assets[f'h_std_{BASE}_1_{i}_0']) for i in range(DIRECTIONS)})
