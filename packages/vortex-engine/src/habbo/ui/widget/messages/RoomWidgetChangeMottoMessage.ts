/**
 * RoomWidgetChangeMottoMessage
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetChangeMottoMessage.as
 *
 * Sent by the infostand when the local user finishes editing their own motto.
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetChangeMottoMessage extends RoomWidgetMessage
{
    // AS3: RoomWidgetChangeMottoMessage.as::CHANGE_MOTTO
    public static readonly CHANGE_MOTTO: string = 'RWVM_CHANGE_MOTTO_MESSAGE';

    // AS3: RoomWidgetChangeMottoMessage.as::_SafeStr_7860
    private _motto: string;

    // AS3: RoomWidgetChangeMottoMessage.as::RoomWidgetChangeMottoMessage()
    constructor(motto: string)
    {
        super(RoomWidgetChangeMottoMessage.CHANGE_MOTTO);

        this._motto = motto;
    }

    // AS3: RoomWidgetChangeMottoMessage.as::get motto()
    public get motto(): string
    {
        return this._motto;
    }
}
