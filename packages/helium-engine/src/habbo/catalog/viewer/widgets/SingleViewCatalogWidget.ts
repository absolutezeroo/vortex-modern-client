import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboCatalog} from '../../HabboCatalog';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {ProductViewCatalogWidget} from './ProductViewCatalogWidget';

/**
 * A `ProductViewCatalogWidget` that also auto-selects the page's first offer once every widget
 * on the page has finished initializing - used by single-offer pages that skip the item grid.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/SingleViewCatalogWidget.as
 */
export class SingleViewCatalogWidget extends ProductViewCatalogWidget
{
    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window, catalog);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.events.on(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);

        return true;
    }

    private onWidgetsInitialized = (_event: CatalogWidgetEvent): void =>
    {
        if(this.page.offers.length === 0) return;

        this.events.emit(SelectProductEvent.SELECT_PRODUCT, new SelectProductEvent(this.page.offers[0]!));
    };
}
