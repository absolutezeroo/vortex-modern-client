import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Remove own room rights
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/RemoveOwnRoomRightsRoomMessageComposer.as
 */
export class RemoveOwnRoomRightsRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof RemoveOwnRoomRightsRoomMessageComposer>>
{
    private _data: ConstructorParameters<typeof RemoveOwnRoomRightsRoomMessageComposer>;

    constructor(roomId: number)
    {
        super();

        this._data = [roomId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
