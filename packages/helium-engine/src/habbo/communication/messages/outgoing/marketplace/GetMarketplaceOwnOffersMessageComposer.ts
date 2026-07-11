import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1746/_SafeCls_1881.as
 * (real name recovered from sources/win63_version/habbo/communication/messages/outgoing/marketplace/GetMarketplaceOwnOffersMessageComposer.as)
 */
export class GetMarketplaceOwnOffersMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(category: number = 1)
    {
        super();
        this._data = [category];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
