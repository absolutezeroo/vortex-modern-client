import type {IFurnitureItem} from './IFurnitureItem';
import type {IStuffData} from './IStuffData';
import {FurnitureItem} from './FurnitureItem';
import {FurnitureCategory} from '../enum';

/**
 * Groups identical furniture items together
 *
 * Based on AS3 com.sulake.habbo.inventory.items.GroupItem
 * This is the ENGINE-only version, UI code is handled by SolidJS
 */
export class GroupItem
{
	private _items: Map<number, FurnitureItem> = new Map();

	constructor(
		type: number,
		category: number,
		stuffData: IStuffData | null,
		extra: number
	)
	{
		this._type = type;
		this._category = category;
		this._stuffData = stuffData;
		this._extra = extra;
	}

	private _type: number;

	get type(): number
	{
		return this._type;
	}

	private _category: number;

	get category(): number
	{
		return this._category;
	}

	private _stuffData: IStuffData | null;

	get stuffData(): IStuffData | null
	{
		return this._stuffData;
	}

	private _extra: number;

	get extra(): number
	{
		return this._extra;
	}

	private _isLocked: boolean = false;

	get isLocked(): boolean
	{
		return this._isLocked;
	}

	set isLocked(value: boolean)
	{
		this._isLocked = value;
	}

	private _isSelected: boolean = false;

	get isSelected(): boolean
	{
		return this._isSelected;
	}

	set isSelected(value: boolean)
	{
		this._isSelected = value;
	}

	private _hasUnseenItems: boolean = false;

	get hasUnseenItems(): boolean
	{
		return this._hasUnseenItems;
	}

	set hasUnseenItems(value: boolean)
	{
		this._hasUnseenItems = value;
	}

	private _name: string = '';

	get name(): string
	{
		return this._name;
	}

	set name(value: string)
	{
		this._name = value;
	}

	private _description: string = '';

	get description(): string
	{
		return this._description;
	}

	set description(value: string)
	{
		this._description = value;
	}

	private _selectedItemIndex: number = -1;

	get selectedItemIndex(): number
	{
		if (this._selectedItemIndex >= this._items.size)
		{
			this._selectedItemIndex = Math.max(0, this._items.size - 1);
		}

		return this._selectedItemIndex;
	}

	set selectedItemIndex(value: number)
	{
		if (value >= this._items.size)
		{
			value = 0;
		}

		this._selectedItemIndex = value;
	}

	get isWallItem(): boolean
	{
		const item = this.getAt(0);

		return item?.isWallItem ?? false;
	}

	get flatId(): number
	{
		const item = this.getAt(0);

		return item?.flatId ?? -1;
	}

	get isGroupable(): boolean
	{
		const item = this.getAt(0);

		return item?.groupable ?? true;
	}

	get isRented(): boolean
	{
		const item = this.getAt(0);

		return item?.isRented ?? false;
	}

	/**
	 * Add an item to the group
	 */
	push(item: FurnitureItem, isUnseen: boolean = false): void
	{
		const existing = this._items.get(item.id);

		if (!existing)
		{
			this._items.set(item.id, item);
		}
		else
		{
			existing.locked = false;
		}

		if (isUnseen)
		{
			this._hasUnseenItems = true;
		}
	}

	/**
	 * Remove and return the last item
	 */
	pop(): FurnitureItem | null
	{
		if (this._items.size === 0)
		{
			return null;
		}

		const items = Array.from(this._items.values());
		const item = items[items.length - 1];

		this._items.delete(item.id);

		return item;
	}

	/**
	 * Get the last item without removing it
	 */
	peek(): FurnitureItem | null
	{
		if (this._items.size === 0)
		{
			return null;
		}

		const items = Array.from(this._items.values());

		return items[items.length - 1];
	}

	/**
	 * Get item at index
	 */
	getAt(index: number): FurnitureItem | null
	{
		const items = Array.from(this._items.values());

		return items[index] ?? null;
	}

	/**
	 * Get item by ID
	 */
	getItem(itemId: number): FurnitureItem | null
	{
		return this._items.get(itemId) ?? null;
	}

	/**
	 * Remove item by ID
	 */
	remove(itemId: number): FurnitureItem | null
	{
		const item = this._items.get(itemId);

		if (item)
		{
			this._items.delete(itemId);
		}

		return item ?? null;
	}

	/**
	 * Replace item
	 */
	replaceItem(itemId: number, item: FurnitureItem): void
	{
		this._items.set(itemId, item);
	}

