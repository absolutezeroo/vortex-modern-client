import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Buy a reward track's premium tier. Header 1789, from WIN63's own registry
 * (`_composers[1789] = _SafeCls_3341`).
 *
 * **The name is DERIVED** — named for its one call site,
 * `RewardTrackController.purchasePremium(trackId)`. Nothing corroborates it; see
 * `ClaimRewardTrackPrizeMessageComposer`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2795/_SafeCls_3341.as
 */
export class PurchaseRewardTrackPremiumMessageComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_3341.as::_SafeStr_4642
    private _data: [string];

    constructor(trackId: string)
    {
        super();

        this._data = [trackId];
    }

    // AS3: _SafeCls_3341.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
