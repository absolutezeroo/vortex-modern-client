/**
 * RoomEntryTileMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.layout.RoomEntryTileMessageEvent
 *
 * Event fired when the room entry tile position is received.
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomEntryTileMessageParser} from '@habbo/communication/messages/parser/room/layout/RoomEntryTileMessageParser';

export class RoomEntryTileMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomEntryTileMessageParser);
    }
}
