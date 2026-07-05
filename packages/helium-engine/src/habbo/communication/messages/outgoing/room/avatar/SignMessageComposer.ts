import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Hold up a sign
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.avatar.SignMessageComposer
 */
export class SignMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(signId: number)
    {
        super();
        this._data = [signId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
