/**
 * Window style identifiers.
 *
 * Controls the visual theme/skin applied to a window element.
 * The core framework defines only DEFAULT; Habbo layer adds more styles.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/enum/_SafeStr_142.as
 */
export const WindowStyle =
    {
        DEFAULT: 0,
    } as const;

export type WindowStyleValue = typeof WindowStyle[keyof typeof WindowStyle];
