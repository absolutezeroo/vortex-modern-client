import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session nest breeding success event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionNestBreedingSuccessEvent.as
 */
export class RoomSessionNestBreedingSuccessEvent extends RoomSessionEvent
{
	public static readonly NEST_BREEDING_SUCCESS = 'RSPFUE_NEST_BREEDING_SUCCESS';

	constructor(session: IRoomSession, petId: number, rarityCategory: number)
	{
		super(RoomSessionNestBreedingSuccessEvent.NEST_BREEDING_SUCCESS, session);
		this._petId = petId;
		this._rarityCategory = rarityCategory;
	}

	private _petId: number;

	get petId(): number
	{
		return this._petId;
	}

	private _rarityCategory: number;

	get rarityCategory(): number
	{
		return this._rarityCategory;
	}
}
