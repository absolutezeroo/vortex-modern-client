/**
 * IRoomObjectManager Interface
 *
 * Based on AS3: com.sulake.room.IRoomObjectManager
 *
 * Interface for managing room objects within a category.
 */
import type {IRoomObject} from './object/IRoomObject';
import type {IRoomObjectController} from './object/IRoomObjectController';

export interface IRoomObjectManager
{
	readonly objectCount: number;
	readonly objects: IRoomObject[];

	dispose(): void;

	reset(): void;

	getObject(id: number): IRoomObject | null;

	getObjectByIndex(index: number): IRoomObject | null;

	createObject(id: number, stateCount: number, type: string): IRoomObjectController | null;

	disposeObject(id: number): boolean;

	getObjectWithIndexAndType(index: number, type: string): IRoomObjectController | null;

	getObjectCountForType(type: string): number;
}
