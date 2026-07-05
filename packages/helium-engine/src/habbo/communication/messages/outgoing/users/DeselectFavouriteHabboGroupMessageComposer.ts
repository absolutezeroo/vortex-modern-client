import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * DeselectFavouriteHabboGroupMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.DeselectFavouriteHabboGroupMessageComposer
 */
export class DeselectFavouriteHabboGroupMessageComposer extends MessageComposer<ConstructorParameters<typeof DeselectFavouriteHabboGroupMessageComposer>>
{
    private _data: ConstructorParameters<typeof DeselectFavouriteHabboGroupMessageComposer>;

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
