import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the catalog page whose promotional offer expires soonest.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetCatalogPageWithEarliestExpiryComposer.as
 */
export class GetCatalogPageWithEarliestExpiryComposer extends MessageComposer<ConstructorParameters<typeof GetCatalogPageWithEarliestExpiryComposer>>
{
    private _data: ConstructorParameters<typeof GetCatalogPageWithEarliestExpiryComposer>;

    constructor()
    {
        super();
        this._data = [];
    }

    getMessageArray(): []
    {
        return this._data;
    }
}
