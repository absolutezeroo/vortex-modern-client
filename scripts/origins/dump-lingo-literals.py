"""Parses the literal table of each Lscr chunk in hh_fishing.cct.

Not a decompiler: the bytecode stays unread. But a Lingo script stores every constant it uses —
strings AND integers — in a table with its own count and offsets, and that table is what carries the
coordinates `renderFishInfoPage` and friends draw at.

Lscr header, big-endian. The offsets below are two bytes earlier than the layout usually quoted for
Director 5-8, and they are the ones this build actually uses -- checked by arithmetic rather than
taken on faith: properties start at 92, which is exactly `headerLength`, 38 of them at 2 bytes each
end at 168, which is where the handlers begin; and literalsDataOffset + literalsDataCount
(27152 + 5498) is 32650, the chunk's own length.

    0x3C u16 propertiesCount    0x3E u32 propertiesOffset
    0x42 u16 globalsCount       0x44 u32 globalsOffset
    0x48 u16 handlersCount      0x4A u32 handlersOffset
    0x4E u16 literalsCount      0x50 u32 literalsOffset
    0x54 u32 literalsDataCount  0x58 u32 literalsDataOffset

Each literal record is (u32 type, u32 offset into the data blob). Type 1 is a string (u32 length then
bytes); type 4 is an integer stored in the offset field itself; type 9 is a float.
"""
import struct
import sys

from lib import dir_cast
from lib import paths

SRC = str(paths.CAST)


def literals(data):
    if len(data) < 0x60:
        return []

    count = struct.unpack_from('>H', data, 0x4E)[0]
    offset = struct.unpack_from('>I', data, 0x50)[0]
    data_count, data_offset = struct.unpack_from('>II', data, 0x54)
    _ = data_count

    if offset + count * 8 > len(data) or count > 4000:
        return []

    out = []

    for i in range(count):
        kind, at = struct.unpack_from('>II', data, offset + i * 8)

        if kind == 4:
            out.append(('int', at))
        elif kind == 1:
            start = data_offset + at

            if start + 4 > len(data):
                continue

            length = struct.unpack_from('>I', data, start)[0]

            if length > 400 or start + 4 + length > len(data):
                continue

            out.append(('str', data[start + 4:start + 4 + length].rstrip(b'\x00').decode('latin1')))
        elif kind == 9:
            start = data_offset + at

            if start + 8 <= len(data):
                out.append(('float', struct.unpack_from('>d', data, start)[0]))

    return out


def main(needle):
    scripts = [e for e in dir_cast.load(SRC) if e['tag'] == 'Lscr' and e['data']]
    print(f'{len(scripts)} scripts\n')

    for e in sorted(scripts, key=lambda s: -len(s['data'])):
        lits = literals(e['data'])

        if not lits:
            continue

        strings = [v for k, v in lits if k == 'str']

        if needle and not any(needle in s for s in strings):
            continue

        ints = [v for k, v in lits if k == 'int']
        print(f'--- script {e["id"]}, {len(e["data"])} bytes: '
              f'{len(strings)} strings, {len(ints)} ints ---')
        print('  strings:', ', '.join(repr(s) for s in strings[:40]))
        print('  ints   :', ', '.join(str(v) for v in ints[:120]))
        print()


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '')
