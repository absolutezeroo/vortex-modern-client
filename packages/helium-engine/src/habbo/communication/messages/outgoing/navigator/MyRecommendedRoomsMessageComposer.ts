import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Get my recommended rooms
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/MyRecommendedRoomsMessageComposer.as
 */
export class MyRecommendedRoomsMessageComposer extends MessageComposer<ConstructorParameters<typeof MyRecommendedRoomsMessageComposer>>
{
    private _data: ConstructorParameters<typeof MyRecommendedRoomsMessageComposer>;

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
