import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RedeemNftLootBoxResultMessageParser} from '../../parser/collectibles/RedeemNftLootBoxResultMessageParser';

/**
 * Header 3332: `_SafeStr_4546[3332] = _SafeCls_3299` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `CollectiblesController.as::onRedeemLootBoxResultEvent()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3299.as
 */
export class RedeemNftLootBoxResultMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3299.as::_SafeCls_3299()
    constructor(callback: MessageEventCallback)
    {
        super(callback, RedeemNftLootBoxResultMessageParser);
    }
}
