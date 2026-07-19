/**
 * IRoomObjectEventHandler Interface
 *
 * Based on AS3: com.sulake.room.object.logic.IRoomObjectEventHandler
 *
 * Interface for room object logic/behavior handlers.
 */
import type {EventEmitter} from 'eventemitter3';
import type {RoomObjectUpdateMessage} from '../../messages/RoomObjectUpdateMessage';
import type {IRoomObjectController} from '../IRoomObjectController';
import type {IRoomObjectMouseHandler} from './IRoomObjectMouseHandler';

export interface IRoomObjectEventHandler extends IRoomObjectMouseHandler
{
    object: IRoomObjectController | null;
    eventDispatcher: EventEmitter | null;

    readonly widget: string | null;
    readonly contextMenu: string | null;

    dispose(): void;

    initialize(data: unknown): void;

    tearDown(): void;

    update(time: number): void;

    processUpdateMessage(message: RoomObjectUpdateMessage): void;

    useObject(): void;

    getEventTypes(): string[];
}
