import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::checkGiftable()
 * (composer class itself is obfuscated, `_SafeCls_1836` - name derived from its only caller, not recovered)
 */
export class CheckGiftableMessageComposer extends MessageComposer<ConstructorParameters<typeof CheckGiftableMessageComposer>>
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::checkGiftable()
    private _data: ConstructorParameters<typeof CheckGiftableMessageComposer>;

    constructor(offerId: number)
    {
        super();
        this._data = [offerId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::checkGiftable()
    getMessageArray()
    {
        return this._data;
    }
}
