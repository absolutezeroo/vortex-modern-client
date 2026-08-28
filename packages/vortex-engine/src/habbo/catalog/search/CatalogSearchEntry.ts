import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';

/**
 * One searchable furni: its data, the terms it can be found by, and the product code its
 * description lives under.
 *
 * The terms are pre-normalised and de-duplicated when the index is built, not at query time —
 * `HabboCatalog.ensureSearchEntries()` does that once per furni-data load, so a keystroke only
 * costs a substring scan over an array that is already lower-cased.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/search/CatalogSearchEntry.as
 */
export class CatalogSearchEntry
{
    // AS3: CatalogSearchEntry.as::_SafeStr_4620 (backing field of furniData)
    private _furniData: IFurnitureData;

    // AS3: CatalogSearchEntry.as::_searchTerms
    private _searchTerms: string[];

    // AS3: CatalogSearchEntry.as::_productCode
    private _productCode: string;

    // AS3: CatalogSearchEntry.as::CatalogSearchEntry()
    constructor(furniData: IFurnitureData, searchTerms: string[], productCode: string)
    {
        this._furniData = furniData;
        this._searchTerms = searchTerms;
        this._productCode = productCode;
    }

    // AS3: CatalogSearchEntry.as::get furniData()
    get furniData(): IFurnitureData
    {
        return this._furniData;
    }

    // AS3: CatalogSearchEntry.as::get searchTerms()
    get searchTerms(): string[]
    {
        return this._searchTerms;
    }

    // AS3: CatalogSearchEntry.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }
}
