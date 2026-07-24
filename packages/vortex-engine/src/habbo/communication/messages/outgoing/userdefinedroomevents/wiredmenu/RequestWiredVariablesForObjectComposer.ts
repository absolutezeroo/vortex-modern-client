import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RequestWiredVariablesForObjectComposer — asks the server for the wired variables an inspected
 * object holds (WIN63 header 3466). Payload: the source type and the object id (furni id / user index /
 * 0 for global).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3097`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3097.as
 */
export class RequestWiredVariablesForObjectComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    // AS3: _SafeCls_3097.as::_SafeCls_3097()
    constructor(type: number, objectId: number)
    {
        super();
        this._data = [type, objectId];
    }

    // AS3: _SafeCls_3097.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
