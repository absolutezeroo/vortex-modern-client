"""Copies the extracted cast sprites the WINDOW system needs into the client's image library.

`extract-cast.py` writes every bitmap in the cast; only some of them are window artwork. The rest are
room sprites — the spot furni, the rod, the splash, the shadows — and those go into `.nitro` bundles
that the room engine fetches by URL, never into the library. `App.ts` says the same thing at its own
filter, and decoding a hundred-odd room sprites into ImageBitmaps at boot would cost memory for
something no window ever asks for.

    python import-cast-images.py            # what it would copy
    python import-cast-images.py --write

`src/assets/images/` is gitignored (`*.png` is, repository-wide), which is why this exists: without
it the library is a directory somebody once populated by hand, and the 148 sprites that hand missed —
`fishing_store_tab1_m` and every other stretchable middle among them — are invisible with no error.
A `<static_bitmap>` whose `asset_uri` resolves to nothing renders nothing and says nothing.
"""
import pathlib
import shutil
import sys

from lib import paths

DESTINATION = (paths.REPO / 'packages' / 'vortex-client' / 'src' / 'assets' / 'images')

# Room sprites, by Habbo's own prefixes: `s_` furni, `h_` avatar-size, `sh_` its shadow. Everything
# else in this cast is window artwork.
ROOM_PREFIXES = ('s_', 'h_', 'sh_')


def wanted(name):
    return not name.startswith(ROOM_PREFIXES)


def main():
    write = '--write' in sys.argv
    sources = sorted(p for p in paths.SPRITES.glob('*.png') if wanted(p.stem))
    copied, skipped = 0, 0

    if not sources:
        raise SystemExit(f'No sprites in {paths.SPRITES} — run extract-cast.py first.')

    for source in sources:
        target = DESTINATION / source.name

        if target.exists() and target.read_bytes() == source.read_bytes():
            skipped += 1

            continue

        if write:
            shutil.copy2(source, target)

        copied += 1

    verb = 'copied' if write else 'would copy'
    print(f'{verb} {copied}, unchanged {skipped}, room sprites left alone '
          f'{len(list(paths.SPRITES.glob("*.png"))) - len(sources)}')

    if not write and copied:
        print('Re-run with --write.')


if __name__ == '__main__':
    main()
