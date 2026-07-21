import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * WiredDebugCommandMessageComposer — a raw wired debug command: a command string plus a payload
 * string, sent verbatim. Used by the wired dialog's "Erase from existence" developer action (command
 * "wf15").
 *
 * Name derived: the AS3 class is obfuscated as `_SafePkg_3005._SafeCls_3004` with no readable
 * counterpart; the name follows its role. It carries its command in the payload (not a numeric
 * header), so it is not registered in HabboMessages — a documented gap for this dev-only feature.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3005/_SafeCls_3004.as
 */
export class WiredDebugCommandMessageComposer extends MessageComposer<[string, string]>
{
    // AS3: _SafeCls_3004.as::_data (command + payload)
    private _data: [string, string];

    // AS3: _SafeCls_3004.as::_SafeCls_3004()
    constructor(command: string, payload: string)
    {
        super();
        this._data = [command, payload];
    }

    // AS3: _SafeCls_3004.as::getMessageArray()
    getMessageArray(): [string, string]
    {
        return this._data;
    }
}
