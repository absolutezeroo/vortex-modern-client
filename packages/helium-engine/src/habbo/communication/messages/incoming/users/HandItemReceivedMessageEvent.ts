import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HandItemReceivedMessageParser} from '../../parser/users/HandItemReceivedMessageParser';

/**
 * HandItemReceivedMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.HandItemReceivedMessageEvent
 */
export class HandItemReceivedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HandItemReceivedMessageParser);
    }

    get giverUserId(): number
    {
        return (this._parser as HandItemReceivedMessageParser).giverUserId;
    }

    get handItemType(): number
    {
        return (this._parser as HandItemReceivedMessageParser).handItemType;
    }
}
