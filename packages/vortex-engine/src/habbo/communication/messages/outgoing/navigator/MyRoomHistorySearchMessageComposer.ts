import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search my room history
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/MyRoomHistorySearchMessageComposer.as
 */
export class MyRoomHistorySearchMessageComposer extends MessageComposer<ConstructorParameters<typeof MyRoomHistorySearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof MyRoomHistorySearchMessageComposer>;

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
