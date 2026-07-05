import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Give respect to a user
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/avatar/RespectUserMessageComposer.as
 */
export class RespectUserMessageComposer extends MessageComposer<ConstructorParameters<typeof RespectUserMessageComposer>>
{
    private _data: ConstructorParameters<typeof RespectUserMessageComposer>;

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
