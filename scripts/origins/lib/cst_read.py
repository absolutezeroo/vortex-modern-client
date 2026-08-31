"""Reads an uncompressed Director cast (XFIR/MC95, `.cst`) and inventories its chunks.

A different container from the `.cct` afterburner file `dir_cast.py` handles: no zlib, no chunk map
to inflate. Everything is little-endian ("XFIR" is "RIFX" byte-reversed) and the layout is:

    "XFIR" u32 length "MC95" then chunks, the first two being
    imap  ("pami")  -> holds the mmap's offset
    mmap  ("pamm")  -> the chunk table: fourCC, length, offset, flags, unk, link, 20 bytes each

Worth reading separately because an authoring-side cast can keep things a shipped one drops.
"""
import collections
import struct
import sys


def load(path):
    b = open(path, 'rb').read()

    if b[:4] != b'XFIR':
        raise ValueError(f'not an XFIR container: {b[:4]!r}')

    mmap_offset = struct.unpack_from('<I', b, 0x18)[0]

    if b[mmap_offset:mmap_offset + 4] != b'pamm':
        raise ValueError('no mmap where the imap says')

    header_length, entry_length = struct.unpack_from('<HH', b, mmap_offset + 8)
    used = struct.unpack_from('<I', b, mmap_offset + 12)[0]
    first = mmap_offset + 8 + header_length

    out = []

    for i in range(used):
        at = first + i * entry_length

        if at + entry_length > len(b):
            break

        four, length, offset = struct.unpack_from('<4sII', b, at)
        tag = four.decode('latin1')[::-1]

        if tag.strip() in ('', 'free', 'junk'):
            continue

        out.append({'id': i, 'tag': tag, 'offset': offset, 'length': length,
                    'data': b[offset + 8:offset + 8 + length]})

    return out


if __name__ == '__main__':
    chunks = load(sys.argv[1])
    counts = collections.Counter(c['tag'] for c in chunks)

    print(f'{len(chunks)} chunks\n')

    for tag, n in counts.most_common():
        total = sum(c['length'] for c in chunks if c['tag'] == tag)
        print(f'{n:6d}  {tag:6s}  {total:9d} bytes')
