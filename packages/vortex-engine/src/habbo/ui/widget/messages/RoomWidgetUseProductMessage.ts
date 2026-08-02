import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * RoomWidgetUseProductMessage
 *
 * "Use this product on that thing" — a monsterplant seed planted on a tile, or a pet
 * product applied to a pet (hence the second, optional id).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetUseProductMessage.as
 */
export class RoomWidgetUseProductMessage extends RoomWidgetMessage
{
    // AS3: .../messages/RoomWidgetUseProductMessage.as::PET_PRODUCT
    public static readonly PET_PRODUCT: string = 'RWUPM_PET_PRODUCT';

    // AS3: .../messages/RoomWidgetUseProductMessage.as::MONSTERPLANT_SEED
    public static readonly MONSTERPLANT_SEED: string = 'RWUPM_MONSTERPLANT_SEED';

    // AS3: .../messages/RoomWidgetUseProductMessage.as::RoomWidgetUseProductMessage()
    constructor(type: string, roomObjectId: number, petId: number = -1)
    {
        super(type);

        this._roomObjectId = roomObjectId;
        this._petId = petId;
    }

    // AS3: .../messages/RoomWidgetUseProductMessage.as::_SafeStr_8884
    private _roomObjectId: number = 0;

    // AS3: .../messages/RoomWidgetUseProductMessage.as::get roomObjectId()
    public get roomObjectId(): number
    {
        return this._roomObjectId;
    }

    /** -1 for a seed, which is planted on the floor rather than used on a pet. */
    // AS3: .../messages/RoomWidgetUseProductMessage.as::_SafeStr_7746
    private _petId: number = -1;

    // AS3: .../messages/RoomWidgetUseProductMessage.as::get petId()
    public get petId(): number
    {
        return this._petId;
    }
}
