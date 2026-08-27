import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server to reload the wired room state, or roll it back (WIN63 header 501). The single
 * boolean is the roll-back flag: false reloads the current state, true rolls back to the last
 * saved snapshot.
 *
 * Sent from the wired menu's settings tab — `onClickReload()` passes false, `onRollbackConfirmed()`
 * passes true.
 *
 * The name is **recovered**, not derived: the class is `_SafeCls_3462` in the primary tree, but
 * win63_version carries it under its real filename.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3462.as
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/WiredUpdateRoomComposer.as
 */
export class WiredUpdateRoomComposer extends MessageComposer<boolean[]>
{
    // AS3: _SafeCls_3462.as::var_120
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
