import type {IPurchasableOffer} from '../../../IPurchasableOffer';

/**
 * Fired on the widget event bus when a product offer's data (e.g. limited-edition
 * supply-left count) has been refreshed from the server.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/ProductOfferUpdatedEvent.as
 */
export class ProductOfferUpdatedEvent
{
    static readonly CWE_PRODUCT_OFFER_UPDATED: string = 'CWE_PRODUCT_OFFER_UPDATED';

    private _offer: IPurchasableOffer;

    constructor(offer: IPurchasableOffer)
    {
        this._offer = offer;
    }

    get type(): string
    {
        return ProductOfferUpdatedEvent.CWE_PRODUCT_OFFER_UPDATED;
    }

    get offer(): IPurchasableOffer
    {
        return this._offer;
    }
}
