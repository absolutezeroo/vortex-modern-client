import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PrizeMessageSubProduct} from './PrizeMessageSubProduct';

/**
 * A single recycler prize (either a plain product or a deal bundling several sub-products).
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/PrizeMessageData.as
 */
export class PrizeMessageData
{
    private _productCode: string = '';

    get productCode(): string
    {
        return this._productCode;
    }

    private _dealSize: number = 1;

    get isDeal(): boolean
    {
        return this._dealSize > 1;
    }

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

    private _subProducts: PrizeMessageSubProduct[] = [];

    get subProducts(): PrizeMessageSubProduct[]
    {
        return this._subProducts;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._productCode = wrapper.readString();
        this._dealSize = wrapper.readInt();

        if(!this.isDeal)
        {
            this._productItemType = wrapper.readString();
            this._productItemTypeId = wrapper.readInt();
        }
        else
        {
            this._subProducts = [];

            for(let i = 0; i < this._dealSize; i++)
            {
                this._subProducts.push(new PrizeMessageSubProduct(wrapper));
            }
        }
    }
}
