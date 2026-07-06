import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {HabboCatalog} from '../HabboCatalog';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {ICatalogPage} from './ICatalogPage';
import type {ICatalogViewer} from './ICatalogViewer';
import type {IPageLocalization} from './IPageLocalization';

const log = Logger.getLogger('CatalogPage');

/**
 * A single loaded catalog page: its window, offers, localization, and widgets.
 *
 * @see sources/win63_version/habbo/catalog/viewer/CatalogPage.as
 */
export class CatalogPage implements ICatalogPage
{
    protected static readonly LAYOUT_MAGIC_PREFIX: string = 'layout_';

    static readonly MODE_NORMAL: number = 0;
    static readonly MODE_SEARCH: number = 1;

    protected _window: IWindowContainer | null = null;

    private _viewer: ICatalogViewer | null;

    private _pageId: number;

    private _layoutCode: string;

    private _offers: IPurchasableOffer[];

    private _localization: IPageLocalization;

    // TODO(AS3): sources/win63_version/habbo/catalog/viewer/CatalogPage.as::createWidget()
    // Holds every widget created for this page (~45 AS3 classes, one per layout window name -
    // itemGridWidget, productViewWidget, purchaseWidget, etc). None of viewer/widgets/ is ported
    // yet, so this always stays empty and the page renders its background/layout only, with no
    // interactive widgets. dispose()/closed() already iterate it so wiring real widgets in later
    // needs no further changes here.
    private _widgets: Array<{dispose(): void; closed?(): void}> = [];

    private _widgetEvents: EventEmitter | null = new EventEmitter();

    private _catalog: HabboCatalog | null;

    private _acceptSeasonCurrencyAsCredits: boolean;

    private _searchPageId: number = 0;

    private _itemGridWidget: unknown = null;

    private _mode: number;

    constructor(
        viewer: ICatalogViewer,
        pageId: number,
        layoutCode: string,
        localization: IPageLocalization,
        offers: IPurchasableOffer[],
        catalog: HabboCatalog,
        acceptSeasonCurrencyAsCredits: boolean,
        mode: number = -1
    )
    {
        this._viewer = viewer;
        this._pageId = pageId;
        this._layoutCode = layoutCode;
        this._localization = localization;
        this._offers = offers;
        this._catalog = catalog;

        for(const offer of offers)
        {
            offer.page = this;
        }

        this._acceptSeasonCurrencyAsCredits = acceptSeasonCurrencyAsCredits;
        this._mode = mode === -1 ? 0 : mode;

        this.init();
    }

    get window(): IWindowContainer
    {
        return this._window!;
    }

    get viewer(): ICatalogViewer
    {
        return this._viewer!;
    }

    get pageId(): number
    {
        return this._mode === CatalogPage.MODE_SEARCH ? -12345678 : this._pageId;
    }

    get layoutCode(): string
    {
        return this._layoutCode;
    }

    get offers(): IPurchasableOffer[]
    {
        return this._offers;
    }

    get localization(): IPageLocalization
    {
        return this._localization;
    }

    get links(): string[]
    {
        return this._localization.getLinks(this._layoutCode);
    }

    get hasLinks(): boolean
    {
        return this._localization.hasLinks(this._layoutCode);
    }

    get acceptSeasonCurrencyAsCredits(): boolean
    {
        return this._acceptSeasonCurrencyAsCredits;
    }

    get allowDragging(): boolean
    {
        return this._layoutCode !== 'sold_ltd_items';
    }

    set searchPageId(pageId: number)
    {
        this._searchPageId = pageId;
    }

    get mode(): number
    {
        return this._mode;
    }

    get isBuilderPage(): boolean
    {
        return this._catalog!.catalogType === 'BUILDERS_CLUB';
    }

    selectOffer(offerId: number): void
    {
        if(this._itemGridWidget != null && offerId > -1)
        {
            log.debug(`selecting offer ${offerId}`);

            // TODO(AS3): sources/win63_version/habbo/catalog/viewer/CatalogPage.as::selectOffer()
            // AS3 calls `itemGridWidget.select(offer.gridItem, true)` for the matching offer -
            // ItemGridCatalogWidget isn't ported yet (see the _widgets note above).
        }

        if(this._window && this._window.findChildByName('trophyWidget') != null)
        {
            const input = this._window.findChildByName('input_text') as unknown as ITextFieldWindow;

            input.focus();
            input.activate();
        }
    }

    dispose(): void
    {
        for(const widget of this._widgets)
        {
            widget.dispose();
        }

        this._widgets = [];
        this._localization.dispose();

        for(const offer of this._offers)
        {
            offer.dispose();
        }

        this._offers = [];

        if(this._window != null)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._widgetEvents != null)
        {
            this._widgetEvents.removeAllListeners();
            this._widgetEvents = null;
        }

        this._viewer = null;
        this._catalog = null;
        this._pageId = 0;
        this._layoutCode = '';
        this._acceptSeasonCurrencyAsCredits = false;
    }

    init(): void
    {
        if(this.createWindow(this.layoutCode))
        {
            this.createWidgets();
        }
    }

    closed(): void
    {
        for(const widget of this._widgets)
        {
            widget.closed?.();
        }
    }

    protected createWindow(layoutCode: string): boolean
    {
        if(layoutCode === 'frontpage4')
        {
            layoutCode = 'frontpage_featured';
        }

        let assetName = CatalogPage.LAYOUT_MAGIC_PREFIX + layoutCode;

        if(this._viewer!.viewerTags.indexOf('UBUNTU') > -1)
        {
            if(!this.viewer.catalog.assets!.hasAsset(assetName))
            {
                assetName = 'old_' + assetName;
            }
        }
        else
        {
            assetName = 'old_' + assetName;
        }

        const asset = this.viewer.catalog.assets!.getAssetByName(assetName);

        if(asset == null)
        {
            log.warn(`Could not find asset for layout ${assetName}`);

            return false;
        }

        this._window = this._catalog!.windowManager!.buildFromXML(asset.content as string) as unknown as IWindowContainer;

        if(this._window == null)
        {
            log.warn(`Could not create layout ${layoutCode}`);

            return false;
        }

        return true;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/viewer/CatalogPage.as::createWidgets()
    // See the _widgets field note - createWidget()'s ~45-case switch (one per layout window
    // name) isn't ported since none of viewer/widgets/ exists yet. This still needs to run for
    // the (currently empty) initializeLocalizations() pass once LocalizationCatalogWidget exists.
    private createWidgets(): void
    {
    }

    dispatchWidgetEvent(event: unknown): boolean
    {
        if(this._widgetEvents != null)
        {
            const typed = event as {type: string};

            this._widgetEvents.emit(typed.type, event);

            return true;
        }

        return false;
    }

    replaceOffers(offers: IPurchasableOffer[], disposeOld: boolean = false): void
    {
        if(disposeOld)
        {
            for(const offer of this._offers)
            {
                offer.dispose();
            }
        }

        this._offers = offers;
    }

    updateLimitedItemsLeft(offerId: number, itemsLeft: number): void
    {
        for(const offer of this._offers)
        {
            if(offer.offerId === offerId)
            {
                offer.product!.uniqueLimitedItemsLeft = itemsLeft;

                // TODO(AS3): sources/win63_version/habbo/catalog/viewer/CatalogPage.as::updateLimitedItemsLeft()
                // AS3 dispatches a ProductOfferUpdatedEvent here for listening widgets -
                // no widget listens yet (see the _widgets field note).
                return;
            }
        }
    }
}
