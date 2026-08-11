import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for the player's own report history (header 1834). Payload-free.
 *
 * Sent by `HabboHelp.requestReportsStatus()`, behind the `my.reports.status.enabled` config flag;
 * the answer arrives as `MyCfhReportStatus` and opens `MyReportStatus`.
 *
 * `vortex-emulator` did not define this header at all until 2026-08-11 — it already had the
 * *reply* composer, so the feature was half-built on that side and the request had nowhere to
 * land.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_2121.as
 * (composer class itself is obfuscated; identified by `HabboHelp.as::requestReportsStatus()`, its
 * only sender, and by `_composers[1834]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.)
 */
export class GetMyCfhReportStatusMessageComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_2121.as::getMessageArray()
    private _data: [] = [];

    // AS3: _SafeCls_2121.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
