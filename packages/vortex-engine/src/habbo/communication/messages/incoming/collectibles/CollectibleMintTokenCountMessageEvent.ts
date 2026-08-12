import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CollectibleMintTokenCountMessageParser} from '../../parser/collectibles/CollectibleMintTokenCountMessageParser';

/**
 * Header 1770: `_SafeStr_4546[1770] = _SafeCls_3101` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `MintInventoryListTab.as::onCollectibleMintTokensMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3101.as
 */
export class CollectibleMintTokenCountMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3101.as::_SafeCls_3101()
    constructor(callback: MessageEventCallback)
    {
        super(callback, CollectibleMintTokenCountMessageParser);
    }
}
