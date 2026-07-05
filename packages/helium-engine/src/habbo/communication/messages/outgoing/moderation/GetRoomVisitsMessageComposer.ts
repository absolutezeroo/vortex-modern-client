import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests room visit history for a specific user.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/GetRoomVisitsMessageComposer.as
 */
export class GetRoomVisitsMessageComposer extends MessageComposer<ConstructorParameters<typeof GetRoomVisitsMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetRoomVisitsMessageComposer>;

    constructor(userId: number)
    {
        super();
        this._data = [userId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
