import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftRewardItemClaimResultMessageParser} from '../../parser/collectibles/NftRewardItemClaimResultMessageParser';

/**
 * Header 233: `_SafeStr_4546[233] = _SafeCls_3090` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `CollectionView.as::onRewardClaimResult()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3090.as
 */
export class NftRewardItemClaimResultMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3090.as::_SafeCls_3090()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftRewardItemClaimResultMessageParser);
    }
}
