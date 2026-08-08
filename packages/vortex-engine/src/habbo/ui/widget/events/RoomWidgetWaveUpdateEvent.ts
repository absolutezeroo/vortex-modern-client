import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The local user waved. No payload — and the me-menu's listener does nothing but log, in AS3 too.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetWaveUpdateEvent.as
 */
export class RoomWidgetWaveUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetWaveUpdateEvent.as::WAVE
    // Name DERIVED (`_SafeStr_10887`), from its value "RWUE_WAVE".
    public static readonly WAVE: string = 'RWUE_WAVE';

    // AS3: .../widget/events/RoomWidgetWaveUpdateEvent.as::RoomWidgetWaveUpdateEvent()
    // The type is fixed and the constructor takes only the two Flash Event flags, both dropped.
    constructor()
    {
        super(RoomWidgetWaveUpdateEvent.WAVE);
    }
}
