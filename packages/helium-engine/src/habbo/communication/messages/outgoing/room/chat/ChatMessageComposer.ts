import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send a chat message in the room
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.chat.ChatMessageComposer
 */
export class ChatMessageComposer extends MessageComposer<[string, number, number]>
{
    private _data: [string, number, number];

    constructor(message: string, styleId: number = 0, trackingId: number = -1)
    {
        super();
        this._data = [message, styleId, trackingId];
    }

    getMessageArray(): [string, number, number]
    {
        return this._data;
    }
}
