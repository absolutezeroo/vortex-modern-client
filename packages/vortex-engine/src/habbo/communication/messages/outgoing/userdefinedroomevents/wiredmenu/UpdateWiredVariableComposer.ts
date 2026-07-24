import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * UpdateWiredVariableComposer — sets, creates or deletes a wired variable on an inspected object from
 * the inspection tab (WIN63 header 689). Payload order: source type, object id, variable id, value,
 * operation (0 = set value, 1 = create, 2 = delete).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3855`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3855.as
 */
export class UpdateWiredVariableComposer extends MessageComposer<(number | string)[]>
{
    // AS3: _SafeCls_3855.as::_SafeStr_10898 (name derived: set-value operation)
    static readonly OPERATION_SET: number = 0;

    // AS3: _SafeCls_3855.as::_SafeStr_11597 (name derived: create operation)
    static readonly OPERATION_CREATE: number = 1;

    // AS3: _SafeCls_3855.as::_SafeStr_11503 (name derived: delete operation)
    static readonly OPERATION_DELETE: number = 2;

    private _data: (number | string)[];

    // AS3: _SafeCls_3855.as::_SafeCls_3855()
    constructor(variableTarget: number, objectId: number, variableId: string, value: number, operation: number)
    {
        super();
        this._data = [];
        this._data.push(variableTarget);
        this._data.push(objectId);
        this._data.push(variableId);
        this._data.push(value);
        this._data.push(operation);
    }

    // AS3: _SafeCls_3855.as::getMessageArray()
    getMessageArray(): (number | string)[]
    {
        return this._data;
    }
}
