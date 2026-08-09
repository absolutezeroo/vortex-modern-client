/**
 * Overrides PurchaseCatalogWidget's default buy-click behaviour with a caller-supplied callback.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetPurchaseOverrideEvent.as
 */
export class CatalogWidgetPurchaseOverrideEvent
{
    static readonly PURCHASE_OVERRIDE: string = 'PURCHASE_OVERRIDE';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetPurchaseOverrideEvent.as::_callback
    private _callback: ((event: unknown) => void) | null;

    constructor(callback: ((event: unknown) => void) | null)
    {
        this._callback = callback;
    }

    get type(): string
    {
        return CatalogWidgetPurchaseOverrideEvent.PURCHASE_OVERRIDE;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetPurchaseOverrideEvent.as::get callback()
    get callback(): ((event: unknown) => void) | null
    {
        return this._callback;
    }
}
