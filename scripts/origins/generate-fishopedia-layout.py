"""Generates vortex_fishing_pedia_xml.xml from Origins' own decompiled Lingo.

Every constant below is read out of `ParentScript 391 - Fish-O-Pedia Manager Class.ls`, which
ProjectorRays recovered from `hh_fishing.cst`. Nothing here is measured off a screenshot any more.

The Lingo composites the whole screen into one 528x409 buffer; this port builds it out of windows, so
the coordinates are translated once, here:

    drawCurrentPages    the book is drawn at (0, 50) in the buffer, so BOOK = BUFFER - (0, 50)
                        page images go at x = 8 + (i - 1) * 235 and y = 55, i.e. book y = 5
    renderPageBackground a page is a 236x299 image; tStartLocH is 33 left / 43 right
    renderFishesOverviewPage tStartLocH 20 left / 30 right; card i at
                        x = start + (i mod 2) * 96, y = 22 + 62 * (i div 2)
                        name at (+1, +6) in a 93x11 box, preview at (+0, +17)
    renderFishInfoPage  tStartLocH 14 left / 24 right, and the y of every row
    drawPageHiliter     x = 28 + 245 * isRight + (i mod 2) * 96, y = 94 + 62 * (i div 2)  [buffer]
    drawBookmark        (195, 27) buffer -- above the book, which is why it must not be clipped
    drawCloseButton     (465, 57) buffer
    drawPageCorner      (8, 330) and (455, 330) buffer, the right one flipped

TOP_MARGIN exists because the bookmark sits 23px above the book and this port's container clips its
children; the whole tree is shifted down by it.
"""
import pathlib

TOP = 24                     # room above the book for the bookmark
PAGE_Y = 5 + TOP             # a page image's top, book-relative + the margin
PAGE_X = {'l': 8, 'r': 243}  # drawCurrentPages: 8 + (i - 1) * 235
INFO_H = {'l': 14, 'r': 24}  # renderFishInfoPage's tStartLocH
GRID_H = {'l': 20, 'r': 30}  # renderFishesOverviewPage's tStartLocH
BG_H = {'l': 33, 'r': 43}    # renderPageBackground's tStartLocH

CARD_STRIDE_X, CARD_STRIDE_Y = 96, 62
PER_PAGE = 8

BLUE = '0x659dab'            # color(101, 157, 171), the page frame and every title
PAGE_FILL = '0xe6e6e6'       # color(230, 230, 230), what the title box is filled with

DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']


def bitmap(name, x, y, w, h, uri, params=16, visible=True):
    vis = '' if visible else ' visible="false"'
    return (f'        <static_bitmap x="{x}" y="{y}" width="{w}" height="{h}" params="{params}" style="0"\n'
            f'                       name="{name}"{vis}>\n'
            f'          <variables>\n'
            f'            <var key="asset_uri" value="{uri}" type="String"/>\n'
            f'          </variables>\n'
            f'        </static_bitmap>')


def text(name, x, y, w, h, caption='', bold=False, centre=False, colour=None,
         background=False, border=False, visible=True):
    vars_ = []

    if bold:
        vars_.append('            <var key="bold" value="true" type="Boolean"/>')
    if centre:
        vars_.append('            <var key="auto_size" value="center" type="String"/>')
    if colour:
        vars_.append(f'            <var key="text_color" value="{colour}" type="hex"/>')
    if background:
        vars_.append('            <var key="background" value="true" type="Boolean"/>')
        vars_.append(f'            <var key="background_color" value="{PAGE_FILL}" type="hex"/>')
    if border:
        vars_.append('            <var key="border" value="true" type="Boolean"/>')
        vars_.append(f'            <var key="border_color" value="{BLUE}" type="hex"/>')

    vis = '' if visible else ' visible="false"'
    head = (f'        <text x="{x}" y="{y}" width="{w}" height="{h}" params="144" style="0"\n'
            f'              name="{name}" caption="{caption}"{vis}')

    if not vars_:
        return head + '/>'

    return head + '>\n          <variables>\n' + '\n'.join(vars_) + '\n          </variables>\n        </text>'


