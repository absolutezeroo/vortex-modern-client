import {EventEmitter} from 'eventemitter3';
import {Component, ComponentDependency, type IContext,} from '@core/runtime';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboInventory} from '@iid/IIDHabboInventory';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import type {IHabboToolbar} from './IHabboToolbar';
import type {IExtensionView} from './IExtensionView';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {IHabboInventory} from '../inventory/IHabboInventory';
import type {IHabboLocalizationManager} from '../localization/IHabboLocalizationManager';
import type {IHabboCatalog} from '../catalog/IHabboCatalog';
import type {IHabboConfigurationManager} from '../configuration/IHabboConfigurationManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {BottomBarLeft} from './BottomBarLeft';
import {ExtensionView} from './ExtensionView';
import {HabboToolbarEvent} from './events/HabboToolbarEvent';
import {HabboToolbarEnum} from './HabboToolbarEnum';
import {HabboToolbarIconEnum} from './HabboToolbarIconEnum';
import {PurseAreaExtension} from './extensions/PurseAreaExtension';
import {SeasonalCurrencyIndicator} from './extensions/purse/indicators/SeasonalCurrencyIndicator';
import {EventLogMessageComposer} from '../communication/messages/outgoing/tracking/EventLogMessageComposer';
import {PurseEvent} from '../catalog/purse/PurseEvent';
import type {Motion} from '@core/window/motion/Motion';
import {Logger} from '@core/utils/Logger';
import {IID_HabboConfigurationManager} from "@iid/IIDHabboConfigurationManager";
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IID_AvatarRenderManager} from "@iid/IIDAvatarRenderManager";
import type {IAvatarRenderManager} from '../avatar/IAvatarRenderManager';

const log = Logger.getLogger('HabboToolbar');

/**
 * Events emitted by HabboToolbar via toolbarEvents
 */
export interface HabboToolbarEvents
{
	[HabboToolbarEvent.TOOLBAR_CLICK]: (event: HabboToolbarEvent) => void;
	[HabboToolbarEvent.RESIZED]: (event: HabboToolbarEvent) => void;
	[HabboToolbarEvent.CAMERA_TOGGLE]: (event: HabboToolbarEvent) => void;
	[HabboToolbarEvent.GROUP_ROOM_INFO_CLICK]: (event: HabboToolbarEvent) => void;
}

/**
 * Main Habbo Toolbar Component
 *
 * Manages the toolbar UI state, icon interactions, and extension panels.
 * Extends Component for dependency injection lifecycle.
 *
 * IMPORTANT: Uses `_toolbarEvents` / `toolbarEvents` for custom events
 * rather than overriding the `events` getter from Component (see MEMORY.md).
 *
 * @see source_as_win63/habbo/toolbar/HabboToolbar.as
 */
export class HabboToolbar extends Component implements IHabboToolbar
{
	private _communication: IHabboCommunicationManager | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _roomSessionManager: IRoomSessionManager | null = null;
	private _messageEvents: IMessageEvent[] = [];
	private _extensionsInitialized: boolean = false;
	private _inventory: IHabboInventory | null = null;
	private _catalog: IHabboCatalog | null = null;
	private _localization: IHabboLocalizationManager | null = null;
	private _configuration: IHabboConfigurationManager | null = null;
	private _extensionView: ExtensionView | null = null;
	private _purseAreaExtension: PurseAreaExtension | null = null;
	private _seasonalCurrencyIndicator: SeasonalCurrencyIndicator | null = null;

	constructor(context: IContext)
	{
		super(context);
	}

	private _avatarRenderManager: IAvatarRenderManager | null = null;

	/**
	 * The avatar render manager
	 *
	 * @see sources/win63_version/habbo/toolbar/HabboToolbar.as avatarRenderManager
	 */
	get avatarRenderManager(): IAvatarRenderManager | null
	{
		return this._avatarRenderManager;
	}

	private _sessionDataManager: ISessionDataManager | null = null;

