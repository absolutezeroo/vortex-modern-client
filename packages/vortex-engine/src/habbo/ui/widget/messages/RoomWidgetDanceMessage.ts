/**
 * RoomWidgetDanceMessage
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetDanceMessage.as
 *
 * Sent by the own-avatar bubble to start/stop dancing. style: 0 = stop,
 * 1 = normal dance, 2/3/4 = HabboClub dances.
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetDanceMessage extends RoomWidgetMessage
{
    // AS3: RoomWidgetDanceMessage.as::_SafeStr_10711
    public static readonly DANCE: string = 'RWCM_MESSAGE_DANCE';

    // AS3: RoomWidgetDanceMessage.as::_SafeStr_11412 (stop dancing)
    public static readonly STOP: number = 0;

    // AS3: RoomWidgetDanceMessage.as::_SafeStr_10129 (HabboClub dance styles)
    public static readonly CLUB_DANCES: number[] = [2, 3, 4];

    private _style: number;

    // AS3: RoomWidgetDanceMessage.as::RoomWidgetDanceMessage()
    constructor(style: number)
    {
        super(RoomWidgetDanceMessage.DANCE);
        this._style = style;
    }

    // AS3: RoomWidgetDanceMessage.as::get style()
    public get style(): number
    {
        return this._style;
    }
}
