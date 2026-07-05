/**
 * IRoomInstanceContainer Interface
 *
 * Based on AS3: com.sulake.room.IRoomInstanceContainer
 *
 * Interface for the container that manages room instances.
 */
import type {IRoomObject} from './object/IRoomObject';
import type {IRoomObjectManager} from './IRoomObjectManager';

export interface IRoomInstanceContainer
{
    createRoomObject(roomId: string, objectId: number, type: string, category: number): IRoomObject | null;

    createRoomObjectManager(): IRoomObjectManager;
}
