import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CreditBalanceEventParser} from '../../../parser/inventory/purse/CreditBalanceEventParser';

/**
 * Event fired when the user's credit balance is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/inventory/purse/CreditBalanceEvent.as
 */
export class CreditBalanceEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CreditBalanceEventParser);
    }
}
