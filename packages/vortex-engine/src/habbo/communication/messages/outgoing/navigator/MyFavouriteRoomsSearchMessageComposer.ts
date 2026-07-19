import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search my favourite rooms
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/MyFavouriteRoomsSearchMessageComposer.as
 */
export class MyFavouriteRoomsSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof MyFavouriteRoomsSearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof MyFavouriteRoomsSearchMessageComposer>;

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
