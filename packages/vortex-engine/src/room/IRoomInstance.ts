/**
 * IRoomInstance Interface
 *
 * Based on AS3: com.sulake.room.IRoomInstance
 *
 * Interface for a room instance that manages objects.
 *
 * @see sources/win63_version/room/RoomInstance.as
 */
import type {IRoomObject} from './object/IRoomObject';
import type {IRoomRendererBase} from './renderer/IRoomRendererBase';

export interface IRoomInstance
{
    readonly id: string;

    hasValueForName(key: string): boolean;

    getNumber(key: string): number;

    setNumber(key: string, value: number, immutable?: boolean): void;

    getString(key: string): string;

    setString(key: string, value: string, immutable?: boolean): void;

    dispose(): void;

    update(): void;

    addObjectUpdateCategory(category: number): void;

    removeObjectUpdateCategory(category: number): void;

    setRenderer(renderer: IRoomRendererBase | null): void;

    getRenderer(): IRoomRendererBase | null;

    createRoomObject(id: number, type: string, category: number): IRoomObject | null;

    getObject(id: number, category: number): IRoomObject | null;

    getObjects(category: number): IRoomObject[];

    disposeObject(id: number, category: number): boolean;

    getObjectCount(category: number): number;

    getObjectWithIndexAndType(index: number, type: string, category: number): IRoomObject | null;

    getObjectCountForType(type: string, category: number): number;

    getObjectWithIndex(index: number, category: number): IRoomObject | null;

    disposeObjects(category: number): number;
}
