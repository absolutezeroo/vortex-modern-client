import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Files a bullying report against a user in a room (header 293).
 *
 * Sent from one place: `CallForHelpManager.as::onBullyReportEvent()`, immediately after
 * `IgnoreUserMessageComposer`, when the reporter submits the `bully_report` form. That form only
 * opens when `guardians.enabled` is set, which is why this path is easy to miss.
 *
 * Name derived: the AS3 class is obfuscated as `_SafePkg_1872._SafeCls_3410` with no readable
 * counterpart in any tree; the name follows its only call site. Header from the primary registry
 * (`_composers[293] = _SafeCls_3410`).
 *
 * `vortex-emulator` does not define header 293 in `Revision20260701/Headers.cs`, so this reaches a
 * server with no handler for it — the report is sent and silently ignored until that header and a
 * handler are added there.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_3410.as
 */
export class ReportBullyMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: _SafeCls_3410.as::_SafeStr_4642
    private _data: [number, number];

    // AS3: _SafeCls_3410.as::_SafeCls_3410()
    constructor(reportedUserId: number, roomId: number)
    {
        super();

        this._data = [reportedUserId, roomId];
    }

    // AS3: _SafeCls_3410.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
