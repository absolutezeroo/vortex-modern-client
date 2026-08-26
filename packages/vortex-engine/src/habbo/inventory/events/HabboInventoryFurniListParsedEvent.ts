/**
 * Dispatched on HabboInventory's event emitter once a furni-list category finishes parsing.
 *
 * TODO(AS3): `HabboInventory.ts` does not yet emit `HFLPE_FURNI_LIST_PARSED` anywhere (a pre-existing
 * gap, not introduced here — see also `HabboInventoryCategoryInitializeEvent`, which is equally
 * unemitted). `CraftingWidgetHandler` still listens for it, matching AS3 exactly, so it starts
 * firing the moment that emission is wired up.
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
