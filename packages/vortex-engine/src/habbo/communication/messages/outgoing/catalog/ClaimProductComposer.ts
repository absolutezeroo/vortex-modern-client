import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Takes the free claim — header 145. Its result comes back as `ClaimProductResultMessageEvent`
 * (431), which the notification handler turns into a toast.
 *
 * **Name DERIVED** — no unobfuscated tree carries it and the emulator declares no constant for
 * 145. Named from its only caller, `SpecialItemsController.makeClaim()`, and from the reply.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2659/_SafeCls_2658.as
 */
export class ClaimProductComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_2658.as::_SafeStr_4642
    private _data: [string];

    // AS3: _SafeCls_2658.as::_SafeCls_2658()
    constructor(claimId: string)
    {
        super();

        this._data = [claimId];
    }

    // AS3: _SafeCls_2658.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
