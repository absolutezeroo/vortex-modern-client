import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftClaimsMessageParser} from '../../parser/collectibles/NftClaimsMessageParser';

/**
 * Header 108: `_SafeStr_4546[108] = _SafeCls_3876` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `RewardClaimsTab.as::onNftClaimsMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3876.as
 */
export class NftClaimsMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3876.as::_SafeCls_3876()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftClaimsMessageParser);
    }
}
