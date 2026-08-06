import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search rooms with highest score
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/RoomsWithHighestScoreSearchMessageComposer.as
 */
export class RoomsWithHighestScoreSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof RoomsWithHighestScoreSearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof RoomsWithHighestScoreSearchMessageComposer>;

    constructor(categoryId: number)
    {
        super();

        this._data = [categoryId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/RoomsWithHighestScoreSearchMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
