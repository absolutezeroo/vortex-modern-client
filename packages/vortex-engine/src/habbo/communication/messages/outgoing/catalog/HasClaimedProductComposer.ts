import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks whether the player has already taken a free claim — header 2668, answered by
 * `HasClaimedProductResponseMessageEvent` (787).
 *
 * **Name DERIVED** — no unobfuscated tree carries it and the emulator declares no constant for
 * 2668. Named from the reply it provokes and from `SpecialItemsController.initialize()`, which
 * sends it the moment the claim state becomes FETCHING.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2659/_SafeCls_3616.as
 */
export class HasClaimedProductComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_3616.as::_SafeStr_4642
    private _data: [string];

    // AS3: _SafeCls_3616.as::_SafeCls_3616()
    constructor(claimId: string)
    {
        super();

        this._data = [claimId];
    }

    // AS3: _SafeCls_3616.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
