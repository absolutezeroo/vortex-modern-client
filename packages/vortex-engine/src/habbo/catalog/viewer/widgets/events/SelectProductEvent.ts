import type {IPurchasableOffer} from '../../../IPurchasableOffer';

/**
 * Fired on the widget event bus when a grid item is selected.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/SelectProductEvent.as
 */
export class SelectProductEvent
{
    static readonly SELECT_PRODUCT: string = 'SELECT_PRODUCT';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/SelectProductEvent.as::_offer
    private _offer: IPurchasableOffer;

    constructor(offer: IPurchasableOffer)
    {
        this._offer = offer;
    }

    get type(): string
    {
        return SelectProductEvent.SELECT_PRODUCT;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/SelectProductEvent.as::get offer()
    get offer(): IPurchasableOffer
    {
        return this._offer;
    }
}
