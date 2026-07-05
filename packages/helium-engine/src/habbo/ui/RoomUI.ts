/**
 * RoomUI
 *
 * @see sources/source_as_win63/habbo/ui/RoomUI.as
 *
 * Main room UI component. Extends Component for DI integration.
 * Creates and manages RoomDesktop instances for each active room session.
 * Listens to room session events and room engine events to coordinate
 * the room display lifecycle.
 */
import {Component, ComponentDependency, type IContext, type IUpdateReceiver} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {Logger} from '@core/utils/Logger';

// DI identifiers
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboLandingView} from '@iid/IIDHabboLandingView';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboGroupsManager} from '@iid/IIDHabboGroupsManager';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';

// Interfaces
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IHabboGroupsManager} from '@habbo/groups/IHabboGroupsManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {HabboToolbarEnum} from '@habbo/toolbar/HabboToolbarEnum';
import {FriendBarResizeEvent} from '@habbo/friendbar/events/FriendBarResizeEvent';
import type {IHabboLandingView} from '@habbo/friendbar/IHabboLandingView';
import type {IRoomSession} from '@habbo/session/IRoomSession';

// Events
import {RoomSessionEvent} from '@habbo/session/events/RoomSessionEvent';
import {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import type {RoomEngineRoomColorEvent} from '@habbo/room/events/RoomEngineRoomColorEvent';
import type {RoomEngineHSLColorEnableEvent} from '@habbo/room/events/RoomEngineHSLColorEnableEvent';

// Internal
import type {IRoomUI} from './IRoomUI';
import type {IRoomDesktop} from './IRoomDesktop';
import {RoomDesktop} from './RoomDesktop';
import {RoomWidgetFactory} from './RoomWidgetFactory';

const log = Logger.getLogger('RoomUI');

export class RoomUI extends Component implements IRoomUI, IUpdateReceiver
{
	private _windowManager: IHabboWindowManager | null = null;
	private _roomEngine: IRoomEngine | null = null;
	private _roomSessionManager: IRoomSessionManager | null = null;
	private _sessionDataManager: ISessionDataManager | null = null;
	private _config: IHabboConfigurationManager | null = null;
	private _localization: IHabboLocalizationManager | null = null;
	private _toolbar: IHabboToolbar | null = null;
	private _landingView: IHabboLandingView | null = null;
	private _catalog: IHabboCatalog | null = null;
	private _habboTracking: IHabboTracking | null = null;
	private _habboGroupsManager: IHabboGroupsManager | null = null;
	private _navigator: IHabboNavigator | null = null;
	private _communicationManager: IHabboCommunicationManager | null = null;
	private _widgetFactory: RoomWidgetFactory;
	private _desktops: Map<string, RoomDesktop> = new Map();
	private _currentDesktop: RoomDesktop | null = null;
	private _isInRoom: boolean = false;

	constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, flags, assetLibrary);

		this._widgetFactory = new RoomWidgetFactory(this);
		this.registerUpdateReceiver(this, 0);
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboWindowManager,
				(wm: IHabboWindowManager | null) =>
				{
					this._windowManager = wm;
				},
				true
			),
			new ComponentDependency(
				IID_RoomEngine,
				(engine: IRoomEngine | null) =>
				{
					this._roomEngine = engine;

					if(engine)
					{
						engine.events.on(RoomEngineEvent.REE_INITIALIZED, this.roomEventHandler, this);
						engine.events.on(RoomEngineEvent.REE_DISPOSED, this.roomEventHandler, this);
						engine.events.on(RoomEngineEvent.REE_OBJECTS_INITIALIZED, this.roomEngineEventHandler, this);
						engine.events.on(RoomEngineEvent.REE_NORMAL_MODE, this.roomEngineEventHandler, this);
						engine.events.on(RoomEngineEvent.REE_GAME_MODE, this.roomEngineEventHandler, this);
						engine.events.on('RERCE_ROOM_COLOR', this.roomEventHandler, this);
						engine.events.on('ROHSLCEE_ROOM_BACKGROUND_COLOR', this.roomEventHandler, this);
						engine.events.on('REE_ROOM_ZOOM', this.roomEventHandler, this);
						engine.events.on(RoomEngineObjectEvent.REOE_OBJECT_SELECTED, this.roomObjectEventHandler, this);
						engine.events.on(RoomEngineObjectEvent.REOE_OBJECT_DESELECTED, this.roomObjectEventHandler, this);
						engine.events.on(RoomEngineObjectEvent.REOE_OBJECT_ADDED, this.roomObjectEventHandler, this);
						engine.events.on(RoomEngineObjectEvent.REOE_OBJECT_REMOVED, this.roomObjectEventHandler, this);
					}
				},
				true
			),
			new ComponentDependency(
				IID_RoomSessionManager,
				(mgr: IRoomSessionManager | null) =>
				{
					this._roomSessionManager = mgr;

					if(mgr)
					{
						mgr.sessionEvents.on(RoomSessionEvent.RSE_CREATED, this.roomSessionStateEventHandler, this);
						mgr.sessionEvents.on(RoomSessionEvent.RSE_STARTED, this.roomSessionStateEventHandler, this);
						mgr.sessionEvents.on(RoomSessionEvent.RSE_ENDED, this.roomSessionStateEventHandler, this);
					}
				},
				true
			),
			new ComponentDependency(
				IID_SessionDataManager,
				(sdm: ISessionDataManager | null) =>
				{
					this._sessionDataManager = sdm;
				},
				false
			),
			new ComponentDependency(
				IID_HabboConfigurationManager,
				(config: IHabboConfigurationManager | null) =>
				{
					this._config = config;
				},
				false
			),
			new ComponentDependency(
				IID_HabboLocalizationManager,
				(loc: IHabboLocalizationManager | null) =>
				{
					this._localization = loc;
				},
				false
			),
			new ComponentDependency(
				IID_HabboToolbar,
				(toolbar: IHabboToolbar | null) =>
				{
					this._toolbar = toolbar;

					for(const desktop of this._desktops.values())
					{
						desktop.toolbar = toolbar;
					}
				},
				false
			),
			new ComponentDependency(
				IID_HabboLandingView,
				(lv: IHabboLandingView | null) =>
				{
					this._landingView = lv;
				},
				false
			),
			new ComponentDependency(
				IID_HabboCatalog,
				(catalog: IHabboCatalog | null) =>
				{
					this._catalog = catalog;

					for(const desktop of this._desktops.values())
					{
						desktop.catalog = catalog;
					}
				},
				false
			),
			new ComponentDependency(
				IID_HabboTracking,
				(tracking: IHabboTracking | null) =>
				{
					this._habboTracking = tracking;

					for(const desktop of this._desktops.values())
					{
						desktop.habboTracking = tracking;
					}
				},
				false
			),
			new ComponentDependency(
				IID_HabboGroupsManager,
				(groupsManager: IHabboGroupsManager | null) =>
				{
					this._habboGroupsManager = groupsManager;

					for(const desktop of this._desktops.values())
					{
						desktop.habboGroupsManager = groupsManager;
					}
				},
				false
			),
			new ComponentDependency(
				IID_HabboNavigator,
				(navigator: IHabboNavigator | null) =>
				{
					this._navigator = navigator;

					for(const desktop of this._desktops.values())
					{
						desktop.navigator = navigator;
					}
				},
				false
			),
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(communicationManager: IHabboCommunicationManager | null) =>
				{
					this._communicationManager = communicationManager;

					for(const desktop of this._desktops.values())
					{
						desktop.communicationManager = communicationManager;
					}
				},
				false
			),
		];
	}

	/**
	 * The catalog manager, used to construct widgets that need it (e.g. infostand).
	 */
	public get catalog(): IHabboCatalog | null
	{
		return this._catalog;
	}

	/**
	 * The config manager, used to construct widgets that need it (e.g. infostand).
	 */
	public get config(): IHabboConfigurationManager | null
	{
		return this._config;
	}

	// AS3: sources/win63_version/habbo/ui/RoomUI.as::get navigator()
	public get navigator(): IHabboNavigator | null
	{
		return this._navigator;
	}

	/**
	 * The communication manager, used to construct widgets that need it (e.g. room tools).
	 */
	public get communicationManager(): IHabboCommunicationManager | null
	{
		return this._communicationManager;
	}

	// AS3: sources/win63_version/habbo/ui/RoomUI.as::get desktop()
	// AS3 tracks a single active room desktop (var_22); the TS port keys desktops
	// by room identifier in a Map to support the underlying multi-session
	// architecture, so this exposes "the most recently created desktop" as the
	// AS3-equivalent single current desktop.
	public get desktop(): IRoomDesktop | null
	{
		return this._currentDesktop;
	}

	/**
	 * The window manager, used by RoomWidgetFactory to construct widgets.
	 */
	public get windowManager(): IHabboWindowManager | null
	{
		return this._windowManager;
	}

	/**
	 * The localization manager, used by RoomWidgetFactory to construct widgets.
	 */
	public get localization(): IHabboLocalizationManager | null
	{
		return this._localization;
	}

	protected override initComponent(): void
	{
		log.info('RoomUI initialized');
	}

	/**
	 * Creates a RoomDesktop for the given session.
	 */
	public createDesktop(session: IRoomSession): IRoomDesktop
	{
		const identifier = this.getRoomIdentifier(session.roomId);

		// Dispose existing desktop for this room
		if(this._desktops.has(identifier))
		{
			this.disposeDesktop(identifier);
		}

		const connection = session.connection ?? null;

		const desktop = new RoomDesktop(session, this.assets!, connection);

		// Inject all dependencies
		desktop.windowManager = this._windowManager;
		desktop.roomEngine = this._roomEngine;
		desktop.sessionDataManager = this._sessionDataManager;
		desktop.roomSessionManager = this._roomSessionManager;
		desktop.config = this._config;
		desktop.localization = this._localization;
		desktop.toolbar = this._toolbar;
		desktop.roomWidgetFactory = this._widgetFactory;
		desktop.catalog = this._catalog;
		desktop.habboTracking = this._habboTracking;
		desktop.habboGroupsManager = this._habboGroupsManager;
		desktop.navigator = this._navigator;
		desktop.communicationManager = this._communicationManager;

		// Set the layout
		desktop.layout = 'room_desktop_layout';

		// Initialize
		desktop.init();

		// Store in desktops map
		this._desktops.set(identifier, desktop);
		this._currentDesktop = desktop;

		log.info(`Desktop created for room ${session.roomId} (identifier: ${identifier})`);

		return desktop;
	}

	/**
	 * Disposes a desktop by room identifier.
	 */
	public disposeDesktop(identifier: string): void
	{
		const desktop = this._desktops.get(identifier);

		if(!desktop) return;

		desktop.dispose();
		this._desktops.delete(identifier);

		if(this._currentDesktop === desktop)
		{
			this._currentDesktop = null;
		}

		log.info(`Desktop disposed: ${identifier}`);
	}

	/**
	 * Gets a desktop by room identifier.
	 */
	public getDesktop(identifier: string): IRoomDesktop | null
	{
		return this._desktops.get(identifier) ?? null;
	}

	/**
	 * Gets the active canvas ID for a room (always 1).
	 */
	public getActiveCanvasId(_roomId: number): number
	{
		return 1;
	}

	/**
	 * Sets visibility of the active desktop.
	 */
	public set visible(value: boolean)
	{
		for(const desktop of this._desktops.values())
		{
			desktop.visible = value;
		}
	}

	/**
	 * Triggers bottom bar resize.
	 */
	// AS3: sources/win63_version/habbo/ui/RoomUI.as::triggerbottomBarResize()
	public triggerbottomBarResize(): void
	{
		this.bottomBarResizeHandler(new FriendBarResizeEvent());
	}

	/**
	 * TS alias kept for existing callers; delegates to the AS3-named API.
	 */
	public triggerBottomBarResize(): void
	{
		this.triggerbottomBarResize();
	}

	// AS3: sources/win63_version/habbo/ui/RoomUI.as::bottomBarResizeHandler()
	private bottomBarResizeHandler(event: FriendBarResizeEvent): void
	{
		for(const desktop of this._desktops.values())
		{
			desktop.processEvent(event);
		}
	}

	/**
	 * Handles room session lifecycle events.
	 */
	private roomSessionStateEventHandler(event: RoomSessionEvent): void
	{
		switch(event.type)
		{
			case RoomSessionEvent.RSE_CREATED:
			{
				log.info(`Session created for room ${event.session.roomId}`);

				this.createDesktop(event.session);

				// For game sessions, hide toolbar and landing view immediately
				// AS3: RoomUI.roomSessionStateEventHandler RSE_CREATED
				if(event.session.isGameSession)
				{
					if(this._toolbar)
					{
						this._toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HIDDEN);
					}

					if(this._landingView)
					{
						this._landingView.disable();
					}
				}

				break;
			}

			case RoomSessionEvent.RSE_STARTED:
			{
				log.info(`Session started for room ${event.session.roomId}`);

				// Switch toolbar to room view mode
				// AS3: RoomUI.defineToolbarState()
				if(this._toolbar)
				{
					this._toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_ROOM_VIEW);
				}

				// Disable the landing view (hotel view page)
				if(this._landingView)
				{
					this._landingView.disable();
				}

				break;
			}

			case RoomSessionEvent.RSE_ENDED:
			{
				log.info(`Session ended for room ${event.session.roomId}`);

				const identifier = this.getRoomIdentifier(event.session.roomId);

				this.disposeDesktop(identifier);

				this._isInRoom = false;

				if(event.openLandingPage)
				{
					// Restore toolbar to hotel view mode
					// AS3: RoomUI RSE_ENDED -> toolbar state + landingView.activate()
					if(this._toolbar)
					{
						this._toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW);
					}

					// Re-enable landing view
					if(this._landingView)
					{
						this._landingView.activate();
					}
				}

				break;
			}
		}
	}

	/**
	 * Handles major room engine events (initialized, disposed, color, zoom).
	 */
	private roomEventHandler(event: RoomEngineEvent): void
	{
		const roomId = event.roomId;
		const identifier = this.getRoomIdentifier(roomId);
		const desktop = this._desktops.get(identifier);

		switch(event.type)
		{
			case RoomEngineEvent.REE_INITIALIZED:
			{
				if(desktop)
				{
					const canvasId = this.getActiveCanvasId(roomId);

					desktop.createRoomView(canvasId);

					// Create room widgets (stubs for now)
					desktop.createWidget('RWE_CHAT_WIDGET');
					desktop.createWidget('RWE_CHAT_INPUT_WIDGET');
					desktop.createWidget('RWE_INFOSTAND');
					desktop.createWidget('RWE_ME_MENU');
					desktop.createWidget('RWE_AVATAR_INFO');
					desktop.createWidget('RWE_ROOM_TOOLS');
					desktop.createWidget('RWE_FURNITURE_CONTEXT_MENU');

					this._isInRoom = true;

					log.info(`Room ${roomId} initialized — room view created`);
				}

				break;
			}

			case RoomEngineEvent.REE_DISPOSED:
			{
				this.disposeDesktop(identifier);
				this._isInRoom = false;

				break;
			}

			case 'RERCE_ROOM_COLOR':
			{
				if(desktop)
				{
					const colorEvent = event as RoomEngineRoomColorEvent;

					desktop.setRoomViewColor(colorEvent.color, colorEvent.light);
				}

				break;
			}

			case 'ROHSLCEE_ROOM_BACKGROUND_COLOR':
			{
				if(desktop)
				{
					const hslEvent = event as RoomEngineHSLColorEnableEvent;

					if(hslEvent.enable)
					{
						desktop.setRoomBackgroundColor(hslEvent.hue, hslEvent.saturation, hslEvent.lightness);
					}
				}

				break;
			}

			case 'REE_ROOM_ZOOM':
			{
				// Zoom event — handled by desktop
				break;
			}
		}
	}

	/**
	 * Handles room engine mode events (objects initialized, game mode toggle).
	 */
	private roomEngineEventHandler(event: RoomEngineEvent): void
	{
		switch(event.type)
		{
			case RoomEngineEvent.REE_OBJECTS_INITIALIZED:
			{
				log.debug(`Objects initialized for room ${event.roomId}`);

				break;
			}

			case RoomEngineEvent.REE_NORMAL_MODE:
			case RoomEngineEvent.REE_GAME_MODE:
			{
				const identifier = this.getRoomIdentifier(event.roomId);
				const desktop = this._desktops.get(identifier);

				if(desktop)
				{
					desktop.roomEngineEventHandler(event);
				}

				break;
			}
		}
	}

	/**
	 * Routes room object events to the appropriate desktop.
	 */
	private roomObjectEventHandler(event: RoomEngineObjectEvent): void
	{
		const identifier = this.getRoomIdentifier(event.roomId);
		const desktop = this._desktops.get(identifier);

		if(desktop)
		{
			desktop.roomObjectEventHandler(event);
		}
	}

	/**
	 * Called each frame. Updates all active desktops.
	 */
	public update(_time: number): void
	{
		for(const desktop of this._desktops.values())
		{
			desktop.update();
		}
	}

	/**
	 * Converts a room ID to a room identifier string.
	 * Matches AS3 pattern using "hard_coded_room_id".
	 */
	private getRoomIdentifier(roomId: number): string
	{
		return `hard_coded_room_id_${roomId}`;
	}

	/**
	 * Gets whether we are currently in a room.
	 */
	public get isInRoom(): boolean
	{
		return this._isInRoom;
	}

	/**
	 * Gets a desktop for a specific room ID.
	 */
	public getDesktopForRoom(roomId: number): RoomDesktop | null
	{
		const identifier = this.getRoomIdentifier(roomId);

		return this._desktops.get(identifier) ?? null;
	}

	public override dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		// Remove update receiver
		this.removeUpdateReceiver(this);

		// Remove event listeners
		if(this._roomEngine)
		{
			this._roomEngine.events.off(RoomEngineEvent.REE_INITIALIZED, this.roomEventHandler, this);
			this._roomEngine.events.off(RoomEngineEvent.REE_DISPOSED, this.roomEventHandler, this);
			this._roomEngine.events.off(RoomEngineEvent.REE_OBJECTS_INITIALIZED, this.roomEngineEventHandler, this);
			this._roomEngine.events.off(RoomEngineEvent.REE_NORMAL_MODE, this.roomEngineEventHandler, this);
			this._roomEngine.events.off(RoomEngineEvent.REE_GAME_MODE, this.roomEngineEventHandler, this);
			this._roomEngine.events.off('RERCE_ROOM_COLOR', this.roomEventHandler, this);
			this._roomEngine.events.off('ROHSLCEE_ROOM_BACKGROUND_COLOR', this.roomEventHandler, this);
			this._roomEngine.events.off('REE_ROOM_ZOOM', this.roomEventHandler, this);
		}

		if(this._roomSessionManager)
		{
			this._roomSessionManager.sessionEvents.off(RoomSessionEvent.RSE_CREATED, this.roomSessionStateEventHandler, this);
			this._roomSessionManager.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this.roomSessionStateEventHandler, this);
			this._roomSessionManager.sessionEvents.off(RoomSessionEvent.RSE_ENDED, this.roomSessionStateEventHandler, this);
		}

		// Dispose all desktops
		for(const [identifier, desktop] of this._desktops)
		{
			desktop.dispose();
		}

		this._desktops.clear();

		// Dispose widget factory
		this._widgetFactory.dispose();

		super.dispose();
	}
}
