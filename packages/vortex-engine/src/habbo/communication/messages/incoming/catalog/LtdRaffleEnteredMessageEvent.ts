import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {LtdRaffleEnteredMessageParser} from '../../parser/catalog/LtdRaffleEnteredMessageParser';

/**
 * The player entered a limited-edition raffle (header 2901).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/LtdRaffleEnteredMessageEvent.as
 * (obfuscated in the primary tree; `_SafeStr_4546[2901] = _SafeCls_1861` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `HabboCatalog.as::onLtdRaffleEntered()` is its only handler.)
 */
export class LtdRaffleEnteredMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_1861.as::_SafeCls_1861()
    constructor(callback: MessageEventCallback)
    {
        super(callback, LtdRaffleEnteredMessageParser);
    }
}
