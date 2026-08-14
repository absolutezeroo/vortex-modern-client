import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {
    WiredTransactionLogList
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionLogList';

/**
 * A page of wired-chest transaction logs, header 2910.
 *
 * **Name DERIVED** — see {@link WiredTransactionLogList}: no unobfuscated tree carries this message
 * and the emulator has no constant for 2910.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2640/_SafeCls_3337.as
 */
export class WiredTransactionLogsEventParser implements IMessageParser
{
    // AS3: _SafeCls_3337.as::logs (backing field)
    private _logs: WiredTransactionLogList | null = null;

    // AS3: _SafeCls_3337.as::get logs()
    get logs(): WiredTransactionLogList | null
    {
        return this._logs;
    }

    // AS3: _SafeCls_3337.as::flush()
    flush(): boolean
    {
        this._logs = null;

        return true;
    }

    // AS3: _SafeCls_3337.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._logs = new WiredTransactionLogList(wrapper);

        return true;
    }
}
