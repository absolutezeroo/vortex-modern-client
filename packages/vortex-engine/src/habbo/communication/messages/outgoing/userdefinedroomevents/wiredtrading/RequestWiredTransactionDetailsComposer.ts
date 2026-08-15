import {MessageComposer} from '@core/communication/messages/MessageComposer';
import {Long} from '@core/communication/util/Long';

/**
 * Ask for one transaction's full breakdown — header 475 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[475]`).
 *
 * **The transaction id goes out as a long**, unlike the chest ids around it: AS3 takes a `Number`
 * and wraps it in `Long` before pushing, and `WiredTransactionInfo.transactionId` is read with
 * `readLong()` to match. Narrowing it to an int would truncate every id past 2^31.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and vortex-emulator has
 * no constant for 475. Named for its one call site,
 * `TransactionTableObject::onClickDetails()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2407/_SafeCls_2686.as
 */
export class RequestWiredTransactionDetailsComposer extends MessageComposer<[Long]>
{
    // AS3: _SafeCls_2686.as::_data (name derived: the field is _SafeStr_4642 in every tree)
    private _data: [Long];

    // AS3: _SafeCls_2686.as::_SafeCls_2686()
    constructor(transactionId: number)
    {
        super();

        this._data = [new Long(transactionId)];
    }

    // AS3: _SafeCls_2686.as::getMessageArray()
    getMessageArray(): [Long]
    {
        return this._data;
    }
}
