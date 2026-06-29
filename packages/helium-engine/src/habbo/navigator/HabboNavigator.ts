import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboNavigator} from './IHabboNavigator';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {IHabboToolbar} from '../toolbar/IHabboToolbar';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '../localization/IHabboLocalizationManager';
import type {IHabboTracking} from '../tracking/IHabboTracking';
import type {IAvatarRenderManager} from '../avatar/IAvatarRenderManager';
import type {IHabboHelp} from '../help/IHabboHelp';
import {HabboToolbarEvent} from '../toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '../toolbar/HabboToolbarIconEnum';
import {NavigatorData} from './domain';
import {IncomingMessages} from './IncomingMessages';
import type {CompetitionRoomsData, EventCategory, GuestRoomData} from '../communication/messages/incoming/navigator';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {Logger} from '@core/utils/Logger';

// Composers
import {
	CompetitionRoomsSearchMessageComposer,
	CreateFlatMessageComposer,
	GetGuestRoomMessageComposer,
	MyFavouriteRoomsSearchMessageComposer,
	MyFrequentRoomHistorySearchMessageComposer,
	MyGuildBasesSearchMessageComposer,
	MyRoomHistorySearchMessageComposer,
	MyRoomsSearchMessageComposer,
	RemoveOwnRoomRightsRoomMessageComposer,
	RoomTextSearchMessageComposer,
} from '../communication/messages/outgoing/navigator';
import type {IMessageComposer} from "@core";

const log = Logger.getLogger('Navigator');

/**
 * Habbo Navigator component
 */
export class HabboNavigator extends Component implements IHabboNavigator
{
	private _incomingMessages: IncomingMessages | null = null;
	private _isOpen: boolean = false;
	private _isRoomInfoOpen: boolean = false;
	private _roomSessionManager: IRoomSessionManager | null = null;
	private _toolbar: IHabboToolbar | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _localization: IHabboLocalizationManager | null = null;
	private _sessionData: ISessionDataManager | null = null;
	private _tracking: IHabboTracking | null = null;
	private _catalog: unknown | null = null;
	private _avatarManager: IAvatarRenderManager | null = null;

	constructor(context: IContext)
	{
		super(context);
		this._data = new NavigatorData(this);
	}

	private _habboHelp: IHabboHelp | null = null;

	get habboHelp(): IHabboHelp | null
	{
		return this._habboHelp;
	}

	private _communication: IHabboCommunicationManager | null = null;

	get communication(): IHabboCommunicationManager
	{
		if (!this._communication)
		{
			throw new Error('[HabboNavigator] Communication not available');
		}
		return this._communication;
	}

	private _data: NavigatorData;

	get data(): NavigatorData
	{
		return this._data;
	}

	get homeRoomId(): number
	{
		return this._data.homeRoomId;
	}

	get enteredGuestRoomData(): GuestRoomData | null
	{
		return this._data.enteredGuestRoom;
	}

	get visibleEventCategories(): EventCategory[]
	{
		return this._data.visibleEventCategories;
	}

	get sessionData(): ISessionDataManager | null
	{
		return this._sessionData;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				true
			),
			new ComponentDependency(
				IID_RoomSessionManager,
				(manager: IRoomSessionManager | null) =>
				{
					this._roomSessionManager = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboToolbar,
				(toolbar: IHabboToolbar | null) =>
				{
					// Unsubscribe from previous toolbar
					if (this._toolbar)
					{
						this._toolbar.toolbarEvents.off(
							HabboToolbarEvent.TOOLBAR_CLICK,
							this.onHabboToolbarEvent
						);
					}

					this._toolbar = toolbar;

					// Subscribe to new toolbar's custom event emitter
					// (toolbarEvents, NOT Component.events — see MEMORY.md)
					if (toolbar)
					{
						toolbar.toolbarEvents.on(
							HabboToolbarEvent.TOOLBAR_CLICK,
							this.onHabboToolbarEvent
						);
					}
				},
				false
			),
			new ComponentDependency(
				IID_HabboWindowManager,
				(manager: IHabboWindowManager | null) =>
				{
					this._windowManager = manager;
				}
			),
			new ComponentDependency(
				IID_HabboLocalizationManager,
				(manager: IHabboLocalizationManager | null) =>
				{
					this._localization = manager;
				}
			),
			new ComponentDependency(
				IID_SessionDataManager,
				(manager: ISessionDataManager | null) =>
				{
					this._sessionData = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboTracking,
				(tracking: IHabboTracking | null) =>
				{
					this._tracking = tracking;
				}
			),
			new ComponentDependency(
				IID_HabboCatalog,
				(catalog: unknown | null) =>
				{
					this._catalog = catalog;
				},
				false
			),
			new ComponentDependency(
				IID_AvatarRenderManager,
				(manager: IAvatarRenderManager | null) =>
				{
					this._avatarManager = manager;
				}
			),
			new ComponentDependency(
				IID_HabboHelp,
				(help: IHabboHelp | null) =>
				{
					this._habboHelp = help;
				},
				false
			),
		];
	}

