/**
 * Alert dialog content flags (bitwise).
 *
 * Controls which elements appear in a Habbo alert dialog.
 * Flags are OR'd together to compose a dialog layout.
 *
 * @see sources/win63_version/habbo/window/enum/HabboAlertDialogFlag.as
 */
export const HabboAlertDialogFlag =
	{
		NULL: 0,
		TEXT_TITLE: 1,
		TEXT_SUMMARY: 2,
		TEXT_HTML: 4,
		TEXT_LINK: 8,
		BUTTON_OK: 16,
		BUTTON_CANCEL: 32,
		BUTTON_CUSTOM: 64,
		BUTTON_CLOSE: 128,
		BITMAP_ICON: 256,
		BITMAP_RESERVED_1: 512,
		BITMAP_RESERVED_2: 1024,
		BITMAP_RESERVED_3: 2048,
	} as const;

export type HabboAlertDialogFlagValue = typeof HabboAlertDialogFlag[keyof typeof HabboAlertDialogFlag];
