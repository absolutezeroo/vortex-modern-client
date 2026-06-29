import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session doorbell event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionDoorbellEvent
 */
export class RoomSessionDoorbellEvent extends RoomSessionEvent
{
	public static readonly RSDE_DOORBELL = 'RSDE_DOORBELL';
	public static readonly RSDE_REJECTED = 'RSDE_REJECTED';
	public static readonly RSDE_ACCEPTED = 'RSDE_ACCEPTED';

	constructor(type: string, session: IRoomSession, userName: string, openLandingPage: boolean = false)
	{
		super(type, session, openLandingPage);
		this._userName = userName;
	}

	private _userName: string;

	get userName(): string
	{
		return this._userName;
	}
}
