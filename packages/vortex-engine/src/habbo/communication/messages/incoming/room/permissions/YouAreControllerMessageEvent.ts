/**
 * YouAreControllerMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.permissions.YouAreControllerMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    YouAreControllerMessageParser
} from '@habbo/communication/messages/parser/room/permissions/YouAreControllerMessageParser';

export class YouAreControllerMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, YouAreControllerMessageParser);
    }
}
