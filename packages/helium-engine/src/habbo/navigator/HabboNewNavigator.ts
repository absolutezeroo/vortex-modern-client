import {EventEmitter} from 'eventemitter3';
import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboNewNavigator} from './IHabboNewNavigator';
import type {IHabboNavigator} from './IHabboNavigator';
import type {IHabboHelp} from '../help/IHabboHelp';
import type {IHabboToolbar} from '../toolbar/IHabboToolbar';
import {HabboToolbarEvent} from '../toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '../toolbar/HabboToolbarIconEnum';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '../localization/IHabboLocalizationManager';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import {PerksUpdatedEvent} from '../session/events/PerksUpdatedEvent';
import type {IHabboTracking} from '../tracking/IHabboTracking';
import {NavigatorData} from './domain';
import {NavigatorCache} from './cache';
import {LiftDataContainer} from './lift';
import {ContextContainer, SearchContext, SearchContextHistoryManager} from './context';
import {NavigatorView} from './view/NavigatorView';
import {NewIncomingMessages} from './NewIncomingMessages';
import {LegacyNavigator} from './transitional/LegacyNavigator';
import type {HabboNavigator} from './HabboNavigator';
import type {
	NavigatorLiftedRoomData,
	NavigatorSavedSearch,
	NavigatorSearchResultSet,
} from '../communication/messages/incoming/newnavigator';
import type {NavigatorMetaDataMessageParser} from '../communication/messages/parser/newnavigator';
import type {NavigatorWindowSettingsMessageParser} from '../communication/messages/parser/newnavigator';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import {Logger} from '@core/utils/Logger';
import {ViewModeCode} from './view';

// Composers
import {
	NavigatorAddCollapsedCategoryMessageComposer,
	NavigatorAddSavedSearchComposer,
	NavigatorDeleteSavedSearchComposer,
	NavigatorRemoveCollapsedCategoryMessageComposer,
	NavigatorSetSearchCodeViewModeMessageComposer,
	NewNavigatorInitComposer,
	NewNavigatorSearchComposer,
} from '../communication/messages/outgoing/newnavigator';
import {
	ForwardToSomeRoomMessageComposer,
	GetGuestRoomMessageComposer,
} from '../communication/messages/outgoing/navigator';
import {SetNewNavigatorWindowPreferencesMessageComposer} from '../communication/messages/outgoing/preferences/SetNewNavigatorWindowPreferencesMessageComposer';
import {
	GetExtendedProfileMessageComposer
} from '../communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {GetHabboGroupDetailsMessageComposer} from '../communication/messages/outgoing/users/GetHabboGroupDetailsMessageComposer';
import type {IMessageComposer} from '@core';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IID_HabboNavigator} from "@iid/IIDHabboNavigator";

const log = Logger.getLogger('NewNavigator');

/**
 * New Habbo Navigator component
 *
 * This is the main navigator part that uses HabboNavigator (legacy)
 * for shared data and functionality through delegation.
 *
 */
export class HabboNewNavigator extends Component implements IHabboNewNavigator
{
	private _incomingMessages: NewIncomingMessages | null = null;
	private _isInitialized: boolean = false;
	private _noPushToHistoryDueToNavigation: boolean = false;
	private _lastSearchCode: string = ViewModeCode.OFFICIAL_VIEW;
	private _lastFiltering: string = '';
	private _lastSource: string = '';
	private _roomSessionManager: IRoomSessionManager | null = null;
	private _toolbar: IHabboToolbar | null = null;
	private _localization: IHabboLocalizationManager | null = null;
	private _sessionData: ISessionDataManager | null = null;
	private _habboHelp: IHabboHelp | null = null;
	private _tracking: IHabboTracking | null = null;
	private _groupDetails: Map<number, unknown> = new Map();
	private _roomNames: Map<number, string> = new Map();
	private _legacyNavigatorWrapper: LegacyNavigator | null = null;

