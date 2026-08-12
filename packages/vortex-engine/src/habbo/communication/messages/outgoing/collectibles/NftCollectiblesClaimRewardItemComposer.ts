import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Claims the reward item of a completed collection (WIN63 header 1166).
 *
 * Name RECOVERED from sources/win63_version/habbo/communication/messages/outgoing/collectibles/NftCollectiblesClaimRewardItemMessageComposer.as
 * — that tree is obfuscated too, but it is the one where messages keep readable *filenames*.
 * (The port drops AS3's "Message" infix from composer names, as it does throughout.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3758.as
 */
export class NftCollectiblesClaimRewardItemComposer extends MessageComposer<[string, string]>
{
    // AS3: _SafeCls_3758.as::_SafeStr_4642
    private _data: [string, string];

    // AS3: _SafeCls_3758.as::_SafeCls_3758()
    constructor(collectionId: string, wallet: string)
    {
        super();

        this._data = [collectionId, wallet];
    }

    // AS3: _SafeCls_3758.as::getMessageArray()
    getMessageArray(): [string, string]
    {
        return this._data;
    }
}
