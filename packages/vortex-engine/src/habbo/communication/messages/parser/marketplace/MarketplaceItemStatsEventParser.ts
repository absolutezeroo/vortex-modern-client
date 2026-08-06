import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1932/_SafeCls_1931.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceItemStatsEventParser.as)
 */
export class MarketplaceItemStatsEventParser implements IMessageParser
{
    private _averagePrice: number = 0;

    private _offerCount: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::_historyLength
    private _historyLength: number = 0;

    private _dayOffsets: number[] = [];

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::_averagePrices
    private _averagePrices: number[] = [];

    private _soldAmounts: number[] = [];

    private _furniTypeId: number = 0;

    private _furniCategoryId: number = 0;

    private _lowestCurrentPrice: number = 0;

    private _suggestedPrice: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get averagePrice()
    get averagePrice(): number
    {
        return this._averagePrice;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get offerCount()
    get offerCount(): number
    {
        return this._offerCount;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get historyLength()
    get historyLength(): number
    {
        return this._historyLength;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get dayOffsets()
    get dayOffsets(): number[]
    {
        return this._dayOffsets;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get averagePrices()
    get averagePrices(): number[]
    {
        return this._averagePrices;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get soldAmounts()
    get soldAmounts(): number[]
    {
        return this._soldAmounts;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get furniTypeId()
    get furniTypeId(): number
    {
        return this._furniTypeId;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get furniCategoryId()
    get furniCategoryId(): number
    {
        return this._furniCategoryId;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get lowestCurrentPrice()
    get lowestCurrentPrice(): number
    {
        return this._lowestCurrentPrice;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::get suggestedPrice()
    get suggestedPrice(): number
    {
        return this._suggestedPrice;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1931.as::parse()
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
