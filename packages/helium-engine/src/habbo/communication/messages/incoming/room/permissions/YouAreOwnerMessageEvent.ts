/**
 * YouAreOwnerMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.permissions.YouAreOwnerMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {YouAreOwnerMessageParser} from '@habbo/communication/messages/parser/room/permissions/YouAreOwnerMessageParser';

export class YouAreOwnerMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, YouAreOwnerMessageParser);
    }
}
