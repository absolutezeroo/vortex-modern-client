/**
 * Habbo-specific window style identifiers.
 *
 * Controls the visual theme/skin applied to Habbo window elements.
 *
 * @see sources/win63_version/habbo/window/enum/HabboWindowStyle.as
 */
export const HabboWindowStyle =
	{
		NULL: 0,
		DEFAULT: 0,
		BLACK: 1,
		SHINY: 3,
	} as const;

export type HabboWindowStyleValue = typeof HabboWindowStyle[keyof typeof HabboWindowStyle];
