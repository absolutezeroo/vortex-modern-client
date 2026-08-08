import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * A dance started or stopped, carrying the style. Style 0 is "stop dancing".
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetDanceUpdateEvent.as
 */
export class RoomWidgetDanceUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetDanceUpdateEvent.as::DANCE
    // Name DERIVED (`_SafeStr_11164`), from its value "RWUE_DANCE".
    public static readonly DANCE: string = 'RWUE_DANCE';

    // AS3: .../widget/events/RoomWidgetDanceUpdateEvent.as::_style
    private _style: number;

    // AS3: .../widget/events/RoomWidgetDanceUpdateEvent.as::RoomWidgetDanceUpdateEvent()
    // The type is fixed, not a parameter. The two Flash Event flags AS3 forwards are dropped.
    constructor(style: number)
    {
        super(RoomWidgetDanceUpdateEvent.DANCE);

        this._style = style;
    }

    // AS3: .../widget/events/RoomWidgetDanceUpdateEvent.as::get style()
    public get style(): number
    {
        return this._style;
    }
}
