import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search my frequent room history
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/MyFrequentRoomHistorySearchMessageComposer.as
 */
export class MyFrequentRoomHistorySearchMessageComposer extends MessageComposer<ConstructorParameters<typeof MyFrequentRoomHistorySearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof MyFrequentRoomHistorySearchMessageComposer>;

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
