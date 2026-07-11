import type {IWindowContainer} from '@core/window/IWindowContainer';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * Auto-selects the page's first offer once every widget on the page has finished initializing.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/FirstProductSelectorCatalogWidget.as
 */
export class FirstProductSelectorCatalogWidget extends CatalogWidget
{
    constructor(window: IWindowContainer)
    {
        super(window);
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