	goToHomeRoom(): boolean
	{
		if (this._data.homeRoomId < 1)
		{
			log.warn('No home room set');

			return false;
		}

		this.goToRoom(this._data.homeRoomId, true);

		return true;
	}

	goToPrivateRoom(roomId: number): void
	{
		this.send(new GetGuestRoomMessageComposer(roomId, false, true));
	}

	goToRoomNetwork(roomId: number, useHomeRoom: boolean): void
	{
		this.closeRoomInfo();

		let homeRoomId = 0;

		if (useHomeRoom && this._data.homeRoomId > 0)
		{
			homeRoomId = this._data.homeRoomId;
		}

		// Would call room session manager here
		log.debug(`Go to room network: ${roomId}, homeRoom=${homeRoomId}`);
	}

	goToRoom(roomId: number, closeNavigator: boolean = true, password: string = '', _roomCategory: number = -1, skipOpc: boolean = false): void
	{
		log.info(`Going to room: ${roomId}`);

		if (closeNavigator)
		{
			this.closeNavigator();
		}

		if (!this._roomSessionManager)
		{
			log.error('RoomSessionManager not available');
			return;
		}

		this._roomSessionManager.gotoRoom(roomId, password, '', skipOpc);
	}

	performTagSearch(tag: string): void
	{
		let searchTag = tag;

		if (searchTag.indexOf(' ') !== -1)
		{
			searchTag = '"' + searchTag + '"';
		}

		this.send(new RoomTextSearchMessageComposer(searchTag));

		log.debug(`Tag search: ${searchTag}`);
	}

	performTextSearch(searchText: string): void
	{
		this.send(new RoomTextSearchMessageComposer(searchText));

		log.debug(`Text search: ${searchText}`);
	}

	performGuildBaseSearch(): void
	{
		this.send(new MyGuildBasesSearchMessageComposer());

		log.debug('Guild base search');
	}

	performCompetitionRoomsSearch(goalId: number, pageIndex: number): void
	{
		if (this._data.isLoading())
		{
			return;
		}

		// Set competition data for tracking
		this._data.competitionRoomsData = {
			goalId,
			pageIndex,
			pageCount: 0,
		} as CompetitionRoomsData;

		this.send(new CompetitionRoomsSearchMessageComposer(goalId, pageIndex));

		log.debug(`Competition rooms search: goal=${goalId}, page=${pageIndex}`);
	}

	showOwnRooms(): void
	{
		this.send(new MyRoomsSearchMessageComposer());

		this.openNavigator();

		log.debug('Showing own rooms');
	}

	hasRoomRightsButIsNotOwner(roomId: number): boolean
	{
		// Would check with room session manager
		log.debug(`Checking room rights for: ${roomId}`);

		return false;
	}

	removeRoomRights(roomId: number): void
	{
		this.send(new RemoveOwnRoomRightsRoomMessageComposer(roomId));
	}

	startRoomCreation(): void
	{
		log.debug('Starting room creation');
	}

	createRoom(name: string, description: string, model: string, categoryId: number, maxUsers: number, tradeMode: number): void
	{
		this.send(new CreateFlatMessageComposer(name, description, model, categoryId, maxUsers, tradeMode));
	}

	openNavigator(): void
	{
		if (this._isOpen) return;

		this._isOpen = true;

		log.info('Navigator opened');
	}

	closeNavigator(): void
	{
		if (!this._isOpen) return;

		this._isOpen = false;

		log.info('Navigator closed');
	}

	toggleRoomInfoVisibility(): void
	{
		if (this._isRoomInfoOpen)
		{
			this.closeRoomInfo();
		}
		else
		{
			this.openRoomInfo();
		}
	}

	canRateRoom(): boolean
	{
		return this._data.canRate;
	}

