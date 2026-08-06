import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session confirm pet breeding result event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionConfirmPetBreedingResultEvent.as
 */
export class RoomSessionConfirmPetBreedingResultEvent extends RoomSessionEvent
{
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingResultEvent.as::CONFIRM_PET_BREEDING_RESULT
    public static readonly CONFIRM_PET_BREEDING_RESULT = 'RSPFUE_CONFIRM_PET_BREEDING_RESULT';

    constructor(session: IRoomSession, breedingNestStuffId: number, result: number)
    {
        super(RoomSessionConfirmPetBreedingResultEvent.CONFIRM_PET_BREEDING_RESULT, session);
        this._breedingNestStuffId = breedingNestStuffId;
        this._result = result;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingResultEvent.as::_breedingNestStuffId
    private _breedingNestStuffId: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingResultEvent.as::get breedingNestStuffId()
    get breedingNestStuffId(): number
    {
        return this._breedingNestStuffId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingResultEvent.as::_result
    private _result: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingResultEvent.as::get result()
    get result(): number
    {
        return this._result;
    }
}
