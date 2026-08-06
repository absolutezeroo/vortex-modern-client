import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet breeding event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetBreedingEvent.as
 */
export class RoomSessionPetBreedingEvent extends RoomSessionEvent
{
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetBreedingEvent.as::PET_BREEDING
    public static readonly PET_BREEDING = 'RSPFUE_PET_BREEDING';

    constructor(session: IRoomSession, state: number, ownPetId: number, otherPetId: number)
    {
        super(RoomSessionPetBreedingEvent.PET_BREEDING, session);
        this._state = state;
        this._ownPetId = ownPetId;
        this._otherPetId = otherPetId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionPetBreedingEvent.as::_state
    private _state: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetBreedingEvent.as::get state()
    get state(): number
    {
        return this._state;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionPetBreedingEvent.as::_ownPetId
    private _ownPetId: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetBreedingEvent.as::get ownPetId()
    get ownPetId(): number
    {
        return this._ownPetId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionPetBreedingEvent.as::_otherPetId
    private _otherPetId: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetBreedingEvent.as::get otherPetId()
    get otherPetId(): number
    {
        return this._otherPetId;
    }
}
