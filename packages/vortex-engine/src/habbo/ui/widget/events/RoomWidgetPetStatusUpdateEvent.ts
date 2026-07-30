/**
 * RoomWidgetPetStatusUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPetStatusUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetPetStatusUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetPetStatusUpdateEvent.as::PET_STATUS_UPDATE
    public static readonly PET_STATUS_UPDATE: string = 'RWPIUE_PET_STATUS_UPDATE';

    private _petId: number;

    private _canBreed: boolean;

    private _canHarvest: boolean;

    private _canRevive: boolean;

    private _hasBreedingPermission: boolean;

    // AS3: .../RoomWidgetPetStatusUpdateEvent.as::RoomWidgetPetStatusUpdateEvent()
    constructor(petId: number, canBreed: boolean, canHarvest: boolean, canRevive: boolean, hasBreedingPermission: boolean)
    {
        super(RoomWidgetPetStatusUpdateEvent.PET_STATUS_UPDATE);

        this._petId = petId;
        this._canBreed = canBreed;
        this._canHarvest = canHarvest;
        this._canRevive = canRevive;
        this._hasBreedingPermission = hasBreedingPermission;
    }

    // AS3: .../RoomWidgetPetStatusUpdateEvent.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: .../RoomWidgetPetStatusUpdateEvent.as::get canBreed()
    get canBreed(): boolean
    {
        return this._canBreed;
    }

    // AS3: .../RoomWidgetPetStatusUpdateEvent.as::get canHarvest()
    get canHarvest(): boolean
    {
        return this._canHarvest;
    }

    // AS3: .../RoomWidgetPetStatusUpdateEvent.as::get canRevive()
    get canRevive(): boolean
    {
        return this._canRevive;
    }

    // AS3: .../RoomWidgetPetStatusUpdateEvent.as::get hasBreedingPermission()
    get hasBreedingPermission(): boolean
    {
        return this._hasBreedingPermission;
    }
}
