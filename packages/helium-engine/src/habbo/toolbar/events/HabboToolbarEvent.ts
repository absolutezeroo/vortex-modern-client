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
	public static readonly TOOLBAR_CLICK: string = 'HTE_TOOLBAR_CLICK';

	public static readonly GROUP_ROOM_INFO_CLICK: string = 'HTE_GROUP_ROOM_INFO_CLICK';

	public static readonly ICON_ZOOM: string = 'HTIE_ICON_ZOOM';

	public static readonly RESIZED: string = 'HTE_RESIZED';

	public static readonly CAMERA_TOGGLE: string = 'HTE_ICON_CAMERA';

	public static readonly CAMERA_LAUNCH_ORIGIN_ROOM_TOOL: string = 'roomToolsMenu';

	public static readonly CAMERA_LAUNCH_ORIGIN_CHAT: string = 'chatCameraCommand';

	public static readonly CAMERA_LAUNCH_ORIGIN_EIW_MAKE_OWN: string = 'imageWidgetMakeOwn';

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

	private _iconId: string = '';

	/**
	 * The icon identifier that was clicked
	 */
	get iconId(): string
	{
		return this._iconId;
	}

	set iconId(value: string)
	{
		this._iconId = value;
	}

	private _iconName: string = '';

	/**
	 * The human-readable icon name
	 */
	get iconName(): string
	{
		return this._iconName;
	}

	set iconName(value: string)
	{
		this._iconName = value;
	}
}
