import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Create a new flat/room
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/CreateFlatMessageComposer.as
 */
export class CreateFlatMessageComposer extends MessageComposer<ConstructorParameters<typeof CreateFlatMessageComposer>>
{
    private _data: ConstructorParameters<typeof CreateFlatMessageComposer>;

    constructor(
        roomName: string,
        roomDescription: string,
        roomModel: string,
        categoryId: number,
        maxUsers: number,
        tradeMode: number
    )
    {
        super();

        this._data = [roomName, roomDescription, roomModel, categoryId, maxUsers, tradeMode];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/CreateFlatMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
