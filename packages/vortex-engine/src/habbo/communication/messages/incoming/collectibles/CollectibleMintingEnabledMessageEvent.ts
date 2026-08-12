import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CollectibleMintingEnabledMessageParser} from '../../parser/collectibles/CollectibleMintingEnabledMessageParser';

/**
 * Header 1091: `_SafeStr_4546[1091] = _SafeCls_2669` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `MintInventoryListTab.as::onCollectibleMintingEnabledMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_2669.as
 */
export class CollectibleMintingEnabledMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2669.as::_SafeCls_2669()
    constructor(callback: MessageEventCallback)
    {
        super(callback, CollectibleMintingEnabledMessageParser);
    }
}
