"""Converts a Habbo Origins `.window.txt` element list into a Vortex window layout.

Origins' windows are declared, not drawn: each one is a flat list of Lingo property lists in
`docs/vortex-original/origins/*.window.txt`, and every element carries its member, its position, its
size and — for text — its colour, its font size and the localisation key it reads. That is the same
information a Vortex `<layout>` needs, so this is a mechanical translation rather than a redrawing,
and it is the reason the store and the derby did not have to be measured off screenshots the way the
Fish-O-Pedia's first three cuts were.

    python convert-window.py fishing_store_a            # prints the layout
    python convert-window.py fishing_store_a --write    # writes vortex_fishing_store_a_xml.xml

## What maps to what

| Origins | Vortex |
|---|---|
| `#media: #bitmap` | `<static_bitmap>` with `asset_uri` = the member name |
| `#media: #text` / `#field` | `<text>`, with the key as a `${...}` caption |
| `#locH` `#locV` `#width` `#height` | `x` `y` `width` `height`, verbatim |
| `#flipH: 1` `#flipV: 1` | `flip_x` `flip_y` |
| `#txtColor: "#rrggbb"` | `text_color`, `type="hex"` |
| `#fontSize` | `font_size` |
| `#alignment: #center` | `auto_size` — which IS the alignment in this window system, a string |
| `#wordWrap: 1` | `word_wrap` + `multiline` |
| `#id` | the element's `name`, suffixed when an id repeats |

`#ink`, `#blend`, `#palette`, `#strech`, `#cursor`, `#editable`, `#autoTab`, `#boxType`, `#model`,
`#fixedLineSpace`, `#font` and `#type` are dropped: they describe Director's compositor, its cursor
table and its font table, none of which this port has. `#ink: 36` is "background transparent", which
is what a PNG with an alpha channel already is.

## The two things a converted layout still needs by hand

- **A root container.** Origins has no window frame — the elements are sprites on the stage — so this
  emits one sized to the union of the elements. An unattached root renders nothing at all, which is
  the first of the five silent failures in `.claude/rules/window-ui.md`.
- **The texts.** `#key` names an Origins localisation key, and this hotel serves none of them; the
  keys it emits are listed by `--keys` so they can be added to `tools/locale-overrides/`.
"""
import pathlib
import re
import sys

from lib import paths

SOURCE = paths.REPO / 'docs' / 'vortex-original' / 'origins'

# Origins draws text with Director's own font table. The window system has one face, so only the
# size carries over — and 9pt in Director is what this port's default 12px already is.
DEFAULT_FONT_SIZE = 9

# Four members these windows use that `hh_fishing.cst` does not carry: they belong to Director's
# shared interface cast, which is the main client's chrome rather than fishing's. All four are flat
# fills, so each becomes a `<text>` with no caption and a background — the same trick the
# Fish-O-Pedia's title box uses, and the only way this window system draws a plain rectangle.
#
# The alpha is the colour's high byte (`WindowComposite` derives the fill alpha from it), so an
# opaque fill has to say `0xff`; leaving it out fills fully transparent and draws nothing.
SUBSTITUTES = {
    # The standard window body fill.
    'content.middle.middle': ('0xffe6e6e6', None),
    # A one-pixel drop shadow, stretched. Black at a quarter alpha.
    'shadow.pixel': ('0x40000000', None),
    # A generic button plate and the store's header bar.
    'button_element': ('0xffd0d0d0', '0xff8c8c8c'),
    'fishing_store_header': ('0xff9ec7d1', None),
}

