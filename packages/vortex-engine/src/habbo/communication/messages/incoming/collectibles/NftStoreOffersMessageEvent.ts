import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftStoreOffersMessageParser} from '../../parser/collectibles/NftStoreOffersMessageParser';

/**
 * Header 3272: `_SafeStr_4546[3272] = _SafeCls_3611` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `ShopTab.as::onNftStoreOffers()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3611.as
 */
export class NftStoreOffersMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3611.as::_SafeCls_3611()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftStoreOffersMessageParser);
    }
}
