"""Minimal reader for a Director 'afterburner' (FGDC) cast — enough to list members and pull bitmaps.

Written for hh_fishing.cct out of the Habbo Origins Shockwave client, which is the first real Origins
dump this project has had. Not a general Director parser: it handles the one container shape that
file uses (XFIR + Fver/Fcdr/ABMP/FGEI, zlib per member, small members packed into ILS).
"""
import struct, zlib, pathlib, sys


def varint(buf, off):
    v = 0
    while True:
        c = buf[off]; off += 1
        v = (v << 7) | (c & 0x7F)
        if not (c & 0x80):
            return v, off


def load(path):
    b = pathlib.Path(path).read_bytes()
    off = 12
    for _ in range(2):                       # Fver, Fcdr
        off += 4
        ln, off = varint(b, off)
        off += ln

    off += 4                                 # ABMP
    ln, off = varint(b, off)
    end = off + ln
    _, off = varint(b, off)
    _, off = varint(b, off)
    abmp = zlib.decompress(b[off:end])
    off = end

    o = 0
    for _ in range(3):
        _, o = varint(abmp, o)
    entries = []
    while o < len(abmp):
        rid, o = varint(abmp, o)
        roff, o = varint(abmp, o)
        csize, o = varint(abmp, o)
        dsize, o = varint(abmp, o)
        ctype, o = varint(abmp, o)
        tag = abmp[o:o + 4][::-1].decode('latin1'); o += 4
        entries.append(dict(id=rid, off=roff, csize=csize, dsize=dsize, ctype=ctype, tag=tag))

    # FGEI follows; member offsets are relative to the byte after its header.
    assert b[off:off + 4][::-1] == b'FGEI', b[off:off + 4]
    off += 4
    _, off = varint(b, off)
    base = off

    def read(e):
        raw = b[base + e['off']: base + e['off'] + e['csize']]
        if e['csize'] == e['dsize']:
            return raw
        try:
            return zlib.decompress(raw)
        except zlib.error:
            return raw

    # Small members live inside the initial load segment rather than at their own offset.
    ils = next((e for e in entries if e['tag'] == 'ILS '), None)
    inline = {}
    if ils is not None:
        data = read(ils)
        o = 0
        while o + 4 <= len(data):
            rid, o = varint(data, o)
            e = next((x for x in entries if x['id'] == rid), None)
            if e is None:
                break
            inline[rid] = data[o:o + e['dsize']]
            o += e['dsize']

    for e in entries:
        e['data'] = inline.get(e['id']) if e['id'] in inline else (read(e) if e['tag'] != 'ILS ' else b'')
    return entries


if __name__ == '__main__':
    for e in load(sys.argv[1]):
        if e['tag'] == 'CASt' and e['data']:
            d = e['data']
            print(e['id'], len(d), d[:64])
