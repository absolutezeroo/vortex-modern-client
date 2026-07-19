/**
 * Dispatched whenever the unseen-item counts change, so views can refresh their badges.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboUnseenItemsUpdatedEvent.as
 */
export class HabboUnseenItemsUpdatedEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboUnseenItemsUpdatedEvent.as:9
    public static readonly HUIUE_UNSEEN_ITEMS_CHANGED: string = 'HUIUE_UNSEEN_ITEMS_CHANGED';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboUnseenItemsUpdatedEvent.as:13
    private _categoryCounts: Map<number, number> = new Map();

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboUnseenItemsUpdatedEvent.as:11
    private _inventoryCount: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboUnseenItemsUpdatedEvent.as::get inventoryCount()
    get inventoryCount(): number
    {
        return this._inventoryCount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboUnseenItemsUpdatedEvent.as::set inventoryCount()
    set inventoryCount(value: number)
    {
        this._inventoryCount = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboUnseenItemsUpdatedEvent.as::setCategoryCount()
    setCategoryCount(category: number, count: number): void
    {
        this._categoryCounts.set(category, count);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboUnseenItemsUpdatedEvent.as::getCategoryCount()
    getCategoryCount(category: number): number
    {
        return this._categoryCounts.get(category) ?? 0;
    }
}
