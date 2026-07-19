import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionDetachedMessageParser} from '../../parser/help/GuideSessionDetachedMessageParser';

/**
 * Event for guide session detachment notification.
 * Fired when the guide session is detached.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideSessionDetachedMessageEvent.as
 */
export class GuideSessionDetachedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuideSessionDetachedMessageParser);
    }
}