	isRoomFavorite(roomId: number): boolean
	{
		return this._data.isRoomFavourite(roomId);
	}

	// ── Transitional methods ─────────────────────────────────────────

	isRoomHome(roomId: number): boolean
	{
		return this._data.isRoomHome(roomId);
	}

	/**
	 * Sends a message composer.
	 * Made public for transitional navigator access.
	 *
	 * @param composer - The message composer to send
	 */
	public send(composer: IMessageComposer<unknown[]>): void
	{
		const connection = this._communication?.connection;

		if (connection)
		{
			connection.send(composer);
		}
	}

	/**
	 * Builds a window from a registered widget layout.
	 *
	 * @param jsonFileName - The XML layout name
	 * @param layer - Window context layer
	 * @returns The window, or null
	 * @see source_as_win63/habbo/navigator/HabboNavigator.as getXmlWindow()
	 */
	getXmlWindow(xmlFileName: string, layer: number = 1): IWindow | null
	{
		if (!this._windowManager)
		{
			log.error(`Cannot build window '${xmlFileName}': window manager not available`);
			return null;
		}

		try
		{
			return this._windowManager.buildWidgetLayout(xmlFileName, layer);
		}
		catch (e)
		{
			log.error(`Failed to build window '${xmlFileName}':`, e);
			return null;
		}
	}

	/**
	 * Gets a localized text string.
	 *
	 * @param key - The localization key
	 * @returns The localized text, or the key itself as fallback
	 * @see source_as_win63/habbo/navigator/HabboNavigator.as getText()
	 */
	getText(key: string): string
	{
		if (!this._localization) return key;

		return this._localization.getLocalization(key, key);
	}

	/**
	 * Registers a localization parameter replacement.
	 *
	 * @param key - The localization key
	 * @param param - Parameter name
	 * @param value - Parameter value
	 * @returns The modified string
	 * @see source_as_win63/habbo/navigator/HabboNavigator.as registerParameter()
	 */
	registerParameter(key: string, param: string, value: string): string
	{
		if (!this._localization) return key;

		return this._localization.registerParameter(key, param, value);
	}

	/**
	 * Gets a button image wrapper window.
	 * Stub — returns null until asset system is wired.
	 */
	getButton(_assetName: string, _stateSuffix: string, _callback: Function, _x: number = 0, _y: number = 0, _index: number = 0): IWindowContainer | null
	{
		return null;
	}

	/**
	 * Refreshes a button's visibility and callback.
	 * Stub — no-op until window system is wired.
	 */
	refreshButton(_container: IWindowContainer, _name: string, _visible: boolean, _callback: Function, _index: number, _tooltip: string | null = null): void
	{
		// Stub
	}

	/**
	 * Gets a button image bitmap.
	 * Stub — returns null until asset system is wired.
	 */
	getButtonImage(_assetName: string, _suffix: string = '_png'): unknown | null
	{
		return null;
	}

	/**
	 * Opens the catalog club page.
	 * Stub — no-op until catalog is wired.
	 */
	openCatalogClubPage(_source: string): void
	{
		log.debug('openCatalogClubPage');
	}

	/**
	 * Opens the catalog room ads page.
	 * Stub — no-op until catalog is wired.
	 */
	openCatalogRoomAdsPage(): void
	{
		log.debug('openCatalogRoomAdsPage');
	}

	/**
	 * Opens the catalog room ads extend page.
	 * Stub — no-op until catalog is wired.
	 */
	openCatalogRoomAdsExtendPage(_eventName: string, _eventDesc: string, _eventDate: Date, _eventCatId: number): void
	{
		log.debug('openCatalogRoomAdsExtendPage');
	}

	/**
	 * Shows favourite rooms in the navigator.
	 */
	showFavouriteRooms(): void
	{
		this.send(new MyFavouriteRoomsSearchMessageComposer());

		this.openNavigator();

		log.debug('Showing favourite rooms');
	}

	/**
	 * Shows room visit history.
	 */
	showHistoryRooms(): void
	{
		this.send(new MyRoomHistorySearchMessageComposer());

		this.openNavigator();

		log.debug('Showing history rooms');
	}

	/**
	 * Shows frequently visited rooms.
	 */
	showFrequentRooms(): void
	{
		this.send(new MyFrequentRoomHistorySearchMessageComposer());

		this.openNavigator();

		log.debug('Showing frequent rooms');
	}

	/**
	 * Returns to the navigator main view.
	 */
	goToMainView(): void
	{
		log.debug('Go to main view');
	}

