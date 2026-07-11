import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetClubOffersMessageComposer.as
 */
export class GetClubOffersMessageComposer extends MessageComposer<ConstructorParameters<typeof GetClubOffersMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetClubOffersMessageComposer>;

    constructor(source: number)
    {
        super();
        this._data = [source];
    }

    getMessageArray()
    {
        return this._data;
    }
}
