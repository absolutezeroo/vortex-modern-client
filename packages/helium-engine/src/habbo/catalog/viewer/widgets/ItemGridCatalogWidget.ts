import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {IGridItem} from '../IGridItem';
import type {IItemGrid} from '../IItemGrid';
import type {IProductContainer} from '../IProductContainer';
import type {IDragAndDropDoneReceiver} from '../IDragAndDropDoneReceiver';
import {BundleProductContainer} from '../BundleProductContainer';
import {ProductContainer} from '../ProductContainer';
import type {CatalogWidgetColourIndexEvent} from './events/CatalogWidgetColourIndexEvent';
import {CatalogWidgetColoursEvent} from './events/CatalogWidgetColoursEvent';
import {SelectProductEvent} from './events/SelectProductEvent';
import {SetExtraPurchaseParameterEvent} from './events/SetExtraPurchaseParameterEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * Renders the offer grid on a catalog page: lazily loads item icons, drives selection.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/ItemGridCatalogWidget.as
 */
export class ItemGridCatalogWidget extends CatalogWidget implements IItemGrid, IDragAndDropDoneReceiver 
{
    itemColors: Map<string, number[]> = new Map();

    // AS3 loads these via assets.getAssetByName(name).content (raw XML, rebuilt per item via
    // buildFromXML()); this port's compiled window-layout registry only exposes ready-built
    // window instances (buildWidgetLayout()), so these hold one template instance each, cloned
    // per grid item instead - the same clone-a-template pattern CatalogNodeRenderable already
    chosenItemColorIndex: number = 0;
    protected _itemGrid: IItemGridWindow | null = null;
    // uses for its own item/list templates.
    protected _gridItemLayout: IWindow | null = null;
    protected _gridItemWithPriceMulti: IWindow | null = null;
    protected _gridItemWithPriceSingle: IWindow | null = null;
    protected _selectedGridItem: IGridItem | null = null;
    protected _graphicsTimer: ReturnType<typeof setInterval> | null = null;
    protected _useTimer: boolean = true;
    protected _sessionDataManager: ISessionDataManager;
    private _bundleCounter: number = 0;
    private _offerInitIndex: number = 0;
    private _catalogType: string;

    constructor(window: IWindowContainer, sessionDataManager: ISessionDataManager, catalogType: string) 
    {
        super(window);
        this._sessionDataManager = sessionDataManager;
        this._catalogType = catalogType;
    }

    override dispose(): void 
    {
        if(this._graphicsTimer != null) 
        {
            clearInterval(this._graphicsTimer);
            this._graphicsTimer = null;
        }

        if(this._itemGrid != null) 
        {
            this._itemGrid.destroyGridItems();
            this._itemGrid = null;
        }

        this._gridItemLayout = null;
        this._gridItemWithPriceMulti = null;
        this._gridItemWithPriceSingle = null;
        this._selectedGridItem = null;

        super.dispose();
    }

    override init(): boolean 
    {
        if(!super.init()) return false;

        this.attachWidgetView('itemGridWidget');

        const isFixed = this._window.tags.indexOf('FIXED') > -1;

        this._itemGrid = this._window.findChildByName('itemGrid') as unknown as IItemGridWindow;

        if(!isFixed) 
        {
            this._window.getChildAt(0)!.width = this._window.width;
            this._window.getChildAt(0)!.height = this._window.height;
        }

        this._itemGrid.verticalSpacing = 0;

        this._gridItemLayout = this.page.viewer.catalog.windowManager!.buildWidgetLayout('gridItem');
        this._gridItemWithPriceSingle = this.page.viewer.catalog.windowManager!.buildWidgetLayout('grid_item_with_price_single');
        this._gridItemWithPriceMulti = this.page.viewer.catalog.windowManager!.buildWidgetLayout('grid_item_with_price_multi');

        const loadGraphics = this.populateItemGrid();

        if(this._useTimer) 
        {
            this._graphicsTimer = setInterval(() => this.loadItemGridGraphics(loadGraphics), 25);
        }
        else 
        {
            this.loadItemGridGraphics(loadGraphics);
        }

        this.events.on('COLOUR_INDEX', this.onColourIndex.bind(this));

        return true;
    }

