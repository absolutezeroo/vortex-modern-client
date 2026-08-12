import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftCollectionsMessageParser} from '../../parser/collectibles/NftCollectionsMessageParser';

/**
 * Header 3942: `_SafeStr_4546[3942] = _SafeCls_3743` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `CollectionsTab.as::onNftCollectionsMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3743.as
 */
export class NftCollectionsMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3743.as::_SafeCls_3743()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftCollectionsMessageParser);
    }
}
