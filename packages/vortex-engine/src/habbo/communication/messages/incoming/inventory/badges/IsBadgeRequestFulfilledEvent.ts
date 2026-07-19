import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IsBadgeRequestFulfilledEventParser} from '../../../parser/inventory/badges/IsBadgeRequestFulfilledEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/inventory/badges/IsBadgeRequestFulfilledEvent.as
 */
export class IsBadgeRequestFulfilledEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IsBadgeRequestFulfilledEventParser);
    }
}
