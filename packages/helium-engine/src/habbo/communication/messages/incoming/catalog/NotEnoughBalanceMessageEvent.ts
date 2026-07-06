import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NotEnoughBalanceMessageEventParser} from '../../parser/catalog/NotEnoughBalanceMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/NotEnoughBalanceMessageEvent.as
 */
export class NotEnoughBalanceMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NotEnoughBalanceMessageEventParser);
    }
}
