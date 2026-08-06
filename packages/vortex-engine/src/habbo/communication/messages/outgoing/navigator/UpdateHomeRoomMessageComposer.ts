import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Update home room
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/UpdateHomeRoomMessageComposer.as
 */
export class UpdateHomeRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof UpdateHomeRoomMessageComposer>>
{
    private _data: ConstructorParameters<typeof UpdateHomeRoomMessageComposer>;

    constructor(roomId: number)
    {
        super();

        this._data = [roomId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/UpdateHomeRoomMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
