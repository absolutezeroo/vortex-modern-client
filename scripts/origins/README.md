# Origins asset tools

Everything fishing renders — the spot furni, the sign, the rod, the float, the ripple, the line, and
the Fish-O-Pedia's layout — is built from **Habbo Hotel: Origins' own Shockwave cast** by the scripts
in this directory. There is no AS3 for any of it: fishing is an Origins feature written in
Shockwave/Lingo, and `docs/vortex-original/fishing.md` is the record of what the cast settled.

These scripts exist because the `.nitro` bundles they emit are binaries. Without them, the bundles
are artefacts with no source and nobody can change a pixel of the rod or move the float a tile.

Python 3 with Pillow. Nothing else.

## The pipeline, in order

| Step | Command | Writes |
|---|---|---|
| 1 | `python extract-cast.py` | Every bitmap in the cast as a PNG, plus `regpoints.json`, into `$VORTEX_ORIGINS_SPRITES` |
| 2 | `python build-fishing-spots.py` | `vtx_fishing_spot_*.nitro` and `vtx_fishing_sign.nitro` into the served `dcr/hof_furni/` |
| 3 | `python register-fishing-furnidata.py` | Appends the six classes to the served `furnidata_json.json` |
| 4 | `python build-fishing-rod.py` | `VortexFishingRod.nitro` (avatar effect 8100) into the served `gordon/<build>/` |
| 5 | `python generate-fishopedia-layout.py` | `vortex_fishing_pedia_xml.xml` in `vortex-layouts/` |

Steps 2–5 are independent of each other and all depend on step 1.

`dump-lingo-literals.py` prints the string table of every Lingo script in the cast — it is how the
Fish-O-Pedia's localisation keys and the fish codes were recovered. It reads the same cast and writes
nothing.

`measure-fishing-water.py` is the probe behind `build-fishing-rod.py`'s `TIP_TO_FLOAT`. It renders
the effect through `vortex-imager` (`pnpm imager` first) and prints, per direction, the vector from
the rod's tip to the float. **Run it with `DRAW_LINE = False`** — the line is drawn in the rod's own
black, so with it on the topmost pixel in the frame is the line's own top and the reading merely
echoes the table it was supposed to check.

## Configuration

Five environment variables, each with a working default, because everything these scripts touch
lives outside the repository:

| Variable | Default |
|---|---|
| `VORTEX_ORIGINS_CAST` | `%APPDATA%/Habbo Launcher/downloads/shockwave/346/hh_fishing.cct` |
| `VORTEX_ORIGINS_SPRITES` | `sources/origins-fishing` |
| `VORTEX_ASSETS_ROOT` | `C:/Laragon/www/vortex-assets` |
| `VORTEX_AVATAR_BUILD` | `vortex-assets-PRODUCTION-202601121522-867048149` |
| `VORTEX_IMAGER_URL` | `http://localhost:8081` |

`sources/` is gitignored, which is where the extracted artwork belongs: it is Habbo's, and the
bundles built from it are what ships.

## Two containers, and why both readers exist

`lib/dir_cast.py` reads a `.cct` — `XFIR`/`FGDC`, the afterburner container the launcher ships,
whose chunk map is itself zlib-compressed. `lib/cst_read.py` reads a `.cst` — `XFIR`/`MC95`,
uncompressed, `imap` → `mmap` → chunks. Same cast, two packagings, and the uncompressed one is the
only one **ProjectorRays** can decompile. That decompilation is what turned the Fish-O-Pedia from a
reconstruction into a transcription; see `docs/vortex-original/fishing.md` §20.

## Three decoding traps, all of which shipped wrong pixels once

- **A BITD is stored raw when RLE would not pay**, which is every tiny member. Running the RLE
  decoder over raw bytes does not fail — it produces plausible garbage. `fishingUI_green_pixel` is
  four bytes of opaque green, and read as RLE the leading `0xff` means "repeat the next byte twice",
  so the whole progress bar came out transparent. The test is `len(data) == pitch * height`.
- **RLE-compressed 32-bit bitmaps are PLANAR** — a row is width bytes of alpha, then width of red,
  then green, then blue. **Raw ones are interleaved ARGB.** Decoding one as the other gives a smeared
  image that looks almost right; that is how 26 `fishpedia_info_field_*` slices got pink and cyan
  slivers.
- **Opaque 32-bit members are drawn on a white card** and keyed out by Director's ink at draw time.
  Reproduced here by flood-filling pure white inward from the border — not by a corner vote, which
  ate the artwork out of the bookmark and the days grid.

`lib/macpal.py` generates the classic Mac OS system palette that 8-bit members index. It is derived,
not retyped: a 6×6×6 cube ordered by descending red, then four ramps, then black.
