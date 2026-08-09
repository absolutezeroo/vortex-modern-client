/**
 * Requests PurchaseCatalogWidget to open the purchase confirmation for the currently
 * selected offer, as if the buy button had been clicked.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetInitPurchaseEvent.as
 */
export class CatalogWidgetInitPurchaseEvent
{
    static readonly INIT_PURCHASE: string = 'INIT_PURCHASE';

    private _enableBuyAsGift: boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetInitPurchaseEvent.as::_userName
    private _userName: string | null;

    constructor(enableBuyAsGift: boolean = true, userName: string | null = null)
    {
        this._enableBuyAsGift = enableBuyAsGift;
        this._userName = userName;
    }

    get type(): string
    {
        return CatalogWidgetInitPurchaseEvent.INIT_PURCHASE;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetInitPurchaseEvent.as::get enableBuyAsGift()
    get enableBuyAsGift(): boolean
    {
        return this._enableBuyAsGift;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetInitPurchaseEvent.as::get userName()
    get userName(): string | null
    {
        return this._userName;
    }
}
