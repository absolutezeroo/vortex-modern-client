import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * A toolbar icon was clicked, relayed into the widget layer so the me-menu can toggle itself.
 *
 * The type is fixed at `REQUEST_ME_MENU_TOOLBAR_CLICKED` whatever the icon — `iconType` is what
 * actually says which one, and the me-menu is the only listener, so a room-info click reaches it
 * too and is distinguished only by that field.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetToolbarClickedUpdateEvent.as
 */
export class RoomWidgetToolbarClickedUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetToolbarClickedUpdateEvent.as::REQUEST_ME_MENU_TOOLBAR_CLICKED_EVENT
    public static readonly REQUEST_ME_MENU_TOOLBAR_CLICKED_EVENT: string =
        'RWUE_REQUEST_ME_MENU_TOOLBAR_CLICKED';

    // AS3: .../widget/events/RoomWidgetToolbarClickedUpdateEvent.as::ICON_TYPE_ME_MENU
    public static readonly ICON_TYPE_ME_MENU: string = 'ICON_TYPE_ME_MENU';

    // AS3: .../widget/events/RoomWidgetToolbarClickedUpdateEvent.as::ICON_TYPE_ROOM_INFO
    public static readonly ICON_TYPE_ROOM_INFO: string = 'ICON_TYPE_ROOM_INFO';

    // AS3: .../widget/events/RoomWidgetToolbarClickedUpdateEvent.as::_iconType
    // Name DERIVED (`_SafeStr_9612`): the field behind `get iconType()`.
    private _iconType: string;

    // AS3: .../widget/events/RoomWidgetToolbarClickedUpdateEvent.as::_active
    private _active: boolean = false;

    // AS3: .../widget/events/RoomWidgetToolbarClickedUpdateEvent.as::RoomWidgetToolbarClickedUpdateEvent()
    // The type is fixed; the icon is a parameter. The two Flash Event flags are dropped.
    constructor(iconType: string, active: boolean = false)
    {
        super(RoomWidgetToolbarClickedUpdateEvent.REQUEST_ME_MENU_TOOLBAR_CLICKED_EVENT);

        this._iconType = iconType;
        this._active = active;
    }

    // AS3: .../widget/events/RoomWidgetToolbarClickedUpdateEvent.as::get active()
    public get active(): boolean
    {
        return this._active;
    }

    // AS3: .../widget/events/RoomWidgetToolbarClickedUpdateEvent.as::get iconType()
    public get iconType(): string
    {
        return this._iconType;
    }
}
