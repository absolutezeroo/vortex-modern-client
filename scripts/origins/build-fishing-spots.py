"""Builds the fishing furni .nitro bundles out of Habbo Origins' own artwork.

Replaces the renamed-fountain placeholder `make_spot.py` produced. The art comes from
`hh_fishing.cct`, extracted to `origins_fishing2/` by `extract_fishing.py`.

Three kinds of bundle come out of here:

  * `vtx_fishing_spot_<zone>` -- the water. One tile, eight frames of a fish shadow circling, plus a
    second animation state that plays the splash when a line goes in.
  * `vtx_fishing_sign`        -- the signpost, which is a furni of its own: it marks that a fishing
    zone is nearby, and the water tiles make the zone without it.

Origins' member grammar, decoded from the pictures rather than from any documentation:

    s_fish_area_a_0_1_1_<direction>_<colour>_<position>

`<direction>` is 0 or 1, and X=1 is the exact horizontal mirror of X=0, so nitro gets one real set
and a `flipH` alias. `<colour>` is the water tint (5 of them, one per Origins zone) and `<position>`
is where the fish shadow sits, 8 of them, which is the swim loop. Colour 0 is written on two numbers
(`_0_5`, not `_0_0_5`) -- Shockwave drops a zero index, which is what made this look like an
eight-layer furni on the member list alone.

Two coordinate systems have to be reconciled:

  * Director anchors a cast member at its regPoint, at bytes 18 (regY) and 20 (regX) of the bitmap
    spec. Origins puts the fishing area's regPoint at the tile diamond's LEFT corner: (0, 9) on a
    34x17 sprite.
  * Nitro anchors an asset at the tile CENTRE, and stores the offset from the sprite's top-left to
    that centre as `x`/`y`. Calibrated against `atni_fountain`, whose 41x57 body sits at (20, 47):
    ten pixels of it fall below the origin, which is where a fountain's base ends on a 64x32 tile.

So `nitro = director_reg * SCALE + (HALF_TILE, 0)` -- the x term walks the anchor from the diamond's
left corner to its centre, and y needs none because the left corner already sits at the diamond's
vertical middle.

Origins ships this art at the 32x16 tile size only; the 64-scale copy lives in a furni cast that is
downloaded on demand and is not in the client folder. The modern client draws rooms at 64, so the
sprites are doubled nearest-neighbour, which on flat-colour pixel art reproduces every edge exactly.
"""
import json
import pathlib
import struct
import tempfile
import zlib

from PIL import Image

from lib import paths

SPRITES = paths.SPRITES
OUT_DIR = paths.FURNI

# The modern client's tile is twice Origins', so every sprite and every offset doubles.
SCALE = 2
HALF_TILE = 32

DIRECTION = 0
MIRRORED_DIRECTION = 4

# Origins' own indices: 8 fish-shadow positions, 10 frames of splash.
SWIM_FRAMES = 8
SPLASH_FRAMES = 10

# How many render ticks each frame holds. Origins' own values are in compiled Lingo; the swim is
# slowed to read as a fish circling rather than darting, and the splash plays at full speed.
SWIM_REPEAT = 3
SPLASH_REPEAT = 1

# The two visualization states. IDLE is the water on its own; SPLASH adds the impact and plays once,
# which is what the fishing session switches the furni to while a line is in the water.
STATE_IDLE = 0
STATE_SPLASH = 1

# One bundle per water tint Origins drew -- all five of them.
#
# The first three carry the zone names Origins documents (Infobus Park, Port Hana, Snouthill Pier).
# The last two have no recovered name: Origins ships the artwork and the member list numbers it, so
# `lagoon` and `night` are DERIVED from the tint at the tile's centre and are named here rather than
# passed off as recovered.
ZONES = {
    "vtx_fishing_spot_park": 0,  # 99FFFF, pale shallows
    "vtx_fishing_spot_hana": 1,  # 398FDF, open blue water
    "vtx_fishing_spot_snouthill": 2,  # 1A3854, deep navy
    "vtx_fishing_spot_lagoon": 3,  # 2BB5D3, turquoise
    "vtx_fishing_spot_night": 4,  # 222230, near-black
}

SIGN_CLASS = "vtx_fishing_sign"
SIGN_MEMBER = "s_fish_sign_a_0_1_1_0_0"

# Every cast member's Director regPoint, read straight out of `hh_fishing.cct`'s bitmap specs.
REGPOINTS = json.loads((SPRITES / "regpoints.json").read_text())

# Habbo's own way of hiding a layer in one state and showing it in another: the layer's frame 0 is a
# 1x1 transparent sprite. `17_fallfan_64_c_2_0` is exactly that, and there is no "invisible" flag.
BLANK = "__blank__"


def area_member(colour, position):
    """Origins' member name, minding the dropped zero for colour 0."""
    tail = f"{position}" if colour == 0 else f"{colour}_{position}"

    return f"s_fish_area_a_0_1_1_{DIRECTION}_{tail}"


def load(member):
    """The sprite doubled to the modern tile size, with its nitro anchor."""
    if member == BLANK:
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0)), 0, 0

    spec = REGPOINTS[member]
    image = Image.open(SPRITES / f"{member}.png").convert("RGBA")

    return (
        image.resize((image.width * SCALE, image.height * SCALE), Image.NEAREST),
        spec["regX"] * SCALE + HALF_TILE,
        spec["regY"] * SCALE,
    )


def sequence(frames, repeat=1, loop=0):
    """One layer's frame list inside an animation."""
    return {
        "frameRepeat": repeat,
        "loopCount": loop,
        "frameSequences": {"0": {"frames": {str(i): {"id": f} for i, f in enumerate(frames)}}},
    }