	constructor(context: IContext)
	{
		super(context);

		this._contextContainer = new ContextContainer(this);
		this._historyManager = new SearchContextHistoryManager(this);
		this._cache = new NavigatorCache();
		this._liftDataContainer = new LiftDataContainer();
	}

	private _newResultsRendered: boolean = false;

	/**
	 * Whether the view has rendered new results.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as newResultsRendered
	 */
	get newResultsRendered(): boolean
	{
		return this._newResultsRendered;
	}

	set newResultsRendered(value: boolean)
	{
		this._newResultsRendered = value;
	}

	private _windowManager: IHabboWindowManager | null = null;

	/**
	 * The window manager.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as get windowManager()
	 */
	get windowManager(): IHabboWindowManager | null
	{
		return this._windowManager;
	}

	get sessionData(): ISessionDataManager | null
	{
		return this._sessionData;
	}

	get roomSessionManager(): IRoomSessionManager | null
	{
		return this._roomSessionManager;
	}

	get localization(): IHabboLocalizationManager | null
	{
		return this._localization;
	}

	get habboHelp(): IHabboHelp | null
	{
		return this._habboHelp;
	}

	get linkPattern(): string
	{
		return 'navigator/';
	}

	private _view: NavigatorView | null = null;

	/**
	 * The navigator view.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as get view()
	 */
	get view(): NavigatorView | null
	{
		return this._view;
	}

	get mainWindow(): IWindow | null
	{
		return this._view?.mainWindow ?? null;
	}

	private _navigatorEvents: EventEmitter = new EventEmitter();

	/**
	 * Custom navigator event emitter (NOT the Component events)
	 *
	 * Uses a separate EventEmitter to avoid overriding Component.events
	 * which would break the dependency injection unlock mechanism.
	 */
	get navigatorEvents(): EventEmitter
	{
		return this._navigatorEvents;
	}

	private _communication: IHabboCommunicationManager | null = null;

	/**
	 * Get the communication manager
	 */
	get communication(): IHabboCommunicationManager
	{
		if (!this._communication)
		{
			throw new Error('[HabboNewNavigator] Communication not available');
		}
		return this._communication;
	}

	private _legacyNavigator: IHabboNavigator | null = null;

	get legacyNavigator(): IHabboNavigator
	{
		if(this._legacyNavigator === null) throw new Error('[HabboNewNavigator] legacyNavigator not initialized');
		return this._legacyNavigator;
	}

	private _contextContainer: ContextContainer;

	get contextContainer(): ContextContainer
	{
		return this._contextContainer;
	}

	private _historyManager: SearchContextHistoryManager;

	get historyManager(): SearchContextHistoryManager
	{
		return this._historyManager;
	}

	get searchContextHistoryManager(): SearchContextHistoryManager
	{
		return this._historyManager;
	}

	private _cache: NavigatorCache;

	get cache(): NavigatorCache
	{
		return this._cache;
	}

	private _liftDataContainer: LiftDataContainer;

	/**
	 * Container for promoted/lifted room data.
	 *
	 * @see sources/win63_version/habbo/navigator/HabboNewNavigator.as get liftDataContainer()
	 */
	get liftDataContainer(): LiftDataContainer
	{
		return this._liftDataContainer;
	}

	get imageLibraryBaseUrl(): string
	{
		return this.getProperty('image.library.url');
	}

	get isReady(): boolean
	{
		return (this.contextContainer != null) && (this.contextContainer.isReady());
	}

	private _currentResults: NavigatorSearchResultSet | null = null;

	get currentResults(): NavigatorSearchResultSet | null
	{
		return this._currentResults;
	}

	private _collapsedCategories: Set<string> = new Set();

	get collapsedCategories(): Set<string>
	{
		return this._collapsedCategories;
	}

	/**
	 * The LegacyNavigator wrapper that bridges old and new navigator.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as var_2377
	 */
	get legacyWrapper(): LegacyNavigator | null
	{
		return this._legacyNavigatorWrapper;
	}

