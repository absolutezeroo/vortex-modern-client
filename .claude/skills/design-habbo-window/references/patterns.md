# Skeletons, cut from shipped layouts

Every block below is copied from a file in
`packages/vortex-client/src/assets/window-layouts/`, trimmed only where marked `<!-- … -->`. Start
from the closest one and change it. Do not assemble a window out of remembered parts.

Read `layout-xml.md` for what the attributes mean.

---

## 1. The classic Habbo window — `chooser_view.xml` (whole file)

The smallest complete window in the corpus, and the right starting point for anything that is "a
Habbo window with a list in it".

```xml
<?xml version="1.0" encoding="UTF-8"?>
<layout name="chooser_view" width="203" height="168" version="0.1">
  <window>
    <frame x="0" y="0" width="203" height="168" params="98305" style="3"
           caption="${widget.chooser.title}" color="0x418db0" width_min="150" height_min="90">
      <filters>
        <DropShadowFilter distance="4" alpha="0.349" blurX="4" blurY="4"/>
      </filters>
      <children>
        <container x="9" y="13" width="173" height="120" params="2192" style="0">
          <children>
            <scrollable_itemlist_vertical x="0" y="0" width="172" height="120" params="2192"
                                          style="0" name="item_list"/>
          </children>
        </container>
      </children>
      <variables>
        <var key="margin_left" value="6" type="int"/>
        <var key="margin_top" value="25" type="int"/>
        <var key="margin_right" value="6" type="int"/>
        <var key="margin_bottom" value="7" type="int"/>
      </variables>
    </frame>
  </window>
</layout>
```

What each unobvious number is:

| | |
|---|---|
| `style="3"` | `SHINY` — the classic Habbo skin |
| `color="0x418db0"` | the Habbo frame blue, multiplied over the skin art (§6 of `layout-xml.md`) |
| `params="98305"` | `0x18001` = `MOUSE_SCALING_TARGET` + `MOUSE_DRAGGING_TARGET` + `INPUT_EVENT_PROCESSOR` — **draggable and resizable** |
| `params="2192"` | `0x890` = both `RELATIVE_SCALE_STRETCH` bits + `USE_PARENT_GRAPHIC_CONTEXT` — the list grows with the frame |
| `width_min` / `height_min` | how far the user may shrink it |
| margins `6/25/6/7` | 25 px of title bar, 6 px sides |

The `DropShadowFilter` is on **every draggable frame** in the corpus and on no panel. Its values are
always `distance="4" alpha="0.349" blurX="4" blurY="4"`.

---

## 2. Message / alert dialog — `HabboWindowManager_simple_alert_xml.xml` (whole file)

The reference for content whose height is not known in advance. Note that nothing inside is placed by
hand: two nested `itemlist_vertical` with `spacing` do the whole layout.

```xml
<layout name="simple_alert" width="310" height="163" version="0.1">
  <window>
    <frame x="0" y="0" width="310" height="163" params="163841" style="3"
           caption="caption" color="0x418db0">
      <filters>
        <DropShadowFilter distance="4" alpha="0.349" blurX="4" blurY="4"/>
      </filters>
      <children>
        <static_bitmap x="10" y="8" width="1" height="1" params="16" style="100" name="illustration">
          <variables>
            <var key="stretched_x" value="false" type="Boolean"/>
            <var key="stretched_y" value="false" type="Boolean"/>
            <var key="fit_size_to_contents" value="true" type="Boolean"/>
          </variables>
        </static_bitmap>

        <itemlist_vertical x="10" y="8" width="290" height="118" params="8536080" style="100"
                           name="list" clipping="false">
          <children>
            <itemlist_vertical x="0" y="0" width="290" height="43" params="147472" style="100"
                               name="list_top">
              <children>
                <label x="0" y="0" width="54" height="19" params="16" style="100"
                       name="subtitle" caption="subtitle">
                  <variables>
                    <var key="text_style" value="il_heading_1" type="String"/>
                    <var key="text_color" value="0xc30000" type="hex"/>
                  </variables>
                </label>
                <formatted_text x="0" y="19" width="291" height="24" params="16" style="100"
                                name="message" caption="message" width_min="291" width_max="291">
                  <variables>
                    <var key="auto_size" value="left" type="String"/>
                    <var key="margin_bottom" value="8" type="int"/>
                    <var key="mouse_wheel_enabled" value="false" type="Boolean"/>
                    <var key="multiline" value="true" type="Boolean"/>
                    <var key="word_wrap" value="true" type="Boolean"/>
                    <var key="spacing" value="0" type="Number"/>
                    <var key="leading" value="0" type="Number"/>
                  </variables>
                </formatted_text>
              </children>
            </itemlist_vertical>

            <itemlist_vertical x="0" y="46" width="290" height="72" params="147472" style="100"
                               name="list_bottom">
              <children>
                <static_bitmap x="0" y="0" width="1000" height="13" params="16" style="100">
                  <variables>
                    <var key="asset_uri" value="illumina_horizontal_separator" type="String"/>
                    <var key="pivot_point" value="bottom center" type="String"/>
                    <var key="stretched_y" value="false" type="Boolean"/>
                  </variables>
                </static_bitmap>
                <button_thick x="82" y="18" width="126" height="28" params="131281" style="3"
                              name="close_button" caption="${alert.close.button}" color="0xefefef"/>
              </children>
              <variables>
                <var key="spacing" value="5" type="int"/>
              </variables>
            </itemlist_vertical>
          </children>
          <variables>
            <var key="spacing" value="3" type="int"/>
          </variables>
        </itemlist_vertical>
      </children>
      <variables>
        <var key="margin_left" value="1" type="int"/>
        <var key="margin_top" value="30" type="int"/>
        <var key="margin_right" value="1" type="int"/>
        <var key="margin_bottom" value="1" type="int"/>
      </variables>
    </frame>
  </window>
</layout>
```

