import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ReloadWiredRoomStateComposer — asks the server to reload (or roll back) the wired room state (WIN63
 * header 501). The single boolean is the roll-back flag: false reloads the current wired state, true
 * rolls back to the last saved snapshot.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3462`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3462.as
 */
export class ReloadWiredRoomStateComposer extends MessageComposer<boolean[]>
{
    private _data: boolean[];

    // AS3: _SafeCls_3462.as::_SafeCls_3462()
    constructor(rollback: boolean)
    {
        super();
        this._data = [];
        this._data.push(rollback);
    }

    // AS3: _SafeCls_3462.as::getMessageArray()
    getMessageArray(): boolean[]
    {
        return this._data;
    }
}
