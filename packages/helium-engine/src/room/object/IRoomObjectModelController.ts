/**
 * IRoomObjectModelController Interface
 *
 * Based on AS3: com.sulake.room.object.IRoomObjectModelController
 *
 * Read-write interface for room object state storage.
 * Extends IRoomObjectModel with setter methods.
 */
import type {IRoomObjectModel} from './IRoomObjectModel';

export interface IRoomObjectModelController extends IRoomObjectModel
{
	setNumber(key: string, value: number, immutable?: boolean): void;

	setString(key: string, value: string, immutable?: boolean): void;

	setNumberArray(key: string, value: number[], immutable?: boolean): void;

	setStringArray(key: string, value: string[], immutable?: boolean): void;

	setStringToStringMap(key: string, value: Map<string, string>, immutable?: boolean): void;

	setObject(key: string, value: unknown, immutable?: boolean): void;
}
