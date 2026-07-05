import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Let a user in (doorbell response)
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.action.LetUserInMessageComposer
 */
export class LetUserInMessageComposer extends MessageComposer<[string, boolean]>
{
    private _data: [string, boolean];

    constructor(userName: string, allow: boolean)
    {
        super();
        this._data = [userName, allow];
    }

    getMessageArray(): [string, boolean]
    {
        return this._data;
    }
}
