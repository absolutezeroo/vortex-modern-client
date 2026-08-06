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
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::get homeRoomId()
    readonly homeRoomId: number;

    /**
	 * Get the entered guest room data
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::get enteredGuestRoomData()
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
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::goToHomeRoom()
    goToHomeRoom(): boolean;

    /**
	 * Perform a tag search
	 * @param tag The tag to search for
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::performTagSearch()
    performTagSearch(tag: string): void;

    /**
	 * Perform a text search
	 * @param searchText The text to search for
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::performTextSearch()
    performTextSearch(searchText: string): void;

    /**
	 * Perform a guild base search
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::performGuildBaseSearch()
    performGuildBaseSearch(): void;

    /**
	 * Perform a competition rooms search
	 * @param goalId The goal ID
	 * @param pageIndex The page index
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::performCompetitionRoomsSearch()
    performCompetitionRoomsSearch(goalId: number, pageIndex: number): void;

    /**
	 * Show the user's own rooms
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::showOwnRooms()
    showOwnRooms(): void;

    /**
	 * Go to a private room
	 * @param roomId The room ID
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::goToPrivateRoom()
    goToPrivateRoom(roomId: number): void;

    /**
	 * Check if user has room rights but is not owner
	 * @param roomId The room ID
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::hasRoomRightsButIsNotOwner()
    hasRoomRightsButIsNotOwner(roomId: number): boolean;

    /**
	 * Remove room rights for a room
	 * @param roomId The room ID
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::removeRoomRights()
    removeRoomRights(roomId: number): void;

    /**
	 * Go to a room in the network
	 * @param roomId The room ID
	 * @param useHomeRoom Whether to use home room as fallback
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::goToRoomNetwork()
    goToRoomNetwork(roomId: number, useHomeRoom: boolean): void;

    /**
	 * Start room creation process
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::startRoomCreation()
    startRoomCreation(): void;

    /**
	 * Create a new room
	 */
    createRoom(name: string, description: string, model: string, categoryId: number, maxUsers: number, tradeMode: number): void;

    /**
	 * Open the navigator window
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::openNavigator()
    openNavigator(): void;

    /**
	 * Close the navigator window
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::closeNavigator()
    closeNavigator(): void;

    /**
	 * Toggle room info visibility
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::toggleRoomInfoVisibility()
    toggleRoomInfoVisibility(): void;

    /**
	 * Check if the current room can be rated
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/IHabboNavigator.as::canRateRoom()
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
