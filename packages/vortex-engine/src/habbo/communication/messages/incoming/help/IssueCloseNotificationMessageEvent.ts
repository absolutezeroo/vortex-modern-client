import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IssueCloseNotificationMessageParser} from '../../parser/help/IssueCloseNotificationMessageParser';

/**
 * Event fired when an issue is closed.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/IssueCloseNotificationMessageEvent.as
 */
export class IssueCloseNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: MessageEventCallback)
    {
        super(callBack, IssueCloseNotificationMessageParser);
    }
}
