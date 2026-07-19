import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetClubGiftMessageComposer.as
 */
export class GetClubGiftMessageComposer extends MessageComposer<ConstructorParameters<typeof GetClubGiftMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetClubGiftMessageComposer>;

    constructor()
    {
        super();
        this._data = [];
    }

    getMessageArray()
    {
        return this._data;
    }
}
