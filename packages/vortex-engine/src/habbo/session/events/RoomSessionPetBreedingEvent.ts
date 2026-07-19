import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet breeding event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetBreedingEvent.as
 */
export class RoomSessionPetBreedingEvent extends RoomSessionEvent
{
    public static readonly PET_BREEDING = 'RSPFUE_PET_BREEDING';

    constructor(session: IRoomSession, state: number, ownPetId: number, otherPetId: number)
    {
        super(RoomSessionPetBreedingEvent.PET_BREEDING, session);
        this._state = state;
        this._ownPetId = ownPetId;
        this._otherPetId = otherPetId;
    }

    private _state: number;

    get state(): number
    {
        return this._state;
    }

    private _ownPetId: number;

    get ownPetId(): number
    {
        return this._ownPetId;
    }

    private _otherPetId: number;

    get otherPetId(): number
    {
        return this._otherPetId;
    }
}
