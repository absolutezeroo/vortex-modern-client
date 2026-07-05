import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Change queue position
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/session/ChangeQueueMessageComposer.as
 */
export class ChangeQueueMessageComposer extends MessageComposer<ConstructorParameters<typeof ChangeQueueMessageComposer>>
{
    private _data: ConstructorParameters<typeof ChangeQueueMessageComposer>;

    constructor(targetQueue: number)
    {
        super();
        this._data = [targetQueue];
    }

    getMessageArray()
    {
        return this._data;
    }
}
