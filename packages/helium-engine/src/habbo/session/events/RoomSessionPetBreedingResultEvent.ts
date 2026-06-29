import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet breeding result event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetBreedingResultEvent.as
 */
export class RoomSessionPetBreedingResultEvent extends RoomSessionEvent
{
	public static readonly PET_BREEDING_RESULT = 'RSPFUE_PET_BREEDING_RESULT';

	constructor(session: IRoomSession, resultData: unknown, otherResultData: unknown)
	{
		super(RoomSessionPetBreedingResultEvent.PET_BREEDING_RESULT, session);
		this._resultData = resultData;
		this._otherResultData = otherResultData;
	}

	private _resultData: unknown;

	get resultData(): unknown
	{
		return this._resultData;
	}

	private _otherResultData: unknown;

	get otherResultData(): unknown
	{
		return this._otherResultData;
	}
}
