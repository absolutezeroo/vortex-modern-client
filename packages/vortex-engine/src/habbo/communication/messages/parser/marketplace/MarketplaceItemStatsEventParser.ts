import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1932/_SafeCls_1931.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceItemStatsEventParser.as)
 */
export class MarketplaceItemStatsEventParser implements IMessageParser
{
    private _averagePrice: number = 0;

    private _offerCount: number = 0;

    private _historyLength: number = 0;

    private _dayOffsets: number[] = [];

    private _averagePrices: number[] = [];

    private _soldAmounts: number[] = [];

    private _furniTypeId: number = 0;

    private _furniCategoryId: number = 0;

    private _lowestCurrentPrice: number = 0;

    private _suggestedPrice: number = 0;

    get averagePrice(): number
    {
        return this._averagePrice;
    }

    get offerCount(): number
    {
        return this._offerCount;
    }

    get historyLength(): number
    {
        return this._historyLength;
    }

    get dayOffsets(): number[]
    {
        return this._dayOffsets;
    }

    get averagePrices(): number[]
    {
        return this._averagePrices;
    }

    get soldAmounts(): number[]
    {
        return this._soldAmounts;
    }

    get furniTypeId(): number
    {
        return this._furniTypeId;
    }

    get furniCategoryId(): number
    {
        return this._furniCategoryId;
    }

    get lowestCurrentPrice(): number
    {
        return this._lowestCurrentPrice;
    }

    get suggestedPrice(): number
    {
        return this._suggestedPrice;
    }

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._averagePrice = wrapper.readInt();
        this._offerCount = wrapper.readInt();
        this._historyLength = wrapper.readInt();

        const count = wrapper.readInt();

        this._dayOffsets = [];
        this._averagePrices = [];
        this._soldAmounts = [];

        for(let i = 0; i < count; i++)
        {
            this._dayOffsets.push(wrapper.readInt());
            this._averagePrices.push(wrapper.readInt());
            this._soldAmounts.push(wrapper.readInt());
        }

        this._furniCategoryId = wrapper.readInt();
        this._furniTypeId = wrapper.readInt();
        this._lowestCurrentPrice = wrapper.readInt();
        this._suggestedPrice = wrapper.readInt();

        return true;
    }
}
