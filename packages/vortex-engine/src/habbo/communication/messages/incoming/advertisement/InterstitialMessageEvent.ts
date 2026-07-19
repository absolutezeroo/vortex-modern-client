import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InterstitialMessageParser} from '../../parser/advertisement/InterstitialMessageParser';

/**
 * Event for interstitial ad availability response
 *
 * @see source_as_win63/habbo/communication/messages/incoming/advertisement/InterstitialMessageEvent.as
 */
export class InterstitialMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, InterstitialMessageParser);
    }
}
