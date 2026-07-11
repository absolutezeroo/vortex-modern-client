import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/SelectClubGiftComposer.as
 */
export class SelectClubGiftComposer extends MessageComposer<ConstructorParameters<typeof SelectClubGiftComposer>>
{
    private _data: ConstructorParameters<typeof SelectClubGiftComposer>;

    constructor(productCode: string)
    {
        super();
        this._data = [productCode];
    }

    getMessageArray()
    {
        return this._data;
    }
}
