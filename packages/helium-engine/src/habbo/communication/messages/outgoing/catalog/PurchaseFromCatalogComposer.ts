import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/PurchaseFromCatalogComposer.as
 */
export class PurchaseFromCatalogComposer extends MessageComposer<ConstructorParameters<typeof PurchaseFromCatalogComposer>>
{
    private _data: ConstructorParameters<typeof PurchaseFromCatalogComposer>;

    constructor(pageId: number, offerId: number, extraParam: string, amount: number)
    {
        super();
        this._data = [pageId, offerId, extraParam, amount];
    }

    getMessageArray()
    {
        return this._data;
    }
}