# Origins' text keys, mapped onto this hotel's namespace.
#
# The keys on the left are RECOVERED — they are what the `.window.txt` elements name in `#key`. The
# wording behind the keys on the right is DERIVED, because Origins reads it from its own hotel's text
# table, this one serves none of it, and the cast's Lingo carries no `getText` default for any of
# them. `tools/locale-overrides/fishing.en.txt` says so where they are written.
#
# A key with no entry here passes through unchanged and will render as the raw key, which is the
# visible signal that one was missed.
KEY_MAP = {
    'fishing_store_tab_info': 'vortex.fishing.store.tab_info',
    'fishing_store_tab_store': 'vortex.fishing.store.tab_store',
    'fishing_store_tab_stats': 'vortex.fishing.store.tab_stats',
    'fishing_rod_txt': 'vortex.fishing.store.rod',
    'fishing_rod_upgrade_txt': 'vortex.fishing.store.rod_upgrade',
    'upgrade_rod_button_txt': 'vortex.fishing.store.upgrade_button',
    'fishing_stats_txt': 'vortex.fishing.store.stats',
    'fish_storage_title': 'vortex.fishing.store.storage_title',
    'fishing_help_title_1': 'vortex.fishing.store.help_title_1',
    'fishing_help_title_2': 'vortex.fishing.store.help_title_2',
    'fishing_help_title_3': 'vortex.fishing.store.help_title_3',
    'fishing_help_text_1': 'vortex.fishing.store.help_text_1',
    'fishing_help_text_2': 'vortex.fishing.store.help_text_2',
    'fishing_help_text_3': 'vortex.fishing.store.help_text_3',
    'fish_leader_title': 'vortex.fishing.derby.leader_title',
    'derby_leader_close': 'vortex.fishing.derby.leader_close',
    'derby_std_label': 'vortex.fishing.derby.standard',
    'derby_fzy_label': 'vortex.fishing.derby.frenzy',
    'derby_std_goal_label': 'vortex.fishing.derby.standard_goal',
    'derby_fzy_goal_label': 'vortex.fishing.derby.frenzy_goal',
    'derby_std_info_label': 'vortex.fishing.derby.standard_info',
    'derby_timer_label': 'vortex.fishing.derby.timer',
    'derby_count_label': 'vortex.fishing.derby.count',
    'derby_weight_label': 'vortex.fishing.derby.weight',
    'derby_weight_unit': 'vortex.fishing.derby.weight_unit',
    'derby_txt_page': 'vortex.fishing.derby.page',
}

ELEMENT = re.compile(r'^\s*\[#member:.*?\]\s*$', re.M)
PROPERTY = re.compile(r'#(\w+):\s*("(?:[^"]*)"|#\w+|\[[^\]]*\]|-?\d+)')


def parse(text):
    """Every element in file order, as a dict of its Lingo properties."""
    out = []

    for row in ELEMENT.findall(text):
        element = {}

        for name, raw in PROPERTY.findall(row):
            if raw.startswith('"'):
                element[name] = raw[1:-1]
            elif raw.startswith('#') or raw.startswith('['):
                element[name] = raw
            else:
                element[name] = int(raw)

        out.append(element)

    return out


def escape(value):
    return (value.replace('&', '&amp;').replace('<', '&lt;')
                 .replace('>', '&gt;').replace('"', '&quot;'))


def names(elements):
    """`#id` is a GROUP — a tab is four pieces sharing one — so a repeat gets a suffix."""
    seen, out = {}, []

    for element in elements:
        base = element.get('id') or element.get('member') or 'element'
        base = re.sub(r'[^a-zA-Z0-9_]', '_', base)
        index = seen.get(base, 0)
        seen[base] = index + 1
        out.append(base if index == 0 else f'{base}_{index}')

    return out


def variables(pairs):
    if not pairs:
        return '/>'

    body = '\n'.join(f'            <var key="{k}" value="{v}" type="{t}"/>' for k, v, t in pairs)

    return '>\n          <variables>\n' + body + '\n          </variables>\n        </%s>'


def fill(element, name, colour, border):
    """A member the fishing cast does not carry, drawn as a plain rectangle. See SUBSTITUTES."""
    pairs = [('background', 'true', 'Boolean'), ('background_color', colour, 'hex')]

    if border is not None:
        pairs += [('border', 'true', 'Boolean'), ('border_color', border, 'hex')]

    head = (f'        <text x="{element["locH"]}" y="{element["locV"]}"'
            f' width="{element["width"]}" height="{element["height"]}"'
            f' params="144" style="0"\n              name="{name}" caption=""')

    return head + (variables(pairs) % 'text')


