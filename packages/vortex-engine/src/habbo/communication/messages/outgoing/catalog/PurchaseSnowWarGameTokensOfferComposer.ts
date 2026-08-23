import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Buys one snow-war token bundle (WIN63 header 3243): the offer id alone.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/PurchaseSnowWarGameTokensOfferComposer.as
 * (`_composers[3243]` in the registry _SafeCls_2046.as.)
 */
export class PurchaseSnowWarGameTokensOfferComposer extends MessageComposer<number[]>
{
    // AS3: PurchaseSnowWarGameTokensOfferComposer.as::_SafeStr_4556
    private _data: number[];

    // AS3: PurchaseSnowWarGameTokensOfferComposer.as::PurchaseSnowWarGameTokensOfferComposer()
    constructor(offerId: number)
    {
        super();

        this._data = [offerId];
    }

    // AS3: PurchaseSnowWarGameTokensOfferComposer.as::getMessageArray()
    getMessageArray(): number[]
    {
        return this._data;
    }
}
