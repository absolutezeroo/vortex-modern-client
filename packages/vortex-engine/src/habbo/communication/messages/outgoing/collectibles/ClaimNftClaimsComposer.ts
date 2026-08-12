import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Claims outstanding rewards (WIN63 header 2898).
 *
 * Both fields default to the empty string and the only call site passes neither, so what actually
 * goes out is two empty strings — "claim everything I have pending". The parameters exist in AS3;
 * nothing uses them.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_2878`), named for its one sender
 * (`RewardClaimsTab.as::onClaimClicked()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_2878.as
 */
export class ClaimNftClaimsComposer extends MessageComposer<[string, string]>
{
    // AS3: _SafeCls_2878.as::_SafeStr_4642
    private _data: [string, string];

    // AS3: _SafeCls_2878.as::_SafeCls_2878()
    constructor(claimId: string = '', wallet: string = '')
    {
        super();

        this._data = [claimId, wallet];
    }

    // AS3: _SafeCls_2878.as::getMessageArray()
    getMessageArray(): [string, string]
    {
        return this._data;
    }
}
