import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetAllVariablesDiffMessageComposer — asks the server for the delta between the client's cached
 * variables and the current set (WIN63 header 797). Payload: the count of known variables, then each
 * (variableId, hash) pair, so the server can send back only what changed.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2882`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_2882.as
 */
export class GetAllVariablesDiffMessageComposer extends MessageComposer<(string | number)[]>
{
    private _data: (string | number)[];

    // AS3: _SafeCls_2882.as::_SafeCls_2882()
    constructor(variableIdToHash: Map<string, number> | null)
    {
        super();
        this._data = [];

        if(variableIdToHash === null)
        {
            this._data.push(0);
            return;
        }

        this._data.push(variableIdToHash.size);

        for(const [variableId, hash] of variableIdToHash)
        {
            this._data.push(variableId);
            this._data.push(hash);
        }
    }

    // AS3: _SafeCls_2882.as::getMessageArray()
    getMessageArray(): (string | number)[]
    {
        return this._data;
    }
}
