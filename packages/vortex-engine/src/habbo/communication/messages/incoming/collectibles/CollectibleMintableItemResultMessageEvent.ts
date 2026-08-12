import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CollectibleMintableItemResultMessageParser} from '../../parser/collectibles/CollectibleMintableItemResultMessageParser';

/**
 * Header 19: `_SafeStr_4546[19] = _SafeCls_3160` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `MintInventoryListTab.as::onMintItemResult()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3160.as
 */
export class CollectibleMintableItemResultMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3160.as::_SafeCls_3160()
    constructor(callback: MessageEventCallback)
    {
        super(callback, CollectibleMintableItemResultMessageParser);
    }
}
