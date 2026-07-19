import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/catalog/HabboCatalog.as::purchaseVipMembershipExtension()
 */
export class PurchaseVipMembershipExtensionComposer extends MessageComposer<ConstructorParameters<typeof PurchaseVipMembershipExtensionComposer>>
{
    private _data: ConstructorParameters<typeof PurchaseVipMembershipExtensionComposer>;

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
