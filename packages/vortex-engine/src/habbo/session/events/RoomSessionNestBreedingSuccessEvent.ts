import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session nest breeding success event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionNestBreedingSuccessEvent.as
 */
export class RoomSessionNestBreedingSuccessEvent extends RoomSessionEvent
{
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionNestBreedingSuccessEvent.as::NEST_BREEDING_SUCCESS
    public static readonly NEST_BREEDING_SUCCESS = 'RSPFUE_NEST_BREEDING_SUCCESS';

    constructor(session: IRoomSession, petId: number, rarityCategory: number)
    {
        super(RoomSessionNestBreedingSuccessEvent.NEST_BREEDING_SUCCESS, session);
        this._petId = petId;
        this._rarityCategory = rarityCategory;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionNestBreedingSuccessEvent.as::_petId
    private _petId: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionNestBreedingSuccessEvent.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionNestBreedingSuccessEvent.as::_rarityCategory
    private _rarityCategory: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionNestBreedingSuccessEvent.as::get rarityCategory()
    get rarityCategory(): number
    {
        return this._rarityCategory;
    }
}
