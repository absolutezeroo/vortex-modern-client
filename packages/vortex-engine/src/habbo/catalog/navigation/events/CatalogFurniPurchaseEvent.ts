/**
 * Fired when a furni offer is purchased directly from a room-object context.
 *
 * @see sources/win63_version/habbo/catalog/navigation/events/CatalogFurniPurchaseEvent.as
 */
export class CatalogFurniPurchaseEvent
{
    static readonly CATALOG_FURNI_PURCHASE: string = 'CATALOG_FURNI_PURCHASE';

    private _localizationId: string;

    constructor(localizationId: string)
    {
        this._localizationId = localizationId;
    }

    get type(): string
    {
        return CatalogFurniPurchaseEvent.CATALOG_FURNI_PURCHASE;
    }

    get localizationId(): string
    {
        return this._localizationId;
    }
}
