import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseNftOffer()
 * (composer class itself is obfuscated, `_SafeCls_1740` - name derived from its only caller, not recovered)
 */
export class PurchaseNftOfferMessageComposer extends MessageComposer<ConstructorParameters<typeof PurchaseNftOfferMessageComposer>>
{
    private _data: ConstructorParameters<typeof PurchaseNftOfferMessageComposer>;

    constructor(offerId: string, extraParam: string)
    {
        super();
        this._data = [offerId, extraParam];
    }

    getMessageArray()
    {
        return this._data;
    }
}
