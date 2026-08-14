import type {EventEmitter} from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IHabboHelp} from '../help/IHabboHelp';
import type {IHabboLocalizationManager} from '../localization/IHabboLocalizationManager';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import type {IHabboNavigator} from './IHabboNavigator';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import type {NavigatorData} from './domain';
import type {ContextContainer, SearchContext, SearchContextHistoryManager} from './context';
import type {NavigatorCache} from './cache';
import type {LiftDataContainer} from './lift';
import type {NavigatorView} from './view/NavigatorView';
import type {NavigatorSearchResultSet} from '../communication/messages/incoming/newnavigator';
import type {IDisposable} from "@core";

/**
 * New Navigator interface
 *
 */
export interface IHabboNewNavigator extends IDisposable
{
    /**
	 * Custom navigator event emitter (NOT the Component events)
	 */
    readonly navigatorEvents: EventEmitter;

    /**
	 * Check if navigator is ready
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get isReady()
    readonly isReady: boolean;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get communication()
    readonly communication: IHabboCommunicationManager;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get sessionData()
    readonly sessionData: ISessionDataManager | null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get roomSessionManager()
    readonly roomSessionManager: IRoomSessionManager | null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get windowManager()
    readonly windowManager: IHabboWindowManager | null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get localization()
    readonly localization: IHabboLocalizationManager | null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get habboHelp()
    readonly habboHelp: IHabboHelp | null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get linkPattern()
    readonly linkPattern: string;

    /**
	 * Get the legacy navigator
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get legacyNavigator()
    readonly legacyNavigator: IHabboNavigator;

    /**
	 * The LegacyNavigator wrapper this component builds around that legacy navigator.
	 *
	 * It is where this port put the transitional half of AS3's HabboNavigator — the
	 * in-room controllers (room info, room settings, room events) all hang off it — so
	 * anything holding only the old navigator has to come back through here to reach them.
	 *
	 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/HabboNavigator.as::_SafeStr_5440
	 */
    readonly legacyWrapper: IHabboTransitionalNavigator | null;

    /**
	 * Get the navigator data model (from legacy navigator)
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get data()
    readonly data: NavigatorData;

    /**
	 * Get the context container
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get contextContainer()
    readonly contextContainer: ContextContainer;

    /**
	 * Get the search history manager
	 */
    readonly historyManager: SearchContextHistoryManager;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get searchContextHistoryManager()
    readonly searchContextHistoryManager: SearchContextHistoryManager;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get liftDataContainer()
    readonly liftDataContainer: LiftDataContainer;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get imageLibraryBaseUrl()
    readonly imageLibraryBaseUrl: string;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get mainWindow()
    readonly mainWindow: IWindow | null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get view()
    readonly view: NavigatorView | null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get newResultsRendered()
    newResultsRendered: boolean;

    /**
	 * Get the navigator cache
	 */
    readonly cache: NavigatorCache;

    /**
	 * Get current search results
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get currentResults()
    readonly currentResults: NavigatorSearchResultSet | null;

    /**
	 * Get collapsed categories
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::get collapsedCategories()
    readonly collapsedCategories: Set<string>;

    /**
	 * Open the navigator
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::open()
    open(): void;

    /**
	 * Close the navigator
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::close()
    close(): void;

    /**
	 * Toggle the navigator
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::toggle()
    toggle(): void;

    /**
	 * Perform a search
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::performSearch()
    performSearch(searchCode: string, filtering?: string, source?: string): void;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::performSearchByContext()
    performSearchByContext(context: SearchContext): void;

    /**
	 * Perform the last search again
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::performLastSearch()
    performLastSearch(): void;

    /**
	 * Perform a tag search
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::performTagSearch()
    performTagSearch(tag: string): void;

    /**
	 * Perform a text search
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::performTextSearch()
    performTextSearch(text: string): void;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::showOwnRooms()
    showOwnRooms(): void;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::performGuildBaseSearch()
    performGuildBaseSearch(): void;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::performCompetitionRoomsSearch()
    performCompetitionRoomsSearch(goalId: number, roomType: number): void;

    /**
	 * Group details arrived from the server: cache them and tell the view, which is what lets a
	 * search result draw a guild's badge and name instead of a blank.
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::onGroupDetails()
    onGroupDetails(groupDetails: { readonly groupId: number }): void;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::showToolbarHover()
    showToolbarHover(point: { x: number; y: number }): void;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::hideToolbarHover()
    hideToolbarHover(force: boolean): void;

    /**
	 * Go back in search history
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::goBack()
    goBack(): void;

    /**
	 * Go forward in search history
	 */
    goForward(): void;

    /**
	 * Go to a room
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::goToRoom()
    goToRoom(roomId: number, source?: string): void;

    /**
	 * Go to home room
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::goToHomeRoom()
    goToHomeRoom(): void;

    /**
	 * Add a saved search
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::addSavedSearch()
    addSavedSearch(searchCode: string, filtering: string): void;

    /**
	 * Delete a saved search
	 */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::deleteSavedSearch()
    deleteSavedSearch(id: number): void;

    /**
	 * Add a collapsed category
	 */
    addCollapsedCategory(category: string): void;

    /**
	 * Remove a collapsed category
	 */
    removeCollapsedCategory(category: string): void;

    /**
	 * Check if a category is collapsed
	 */
    isCategoryCollapsed(category: string): boolean;

    /**
	 * Set view mode for a search code
	 */
    setSearchCodeViewMode(searchCode: string, viewMode: number): void;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNewNavigator.as::sendWindowPreferences()
    sendWindowPreferences(x: number, y: number, width: number, height: number, leftPaneHidden: boolean, resultsMode: number): void;
}
