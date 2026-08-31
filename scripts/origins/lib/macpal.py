"""The classic Mac OS 256-colour system palette, which Director exposes as #systemMac.

Not a table anybody should retype: it is generated. Indices 0-214 are the 6x6x6 cube ordered by
descending red, then green, then blue over [FF,CC,99,66,33,00]; 215-254 are the four ramps over the
values that cube skips; 255 is black.
"""
CUBE = [0xFF, 0xCC, 0x99, 0x66, 0x33, 0x00]
RAMP = [0xEE, 0xDD, 0xBB, 0xAA, 0x88, 0x77, 0x55, 0x44, 0x22, 0x11]


def system_mac():
    pal = []
    for r in CUBE:
        for g in CUBE:
            for b in CUBE:
                pal.append((r, g, b))
    pal = pal[:215]                                   # the cube's last entry is black, moved to 255
    for v in RAMP: pal.append((v, 0, 0))
    for v in RAMP: pal.append((0, v, 0))
    for v in RAMP: pal.append((0, 0, v))
    for v in RAMP: pal.append((v, v, v))
    pal.append((0, 0, 0))
    assert len(pal) == 256, len(pal)
    return pal
