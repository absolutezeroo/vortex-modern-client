import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests detailed room information for moderators.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/GetModeratorRoomInfoMessageComposer.as
 */
export class GetModeratorRoomInfoMessageComposer extends MessageComposer<ConstructorParameters<typeof GetModeratorRoomInfoMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetModeratorRoomInfoMessageComposer>;

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
