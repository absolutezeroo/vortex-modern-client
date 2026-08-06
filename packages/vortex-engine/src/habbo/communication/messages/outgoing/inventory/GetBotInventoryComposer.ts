import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request bot inventory from server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/bots/GetBotInventoryComposer.as
 */
export class GetBotInventoryComposer extends MessageComposer<ConstructorParameters<typeof GetBotInventoryComposer>>
{
    private _data: ConstructorParameters<typeof GetBotInventoryComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/bots/GetBotInventoryComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
