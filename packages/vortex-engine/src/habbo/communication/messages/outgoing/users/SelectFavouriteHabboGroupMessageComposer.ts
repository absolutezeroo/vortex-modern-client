import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * SelectFavouriteHabboGroupMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.SelectFavouriteHabboGroupMessageComposer
 */
export class SelectFavouriteHabboGroupMessageComposer extends MessageComposer<ConstructorParameters<typeof SelectFavouriteHabboGroupMessageComposer>>
{
    private _data: ConstructorParameters<typeof SelectFavouriteHabboGroupMessageComposer>;

    constructor(groupId: number)
    {
        super();

        this._data = [groupId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/users/SelectFavouriteHabboGroupMessageComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
