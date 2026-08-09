/**
 * PlacedObjectPurchaseData
 *
 * The ghost furni sitting in the room between "dragged out of the catalog" and "the server
 * confirmed the purchase". It is a snapshot, not a live reference: the offer's own product data is
 * copied out in the constructor (`setOfferData()`) so the record survives the offer being disposed
 * when the catalog page changes underneath it.
 *
 * `HabboCatalog` keeps exactly one of these. `resetPlacedOfferData()` removes the ghost from the
 * room again; `itemAddedToInventory()` is what converts it into a real placement once the item
 * lands in the inventory.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PlacedObjectPurchaseData.as
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {IProductData} from '@habbo/session/product/IProductData';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';

export class PlacedObjectPurchaseData implements IDisposable
{
    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_5769 (name derived: backs get disposed())
    private _disposed: boolean = false;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_4841 (name derived: backs get objectId())
    private _objectId: number;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_4689 (name derived: backs get category())
    private _category: number;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_6722 (name derived: backs get roomId())
    private _roomId: number;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_8549 (name derived: backs get wallLocation())
    private _wallLocation: string = '';

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_4555 (name derived: backs get x())
    private _x: number = 0;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_4557 (name derived: backs get y())
    private _y: number = 0;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_4615 (name derived: backs get direction())
    private _direction: number = 0;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_offerId
    private _offerId: number = 0;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_7671 (name derived: backs get productClassId())
    private _productClassId: number = 0;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_6321 (name derived: the product's IProductData)
    private _productData: IProductData | null = null;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_4620 (name derived: backs get furniData())
    private _furniData: IFurnitureData | null = null;

    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_6097 (name derived: backs get extraParameter())
    private _extraParameter: string = '';

    // AS3: .../purchase/PlacedObjectPurchaseData.as::PlacedObjectPurchaseData()
    constructor(
        roomId: number,
        objectId: number,
        category: number,
        wallLocation: string,
        x: number,
        y: number,
        direction: number,
        offer: IPurchasableOffer
    )
    {
        this._roomId = roomId;
        this._objectId = objectId;
        this._category = category;
        this._wallLocation = wallLocation;
        this._x = x;
        this._y = y;
        this._direction = direction;

        this.setOfferData(offer);
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::setOfferData()
    private setOfferData(offer: IPurchasableOffer): void
    {
        this._offerId = offer.offerId;
        this._productClassId = offer.product?.productClassId ?? 0;
        this._productData = offer.product?.productData ?? null;
        this._furniData = offer.product?.furnitureData ?? null;
        this._extraParameter = offer.product?.extraParam ?? '';
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get category()
    get category(): number
    {
        return this._category;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get wallLocation()
    get wallLocation(): string
    {
        return this._wallLocation;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get x()
    get x(): number
    {
        return this._x;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get y()
    get y(): number
    {
        return this._y;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get direction()
    get direction(): number
    {
        return this._direction;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get productClassId()
    get productClassId(): number
    {
        return this._productClassId;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get extraParameter()
    get extraParameter(): string
    {
        return this._extraParameter;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get furniData()
    get furniData(): IFurnitureData | null
    {
        return this._furniData;
    }

    /**
     * TS-only: AS3 holds the product data purely so `setOfferData()` can copy it off the offer
     * before the offer is disposed; nothing reads it back. Exposed here rather than dropped so the
     * snapshot stays complete.
     */
    // AS3: .../purchase/PlacedObjectPurchaseData.as::_SafeStr_6321
    get productData(): IProductData | null
    {
        return this._productData;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::toString()
    toString(): string
    {
        return [
            this._roomId,
            this._objectId,
            this._category,
            this._wallLocation,
            this._x,
            this._y,
            this._direction,
            this._offerId,
            this._productClassId
        ].toString();
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../purchase/PlacedObjectPurchaseData.as::dispose()
    dispose(): void
    {
        this._disposed = true;
        this._productData = null;
        this._furniData = null;
    }
}
