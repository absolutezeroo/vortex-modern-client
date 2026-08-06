import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/RedeemVoucherMessageComposer.as
 */
export class RedeemVoucherMessageComposer extends MessageComposer<ConstructorParameters<typeof RedeemVoucherMessageComposer>>
{
    private _data: ConstructorParameters<typeof RedeemVoucherMessageComposer>;

    constructor(voucherCode: string)
    {
        super();
        this._data = [voucherCode];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/catalog/RedeemVoucherMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
