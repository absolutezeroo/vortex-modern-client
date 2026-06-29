import type {IContext} from '@core/runtime';
import {ComponentDependency} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboLandingView} from '../IHabboLandingView';
import {AbstractView} from '../view/AbstractView';
import {WidgetContainerLayout} from './layout/WidgetContainerLayout';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {HabboToolbarEnum} from '@habbo/toolbar/HabboToolbarEnum';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('HabboLandingView');

/**
 * HabboLandingView
 *
 * The landing view is the first screen shown when entering the hotel.
 * It creates a WidgetContainerLayout that fills the background layer (0)
 * and sets the toolbar to hotel view state.
 *
 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as
 */
export class HabboLandingView extends AbstractView implements IHabboLandingView
{
	private _landingViewLayout: WidgetContainerLayout | null = null;
	private _roomSessionManager: IRoomSessionManager | null = null;
	private _toolbar: IHabboToolbar | null = null;
	private _initialized: boolean = false;

	constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, flags, assetLibrary);
	}

	private _communicationManager: IHabboCommunicationManager | null = null;

	/**
	 * The communication manager
	 */
	get communicationManager(): IHabboCommunicationManager | null
	{
		return this._communicationManager;
	}

	private _navigator: IHabboNavigator | null = null;

	/**
	 * The navigator
	 */
	get navigator(): IHabboNavigator | null
	{
		return this._navigator;
	}

	private _roomEngine: IRoomEngine | null = null;

	/**
	 * The room engine
	 */
	get roomEngine(): IRoomEngine | null
	{
		return this._roomEngine;
	}

	/**
	 * Whether the landing view is currently visible
	 */
	get isLandingViewVisible(): boolean
	{
		return this._landingViewLayout != null
			&& this._landingViewLayout.window != null
			&& this._landingViewLayout.window.visible;
	}

	/**
	 * Whether this is a new identity user
	 */
	get newIdentity(): boolean
	{
		return this.getInteger('new.identity', 0) > 0;
	}

	/**
	 * Left pane width for dynamic layout
	 */
	get dynamicLayoutLeftPaneWidth(): number
	{
		return this.getInteger('landing.view.dynamic.leftPaneWidth', 500);
	}

	/**
	 * Right pane width for dynamic layout
	 */
	get dynamicLayoutRightPaneWidth(): number
	{
		return this.getInteger('landing.view.dynamic.rightPaneWidth', 250);
	}

	/**
	 * The window manager
	 */
	get windowManager(): IHabboWindowManager | null
	{
		return this._windowManager;
	}

	/**
	 * The localization manager
	 */
	get localization(): IHabboLocalizationManager | null
	{
		return this._localizationManager;
	}

	/**
	 * The session data manager
	 */
	get sessionData(): ISessionDataManager | null
	{
		return this._sessionDataManager;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			...super.dependencies,
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communicationManager = manager;
				},
				false
			),
			new ComponentDependency(
				IID_RoomSessionManager,
				(manager: IRoomSessionManager | null) =>
				{
					this._roomSessionManager = manager;
				},
				false
			),
			new ComponentDependency(
				IID_HabboConfigurationManager,
				null,
				true
			),
			new ComponentDependency(
				IID_HabboToolbar,
				(toolbar: IHabboToolbar | null) =>
				{
					this._toolbar = toolbar;
				},
				true
			),
			new ComponentDependency(
				IID_HabboNavigator,
				(navigator: IHabboNavigator | null) =>
				{
					this._navigator = navigator;
				},
				false
			),
			new ComponentDependency(
				IID_RoomEngine,
				(engine: IRoomEngine | null) =>
				{
					this._roomEngine = engine;
				},
				false
			),
		];
	}

	/**
	 * Create the landing view layout and activate it.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as initialize()
	 */
	public initialize(): void
	{
		this._initialized = true;

		this._landingViewLayout = new WidgetContainerLayout(this);
		this.activate();
	}

	/**
	 * Activate the landing view.
	 *
	 * Sets the toolbar to hotel view state and activates the layout.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as activate()
	 */
	public activate(): void
	{
		if (!this._initialized)
		{
			this.tryInitialize();
		}

		if (this._toolbar)
		{
			this._toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW);
		}

		if (this._landingViewLayout != null)
		{
			this._landingViewLayout.activate();
		}
		else
		{
			log.error('Landing view layout is not initialized and cannot be activated');
		}
	}

	/**
	 * Disable the landing view (hide it).
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as disable()
	 */
	public disable(): void
	{
		if (this._landingViewLayout != null)
		{
			this._landingViewLayout.disable();
		}
	}

	/**
	 * Build a window from a registered widget layout.
	 *
	 * @param name - Layout name
	 * @param layer - Window context layer (0 = background, 1 = default)
	 * @returns The built window, or null
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as getXmlWindow()
	 */
	public getXmlWindow(name: string, layer: number = 1): IWindow | null
	{
		if (!this._windowManager)
		{
			log.error(`Cannot build window '${name}': window manager not available`);
			return null;
		}

		try
		{
			return this._windowManager.buildWidgetLayout(name, layer);
		}
		catch (e)
		{
			log.error(`Failed to build window '${name}':`, e);
			return null;
		}
	}

	/**
	 * Send a message composer via the communication manager.
	 *
	 * @param composer - The message composer to send
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as send()
	 */
	public send(composer: IMessageComposer<unknown[]>): void
	{
		if (this._communicationManager?.connection)
		{
			this._communicationManager.connection.send(composer);
		}
	}

	/**
	 * Dispose the landing view and all its resources.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as dispose()
	 */
	override dispose(): void
	{
		if (this._disposed) return;

		this._initialized = false;

		if (this._landingViewLayout)
		{
			this._landingViewLayout.dispose();
			this._landingViewLayout = null;
		}

		if (this._toolbar)
		{
			this._toolbar.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onToolbarClick);
		}

		this._communicationManager = null;
		this._roomSessionManager = null;
		this._toolbar = null;
		this._navigator = null;
		this._roomEngine = null;

		super.dispose();
	}

	/**
	 * Called when all required dependencies are resolved.
	 *
	 * Registers toolbar event listeners and triggers initialization.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as initComponent()
	 */
	protected override initComponent(): void
	{
		// Register toolbar click listener
		if (this._toolbar)
		{
			this._toolbar.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this.onToolbarClick);
		}

		// Initialize the landing view
		this.tryInitialize();
	}

	/**
	 * Initialize with error handling.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as tryInitialize()
	 */
	private tryInitialize(): void
	{
		try
		{
			this.initialize();
		}
		catch (e)
		{
			log.error('Landing view initialization failed:', e);

			if (this._landingViewLayout)
			{
				this._landingViewLayout.dispose();
				this._landingViewLayout = null;
			}
		}
	}

	/**
	 * Handle toolbar icon clicks.
	 *
	 * When the reception icon is clicked, quit the room and show the landing view.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/HabboLandingView.as onToolbarClick()
	 */
	private onToolbarClick = (event: HabboToolbarEvent): void =>
	{
		switch (event.iconId)
		{
			case 'HTIE_ICON_RECEPTION':
				if (this._roomSessionManager?.getSession(-1))
				{
					this._roomSessionManager.disposeSession(-1);
				}
				break;
		}
	};
}
