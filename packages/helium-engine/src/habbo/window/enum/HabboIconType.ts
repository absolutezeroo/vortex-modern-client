/**
 * Habbo icon type identifiers.
 *
 * Enumerates all available icon types used in the window system.
 *
 * @see sources/win63_version/habbo/window/enum/HabboIconType.as
 */
export const HabboIconType =
	{
		ARROW_DOWN: 0,
		ARROW_UP: 1,
		ARROW_LEFT: 2,
		ARROW_RIGHT: 3,
		TRIANGLE_LEFT: 4,
		TRIANGLE_RIGHT: 5,
		TRIANGLE_UP: 6,
		TRIANGLE_DOWN: 7,
		SYMBOL_ACCEPT: 8,
		SYMBOL_DECLINE: 9,
		COIN: 10,
		CLUB_ICON_SMALL: 11,
		VIP_ICON_SMALL: 12,
		CLUB_ICON_SQUARE: 13,
		VIP_ICON_SQUARE: 14,
		CLUB_ICON_SQUARE_BIG: 15,
		VIP_ICON_SQUARE_BIG: 16,
		CLUB_ICON_GIGANTIC: 17,
		VIP_ICON_GIGANTIC: 18,
	} as const;

export type HabboIconTypeValue = typeof HabboIconType[keyof typeof HabboIconType];
