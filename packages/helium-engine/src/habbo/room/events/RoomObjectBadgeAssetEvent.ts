/**
 * RoomObjectBadgeAssetEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectBadgeAssetEvent.as
 *
 * Event dispatched to request loading a badge asset for a room object.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectBadgeAssetEvent extends RoomObjectEvent
{
	public static readonly LOAD_BADGE = 'ROGBE_LOAD_BADGE';

	constructor(type: string, object: IRoomObject, badgeId: string, groupBadge: boolean = true)
	{
		super(type, object);
		this._badgeId = badgeId;
		this._groupBadge = groupBadge;
	}

	private _badgeId: string;

	get badgeId(): string
	{
		return this._badgeId;
	}

	private _groupBadge: boolean;

	get groupBadge(): boolean
	{
		return this._groupBadge;
	}
}
