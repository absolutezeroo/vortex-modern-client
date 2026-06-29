/**
 * IRoomObjectController Interface
 *
 * Based on AS3: com.sulake.room.object.IRoomObjectController
 *
 * Read-write interface for room objects.
 * Extends IRoomObject with setter methods.
 */
import type {IVector3d} from '../utils/IVector3d';
import type {IRoomObject} from './IRoomObject';
import type {IRoomObjectModelController} from './IRoomObjectModelController';
import type {IRoomObjectEventHandler} from './logic/IRoomObjectEventHandler';
import type {IRoomObjectVisualization} from './visualization/IRoomObjectVisualization';

export interface IRoomObjectController extends IRoomObject
{
	dispose(): void;

	setInitialized(value: boolean): void;

	setLocation(location: IVector3d): void;

	setDirection(direction: IVector3d): void;

	setVisualization(visualization: IRoomObjectVisualization | null): void;

	setState(state: number, index: number): boolean;

	setEventHandler(handler: IRoomObjectEventHandler | null): void;

	getEventHandler(): IRoomObjectEventHandler | null;

	getModelController(): IRoomObjectModelController;
}
