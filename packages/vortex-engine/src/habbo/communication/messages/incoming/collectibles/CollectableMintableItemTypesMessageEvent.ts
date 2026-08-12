import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CollectableMintableItemTypesMessageParser} from '../../parser/collectibles/CollectableMintableItemTypesMessageParser';

/**
 * Header 1902: `_SafeStr_4546[1902] = _SafeCls_3257` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `MintInventoryListTab.as::onCollectableMintableItemTypesMessage()`.
 *
 * Name RECOVERED from sources/win63_version/habbo/communication/messages/incoming/collectibles/CollectableMintableItemTypesMessageEvent.as
 * — that tree is obfuscated too, but it is the one where messages keep readable *filenames*.
 * (The port drops AS3's "Event" infix from parser names, as it does throughout.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3257.as
 */
export class CollectableMintableItemTypesMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3257.as::_SafeCls_3257()
    constructor(callback: MessageEventCallback)
    {
        super(callback, CollectableMintableItemTypesMessageParser);
    }
}
