import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RecyclerPrizesMessageEventParser} from '../../parser/catalog/RecyclerPrizesMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/RecyclerPrizesMessageEvent.as
 */
export class RecyclerPrizesMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RecyclerPrizesMessageEventParser);
    }
}
