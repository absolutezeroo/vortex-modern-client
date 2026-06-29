/**
 * IRoomObjectModel Interface
 *
 * Based on AS3: com.sulake.room.object.IRoomObjectModel
 *
 * Read-only interface for room object state storage.
 * Stores numbers, strings, and arrays indexed by string keys.
 */
export interface IRoomObjectModel
{
	hasNumber(key: string): boolean;

	hasNumberArray(key: string): boolean;

	hasString(key: string): boolean;

	hasStringArray(key: string): boolean;

	getNumber(key: string): number;

	getString(key: string): string;

	getNumberArray(key: string): readonly number[] | null;

	getStringArray(key: string): readonly string[] | null;

	getStringToStringMap(key: string): Map<string, string>;

	getObject(key: string): unknown;

	getUpdateID(): number;
}
