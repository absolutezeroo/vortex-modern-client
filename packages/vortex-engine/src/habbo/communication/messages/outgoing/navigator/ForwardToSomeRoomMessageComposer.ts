import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Forward to some room
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/ForwardToSomeRoomMessageComposer.as
 */
export class ForwardToSomeRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof ForwardToSomeRoomMessageComposer>>
{
    private _data: ConstructorParameters<typeof ForwardToSomeRoomMessageComposer>;

    constructor(roomType: string)
    {
        super();

        this._data = [roomType];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/ForwardToSomeRoomMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
