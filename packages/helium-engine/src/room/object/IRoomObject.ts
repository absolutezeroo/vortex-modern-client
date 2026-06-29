/**
 * IRoomObject Interface
 *
 * Based on AS3: com.sulake.room.object.IRoomObject
 *
 * Read-only interface for room objects.
 */
import type {IVector3d} from '../utils/IVector3d';
import type {IRoomObjectModel} from './IRoomObjectModel';
import type {IRoomObjectMouseHandler} from './logic/IRoomObjectMouseHandler';
import type {IRoomObjectVisualization} from './visualization/IRoomObjectVisualization';

export interface IRoomObject
{
	getId(): number;

	getInstanceId(): number;

	getType(): string;

	isInitialized(): boolean;

	getLocation(): IVector3d;

	getDirection(): IVector3d;

	getModel(): IRoomObjectModel;

	getVisualization(): IRoomObjectVisualization | null;

	getMouseHandler(): IRoomObjectMouseHandler | null;

	getAvatarLibraryAssetName(): string;

	getState(index: number): number;

	getUpdateID(): number;

	tearDown(): void;
}
