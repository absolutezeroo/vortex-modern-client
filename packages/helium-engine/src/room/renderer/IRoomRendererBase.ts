/**
 * IRoomRendererBase
 *
 * Based on AS3: com.sulake.room.renderer.IRoomRendererBase
 *
 * Base interface for room renderers. Provides object management and update cycle.
 *
 * @see sources/win63_version/room/renderer/IRoomRendererBase.as
 */
import type {IRoomObject} from '../object/IRoomObject';

export interface IRoomRendererBase
{
    dispose(): void;

    reset(): void;

    feedRoomObject(object: IRoomObject): void;

    removeRoomObject(object: IRoomObject): void;

    update(time: number): void;
}
