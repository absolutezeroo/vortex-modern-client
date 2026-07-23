import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * WiredMonitorReportComposer — reports a monitor-tab interaction to the server (WIN63 header 3608).
 * Payload is two strings: a report key and an associated value (the monitor tab sends "wf15" plus the
 * clicked image's asset uri for the "panicking Frank" easter-egg click).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3004`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3005/_SafeCls_3004.as
 */
export class WiredMonitorReportComposer extends MessageComposer<string[]>
{
    private _data: string[];

    // AS3: _SafeCls_3004.as::_SafeCls_3004()
    constructor(key: string, value: string)
    {
        super();
        this._data = [key, value];
    }

    // AS3: _SafeCls_3004.as::getMessageArray()
    getMessageArray(): string[]
    {
        return this._data;
    }
}
