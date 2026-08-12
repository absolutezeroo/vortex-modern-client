import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CollectibleMintTokenOffersMessageParser} from '../../parser/collectibles/CollectibleMintTokenOffersMessageParser';

/**
 * Header 2462: `_SafeStr_4546[2462] = _SafeCls_3362` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `MintInventoryListTab.as::onMintTokenOffersMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3362.as
 */
export class CollectibleMintTokenOffersMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3362.as::_SafeCls_3362()
    constructor(callback: MessageEventCallback)
    {
        super(callback, CollectibleMintTokenOffersMessageParser);
    }
}
