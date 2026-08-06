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

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/moderator/GetModeratorRoomInfoMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
