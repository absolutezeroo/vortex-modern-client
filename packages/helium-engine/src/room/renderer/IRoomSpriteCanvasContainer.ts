/**
 * IRoomSpriteCanvasContainer
 *
 * Based on AS3: com.sulake.room.renderer.class_3446
 *
 * Interface for the container that provides room objects to rendering canvases.
 * The RoomRenderer implements this to allow canvases to query objects during rendering.
 *
 * @see sources/win63_version/room/renderer/class_3446.as
 */
import type {IRoomObject} from '../object/IRoomObject';

export interface IRoomSpriteCanvasContainer
{
	readonly roomObjectVariableAccurateZ: string | null;

	getRoomObject(id: string): IRoomObject | null;

	getRoomObjectWithIndex(index: number): IRoomObject | null;

	getRoomObjectIdWithIndex(index: number): string | null;

	getRoomObjectCount(): number;

	getRoomObjectIdentifier(object: IRoomObject): string | null;
}
