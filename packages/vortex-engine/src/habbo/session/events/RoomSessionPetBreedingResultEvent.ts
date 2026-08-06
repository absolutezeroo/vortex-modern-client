import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';
import type {PetBreedingResultData} from '@habbo/communication/messages/incoming/room/pet/PetBreedingResultData';

/**
 * Room session pet breeding result event
 *
 * AS3 types both records as the message's own breeding-result DTO; typed concretely here rather than
 * left as `unknown`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/events/RoomSessionPetBreedingResultEvent.as
 */
export class RoomSessionPetBreedingResultEvent extends RoomSessionEvent
{
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetBreedingResultEvent.as::PET_BREEDING_RESULT
    public static readonly PET_BREEDING_RESULT = 'RSPFUE_PET_BREEDING_RESULT';

    constructor(session: IRoomSession, resultData: PetBreedingResultData | null, otherResultData: PetBreedingResultData | null)
    {
        super(RoomSessionPetBreedingResultEvent.PET_BREEDING_RESULT, session);
        this._resultData = resultData;
        this._otherResultData = otherResultData;
    }

    private _resultData: PetBreedingResultData | null;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetBreedingResultEvent.as::get resultData()
    get resultData(): PetBreedingResultData | null
    {
        return this._resultData;
    }

    private _otherResultData: PetBreedingResultData | null;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetBreedingResultEvent.as::get otherResultData()
    get otherResultData(): PetBreedingResultData | null
    {
        return this._otherResultData;
    }
}
