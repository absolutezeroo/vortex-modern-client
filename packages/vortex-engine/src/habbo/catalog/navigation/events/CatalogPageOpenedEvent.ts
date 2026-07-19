/**
 * Fired when the catalog navigator opens a page.
 *
 * @see sources/win63_version/habbo/catalog/navigation/events/CatalogPageOpenedEvent.as
 */
export class CatalogPageOpenedEvent
{
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

    get pageId(): number
    {
        return this._pageId;
    }

    get pageLocalization(): string
    {
        return this._pageLocalization;
    }
}
