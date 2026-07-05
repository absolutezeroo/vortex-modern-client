import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import {INVENTORY_CATEGORIES} from './enum';

/**
 * Tracks items the user hasn't viewed yet
 *
 * Based on AS3 com.sulake.habbo.inventory.UnseenItemTracker
 */
export class UnseenItemTracker
{
    private _communication: IHabboCommunicationManager;
    private _unseenItems: Map<number, Set<number>> = new Map();

    constructor(communication: IHabboCommunicationManager)
    {
        this._communication = communication;
    }

    /**
	 * Check if an item is unseen
	 */
    isUnseen(category: number, itemId: number): boolean
    {
        const items = this._unseenItems.get(category);

        return items?.has(itemId) ?? false;
    }

    /**
	 * Get all unseen item IDs for a category
	 */
    getIds(category: number): number[]
    {
        const items = this._unseenItems.get(category);

        return items ? Array.from(items) : [];
    }

    /**
	 * Get count of unseen items in a category
	 */
    getCount(category: number): number
    {
        return this._unseenItems.get(category)?.size ?? 0;
    }

    /**
	 * Get total count of all unseen inventory items
	 */
    getTotalInventoryCount(): number
    {
        let total = 0;

        for(const category of INVENTORY_CATEGORIES)
        {
            total += this.getCount(category);
        }

        return total;
    }

    /**
	 * Add unseen items to a category
	 */
    addItems(category: number, itemIds: number[]): void
    {
        if(!itemIds?.length)
        {
            return;
        }

        let items = this._unseenItems.get(category);

        if(!items)
        {
            items = new Set();
            this._unseenItems.set(category, items);
        }

        for(const itemId of itemIds)
        {
            items.add(itemId);
        }

        this.sendUpdateEvent();
    }

    /**
	 * Remove a single unseen item
	 */
    removeUnseen(category: number, itemId: number): boolean
    {
        const items = this._unseenItems.get(category);

        if(items?.has(itemId))
        {
            items.delete(itemId);
            this.sendUpdateEvent();

            return true;
        }

        return false;
    }

    /**
	 * Reset all unseen items in a category
	 */
    resetCategory(category: number): boolean
    {
        if(this.getCount(category) === 0)
        {
            return false;
        }

        this._unseenItems.delete(category);
        this.sendResetCategoryMessage(category);
        this.sendUpdateEvent();

        return true;
    }

    /**
	 * Reset specific items in a category
	 */
    resetItems(category: number, itemIds: number[]): boolean
    {
        const items = this._unseenItems.get(category);

        if(!items || items.size === 0)
        {
            return false;
        }

        for(const itemId of itemIds)
        {
            items.delete(itemId);
        }

        this.sendResetItemsMessage(category, itemIds);
        this.sendUpdateEvent();

        return true;
    }

    /**
	 * Reset category if it's empty
	 */
    resetCategoryIfEmpty(category: number): boolean
    {
        if(this.getCount(category) === 0)
        {
            this._unseenItems.delete(category);
            this.sendResetCategoryMessage(category);
            this.sendUpdateEvent();

            return true;
        }

        return false;
    }

    /**
	 * Dispose the tracker
	 */
    dispose(): void
    {
        this._unseenItems.clear();
    }

    /**
	 * Send update event with current counts
	 */
    private sendUpdateEvent(): void
    {
        const categoryCounts = new Map<number, number>();

        let inventoryCount = 0;

        for(const category of INVENTORY_CATEGORIES)
        {
            const count = this.getCount(category);

            categoryCounts.set(category, count);
            inventoryCount += count;
        }
    }

    /**
	 * Send reset category message to server
	 */
    private sendResetCategoryMessage(category: number): void
    {
        // TODO: Send ResetUnseenItemsComposer when composers are implemented
        // this._communication.connection?.send(new ResetUnseenItemsComposer(category));
    }

    /**
	 * Send reset items message to server
	 */
    private sendResetItemsMessage(category: number, itemIds: number[]): void
    {
        // TODO: Send ResetUnseenItemIdsComposer when composers are implemented
        // this._communication.connection?.send(new ResetUnseenItemIdsComposer(category, itemIds));
    }
}
