import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CollectibleWalletAddressesMessageParser} from '../../parser/collectibles/CollectibleWalletAddressesMessageParser';

/**
 * Header 1741: `_SafeStr_4546[1741] = _SafeCls_3018` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `CollectiblesView.as::onCollectableWalletAddressMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3018.as
 */
export class CollectibleWalletAddressesMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3018.as::_SafeCls_3018()
    constructor(callback: MessageEventCallback)
    {
        super(callback, CollectibleWalletAddressesMessageParser);
    }
}
