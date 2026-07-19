import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseMintTokens()
 * (composer class itself is obfuscated, `_SafeCls_2081` - name derived from its only caller, not recovered)
 */
export class PurchaseMintTokensMessageComposer extends MessageComposer<ConstructorParameters<typeof PurchaseMintTokensMessageComposer>>
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseMintTokens()
    private _data: ConstructorParameters<typeof PurchaseMintTokensMessageComposer>;

    constructor(amount: number, currency: string)
    {
        super();
        this._data = [amount, currency];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseMintTokens()
    getMessageArray()
    {
        return this._data;
    }
}
