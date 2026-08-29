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

    /** glaze_cp_body: container, glaze_cp_frame: frame */
    glaze_colorpicker_xml:
        | 'glaze_cp_body'
        | 'glaze_cp_frame';

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

    /** glaze_row: region, glaze_row_arrow: static_bitmap, glaze_row_label: text, glaze_row_twisty: region, glaze_row_vis: checkbox */
    glaze_hierarchy_row_xml:
        | 'glaze_row'
        | 'glaze_row_arrow'
        | 'glaze_row_label'
        | 'glaze_row_twisty'
        | 'glaze_row_vis';

    /** glaze_hierarchy_controls: container, glaze_hierarchy_frame: container, glaze_hierarchy_header: container, glaze_hierarchy_list: scrollable_itemlist_vertical, glaze_hierarchy_title: text */
    glaze_hierarchy_xml:
        | 'glaze_hierarchy_controls'
        | 'glaze_hierarchy_frame'
        | 'glaze_hierarchy_header'
        | 'glaze_hierarchy_list'
        | 'glaze_hierarchy_title';

    /** glaze_lbl: text */
    glaze_label_xml:
        | 'glaze_lbl';

    /** glaze_wrow: region, glaze_wrow_label: text, glaze_wrow_preview: container, glaze_wrow_type: text */
    glaze_palette_row_xml:
        | 'glaze_wrow'
        | 'glaze_wrow_label'
        | 'glaze_wrow_preview'
        | 'glaze_wrow_type';

    /** glaze_palette_frame: frame, glaze_palette_list: scrollable_itemlist_vertical */
    glaze_palette_xml:
        | 'glaze_palette_frame'
        | 'glaze_palette_list';

    /** glaze_arow: container, glaze_arow_add: button, glaze_arow_key: input, glaze_arow_keybox: border, glaze_arow_value: input, glaze_arow_valuebox: border */
    glaze_prop_addvar_xml:
        | 'glaze_arow'
        | 'glaze_arow_add'
        | 'glaze_arow_key'
        | 'glaze_arow_keybox'
        | 'glaze_arow_value'
        | 'glaze_arow_valuebox';

    /** glaze_crow: container, glaze_crow_check: checkbox, glaze_crow_label: text, glaze_crow_type: text */
    glaze_prop_check_xml:
        | 'glaze_crow'
        | 'glaze_crow_check'
        | 'glaze_crow_label'
        | 'glaze_crow_type';

    /** glaze_korow: container, glaze_korow_input: input, glaze_korow_inputbox: border, glaze_korow_label: text, glaze_korow_swatch: region */
    glaze_prop_color_xml:
        | 'glaze_korow'
        | 'glaze_korow_input'
        | 'glaze_korow_inputbox'
        | 'glaze_korow_label'
        | 'glaze_korow_swatch';

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

    /** glaze_vrow: container, glaze_vrow_input: input, glaze_vrow_inputbox: border, glaze_vrow_label: text, glaze_vrow_remove: button, glaze_vrow_type: text */
    glaze_prop_var_xml:
        | 'glaze_vrow'
        | 'glaze_vrow_input'
        | 'glaze_vrow_inputbox'
        | 'glaze_vrow_label'
        | 'glaze_vrow_remove'
        | 'glaze_vrow_type';

    /** glaze_property_frame: container, glaze_property_header: container, glaze_property_list: scrollable_itemlist_vertical, glaze_property_title: text */
    glaze_property_xml:
        | 'glaze_property_frame'
        | 'glaze_property_header'
        | 'glaze_property_list'
        | 'glaze_property_title';

    /** glaze_sibox: border, glaze_siinput: input */
    glaze_smallinput_xml:
        | 'glaze_sibox'
        | 'glaze_siinput';

    /** glaze_splitter: container, glaze_splitter_label: static_bitmap, glaze_splitter_rule_bottom: region, glaze_splitter_rule_top: region */
    glaze_splitter_xml:
        | 'glaze_splitter'
        | 'glaze_splitter_label'
        | 'glaze_splitter_rule_bottom'
        | 'glaze_splitter_rule_top';

    /** glaze_swatch: region */
    glaze_swatch_xml:
        | 'glaze_swatch';

    /** glaze_switch: checkbox */
    glaze_switch_xml:
        | 'glaze_switch';

    /** glaze_toolbar_bar: container */
    glaze_toolbar_xml:
        | 'glaze_toolbar_bar';
}

/** Every registered editor layout, keyed as `buildWidgetLayout()` expects. */
export type GlazeLayoutName = keyof GlazeLayoutSlots;

/** The slots a given editor layout declares. */
export type GlazeSlot<TLayout extends GlazeLayoutName> = GlazeLayoutSlots[TLayout];
