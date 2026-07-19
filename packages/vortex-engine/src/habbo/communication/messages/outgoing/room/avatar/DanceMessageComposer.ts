import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Start or stop dancing
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.avatar.DanceMessageComposer
 */
export class DanceMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(danceStyle: number)
    {
        super();
        this._data = [danceStyle];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
