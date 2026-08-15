import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for a contract's contents — header 1594 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[1594]`).
 *
 * Sent straight back at the server: `onOpenContract` (1479) says *which* contract to open and this
 * asks for what is in it, with the reply arriving on 2976. The open push carries only an id, so the
 * round trip is not redundant.
 *
 * **Name DERIVED** — no unobfuscated tree carries the contract messages and the emulator has no
 * constant for 1594.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3120/_SafeCls_3975.as
 */
export class RequestWiredContractContentsComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: _SafeCls_3975.as::_SafeCls_3975()
    constructor(contractId: number)
    {
        super();

        this._data = [contractId];
    }

    // AS3: _SafeCls_3975.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
