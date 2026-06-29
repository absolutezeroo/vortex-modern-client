import type {IFurniModel} from './IFurniModel';
import type {IStuffData} from '../items/IStuffData';
import type {FurnitureItemData} from '../items/FurnitureItemData';
import {GroupItem} from '../items/GroupItem';
import {FurnitureItem} from '../items/FurnitureItem';
import {FurnitureCategory} from '../enum';

/**
 * Manages furniture inventory data
 *
 * Based on AS3 com.sulake.habbo.inventory.furni.FurniModel (ENGINE only)
 * UI updates handled by SolidJS stores via registerMessageEvent
 */
export class FurniModel implements IFurniModel
{
	private _currentCategory: 'furni' | 'rentables' = 'furni';
	private _categorySelections: Map<string, GroupItem | null> = new Map();

	constructor()
	{
		this._categorySelections.set('furni', null);
		this._categorySelections.set('rentables', null);
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	private _isListInitialized: boolean = false;

	get isListInitialized(): boolean
	{
		return this._isListInitialized;
	}

	private _furniData: GroupItem[] = [];
	private _furniDataSet: Set<GroupItem> = new Set();

	get furniData(): GroupItem[]
	{
		return this._furniData;
	}

	private _showingRentedFurni: boolean = false;

	get showingRentedFurni(): boolean
	{
		return this._showingRentedFurni;
	}

	dispose(): void
	{
		if (this._disposed) return;

		for (const group of this._furniData)
		{
			group.dispose();
		}

		this._furniData.length = 0;
		this._furniDataSet.clear();
		this._categorySelections.clear();
		this._disposed = true;
	}

	insertFurniture(items: Map<number, FurnitureItemData>): {
		addedCount: number;
		removedCount: number;
		isFirstLoad: boolean;
	}
	{
		const existingIds = this.getAllStripIds();
		const newIds = new Set(items.keys());
		const isFirstLoad = existingIds.size === 0;

		// Find IDs to add and remove
		const idsToAdd: number[] = [];
		const idsToRemove: number[] = [];

		for (const id of newIds)
		{
			if (!existingIds.has(id))
			{
				idsToAdd.push(id);
			}
		}

		for (const id of existingIds)
		{
			if (!newIds.has(id))
			{
				idsToRemove.push(id);
			}
		}

		// Remove items no longer in list
		for (const id of idsToRemove)
		{
			this.removeFurni(id);
		}

		// Add new items
		for (const id of idsToAdd)
		{
			const data = items.get(id);

			if (data)
			{
				const item = new FurnitureItem(data);

				this.addOrUpdateItem(item, true);
			}
		}

		this._isListInitialized = true;

		// Select first item if needed
		if (isFirstLoad || this.getSelectedItem() === null)
		{
			this.selectFirstItem();
		}

		return {
			addedCount: idsToAdd.length,
			removedCount: idsToRemove.length,
			isFirstLoad,
		};
	}

	addOrUpdateItem(item: FurnitureItem, isInitializing: boolean): {
		groupItem: GroupItem;
		isNewGroup: boolean;
	}
	{
		let result: { groupItem: GroupItem; isNewGroup: boolean };

		// Non-groupable items get their own group (except MONSTERPLANT_SEED)
		if (!item.groupable && item.category !== FurnitureCategory.MONSTERPLANT_SEED)
		{
			result = this.addOrUpdateNonGroupableItem(item, isInitializing);
		}
		else
		{
			result = this.addOrUpdateGroupableItem(item, isInitializing);
		}

		// Mark as unseen if not initializing
		if (!isInitializing)
		{
			result.groupItem.hasUnseenItems = true;
		}

		return result;
	}

	removeFurni(itemId: number): GroupItem | null
	{
		for (let i = 0; i < this._furniData.length; i++)
		{
			const groupItem = this._furniData[i];
			const removedItem = groupItem.remove(itemId);

			if (removedItem)
			{
				// If group is empty, remove it
				if (groupItem.getTotalCount() <= 0)
				{
					this._furniDataSet.delete(groupItem);
					this._furniData.splice(i, 1);

					// If this was selected, select first item
					if (groupItem.isSelected)
					{
						this.selectFirstItem();
					}

					groupItem.dispose();
				}

				return groupItem;
			}
		}

		return null;
	}

	clearFurniList(): void
	{
		for (const group of this._furniData)
		{
			group.dispose();
		}

		this._furniData.length = 0;
		this._furniDataSet.clear();
		this._isListInitialized = false;
	}

	getSelectedItem(): GroupItem | null
	{
		for (const groupItem of this._furniData)
		{
			if (groupItem.isSelected)
			{
				return groupItem;
			}
		}

		return null;
	}

	removeSelections(): void
	{
		for (const groupItem of this._furniData)
		{
			groupItem.isSelected = false;
		}
	}

	selectFirstItem(): GroupItem | null
	{
		this.removeSelections();

		// Find first item matching current category filter
		for (const groupItem of this._furniData)
		{
			if (this._showingRentedFurni === groupItem.isRented)
			{
				groupItem.isSelected = true;
				groupItem.selectedItemIndex = -1;
				this._categorySelections.set(this._currentCategory, groupItem);

				return groupItem;
			}
		}

		return null;
	}

	selectItem(groupItem: GroupItem): void
	{
		this.removeSelections();
		groupItem.isSelected = true;
		groupItem.selectedItemIndex = -1;
		this._categorySelections.set(this._currentCategory, groupItem);
	}

	getItemById(itemId: number): GroupItem | null
	{
		for (const groupItem of this._furniData)
		{
			if (groupItem.getItem(itemId) !== null)
			{
				return groupItem;
			}
		}

		return null;
	}

	getItemWithStripId(stripId: number): GroupItem | null
	{
		return this.getItemById(stripId);
	}

	getGroupItemByItemTypeId(typeId: number, isWallItem: boolean): GroupItem | null
	{
		for (const groupItem of this._furniData)
		{
			if (groupItem.type === typeId && groupItem.isWallItem === isWallItem)
			{
				return groupItem;
			}
		}

		return null;
	}

	updateItemLocks(lockedRefIds: number[]): void
	{
		if (lockedRefIds.length === 0)
		{
			this.removeAllLocks();

			return;
		}

		for (const groupItem of this._furniData)
		{
			groupItem.updateLocks(lockedRefIds);
		}
	}

	addLockTo(itemId: number): void
	{
		for (const groupItem of this._furniData)
		{
			if (groupItem.addLockTo(itemId))
			{
				return;
			}
		}
	}

	removeLockFrom(itemId: number): void
	{
		for (const groupItem of this._furniData)
		{
			if (groupItem.removeLockFrom(itemId))
			{
				return;
			}
		}
	}

	removeAllLocks(): void
	{
		for (const groupItem of this._furniData)
		{
			groupItem.removeAllLocks();
		}
	}

	categorySwitch(category: 'furni' | 'rentables'): void
	{
		this._currentCategory = category;
		this._showingRentedFurni = category === 'rentables';
		this.updateCategorySelection();
	}

	resetUnseenItems(): number[]
	{
		const resetIds: number[] = [];

		for (const groupItem of this._furniData)
		{
			if (groupItem.hasUnseenItems && groupItem.isRented === this._showingRentedFurni)
			{
				groupItem.hasUnseenItems = false;
				resetIds.push(...groupItem.getFurniIds());
			}
		}

		return resetIds;
	}

	updateUnseenItems(unseenIds: number[]): void
	{
		if (unseenIds.length === 0) return;

		const unseenSet = new Set(unseenIds);

		for (const groupItem of this._furniData)
		{
			const furniIds = groupItem.getFurniIds();

			for (const id of furniIds)
			{
				if (unseenSet.has(id))
				{
					groupItem.hasUnseenItems = true;
					this.moveItemToTop(groupItem);

					break;
				}
			}
		}
	}

	private getAllStripIds(): Set<number>
	{
		const ids = new Set<number>();

		for (const groupItem of this._furniData)
		{
			let count = groupItem.getTotalCount();

			// POST_IT items count differently
			if (groupItem.category === FurnitureCategory.POST_IT)
			{
				count = 1;
			}

			for (let i = 0; i < count; i++)
			{
				const item = groupItem.getAt(i);

				if (item)
				{
					ids.add(item.id);
				}
			}
		}

		return ids;
	}

	private addOrUpdateNonGroupableItem(item: FurnitureItem, isInitializing: boolean): {
		groupItem: GroupItem;
		isNewGroup: boolean;
	}
	{
		// Find existing groups with same type
		const matchingGroups: GroupItem[] = [];

		for (const groupItem of this._furniData)
		{
			if (groupItem.type === item.type)
			{
				matchingGroups.push(groupItem);
			}
		}

		// Check if item already exists in any matching group
		for (const groupItem of matchingGroups)
		{
			if (groupItem.getItem(item.id) !== null)
			{
				return {groupItem, isNewGroup: false};
			}
		}

		// Create new group for this non-groupable item
		const isUnseen = !isInitializing;
		const groupItem = this.createGroupItem(item.type, item.category, item.stuffData, item.extra);

		groupItem.push(item, isUnseen);

		if (isUnseen)
		{
			groupItem.hasUnseenItems = true;
			this.addItemToTop(groupItem);
		}
		else
		{
			this.addItemToBottom(groupItem);
		}

		return {groupItem, isNewGroup: true};
	}

	private addOrUpdateGroupableItem(item: FurnitureItem, isInitializing: boolean): {
		groupItem: GroupItem;
		isNewGroup: boolean;
	}
	{
		const isUnseen = !isInitializing;
		let existingGroup: GroupItem | null = null;

		// Find matching group
		for (const groupItem of this._furniData)
		{
			if (groupItem.type === item.type && groupItem.isWallItem === item.isWallItem)
			{
				// MONSTERPLANT_SEED - match by rarity level
				if (item.category === FurnitureCategory.MONSTERPLANT_SEED)
				{
					if (groupItem.stuffData?.rarityLevel === item.stuffData?.rarityLevel)
					{
						existingGroup = groupItem;

						break;
					}
				}
				// Must be groupable
				else if (groupItem.isGroupable)
				{
					// POSTER - match by legacy string (color)
					if (item.category === FurnitureCategory.POSTER)
					{
						if (groupItem.stuffData?.getLegacyString() === item.stuffData?.getLegacyString())
						{
							existingGroup = groupItem;

							break;
						}
					}
					// GUILD_FURNI - match by stuffData compare
					else if (item.category === FurnitureCategory.GUILD_FURNI)
					{
						if (groupItem.stuffData && item.stuffData?.compare(groupItem.stuffData))
						{
							existingGroup = groupItem;

							break;
						}
					}
					// Default - just match by type
					else
					{
						existingGroup = groupItem;

						break;
					}
				}
			}
		}

		// Add to existing group
		if (existingGroup)
		{
			existingGroup.push(item, isUnseen);

			if (isUnseen)
			{
				existingGroup.hasUnseenItems = true;
				this.moveItemToTop(existingGroup);
			}

			return {groupItem: existingGroup, isNewGroup: false};
		}

		// Create new group
		const groupItem = this.createGroupItem(item.type, item.category, item.stuffData, item.extra);

		groupItem.push(item, isUnseen);

		if (isUnseen)
		{
			groupItem.hasUnseenItems = true;
			this.addItemToTop(groupItem);
		}
		else
		{
			this.addItemToBottom(groupItem);
		}

		return {groupItem, isNewGroup: true};
	}

	private createGroupItem(type: number, category: number, stuffData: IStuffData | null, extra: number): GroupItem
	{
		return new GroupItem(type, category, stuffData, extra);
	}

	private addItemToTop(groupItem: GroupItem): void
	{
		this._furniDataSet.add(groupItem);
		this._furniData.unshift(groupItem);
	}

	private addItemToBottom(groupItem: GroupItem): void
	{
		this._furniDataSet.add(groupItem);
		this._furniData.push(groupItem);
	}

	private removeItem(groupItem: GroupItem): void
	{
		if (this._furniDataSet.delete(groupItem))
		{
			const index = this._furniData.indexOf(groupItem);

			if (index > -1)
			{
				this._furniData.splice(index, 1);
			}
		}
	}

	private moveItemToTop(groupItem: GroupItem): void
	{
		this.removeItem(groupItem);
		this.addItemToTop(groupItem);
	}

	private updateCategorySelection(): void
	{
		this.removeSelections();

		const savedSelection = this._categorySelections.get(this._currentCategory);

		if (savedSelection && this._furniDataSet.has(savedSelection))
		{
			savedSelection.isSelected = true;
			savedSelection.selectedItemIndex = -1;
		}
		else
		{
			this.selectFirstItem();
		}
	}
}
