import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboCatalog} from '../../HabboCatalog';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetToggleEvent} from './events/CatalogWidgetToggleEvent';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

/**
 * Shows a "sold out" banner (and hides the purchase widget) for a unique/limited item that has
 * no supply left, or when the page is specifically a "limited sold" / "sold_ltd_items" page.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/SoldLtdItemsCatalogWidget.as
 */
export class SoldLtdItemsCatalogWidget extends CatalogWidget
{
    private _catalog: HabboCatalog | null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);
        this._catalog = null;
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.SOLD_LTD_ITEMS);
        this.window.visible = false;
        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);

        return true;
    }

    private onPreviewProduct = (event: SelectProductEvent): void =>
    {
        if(event?.offer?.product == null) return;

        if(this.page.mode === 1) // CatalogPage.MODE_SEARCH
        {
            const navigator = this._catalog?.getCatalogNavigator(this._catalog.catalogType);
            const nodes = navigator?.getNodesByOfferId(event.offer.offerId) ?? [];

            for(const node of nodes)
            {
                if(node.pageName.indexOf('limited_sold') > -1)
                {
                    this.window.visible = true;
                    this.events.emit(CatalogWidgetToggleEvent.CWE_TOGGLE, new CatalogWidgetToggleEvent('purchaseWidget', false));

                    return;
                }
            }
        }

        if(this.page.layoutCode === 'sold_ltd_items')
        {
            this.window.visible = true;
            this.events.emit(CatalogWidgetToggleEvent.CWE_TOGGLE, new CatalogWidgetToggleEvent('purchaseWidget', false));

            return;
        }

        if(event.offer.product.isUniqueLimitedItem && event.offer.product.uniqueLimitedItemsLeft === 0)
        {
            this.window.visible = true;
            this.events.emit(CatalogWidgetToggleEvent.CWE_TOGGLE, new CatalogWidgetToggleEvent('purchaseWidget', false));
        }
        else
        {
            this.window.visible = false;
            this.events.emit(CatalogWidgetToggleEvent.CWE_TOGGLE, new CatalogWidgetToggleEvent('purchaseWidget', true));
        }
    };
}
