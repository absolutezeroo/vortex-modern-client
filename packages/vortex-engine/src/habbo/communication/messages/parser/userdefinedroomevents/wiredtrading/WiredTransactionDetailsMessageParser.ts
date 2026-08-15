import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {
    WiredTransactionDetails
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionDetails';

/**
 * One transaction's full breakdown, header 1306.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages (`win63_version` predates
 * them entirely) and vortex-emulator has no constant for 1306.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2640/_SafeCls_2639.as
 */
export class WiredTransactionDetailsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2639.as::_details
    private _details: WiredTransactionDetails | null = null;

    // AS3: _SafeCls_2639.as::get details()
    get details(): WiredTransactionDetails | null
    {
        return this._details;
    }

    // AS3: _SafeCls_2639.as::flush()
    flush(): boolean
    {
        this._details = null;

        return true;
    }

    // AS3: _SafeCls_2639.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._details = new WiredTransactionDetails(wrapper);

        return true;
    }
}
