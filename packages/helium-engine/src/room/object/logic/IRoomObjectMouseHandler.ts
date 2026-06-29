/**
 * IRoomObjectMouseHandler Interface
 *
 * Based on AS3: com.sulake.room.object.logic.IRoomObjectMouseHandler
 *
 * Interface for handling mouse events on room objects.
 */
import type {RoomSpriteMouseEvent} from '../../events/RoomSpriteMouseEvent';
import type {IRoomGeometry} from '../../utils/IRoomGeometry';

export interface IRoomObjectMouseHandler
{
	mouseEvent(event: RoomSpriteMouseEvent, geometry: IRoomGeometry): void;
}
