/**
 * RoomWidgetPetLevelUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPetLevelUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetPetLevelUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetPetLevelUpdateEvent.as::PET_LEVEL_UPDATE
    public static readonly PET_LEVEL_UPDATE: string = 'RWPLUE_PET_LEVEL_UPDATE';

    private _petId: number;

    private _level: number;

    // AS3: .../RoomWidgetPetLevelUpdateEvent.as::RoomWidgetPetLevelUpdateEvent()
    constructor(petId: number, level: number)
    {
        super(RoomWidgetPetLevelUpdateEvent.PET_LEVEL_UPDATE);

        this._petId = petId;
        this._level = level;
    }

    // AS3: .../RoomWidgetPetLevelUpdateEvent.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: .../RoomWidgetPetLevelUpdateEvent.as::get level()
    get level(): number
    {
        return this._level;
    }
}