def page(side):
    """One page: its title, its eight cards, its entry, its number and its arrow."""
    px, gx, ix, bx = PAGE_X[side], GRID_H[side], INFO_H[side], BG_H[side]
    p, d = f'pedia_{side}', f'pedia_{side}d'
    out = [f'        <!-- ===== {"LEFT" if side == "l" else "RIGHT"} PAGE ===== -->']

    # renderPageBackground: `rect(x, 9, x + titleWidth + 9, 22)` filled #e6e6e6 and then stroked 1px
    # in the page frame's own blue, with the title drawn inside it at (+5, +2).
    #
    # Box and title are two windows, and the box is shared by both states. Lingo puts the text at
    # box + (5, 2), where a bordered `<text>` insets its own caption by its margin instead; and the
    # box has to end at the title, which is a different width on every entry page -- "Frog Details"
    # against "Spotted Eagle Ray Details". FishingPediaView.sizeTitleBox() sets that width; the 150
    # here is only what stands until it runs.
    out.append(text(f'{p}_titlebox', px + bx, PAGE_Y + 9, 150, 13,
                    background=True, border=True, visible=False))
    out.append(text(f'{p}_header', px + bx + 5, PAGE_Y + 11, 150, 13,
                    caption='${vortex.fishing.book.overview}', colour=BLUE, visible=False))
    out.append(text(f'{d}_header', px + bx + 5, PAGE_Y + 11, 150, 13,
                    colour=BLUE, visible=False))

    # --- overview state: eight cards, name above the plate ---
    for i in range(PER_PAGE):
        x = px + gx + (i % 2) * CARD_STRIDE_X
        y = PAGE_Y + 22 + CARD_STRIDE_Y * (i // 2)

        out.append(text(f'{p}_name_{i}', x + 1, y + 6, 93, 11, visible=False))
        out.append(bitmap(f'{p}_card_{i}', x, y + 17, 90, 45, 'fishpedia_slot', params=17, visible=False))
        # The preview box is the SLOT, not a smaller box pinned to its corner: renderFishPreview
        # centres the fish in the duplicated slot itself. 74x34 here put every fish 8 left and 5 high.
        out.append(f'        <bitmap x="{x}" y="{y + 17}" width="90" height="45" params="16" style="0"\n'
                   f'                name="{p}_fish_{i}" visible="false"/>')

    # --- detail state ---
    #
    # One plate, always `fishpedia_info_slot`. There is no darker alternate: renderFishPreview greys
    # the FISH, blitting `fishpedia_gray` through the preview's own matte, and the plate never
    # changes. A second `_slot_gray` window here was an invention.
    out.append(text(f'{d}_name', px + ix + 6, PAGE_Y + 27, 150, 14, bold=True, visible=False))
    out.append(bitmap(f'{d}_slot', px + ix + 6, PAGE_Y + 38, 90, 45, 'fishpedia_info_slot', visible=False))
    out.append(f'        <bitmap x="{px + ix + 6}" y="{PAGE_Y + 38}" width="90" height="45" params="16" style="0"\n'
               f'                name="{d}_fish" visible="false"/>')

    out.append(text(f'{d}_rarity_label', px + ix + 102, PAGE_Y + 59, 80, 13,
                    caption='${vortex.fishing.book.rarity}', bold=True, visible=False))
    out.append(f'        <bitmap x="{px + ix + 102}" y="{PAGE_Y + 70}" width="64" height="9" params="16" style="0"\n'
               f'                name="{d}_stars" visible="false"/>')

    # renderInfoField: the grey `a_*` box holds the LABEL, the light `b_*` box the VALUE, side by
    # side — not nested. Its width is titleWidth + valueWidth + 8, so the pair is drawn in code.
    for nm, y in (('xp', 87), ('tokens', 104), ('rate', 121)):
        fx, fy = px + ix + 6, PAGE_Y + y
        # renderInfoField: `a_l` at 0, `a_m` stretched under the LABEL, `a_r` closing it; then `b_m`
        # under the VALUE and `b_r` closing that. Two boxes side by side, not nested. The widths come
        # from the rendered text, so the view measures and places them.
        out.append(bitmap(f'{d}_{nm}_a_l', fx, fy, 3, 13, 'fishpedia_info_field_a_l', visible=False))
        out.append(bitmap(f'{d}_{nm}_a_m', fx + 3, fy, 40, 13, 'fishpedia_info_field_a_m', visible=False))
        out.append(bitmap(f'{d}_{nm}_a_r', fx + 43, fy, 2, 13, 'fishpedia_info_field_a_r', visible=False))
        out.append(text(f'{d}_{nm}_label', fx + 5, fy + 2, 60, 11,
                        caption='${vortex.fishing.book.' + nm + '_label}', bold=True, visible=False))
        out.append(bitmap(f'{d}_{nm}_b_m', fx + 45, fy, 40, 13, 'fishpedia_info_field_b_m', visible=False))
        out.append(bitmap(f'{d}_{nm}_b_r', fx + 85, fy, 3, 13, 'fishpedia_info_field_b_r', visible=False))
        out.append(text(f'{d}_{nm}', fx + 47, fy + 2, 60, 11, visible=False))

    out.append(text(f'{d}_zone_label', px + ix + 8, PAGE_Y + 139, 120, 13,
                    caption='${vortex.fishing.book.location}', bold=True, visible=False))
    out.append(bitmap(f'{d}_zone_bar', px + ix + 4, PAGE_Y + 150, 162, 20,
                      'fishpedia_location_bar', visible=False))
    out.append(text(f'{d}_zone', px + ix + 7, PAGE_Y + 155, 156, 15, visible=False))

    out.append(text(f'{d}_hours_label', px + ix + 6, PAGE_Y + 177, 120, 13,
                    caption='${vortex.fishing.book.hours}', bold=True, visible=False))
    # renderFishTimeline: a 159x36 image with the ruler at (3, 14) and the bars above it, y 0..12.
    out.append(f'        <bitmap x="{px + ix + 1}" y="{PAGE_Y + 191}" width="159" height="12" params="16" style="0"\n'
               f'                name="{d}_hours" visible="false"/>')
    out.append(bitmap(f'{d}_hours_bar', px + ix + 4, PAGE_Y + 205, 154, 20,
                      'fishpedia_timeline_bg', visible=False))

    out.append(text(f'{d}_days_label', px + ix + 6, PAGE_Y + 231, 120, 13,
                    caption='${vortex.fishing.book.days}', bold=True, visible=False))
    # renderFishActiveDays: a 190x28 image, names at y -1 and markers at y 12.
    out.append(bitmap(f'{d}_days_grid', px + ix + 4, PAGE_Y + 246, 190, 28,
                      'fishpedia_days_grid_bg', visible=False))

    for i, day in enumerate(DAYS):
        out.append(text(f'{d}_dayname_{i}', px + ix + 4 + i * 27, PAGE_Y + 245, 27, 12,
                        caption='${vortex.fishing.book.day.' + day + '}', centre=True, visible=False))

    for i in range(7):
        out.append(bitmap(f'{d}_day_{i}', px + ix + 12 + i * 27, PAGE_Y + 258, 12, 12,
                          'fishpedia_active_day_marker', visible=False))

    # The page number, centred the way renderPageBackground centres it, and the arrow beside it.
    out.append(text(f'{p}_page', px + bx, PAGE_Y + 286, 165, 13, centre=True, colour=BLUE))

    if side == 'l':
        out.append(bitmap('pedia_prev', px + 11, PAGE_Y + 288, 20, 7, 'fishpedia_arrow',
                          params=17, visible=False))
    else:
        out.append('        <static_bitmap x="%d" y="%d" width="20" height="7" params="17" style="0"\n'
                   '                       name="pedia_next">\n'
                   '          <variables>\n'
                   '            <var key="asset_uri" value="fishpedia_arrow" type="String"/>\n'
                   '            <var key="flip_x" value="true" type="Boolean"/>\n'
                   '          </variables>\n'
                   '        </static_bitmap>' % (px + 205, PAGE_Y + 288))

    return '\n\n'.join(out)


HEAD = f'''<?xml version="1.0" encoding="UTF-8"?>
<!--
  The Fish-O-Pedia, generated from Origins' OWN DECOMPILED LINGO.

  ⚠ GENERATED FILE — do not edit. Change scripts/origins/generate-fishopedia-layout.py and re-run it;
  an edit here is silently discarded the next time anybody does. This has already happened once: a
  title box, a plate and eighteen preview sizes were hand-fixed and then overwritten.

  `hh_fishing.cst` (the uncompressed cast) run through ProjectorRays yields
  `ParentScript 391 - Fish-O-Pedia Manager Class.ls`, kept in
  docs/vortex-original/origins/lingo/. Every coordinate below is read out of it. Three earlier cuts
  of this layout were reconstructed from screenshots and the cast's artwork, and each was wrong in a
  way the next screenshot exposed; none of that guessing survives here.

  Origins composites the whole screen into one 528x409 buffer, so the numbers are translated once:

    drawCurrentPages      draws the book at (0, 50), so BOOK = BUFFER - (0, 50), and the two page
                          images at x = 8 and x = 243, y = 55.
    renderPageBackground  a page is its own 236x299 image; `tStartLocH` is 33 left, 43 right.
    renderFishesOverviewPage  `tStartLocH` 20 / 30; card i at x = start + (i mod 2) * 96 and
                          y = 22 + 62 * (i div 2), its name at (+1, +6) in a 93x11 box and its
                          preview at (+0, +17). Eight fish a page, four rows of two.
    renderFishInfoPage    `tStartLocH` 14 / 24, and the y of every row: 27 name, 38 fish, 59 and 70
                          rarity, 87/104/121 the three fields, 139/150/155 location, 177/191 hours,
                          231/246 days.
    drawPageHiliter       x = 28 + 245 * isRight + (i mod 2) * 96, y = 94 + 62 * (i div 2).
    drawBookmark          (195, 27) — ABOVE the book, which is why the container carries a {TOP}px
                          margin at the top and does not clip.
    drawCloseButton       (465, 57).   drawPageCorner  (8, 330) / (455, 330), the right one flipped.

  Everything is shifted down by {TOP} for that margin.

  Three things are still drawn in code rather than declared, because Origins computes them:
  the stat rows (`renderInfoField` sizes its two boxes to the text), the hour bars, and the rarity
  stars. Their slots are plain `<bitmap>` windows the view composites into.

  Vortex-only: no counterpart in any Habbo *Flash* dump, so it lives here rather than in
  src/assets/window-layouts/, which is gitignored and regenerated by tools/build-window-assets.mjs.
-->
<layout name="vortex_fishing_pedia" width="487" height="{309 + TOP}" version="0.1">
  <window>
    <!--
      params 17 (INPUT_EVENT_PROCESSOR | USE_PARENT_GRAPHIC_CONTEXT), never 1073741841: that extra
      bit is FORCE_CLIPPING and it cuts every child to the container, which is what kept the bookmark
      from hanging over the top edge.
    -->
    <container x="60" y="60" width="487" height="{309 + TOP}" params="17" style="0"
               name="pedia_root">
      <children>

        <!-- The open book. drawCurrentPages puts it at buffer (0, 50); here it clears the margin. -->
{bitmap('pedia_bg', 0, TOP, 487, 309, 'fishpedia_background')}

        <!--
          drawPageHiliter. Declared before the cards because child order is draw order and the plate
          is opaque: over the card it blanks it, under it only the border and shadow show.
        -->
{bitmap('pedia_hiliter', 28, PAGE_Y + 39, 92, 47, 'fishpedia_hiliter', visible=False)}

'''

TAIL = f'''

        <!-- drawBookmark: buffer (195, 27), which is above the book's own top edge. -->
{bitmap('pedia_bookmark_shadow', 197, 29 - 50 + TOP, 25, 28, 'fishpedia_bookmark_shadow', visible=False)}
{bitmap('pedia_bookmark', 195, 27 - 50 + TOP, 25, 28, 'fishpedia_bookmark', params=17, visible=False)}

        <!-- drawPageCorner: shown while the pointer is over the arrow that would turn the page. -->
{bitmap('pedia_corner_l', 8, 330 - 50 + TOP, 24, 25, 'fishpedia_corner', visible=False)}
        <static_bitmap x="455" y="{330 - 50 + TOP}" width="24" height="25" params="16" style="0"
                       name="pedia_corner_r" visible="false">
          <variables>
            <var key="asset_uri" value="fishpedia_corner" type="String"/>
            <var key="flip_x" value="true" type="Boolean"/>
          </variables>
        </static_bitmap>

        <!-- drawCloseButton: buffer (465, 57). -->
{bitmap('pedia_close', 465, 57 - 50 + TOP, 12, 12, 'fishpedia_close_btn', params=17)}

      </children>
    </container>
  </window>
</layout>
'''

from lib import paths

out = paths.LAYOUTS / 'vortex_fishing_pedia_xml.xml'
out.write_text(HEAD + page('l') + '\n\n' + page('r') + TAIL, encoding='utf8')
print(f'written {len(out.read_text(encoding="utf8"))} chars')
