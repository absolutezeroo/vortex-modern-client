import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Open a present/gift furni item
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/furniture/PresentOpenMessageComposer.as
 */
export class PresentOpenMessageComposer extends MessageComposer<ConstructorParameters<typeof PresentOpenMessageComposer>>
{
    private _data: ConstructorParameters<typeof PresentOpenMessageComposer>;

    constructor(objectId: number)
    {
        super();
        this._data = [objectId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
