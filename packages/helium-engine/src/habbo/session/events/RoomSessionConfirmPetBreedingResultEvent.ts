import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session confirm pet breeding result event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionConfirmPetBreedingResultEvent.as
 */
export class RoomSessionConfirmPetBreedingResultEvent extends RoomSessionEvent
{
	public static readonly CONFIRM_PET_BREEDING_RESULT = 'RSPFUE_CONFIRM_PET_BREEDING_RESULT';

	constructor(session: IRoomSession, breedingNestStuffId: number, result: number)
	{
		super(RoomSessionConfirmPetBreedingResultEvent.CONFIRM_PET_BREEDING_RESULT, session);
		this._breedingNestStuffId = breedingNestStuffId;
		this._result = result;
	}

	private _breedingNestStuffId: number;

	get breedingNestStuffId(): number
	{
		return this._breedingNestStuffId;
	}

	private _result: number;

	get result(): number
	{
		return this._result;
	}
}
