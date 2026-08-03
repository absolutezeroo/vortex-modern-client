import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_1875.as
 * (real name recovered from sources/win63_version/habbo/communication/messages/outgoing/marketplace/BuyMarketplaceOfferMessageComposer.as)
 */
export class BuyMarketplaceOfferMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(offerId: number)
    {
        super();
        this._data = [offerId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
