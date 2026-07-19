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
    readonly id: number;

    /**
	 * Room item reference ID
	 */
    readonly ref: number;

    /**
	 * Item type ID (sprite ID)
	 */
    readonly type: number;

    /**
	 * Item category (DEFAULT, WALL_PAPER, POSTER, etc.)
	 */
    readonly category: number;

    /**
	 * Stuff data (state, color, etc.)
	 */
    stuffData: IStuffData | null;

    /**
	 * Extra data (varies by item type)
	 */
    readonly extra: number;

    /**
	 * Whether the item can be recycled
	 */
    readonly recyclable: boolean;

    /**
	 * Whether the item can be traded
	 */
    readonly tradeable: boolean;

    /**
	 * Whether the item can be grouped with identical items
	 */
    readonly groupable: boolean;

    /**
	 * Whether the item can be sold on marketplace
	 */
    readonly sellable: boolean;

    /**
	 * Whether the item is a wall item (vs floor item)
	 */
    readonly isWallItem: boolean;

    /**
	 * Whether the item is rented
	 */
    readonly isRented: boolean;

    /**
	 * Seconds until rental expires (-1 if not rented)
	 */
    readonly secondsToExpiration: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/items/FurnitureItem.as::get expirationTimeStamp()
    readonly expirationTimeStamp: number;

    /**
	 * Whether the rent period has started
	 */
    readonly hasRentPeriodStarted: boolean;

    /**
	 * Whether the item is locked (in trade, recycler, etc.)
	 */
    locked: boolean;

    /**
	 * Flat/room ID where the item is placed (0 if in inventory)
	 */
    readonly flatId: number;

    /**
	 * Slot ID for certain item types
	 */
    readonly slotId: string;

    /**
	 * Song ID for music items
	 */
    readonly songId: number;

    /**
	 * Creation day
	 */
    readonly creationDay: number;

    /**
	 * Creation month
	 */
    readonly creationMonth: number;

    /**
	 * Creation year
	 */
    readonly creationYear: number;
}
