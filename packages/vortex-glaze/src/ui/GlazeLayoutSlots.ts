/* eslint-disable */
/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source: src/assets/window-layouts/*.xml
 * Regenerate: pnpm --filter vortex-glaze gen:slots
 *
 * One string-literal union per editor layout, listing the elements that layout
 * declares a `name` for. Use with `findSlot()` / `findSlotAs()` from
 * `./LayoutSlots` so slot lookups are checked at compile time instead of
 * silently returning null.
 */

export interface GlazeLayoutSlots
{
    /** glaze_bottombar: container */
    glaze_bottombar_xml:
        | 'glaze_bottombar';

    /** glaze_btn: button */
    glaze_button_xml:
        | 'glaze_btn';

    /** glaze_chk: checkbox */
    glaze_check_xml:
        | 'glaze_chk';

    /** glaze_dd: dropmenu */
    glaze_dropdown_xml:
        | 'glaze_dd';

    /** glaze_grow: region, glaze_grow_img: static_bitmap, glaze_grow_label: text */
    glaze_gallery_row_xml:
        | 'glaze_grow'
        | 'glaze_grow_img'
        | 'glaze_grow_label';

    /** glaze_gallery_frame: frame, glaze_gallery_list: scrollable_itemlist_vertical */
    glaze_gallery_xml:
        | 'glaze_gallery_frame'
        | 'glaze_gallery_list';

    /** glaze_row: region, glaze_row_arrow: text, glaze_row_label: text, glaze_row_twisty: region, glaze_row_vis: checkbox */
    glaze_hierarchy_row_xml:
        | 'glaze_row'
        | 'glaze_row_arrow'
        | 'glaze_row_label'
        | 'glaze_row_twisty'
        | 'glaze_row_vis';

    /** glaze_hierarchy_controls: container, glaze_hierarchy_frame: frame, glaze_hierarchy_list: itemlist_vertical */
    glaze_hierarchy_xml:
        | 'glaze_hierarchy_controls'
        | 'glaze_hierarchy_frame'
        | 'glaze_hierarchy_list';

    /** glaze_lbl: text */
    glaze_label_xml:
        | 'glaze_lbl';

    /** glaze_crow: container, glaze_crow_check: checkbox, glaze_crow_label: text, glaze_crow_type: text */
    glaze_prop_check_xml:
        | 'glaze_crow'
        | 'glaze_crow_check'
        | 'glaze_crow_label'
        | 'glaze_crow_type';

    /** glaze_drow: container, glaze_drow_drop: dropmenu, glaze_drow_label: text */
    glaze_prop_drop_xml:
        | 'glaze_drow'
        | 'glaze_drow_drop'
        | 'glaze_drow_label';

    /** glaze_group: container, glaze_group_label: text */
    glaze_prop_group_xml:
        | 'glaze_group'
        | 'glaze_group_label';

    /** glaze_prow: container, glaze_prow_input: input, glaze_prow_inputbox: border, glaze_prow_label: text, glaze_prow_type: text */
    glaze_prop_input_xml:
        | 'glaze_prow'
        | 'glaze_prow_input'
        | 'glaze_prow_inputbox'
        | 'glaze_prow_label'
        | 'glaze_prow_type';

    /** glaze_property_frame: frame, glaze_property_list: itemlist_vertical */
    glaze_property_xml:
        | 'glaze_property_frame'
        | 'glaze_property_list';

    /** glaze_sibox: border, glaze_siinput: input */
    glaze_smallinput_xml:
        | 'glaze_sibox'
        | 'glaze_siinput';

    /** glaze_swatch: region */
    glaze_swatch_xml:
        | 'glaze_swatch';

    /** glaze_toolbar_bar: container, glaze_toolbar_title: text */
    glaze_toolbar_xml:
        | 'glaze_toolbar_bar'
        | 'glaze_toolbar_title';
}

/** Every registered editor layout, keyed as `buildWidgetLayout()` expects. */
export type GlazeLayoutName = keyof GlazeLayoutSlots;

/** The slots a given editor layout declares. */
export type GlazeSlot<TLayout extends GlazeLayoutName> = GlazeLayoutSlots[TLayout];