    select(item: IGridItem, dispatchColours: boolean): void 
    {
        if(this._selectedGridItem != null) 
        {
            this._selectedGridItem.deactivate();
        }

        this._selectedGridItem = item;
        item.activate();

        if(item.view) 
        {
            item.view.findChildByName('border_outline')!.color = this._catalogType === 'NORMAL' ? 6538729 : 16758076;
        }

        const container = item as unknown as ProductContainer;

        if(!container) return;

        if(container.isLazy) return;

        const offer = container.offer;

        if(offer != null) 
        {
            this.events.emit(SelectProductEvent.SELECT_PRODUCT, new SelectProductEvent(offer));

            if(offer.product && offer.product.productType === 'i') 
            {
                this.events.emit(
                    SetExtraPurchaseParameterEvent.CWE_SET_EXTRA_PARM,
                    new SetExtraPurchaseParameterEvent(offer.product.extraParam)
                );
            }
        }

        if(dispatchColours) 
        {
            this.events.emit(CatalogWidgetColoursEvent.COLOUR_ARRAY, new CatalogWidgetColoursEvent(
                this.getCurrentItemColors(),
                'ctlg_clr_27x22_1',
                'ctlg_clr_27x22_2',
                'ctlg_clr_27x22_3',
                this.getCurrentItemColourIndex()
            ));
        }
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/viewer/widgets/ItemGridCatalogWidget.as::startDragAndDrop()
    // Real logic calls (catalog as HabboCatalog).requestSelectedItemToMover(this, offer) to hand
    // the offer to CatalogObjectMover for drag-into-room placement - neither is ported yet
    // (see Offer.ts's port notes on the deferred in-room "buy this placed item" flow).
    startDragAndDrop(_item: IGridItem): boolean 
    {
        return false;
    }

    onDragAndDropDone(success: boolean, extraParam: string): void 
    {
        if(this.disposed) return;

        if(success) 
        {
            // TODO(AS3): sources/win63_version/habbo/catalog/viewer/widgets/ItemGridCatalogWidget.as::onDragAndDropDone()
            // AS3 dispatches a CatalogWidgetInitPurchaseEvent(false, extraParam) here - not
            // ported yet (pairs with the deferred startDragAndDrop() above).
            void extraParam;
        }
    }

    stopDragAndDrop(): void 
    {
    }

    getCurrentItemColors(): number[] 
    {
        let matched: IPurchasableOffer | null = null;

        for(const offer of this.page.offers) 
        {
            if(offer.gridItem === this._selectedGridItem) 
            {
                matched = offer;
            }
        }

        if(!matched || !matched.product!.isColorable) return [];

        const baseName = matched.product!.furnitureData!.fullName.split('*')[0];

        return this.itemColors.get(baseName) ?? [];
    }

    protected populateItemGrid(): IPurchasableOffer[] 
    {
        const groupByColor = this.page.layoutCode === 'default_3x3_color_grouping';
        const groupedOffers: IPurchasableOffer[] = [];
        const groupIndexByBaseName = new Map<string, number>();

        if(groupByColor) 
        {
            for(const offer of this.page.offers) 
            {
                if(!offer.product!.furnitureData || !offer.product!.isColorable) 
                {
                    groupedOffers.push(offer);

                    continue;
                }

                const furnitureData = offer.product!.furnitureData!;
                const baseName = furnitureData.fullName.split('*')[0];
                const colourIndex = parseInt(furnitureData.fullName.split('*')[1], 10);

                if(!this.itemColors.has(baseName)) 
                {
                    this.itemColors.set(baseName, []);
                }

                let lastColour = 16777215;

                if(furnitureData.colours) 
                {
                    for(const colour of furnitureData.colours) 
                    {
                        if(colour !== 16777215) 
                        {
                            lastColour = colour;
                        }
                    }

                    const colours = this.itemColors.get(baseName)!;

                    if(colours.indexOf(lastColour) === -1) 
                    {
                        colours[colourIndex] = lastColour;
                    }
                }

                if(!groupIndexByBaseName.has(baseName)) 
                {
                    groupIndexByBaseName.set(baseName, groupedOffers.length);
                    groupedOffers.push(offer);
                }
                else if(baseName.indexOf('bc_') === 0 && (lastColour === 16777215 || lastColour === 16777214)) 
                {
                    groupedOffers[groupIndexByBaseName.get(baseName)!] = offer;
                }
            }
        }

        const offersToLoad: IPurchasableOffer[] = [];

        for(const offer of this.page.offers) 
        {
            if(groupByColor && offer.product!.furnitureData && offer.product!.isColorable) 
            {
                if(groupedOffers.indexOf(offer) !== -1) 
                {
                    const view = this.createGridItem(offer.gridItem);

                    offer.gridItem.view = view;
                }
            }
            else 
            {
                const view = this.createGridItem(offer.gridItem);

                offer.gridItem.view = view;
            }

            offer.gridItem.grid = this;

            if(groupedOffers.indexOf(offer) !== -1 || !groupByColor) 
            {
                offersToLoad.push(offer);
            }

            if(offer.pricingModel === 'pricing_model_bundle') 
            {
                this._bundleCounter = this._bundleCounter + 1;

                if(offer.productContainer instanceof BundleProductContainer) 
                {
                    offer.productContainer.setBundleCounter(this._bundleCounter);
                }
            }
        }

        return offersToLoad;
    }

    protected resetTimer(): void 
    {
        this._offerInitIndex = 0;
    }

    protected loadItemGridGraphics(offers: IPurchasableOffer[] | null = null): void 
    {
        if(this.disposed) return;

        const list = offers ?? this.page.offers;
        const count = list.length;

        if(count > 0) 
        {
            for(let i = 0; i < 3; i++) 
            {
                if(this._offerInitIndex >= 0 && this._offerInitIndex < count) 
                {
                    this.loadGraphics(list[this._offerInitIndex]);
                }

                this._offerInitIndex = this._offerInitIndex + 1;

                if(this._offerInitIndex >= count) 
                {
                    this.resetTimer();

                    if(this._graphicsTimer != null) 
                    {
                        clearInterval(this._graphicsTimer);
                        this._graphicsTimer = null;
                    }

                    break;
                }
            }
        }
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ItemGridCatalogWidget.as::loadGraphics()
    // The guild-recolor preview branch (var_3738/StringArrayStuffData.setArray()) is not ported -
    // StringArrayStuffData only supports construction from a room-object model/message wrapper in

    protected createGridItem(gridItem: IGridItem): IWindowContainer 
    {
        const container = gridItem as unknown as IProductContainer;
        const hasPrice = container != null && container.offer != null
            && (container.offer.priceInCredits > 0 || container.offer.priceInActivityPoints > 0 || container.offer.priceInSilver > 0);

        let template: IWindow;

        if(hasPrice && this._catalogType !== 'BUILDERS_CLUB') 
        {
            template = (container.offer.priceInCredits > 0 && container.offer.priceInActivityPoints > 0)
                ? this._gridItemWithPriceMulti!
                : this._gridItemWithPriceSingle!;
        }
        else 
        {
            template = this._gridItemLayout!;
        }

        const view = template.clone() as unknown as IWindowContainer;

        this._itemGrid!.addGridItem(view);
        gridItem.view = view;

        if(this._catalogType !== 'BUILDERS_CLUB' && container instanceof ProductContainer) 
        {
            container.createCurrencyIndicators(this.page.viewer.catalog as HabboCatalog);
        }

        return view;
    }

    // this port, not the ad-hoc string array AS3 builds here for a not-yet-owned guild furni item.
    protected loadGraphics(offer: IPurchasableOffer): void 
    {
        if(offer != null && !offer.disposed) 
        {
            offer.productContainer.initProductIcon(this.page.viewer.roomEngine, null);
        }

        offer.productContainer.grid = this;
    }

    private onColourIndex(event: CatalogWidgetColourIndexEvent): void 
    {
        let matched: IPurchasableOffer | null = null;

        for(const offer of this.page.offers) 
        {
            if(offer.gridItem === this._selectedGridItem && offer.gridItem.view != null) 
            {
                matched = offer;
            }
        }

        if(!matched || !matched.product!.isColorable) return;

        const view = matched.gridItem.view;

        matched.gridItem.view = null!;

        const targetName = matched.product!.furnitureData!.fullName.split('*')[0] + '*' + (event.index + 1);

        for(const offer of this.page.offers) 
        {
            if(offer.product!.furnitureData!.fullName === targetName) 
            {
                offer.gridItem.view = view;
                this.select(offer.gridItem, false);
                this.loadGraphics(offer);
            }
        }
    }

    private getCurrentItemColourIndex(): number 
    {
        let matched: IPurchasableOffer | null = null;

        for(const offer of this.page.offers) 
        {
            if(offer.gridItem === this._selectedGridItem) 
            {
                matched = offer;
            }
        }

        if(!matched || !matched.product!.isColorable) return 0;

        return Math.max(matched.product!.furnitureData!.colourIndex - 1, 0);
    }
}
