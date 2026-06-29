import type {IBadgeImageWidget} from './IBadgeImageWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Badge image rendering widget.
 *
 * Renders a badge image (normal, group, or perk) from a badge identifier.
 * Supports group badge live-refresh via message events.
 *
 * In the AS3 version, uses IStaticBitmapWrapperWindow for rendering
 * and listens for GroupDetailsChangedMessageEvent / HabboGroupBadgesMessageEvent.
 * In the TypeScript port, badge data is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/BadgeImageWidget.as
 */
export class BadgeImageWidget implements IBadgeImageWidget
{
	public static readonly TYPE: string = 'badge_image';

	private static readonly TYPE_KEY: string = 'badge_image:type';
	private static readonly BADGE_ID_KEY: string = 'badge_image:badge_id';
	private _batchUpdate: boolean = false;

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _root: IWindowContainer | null = null;
	private _bitmap: IWindow | null = null;
	private _region: IWindow | null = null;
	private _onClickBound: Function;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
		this._onClickBound = this.onClick.bind(this);

		const root = this._windowManager.buildWidgetLayout('badge_image') as IWindowContainer;

		if (root)
		{
			this._root = root;
			this._bitmap = root.findChildByName('bitmap');
			this._region = root.findChildByName('region');

			if (this._region)
			{
				this._region.addEventListener(WindowMouseEvent.CLICK, this._onClickBound);
			}

			this._widgetWindow.rootWindow = root;
			root.width = this._widgetWindow.width;
			root.height = this._widgetWindow.height;
		}
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _type: string = 'normal';

	public get type(): string
	{
		return this._type;
	}

	public set type(value: string)
	{
		this._type = value;
	}

	private _badgeId: string = '';

	public get badgeId(): string
	{
		return this._badgeId;
	}

	public set badgeId(value: string)
	{
		this._badgeId = value;
	}

	private _groupId: number = 0;

	public get groupId(): number
	{
		return this._groupId;
	}

	public set groupId(value: number)
	{
		this._groupId = value;
	}

	/**
	 * Compute the asset URI for the current badge.
	 */
	public get assetUri(): string
	{
		if (!this._badgeId || this._badgeId.length === 0) return '';

		switch (this._type)
		{
			case 'normal':
				return '${image.library.url}album1584/' + this._badgeId + '.png';
			case 'group':
				return this._badgeId;
			case 'perk':
				return '${image.library.url}perk/' + this._badgeId + '.png';
			default:
				return '';
		}
	}

	public get properties(): PropertyStruct[]
	{
		if (this._disposed) return [];

		return [
			new PropertyStruct(BadgeImageWidget.TYPE_KEY, this._type),
			new PropertyStruct(BadgeImageWidget.BADGE_ID_KEY, this._badgeId),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		this._batchUpdate = true;

		for (const prop of values)
		{
			switch (prop.key)
			{
				case BadgeImageWidget.TYPE_KEY:
					this.type = String(prop.value);
					break;
				case BadgeImageWidget.BADGE_ID_KEY:
					this.badgeId = String(prop.value);
					break;
			}
		}

		if (this._bitmap)
		{
			this._bitmap.properties = values as unknown[];
		}

		this._batchUpdate = false;
		this.refresh();
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._groupId = 0;

		if (this._region)
		{
			this._region.removeEventListener(WindowMouseEvent.CLICK, this._onClickBound);
			this._region.dispose();
			this._region = null;
		}

		this._bitmap = null;

		if (this._root)
		{
			this._root.dispose();
			this._root = null;
		}

		if (this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
			this._widgetWindow = null;
		}

		this._windowManager = null;
		this._disposed = true;
	}

	/**
	 * Refresh the badge bitmap rendering.
	 *
	 * In AS3, sets assetUri on the IStaticBitmapWrapperWindow and invalidates.
	 * Stubbed for now — the UI layer handles badge rendering.
	 */
	private refresh(): void
	{
		if (this._batchUpdate) return;

		// TODO: set _bitmap.assetUri and invalidate (Flash rendering logic)
	}

	/**
	 * Handle click on the badge region.
	 *
	 * In AS3, sends GetHabboGroupDetailsMessageComposer if groupId > 0.
	 */
	private onClick(_event: WindowMouseEvent): void
	{
		// TODO: send GetHabboGroupDetailsMessageComposer if groupId > 0
	}
}
