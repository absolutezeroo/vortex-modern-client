import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getRoomAdsPurchaseInfo()
 * (composer class itself is obfuscated, `_SafeCls_2065` - name derived from its only caller, not recovered)
 */
export class GetRoomAdsPurchaseInfoMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getRoomAdsPurchaseInfo()
    private _data: [] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getRoomAdsPurchaseInfo()
    getMessageArray()
    {
        return this._data;
    }
}
