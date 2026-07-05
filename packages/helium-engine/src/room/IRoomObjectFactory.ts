/**
 * IRoomObjectFactory Interface
 *
 * Based on AS3: com.sulake.room.IRoomObjectFactory
 *
 * Factory interface for creating room object logic and managers.
 * Visualization creation is handled by IRoomObjectVisualizationFactory.
 *
 * @see source_as_win63/room/IRoomObjectFactory.as
 */
import type {EventEmitter} from 'eventemitter3';
import type {IRoomObjectEventHandler} from './object/logic/IRoomObjectEventHandler';
import type {IRoomObjectManager} from './IRoomObjectManager';

export interface IRoomObjectFactory
{
    readonly events: EventEmitter;

    addObjectEventListener(callback: (event: unknown) => void): void;

    removeObjectEventListener(callback: (event: unknown) => void): void;

    createRoomObjectLogic(type: string): IRoomObjectEventHandler | null;

    createRoomObjectManager(): IRoomObjectManager;
}
