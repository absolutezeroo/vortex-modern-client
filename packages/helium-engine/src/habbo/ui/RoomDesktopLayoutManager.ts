/**
 * RoomDesktopLayoutManager
 *
 * @see sources/win63_version/habbo/ui/class_3019.as
 * @see sources/win63_2023_version/com/sulake/habbo/ui/DesktopLayoutManager.as (clean
 *      cross-reference — win63_version's setLayout()/getWidgetContainer() are corrupted
 *      by decompiler artifacts: a `null.`-ref infinite loop and a dropped final
 *      return statement respectively)
 *
 * Manages the window layout for a room desktop. Builds the layout window tree
 * from JSON and provides access to named containers for widget placement.
 */
import {Logger} from '@core/utils/Logger';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowParam} from '@core/window/enum/WindowParam';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';

const log = Logger.getLogger('RoomDesktopLayoutManager');

const ROOM_VIEW = 'room_view';
const ROOM_NEW_CHAT = 'room_new_chat';
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
	 * @param _config - Configuration manager (unused for now, matches AS3 signature)
	 */
	// AS3: sources/win63_2023_version/com/sulake/habbo/ui/DesktopLayoutManager.as::setLayout()
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

		const infostandContainer = this._layoutContainer.findChildByTag('room_widget_infostand');

		if(infostandContainer)
		{
			infostandContainer.y -= BOTTOM_MARGIN;
		}

		for(let i = 0; i < this._layoutContainer.numChildren; i++)
		{
			const child = this._layoutContainer.getChildAt(i);

			if(child && child.testParamFlag(WindowParam.ON_ACCOMMODATE_ALIGN_BOTTOM))
			{
				child.addEventListener(WindowEvent.WE_CHILD_RESIZED, this.trimContainer);
			}
		}

		log.debug(`Layout built: ${layoutName}`);
	}

	/**
	 * Shrink-wraps a single-child widget slot container to match its child's
	 * size whenever that child resizes.
	 */
	// AS3: sources/win63_2023_version/com/sulake/habbo/ui/DesktopLayoutManager.as::trimContainer()
	private trimContainer = (event: WindowEvent): void =>
	{
		const window = event.window as IWindowContainer | null;

		if(!window) return;

		if(window.numChildren !== 1) return;

		const child = window.getChildAt(0);

		if(!child) return;

		window.width = child.width;
		window.height = child.height;
	};

	/**
	 * Gets the widget container for a given widget name.
	 */
	// AS3: sources/win63_2023_version/com/sulake/habbo/ui/DesktopLayoutManager.as::getWidgetContainer()
	private getWidgetContainer(name: string, window: IWindow): IWindowContainer | null
	{
		if(!this._layoutContainer || !window) return null;

		if(name === 'RWE_HIGH_SCORE_DISPLAY' || name === 'RWE_WORD_QUIZZ')
		{
			return this._layoutContainer.getChildByTag('background_widgets') as IWindowContainer | null;
		}

		if(name === 'RWE_CHAT_INPUT_WIDGET')
		{
			return window.desktop as IWindowContainer | null;
		}

		let tag: string | null = null;

		for(const t of window.tags)
		{
			if(t.indexOf('room_widget') === 0)
			{
				tag = t;

				break;
			}
		}

		if(!tag) return null;

		return this._layoutContainer.getChildByTag(tag) as IWindowContainer | null;
	}

	/**
	 * Adds a widget window to the appropriate container in the layout.
	 */
	// AS3: sources/win63_2023_version/com/sulake/habbo/ui/DesktopLayoutManager.as::addWidgetWindow()
	public addWidgetWindow(name: string, window: IWindow): boolean
	{
		if(!window) return false;

		const container = this.getWidgetContainer(name, window);

		if(!container)
		{
			log.warn(`No container found for widget: ${name}`);

			return false;
		}

		if(name === 'RWE_CHAT_INPUT_WIDGET')
		{
			container.addChild(window);

			return true;
		}

		window.x = 0;
		window.y = 0;
		container.addChild(window);
		container.width = window.width;
		container.height = window.height;

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
