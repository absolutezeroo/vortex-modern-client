import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests information about the next limited-edition rare to become
 * available in the catalog.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetLimitedOfferAppearingNextComposer.as
 */
export class GetLimitedOfferAppearingNextComposer extends MessageComposer<ConstructorParameters<typeof GetLimitedOfferAppearingNextComposer>>
{
    private _data: ConstructorParameters<typeof GetLimitedOfferAppearingNextComposer>;

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
