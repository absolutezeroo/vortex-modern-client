import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IssueDeletedMessageParser} from '../../parser/moderation/IssueDeletedMessageParser';

/**
 * Event fired when an issue is deleted.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/IssueDeletedMessageEvent.as
 */
export class IssueDeletedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IssueDeletedMessageParser);
    }
}
