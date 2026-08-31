import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexFishingSpotDepletedMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingSpotDepletedMessageParser';

/**
 * The spot ran dry — the ordinary end of a fishing session, not an error.
 *
 * Reconstructed from Habbo Origins. Header 8110. Replaces an earlier `CatchFailed`, which modelled a
 * per-cast miss Origins does not appear to have.
 */
export class VortexFishingSpotDepletedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFishingSpotDepletedMessageParser);
    }
}
