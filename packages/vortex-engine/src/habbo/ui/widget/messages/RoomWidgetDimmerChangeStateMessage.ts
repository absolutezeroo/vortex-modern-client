import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * RoomWidgetDimmerChangeStateMessage
 *
 * Toggles the moodlight on or off — the server owns the state, so this only asks.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetDimmerChangeStateMessage.as
 */
export class RoomWidgetDimmerChangeStateMessage extends RoomWidgetMessage
{
    // AS3: .../messages/RoomWidgetDimmerChangeStateMessage.as::CHANGE_STATE
    public static readonly CHANGE_STATE: string = 'RWCDSM_CHANGE_STATE';

    // AS3: .../messages/RoomWidgetDimmerChangeStateMessage.as::RoomWidgetDimmerChangeStateMessage()
    constructor(objectId: number)
    {
        super(RoomWidgetDimmerChangeStateMessage.CHANGE_STATE);

        this._objectId = objectId;
    }

    // AS3: .../messages/RoomWidgetDimmerChangeStateMessage.as::_SafeStr_4841
    private _objectId: number;

    // AS3: .../messages/RoomWidgetDimmerChangeStateMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }
}
