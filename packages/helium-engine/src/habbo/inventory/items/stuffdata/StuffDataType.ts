/**
 * Stuff data type constants
 *
 * Based on AS3 com.sulake.habbo.room.object.data types
 */
export const StuffDataType = {
	LEGACY: 0,
	MAP: 1,
	STRING_ARRAY: 2,
	VOTE_RESULT: 3,
	EMPTY: 4,
	INT_ARRAY: 5,
	HIGH_SCORE: 6,
	CRACKABLE: 7,
} as const;

export type StuffDataTypeValue = typeof StuffDataType[keyof typeof StuffDataType];

/**
 * Flags for stuff data
 */
export const StuffDataFlags = {
	UNIQUE_SET: 256,
} as const;
