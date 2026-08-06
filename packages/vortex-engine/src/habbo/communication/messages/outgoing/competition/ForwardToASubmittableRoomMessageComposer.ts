import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ForwardToASubmittableRoomMessageComposer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/ForwardToASubmittableRoomMessageComposer.as
 */
export class ForwardToASubmittableRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof ForwardToASubmittableRoomMessageComposer>>
{
    private _data: ConstructorParameters<typeof ForwardToASubmittableRoomMessageComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/competition/ForwardToASubmittableRoomMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
