import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Kick a user from the room
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.action.KickUserMessageComposer
 */
export class KickUserMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(userId: number)
    {
        super();
        this._data = [userId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