	/**
	 * The session data manager
	 */
	get sessionDataManager(): ISessionDataManager | null
	{
		return this._sessionDataManager;
	}

	private _toolbarEvents: EventEmitter = new EventEmitter();

	/**
	 * Custom toolbar event emitter (NOT the Component events)
	 *
	 * Uses a separate EventEmitter to avoid overriding Component.events
	 * which would break the dependency injection unlock mechanism.
	 */
	get toolbarEvents(): EventEmitter
	{
		return this._toolbarEvents;
	}

	private _currentState: string = HabboToolbarEnum.TOOLBAR_STATE_HIDDEN;

	/**
	 * The current toolbar state
	 */
	get currentState(): string
	{
		return this._currentState;
	}

	private _onDuty: boolean = false;

	/**
	 * Whether the user is on duty (moderation)
	 */
	get onDuty(): boolean
	{
		return this._onDuty;
	}

	set onDuty(value: boolean)
	{
		this._onDuty = value;

		if (this.bottomBarLeft)
		{
			this.bottomBarLeft.onDuty = value;
		}
	}

	/**
	 * The extension view container for toolbar extensions
	 *
	 * In the AS3 version this was an ExtensionView (Flash window container).
	 * In Helium, extensions are handled by the SolidJS UI layer.
	 * This returns null as the UI layer manages the extension view.
	 */
	get extensionView(): IExtensionView | null
	{
		if(!this._extensionView)
		{
			if(!this._windowManager) return null;

			this._extensionView = new ExtensionView(this._windowManager, this);
		}

		return this._extensionView;
	}

	get windowManager(): IHabboWindowManager | null
	{
		return this._windowManager;
	}

	get inventory(): IHabboInventory | null
	{
		return this._inventory;
	}

	get catalog(): IHabboCatalog | null
	{
		return this._catalog;
	}

	get localization(): IHabboLocalizationManager | null
	{
		return this._localization;
	}

	get configuration(): IHabboConfigurationManager | null
	{
		return this._configuration;
	}

	/**
	 * The width of the toolbar area
	 *
	 * Delegates to BottomBarLeft.getToolbarAreaWidth() which returns
	 * the line separator position or collapsed margin.
	 *
	 * @see sources/win63_version/habbo/toolbar/HabboToolbar.as get toolBarAreaWidth()
	 */
	get toolBarAreaWidth(): number
	{
		if (this.bottomBarLeft)
		{
			return this.bottomBarLeft.getToolbarAreaWidth();
		}

		return 0;
	}

