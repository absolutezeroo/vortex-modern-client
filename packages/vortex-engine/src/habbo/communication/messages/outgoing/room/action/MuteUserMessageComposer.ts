import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Mute a user in the room
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.action.MuteUserMessageComposer
 */
export class MuteUserMessageComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    constructor(userId: number, minutes: number, roomId: number)
    {
        super();
        this._data = [userId, minutes, roomId];
    }

    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
