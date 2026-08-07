import type {ChooserItem} from '../chooser/ChooserItem';
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The contents of a chooser list, answering a `RWRWM_*_CHOOSER` request.
 *
 * The item array is **copied** on construction, so a later mutation of the handler's working list
 * cannot reach a view that already received it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetChooserContentEvent.as
 */
export class RoomWidgetChooserContentEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetChooserContentEvent.as::USER_CHOOSER_CONTENT
    public static readonly USER_CHOOSER_CONTENT: string = 'RWCCE_USER_CHOOSER_CONTENT';

    // AS3: .../widget/events/RoomWidgetChooserContentEvent.as::FURNI_CHOOSER_CONTENT
    public static readonly FURNI_CHOOSER_CONTENT: string = 'RWCCE_FURNI_CHOOSER_CONTENT';

    // AS3: .../widget/events/RoomWidgetChooserContentEvent.as::FURNI_CHOOSER_CONTENT_ADD
    public static readonly FURNI_CHOOSER_CONTENT_ADD: string = 'RWCCE_FURNI_CHOOSER_CONTENT_ADD';

    // AS3: .../widget/events/RoomWidgetChooserContentEvent.as::_items
    private _items: ChooserItem[];

    // AS3: .../widget/events/RoomWidgetChooserContentEvent.as::_isAnyRoomController
    private _isAnyRoomController: boolean;

    // AS3: .../widget/events/RoomWidgetChooserContentEvent.as::RoomWidgetChooserContentEvent()
    constructor(type: string, items: ChooserItem[], isAnyRoomController: boolean = false)
    {
        super(type);

        this._items = items.slice();
        this._isAnyRoomController = isAnyRoomController;
    }

    // AS3: .../widget/events/RoomWidgetChooserContentEvent.as::get items()
    get items(): ChooserItem[]
    {
        return this._items;
    }

    // AS3: .../widget/events/RoomWidgetChooserContentEvent.as::get isAnyRoomController()
    get isAnyRoomController(): boolean
    {
        return this._isAnyRoomController;
    }
}
