import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ForumDataMessageParser} from '@habbo/communication/messages/parser/groupforums/ForumDataMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/groupforums/ForumDataMessageEvent.as
 * (see HabboMessages for the header this is registered at, resolved from WIN63's own registry)
 */
export class ForumDataMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ForumDataMessageParser);
    }
}