- `params="163841"` = `0x28001` = `EXPAND_TO_ACCOMMODATE_CHILDREN` + `MOUSE_DRAGGING_TARGET` +
  `INPUT_EVENT_PROCESSOR` — draggable, and **grows to fit whatever the list ends up being**.
  This is the pairing that makes a variable-height dialog work: expanding frame + list content.
- `params="147472"` on each section = `0x24010` = `RESIZE_TO_ACCOMMODATE_CHILDREN` +
  `USE_PARENT_GRAPHIC_CONTEXT`.
- The separator is a `static_bitmap` of `illumina_horizontal_separator` with
  `pivot_point="bottom center"` and a deliberately over-wide `width="1000"`.
- A `formatted_text` that must wrap pins `width_min` = `width_max` and sets
  `multiline` + `word_wrap` + `auto_size`.
- This file mixes `style="3"` (frame) with `style="100"` (Illumina body) on purpose. It is the one
  sanctioned mix; do not invent others.

---

## 3. Tabbed window — `dimmer_ui.xml` (trimmed)

Tabs are three sibling elements, not a component: a `tab_context` holding `tab_button`s, and a
**separate** `container` holding the content. They are not nested.

```xml
<frame x="0" y="0" width="277" height="225" params="163841" style="0"
       name="dimmer_ui" caption="${widget.dimmer.title}" height_min="0">
  <children>
    <container x="2" y="-1" width="266" height="166" params="17" style="0" name="tabbedview">
      <children>
        <tab_context x="2" y="1" width="258" height="163" params="17" style="0" name="tab_context">
          <children>
            <tab_button x="0"   y="0" width="60" height="21" params="131089" style="0"
                        name="tab_1" caption="${widget.dimmer.tab.1}" width_max="100"/>
            <tab_button x="60"  y="0" width="63" height="21" params="131089" style="0"
                        name="tab_2" caption="${widget.dimmer.tab.2}" id="1" width_max="100"/>
            <tab_button x="123" y="0" width="63" height="21" params="131089" style="0"
                        name="tab_3" caption="${widget.dimmer.tab.3}" id="2" width_max="100"/>
          </children>
        </tab_context>

        <container x="17" y="34" width="228" height="118" params="16" style="0" name="tab_content">
          <children>
            <!-- the selected tab's content -->
          </children>
        </container>
      </children>
    </container>

    <button x="4"   y="166" width="89" height="24" params="131089" style="0" name="apply_button"
            caption="${widget.dimmer.button.apply}"/>
    <button x="203" y="167" width="58" height="22" params="393233" style="0" name="on_off_button"
            caption="${widget.dimmer.button.on}"/>
  </children>
</frame>
```

- **Tab buttons carry `id`**, numbered from 0 (the first omits it, so `id` defaults to 0). That id is
  how the controller knows which tab was clicked.
- Tab buttons are placed by hand, abutting: `x` = 0, 60, 123 against widths 60, 63, 63.
- `width_max="100"` caps a long caption.
- Tab height is 21 px.

---

## 4. Info bubble — `avatar_info_widget.xml` (whole file)

The floating, non-draggable popup. Root is `<bubble>`, not `<frame>`: no title bar, no shadow filter,
no margins.

