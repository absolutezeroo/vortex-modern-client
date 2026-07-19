import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/catalog/HabboCatalog.as::purchaseBasicMembershipExtension()
 */
export class PurchaseBasicMembershipExtensionComposer extends MessageComposer<ConstructorParameters<typeof PurchaseBasicMembershipExtensionComposer>>
{
    private _data: ConstructorParameters<typeof PurchaseBasicMembershipExtensionComposer>;

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
