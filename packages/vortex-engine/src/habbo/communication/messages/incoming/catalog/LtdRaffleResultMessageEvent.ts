import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {LtdRaffleResultMessageParser} from '../../parser/catalog/LtdRaffleResultMessageParser';

/**
 * Whether the player won a limited-edition raffle (header 3526).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/.../_SafeCls_1985.as
 * (obfuscated; `_SafeStr_4546[3526] = _SafeCls_1985` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `HabboCatalog.as::onLtdRaffleResult()` is its only handler.)
 */
export class LtdRaffleResultMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_1985.as::_SafeCls_1985()
    constructor(callback: MessageEventCallback)
    {
        super(callback, LtdRaffleResultMessageParser);
    }
}