	/**
	 * The communication manager
	 */
	get communicationManager(): IHabboCommunicationManager | null
	{
		return this._communication;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboConfigurationManager,
				(manager: IHabboConfigurationManager | null) =>
				{
					this._configuration = manager;
				},
				true,
				[{
					type: 'complete',
					callback: this.onConfigurationComplete.bind(this)
				}]
			),
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboWindowManager,
				(manager: IHabboWindowManager | null) =>
				{
					this._windowManager = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboInventory,
				(manager: IHabboInventory | null) =>
				{
					this._inventory = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboLocalizationManager,
				(manager: IHabboLocalizationManager | null) =>
				{
					this._localization = manager;
				},
				false
			),
			new ComponentDependency(
				IID_HabboCatalog,
				(manager: IHabboCatalog | null) =>
				{
					this._catalog = manager;
				},
				true
			),
			new ComponentDependency(
				IID_SessionDataManager,
				(manager: ISessionDataManager | null) =>
				{
					this._sessionDataManager = manager;
				},
				true,
				[{
					type: 'PUE_perks_updated',
					callback: this.onPerksUpdated.bind(this)
				}]
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
				IID_AvatarRenderManager,
				(manager: IAvatarRenderManager | null) =>
				{
					this._avatarRenderManager = manager;
				},
				false
			),
		];
	}

	private _bottomBarLeft: BottomBarLeft | null = null;

	/**
	 * Lazy accessor for the BottomBarLeft view.
	 *
	 * Creates the view on first access. This defers construction until
	 * after the client has registered window layouts (which happens after
	 * bootstrap). In AS3, layouts were embedded in the SWF and available
	 * immediately during initComponent().
	 */
	private get bottomBarLeft(): BottomBarLeft | null
	{
		if (!this._bottomBarLeft && this._windowManager)
		{
			try
			{
				this._bottomBarLeft = new BottomBarLeft(this, this._windowManager);

				if (this._bottomBarLeft.window)
				{
					this._bottomBarLeft.window.visible = false;
				}

				log.info('BottomBarLeft created successfully');
			}
			catch (error)
			{
				log.warn('Failed to create BottomBarLeft:', error);
			}
		}

		return this._bottomBarLeft;
	}

	/**
	 * Set the toolbar state (hotel view, room view, hidden, etc.)
	 *
	 * @param state One of HabboToolbarEnum state constants
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as setToolbarState()
	 */
	setToolbarState(state: string): void
	{
		this._currentState = state;

		switch (state)
		{
			case HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW:
			case HabboToolbarEnum.TOOLBAR_STATE_GAME_CENTER_VIEW:
			case HabboToolbarEnum.TOOLBAR_STATE_ROOM_VIEW:
				// Extensions visible in hotel, game center, and room views
				break;
			case HabboToolbarEnum.TOOLBAR_STATE_HIDDEN:
				// Extensions hidden
				break;
		}

		// Delegate to BottomBarLeft for window state + visibility
		if (this.bottomBarLeft)
		{
			this.bottomBarLeft.setToolbarState(state);

			if (this.bottomBarLeft.window)
			{
				this.bottomBarLeft.window.visible = true;
			}
		}

		// Dispatch resized event
		const resizedEvent = new HabboToolbarEvent(HabboToolbarEvent.RESIZED);
		this._toolbarEvents.emit(HabboToolbarEvent.RESIZED, resizedEvent);

		log.debug(`Toolbar state set to: ${state}`);
	}

	/**
	 * Toggle the visibility of a window by icon name
	 *
	 * Dispatches the appropriate toolbar event when an icon is clicked.
	 * Also sends an event log to the server for tracking.
	 *
	 * @param iconName Icon name to toggle
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as toggleWindowVisibility()
	 */
	toggleWindowVisibility(iconName: string): void
	{
		const iconId = (HabboToolbarIconEnum as unknown as Record<string, string>)[iconName];

		if (iconId === HabboToolbarIconEnum.CAMERA)
		{
			const cameraEvent = new HabboToolbarEvent(HabboToolbarEvent.CAMERA_TOGGLE);
			cameraEvent.iconName = HabboToolbarEvent.CAMERA_LAUNCH_ORIGIN_TOOLBAR;

			this._toolbarEvents.emit(HabboToolbarEvent.CAMERA_TOGGLE, cameraEvent);
		}
		else
		{
			const clickEvent = new HabboToolbarEvent(HabboToolbarEvent.TOOLBAR_CLICK);
			clickEvent.iconId = iconId;
			clickEvent.iconName = iconName;
			this._toolbarEvents.emit(HabboToolbarEvent.TOOLBAR_CLICK, clickEvent);
		}

		// Send tracking event
		if (this._communication?.connection)
		{
			const composer = new EventLogMessageComposer('Toolbar', iconName, 'client.toolbar.clicked');
			this._communication.connection.send(composer);
		}
	}

	/**
	 * Get the screen location of a toolbar icon
	 *
	 * Delegates to BottomBarLeft.getIconLocation() which finds the child
	 * window by name and returns its global rectangle.
	 *
	 * @param iconId Icon identifier
	 * @returns Rectangle or null if not found
	 * @see sources/win63_version/habbo/toolbar/HabboToolbar.as getIconLocation()
	 */
	getIconLocation(iconId: string): { x: number; y: number; width: number; height: number } | null
	{
		if (this.bottomBarLeft)
		{
			return this.bottomBarLeft.getIconLocation(iconId);
		}

		return null;
	}

	/**
	 * Set bitmap data for a toolbar icon
	 *
	 * In AS3, this set a BitmapData on the toolbar view icon.
	 * In Helium, icon rendering is handled by the SolidJS UI layer.
	 *
	 * @param _iconId Icon identifier
	 * @param _bitmap Bitmap data
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as setIconBitmap()
	 */
	setIconBitmap(iconId: string, bitmap: unknown): void
	{
		if (this._bottomBarLeft && (bitmap === null || bitmap instanceof ImageBitmap))
		{
			this._bottomBarLeft.setIconBitmap(iconId, bitmap);
		}
	}

	/**
	 * Animate a bitmap from a source position to a toolbar icon.
	 *
	 * Creates a temporary floating bitmap that flies from (startX, startY) to
	 * the target icon with a jump arc, then bounces the icon on arrival.
	 * Used when purchasing catalog items (fly to inventory) or picking up furni.
	 *
	 * @param iconId Target icon identifier (e.g. 'HTIE_ICON_INVENTORY')
	 * @param bitmap The bitmap to animate (ownership is transferred)
	 * @param startX Source X position in global coordinates
	 * @param startY Source Y position in global coordinates
	 * @returns The fly motion, or null if the icon was not found
	 * @see sources/win63_version/habbo/toolbar/HabboToolbar.as createTransitionToIcon()
	 */
	createTransitionToIcon(iconId: string, bitmap: ImageBitmap | null, startX: number, startY: number): Motion | null
	{
		if (this._bottomBarLeft && !this._bottomBarLeft.disposed)
		{
			return this._bottomBarLeft.animateToIcon(iconId, bitmap, startX, startY);
		}

		// No toolbar view — dispose the bitmap to avoid leaks
		if (bitmap)
		{
			bitmap.close();
		}

		return null;
	}

	/**
	 * Get the bounding rectangle of the toolbar
	 *
	 * Returns the BottomBarLeft window's rectangle.
	 *
	 * @returns The toolbar rectangle
	 * @see sources/win63_version/habbo/toolbar/HabboToolbar.as getRect()
	 */
	getRect(): { x: number; y: number; width: number; height: number }
	{
		if (this.bottomBarLeft?.window)
		{
			return this.bottomBarLeft.window.rectangle;
		}

		return {x: 0, y: 0, width: 0, height: 0};
	}

	/**
	 * Set the visibility of a toolbar icon
	 *
	 * Delegates to BottomBarLeft.iconVisibility() which finds the child
	 * window by name and sets its visible property.
	 *
	 * @param iconId Icon identifier (the toolbar icon name, not the HTIE_ constant)
	 * @param visible Whether the icon should be visible
	 * @see sources/win63_version/habbo/toolbar/HabboToolbar.as setIconVisibility()
	 */
	setIconVisibility(iconId: string, visible: boolean): void
	{
		if (this.bottomBarLeft)
		{
			this.bottomBarLeft.iconVisibility(iconId, visible);
		}
	}

	/**
	 * Check if this is a new identity user
	 *
	 * @returns True if new.identity config value is greater than 0
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as isNewIdentity()
	 */
	isNewIdentity(): boolean
	{
		return this.getInteger('new.identity', 0) > 0;
	}

	/**
	 * Check if Xmas features are enabled
	 *
	 * @returns True if xmas11.enabled config is true
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as isXmasEnabled()
	 */
	isXmasEnabled(): boolean
	{
		return this.getBoolean('xmas11.enabled');
	}

	/**
	 * Check if Valentines features are enabled
	 *
	 * @returns True if valentines.enabled config is true
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as isValentinesEnabled()
	 */
	isValentinesEnabled(): boolean
	{
		return this.getBoolean('valentines.enabled');
	}

	/**
	 * Dispose of this component
	 *
	 * Cleans up all message event handlers, extensions, and timers.
	 *
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as dispose()
	 */
	override dispose(): void
	{
		if (this._disposed) return;

		// Remove all message event handlers
		if (this._communication)
		{
			for (const event of this._messageEvents)
			{
				this._communication.removeMessageEvent(event);
			}
		}

		this._messageEvents = [];

		// Dispose toolbar view
		if (this._bottomBarLeft)
		{
			this._bottomBarLeft.dispose();
			this._bottomBarLeft = null;
		}

		if(this._seasonalCurrencyIndicator)
		{
			this._seasonalCurrencyIndicator.dispose();
			this._seasonalCurrencyIndicator = null;
		}

		if(this._purseAreaExtension)
		{
			this._purseAreaExtension.dispose();
			this._purseAreaExtension = null;
		}

		if(this._extensionView)
		{
			this._extensionView.dispose();
			this._extensionView = null;
		}

		// Clear toolbar events
		this._toolbarEvents.removeAllListeners();

		// Clear references
		this._communication = null;
		this._windowManager = null;
		this._sessionDataManager = null;
		this._roomSessionManager = null;
		this._avatarRenderManager = null;
		this._inventory = null;
		this._catalog = null;
		this._localization = null;
		this._configuration = null;
		this._extensionsInitialized = false;

		super.dispose();
	}

	/**
	 * Initialize the toolbar component
	 *
	 * Called when all required dependencies are resolved.
	 * Sets up message event handlers and initial toolbar state.
	 *
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as initComponent()
	 */
	protected override initComponent(): void
	{
		// BottomBarLeft is created lazily via ensureBottomBarLeft() because
		// initComponent() fires during bootstrap, before the client has
		// registered the window layouts. In AS3, layouts were embedded in
		// the SWF and available immediately; here they're registered after
		// bootstrap by the client layer.
		log.info('Toolbar component initialized');
	}

	/**
	 * Handler for configuration complete event
	 *
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as onConfigurationComplete()
	 */
	private onConfigurationComplete(): void
	{
		// Configuration is ready - extensions can now be initialized
	}

	/**
	 * Handler for perks updated event
	 *
	 * Initializes toolbar extensions after perks are available.
	 * Extensions are only initialized once.
	 *
	 * @see source_as_win63/habbo/toolbar/HabboToolbar.as onPerksUpdated()
	 */
	private onPerksUpdated(): void
	{
		if (!this._extensionsInitialized)
		{
			this.initPurseAreaExtension();
			this.initSeasonalCurrencyExtension();

			this._extensionsInitialized = true;

			log.info('Toolbar extensions initialized after perks update');
		}
	}

	private initPurseAreaExtension(): void
	{
		if(this._purseAreaExtension || !this._windowManager || !this._catalog) return;

		this._purseAreaExtension = new PurseAreaExtension(
			this,
			this._windowManager,
			this._catalog
		);

		this._purseAreaExtension.getClubArea()?.onClubChanged();
	}

	private initSeasonalCurrencyExtension(): void
	{
		if(this._seasonalCurrencyIndicator || !this._windowManager || !this._catalog) return;
		if(!this.getBoolean('seasonalcurrencyindicator.enabled')) return;

		this._seasonalCurrencyIndicator = new SeasonalCurrencyIndicator(
			this,
			this._windowManager,
			this._catalog,
			this._localization
		);

		const displayedType = this._seasonalCurrencyIndicator.displayedActivityPointType;
		const balance = this._catalog.getPurse().getActivityPointsForType(displayedType);

		this._seasonalCurrencyIndicator.onBalance(
			new PurseEvent(PurseEvent.ACTIVITY_POINT_BALANCE, balance, displayedType)
		);
	}

	/**
	 * Add a message event handler and track it for cleanup
	 *
	 * @param event The message event to register
	 */
	private addHabboConnectionMessageEvent(event: IMessageEvent): void
	{
		if (this._communication)
		{
			this._communication.addMessageEvent(event);
			this._messageEvents.push(event);
		}
	}
}
