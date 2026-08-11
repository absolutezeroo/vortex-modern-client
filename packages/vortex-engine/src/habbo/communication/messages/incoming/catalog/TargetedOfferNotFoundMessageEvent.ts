import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TargetedOfferNotFoundMessageParser} from '../../parser/catalog/TargetedOfferNotFoundMessageParser';

/**
 * The server has no targeted offer for this player (header 2013).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_3069.as
 * (obfuscated; `_SafeStr_4546[2013] = _SafeCls_3069` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `OfferController.as::onTargetedOfferNotFound()` is its only handler.)
 */
export class TargetedOfferNotFoundMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3069.as::_SafeCls_3069()
    constructor(callback: MessageEventCallback)
    {
        super(callback, TargetedOfferNotFoundMessageParser);
    }
}
