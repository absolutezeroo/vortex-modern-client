import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search rooms where my friends are
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/RoomsWhereMyFriendsAreSearchMessageComposer.as
 */
export class RoomsWhereMyFriendsAreSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof RoomsWhereMyFriendsAreSearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof RoomsWhereMyFriendsAreSearchMessageComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    getMessageArray()
    {
        return this._data;
    }
}
