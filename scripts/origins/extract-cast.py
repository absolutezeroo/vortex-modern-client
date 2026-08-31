"""Pulls every bitmap out of Habbo Origins' hh_fishing.cct as a PNG.

Director stores 32-bit bitmaps RLE-compressed and PLANAR: each row is width bytes of alpha, then
width of red, then green, then blue -- not interleaved pixels. Decoding it as ARGB tuples gives a
smeared image that looks almost right, which is the trap.
"""
import collections, struct, re, sys, pathlib
from PIL import Image
from lib import dir_cast
from lib import macpal
from lib import paths

MAC = macpal.system_mac()

SRC = str(paths.CAST)


def rle(data, expected):
    """Returns (bytes, was_raw). `was_raw` decides the pixel layout -- see the 32-bit branch."""
    # Director stores a BITD raw when RLE would not pay -- which is every tiny member. Running the
    # decoder over raw bytes does not fail, it produces plausible garbage: `fishingUI_green_pixel`
    # is the four bytes `ff 00 aa 00` (opaque green), and read as RLE the leading 0xff is "repeat
    # the next byte twice", so the whole progress bar came out transparent black.
    if len(data) == expected:
        return data, True

    out = bytearray()
    i = 0
    while len(out) < expected and i < len(data):
        b = data[i]; i += 1
        if b & 0x80:
            if i >= len(data): break
            out += bytes([data[i]]) * (0x101 - b); i += 1
        else:
            out += data[i:i + b + 1]; i += b + 1
    return bytes(out[:expected]), False


def member_name(d, ilen):
    m = re.search(rb'[\x01-\x40][A-Za-z0-9_ .\-]{3,40}', d[12:12 + ilen])
    if not m:
        return None
    raw = m.group(0)
    return raw[1:1 + raw[0]].decode('latin1', 'replace')


def main(out_dir):
    out = pathlib.Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    entries = dir_cast.load(SRC)
    by_id = {e['id']: e for e in entries}

    # The KEY* chunk maps owner (CASt) to child (BITD). Pairing by "the next BITD id" instead looked
    # plausible and produced smeared images for the members it did not skip -- the ids are not in
    # step. KEY* is little-endian here even though the cast members are big-endian.
    key = next(e for e in entries if e['tag'] == 'KEY*')['data']
    hlen, esize, _maxc, usedc = struct.unpack_from('<HHII', key, 0)
    bitd = {}
    for i in range(usedc):
        sect, cast, fourcc = struct.unpack_from('<III', key, hlen + i * esize)
        if struct.pack('<I', fourcc) == b'DTIB' and sect in by_id:
            bitd[cast] = by_id[sect]

    casts = []
    for e in entries:
        if e['tag'] != 'CASt' or not e['data']:
            continue
        d = e['data']
        ctype, ilen, dlen = struct.unpack_from('>III', d, 0)
        if ctype != 1 or dlen < 24:
            continue
        spec = d[12 + ilen:12 + ilen + dlen]
        pitch = struct.unpack_from('>H', spec, 0)[0] & 0x7FFF
        top, left, bottom, right = struct.unpack_from('>hhhh', spec, 2)
        # Low byte only: the field is flags|depth, and 0x1020 / 0x4020 / 0x2020 are all 32-bit with
        # a flag set. Reading the whole short skips four fifths of the cast as "4128-bit".
        depth = struct.unpack_from('>H', spec, 22)[0] & 0xFF
        casts.append((e['id'], member_name(d, ilen), right - left, bottom - top, pitch, depth))

    written = skipped = 0
    for cid, name, w, h, pitch, depth in casts:
        if not name or w <= 0 or h <= 0 or depth not in (8, 32):
            skipped += 1; continue
        e = bitd.get(cid)
        if e is None:
            skipped += 1; continue
        raw, was_raw = rle(e['data'], pitch * h)
        if len(raw) < pitch * h:
            skipped += 1; continue

        img = Image.new('RGBA', (w, h))
        px = img.load()

        if depth == 8:
            # Indices into Director's #systemMac table, which the window definitions name explicitly.
            # Index 0 is white and is what these sprites use as their transparent ground.
            for y in range(h):
                row = raw[y * pitch:(y + 1) * pitch]
                for x in range(w):
                    i = row[x]
                    r, g, b = MAC[i]
                    px[x, y] = (r, g, b, 0 if i == 0 else 255)
        else:
            # A 32-bit row is PLANAR when the member was RLE-compressed -- w bytes of alpha, then
            # w of red, w of green, w of blue -- and INTERLEAVED ARGB when it was stored raw.
            #
            # Nothing about the header says which; the giveaway is the data. `fishpedia_info_field_a_l`
            # is three pixels wide and its middle row reads `ff cc cc cc  ff cc cc cc  ff cc cc cc`,
            # which is three opaque greys interleaved and nonsense as planes. Read as planes it came
            # out pink, green and cyan -- and every one-pixel-wide member decoded correctly either
            # way, which is exactly why this went unnoticed until a three-wide one was looked at.
            opaque = True
            for y in range(h):
                row = raw[y * pitch:(y + 1) * pitch]

                for x in range(w):
                    if was_raw:
                        a, r, g, b = row[x * 4], row[x * 4 + 1], row[x * 4 + 2], row[x * 4 + 3]
                    else:
                        a, r, g, b = row[x], row[w + x], row[2 * w + x], row[3 * w + x]

                    px[x, y] = (r, g, b, a)

                    if a != 255:
                        opaque = False

            # Some 32-bit members carry no alpha at all -- every pixel is opaque and Director keys
            # the background out at draw time through the sprite's ink (`#ink: 36`, background
            # transparent) instead. Reproduce that by colour-keying the card the sprite was drawn on;
            # without it the sprite ships with that card.
            #
            # Members with no alpha at all are drawn on a white card, which Director keys out at draw
            # time through the sprite's "background transparent" ink. Reproduce it by FLOOD-FILLING
            # PURE WHITE INWARD FROM THE BORDER.
            #
            # Both halves of that matter, and each was learned by getting it wrong:
            #
            #   * White only. Keying whatever colour the corners hold destroys the artwork whenever
            #     the drawing reaches an edge: it took the black outline off `fishpedia_bookmark` and
            #     the whole of `fishpedia_bookmark_shadow`, and it made the separators of
            #     `fishpedia_days_grid_bg` transparent. A member drawn on some other colour now keeps
            #     every pixel instead, which is visible and reportable rather than silently holed.
            #   * From the border. White INSIDE the drawing is not the card: the fish on the bookmark
            #     is white, and so is the rod's shaft. Reaching them means crossing the outline, and
            #     a flood fill does not.
            #
            # 24 of this cast's 206 opaque members have no white on their border at all — the store
            # plates, `fishpedia_page`, `fishingUI_green_pixel` — and they come through untouched,
            # which is what a full-bleed plate wants.
            if opaque:
                WHITE = (255, 255, 255, 255)
                seen = set()
                queue = [(x, y) for x in range(w) for y in (0, h - 1)]
                queue += [(x, y) for y in range(h) for x in (0, w - 1)]

                while queue:
                    x, y = queue.pop()

                    if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
                        continue

                    seen.add((x, y))

                    if px[x, y] != WHITE:
                        continue

                    px[x, y] = (0, 0, 0, 0)
                    queue += [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]
        img.save(out / f'{name}.png')
        written += 1

    print(f'ecrits: {written}, ignores: {skipped}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else str(paths.SPRITES))
