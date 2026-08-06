import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request credit vault status from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/CreditVaultStatusMessageComposer.as
 */
export class CreditVaultStatusMessageComposer extends MessageComposer<[]>
{
    private _data: [] = [];

    constructor()
    {
        super();
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/vault/CreditVaultStatusMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
