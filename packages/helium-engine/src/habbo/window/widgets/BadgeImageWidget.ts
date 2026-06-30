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
	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::TYPE
	public static readonly TYPE: string = 'badge_image';

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::TYPE_KEY
	private static readonly TYPE_KEY: string = 'badge_image:type';
	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::BADGE_ID_KEY
	private static readonly BADGE_ID_KEY: string = 'badge_image:badge_id';
	// TS-only: batch-update guard to avoid redundant refresh() calls during set properties
	private _batchUpdate: boolean = false;

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_widgetWindow
	private _widgetWindow: IWidgetWindow | null = null;
	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_windowManager
	private _windowManager: IHabboWindowManager | null = null;
	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_root
	private _root: IWindowContainer | null = null;
	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_bitmap (IStaticBitmapWrapperWindow in AS3)
	private _bitmap: IWindow | null = null;
	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_region
	private _region: IWindow | null = null;
	// TS-only: bound event handler ref for removeEventListener
	private _onClickBound: Function;

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::BadgeImageWidget()
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

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_disposed
	private _disposed: boolean = false;

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get disposed()
	public get disposed(): boolean
	{
		return this._disposed;
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_type
	private _type: string = 'normal';

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get type()
	public get type(): string
	{
		return this._type;
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::set type()
	public set type(value: string)
	{
		this._type = value;
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_badgeId
	private _badgeId: string = '';

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get badgeId()
	public get badgeId(): string
	{
		return this._badgeId;
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::set badgeId()
	public set badgeId(value: string)
	{
		this._badgeId = value;
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_groupId
	private _groupId: number = 0;

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get groupId()
	public get groupId(): number
	{
		return this._groupId;
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::set groupId()
	// TODO(AS3): register/unregister GroupDetailsChangedMessageEvent + HabboGroupBadgesMessageEvent
	// sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::set groupId()
	public set groupId(value: number)
	{
		this._groupId = value;
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get assetUri()
	public get assetUri(): string
	{
		if (!this._badgeId || this._badgeId.length === 0) return '';

		switch (this._type)
		{
			case 'normal':
				return '${image.library.url}album1584/' + this._badgeId + '.png';
			case 'group':
				// AS3: _windowManager.getProperty("group.badge.url").replace("%imagerdata%", _badgeId)
				// TODO(AS3): resolve group badge URL via windowManager configuration property
				// sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get assetUri()
				return this._badgeId;
			case 'perk':
				return '${image.library.url}perk/' + this._badgeId + '.png';
			default:
				return '';
		}
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get properties()
	public get properties(): PropertyStruct[]
	{
		if (this._disposed) return [];

		return [
			new PropertyStruct(BadgeImageWidget.TYPE_KEY, this._type),
			new PropertyStruct(BadgeImageWidget.BADGE_ID_KEY, this._badgeId),
		];
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::set properties()
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

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::dispose()
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

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::refresh()
	private refresh(): void
	{
		if (this._batchUpdate) return;

		// TODO(AS3): _bitmap.assetUri = assetUri; _bitmap.blend = _widgetWindow.blend; _bitmap.invalidate()
		// sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::refresh()
	}

	// AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::onClick()
	private onClick(_event: WindowMouseEvent): void
	{
		// TODO(AS3): send GetHabboGroupDetailsMessageComposer if groupId > 0
		// sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::onClick()
	}
}
