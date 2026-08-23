"""Cross-check every wired element's addressed selection slots against what the emulator declares.

Run:  python scripts/wired-slot-sweep.py

Why this exists: clicking a merged input-source arrow on the two chest-give actions threw
"Cannot read properties of undefined (reading 'indexOf')" and took the whole wired form down.
`InputSourcesConf.getAllowedFurniSources(slot)` indexes an array and is typed as if it could not
miss, so a slot the server never declared reads back undefined.

Client side: each IWiredElement's `mergedSelections()` is a table of [furniSlot, userSlot] pairs.
The highest index in either column is the highest slot its pickers will ask for. The table is
inherited, so this walks `extends`.

Emulator side: each FurnitureWiredLogic declares GetAllowedFurniSources()/GetAllowedPlayerSources()
with one entry per slot. Shorter than the client's highest slot + 1 is an arrow reading past the
end of its list.

Matching is by wired code. Both sides are read as text — no build, no running server.

Caveat: the emulator entry count is a regex over the list literal, so a logic that writes its
sources in an unusual shape can be miscounted. Read the file before acting on a hit.
"""
import io, os, re

# Relative to the repository root, so this runs wherever the pair is checked out. The emulator
# is a sibling checkout, as docs/CLIENT-SERVER-ARCHITECTURE.md describes.
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT = os.path.join(REPO, 'packages', 'vortex-engine', 'src', 'habbo', 'roomevents', 'wired_setup')
CODES = CLIENT
EMU = os.path.join(
    os.path.dirname(REPO), 'vortex-emulator',
    'Vortex.Rooms', 'Object', 'Logic', 'Furniture', 'Floor', 'Wired'
)


def read(p):
    return io.open(p, encoding='utf-8', errors='replace').read()


# --- client: every class, its own slots (if any), its parent, and its code ---
raw = {}
for dp, _, fns in os.walk(CLIENT):
    for fn in fns:
        if not fn.endswith('.ts'):
            continue
        s = read(os.path.join(dp, fn))
        cls = fn[:-3]
        m = re.search(r'mergedSelections\(\)\s*:\s*number\[\]\[\]\s*\{\s*return\s*(\[.*?\]);', s, re.S)
        slots = None
        if m:
            pairs = re.findall(r'\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]', m.group(1))
            if pairs:
                slots = (max(int(a) for a, _ in pairs), max(int(b) for _, b in pairs))
        parent = re.search(r'export class\s+' + re.escape(cls) + r'\s+extends\s+(\w+)', s)
        code = re.search(r'get code\(\)\s*:\s*number\s*\{\s*return\s+\w+\.([A-Z0-9_]+);', s, re.S)
        raw[cls] = (slots, parent.group(1) if parent else None, code.group(1) if code else None)


def inherited_slots(cls, seen=None):
    """mergedSelections() as the class actually sees it, walking up `extends`."""
    seen = seen or set()
    if cls in seen or cls not in raw:
        return None
    seen.add(cls)
    slots, parent, _ = raw[cls]
    if slots is not None:
        return slots
    return inherited_slots(parent, seen) if parent else None


# A class only reaches InputSourcesConf if it has a code of its own AND some ancestor
# (or itself) declares mergedSelections().
elements = {}
for cls, (_, _, code) in raw.items():
    if code is None:
        continue
    slots = inherited_slots(cls)
    if slots is None:
        continue
    elements[cls] = (slots[0], slots[1], code)

# --- client: code constant -> number ---------------------------------------
codeval = {}
for fn in ('actiontypes/ActionTypeCodes.ts', 'conditions/ConditionCodes.ts'):
    p = os.path.join(CODES, fn)
    if not os.path.exists(p):
        continue
    for name, val in re.findall(r'readonly\s+([A-Z0-9_]+)\s*:\s*number\s*=\s*(\d+)', read(p)):
        codeval[name] = int(val)

# --- emulator: wired code -> (furni entries, player entries) ---------------
emu = {}
for dp, _, fns in os.walk(EMU):
    for fn in fns:
        if not fn.endswith('.cs'):
            continue
        s = read(os.path.join(dp, fn))
        wc = re.search(r'WiredCode\s*=>\s*\(int\)Wired\w+Type\.([A-Z0-9_]+)', s)
        if not wc:
            continue

        def count(method):
            m = re.search(method + r'\(\)\s*=>\s*\[(.*?)\n\s*\];', s, re.S)
            if not m:
                return 0
            # one entry per top-level "[...]" in the list literal
            return len(re.findall(r'\[(?:\.\.|\s*Wired)', m.group(1)))

        emu[wc.group(1)] = (count('GetAllowedFurniSources'), count('GetAllowedPlayerSources'), fn)

print(f"client elements with mergedSelections(): {len(elements)}")
print(f"emulator logics with a WiredCode:        {len(emu)}\n")

problems = 0
for cls, (maxf, maxu, code) in sorted(elements.items()):
    if code is None or code not in emu:
        continue
    furni, player, fn = emu[code]
    bad = []
    if furni <= maxf:
        bad.append(f"furni slot {maxf} needs {maxf + 1} entries, emulator declares {furni}")
    if player <= maxu:
        bad.append(f"user slot {maxu} needs {maxu + 1} entries, emulator declares {player}")
    if bad:
        problems += 1
        print(f"{cls} ({code}) -> {fn}")
        for b in bad:
            print(f"    {b}")

print(f"\n{problems} mismatched")
