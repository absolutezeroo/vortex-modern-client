import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session favourite group update event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionFavouriteGroupUpdateEvent.as
 */
export class RoomSessionFavouriteGroupUpdateEvent extends RoomSessionEvent
{
	public static readonly FAVOURITE_GROUP_UPDATE = 'rsfgue_favourite_group_update';

	constructor(session: IRoomSession, roomIndex: number, habboGroupId: number, status: number, habboGroupName: string)
	{
		super(RoomSessionFavouriteGroupUpdateEvent.FAVOURITE_GROUP_UPDATE, session);
		this._roomIndex = roomIndex;
		this._habboGroupId = habboGroupId;
		this._status = status;
		this._habboGroupName = habboGroupName;
	}

	private _roomIndex: number;

	get roomIndex(): number
	{
		return this._roomIndex;
	}

	private _habboGroupId: number;

	get habboGroupId(): number
	{
		return this._habboGroupId;
	}

	private _status: number;

	get status(): number
	{
		return this._status;
	}

	private _habboGroupName: string;

	get habboGroupName(): string
	{
		return this._habboGroupName;
	}
}