```xml
<layout name="avatarinfo" width="129" height="39" version="0.1">
  <window>
    <bubble x="0" y="0" width="129" height="39" params="1" style="5" name="border" color="0x3d3d3d">
      <children>
        <static_bitmap x="2" y="4" width="16" height="14" params="16" style="100"
                       name="relationship_status">
          <variables>
            <var key="stretched_x" value="false" type="Boolean"/>
            <var key="stretched_y" value="false" type="Boolean"/>
          </variables>
        </static_bitmap>
        <text x="16" y="3" width="81" height="16" params="4194320" style="0" name="name"
              caption="my_name_here">
          <variables>
            <var key="auto_size" value="left" type="String"/>
            <var key="font_size" value="11" type="uint"/>
            <var key="text_color" value="0xffffff" type="hex"/>
            <var key="text_style" value="u_regular" type="String"/>
            <var key="mouse_wheel_enabled" value="false" type="Boolean"/>
            <var key="spacing" value="0" type="Number"/>
            <var key="leading" value="0" type="Number"/>
          </variables>
        </text>
        <container x="0" y="19" width="123" height="18" params="209" style="0"
                   name="change_name_container" treshold="0">
          <children>
            <text x="20" y="0" width="106" height="18" params="16" style="0"
                  caption="${widget.avatar.change_name}">
              <variables>
                <var key="font_size" value="10" type="uint"/>
                <var key="text_color" value="0xfac200" type="hex"/>
                <var key="text_style" value="u_italic" type="String"/>
                <var key="underline" value="true" type="Boolean"/>
                <var key="mouse_wheel_enabled" value="false" type="Boolean"/>
              </variables>
            </text>
            <bitmap x="7" y="1" width="12" height="12" params="16" style="0" name="pen_icon"/>
          </children>
        </container>
      </children>
    </bubble>
  </window>
</layout>
```

- Dark bubble: `color="0x3d3d3d"` with white `u_regular` at 11 px.
- The "action" line is `u_italic`, `underline`, and Habbo yellow `0xfac200` at 10 px.
- `params="4194320"` = `0x400010` = `REFLECT_HORIZONTAL_RESIZE_TO_PARENT` +
  `USE_PARENT_GRAPHIC_CONTEXT` — the label's width drives the bubble's.
- `bubble_pointer_up|down|left|right` exist as separate elements if the bubble needs a tail.

---

## 5. A labelled control row — from `dimmer_ui.xml`

The checkbox/radio + label pair. The control and its text are **siblings**, not nested, and the text
is offset by the control's width plus ~4 px.

```xml
<checkbox x="3"  y="60" width="18"  height="18" params="17" style="0" name="type_checkbox"/>
<text     x="22" y="61" width="200" height="14" params="16" style="0" name="type_text"
          caption="${widget.dimmer.type.checkbox}">
  <variables>
    <var key="font_face" value="Volter" type="String"/>
    <var key="font_size" value="9" type="uint"/>
    <var key="text_color" value="0x0" type="hex"/>
    <var key="embed_fonts" value="true" type="Boolean"/>
  </variables>
</text>
```

The classic (non-Illumina) body text is exactly this: **Volter, 9 px, `embed_fonts="true"`, black**.
A helper line under it is the same with `text_color="0x999999"` and `word_wrap="true"`.

---

## 6. Buttons

| Want | Element | Shipped example |
|---|---|---|
| Standard action button | `<button>` | `width="89" height="24" params="131089" style="0"` |
| The prominent one | `<button_thick>` | `width="126" height="28" params="131281" style="3" color="0xefefef"` |
| Icon-only | `<iconbutton>` | 26×26 |
| Left/middle/right of a joined group | `button_group_left` / `_center` / `_right` | |

`params="131089"` = `0x20011` = `EXPAND_TO_ACCOMMODATE_CHILDREN` + `USE_PARENT_GRAPHIC_CONTEXT` +
`INPUT_EVENT_PROCESSOR`.

> A button auto-sizes to its caption and the skin adds its own padding: `width`/`height` on the tag
> are ignored. Pin with `width_min`/`width_max` + `height_min`/`height_max`, and add ~22 px to the
> height you actually want.

---

## Finding a better starting point than any of these

```bash
cd packages/vortex-client/src/assets/window-layouts

# which layouts build the thing you need?
grep -l 'scrollable_itemgrid_vertical' *.xml
grep -l 'tab_container_button' *.xml

# smallest first — the smallest is the clearest
for f in $(grep -l '<bubble' *.xml); do echo "$(wc -l < $f) $f"; done | sort -n

# what does the real window you are copying call its parts?
grep -o 'name="[^"]*"' catalog_volter.xml
```
