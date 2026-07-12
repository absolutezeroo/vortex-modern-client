/**
 * A single occupied recycler slot: the inventory item locked into it while recycling.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/FurniSlotItem.as
 */
export class FurniSlotItem
{
    private _id: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/FurniSlotItem.as::get id()
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/FurniSlotItem.as::set id()
    get id(): number
    {
        return this._id;
    }

    set id(value: number)
    {
        this._id = value;
    }

    private _category: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/FurniSlotItem.as::get category()
    get category(): number
    {
        return this._category;
    }

    private _typeId: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/FurniSlotItem.as::get typeId()
    get typeId(): number
    {
        return this._typeId;
    }

    private _xxxExtra: string | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/FurniSlotItem.as::get xxxExtra()
    get xxxExtra(): string | null
    {
        return this._xxxExtra;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/FurniSlotItem.as::FurniSlotItem()
    constructor(id: number, category: number, typeId: number = 0, xxxExtra: string | null = null)
    {
        this._id = id;
        this._category = category;
        this._typeId = typeId;
        this._xxxExtra = xxxExtra;
    }
}
