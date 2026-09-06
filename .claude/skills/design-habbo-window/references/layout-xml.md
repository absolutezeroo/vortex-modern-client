# The window-layout XML, as the 788 shipped files actually write it

Every number in this file is counted from `packages/vortex-client/src/assets/window-layouts/*.xml`
(788 files) or read out of the engine's parser. Nothing here is remembered.

Re-measure any table with the one-liners in [Re-measuring](#re-measuring) — the corpus is the
authority, this file is only its summary.

## 1. The skeleton

```xml
<?xml version="1.0" encoding="UTF-8"?>
<layout name="my_window" width="310" height="163" version="0.1" uid="...">
  <window>
    <frame x="0" y="0" width="310" height="163" params="163841" style="3" caption="Title">
      <filters>
        <DropShadowFilter distance="4" alpha="0.349" blurX="4" blurY="4"/>
      </filters>
      <children>
        <!-- one element per widget -->
      </children>
      <variables>
        <var key="margin_top" value="30" type="int"/>
      </variables>
    </frame>
  </window>
</layout>
```

Four structural facts, each of which silently produces nothing when broken:

- **`<layout>` holds exactly one `<window>`, which holds exactly one root element.** 787 `<window>`
  for 787 `<layout>`. `parseWindowLayoutXml` returns `[]` for any other root, and returning `[]` is
  not an error — the layout simply does not exist.
- **Children go in a `<children>` wrapper**, never as direct descendants. 4,292 uses.
- **Properties are `<var>` elements inside `<variables>`**, never attributes. 25,967 `<var>` against
  25,774 `type=`. A `text_style="il_regular"` written as an attribute is read by nothing.
- **`<variables>` on a node configures *that* node**, and sits as a sibling of its `<children>`.
  On the frame above it sets the frame's own margins.

`width`/`height` on `<layout>` are the authored size of the root and are what Glaze's canvas shows.
`uid` is a Flash-authoring GUID; nothing reads it and a new layout may omit it.

## 2. Attributes

Counted across the corpus. The right-hand column is the parser function in
`packages/vortex-engine/src/core/window/utils/WindowParser.ts`.

| Attribute | Uses | Read as |
|---|---:|---|
| `type` | 25,774 | on `<var>` only — see §3 |
| `width` / `height` | 12,465 each | `parseInteger` |
| `x` / `y` | 11,678 each | `parseInteger`, relative to the parent |
| `style` | 11,575 | `parseInteger` — see §5 |
| `params` | 11,546 | `parseInteger` — see §4 |
| `name` | 10,808 | URI-decoded; the handle `getChildByName` uses |
| `caption` | 3,925 | URI-decoded; visible text |
| `color` | 2,385 | `parseColor` — see §6 |
| `tags` | 1,291 | URI-decoded, comma-separated |
| `treshold` | 1,009 | `parseInteger` — **spelled without the `h`**, in the format and in the parser |
| `width_max` / `width_min` | 967 / 948 | `parseInteger` |
| `height_min` / `height_max` | 523 / 416 | `parseInteger` |
| `background` | 850 | `Boolean` — suppresses colorize, see §6 |
| `visible` | 754 | `Boolean` |
| `blend` / `alpha` | 232 / 229 | `parseNumber` |
| `clipping` | 162 | `Boolean` |
| `dynamic_style` | 120 | style name resolved through `DynamicStyleManager` |
| `id` | 93 | `parseInteger` |

`name`, `tags`, `caption` and every `String` var go through `decodeEscaped`, which calls
`decodeURIComponent` **repeatedly until the value stops changing**. The dump writes
`caption="%24%7Balert.close.button%7D"`; you may write `caption="${alert.close.button}"` directly and
get the same result. Prefer the readable form in new layouts.

## 3. `<var>` types

`castValue` in the parser. Getting the type wrong is the single most common silent failure.

| `type=` | Uses | Cast |
|---|---:|---|
| `Boolean` | 8,506 | `String(v).toLowerCase() === 'true'` |
| `String` | 6,856 | URI-decoded |
| `Number` | 6,393 | `Number(v)` — accepts decimals (`-0.6` is used) |
| `int` | 1,614 | `Number(v)` — same path as `Number` |
| `hex` | 1,280 | `parseInt(v.replace(/^0x/, ''), 16)` |
| `uint` | 1,013 | `parseInt(v, 10)` — **base 10** |

> **`type="uint"` on a `0x…` value yields 0.** It runs `parseInt(v, 10)`, so `0xffffff` parses as
> `0` and the text turns black. Colour vars take `type="hex"` — 1,280 uses say so. This has shipped
> as a bug before.

## 4. `params` — the bit field

`packages/vortex-engine/src/core/window/enum/WindowParam.ts`. Values are OR'd. The corpus uses ~120
distinct composites; these are the ones worth knowing.

| Bit | Name | Meaning |
|---|---|---|
| `0x1` | `INPUT_EVENT_PROCESSOR` | the window sees the mouse |
| `0x10` | `USE_PARENT_GRAPHIC_CONTEXT` | draws into the parent's context — **inherits its clip** |
| `0x20` | `BOUND_TO_PARENT_RECT` | |
| `0x40` / `0x400` | `RELATIVE_*_SCALE_MOVE` | follows the parent's right/bottom edge |
| `0x80` / `0x800` | `RELATIVE_*_SCALE_STRETCH` | stretches with the parent |
| `0xC0` / `0xC00` | `RELATIVE_*_SCALE_CENTER` | stays centred in the parent |
| `0x2000` | `VERTICAL_MOUSE_SCALING_TRIGGER` | |
| `0x8000` | `MOUSE_DRAGGING_TARGET` | what a drag actually moves |
| `0x20000` | `EXPAND_TO_ACCOMMODATE_CHILDREN` | |
| `0x24000` | `RESIZE_TO_ACCOMMODATE_CHILDREN` | |
| `0x40000000` | `FORCE_CLIPPING` | |
| `0x80000000` | `INHERIT_CAPTION` | |

The values actually written, most-used first:

| `params=` | Uses | = |
|---|---:|---|
| `16` | 5,275 | `USE_PARENT_GRAPHIC_CONTEXT` — the default for a pure visual |
| `17` | 977 | `+ INPUT_EVENT_PROCESSOR` — the default for a clickable row |
| `144` | 625 | `16 + 0x80` — visual that stretches horizontally |
| `131089` | 411 | `17 + 0x20000` — clickable that expands to its children |
| `1` | 332 | a control that must see the mouse and owns its context |
| `2192` | 259 | |
| `147472` | 248 | `16 + 0x20000 + 0x4000` — list section that grows with its items |
| `0` | 226 | lists that arrange their own children |
| `2064` | 173 | the `tab_context` value |

> **A list row without `0x10` escapes its list's clip.** `WindowComposite.compositeWindow` resets the
> inherited clip to null for any *own-context* window lacking `FORCE_CLIPPING`, so the row draws to
> its own bounds and spills out of the scroll viewport. Use `17` for a clickable row, `16` for a
> label or container inside a list.

## 5. `style` — which skin

`style` picks the skin the widget draws with. `packages/vortex-engine/src/habbo/window/enum/WindowStyle.ts`
names only three; the rest are theme ranges.

| Range | Theme |
|---|---|
| `0` | `DEFAULT` — the flat/unskinned look |
| `1` | `BLACK` |
| `3` | `SHINY` — **the classic Habbo look**: the blue gradient frame, the shiny button |
| `100`–`105` | Illumina light (`100` panel, `101` checkbox/button, `102` frame/border, `105` input border) |
| `200`+ | Illumina dark and the other registered themes |

Measured per element (top values):

| Element | Most used styles |
|---|---|
| `frame` | `3` (132), `100` (48), `0` (27), `101` (10) |
| `container` | `0` (924), `3` (827), `100` (219) |
| `text` | `0` (999), `3` (918), `100` (343) |
| `button` | `3` (199), `0` (65), `101` (48), `1` (41) |
| `border` | `3` (203), `2` (172), `0` (128), `102` (66), `105` (49) |
| `label` | `100` (119), `3` (90), `0` (33) |
| `bitmap` | `0` (509), `3` (88) |

**Do not mix ranges inside one window.** A `style="3"` frame with `style="100"` children is the
simple-alert layout deliberately doing that (an Illumina body in a Habbo frame); anything else reads
as a mistake. Pick `3` for a classic Habbo window or `10x` for an Illumina one and stay there.

`ThemeManager.getStyle` is the runtime remap, and Glaze's *Set Theme* button drives it — build in one
theme, retheme afterwards rather than hand-editing 40 style numbers.

## 6. Colour

Two different families. Confusing them is a documented shipped bug.

**`color=` on a window is an RGB *multiply tint* over the skin art.** `BitmapSkinRenderer` reads
`window.color`, takes `color & 0xFFFFFF`, and only colorizes when that is `< 0xFFFFFF` and the window
is not `background="true"`:

```ts
const doColorize = !window.background && ((color & 0xFFFFFF) < 0xFFFFFF);
```

So white is "leave the art alone", and any other value darkens the art towards itself. It is not a
fill: a flat colour over a gradient skin loses the gradient. For a `background="true"` window it *is*
a `fillRect` and the alpha byte matters.

The dump writes it as `0x` + alpha + RRGGBB, which produces the odd-looking 7-digit values:
`color="0x0418db0"` is alpha `0`, RGB `0x418DB0` — the Habbo frame blue. `parseColor` uses
`parseInt(v, 16)`, so the leading zero is insignificant and `color="0x418db0"` is identical. Write the
6-digit form in new layouts.

**`text_color` is a `<var>`, is plain RGB, and takes `type="hex"`.**

```xml
<var key="text_color" value="0xffffff" type="hex"/>
```

Measured: `0xffffff` (645), `0x666666` (54), `0x333333` (34), `0x222222` (30), `0x1077ac` (30, the
link blue), `0xff8133` (24, the Habbo orange), `0xc30000` (the alert red).

## 7. Text

`text`, `label`, `formatted_text`, `html` and `link` are styled entirely through `<var>`s.

```xml
<label x="0" y="0" width="54" height="19" params="16" style="100" name="subtitle" caption="Subtitle">
  <variables>
    <var key="text_style" value="il_heading_1" type="String"/>
    <var key="text_color" value="0xc30000" type="hex"/>
  </variables>
</label>
```

`text_style` names a style in the theme's stylesheet; an unknown name **falls back to the theme
default without logging**. The names that exist, measured:

| Family | Names |
|---|---|
| Volter / classic (`u_`) | `u_bold` (364), `u_regular` (335), `u_small` (131), `u_italic` (37), `u_headline_medium` (32), `u_headline_small` (29), `u_headline_big` (22), `u_button_tab`, `u_frame_title`, `u_tool_tip` |
| Buttons | `button_shiny_regular` (74), `button_regular` (37), `button_shiny_bold` (20), `button_bold`, `button_tab` |
| Illumina light (`il_`) | `il_regular_white` (63), `il_heading_3` (53), `il_heading_1` (53), `il_heading_2` (40), `il_button` (29), `il_border` (29), `il_regular` (26), `il_small` (11), `il_heading_title` (10), `il_link_regular` (9), `il_frame_modal_title` (8), `il_button_white`, `il_small_white`, `il_frame_title`, `il_link_strong` |
| Illumina dark (`id_`) | `id_heading_2`, `id_regular`, `id_link_regular`, `id_link_strong`, `id_frame_title`, `id_button` |
| Unprefixed | `regular` (46), `bold` (30), `headline_medium`, `frame_title`, `ubuntu_condensed_title`, `ubuntu_condensed_regular` |

`id_key` and `id_value` are **not** styles — they are window *names* in `transaction_overview_xml.xml`.

Other text vars, with their measured counts: `leading` (2,496), `auto_size` (1,864 — `left`,
`center`, `right`), `font_size` (937), `word_wrap` (813), `thickness` (629), `sharpness` (616),
`multiline` (594), `kerning` (483), `font_face` (432), `bold` (412), `antialias_type` (365),
`underline` (193), `etching_color` (137), `etching_position` (60).

`font_size` values in use: `11` (259), `12` (143), `14` (131), `13` (104), `9` (89), `10` (56),
`18` (43), `16` (29), `20` (27), `24` (21). **11 and 12 are the body sizes.**

`etching_color` + `etching_position` produce the pressed-into-the-panel look that is the most
recognisable thing about Habbo text.

## 8. Two placement idioms, and when each is used

Both are everywhere — 11,678 `x`/`y` attributes *and* 2,990 `spacing` vars — so "Habbo always uses
lists" is wrong. The rule the corpus actually follows is about what the content does:

| Content | Idiom | Example |
|---|---|---|
| Fixed chrome: a known set of controls at known places | absolute `x`/`y` on each child | `dimmer_ui.xml` — 3 tabs, a slider, a checkbox, 2 buttons, every one placed by hand |
| Content that varies in size or count: messages, rows, sections that may be hidden | nested `itemlist_*` with `spacing` | `HabboWindowManager_simple_alert_xml.xml` — the message wraps to any height and the list reflows below it |

Picking absolute for varying content is what makes an authored window look un-Habbo: the gaps stop
being consistent as soon as one label is longer than you assumed.

In the list idiom, children are placed *by the list*; their `x`/`y` are outputs, not inputs.

```xml
<itemlist_vertical x="10" y="8" width="290" height="118" params="8536080" style="100" name="list">
  <children>
    <itemlist_vertical ... name="list_top"> ... </itemlist_vertical>
    <itemlist_vertical ... name="list_bottom"> ... </itemlist_vertical>
  </children>
  <variables>
    <var key="spacing" value="3" type="int"/>
  </variables>
</itemlist_vertical>
```

`spacing` is written 2,990 times. Its values: `0` (2,476), then `5` (80), `10` (80), `2` (76),
`1` (73), `3` (46), `4` (45), `6` (24), `8` (18). **The gutter vocabulary is 1–10 px, and 5 and 10
are the two common ones.**

Related list vars: `mouse_wheel_enabled` (2,596 — set `false` on anything not meant to scroll),
`resize_on_item_update` (289), `fit_size_to_contents` (281), `scale_to_fit_items` (214),
`scrollable` (39), `scroll_step_v` / `scroll_step_h` (20 each).

Use `scrollable_itemlist_vertical` (type 56, same `addListItem` API) for a list that can overflow;
a plain `itemlist_vertical` does not scroll.

### `bitmap` and `static_bitmap` are not interchangeable

Which one a slot must be is decided by **who supplies the pixels**, and picking the other fails
silently in whichever direction you picked wrong:

| Element | Controller | Pixels come from | Has a `bitmap` setter |
|---|---|---|---|
| `<static_bitmap>` | `StaticBitmapWrapperController` | its own `asset_uri` var, fetched **asynchronously** | **no** — writing `.bitmap` is a no-op |
| `<bitmap>` | `BitmapWrapperController` | whatever a view assigns to `.bitmap` | yes |

Two consequences, both of which have shipped:

- **A view cannot write into a `static_bitmap`.** `.bitmap` is not a property there, so the
  assignment lands on a stray JS field and only the `asset_uri` ever renders.
- **`clone()` copies `_assetUri`, and the fetch answers later.** Giving a view-driven slot a
  placeholder `asset_uri` — tempting, because it makes the layout readable in Glaze — means every
  cloned row re-fetches the placeholder and the callback overwrites anything the view drew. That is
  how four different fish all rendered as the same one.

So: a slot the view fills is `<bitmap>` with **no** `asset_uri`, and it is empty in the design
render. That emptiness is correct, not a bug to paper over. `<static_bitmap>` is for art the layout
itself names and never changes.

### A grid is not a list, and the type tells you nothing

`scrollable_itemgrid_vertical` (type 140) builds `ScrollableItemGridWindow`, which exposes
`addGridItem` / `getGridItemByName` / `removeGridItem` / `destroyGridItems` and **none** of the
`*ListItem*` family — faithfully, because `ScrollableItemGridWindow.as` is the same. The two families
never mix:

| Element | Window class | API |
|---|---|---|
| `itemlist_*`, `scrollable_itemlist_*` | `ItemListController` / `ScrollableItemListWindow` | `addListItem`, `getListItemByName`, `removeListItem`, `destroyListItems` |
| `itemgrid_*`, `scrollable_itemgrid_*` | `ItemGridController` / `ScrollableItemGridWindow` | `addGridItem`, `getGridItemByName`, `removeGridItem`, `destroyGridItems` |

`findChildByName` returns `IWindow`, so casting either to the wrong interface **compiles**, and the
first `getListItemByName is not a function` arrives when a user opens the window. A cross-check that
only asks "does every name I look up exist in the layout" passes this cleanly — it did — because the
name is right and the type is not.

Probe the built window instead. With Glaze running, `render.mjs` has already put the layout on the
page, so ask it what each container actually is:

```js
const w = window.glaze.state.rootWindow.findChildByName('fish_grid');
({ctor: w.constructor.name, addListItem: typeof w.addListItem, addGridItem: typeof w.addGridItem})
```

Better still, reproduce the real sequence — take the template out, clone it, add the clone, count,
clear. That is four lines and it is the difference between "the names resolve" and "the code runs".

## 9. Margins

A frame's content inset is set on the frame itself:

```xml
<variables>
  <var key="margin_left" value="1" type="int"/>
  <var key="margin_top" value="30" type="int"/>
  <var key="margin_right" value="1" type="int"/>
  <var key="margin_bottom" value="1" type="int"/>
</variables>
```

`margin_top` is where the title bar ends. Its measured values: `25` (42), `33` (33), `36` (20),
`30` (15), `35` (12) — **the title bar is 25–36 px, and 30 is the standard**. The other three
margins are 0–10, most often `1`.

## 10. Five silent authoring failures

None of these throw. The layout simply draws nothing, or draws wrong.

1. **`buildFromXML` returns the root UNATTACHED** (AS3 passes `null` as parent). A `<frame>` hides
   this because `FrameController.finalize()` calls `activate()`, which self-attaches; a
   `<container>` root draws nothing. Fix: `desktop.addChild(root)`.
2. **A `<frame>` is composed from a *shipped* layout.** `type="frame" style="N"` maps to
   `window_layout="habbo_window_layout_frame_*"`, which supplies the `tags="_CONTENT"` container
   `FrameController.margins` reads. Skipping registration of the shipped `window-layouts/` throws on
   construction. Same for `dropmenu`, `droplist`, `bubble`.
3. **`text_color` must be `type="hex"`** — see §3.
4. **An unknown `text_style` falls back to the theme default silently** — see §7.
5. **A `<button>` auto-sizes to its caption and the skin has its own padding.** `width`/`height` on
   the tag are ignored; pin with `width_min`/`width_max` + `height_min`/`height_max` (54 shipped
   layouts do). `illumina_light_skin_button`'s art starts at x=11,y=11 of a 50×50 region, so the
   painted body is inset ~11 px per side — a 32 px window paints a ~10 px pill. **Add ~22 px to the
   height you want.**

## Re-measuring

From `packages/vortex-client/src/assets/window-layouts/`:

```bash
# every element tag, by frequency
grep -hoE '<[a-z_]+[ />]' *.xml | tr -d '<>/ ' | sort | uniq -c | sort -rn

# every <var> key
grep -hoE '<var key="[^"]+"' *.xml | sed 's/<var key=//' | sort | uniq -c | sort -rn

# the values one key takes
grep -hoE '<var key="spacing" value="[^"]*"' *.xml | grep -oE 'value="[^"]*"' | sort | uniq -c | sort -rn

# which styles an element uses
grep -hoE '<button [^>]*style="[0-9]+"' *.xml | grep -oE 'style="[0-9]+"' | sort | uniq -c | sort -rn

# who else builds this thing
grep -l 'scrollable_itemlist_vertical' *.xml
```
