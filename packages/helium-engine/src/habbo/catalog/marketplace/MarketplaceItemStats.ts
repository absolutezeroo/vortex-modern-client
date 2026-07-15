/**
 * Aggregated price/volume history for one furni type, requested via
 * `IMarketPlace.requestItemStats()` and delivered through
 * `MarketplaceItemStatsEvent` -> `HabboCatalog.onMarketplaceItemStats()` ->
 * `MarketPlaceLogic.itemStats` (setter).
 *
 * `lowestCurrentPrice`/`suggestedPrice` are primary-tree-only additions not
 * present in PRODUCTION-201601012205-226667486's `MarketplaceItemStats` (whose readable field
 * names - `currentOfferCount` in particular - are used here in place of the
 * ambiguous `offerCount` getter name recovered from win63_2026_crypted_version).
 *
 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as
 * (real class name recovered from sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/marketplace/MarketplaceItemStats.as)
 */
export class MarketplaceItemStats 
{
    private _currentOfferCount: number = 0;

    private _averagePrice: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get averagePrice()
    get averagePrice(): number 
    {
        return this._averagePrice;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set averagePrice()
    set averagePrice(value: number) 
    {
        this._averagePrice = value;
    }

    private _historyLength: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get historyLength()
    get historyLength(): number 
    {
        return this._historyLength;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set historyLength()
    set historyLength(value: number) 
    {
        this._historyLength = value;
    }

    private _dayOffsets: number[] = [];

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get dayOffsets()
    get dayOffsets(): number[] 
    {
        return this._dayOffsets;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set dayOffsets()
    set dayOffsets(value: number[]) 
    {
        this._dayOffsets = value.slice();
    }

    private _averagePrices: number[] = [];

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get averagePrices()
    get averagePrices(): number[] 
    {
        return this._averagePrices;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get offerCount()

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set averagePrices()
    set averagePrices(value: number[]) 
    {
        this._averagePrices = value.slice();
    }

    private _soldAmounts: number[] = [];

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get soldAmounts()
    get soldAmounts(): number[] 
    {
        return this._soldAmounts;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set soldAmounts()
    set soldAmounts(value: number[]) 
    {
        this._soldAmounts = value.slice();
    }

    private _furniTypeId: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get furniTypeId()
    get furniTypeId(): number 
    {
        return this._furniTypeId;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set furniTypeId()
    set furniTypeId(value: number) 
    {
        this._furniTypeId = value;
    }

    private _furniCategoryId: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get furniCategoryId()
    get furniCategoryId(): number 
    {
        return this._furniCategoryId;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set furniCategoryId()
    set furniCategoryId(value: number) 
    {
        this._furniCategoryId = value;
    }

    private _lowestCurrentPrice: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get lowestCurrentPrice()
    get lowestCurrentPrice(): number 
    {
        return this._lowestCurrentPrice;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set lowestCurrentPrice()
    set lowestCurrentPrice(value: number) 
    {
        this._lowestCurrentPrice = value;
    }

    private _suggestedPrice: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::get suggestedPrice()
    get suggestedPrice(): number 
    {
        return this._suggestedPrice;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set suggestedPrice()
    set suggestedPrice(value: number) 
    {
        this._suggestedPrice = value;
    }

    // (real field name recovered from PRODUCTION-201601012205-226667486: `_currentOfferCount`)
    get offerCount(): number 
    {
        return this._currentOfferCount;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_2226.as::set offerCount()
    set offerCount(value: number) 
    {
        this._currentOfferCount = value;
    }
}
