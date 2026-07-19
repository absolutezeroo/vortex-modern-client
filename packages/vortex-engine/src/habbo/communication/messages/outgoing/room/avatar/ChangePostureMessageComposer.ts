import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Change avatar posture (stand, sit, lay)
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.avatar.ChangePostureMessageComposer
 */
export class ChangePostureMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(posture: number)
    {
        super();
        this._data = [posture];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
