/**
 * RoomObjectMoveEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomObjectMoveEvent
 *
 * Event emitted when room objects move or slide.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectMoveEvent extends RoomObjectEvent
{
	public static readonly ROME_SLIDE_ANIMATION = 'ROME_SLIDE_ANIMATION';
	public static readonly ROME_POSITION_CHANGED = 'ROME_POSITION_CHANGED';
	public static readonly ROME_OBJECT_REMOVED = 'ROME_OBJECT_REMOVED';

	constructor(type: string, object: IRoomObject | null)
	{
		super(type, object);
	}
}
