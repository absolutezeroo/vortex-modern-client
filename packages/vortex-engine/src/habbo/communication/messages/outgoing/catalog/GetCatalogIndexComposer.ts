import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetCatalogIndexComposer.as
 */
export class GetCatalogIndexComposer extends MessageComposer<ConstructorParameters<typeof GetCatalogIndexComposer>>
{
    private _data: ConstructorParameters<typeof GetCatalogIndexComposer>;

    constructor(catalogType: string)
    {
        super();
        this._data = [catalogType];
    }

    getMessageArray()
    {
        return this._data;
    }
}
