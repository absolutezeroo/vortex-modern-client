import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftCollectionsScoreMessageParser} from '../../parser/collectibles/NftCollectionsScoreMessageParser';

/**
 * Header 1857: `_SafeStr_4546[1857] = _SafeCls_2747` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `CollectionsTab.as::onCollectionsScoreMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_2747.as
 */
export class NftCollectionsScoreMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2747.as::_SafeCls_2747()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftCollectionsScoreMessageParser);
    }
}
