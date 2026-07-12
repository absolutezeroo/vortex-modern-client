/**
 * RentableSpaceConfigMessageEvent
 *
 * Vortex-custom message (not part of the official AS3 client dumps).
 * @see vortex-client/src/com/sulake/habbo/communication/messages/incoming/room/furniture/RentableSpaceConfigMessageEvent.as
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    RentableSpaceConfigMessageEventParser
} from '@habbo/communication/messages/parser/room/furniture/RentableSpaceConfigMessageEventParser';

export class RentableSpaceConfigMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RentableSpaceConfigMessageEventParser);
    }
}
