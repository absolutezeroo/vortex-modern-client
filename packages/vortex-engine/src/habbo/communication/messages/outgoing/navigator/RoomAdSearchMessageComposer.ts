import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search room ads
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/RoomAdSearchMessageComposer.as
 */
export class RoomAdSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof RoomAdSearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof RoomAdSearchMessageComposer>;

    constructor(categoryId: number, index: number)
    {
        super();

        this._data = [categoryId, index];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/RoomAdSearchMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
