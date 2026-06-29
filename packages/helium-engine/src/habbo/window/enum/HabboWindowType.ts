/**
 * Habbo window element type identifiers.
 *
 * Defines the high-level element types used by the Habbo window system.
 * These map to specific UI widget implementations.
 *
 * @see sources/win63_version/habbo/window/enum/HabboWindowType.as
 */
export const HabboWindowType =
	{
		NULL: 0,
		BACKGROUND: 2,
		CONTAINER: 4,
		HEADER: 6,
		REGION: 10,
		LABEL: 12,
		DISPLAY_OBJECT_WRAPPER: 20,
		BITMAP_WRAPPER: 21,
		STATIC_BITMAP_WRAPPER: 23,
		BORDER: 30,
		FRAME: 35,
		DEFAULT_FRAME: 35,
		SIMPLE_FRAME: 35,
		CONTAINER_BUTTON: 41,
		TAB_CONTAINER: 42,
		SELECTOR_LIST: 43,
		BUBBLE: 45,
		VERTICAL_ITEM_LIST: 50,
		VERTICAL_ITEMLIST: 50,
		HORIZONTAL_ITEM_LIST: 51,
		HORIZONTAL_ITEMLIST: 51,
		VERTICAL_ITEM_GRID: 53,
		HORIZONTAL_ITEM_GRID: 54,
		VERTICAL_SCROLLABLE_ITEMLIST: 56,
		HORIZONTAL_SCROLLABLE_ITEMLIST: 57,
		SIMPLE_BUTTON: 60,
		THICK_BUTTON: 61,
		BUTTON_GROUP_LEFT: 67,
		BUTTON_GROUP_CENTER: 68,
		BUTTON_GROUP_RIGHT: 69,
		CHECKBOX: 70,
		RADIO_BUTTON: 71,
		INPUT_FIELD: 77,
		PASSWORD: 78,
		TAB_CONTEXT: 91,
		TAB_SELECTOR: 92,
		TAB_BUTTON: 93,
		DROP_MENU: 102,
		DROP_MENU_ITEM: 103,
		HORIZONTAL_SCROLLBAR: 130,
		VERTICAL_SCROLLBAR: 131,
		VERTICAL_SCROLLABLE_GRIDLIST: 140,
	} as const;

export type HabboWindowTypeValue = typeof HabboWindowType[keyof typeof HabboWindowType];
