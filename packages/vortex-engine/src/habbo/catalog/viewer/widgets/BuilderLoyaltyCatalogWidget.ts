import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboCatalog} from '../../HabboCatalog';
import {CatalogWidget} from './CatalogWidget';

/**
 * Builders Club loyalty page: one row per offer in the `loyalty_list`, each with its name and its
 * price rendered into the row's own `item_cost_box` by the catalog's price utility — so a loyalty
 * offer shows whatever currencies it actually costs, unlike the add-ons list which hard-codes
 * credits and diamonds.
 *
 * Nothing gates the buy buttons here: the add-ons widget's `builderSecondsLeft` check has no
 * counterpart in this class.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/BuilderLoyaltyCatalogWidget.as
 */
export class BuilderLoyaltyCatalogWidget extends CatalogWidget
{
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderLoyaltyCatalogWidget.as::_catalog
    private _catalog: HabboCatalog | null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderLoyaltyCatalogWidget.as::BuilderLoyaltyCatalogWidget()
    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderLoyaltyCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this.window.procedure = this.windowProcedure;

        const list = this.window.findChildByName('loyalty_list') as unknown as IItemListWindow | null;

        if(list == null) return true;

        // The layout's single authored row, taken out to serve as the template.
        const template = list.removeListItemAt(0);

        if(template == null) return true;

        let index = 0;

        for(const offer of this.page.offers)
        {
            const row = template.clone() as unknown as IWindowContainer;
            const header = row.findChildByName('item_header');
            const costBox = row.findChildByName('item_cost_box') as unknown as IWindowContainer | null;
            const buy = row.findChildByName('item_buy');

            if(header) header.caption = offer.localizationName;
            if(costBox) this._catalog?.utils.showPriceInContainer(costBox, offer);
            if(buy) buy.id = index;

            index++;
            list.addListItem(row as unknown as IWindow);
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderLoyaltyCatalogWidget.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(window.name === 'item_buy')
        {
            this._catalog?.showPurchaseConfirmation(this.page.offers[window.id], this.page.pageId);
        }
    };

    override dispose(): void
    {
        if(this.disposed) return;

        this._catalog = null;
        super.dispose();
    }
}
