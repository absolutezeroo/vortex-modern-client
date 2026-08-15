import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Save a wired contract — header 1908 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[1908]`).
 *
 * **The payload is assembled by the caller, not by this class.** `WiredContractController` builds an
 * empty array, hands it to `AbstractContract.addContentsToComposer()`, and passes the result
 * straight in — so the field order lives in the contract sub-classes, and each contract type writes
 * a different tail. That is why this composer takes an opaque array where every other one in the
 * port takes typed arguments.
 *
 * **Name DERIVED** — no unobfuscated tree carries the contract messages and the emulator has no
 * constant for 1908. Named for the one call site, `WiredContractController::saveContract()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3120/_SafeCls_3119.as
 */
export class SaveWiredContractComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    /**
	 * AS3 stores the array by reference rather than copying it. Kept that way: the caller builds it
	 * immediately before sending and never touches it again.
	 */
    // AS3: _SafeCls_3119.as::_SafeCls_3119()
    constructor(contents: unknown[])
    {
        super();

        this._data = contents;
    }

    // AS3: _SafeCls_3119.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
