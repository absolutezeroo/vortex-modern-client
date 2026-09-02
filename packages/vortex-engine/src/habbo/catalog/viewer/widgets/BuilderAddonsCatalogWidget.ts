import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboCatalog} from '../../HabboCatalog';
import {CatalogWidget} from './CatalogWidget';

/**
 * Builders Club add-ons page: one row per offer in the `addons_list`, each with its name, its
 * credit price and — when the offer costs diamonds too — the diamond icon and amount.
 *
 * The whole list is bought-out when the player's Builders Club subscription has run out:
 * `builderSecondsLeft` at zero shows the `trial_warning` and disables every buy button.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/BuilderAddonsCatalogWidget.as
 */
export class BuilderAddonsCatalogWidget extends CatalogWidget
{
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderAddonsCatalogWidget.as::_catalog
    private _catalog: HabboCatalog | null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderAddonsCatalogWidget.as::BuilderAddonsCatalogWidget()
    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderAddonsCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this.window.procedure = this.windowProcedure;

        const list = this.window.findChildByName('addons_list') as unknown as IItemListWindow | null;

        if(list == null) return true;

        // AS3 takes the first list item out and uses it as the row template. The layout ships
        // exactly one, authored row for that purpose.
        const template = list.removeListItemAt(0);

        if(template == null) return true;

        const subscribed = (this._catalog?.builderSecondsLeft ?? 0) > 0;
        const trialWarning = this.window.findChildByName('trial_warning');

        if(trialWarning) trialWarning.visible = !subscribed;

        let index = 0;

        for(const offer of this.page.offers)
        {
            const row = template.clone() as unknown as IWindowContainer;
            const header = row.findChildByName('item_header');
            const price = row.findChildByName('item_price');
            const buy = row.findChildByName('item_buy');

            if(header) header.caption = offer.localizationName;
            if(price) price.caption = offer.priceInCredits.toString();
            if(buy) buy.id = index;

            if(offer.priceInActivityPoints > 0)
            {
                const diamondsIcon = row.findChildByName('diamonds_icon');
                const diamondsPrice = row.findChildByName('diamonds_price');

                if(diamondsIcon) diamondsIcon.visible = true;

                if(diamondsPrice)
                {
                    diamondsPrice.visible = true;
                    diamondsPrice.caption = offer.priceInActivityPoints.toString();
                }
            }

            if(!subscribed) buy?.disable();

            index++;
            list.addListItem(row as unknown as IWindow);
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderAddonsCatalogWidget.as::windowProcedure()
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
