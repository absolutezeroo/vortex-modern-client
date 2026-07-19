import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionEndedMessageParser} from '../../parser/help/GuideSessionEndedMessageParser';

/**
 * Event for guide session ended notification.
 * Fired when the guide session ends for any reason.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideSessionEndedMessageEvent.as
 */
export class GuideSessionEndedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuideSessionEndedMessageParser);
    }
}
