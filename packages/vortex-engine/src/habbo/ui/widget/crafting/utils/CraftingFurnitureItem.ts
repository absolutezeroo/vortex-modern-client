import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';

/**
 * One entry in the crafting widget's grids: either a public recipe (`recipeCode`/`productCode`
 * set) or a plain inventory/mixer item (both null). Tracks which of its owner's inventory ids are
 * still free versus already sitting in the mixer, so a removed mixer item returns the exact id it
 * came from.
 *
 * AS3 extends `flash.events.EventDispatcher`, but no ported caller ever adds a listener to a
 * `CraftingFurnitureItem` instance (checked against all 13 crafting widget files) — the
 * EventDispatcher base is inert AS3 boilerplate here, so this port drops it rather than carry a
 * dead EventEmitter mixin.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/utils/CraftingFurnitureItem.as
 */
export class CraftingFurnitureItem
{
    // AS3: .../utils/CraftingFurnitureItem.as::_recipeCode
    private _recipeCode: string | null;

    // AS3: .../utils/CraftingFurnitureItem.as::_productCode
    private _productCode: string | null;

    // AS3: .../utils/CraftingFurnitureItem.as::_SafeStr_5194 (furnitureData)
    private _furnitureData: IFurnitureData | null;

    // AS3: .../utils/CraftingFurnitureItem.as::_SafeStr_6300 (inventoryIds — the ids still free)
    private _inventoryIds: number[] = [];

    // AS3: .../utils/CraftingFurnitureItem.as::_SafeStr_7969 (the ids currently in the mixer)
    private _takenIds: number[] = [];

    // AS3: .../utils/CraftingFurnitureItem.as::CraftingFurnitureItem()
    constructor(recipeCode: string | null, productCode: string | null, furnitureData: IFurnitureData | null)
    {
        this._recipeCode = recipeCode;
        this._productCode = productCode;
        this._furnitureData = furnitureData;
    }

    // AS3: .../utils/CraftingFurnitureItem.as::get recipeCode()
    get recipeCode(): string | null
    {
        return this._recipeCode;
    }

    // AS3: .../utils/CraftingFurnitureItem.as::get furnitureData()
    get furnitureData(): IFurnitureData | null
    {
        return this._furnitureData;
    }

    // AS3: .../utils/CraftingFurnitureItem.as::get productCode()
    get productCode(): string | null
    {
        return this._productCode;
    }

    // AS3: .../utils/CraftingFurnitureItem.as::get typeId()
    get typeId(): number
    {
        return this._furnitureData ? this._furnitureData.id : -1;
    }

    // AS3: .../utils/CraftingFurnitureItem.as::get countInInventory()
    get countInInventory(): number
    {
        return this._inventoryIds ? this._inventoryIds.length : 0;
    }

    // AS3: .../utils/CraftingFurnitureItem.as::set inventoryIds()
    set inventoryIds(value: number[])
    {
        this._inventoryIds = value;
    }

    // AS3: .../utils/CraftingFurnitureItem.as::getItemToMixer()
    getItemToMixer(): number
    {
        if(this.countInInventory === 0) return 0;

        const id = this._inventoryIds.shift() as number;

        this._takenIds.push(id);

        return id;
    }

    // AS3: .../utils/CraftingFurnitureItem.as::returnItemToInventory()
    returnItemToInventory(id: number): void
    {
        this._inventoryIds.push(id);
        this._takenIds.splice(this._takenIds.indexOf(id), 1);
    }
}
