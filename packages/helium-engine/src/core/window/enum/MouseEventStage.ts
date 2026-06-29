/**
 * Mouse event stage constants.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/enum/_SafeStr_154.as
 */
export const MouseEventStage =
	{
		INSIDE_STAGE: 0,
		OUTSIDE_STAGE: 1,
		LEFT_STAGE: 3,
	} as const;

export type MouseEventStageValue = typeof MouseEventStage[keyof typeof MouseEventStage];
