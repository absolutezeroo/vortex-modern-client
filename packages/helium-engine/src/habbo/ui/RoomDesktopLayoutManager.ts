/**
 * RoomDesktopLayoutManager
 *
 * @see sources/source_as_win63/habbo/ui/class_3604.as
 *
 * Manages the window layout for a room desktop. Builds the layout window tree
 * from JSON and provides access to named containers for widget placement.
 */
import {Logger} from '@core/utils/Logger';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';

const log = Logger.getLogger('RoomDesktopLayoutManager');

const ROOM_VIEW = 'room_view';
const ROOM_NEW_CHAT = 'room_new_chat';
const ROOM_WIDGET = 'room_widget';
const BOTTOM_MARGIN = 47;

export class RoomDesktopLayoutManager
{
	private _layoutContainer: IWindowContainer | null = null;

	constructor()
	{
	}

	/**
	 * Builds the layout window tree from a JSON layout via the window manager.
	 *
	 * @param layoutName - The registered layout asset name (e.g. "room_desktop_layout")
	 * @param windowManager - The window manager to build the layout with
	 * @param config - Configuration manager (unused for now, matches AS3 signature)
	 */
	public setLayout(layoutName: string, windowManager: IHabboWindowManager, _config: IHabboConfigurationManager | null): void
	{
		if(this._layoutContainer)
		{
			this._layoutContainer.dispose();
			this._layoutContainer = null;
		}

		const root = windowManager.buildWidgetLayout(layoutName, 0);

		if(!root)
		{
			log.warn(`Failed to build layout: ${layoutName}`);

			return;
		}

		this._layoutContainer = root as IWindowContainer;

		const desktop = this._layoutContainer.desktop;
		if(desktop)
		{
			this._layoutContainer.width = desktop.width;
			this._layoutContainer.height = desktop.height;
		}

		// AS3: sources/win63_version/habbo/ui/class_3019.as::setLayout()
		// _layoutContainer.findChildByTag("room_widget_infostand").y -= 47
		const infostandContainer = this._layoutContainer.findChildByTag('room_widget_infostand');

		if(infostandContainer)
		{
			infostandContainer.y -= BOTTOM_MARGIN;
		}

		log.debug(`Layout built: ${layoutName}`);
	}

	/**
	 * Gets the widget container for a given widget name.
	 * Maps widget names to container tags in the layout.
	 */
	private getWidgetContainer(name: string, _window: IWindow): IWindowContainer | null
	{
		if(!this._layoutContainer) return null;

		// Map widget names to layout tags
		let tag: string;

		if(name.indexOf('chat') >= 0 || name === ROOM_NEW_CHAT)
		{
			tag = 'room_widget_chat';
		}
		else if(name.indexOf('infostand') >= 0)
		{
			tag = 'room_widget_infostand';
		}
		else if(name.indexOf('toolbar') >= 0)
		{
			tag = 'room_widget_toolbar';
		}
		else if(name.indexOf('me_menu') >= 0)
		{
			tag = 'room_widget_me_menu';
		}
		else if(name.indexOf('doorbell') >= 0)
		{
			tag = 'room_widget_doorbell';
		}
		else
		{
			tag = ROOM_WIDGET;
		}

		const container = this._layoutContainer.findChildByTag(tag) as IWindowContainer | null;

		if(!container)
		{
			// Fall back to the background_widgets container
			return this._layoutContainer.findChildByTag('background_widgets') as IWindowContainer | null;
		}

		return container;
	}

	/**
	 * Adds a widget window to the appropriate container in the layout.
	 */
	public addWidgetWindow(name: string, window: IWindow): boolean
	{
		const container = this.getWidgetContainer(name, window);

		if(!container)
		{
			log.warn(`No container found for widget: ${name}`);

			return false;
		}

		container.addChild(window);

		return true;
	}

	/**
	 * Removes a widget window from its container.
	 */
	public removeWidgetWindow(name: string, window: IWindow): void
	{
		const container = this.getWidgetContainer(name, window);

		if(container)
		{
			container.removeChild(window);
		}
	}

	/**
	 * Adds a room view window to the room_view container.
	 */
	public addRoomView(window: IWindow): boolean
	{
		if(!this._layoutContainer) return false;

		const roomViewContainer = this._layoutContainer.findChildByTag(ROOM_VIEW) as IWindowContainer | null;

		if(!roomViewContainer)
		{
			log.warn('No room_view container in layout');

			return false;
		}

		roomViewContainer.addChild(window);

		return true;
	}

	/**
	 * Gets the room view window (the first child of the room_view container).
	 */
	public getRoomView(): IWindow | null
	{
		if(!this._layoutContainer) return null;

		const roomViewContainer = this._layoutContainer.findChildByTag(ROOM_VIEW) as IWindowContainer | null;

		if(!roomViewContainer || roomViewContainer.numChildren === 0) return null;

		return roomViewContainer.getChildAt(0);
	}

	/**
	 * Gets the rectangle of the room view area.
	 */
	public get roomViewRect(): { x: number; y: number; width: number; height: number } | null
	{
		if(!this._layoutContainer) return null;

		const roomViewContainer = this._layoutContainer.findChildByTag(ROOM_VIEW);

		if(!roomViewContainer) return null;

		// AS3: sources/win63_version/habbo/ui/class_3019.as::roomViewRect
		// Returns the room_view rectangle as-is. BOTTOM_MARGIN is not subtracted
		// from the canvas height in AS3; using it here shrinks the render/culling
		// viewport and makes the room disappear while panning.
		return {
			x: roomViewContainer.x + this._layoutContainer.x,
			y: roomViewContainer.y + this._layoutContainer.y,
			width: roomViewContainer.width,
			height: roomViewContainer.height
		};
	}

	/**
	 * Gets the chat container window.
	 */
	public getChatContainer(): IWindowContainer | null
	{
		if(!this._layoutContainer) return null;

		return this._layoutContainer.findChildByTag(ROOM_NEW_CHAT) as IWindowContainer | null;
	}

	/**
	 * Gets the layout container.
	 */
	public get layoutContainer(): IWindowContainer | null
	{
		return this._layoutContainer;
	}

	public dispose(): void
	{
		if(this._layoutContainer)
		{
			this._layoutContainer.dispose();
			this._layoutContainer = null;
		}
	}
}