	/**
	 * Checks if a perk is allowed for the current user.
	 *
	 * @param perkCode - The perk code to check
	 * @returns Whether the perk is allowed
	 * @see sources/win63_version/habbo/navigator/HabboNavigator.as isPerkAllowed()
	 */
	isPerkAllowed(perkCode: string): boolean
	{
		if (this._sessionData)
		{
			return this._sessionData.isPerkAllowed(perkCode);
		}

		return false;
	}

	/**
	 * Get the current user's name from the session data.
	 *
	 * @returns The user name, or empty string if not available
	 */
	getCurrentUserName(): string
	{
		return this._sessionData?.userName ?? '';
	}

	/**
	 * Tracks a Google Analytics event.
	 *
	 * @param category - The event category
	 * @param action - The event action
	 * @param value - Optional numeric value
	 * @see sources/win63_version/habbo/navigator/HabboNavigator.as trackGoogle()
	 */
	trackGoogle(category: string, action: string, value: number = -1): void
	{
		if (this._tracking)
		{
			this._tracking.trackGoogle(category, action, value);
		}
	}

	/**
	 * Tracks a navigation data point via the event log.
	 *
	 * @param category - The event category
	 * @param action - The event action
	 * @param label - Optional label
	 * @param value - Optional numeric value
	 * @see sources/win63_version/habbo/navigator/HabboNavigator.as trackNavigationDataPoint()
	 */
	trackNavigationDataPoint(category: string, action: string, label: string = '', value: number = 0): void
	{
		if (this._tracking)
		{
			this._tracking.trackEventLog('Navigation', category, action, label, value);
		}
	}

	/**
	 * Handles incoming navigation links.
	 *
	 * @param link - The link URL to handle
	 * @see sources/win63_version/habbo/navigator/HabboNavigator.as linkReceived()
	 */
	linkReceived(link: string): void
	{
		log.debug(`Link received: ${link}`);

		const parts = link.split('/');

		if (parts.length < 2) return;

		switch (parts[1])
		{
			case 'goto':
				if (parts.length >= 3)
				{
					const roomId = parseInt(parts[2], 10);

					if (!isNaN(roomId))
					{
						this.goToRoom(roomId, true);
					}
				}
				break;
			case 'search':
				if (parts.length >= 3)
				{
					this.performTextSearch(parts[2]);
				}
				break;
			case 'tag':
				if (parts.length >= 3)
				{
					this.performTagSearch(parts[2]);
				}
				break;
		}
	}

	override dispose(): void
	{
		if (this.disposed) return;

		// Unsubscribe from toolbar events
		if (this._toolbar)
		{
			this._toolbar.toolbarEvents.off(
				HabboToolbarEvent.TOOLBAR_CLICK,
				this.onHabboToolbarEvent
			);
			this._toolbar = null;
		}

		this._incomingMessages?.dispose();
		this._data.dispose();

		log.info('Navigator disposed');
		super.dispose();
	}

	protected override initComponent(): void
	{
		this._incomingMessages = new IncomingMessages(this);

		log.info('Navigator initialized');
	}

	/**
	 * Handle toolbar click events.
	 *
	 * Switches on the icon ID to perform the appropriate navigator action.
	 * @param event The toolbar event
	 * @see sources/win63_version/habbo/navigator/HabboNavigator.as onHabboToolbarEvent()
	 */
	private onHabboToolbarEvent = (event: HabboToolbarEvent): void =>
	{
		if (event.type !== HabboToolbarEvent.TOOLBAR_CLICK) return;

		switch (event.iconId)
		{
			case HabboToolbarIconEnum.ROOMINFO:
				this.toggleRoomInfoVisibility();
				break;
			case HabboToolbarIconEnum.NAVIGATOR_ME_TAB:
				this.showOwnRooms();
				break;
			case HabboToolbarIconEnum.GAMES:
				if (this.getBoolean('game.center.enabled'))
				{
					this.closeNavigator();
				}
				break;
			case HabboToolbarIconEnum.HOME:
				this.goToHomeRoom();
				break;
		}
	};

	private openRoomInfo(): void
	{
		if (this._isRoomInfoOpen) return;

		this._isRoomInfoOpen = true;

		log.debug('Room info opened');
	}

	private closeRoomInfo(): void
	{
		if (!this._isRoomInfoOpen) return;

		this._isRoomInfoOpen = false;

		log.debug('Room info closed');
	}

}
