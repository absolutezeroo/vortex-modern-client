import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Cancel a room event
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/CancelEventMessageComposer.as
 */
export class CancelEventMessageComposer extends MessageComposer<ConstructorParameters<typeof CancelEventMessageComposer>>
{
    private _data: ConstructorParameters<typeof CancelEventMessageComposer>;

    constructor(roomId: number)
    {
        super();

        this._data = [roomId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/CancelEventMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