def bundle(classname, layers, animations, mirror_layers, dimensions):
    """Packs one furni: `layers` is a list of member-name lists, one per layer, in draw order."""
    packed, assets, frames, sheet_height, sheet_width = [], {}, {}, 0, 0

    for index, members in enumerate(layers):
        letter = chr(ord("a") + index)

        for frame, member in enumerate(members):
            image, x, y = load(member)
            packed.append((f"{classname}_64_{letter}_{DIRECTION}_{frame}", image, x, y))
            sheet_width = max(sheet_width, image.width)
            sheet_height += image.height

    sheet = Image.new("RGBA", (sheet_width, sheet_height), (0, 0, 0, 0))
    top = 0

    for name, image, x, y in packed:
        sheet.paste(image, (0, top))
        assets[name] = {"x": x, "y": y, "flipH": False, "flipV": False}
        frames[f"{classname}_{name}"] = {
            "frame": {"x": 0, "y": top, "w": image.width, "h": image.height},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": image.width, "h": image.height},
            "sourceSize": {"w": image.width, "h": image.height},
            "pivot": {"x": 0.5, "y": 0.5},
        }
        top += image.height

    # The mirrored direction. A layer in `mirror_layers` flips -- that is Origins' X=1, pixel for
    # pixel; the rest are aliased unflipped, because Origins draws one of them for both directions
    # and a mirrored signpost reads backwards. `x` is measured from the sprite's left edge, so the
    # flip has to mirror it about the tile.
    for name, image, x, y in packed:
        letter = name.split("_")[-3]
        mirrored = name.replace(f"_{DIRECTION}_", f"_{MIRRORED_DIRECTION}_", 1)

        if letter in mirror_layers:
            assets[mirrored] = {
                "source": name,
                "x": image.width - x,
                "y": y,
                "flipH": True,
                "flipV": False,
            }
        else:
            assets[mirrored] = dict(assets[name], source=name)

    # Temporary, not the working directory: the sheet is an intermediate the bundle carries a copy
    # of, and writing it here leaves six untracked PNGs in the repository every run.
    png = pathlib.Path(tempfile.mkdtemp(prefix="vortex-origins-")) / f"{classname}.png"
    sheet.save(png)

    index = {
        "name": classname,
        # The logic is what the client resolves a click into: the water opens the fishing panel, the
        # sign opens the Fish-O-Pedia. `furniture_basic` here left the sign inert, which is not what
        # Origins does with it — §1, "a wooden fish sign in the room opens the skill interface".
        "logicType": "vortex_fishing_sign" if classname == SIGN_CLASS else "vortex_fishing_spot",
        "visualizationType": "furniture_animated",
        "assets": assets,
        # Two directions, 180 degrees apart -- the pair Origins drew.
        "logic": {"model": {"dimensions": dimensions, "directions": [0, 180]}},
        "visualizations": [
            {
                "angle": 45,
                "layerCount": len(layers),
                "size": 64,
                "layers": {},
                "directions": {},
                "animations": animations,
            }
        ],
        "spritesheet": {
            "frames": frames,
            "meta": {
                "image": f"{classname}.png",
                "format": "RGBA8888",
                "size": {"w": sheet.width, "h": sheet.height},
                "scale": 1,
            },
        },
    }

    write(
        OUT_DIR / f"{classname}.nitro",
        [
            (f"{classname}.json", json.dumps(index).encode()),
            (f"{classname}.png", png.read_bytes()),
        ],
    )

    print(f"{classname}: {len(layers)} layers, {len(assets)} assets, sheet {sheet.width}x{sheet.height}")


def write(path, files):
    """The bundle format NitroBundleLoader.extractFiles reads: every member is zlib-deflated."""
    out = bytearray(struct.pack(">h", len(files)))

    for name, data in files:
        blob = zlib.compress(data)
        out += struct.pack(">h", len(name)) + name.encode() + struct.pack(">i", len(blob)) + blob

    path.write_bytes(out)


for classname, colour in ZONES.items():
    swim = list(range(SWIM_FRAMES))
    # Ends on the blank so the state can simply be held: the splash plays once and leaves nothing
    # behind, rather than parking the last ripple on the water until something clears the state.
    splash = list(range(1, SPLASH_FRAMES + 1)) + [0]

    bundle(
        classname,
        layers=[
            [area_member(colour, i) for i in range(SWIM_FRAMES)],
            [BLANK] + [f"s_fish_splash_a_0_1_1_0_{i}" for i in range(SPLASH_FRAMES)],
        ],
        animations={
            # Both states name both layers. A layer an animation leaves out is not defined to hold
            # its previous frame, and the splash staying on screen would be worse than a stutter.
            str(STATE_IDLE): {
                "layers": {
                    "0": sequence(swim, SWIM_REPEAT),
                    "1": sequence([0]),
                }
            },
            str(STATE_SPLASH): {
                "layers": {
                    "0": sequence(swim, SWIM_REPEAT),
                    # Plays once and stops on the last frame, which is the smallest ripple.
                    "1": sequence(splash, SPLASH_REPEAT, loop=1),
                }
            },
        },
        # The water is flush with the floor: nothing stacks on it and nobody stands on it.
        dimensions={"x": 1, "y": 1, "z": 0},
        mirror_layers={"a", "b"},
    )

bundle(
    SIGN_CLASS,
    layers=[[SIGN_MEMBER]],
    animations={str(STATE_IDLE): {"layers": {"0": sequence([0])}}},
    # Tall enough that the client treats it as a standing object rather than a floor decal.
    dimensions={"x": 1, "y": 1, "z": 1},
    # Origins ships one sign for both directions; mirroring it would reverse the fish on the board.
    mirror_layers=set(),
)
