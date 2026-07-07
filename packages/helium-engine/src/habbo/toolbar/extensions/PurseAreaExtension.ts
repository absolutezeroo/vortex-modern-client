import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {HabboToolbar} from '../HabboToolbar';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {PurseEvent} from '@habbo/catalog/purse/PurseEvent';
import {ToolbarDisplayExtensionIds} from '../ToolbarDisplayExtensionIds';
import {PurseClubArea} from './purse/PurseClubArea';
import {formatPurseAmount} from './purse/PurseAmountFormatter';

/**
 * Manages the currency display area in the toolbar extension view
 *
 * In AS3 this creates a window from XML showing credits, duckets, and diamonds,
 * listens for purse balance events, and routes click events to catalog pages.
 * In Helium, the UI rendering is handled by SolidJS; this manages state.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/PurseAreaExtension.as
 */
export class PurseAreaExtension 
{
    private static readonly MENU_HELP: string = 'HELP';

    private _toolbar: HabboToolbar | null;
    private _windowManager: IHabboWindowManager | null;
    private _catalog: IHabboCatalog | null;
    private _window: IWindowContainer | null = null;
    private _clubArea: PurseClubArea | null = null;

    constructor(
        toolbar: HabboToolbar,
        windowManager: IHabboWindowManager,
        catalog: IHabboCatalog
    ) 
    {
        this._toolbar = toolbar;
        this._windowManager = windowManager;
        this._catalog = catalog;
        this._window = windowManager.buildWidgetLayout('purse_xml') as IWindowContainer | null;

        if(this._window) 
        {
            this._window.procedure = this.windowProcedure;
            this._clubArea = new PurseClubArea(toolbar, this._window);
            toolbar.extensionView?.attachExtension(ToolbarDisplayExtensionIds.PURSE, this._window, 0);

            const creditCount = this._window.findChildByName('credit_count');

            if(creditCount) 
            {
                windowManager.registerHintWindow('credit_count', creditCount);
            }
        }

        this._catalog.events.on(PurseEvent.CREDIT_BALANCE, this.onCreditsBalance);
        this._catalog.events.on(PurseEvent.ACTIVITY_POINT_BALANCE, this.onPointBalance);
        this.updateCreditAndPointValues();
        this.refreshIndicators();
    }

    private _credits: number = 0;

    get credits(): number 
    {
        return this._credits;
    }

    private _duckets: number = 0;

    get duckets(): number 
    {
        return this._duckets;
    }

    private _diamonds: number = 0;

    get diamonds(): number 
    {
        return this._diamonds;
    }

    get disposed(): boolean 
    {
        return this._toolbar === null;
    }

    private get earningsUnseenIndicator(): IStaticBitmapWrapperWindow | null 
    {
        return this._window?.findChildByName('earnings_unseen_indicator') as IStaticBitmapWrapperWindow | null;
    }

    public getClubArea(): PurseClubArea | null 
    {
        return this._clubArea;
    }

    public onCreditsBalance = (event: PurseEvent): void => 
    {
        this._credits = event.balance;

        const creditCount = this._window?.findChildByName('credit_count');

        if(creditCount) 
        {
            creditCount.caption = formatPurseAmount(event.balance, this._toolbar?.localization ?? null);
        }
    };

    public onPointBalance = (event: PurseEvent): void => 
    {
        let targetName: string | null = null;

        switch(event.activityPointType) 
        {
            case 0:
                this._duckets = event.balance;
                targetName = 'ducket_count';
                break;
            case 5:
                this._diamonds = event.balance;
                targetName = 'diamond_count';
                break;
        }

        if(targetName === null) return;

        const target = this._window?.findChildByName(targetName);

        if(target) 
        {
            target.caption = formatPurseAmount(event.balance, this._toolbar?.localization ?? null);
        }
    };

    public getIconLocation(name: string): { x: number; y: number; width: number; height: number } | null 
    {
        const child = this._window?.findChildByName(name);

        if(!child) return null;

        const rect = {x: 0, y: 0, width: 0, height: 0};
        child.getGlobalRectangle(rect);

        return rect;
    }

    public getIcon(name: string): IWindow | null 
    {
        return this._window?.findChildByName(name) ?? null;
    }

    public refreshIndicators(): void 
    {
        const indicator = this.earningsUnseenIndicator;

        if(indicator) 
        {
            indicator.visible = false;
        }
    }

    public dispose(): void 
    {
        if(this.disposed) return;

        if(this._clubArea) 
        {
            this._clubArea.dispose();
            this._clubArea = null;
        }
        else 
        {
            this._window?.dispose();
        }

        this._window = null;
        if(this._catalog) 
        {
            this._catalog.events.off(PurseEvent.CREDIT_BALANCE, this.onCreditsBalance);
            this._catalog.events.off(PurseEvent.ACTIVITY_POINT_BALANCE, this.onPointBalance);
        }

        this._catalog = null;
        this._windowManager = null;
        this._toolbar = null;
    }

    private updateCreditAndPointValues(): void 
    {
        if(!this._catalog) return;

        const purse = this._catalog.getPurse();

        this.onCreditsBalance(new PurseEvent(PurseEvent.CREDIT_BALANCE, purse.credits, 0));
        this.onPointBalance(new PurseEvent(PurseEvent.ACTIVITY_POINT_BALANCE, purse.getActivityPointsForType(0), 0));

        if(this._toolbar?.getBoolean('diamonds.enabled')) 
        {
            this.onPointBalance(new PurseEvent(PurseEvent.ACTIVITY_POINT_BALANCE, purse.getActivityPointsForType(5), 5));
        }
        else 
        {
            const diamondButton = this._window?.findChildByName('diamond_count_button');
            const itemList = this._window?.findChildByName('purse_itemlist') as IItemListWindow | null;

            if(diamondButton && itemList) 
            {
                itemList.removeListItem(diamondButton);
            }
        }
    }

    // AS3: sources/win63_version/habbo/toolbar/extensions/PurseAreaExtension.as::windowProcedure()
    // switches on the clicked window's own name directly (param2.name) - no ancestor walk.
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK || !this._toolbar) return;

        this._windowManager?.hideMatchingHint(window.name);

        switch(window.name)
        {
            case 'earnings_button':
                this._catalog?.openVault();
                break;
            case 'hc_join_button':
                this._catalog?.openClubCenter();
                break;
            case 'help_button':
                this._toolbar.toggleWindowVisibility(PurseAreaExtension.MENU_HELP);
                break;
            case 'settings_button':
                this._toolbar.toggleSettingVisibility();
                break;
            case 'credit_count_button':
                this._catalog?.openCreditsHabblet();
                break;
            case 'ducket_count_button':
                this._catalog?.openCatalogPage('ducket_info');
                break;
            case 'diamond_count_button':
                this._catalog?.openCatalogPage('loyalty_info');
                break;
            case 'logout_button':
                this._toolbar.reboot();
                break;
        }
    };
}
