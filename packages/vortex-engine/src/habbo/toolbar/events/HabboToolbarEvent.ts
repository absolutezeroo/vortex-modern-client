/**
 * Toolbar event for click and resize actions
 *
 * Dispatched when toolbar icons are clicked or the toolbar is resized.
 * Carries iconId and iconName properties to identify which icon was interacted with.
 *
 * @see source_as_win63/habbo/toolbar/events/HabboToolbarEvent.as
 */
export class HabboToolbarEvent
{
    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::TOOLBAR_CLICK
    public static readonly TOOLBAR_CLICK: string = 'HTE_TOOLBAR_CLICK';

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::GROUP_ROOM_INFO_CLICK
    public static readonly GROUP_ROOM_INFO_CLICK: string = 'HTE_GROUP_ROOM_INFO_CLICK';

    public static readonly ICON_ZOOM: string = 'HTIE_ICON_ZOOM';

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::RESIZED
    public static readonly RESIZED: string = 'HTE_RESIZED';

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::CAMERA_TOGGLE
    public static readonly CAMERA_TOGGLE: string = 'HTE_ICON_CAMERA';

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::CAMERA_LAUNCH_ORIGIN_ROOM_TOOL
    public static readonly CAMERA_LAUNCH_ORIGIN_ROOM_TOOL: string = 'roomToolsMenu';

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::CAMERA_LAUNCH_ORIGIN_CHAT
    public static readonly CAMERA_LAUNCH_ORIGIN_CHAT: string = 'chatCameraCommand';

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::CAMERA_LAUNCH_ORIGIN_EIW_MAKE_OWN
    public static readonly CAMERA_LAUNCH_ORIGIN_EIW_MAKE_OWN: string = 'imageWidgetMakeOwn';

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::CAMERA_LAUNCH_ORIGIN_TOOLBAR
    public static readonly CAMERA_LAUNCH_ORIGIN_TOOLBAR: string = 'toolBarCameraIcon';

    constructor(type: string)
    {
        this._type = type;
    }

    private _type: string;

    /**
	 * The event type
	 */
    get type(): string
    {
        return this._type;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::_iconId
    private _iconId: string = '';

    /**
	 * The icon identifier that was clicked
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::get iconId()
    get iconId(): string
    {
        return this._iconId;
    }

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::set iconId()
    set iconId(value: string)
    {
        this._iconId = value;
    }

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::_iconName
    private _iconName: string = '';

    /**
	 * The human-readable icon name
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::get iconName()
    get iconName(): string
    {
        return this._iconName;
    }

    // AS3: .../src/com/sulake/habbo/toolbar/events/HabboToolbarEvent.as::set iconName()
    set iconName(value: string)
    {
        this._iconName = value;
    }
}
