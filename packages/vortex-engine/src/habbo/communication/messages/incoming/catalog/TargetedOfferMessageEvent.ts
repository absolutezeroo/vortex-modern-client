import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TargetedOfferMessageParser} from '../../parser/catalog/TargetedOfferMessageParser';

/**
 * The targeted offer the server picked for this player (header 2155).
 *
 * Sent unprompted after `GetNextTargetedOfferComposer`, which the catalog fires once the product
 * data is ready. `OfferController` is the only handler: it shows the offer maximised, or minimised
 * into the toolbar when the tracking state says the player has already dismissed it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_3741.as
 * (obfuscated; `_SafeStr_4546[2155] = _SafeCls_3741` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `OfferController.as::onTargetedOffer()` is its only handler.)
 */
export class TargetedOfferMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3741.as::_SafeCls_3741()
    constructor(callback: MessageEventCallback)
    {
        super(callback, TargetedOfferMessageParser);
    }
}
