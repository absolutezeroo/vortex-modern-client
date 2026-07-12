import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RecyclerFinishedMessageEventParser} from '../../parser/catalog/RecyclerFinishedMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/RecyclerFinishedMessageEvent.as
 */
export class RecyclerFinishedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RecyclerFinishedMessageEventParser);
    }
}
