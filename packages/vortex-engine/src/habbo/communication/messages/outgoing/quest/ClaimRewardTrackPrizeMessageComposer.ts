import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Claim one prize off a reward track. Header 1376, from WIN63's own registry
 * (`_composers[1376] = _SafeCls_2794`).
 *
 * **The name is DERIVED** — named for its one call site,
 * `RewardTrackController.claimPrize(trackId, prizeId)`. Nothing corroborates it: the reward track
 * postdates `win63_version` and the emulator has no client-to-server header at 1376. (The
 * emulator's `Game2GameRejoinMessageComposer = 1376` is the *other* direction and is unrelated —
 * the two tables are separate id spaces.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2795/_SafeCls_2794.as
 */
export class ClaimRewardTrackPrizeMessageComposer extends MessageComposer<[string, string]>
{
    // AS3: _SafeCls_2794.as::_SafeStr_4642
    private _data: [string, string];

    constructor(trackId: string, prizeId: string)
    {
        super();

        this._data = [trackId, prizeId];
    }

    // AS3: _SafeCls_2794.as::getMessageArray()
    getMessageArray(): [string, string]
    {
        return this._data;
    }
}
