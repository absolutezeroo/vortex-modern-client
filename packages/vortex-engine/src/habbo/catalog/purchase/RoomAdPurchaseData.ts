/**
 * The room-ad purchase in progress: what the player typed into the room-ad catalog page before
 * pressing buy.
 *
 * `HabboCatalog` holds at most one of these at a time, and its presence is what switches
 * `purchaseProduct()` from the ordinary `PurchaseFromCatalogComposer` to
 * `PurchaseRoomAdMessageComposer` — the fields below are exactly that composer's payload.
 *
 * Note `clear()`: it deliberately leaves `_offerId` and `_expirationTime` alone. That is not an
 * oversight in the source — after a purchase the widget clears the *form*, and the surviving
 * `offerId` is what keeps `purchaseProduct()` on the room-ad branch for the same offer.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as
 */
export class RoomAdPurchaseData
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_name
    private _name: string | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_description
    private _description: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_flatId
    private _flatId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_offerId
    private _offerId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_extended
    private _extended: boolean = false;

    /**
     * Field name DERIVED from its accessor `extendedFlatId`, which is not obfuscated.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_SafeStr_8279
    private _extendedFlatId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_roomName
    private _roomName: string | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_expirationTime
    private _expirationTime: Date | null = null;

    /**
     * Field name DERIVED from its accessor `categoryId`, which is not obfuscated.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::_SafeStr_7619
    private _categoryId: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::clear()
    clear(): void
    {
        this._name = null;
        this._description = '';
        this._flatId = 0;
        this._extended = false;
        this._roomName = null;
        this._extendedFlatId = -1;
        this._categoryId = -1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get name()
    get name(): string | null
    {
        return this._name;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set name()
    set name(value: string | null)
    {
        this._name = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get description()
    get description(): string
    {
        return this._description;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set description()
    set description(value: string)
    {
        this._description = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get flatId()
    get flatId(): number
    {
        return this._flatId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set flatId()
    set flatId(value: number)
    {
        this._flatId = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set offerId()
    set offerId(value: number)
    {
        this._offerId = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get extended()
    get extended(): boolean
    {
        return this._extended;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set extended()
    set extended(value: boolean)
    {
        this._extended = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get extendedFlatId()
    get extendedFlatId(): number
    {
        return this._extendedFlatId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set extendedFlatId()
    set extendedFlatId(value: number)
    {
        this._extendedFlatId = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get roomName()
    get roomName(): string | null
    {
        return this._roomName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set roomName()
    set roomName(value: string | null)
    {
        this._roomName = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get expirationTime()
    get expirationTime(): Date | null
    {
        return this._expirationTime;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set expirationTime()
    set expirationTime(value: Date | null)
    {
        this._expirationTime = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::get categoryId()
    get categoryId(): number
    {
        return this._categoryId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RoomAdPurchaseData.as::set categoryId()
    set categoryId(value: number)
    {
        this._categoryId = value;
    }
}
