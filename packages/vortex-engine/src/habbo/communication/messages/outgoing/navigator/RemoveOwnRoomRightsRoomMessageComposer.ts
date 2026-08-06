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

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/RemoveOwnRoomRightsRoomMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
