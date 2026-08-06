import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet status update event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetStatusUpdateEvent.as
 */
export class RoomSessionPetStatusUpdateEvent extends RoomSessionEvent
{
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::PET_STATUS_UPDATE
    public static readonly PET_STATUS_UPDATE = 'RSPFUE_PET_STATUS_UPDATE';

    constructor(session: IRoomSession, petId: number, canBreed: boolean, canHarvest: boolean, canRevive: boolean, hasBreedingPermission: boolean)
    {
        super(RoomSessionPetStatusUpdateEvent.PET_STATUS_UPDATE, session);
        this._petId = petId;
        this._canBreed = canBreed;
        this._canHarvest = canHarvest;
        this._canRevive = canRevive;
        this._hasBreedingPermission = hasBreedingPermission;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::_petId
    private _petId: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::_canBreed
    private _canBreed: boolean;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::get canBreed()
    get canBreed(): boolean
    {
        return this._canBreed;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::_canHarvest
    private _canHarvest: boolean;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::get canHarvest()
    get canHarvest(): boolean
    {
        return this._canHarvest;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::_canRevive
    private _canRevive: boolean;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::get canRevive()
    get canRevive(): boolean
    {
        return this._canRevive;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::_hasBreedingPermission
    private _hasBreedingPermission: boolean;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPetStatusUpdateEvent.as::get hasBreedingPermission()
    get hasBreedingPermission(): boolean
    {
        return this._hasBreedingPermission;
    }
}
