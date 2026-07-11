import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Give a supplement (e.g. medicine, toy) to a pet.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/engine/GiveSupplementToPetMessageComposer.as
 */
export class GiveSupplementToPetMessageComposer extends MessageComposer<ConstructorParameters<typeof GiveSupplementToPetMessageComposer>>
{
    private _data: ConstructorParameters<typeof GiveSupplementToPetMessageComposer>;

    constructor(petId: number, supplementType: number)
    {
        super();
        this._data = [petId, supplementType];
    }

    getMessageArray()
    {
        return this._data;
    }
}
