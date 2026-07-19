import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {HabboCatalog} from '../HabboCatalog';
import type {IHabboCatalog} from '../IHabboCatalog';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {ICatalogPage} from './ICatalogPage';
import type {ICatalogViewer} from './ICatalogViewer';
import type {IPageLocalization} from './IPageLocalization';
import {CatalogPage} from './CatalogPage';

const log = Logger.getLogger('CatalogViewer');

/**
 * Owns the currently-shown catalog page window and its container.
 *
 * @see sources/win63_version/habbo/catalog/viewer/CatalogViewer.as
 */
export class CatalogViewer implements ICatalogViewer
{
    private _catalog: HabboCatalog | null;

    private _container: IWindowContainer | null;

    private _currentPage: ICatalogPage | null = null;

    private _forceRefresh: boolean = false;

    private _previousPageId: number = 0;

    private _catalogType: string | null = null;

    constructor(catalog: HabboCatalog, container: IWindowContainer, catalogType: string)
    {
        this._catalog = catalog;
        this._container = container;
        this._catalogType = catalogType;
    }

    /**
	 * The catalog type this viewer belongs to.
	 *
	 * Read by CatalogPage to decide whether it is a Builders Club page, to pick
	 * the widgets it builds, and by LocalizationCatalogWidget to find the right
	 * navigator.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogViewer.as::get catalogType()
    get catalogType(): string | null
    {
        return this._catalogType;
    }

    get roomEngine(): IRoomEngine
    {
        return this._catalog!.roomEngine!;
    }

    dispose(): void
    {
        if(this._currentPage)
        {
            this._currentPage.dispose();
            this._currentPage = null;
        }

        this._catalog = null;
        this._container = null;
    }

    get catalog(): IHabboCatalog
    {
        return this._catalog!;
    }

    showCatalogPage(
        pageId: number,
        layoutCode: string,
        localization: IPageLocalization,
        offers: IPurchasableOffer[],
        offerId: number,
        acceptSeasonCurrencyAsCredits: boolean
    ): void
    {
        log.debug(`[Catalog Viewer] Show Catalog Page: ${[pageId, layoutCode, offers.length, offerId]}`);

        if(this._currentPage != null)
        {
            if(!this._forceRefresh && this._currentPage.pageId === pageId)
            {
                if(offerId > -1)
                {
                    this._currentPage.selectOffer(offerId);
                }

                return;
            }

            this.disposeCurrentPage();
        }

        const page = new CatalogPage(this, pageId, layoutCode, localization, offers, this._catalog!, acceptSeasonCurrencyAsCredits);

        this._currentPage = page;
        this._previousPageId = pageId > -12345678 ? pageId : this._previousPageId;

        if(page.window != null)
        {
            this._container!.addChild(page.window);
            page.window.height = this._container!.height;
            this._container!.width = page.window.width;
            this._container!.x = this._container!.parent!.width - this._container!.width - 8;

            this._catalog!.setLeftPaneVisibility(this._container!.x >= 130);
        }
        else
        {
            log.warn(`[CatalogViewer] No window for page: ${layoutCode}`);
        }

        this._container!.visible = true;
        this._forceRefresh = false;
        page.selectOffer(offerId);
    }

    disposeCurrentPage(): void
    {
        if(this._currentPage != null)
        {
            this._container!.removeChild(this._currentPage.window);
            this._currentPage.dispose();
            this._container!.invalidate();
        }
    }

    catalogWindowClosed(): void
    {
        if(this._currentPage != null)
        {
            this._currentPage.closed();
        }
    }

    dispatchWidgetEvent(event: unknown): boolean
    {
        return this._currentPage!.dispatchWidgetEvent(event);
    }

    getCurrentLayoutCode(): string
    {
        if(this._currentPage == null) return '';

        return this._currentPage.layoutCode;
    }

    get currentPage(): ICatalogPage | null
    {
        return this._currentPage;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/viewer/CatalogViewer.as::showSearchResults()
    // Builds a synthetic "search results" catalog page out of FurnitureOffer instances (one per
    // found IFurnitureData) - FurnitureOffer isn't ported yet (it needs catalog.roomEngine +
    // sendGetProductOffer, deferred alongside FurniProductContainer - see Offer.ts's port notes).
    showSearchResults(_results: unknown[]): void
    {
    }

    get viewerTags(): string[]
    {
        return this._container ? this._container.tags : [];
    }

    setForceRefresh(): void
    {
        this._forceRefresh = true;
    }

    get previousPageId(): number
    {
        return this._previousPageId;
    }
}
