import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboCatalog} from '../../HabboCatalog';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * Shows a floating price box next to the currently-selected offer.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/SimplePriceCatalogWidget.as
 */
export class SimplePriceCatalogWidget extends CatalogWidget
{
    private _catalog: HabboCatalog;

    private _priceBox: IWindow | null = null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct.bind(this));

        return true;
    }

    private onSelectProduct(event: SelectProductEvent): void
    {
        this._priceBox = this._catalog.utils.showPriceOnProduct(
            event.offer,
            this._window,
            this._priceBox,
            this._window.findChildByName('fake_productimage'),
            0,
            true,
            0
        );
    }
}
