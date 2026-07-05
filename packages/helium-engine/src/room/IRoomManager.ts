/**
 * IRoomManager Interface
 *
 * Based on AS3: com.sulake.room.IRoomManager
 *
 * Interface for the room manager that creates and manages room instances.
 */
import type {IRoomInstance} from './IRoomInstance';
import type {IRoomManagerListener} from './IRoomManagerListener';
import type {IRoomContentLoader} from './IRoomContentLoader';

export interface IRoomManager
{
    initialize(data: unknown, listener: IRoomManagerListener): boolean;

    update(time: number): void;

    setContentLoader(loader: IRoomContentLoader): void;

    addObjectUpdateCategory(category: number): void;

    removeObjectUpdateCategory(category: number): void;

    createRoom(id: string, data: unknown): IRoomInstance | null;

    disposeRoom(id: string): boolean;

    getRoom(id: string): IRoomInstance | null;

    getRoomWithIndex(index: number): IRoomInstance | null;

    getRoomCount(): number;

    isContentAvailable(type: string): boolean;
}
