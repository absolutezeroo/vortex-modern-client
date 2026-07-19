/**
 * Dispatched on HabboInventory's event emitter the first time a category's list is populated.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryCategoryInitializeEvent.as
 */
export class HabboInventoryCategoryInitializeEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryCategoryInitializeEvent.as::HABBO_INVENTORY_CATEGORY_INITIALIZED
    public static readonly HABBO_INVENTORY_CATEGORY_INITIALIZED: string = 'HABBO_INVENTORY_CATEGORY_INITIALIZED';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryCategoryInitializeEvent.as::HabboInventoryCategoryInitializeEvent()
    constructor(category: string)
    {
        this._category = category;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryCategoryInitializeEvent.as:9
    private _category: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryCategoryInitializeEvent.as::get category()
    get category(): string
    {
        return this._category;
    }
}
