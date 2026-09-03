/**
 * Dispatched on HabboInventory's event emitter once a furni-list category finishes parsing.
 *
 * Raised by `HabboInventory.onFurniList()` once the last fragment is folded in and handed to the
 * furni model — the same point AS3 raises it. `CraftingWidgetHandler` listens for it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryFurniListParsedEvent.as
 */
export class HabboInventoryFurniListParsedEvent
{
    // AS3: .../habbo/inventory/events/HabboInventoryFurniListParsedEvent.as::_SafeStr_10649
    public static readonly HFLPE_FURNI_LIST_PARSED: string = 'HFLPE_FURNI_LIST_PARSED';

    // AS3: .../habbo/inventory/events/HabboInventoryFurniListParsedEvent.as::HabboInventoryFurniListParsedEvent()
    constructor(category: string)
    {
        this._category = category;
    }

    // AS3: .../habbo/inventory/events/HabboInventoryFurniListParsedEvent.as::_SafeStr_4689
    private _category: string;

    // AS3: .../habbo/inventory/events/HabboInventoryFurniListParsedEvent.as::get category()
    get category(): string
    {
        return this._category;
    }
}
