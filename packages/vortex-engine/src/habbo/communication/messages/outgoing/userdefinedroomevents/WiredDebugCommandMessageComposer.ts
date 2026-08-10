import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * WiredDebugCommandMessageComposer — a raw wired debug command: a command string plus a payload
 * string, sent verbatim.
 *
 * Both of this port's call sites send the command `"wf15"` and differ only in the payload: the
 * wired dialog's "Erase from existence" developer action sends the holder key plus its code
 * (`FramePreset`), and the wired menu's monitor tab sends the clicked image's asset uri
 * (`WiredMenuMonitorTab`, the "panicking Frank" easter egg).
 *
 * That second call site used to have its own copy of this class, `WiredMonitorReportComposer`,
 * ported independently under a second derived name and registered at the same header. Two
 * `_composers.set(3608, …)` calls meant the later one silently replaced the earlier, leaving
 * `WiredDebugCommandMessageComposer` with no header at all — so the developer action could not be
 * sent, and `HabboMessages` logged a duplicate-header error on every boot. The duplicate is gone
 * and both call sites use this class.
 *
 * Name derived: the AS3 class is obfuscated as `_SafePkg_3005._SafeCls_3004` with no readable
 * counterpart in any tree; the name follows its role. Header from WIN63's registry
 * (`_composers[3608] = _SafeCls_3004`). The emulator implements no handler for it, so sending one
 * reaches a server that will not answer.
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
