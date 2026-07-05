import type {EventCategory, GuestRoomData} from '../communication/messages/incoming/navigator';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {NavigatorData} from './domain';

/**
 * Interface for the Habbo Navigator component
 *
 */
export interface IHabboNavigator
{
    /**
	 * Get the navigator data model
	 */
    readonly data: NavigatorData;

    /**
	 * Get the home room ID
	 */
    readonly homeRoomId: number;

    /**
	 * Get the entered guest room data
	 */
    readonly enteredGuestRoomData: GuestRoomData | null;

    /**
	 * Get visible event categories
	 */
    readonly visibleEventCategories: EventCategory[];

    /**
	 * Get the session data manager.
	 */
    readonly sessionData: ISessionDataManager | null;

    /**
	 * Go to the user's home room
	 * @returns true if successful, false if no home room is set
	 */
    goToHomeRoom(): boolean;

    /**
	 * Perform a tag search
	 * @param tag The tag to search for
	 */
    performTagSearch(tag: string): void;

    /**
	 * Perform a text search
	 * @param searchText The text to search for
	 */
    performTextSearch(searchText: string): void;

    /**
	 * Perform a guild base search
	 */
    performGuildBaseSearch(): void;

    /**
	 * Perform a competition rooms search
	 * @param goalId The goal ID
	 * @param pageIndex The page index
	 */
    performCompetitionRoomsSearch(goalId: number, pageIndex: number): void;

    /**
	 * Show the user's own rooms
	 */
    showOwnRooms(): void;

    /**
	 * Go to a private room
	 * @param roomId The room ID
	 */
    goToPrivateRoom(roomId: number): void;

    /**
	 * Check if user has room rights but is not owner
	 * @param roomId The room ID
	 */
    hasRoomRightsButIsNotOwner(roomId: number): boolean;

    /**
	 * Remove room rights for a room
	 * @param roomId The room ID
	 */
    removeRoomRights(roomId: number): void;

    /**
	 * Go to a room in the network
	 * @param roomId The room ID
	 * @param useHomeRoom Whether to use home room as fallback
	 */
    goToRoomNetwork(roomId: number, useHomeRoom: boolean): void;

    /**
	 * Start room creation process
	 */
    startRoomCreation(): void;

    /**
	 * Create a new room
	 */
    createRoom(name: string, description: string, model: string, categoryId: number, maxUsers: number, tradeMode: number): void;

    /**
	 * Open the navigator window
	 */
    openNavigator(): void;

    /**
	 * Close the navigator window
	 */
    closeNavigator(): void;

    /**
	 * Toggle room info visibility
	 */
    toggleRoomInfoVisibility(): void;

    /**
	 * Check if the current room can be rated
	 */
    canRateRoom(): boolean;

    /**
	 * Check if a room is in favourites
	 * @param roomId The room ID
	 */
    isRoomFavorite(roomId: number): boolean;

    /**
	 * Check if a room is the home room
	 * @param roomId The room ID
	 */
    isRoomHome(roomId: number): boolean;

    /**
	 * Dispose the navigator
	 */
    dispose(): void;
}
