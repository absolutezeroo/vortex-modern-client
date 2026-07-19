import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetProductOfferComposer.as
 */
export class GetProductOfferComposer extends MessageComposer<ConstructorParameters<typeof GetProductOfferComposer>>
{
    private _data: ConstructorParameters<typeof GetProductOfferComposer>;

    constructor(offerId: number)
    {
        super();
        this._data = [offerId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
