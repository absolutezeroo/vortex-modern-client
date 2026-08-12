import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftClaimResultMessageParser} from '../../parser/collectibles/NftClaimResultMessageParser';

/**
 * Header 3601: `_SafeStr_4546[3601] = _SafeCls_2853` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `RewardClaimsTab.as::onNftClaimResultMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_2853.as
 */
export class NftClaimResultMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2853.as::_SafeCls_2853()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftClaimResultMessageParser);
    }
}
