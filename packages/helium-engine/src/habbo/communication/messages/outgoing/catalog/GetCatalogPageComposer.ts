import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetCatalogPageComposer.as
 */
export class GetCatalogPageComposer extends MessageComposer<ConstructorParameters<typeof GetCatalogPageComposer>>
{
    private _data: ConstructorParameters<typeof GetCatalogPageComposer>;

    constructor(pageId: number, offerId: number, catalogType: string)
    {
        super();
        this._data = [pageId, offerId, catalogType];
    }

    getMessageArray()
    {
        return this._data;
    }
}
