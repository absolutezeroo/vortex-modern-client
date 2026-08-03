/**
 * UseProductItem — one candidate pet in a "use this product on…" / "breed with…" menu.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/UseProductItem.as
 *
 * Built by AvatarInfoWidgetHandler's two scans of the room's pets and consumed by
 * UseProductView / BreedPetView, which render one bubble per item over its pet.
 */
export class UseProductItem
{
    private _id: number;
    private _category: number;
    private _name: string;
    private _requestRoomObjectId: number;
    private _targetRoomObjectId: number;
    private _requestInventoryStripId: number;
    private _replace: boolean;

    // AS3: UseProductItem.as::UseProductItem()
    constructor(
        id: number,
        category: number,
        name: string,
        requestRoomObjectId: number,
        targetRoomObjectId: number,
        requestInventoryStripId: number = -1,
        replace: boolean = false
    )
    {
        this._id = id;
        this._category = category;
        this._name = name;
        this._requestRoomObjectId = requestRoomObjectId;
        this._targetRoomObjectId = targetRoomObjectId;
        this._requestInventoryStripId = requestInventoryStripId;
        this._replace = replace;
    }

    // AS3: UseProductItem.as::get id()
    public get id(): number
    {
        return this._id;
    }

    // AS3: UseProductItem.as::get category()
    public get category(): number
    {
        return this._category;
    }

    // AS3: UseProductItem.as::get name()
    public get name(): string
    {
        return this._name;
    }

    // AS3: UseProductItem.as::get requestRoomObjectId()
    public get requestRoomObjectId(): number
    {
        return this._requestRoomObjectId;
    }

    // AS3: UseProductItem.as::get targetRoomObjectId()
    public get targetRoomObjectId(): number
    {
        return this._targetRoomObjectId;
    }

    // AS3: UseProductItem.as::get requestInventoryStripId()
    public get requestInventoryStripId(): number
    {
        return this._requestInventoryStripId;
    }

    // AS3: UseProductItem.as::get replace()
    public get replace(): boolean
    {
        return this._replace;
    }

    // AS3: UseProductItem.as::dispose()
    public dispose(): void
    {
    }
}
