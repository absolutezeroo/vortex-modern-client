import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session dance event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionDanceEvent
 */
export class RoomSessionDanceEvent extends RoomSessionEvent
{
	public static readonly RSDE_DANCE = 'RSDE_DANCE';

	constructor(session: IRoomSession, userId: number, danceStyle: number)
	{
		super(RoomSessionDanceEvent.RSDE_DANCE, session);
		this._userId = userId;
		this._danceStyle = danceStyle;
	}

	private _userId: number;

	get userId(): number
	{
		return this._userId;
	}

	private _danceStyle: number;

	get danceStyle(): number
	{
		return this._danceStyle;
	}
}
