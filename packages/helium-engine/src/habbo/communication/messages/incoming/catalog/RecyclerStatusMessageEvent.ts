import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RecyclerStatusMessageEventParser} from '../../parser/catalog/RecyclerStatusMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/RecyclerStatusMessageEvent.as
 */
export class RecyclerStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RecyclerStatusMessageEventParser);
    }
}