	/**
	 * Get the navigator data model
	 * Uses legacy navigator's data for shared state
	 */
	get data(): NavigatorData
	{
		return this.legacyNavigator.data;
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
				IID_HabboNavigator,
				(nav: IHabboNavigator | null) =>
				{
					this._legacyNavigator = nav;
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
				true,
				[
					{
						type: PerksUpdatedEvent.PERKS_UPDATED,
						callback: (...args: unknown[]) => this.onPerksUpdated(args[0] as PerksUpdatedEvent)
					}
				]
			),
			new ComponentDependency(
				IID_HabboHelp,
				(help: IHabboHelp | null) =>
				{
					this._habboHelp = help;
				},
				false
			),
			new ComponentDependency(
				IID_HabboTracking,
				(tracking: IHabboTracking | null) =>
				{
					this._tracking = tracking;
				}
			),
		];
	}

	/**
	 * Get the event log extra string from search parameters.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as getEventLogExtraStringFromSearch()
	 */
	static getEventLogExtraStringFromSearch(searchCode: string, filtering: string): string
	{
		return searchCode + (filtering === '' ? '' : ':' + filtering);
	}

	initialize(parser: NavigatorMetaDataMessageParser): void
	{
		this._contextContainer.initialize(parser);
	}

	/**
	 * Handle search results from the server.
	 *
	 * Extracts room names from results for tracking, pushes to history,
	 * caches results, and updates the view.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as onSearchResult()
	 */
	onSearchResult(results: NavigatorSearchResultSet): void
	{
		this._newResultsRendered = false;
		this._currentResults = results;
		this.data.navigatorSearchResultSet = results;

		this.extractRoomNamesFromResults(results);

		if (!this._noPushToHistoryDueToNavigation)
		{
			this._historyManager.addSearchContextAtCurrentOffset(
				new SearchContext(results.searchCodeOriginal, results.filteringData)
			);
		}

		this._cache.put(`${results.searchCodeOriginal}/${results.filteringData}`, results);

		this._noPushToHistoryDueToNavigation = false;

		// Update the view if visible (like AS3)
		if (this._view && this._view.visible)
		{
			this._view.onSearchResults(results, this._lastSource);
		}

		// log.debug(`Search results: ${results.blocks.length} blocks`);
	}

	onLiftedRooms(rooms: NavigatorLiftedRoomData[]): void
	{
		this._liftDataContainer.setLiftedRooms(rooms);

		if(this._view)
		{
			this._view.refreshLiftedRooms();
		}
	}

	/**
	 * Handle saved searches from the server.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as onSavedSearches()
	 */
	onSavedSearches(searches: NavigatorSavedSearch[]): void
	{
		this._contextContainer.savedSearches = searches;

		if (this._view)
		{
			this._view.onSavedSearches(searches);
		}

		this._navigatorEvents.emit('navigator:savedSearches', searches);

		// log.debug(`Saved searches: ${searches.length}`);
	}

	onCollapsedCategories(categories: string[]): void
	{
		this._collapsedCategories = new Set(categories);

		this._navigatorEvents.emit('navigator:collapsed', categories);

		// log.debug(`Collapsed categories: ${categories.length}`);
	}

	/**
	 * Open the navigator.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as open()
	 */
	open(): void
	{
		if (this._view === null) return;

		if (!this._view.visible)
		{
			this._view.visible = true;
		}
	}

	/**
	 * Close the navigator.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as close()
	 */
	close(): void
	{
		if (this._view === null) return;

		if (this._view.visible)
		{
			this._view.visible = false;
		}
	}

	/**
	 * Toggle the navigator.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as toggle()
	 */
	toggle(): void
	{
		if(this._view === null)
		{
			log.warn('toggle() called but _view is null');
			return;
		}

		this._view.visible = !this._view.visible;

		if(this._view.visible)
		{
			this.performLastSearch();
		}
	}

	/**
	 * Perform a search.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as performSearch()
	 */
	performSearch(searchCode: string, filtering: string = '', source: string = ''): void
	{
		if (this._view)
		{
			this._view.isBusy = true;
		}

		this._lastSource = source;

		// Check cache first
		const cached = this._cache.getEntry(`${searchCode}/${filtering}`);

		if (cached)
		{
			this.onSearchResult(cached);

			return;
		}

		this._lastSearchCode = searchCode;
		this._lastFiltering = filtering;

		this.send(new NewNavigatorSearchComposer(searchCode, filtering));
		this.trackEventLog('search', 'Search', HabboNewNavigator.getEventLogExtraStringFromSearch(searchCode, filtering));

		this.open();

		log.debug(`Searching: ${searchCode}, filter: ${filtering}`);
	}

	performSearchByContext(context: SearchContext): void
	{
		this.performSearch(context.searchCode, context.filtering);
	}

	performLastSearch(): void
	{
		if (this._lastSearchCode)
		{
			this._cache.removeEntry(`${this._lastSearchCode}/${this._lastFiltering}`);

			this.performSearch(this._lastSearchCode, this._lastFiltering);
		}
	}

	performTagSearch(tag: string): void
	{
		this.performSearch(ViewModeCode.HOTEL_VIEW, 'tag:' + tag);
	}

	performTextSearch(_text: string): void
	{
		// AS3 stub: HabboNewNavigator.performTextSearch(param1:String) is empty in WIN63.
	}

	showOwnRooms(): void
	{
		// AS3 stub: HabboNewNavigator.showOwnRooms() is empty in WIN63.
	}

	performGuildBaseSearch(): void
	{
		// AS3 stub: HabboNewNavigator.performGuildBaseSearch() is empty in WIN63.
	}

	performCompetitionRoomsSearch(_goalId: number, _roomType: number): void
	{
		// AS3 stub: HabboNewNavigator.performCompetitionRoomsSearch(param1:int, param2:int) is empty in WIN63.
	}

	goBack(): void
	{
		const context = this._historyManager.getPreviousSearchContextAndGoBack();

		if (context)
		{
			this._noPushToHistoryDueToNavigation = true;

			this.performSearchByContext(context);
		}

		this.trackEventLog('browse.back', 'Results');
	}

	goForward(): void
	{
		const context = this._historyManager.getNextSearchContextAndMoveForward();

		if (context)
		{
			this._noPushToHistoryDueToNavigation = true;

			this.performSearchByContext(context);
		}
	}

	goToRoom(roomId: number, source: string = 'mainview'): void
	{
		this.send(new GetGuestRoomMessageComposer(roomId, false, true));

		if (this._view)
		{
			this._view.visible = false;
		}

		const roomName = this._roomNames.get(roomId);

		this.trackEventLog('go', source, roomName || '', roomId);

		log.info(`Going to room: ${roomId}`);
	}

	goToHomeRoom(): void
	{
		const homeRoomId = this.data.homeRoomId;

		if (homeRoomId > 0)
		{
			this.goToRoom(homeRoomId, 'external');
		}
	}

	addSavedSearch(searchCode: string, filtering: string): void
	{
		if (this._currentResults)
		{
			this.send(new NavigatorAddSavedSearchComposer(searchCode, filtering));
		}

		this.trackEventLog('savedsearch.add', 'SavedSearch', HabboNewNavigator.getEventLogExtraStringFromSearch(searchCode, filtering));
		this._view?.setLeftPaneVisibility(true);
	}

	deleteSavedSearch(id: number): void
	{
		this.send(new NavigatorDeleteSavedSearchComposer(id));
		this.trackEventLog('savedsearch.delete', 'SavedSearch');
	}

	addCollapsedCategory(category: string): void
	{
		this.sendAddCollapsedCategory(category);
		this._collapsedCategories.add(category);
	}

	removeCollapsedCategory(category: string): void
	{
		this.sendRemoveCollapsedCategory(category);
		this._collapsedCategories.delete(category);
	}

	isCategoryCollapsed(category: string): boolean
	{
		return this._collapsedCategories.has(category);
	}

	setSearchCodeViewMode(searchCode: string, viewMode: number): void
	{
		this.toggleSearchCodeViewMode(searchCode, viewMode);
	}

	sendAddCollapsedCategory(category: string): void
	{
		this.send(new NavigatorAddCollapsedCategoryMessageComposer(category));
	}

	sendRemoveCollapsedCategory(category: string): void
	{
		this.send(new NavigatorRemoveCollapsedCategoryMessageComposer(category));
	}

	toggleSearchCodeViewMode(searchCode: string, viewMode: number): void
	{
		this.send(new NavigatorSetSearchCodeViewModeMessageComposer(searchCode, viewMode));
		this.trackEventLog('browse.toggleviewmode', 'ViewMode', '', viewMode);
	}

	/**
	 * Checks if a perk is allowed for the current user.
	 *
	 * Delegates to the legacy navigator's session data manager.
	 *
	 * @param perkCode - The perk code to check
	 * @returns Whether the perk is allowed
	 * @see sources/win63_version/habbo/navigator/HabboNewNavigator.as sessionData.isPerkAllowed()
	 */
	isPerkAllowed(perkCode: string): boolean
	{
		if(this._legacyNavigator)
		{
			return (this._legacyNavigator as HabboNavigator).isPerkAllowed(perkCode);
		}

		return false;
	}

	/**
	 * Get the current user's name.
	 *
	 * @returns The user name, or empty string if not available
	 * @see sources/win63_version/habbo/navigator/HabboNewNavigator.as sessionData.userName
	 */
	getCurrentUserName(): string
	{
		if(this._legacyNavigator)
		{
			return (this._legacyNavigator as HabboNavigator).getCurrentUserName();
		}

		return '';
	}

	/**
	 * Get a localized text string.
	 *
	 * @param key - The localization key
	 * @param fallback - The fallback value if the key is not found
	 * @returns The localized string or fallback
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as localization
	 */
	getLocalization(key: string, fallback: string = ''): string
	{
		if (!this._localization) return fallback || key;

		return this._localization.getLocalization(key, fallback || key);
	}

	/**
	 * Handle navigator window preferences from the server.
	 *
	 * @param windowX - X position
	 * @param windowY - Y position
	 * @param windowHeight - Window height
	 * @param leftPaneHidden - Whether left pane is hidden
	 * @param resultsMode - Results display mode
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as onPreferences()
	 */
	onPreferences(
		preferencesOrWindowX: NavigatorWindowSettingsMessageParser | number,
		windowY: number = 0,
		windowHeight: number = 0,
		leftPaneHidden: boolean = false,
		resultsMode: number = 0
	): void
	{
		const windowX = typeof preferencesOrWindowX === 'number' ? preferencesOrWindowX : preferencesOrWindowX.windowX;
		const resolvedWindowY = typeof preferencesOrWindowX === 'number' ? windowY : preferencesOrWindowX.windowY;
		const resolvedWindowHeight = typeof preferencesOrWindowX === 'number' ? windowHeight : preferencesOrWindowX.windowHeight;
		const resolvedLeftPaneHidden = typeof preferencesOrWindowX === 'number' ? leftPaneHidden : preferencesOrWindowX.leftPaneHidden;
		const resolvedResultsMode = typeof preferencesOrWindowX === 'number' ? resultsMode : preferencesOrWindowX.resultsMode;

		if (this._view)
		{
			this._view.setInitialWindowDimensions(windowX, resolvedWindowY, resolvedWindowHeight, resolvedLeftPaneHidden, resolvedResultsMode);
		}
	}

	/**
	 * Handle group details arriving from the server.
	 *
	 * Caches the group details and notifies the view.
	 *
	 * @param groupId - The group ID
	 * @param details - The group details data
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as onGroupDetails()
	 */
	onGroupDetails(groupDetailsOrGroupId: { readonly groupId: number } | number, details?: unknown): void
	{
		const groupId = typeof groupDetailsOrGroupId === 'number' ? groupDetailsOrGroupId : groupDetailsOrGroupId.groupId;
		const resolvedDetails = typeof groupDetailsOrGroupId === 'number' ? details : groupDetailsOrGroupId;

		this._groupDetails.set(groupId, resolvedDetails);

		if (this._view)
		{
			this._view.onGroupDetailsArrived(groupId);
		}
	}

	/**
	 * Get cached group details.
	 *
	 * @param groupId - The group ID
	 * @returns The cached group details, or undefined
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as getCachedGroupDetails()
	 */
	getCachedGroupDetails(groupId: number): unknown
	{
		return this._groupDetails.get(groupId);
	}

	/**
	 * Request group info from the server.
	 *
	 * @param groupId - The group ID
	 * @param _flag - Whether to request full details
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as getGuildInfo()
	 */
	getGuildInfo(groupId: number, _flag: boolean = true): void
	{
		this.send(new GetHabboGroupDetailsMessageComposer(groupId, _flag));
	}

	/**
	 * Send navigator window preferences to the server.
	 *
	 * @param x - X position
	 * @param y - Y position
	 * @param width - Window width
	 * @param height - Window height
	 * @param leftPaneHidden - Whether left pane is hidden
	 * @param tabIndex - Active tab index
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as sendWindowPreferences()
	 */
	sendWindowPreferences(x: number, y: number, width: number, height: number, leftPaneHidden: boolean, tabIndex: number): void
	{
		this.send(new SetNewNavigatorWindowPreferencesMessageComposer(x, y, width, height, leftPaneHidden, tabIndex));
	}

	/**
	 * Request an extended user profile.
	 *
	 * @param userId - The user ID
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as getExtendedProfile()
	 */
	getExtendedProfile(userId: number): void
	{
		this.send(new GetExtendedProfileMessageComposer(userId));
	}

	/**
	 * Open the room creation dialog via the legacy navigator wrapper.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as createRoom()
	 */
	createRoom(): void
	{
		this._legacyNavigatorWrapper?.roomCreateViewCtrl.show();
	}

	/**
	 * Refresh the current results in the view.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as refresh()
	 */
	refresh(): void
	{
		if (this._currentResults && this._view)
		{
			this._view.onSearchResults(this._currentResults);
		}
	}

	/**
	 * Handle incoming navigation deep links.
	 *
	 * Supports: goto/<roomId|home>, search/<query>, tag/<tag>, tab/<code>, report/<id>/<data>
	 *
	 * @param link - The link URL to handle
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as linkReceived()
	 */
	linkReceived(link: string): void
	{
		const parts = link.split('/');

		if (parts.length < 2) return;

		switch (parts[1])
		{
			case 'goto':
				if (parts.length > 2)
				{
					if (parts[2] === 'home')
					{
						this._legacyNavigatorWrapper?.goToHomeRoom();
					}
					else
					{
						const roomId = parseInt(parts[2], 10);

						if (roomId > 0)
						{
							this._legacyNavigatorWrapper?.goToPrivateRoom(roomId);
						}
						else
						{
							this.send(new ForwardToSomeRoomMessageComposer(parts[2]));
						}
					}
				}
				break;
			case 'search':
				if (parts.length > 2)
				{
					this.performSearch(ViewModeCode.HOTEL_VIEW, parts[2]);
				}
				break;
			case 'tag':
				if (parts.length > 2)
				{
					this.performSearch(ViewModeCode.HOTEL_VIEW, parts[2]);
				}
				break;
			case 'tab':
				if (parts.length > 2)
				{
					this.performSearch(parts[2]);
				}
				break;
			default:
				log.warn(`Unknown navigator link type: ${parts[1]}`);
		}
	}

	/**
	 * Show the toolbar hover menu.
	 * Stub — empty in AS3.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as showToolbarHover()
	 */
	showToolbarHover(_point: { readonly x: number; readonly y: number } | number, _y: number = 0): void
	{
		// Stub — empty in AS3
	}

	/**
	 * Hide the toolbar hover menu.
	 * Stub — empty in AS3.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as hideToolbarHover()
	 */
	hideToolbarHover(_force: boolean): void
	{
		// Stub — empty in AS3
	}

	/**
	 * Track a navigator event via the tracking system.
	 *
	 * @param action - The event action
	 * @param category - The event category
	 * @param label - Optional label
	 * @param value - Optional numeric value
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as trackEventLog()
	 */
	trackEventLog(action: string, category: string, label: string = '', value: number = 0): void
	{
		if (this._tracking)
		{
			this._tracking.trackEventLog('NewNavigator', category, action, label, value);
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

		this._legacyNavigatorWrapper?.dispose();
		this._legacyNavigatorWrapper = null;
		this._view?.dispose();
		this._view = null;
		this._incomingMessages?.dispose();
		this._navigatorEvents.removeAllListeners();
		this._windowManager = null;
		this._communication = null;
		this._legacyNavigator = null;
		this._roomSessionManager = null;
		this._localization = null;
		this._sessionData = null;
		this._habboHelp = null;
		this._tracking = null;
		this._groupDetails.clear();
		this._roomNames.clear();

		log.info('New Navigator disposed');

		super.dispose();
	}

	/**
	 * Initialize the navigator component.
	 *
	 * Creates incoming message handlers and the navigator view,
	 * then sends the init message to the server.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as initComponent()
	 */
	protected override initComponent(): void
	{
		this._incomingMessages = new NewIncomingMessages(this);
		this._view = new NavigatorView(this);

		// Create the LegacyNavigator wrapper bridging new and old navigators
		if (this._legacyNavigator)
		{
			this._legacyNavigatorWrapper = new LegacyNavigator(this, this._legacyNavigator as HabboNavigator);
		}

		this.send(new NewNavigatorInitComposer());

		this._isInitialized = true;

		log.info('New Navigator initialized');
	}

	/**
	 * Handle navigator phase-two perk changes.
	 *
	 * @see sources/win63_version/habbo/navigator/HabboNewNavigator.as onPerksUpdated()
	 */
	private onPerksUpdated(_event: PerksUpdatedEvent): void
	{
		const hasPhaseTwoNavigator = this._sessionData?.isPerkAllowed('NAVIGATOR_PHASE_TWO_2014') ?? false;

		if (!hasPhaseTwoNavigator)
		{
			this.context.removeLinkEventTracker(this);

			if (this._isInitialized)
			{
				this._incomingMessages?.removeLegacyMessageListeners();
				this.close();
			}

			return;
		}

		if (!this._isInitialized)
		{
			this.initComponent();
		}
		else if (hasPhaseTwoNavigator)
		{
			this._incomingMessages?.addMessageListeners();
		}
	}

	/**
	 * Handle toolbar click events.
	 *
	 * Toggles the navigator when the NAVIGATOR icon is clicked.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as onHabboToolbarEvent()
	 */
	private onHabboToolbarEvent = (event: HabboToolbarEvent): void =>
	{
		if (event.type === HabboToolbarEvent.TOOLBAR_CLICK)
		{
			if (event.iconId === HabboToolbarIconEnum.NAVIGATOR)
			{
				this.toggle();
			}
		}
	};

	/**
	 * Extract room names from search results for tracking.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as extractRoomNamesFromResults()
	 */
	private extractRoomNamesFromResults(results: NavigatorSearchResultSet): void
	{
		this._roomNames.clear();

		const blocks = Array.isArray(results.blocks) ? results.blocks : [];

		for (const block of blocks)
		{
			const guestRooms = Array.isArray(block.guestRooms) ? block.guestRooms : [];

			if (guestRooms.length > 0)
			{
				for (const room of guestRooms)
				{
					this._roomNames.set(room.flatId, room.roomName);
				}
			}
		}
	}

	private send(composer: IMessageComposer<unknown[]>): void
	{
		const connection = this._communication?.connection;

		if (connection)
		{
			connection.send(composer);
		}
		else
		{
			log.debug("Connection not found");
		}
	}
}
