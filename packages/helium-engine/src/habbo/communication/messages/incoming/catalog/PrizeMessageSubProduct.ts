import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A single sub-product of a recycler deal prize.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/PrizeMessageSubProduct.as
 */
export class PrizeMessageSubProduct
{
    private _productItemType: string = '';

    get productItemType(): string
    {
        return this._productItemType;
    }

    private _productItemTypeId: number = 0;

    get productItemTypeId(): number
    {
        return this._productItemTypeId;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._productItemType = wrapper.readString();
        this._productItemTypeId = wrapper.readInt();
    }
}
