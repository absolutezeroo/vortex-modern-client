import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    OfferRewardDeliveredMessageParser
} from '@habbo/communication/messages/parser/catalog/OfferRewardDeliveredMessageParser';

/**
 * A rewarded-video payout — header 2621 in WIN63's registry (`_SafeCls_2046.as::_events[2621]`),
 * and one of the messages the emulator was already sending with nothing on this side listening.
 *
 * Its only subscriber is `OfferCenter`.
 *
 * **Name DERIVED** — see {@link OfferRewardDeliveredMessageParser}.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2010/_SafeCls_2555.as
 */
export class OfferRewardDeliveredMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, OfferRewardDeliveredMessageParser);
    }
}
