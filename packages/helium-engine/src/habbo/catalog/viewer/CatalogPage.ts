import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {HabboCatalog} from '../HabboCatalog';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {ICatalogPage} from './ICatalogPage';
import type {ICatalogViewer} from './ICatalogViewer';
import type {IPageLocalization} from './IPageLocalization';
import type {ICatalogWidget} from './widgets/ICatalogWidget';
import {ItemGridCatalogWidget} from './widgets/ItemGridCatalogWidget';
import {SimplePriceCatalogWidget} from './widgets/SimplePriceCatalogWidget';
import {ProductViewCatalogWidget} from './widgets/ProductViewCatalogWidget';
import {PurchaseCatalogWidget} from './widgets/PurchaseCatalogWidget';
import {LocalizationCatalogWidget} from './widgets/LocalizationCatalogWidget';
import {SpinnerCatalogWidget} from './widgets/SpinnerCatalogWidget';
import {TotalPriceCatalogWidget} from './widgets/TotalPriceCatalogWidget';
import {CatalogWidgetEvent} from './widgets/events/CatalogWidgetEvent';

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
    // createWidget()'s ~45-case switch (one per layout window name) only handles
    // "itemGridWidget"/"simplePriceWidget" so far - the rest of viewer/widgets/ isn't ported yet,
    // so most pages still render their background/layout with limited interactive content.
    private _widgets: ICatalogWidget[] = [];

    private _widgetEvents: EventEmitter | null = new EventEmitter();

    private _catalog: HabboCatalog | null;

    private _acceptSeasonCurrencyAsCredits: boolean;

    private _searchPageId: number = 0;

    private _itemGridWidget: ItemGridCatalogWidget | null = null;

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

            for(const offer of this._offers)
            {
                if(offer.offerId === offerId)
                {
                    this._itemGridWidget.select(offer.gridItem, true);
                }
            }
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

    // TS-only: the "layout_" (newer/UBUNTU) source tree renamed some page layout codes relative
    // to the "ctlg_"/bare-code (older) source tree - AS3 itself only special-cases "frontpage4"
    // -> "frontpage_featured" (see LAYOUT_MAGIC_PREFIX usage below), but this port's two compiled
    // asset sets also disagree on "default_3x3" -> "default_ubuntu" (confirmed: layout_default_
    // ubuntu.json has the same widget set as ctlg_default_3x3.json, just a taller productViewWidget
    // region - 240px vs 180px - matching its own internal 200px-tall room canvas correctly, where
    // ctlg_default_3x3.json's placeholder undersizes it). Only applied when preferring new naming.
    private static readonly NEW_NAMING_RENAMES: Record<string, string> = {
        frontpage4: 'frontpage_featured',
        default_3x3: 'default_ubuntu',
    };

    // AS3 loads this via assets.getAssetByName("layout_" + name / "old_layout_" + name).content +
    // buildFromXML(), picking the prefix via assets.hasAsset() ahead of time. This port's compiled
    // window-layout registry is keyed by whatever name the original Flash source file had, which
    // for catalog pages is inconsistently "layout_<code>" (newer/UBUNTU pages) or "ctlg_<code>"
    // (older pages, compiled from a different source tree) - so the hasWidgetLayout() probe checks
    // both prefixes (plus the bare code) instead of AS3's single hasAsset(assetName) check.
    protected createWindow(layoutCode: string): boolean
    {
        const preferNewNaming = this._viewer!.viewerTags.indexOf('UBUNTU') > -1;
        const renamedCode = (preferNewNaming ? CatalogPage.NEW_NAMING_RENAMES[layoutCode] : null) ?? layoutCode;
        const windowManager = this._catalog!.windowManager!;

        const candidates = preferNewNaming
            ? [CatalogPage.LAYOUT_MAGIC_PREFIX + renamedCode, 'ctlg_' + layoutCode]
            : ['ctlg_' + layoutCode, CatalogPage.LAYOUT_MAGIC_PREFIX + renamedCode];

        candidates.push(CatalogPage.LAYOUT_MAGIC_PREFIX + layoutCode, layoutCode);

        const assetName = candidates.find((candidate) => windowManager.hasWidgetLayout(candidate));

        this._window = (assetName ? windowManager.buildWidgetLayout(assetName) : null) as unknown as IWindowContainer | null;

        if(this._window == null)
        {
            log.warn(`Could not create layout ${layoutCode}`);

            return false;
        }

        return true;
    }

    private createWidgets(): void
    {
        this.createWidgetsRecursion(this._window);
        this.initializeWidgets();
    }

    private createWidgetsRecursion(window: IWindowContainer | null): void
    {
        if(window == null) return;

        for(let i = 0; i < window.numChildren; i++)
        {
            const child = window.getChildAt(i) as unknown as IWindowContainer | null;

            if(child != null)
            {
                this.createWidget(child);
                this.createWidgetsRecursion(child);
            }
        }
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/viewer/CatalogPage.as::createWidget()
    // Only 6 of the ~45 AS3 cases are ported (itemGridWidget/simplePriceWidget/productViewWidget/
    // purchaseWidget/spinnerWidget/totalPriceWidget) - the rest (colourGridWidget,
    // spacesNewWidget, trophyWidget, ...) fall through and are silently skipped, matching AS3's
    // own switch (no default case = unmatched names do nothing).
    private createWidget(window: IWindowContainer): void
    {
        switch(window.name)
        {
            case 'itemGridWidget':
                if(this._itemGridWidget == null)
                {
                    this._itemGridWidget = new ItemGridCatalogWidget(
                        window,
                        this._catalog!.sessionDataManager as ISessionDataManager,
                        this._catalog!.catalogType
                    );
                    this._widgets.push(this._itemGridWidget);
                }

                break;
            case 'simplePriceWidget':
                this._widgets.push(new SimplePriceCatalogWidget(window, this._catalog!));
                break;
            case 'productViewWidget':
                this._widgets.push(new ProductViewCatalogWidget(window, this._catalog!));
                break;
            case 'purchaseWidget':
                this._widgets.push(new PurchaseCatalogWidget(window, this._catalog!));
                break;
            case 'spinnerWidget':
                this._widgets.push(new SpinnerCatalogWidget(window, this._catalog!));
                break;
            case 'totalPriceWidget':
                this._widgets.push(new TotalPriceCatalogWidget(window, this._catalog!));
                break;
        }
    }

    private initializeWidgets(): void
    {
        const failed: ICatalogWidget[] = [];

        for(const widget of this._widgets)
        {
            widget.page = this;
            widget.events = this._widgetEvents!;

            if(!widget.init())
            {
                failed.push(widget);
            }
        }

        this.removeWidgets(failed);
        this.initializeLocalizations();

        this._widgetEvents!.emit(CatalogWidgetEvent.WIDGETS_INITIALIZED, new CatalogWidgetEvent(CatalogWidgetEvent.WIDGETS_INITIALIZED));
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/CatalogPage.as::initializeLocalizations()
    private initializeLocalizations(): void
    {
        const widget = new LocalizationCatalogWidget(this._window!, this._catalog!);

        this._widgets.push(widget);
        widget.page = this;
        widget.events = this._widgetEvents!;
        widget.init();
    }

    private removeWidgets(widgets: ICatalogWidget[]): void
    {
        if(widgets == null || widgets.length === 0) return;

        // AS3 cascades: any widget whose window lives inside an already-removed widget's window
        // gets removed too (its own init() may have succeeded, but its parent window is going away).
        for(const widget of this._widgets)
        {
            if(widget.window == null) continue;

            for(const removed of widgets)
            {
                if(removed.window != null && removed.window.getChildIndex(widget.window) >= 0)
                {
                    if(widgets.indexOf(widget) < 0)
                    {
                        widgets.push(widget);
                    }

                    break;
                }
            }
        }

        for(const widget of widgets)
        {
            if(widget.window != null)
            {
                this._window!.removeChild(widget.window);
                widget.window.dispose();
            }

            const index = this._widgets.indexOf(widget);

            if(index >= 0)
            {
                this._widgets.splice(index, 1);
            }

            widget.dispose();
        }
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
