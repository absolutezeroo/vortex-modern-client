/**
 * RoomWidgetShowPlaceholderEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetShowPlaceholderEvent.as
 *
 * Carries nothing beyond its type — the placeholder window has no per-object state, so the widget
 * only needs to know that *some* placeholder furni was used.
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetShowPlaceholderEvent extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetShowPlaceholderEvent.as::SHOW_PLACEHOLDER
    public static readonly SHOW_PLACEHOLDER: string = 'RWSPE_SHOW_PLACEHOLDER';

    /**
     * AS3's trailing `bubbles`/`cancelable` Event parameters are dropped, as in the other ported
     * update events: this port dispatches through an EventEmitter, which has no capture phase.
     */
    // AS3: RoomWidgetShowPlaceholderEvent.as::RoomWidgetShowPlaceholderEvent()
    constructor(type: string)
    {
        super(type);
    }
}
