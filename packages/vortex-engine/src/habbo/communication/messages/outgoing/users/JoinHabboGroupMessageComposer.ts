import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * JoinHabboGroupMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.JoinHabboGroupMessageComposer
 */
export class JoinHabboGroupMessageComposer extends MessageComposer<ConstructorParameters<typeof JoinHabboGroupMessageComposer>>
{
    private _data: ConstructorParameters<typeof JoinHabboGroupMessageComposer>;

    constructor(groupId: number)
    {
        super();

        this._data = [groupId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
