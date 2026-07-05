import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetHabboGroupDetailsMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.GetHabboGroupDetailsMessageComposer
 */
export class GetHabboGroupDetailsMessageComposer extends MessageComposer<ConstructorParameters<typeof GetHabboGroupDetailsMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetHabboGroupDetailsMessageComposer>;

    constructor(groupId: number, openDetails: boolean)
    {
        super();

        this._data = [groupId, openDetails];
    }

    getMessageArray(): [number, boolean]
    {
        return this._data;
    }
}