def bitmap(element, name):
    substitute = SUBSTITUTES.get(element['member'])

    if substitute is not None:
        return fill(element, name, *substitute)

    pairs = [('asset_uri', escape(element['member']), 'String')]

    if element.get('flipH') == 1:
        pairs.append(('flip_x', 'true', 'Boolean'))
    if element.get('flipV') == 1:
        pairs.append(('flip_y', 'true', 'Boolean'))

    head = (f'        <static_bitmap x="{element["locH"]}" y="{element["locV"]}"'
            f' width="{element["width"]}" height="{element["height"]}"'
            f' params="16" style="0"\n                       name="{name}"')

    return head + (variables(pairs) % 'static_bitmap')


def text(element, name):
    pairs = []
    colour = element.get('txtColor')

    if isinstance(colour, str) and colour.startswith('#'):
        pairs.append(('text_color', '0x' + colour[1:], 'hex'))

    size = element.get('fontSize')

    if isinstance(size, int) and size != DEFAULT_FONT_SIZE:
        pairs.append(('font_size', str(size + 3), 'int'))

    alignment = element.get('alignment', '#left')

    if alignment in ('#center', '#right'):
        pairs.append(('auto_size', alignment[1:], 'String'))

    if element.get('fontStyle', '').find('bold') >= 0:
        pairs.append(('bold', 'true', 'Boolean'))

    if element.get('wordWrap') == 1:
        pairs.append(('word_wrap', 'true', 'Boolean'))
        pairs.append(('multiline', 'true', 'Boolean'))

    key = element.get('key')
    caption = f'${{{KEY_MAP.get(key, key)}}}' if key else ''

    head = (f'        <text x="{element["locH"]}" y="{element["locV"]}"'
            f' width="{element["width"]}" height="{element["height"]}"'
            f' params="144" style="0"\n              name="{name}" caption="{escape(caption)}"')

    return head + (variables(pairs) % 'text')


def convert(source, layout):
    elements = parse(source.read_text(encoding='utf8', errors='replace'))

    if not elements:
        raise SystemExit(f'{source.name} declares no elements — Origins ships it empty.')

    width = max(e['locH'] + e['width'] for e in elements)
    height = max(e['locV'] + e['height'] for e in elements)
    body = []

    for element, name in zip(elements, names(elements)):
        media = element.get('media', '#bitmap')
        body.append(bitmap(element, name) if media == '#bitmap' else text(element, name))

    children = '\n\n'.join(body)

    return f'''<?xml version="1.0" encoding="UTF-8"?>
<!--
  {layout}, converted from Habbo Origins' own window declaration.

  GENERATED - do not edit. Change scripts/origins/convert-window.py, or the source list in
  docs/vortex-original/origins/{source.name}, and re-run it.

  Origins declares its windows as a flat list of Lingo property lists rather than drawing them, so
  every coordinate below is Origins' own `#locH`/`#locV`, verbatim. What it does NOT carry is a
  window frame: the elements are sprites on the stage, so the container here is this port's, sized to
  their union.

  Vortex-only: fishing is an Origins feature and has no counterpart in any Habbo *Flash* dump, so
  this lives in vortex-layouts/ rather than in the gitignored src/assets/window-layouts/.
-->
<layout name="{layout}" width="{width}" height="{height}" version="0.1">
  <window>
    <container x="60" y="60" width="{width}" height="{height}" params="17" style="0"
               name="{layout}_root">
      <children>

{children}

      </children>
    </container>
  </window>
</layout>
'''


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)

    stem = sys.argv[1].replace('.window.txt', '')
    source = SOURCE / f'{stem}.window.txt'
    layout = f'vortex_{stem}'
    xml = convert(source, layout)

    if '--keys' in sys.argv:
        for key in sorted({e['key'] for e in parse(source.read_text(encoding='utf8', errors='replace'))
                           if e.get('key')}):
            print(key)

        return

    if '--write' in sys.argv:
        out = paths.LAYOUTS / f'{layout}_xml.xml'
        out.write_text(xml, encoding='utf8')
        print(f'{out.name}: {xml.count("<static_bitmap") + xml.count("<text ")} elements')
    else:
        print(xml)


if __name__ == '__main__':
    main()
