"""Where the Origins tools read from and write to.

Every path is an environment variable with a working default, because the three things these tools
touch live outside the repository and in different places on different machines:

    VORTEX_ORIGINS_CAST     the Shockwave cast to extract, `.cct` or `.cst`
    VORTEX_ORIGINS_SPRITES  where extract-cast.py leaves its PNGs and regpoints.json
    VORTEX_ASSETS_ROOT      the served asset host — `gordon/`, `dcr/hof_furni/`, `gamedata/`

The asset host default is the Laragon document root this hotel runs on. Nothing here writes into the
repository except generate-fishopedia-layout.py, which owns a layout under `packages/`.

⚠ The served `furnidata_json.json` and `external_variables` are HAND-EDITED and are never regenerated
from sources. register-fishing-furnidata.py appends and re-running it is a no-op; keep it that way.
"""
import os
import pathlib

REPO = pathlib.Path(__file__).resolve().parents[3]


def _path(variable, default):
    return pathlib.Path(os.environ.get(variable, default))


# The cast. `hh_fishing.cct` ships with the launcher; `hh_fishing.cst` is the uncompressed authoring
# copy, which is the one ProjectorRays can decompile — see docs/vortex-original/fishing.md §20.
CAST = _path(
    "VORTEX_ORIGINS_CAST",
    os.path.expandvars(
        r"%APPDATA%/Habbo Launcher/downloads/shockwave/346/hh_fishing.cct"
    ),
)

# Extracted sprites. Not in the repository: they are Habbo's artwork, and the bundles built from
# them are what actually ships.
SPRITES = _path("VORTEX_ORIGINS_SPRITES", str(REPO / "sources" / "origins-fishing"))

ASSETS = _path("VORTEX_ASSETS_ROOT", r"C:/Laragon/www/vortex-assets")

# The avatar build the effect libraries are served under. Read from the hotel's own
# external_variables in the client; here it is the one directory under `gordon/`.
AVATAR_BUILD = os.environ.get(
    "VORTEX_AVATAR_BUILD", "vortex-assets-PRODUCTION-202601121522-867048149"
)

EFFECTS = ASSETS / "gordon" / AVATAR_BUILD
FURNI = ASSETS / "dcr" / "hof_furni"
FURNIDATA = ASSETS / "gamedata" / "furnidata_json.json"

LAYOUTS = REPO / "packages" / "vortex-client" / "src" / "vortex-layouts"
