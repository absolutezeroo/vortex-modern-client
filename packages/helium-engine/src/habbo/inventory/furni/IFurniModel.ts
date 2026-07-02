import type {GroupItem} from '../items/GroupItem';
import type {FurnitureItem} from '../items/FurnitureItem';
import type {FurnitureItemData} from '../items/FurnitureItemData';
import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * Interface for FurniModel
 *
 * Based on AS3 com.sulake.habbo.inventory.furni.FurniModel (ENGINE only)
 * No events - UI updates handled by SolidJS stores via registerMessageEvent
 */
export interface IFurniModel
{
	readonly disposed: boolean;
	readonly isListInitialized: boolean;
	readonly furniData: GroupItem[];
	readonly showingRentedFurni: boolean;

	dispose(): void;

	/**
	 * Insert furniture from server message (full list)
	 * Returns info about what changed for the store to update signals
	 */
	insertFurniture(items: Map<number, FurnitureItemData>): {
		addedCount: number;
		removedCount: number;
		isFirstLoad: boolean;
	};

	/**
	 * Add or update a single item
	 * Returns the group item affected and if it's new
	 */
	addOrUpdateItem(item: FurnitureItem, isInitializing: boolean): {
		groupItem: GroupItem;
		isNewGroup: boolean;
	};

	/**
	 * Remove a furniture item by ID
	 * Returns the affected group item if found
	 */
	removeFurni(itemId: number): GroupItem | null;

	/**
	 * Clear all furniture
	 */
	clearFurniList(): void;

	/**
	 * Get currently selected group item
	 */
	getSelectedItem(): GroupItem | null;

	/**
	 * Remove all selections
	 */
	removeSelections(): void;

	/**
	 * Select the first available item
	 */
	selectFirstItem(): GroupItem | null;

	/**
	 * Select a specific group item
	 */
	selectItem(groupItem: GroupItem): void;

	/**
	 * Find group item containing a furniture with this ID
	 */
	getItemById(itemId: number): GroupItem | null;

	/**
	 * Alias for getItemById (AS3 compatibility)
	 */
	getItemWithStripId(stripId: number): GroupItem | null;

	/**
	 * Find group item by furniture type ID
	 */
	getGroupItemByItemTypeId(typeId: number, isWallItem: boolean): GroupItem | null;

	/**
	 * Update item locks based on list of locked reference IDs
	 */
	updateItemLocks(lockedRefIds: number[]): void;

	/**
	 * Lock a specific item
	 */
	addLockTo(itemId: number): void;

	/**
	 * Unlock a specific item
	 */
	removeLockFrom(itemId: number): void;

	/**
	 * Remove all locks
	 */
	removeAllLocks(): void;

	/**
	 * Switch category (furni / rentables)
	 */
	categorySwitch(category: 'furni' | 'rentables'): void;

	/**
	 * Reset unseen flags for current category
	 * Returns IDs to send to server
	 */
	resetUnseenItems(): number[];

	/**
	 * Update unseen flags on items based on tracker
	 */
	updateUnseenItems(unseenIds: number[]): void;

	// AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::getWindowContainer()
	getWindowContainer(): IWindowContainer | null;

	// AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::requestInitialization()
	requestInitialization(): void;

	// AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::subCategorySwitch()
	subCategorySwitch(category: string): void;

	// AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::closingInventoryView()
	closingInventoryView(): void;

	// AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::updateView()
	updateView(): void;

	// AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::selectItemById()
	selectItemById(itemId: string): void;
}
