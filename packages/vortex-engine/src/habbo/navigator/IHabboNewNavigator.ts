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
    readonly isReady: boolean;

    readonly communication: IHabboCommunicationManager;
    readonly sessionData: ISessionDataManager | null;
    readonly roomSessionManager: IRoomSessionManager | null;
    readonly windowManager: IHabboWindowManager | null;
    readonly localization: IHabboLocalizationManager | null;
    readonly habboHelp: IHabboHelp | null;
    readonly linkPattern: string;

    /**
	 * Get the legacy navigator
	 */
    readonly legacyNavigator: IHabboNavigator;

    /**
	 * The LegacyNavigator wrapper this component builds around that legacy navigator.
	 *
	 * It is where this port put the transitional half of AS3's HabboNavigator — the
	 * in-room controllers (room info, room settings, room events) all hang off it — so
	 * anything holding only the old navigator has to come back through here to reach them.
	 *
	 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/HabboNewNavigator.as::_SafeStr_5440
	 */
    readonly legacyWrapper: IHabboTransitionalNavigator | null;

    /**
	 * Get the navigator data model (from legacy navigator)
	 */
    readonly data: NavigatorData;

    /**
	 * Get the context container
	 */
    readonly contextContainer: ContextContainer;

    /**
	 * Get the search history manager
	 */
    readonly historyManager: SearchContextHistoryManager;
    readonly searchContextHistoryManager: SearchContextHistoryManager;

    readonly liftDataContainer: LiftDataContainer;
    readonly imageLibraryBaseUrl: string;
    readonly mainWindow: IWindow | null;
    readonly view: NavigatorView | null;
    newResultsRendered: boolean;

    /**
	 * Get the navigator cache
	 */
    readonly cache: NavigatorCache;

    /**
	 * Get current search results
	 */
    readonly currentResults: NavigatorSearchResultSet | null;

    /**
	 * Get collapsed categories
	 */
    readonly collapsedCategories: Set<string>;

    /**
	 * Open the navigator
	 */
    open(): void;

    /**
	 * Close the navigator
	 */
    close(): void;

    /**
	 * Toggle the navigator
	 */
    toggle(): void;

    /**
	 * Perform a search
	 */
    performSearch(searchCode: string, filtering?: string, source?: string): void;

    performSearchByContext(context: SearchContext): void;

    /**
	 * Perform the last search again
	 */
    performLastSearch(): void;

    /**
	 * Perform a tag search
	 */
    performTagSearch(tag: string): void;

    /**
	 * Perform a text search
	 */
    performTextSearch(text: string): void;

    showOwnRooms(): void;

    performGuildBaseSearch(): void;

    performCompetitionRoomsSearch(goalId: number, roomType: number): void;

    showToolbarHover(point: { x: number; y: number }): void;

    hideToolbarHover(force: boolean): void;

    /**
	 * Go back in search history
	 */
    goBack(): void;

    /**
	 * Go forward in search history
	 */
    goForward(): void;

    /**
	 * Go to a room
	 */
    goToRoom(roomId: number, source?: string): void;

    /**
	 * Go to home room
	 */
    goToHomeRoom(): void;

    /**
	 * Add a saved search
	 */
    addSavedSearch(searchCode: string, filtering: string): void;

    /**
	 * Delete a saved search
	 */
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

    sendWindowPreferences(x: number, y: number, width: number, height: number, leftPaneHidden: boolean, resultsMode: number): void;
}
