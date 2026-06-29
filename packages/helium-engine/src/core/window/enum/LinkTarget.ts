/**
 * Link target constants for text link navigation.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/enum/_SafeStr_165.as
 */
export const LinkTarget =
	{
		SELF: '_self',
		BLANK: '_blank',
		PARENT: '_parent',
		TOP: '_top',
		DEFAULT: 'default',
		INTERNAL: 'internal',
	} as const;

export type LinkTargetValue = typeof LinkTarget[keyof typeof LinkTarget];
