import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {IItemGrid} from '../IItemGrid';
import type {IGridItem} from '../IGridItem';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * Shows a bundle offer's sub-products as a plain grid (used by bundle-only catalog pages,
 * distinct from the "deal" grid item icon `BundleProductContainer` shows inline in a normal
 * item grid).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/BundleGridViewCatalogWidget.as
 */
export class BundleGridViewCatalogWidget extends CatalogWidget implements IItemGrid
{
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BundleGridViewCatalogWidget.as::_offer
    private _offer: IPurchasableOffer | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BundleGridViewCatalogWidget.as::_itemGrid
    private _itemGrid: IItemGridWindow | null = null;

    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.on(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        this._itemGrid = this.window.findChildByName('bundleGrid') as unknown as IItemGridWindow | null;

        return true;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.off(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        super.dispose();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BundleGridViewCatalogWidget.as::get offer()
    get offer(): IPurchasableOffer | null
    {
        return this._offer;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BundleGridViewCatalogWidget.as::select()
    select(_item: IGridItem, _selected: boolean): void
    {
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BundleGridViewCatalogWidget.as::startDragAndDrop()
    startDragAndDrop(_item: IGridItem): boolean
    {
        return false;
    }

    private onWidgetsInitialized = (_event: CatalogWidgetEvent): void =>
    {
        if(this.page.offers.length !== 1) return;

        const offer = this.page.offers[0];

        if(offer) this.events.emit(SelectProductEvent.SELECT_PRODUCT, new SelectProductEvent(offer));
    };

    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        this._offer = event.offer;
        this._itemGrid?.destroyGridItems();
        this.populateItemGrid();
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BundleGridViewCatalogWidget.as::populateItemGrid()
    private populateItemGrid(): void
    {
        if(this._offer == null || this._itemGrid == null) return;

        const template = this.page.viewer.catalog.windowManager!.buildWidgetLayout('gridItem') as unknown as IWindowContainer | null;

        if(template == null) return;

        for(const product of this._offer.productContainer.products)
        {
            if(product.productType === 'b') continue;

            const view = template.clone() as unknown as IWindowContainer;
            const clubLevelIcon = view.findChildByName('clubLevelIcon');

            if(clubLevelIcon != null) clubLevelIcon.visible = false;

            this._itemGrid.addGridItem(view as unknown as IWindow);
            product.view = view;

            const image = product.initIcon(this);

            image?.close();

            product.grid = this;
        }
    }
}