	/**
	 * Get total item count
	 * For POST_IT items, returns sum of quantities
	 */
	getTotalCount(): number
	{
		if (this._category === FurnitureCategory.POST_IT)
		{
			let count = 0;

			for (const item of this._items.values())
			{
				const quantity = parseInt(item.stuffData?.getLegacyString() ?? '0', 10);

				count += quantity || 0;
			}

			return count;
		}

		return this._items.size;
	}

	/**
	 * Get count of unlocked items
	 */
	getUnlockedCount(): number
	{
		if (this._category === FurnitureCategory.POST_IT)
		{
			return this.getTotalCount();
		}

		let count = 0;

		for (const item of this._items.values())
		{
			if (!item.locked)
			{
				count++;
			}
		}

		return count;
	}

	/**
	 * Get count of tradeable items (unlocked and tradeable)
	 */
	getTradeableCount(): number
	{
		let count = 0;

		for (const item of this._items.values())
		{
			if (!item.locked && item.tradeable)
			{
				count++;
			}
		}

		return count;
	}

	/**
	 * Get count of recyclable items (unlocked and recyclable)
	 */
	getRecyclableCount(): number
	{
		let count = 0;

		for (const item of this._items.values())
		{
			if (!item.locked && item.recyclable)
			{
				count++;
			}
		}

		return count;
	}

	/**
	 * Lock an item by ID
	 */
	addLockTo(itemId: number): boolean
	{
		const item = this._items.get(itemId);

		if (item)
		{
			item.locked = true;
			return true;
		}

		return false;
	}

	/**
	 * Unlock an item by ID
	 */
	removeLockFrom(itemId: number): boolean
	{
		const item = this._items.get(itemId);

		if (item)
		{
			item.locked = false;
			return true;
		}

		return false;
	}

	/**
	 * Unlock all items
	 */
	removeAllLocks(): void
	{
		for (const item of this._items.values())
		{
			item.locked = false;
		}
	}

	/**
	 * Update locks based on reference IDs (items in trade)
	 */
	updateLocks(lockedRefIds: number[]): void
	{
		for (const item of this._items.values())
		{
			const shouldBeLocked = lockedRefIds.includes(item.ref);

			item.locked = shouldBeLocked;
		}
	}

	/**
	 * Get one item available for trade
	 */
	getOneForTrade(): FurnitureItem | null
	{
		// Try selected item first
		if (this._selectedItemIndex >= 0)
		{
			const selected = this.getAt(this._selectedItemIndex);

			if (selected && !selected.locked && selected.tradeable)
			{
				return selected;
			}
		}

		// Find any tradeable item
		for (const item of this._items.values())
		{
			if (!item.locked && item.tradeable)
			{
				return item;
			}
		}

		return null;
	}

	/**
	 * Get multiple items for trade
	 */
	getItemsForTrade(count: number): IFurnitureItem[]
	{
		const result: IFurnitureItem[] = [];
		const tradeItem = this.getOneForTrade();

		if (!tradeItem)
		{
			return result;
		}

		for (const item of this._items.values())
		{
			if (result.length >= count)
			{
				break;
			}

			if (!item.locked && item.tradeable && item.type === tradeItem.type)
			{
				result.push(item);
			}
		}

		return result;
	}

	/**
	 * Get one item for recycling (locks it)
	 */
	getOneForRecycle(): FurnitureItem | null
	{
		for (const item of this._items.values())
		{
			if (!item.locked && item.recyclable)
			{
				this.addLockTo(item.id);
				return item;
			}
		}

		return null;
	}

	/**
	 * Get one item for selling on marketplace
	 */
	getOneForSelling(): FurnitureItem | null
	{
		for (const item of this._items.values())
		{
			if (!item.locked && item.sellable)
			{
				return item;
			}
		}

		return null;
	}

	/**
	 * Get all furniture IDs in this group
	 */
	getFurniIds(): number[]
	{
		return Array.from(this._items.keys());
	}

	/**
	 * Get all non-rented furniture IDs
	 */
	getNonRentedFurnitureIds(): number[]
	{
		const ids: number[] = [];

		for (const item of this._items.values())
		{
			if (!item.isRented)
			{
				ids.push(item.id);
			}
		}

		return ids;
	}

	/**
	 * Minimum items to show counter in UI
	 */
	getMinimumItemsToShowCounter(): number
	{
		return 2;
	}

	/**
	 * Dispose the group
	 */
	dispose(): void
	{
		this._items.clear();
		this._stuffData = null;
	}
}
