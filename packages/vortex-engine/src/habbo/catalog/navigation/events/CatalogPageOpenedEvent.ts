/**
 * Fired when the catalog navigator opens a page.
 *
 * @see sources/win63_version/habbo/catalog/navigation/events/CatalogPageOpenedEvent.as
 */
export class CatalogPageOpenedEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/navigation/events/CatalogPageOpenedEvent.as::CATALOG_PAGE_OPENED
    static readonly CATALOG_PAGE_OPENED: string = 'CATALOG_PAGE_OPENED';

    private _pageId: number;

    private _pageLocalization: string;

    constructor(pageId: number, pageLocalization: string)
    {
        this._pageId = pageId;
        this._pageLocalization = pageLocalization;
    }

    get type(): string
    {
        return CatalogPageOpenedEvent.CATALOG_PAGE_OPENED;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/navigation/events/CatalogPageOpenedEvent.as::get pageId()
    get pageId(): number
    {
        return this._pageId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/navigation/events/CatalogPageOpenedEvent.as::get pageLocalization()
    get pageLocalization(): string
    {
        return this._pageLocalization;
    }
}
