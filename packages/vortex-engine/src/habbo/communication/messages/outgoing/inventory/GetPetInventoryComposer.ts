import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request pet inventory from server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/pets/GetPetInventoryComposer.as
 */
export class GetPetInventoryComposer extends MessageComposer<ConstructorParameters<typeof GetPetInventoryComposer>>
{
    private _data: ConstructorParameters<typeof GetPetInventoryComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/pets/GetPetInventoryComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
