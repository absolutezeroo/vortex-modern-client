import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RequestVariableHoldersComposer — asks the server for the room objects that currently hold a given
 * wired variable, so the overview tab can highlight them in the room (WIN63 header 113). Payload: the
 * selected variable id.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3916`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3916.as
 */
export class RequestVariableHoldersComposer extends MessageComposer<[string]>
{
    private _data: [string];

    // AS3: _SafeCls_3916.as::_SafeCls_3916()
    constructor(variableId: string)
    {
        super();
        this._data = [variableId];
    }

    // AS3: _SafeCls_3916.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
