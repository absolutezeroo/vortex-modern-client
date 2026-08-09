import type {IStuffData} from '@habbo/room/object/data/IStuffData';

/**
 * Interface for furniture item data
 *
 * Based on AS3 com.sulake.habbo.inventory.items.class_3393
 */
export interface IFurnitureItem
{
    /**
	 * Unique item ID in inventory
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get id()
    readonly id: number;

    /**
	 * Room item reference ID
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get ref()
    readonly ref: number;

    /**
	 * Item type ID (sprite ID)
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get type()
    readonly type: number;

    /**
	 * Item category (DEFAULT, WALL_PAPER, POSTER, etc.)
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get category()
    readonly category: number;

    /**
	 * Stuff data (state, color, etc.)
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get stuffData()
    stuffData: IStuffData | null;

    /**
	 * Extra data (varies by item type)
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get extra()
    readonly extra: number;

    /**
	 * Whether the item can be recycled
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get recyclable()
    readonly recyclable: boolean;

    /**
	 * Whether the item can be traded
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get tradeable()
    readonly tradeable: boolean;

    /**
	 * Whether the item can be grouped with identical items
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get groupable()
    readonly groupable: boolean;

    /**
	 * Whether the item can be sold on marketplace
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get sellable()
    readonly sellable: boolean;

    /**
	 * Whether the item is a wall item (vs floor item)
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get isWallItem()
    readonly isWallItem: boolean;

    /**
	 * Whether the item is rented
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get isRented()
    readonly isRented: boolean;

    /**
	 * Seconds until rental expires (-1 if not rented)
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get secondsToExpiration()
    readonly secondsToExpiration: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/items/FurnitureItem.as::get expirationTimeStamp()
    readonly expirationTimeStamp: number;

    /**
	 * Whether the rent period has started
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get hasRentPeriodStarted()
    readonly hasRentPeriodStarted: boolean;

    /**
	 * Whether the item is locked (in trade, recycler, etc.)
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get locked()
    locked: boolean;

    /**
	 * Flat/room ID where the item is placed (0 if in inventory)
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get flatId()
    readonly flatId: number;

    /**
	 * Slot ID for certain item types.
	 *
	 * Nullable, as AS3's `String` is: `FurnitureItem` copies it straight from the item data, and
	 * the trading item parser has no slot to report and returns null.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/items/FurnitureItem.as::get slotId()
    readonly slotId: string | null;

    /**
	 * Song ID for music items
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get songId()
    readonly songId: number;

    /**
	 * Creation day
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get creationDay()
    readonly creationDay: number;

    /**
	 * Creation month
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get creationMonth()
    readonly creationMonth: number;

    /**
	 * Creation year
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get creationYear()
    readonly creationYear: number;
}
