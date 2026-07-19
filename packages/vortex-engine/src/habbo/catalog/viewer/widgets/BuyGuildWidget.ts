import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {GetGuildCreationInfoMessageComposer} from '@habbo/communication/messages/outgoing/users/GetGuildCreationInfoMessageComposer';
import type {HabboCatalog} from '../../HabboCatalog';
import {CatalogWidget} from './CatalogWidget';

/**
 * "Start guild purchase" trigger button on the guild-frontpage catalog page: requests guild
 * creation info from the server and closes the catalog.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/BuyGuildWidget.as
 */
export class BuyGuildWidget extends CatalogWidget
{
    private _button: IWindow | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/BuyGuildWidget.as::BuyGuildWidget()
    // AS3's constructor guards on _button before removing a listener - _button is always null at
    // this point (only assigned in init()), so this is dead code preserved for fidelity, not cleaned up.
    constructor(window: IWindowContainer)
    {
        super(window);

        if(this._button)
        {
            (this._button as IWindow).removeEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/BuyGuildWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this._button = this.window.findChildByName('start_guild_purchase');
        this._button?.addEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/BuyGuildWidget.as::onButtonClicked()
    private onButtonClicked = (_event: WindowMouseEvent): void =>
    {
        const catalog = this.page.viewer.catalog as HabboCatalog;

        catalog.tracking?.trackGoogle('groupPurchase', 'catalogBuyClicked');
        catalog.connection?.send(new GetGuildCreationInfoMessageComposer());
        catalog.toggleCatalog('NORMAL');
    };
}
