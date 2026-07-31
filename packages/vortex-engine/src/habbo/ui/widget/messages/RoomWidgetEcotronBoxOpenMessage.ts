/**
 * RoomWidgetEcotronBoxOpenMessage
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetEcotronBoxOpenMessage.as
 *
 * Sent by EcotronBoxFurniWidget when the user presses Open.
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetEcotronBoxOpenMessage extends RoomWidgetMessage
{
    /**
     * Obfuscated in every available tree; the member name is DERIVED from its value.
     */
    // AS3: RoomWidgetEcotronBoxOpenMessage.as::_SafeStr_11668
    public static readonly OPEN_ECOTRONBOX: string = 'RWEBOM_OPEN_ECOTRONBOX';

    // AS3: RoomWidgetEcotronBoxOpenMessage.as::_SafeStr_4841
    private _objectId: number;

    // AS3: RoomWidgetEcotronBoxOpenMessage.as::RoomWidgetEcotronBoxOpenMessage()
    constructor(type: string, objectId: number)
    {
        super(type);

        this._objectId = objectId;
    }

    // AS3: RoomWidgetEcotronBoxOpenMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }
}
