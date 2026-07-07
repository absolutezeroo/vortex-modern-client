import type {HabboToolbar} from '../../../HabboToolbar';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {ActivityPointTypeEnum} from '@habbo/catalog/purse/ActivityPointTypeEnum';
import {PurseEvent} from '@habbo/catalog/purse/PurseEvent';
import {ToolbarDisplayExtensionIds} from '../../../ToolbarDisplayExtensionIds';
import {CurrencyIndicatorBase} from '../CurrencyIndicatorBase';
import {formatPurseAmount} from '../PurseAmountFormatter';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('SeasonalCurrencyIndicator');

/**
 * Seasonal currency indicator (diamonds, duckets, etc.)
 *
 * In AS3 this extends CurrencyIndicatorBase to display seasonal currency
 * balance, listens for activity point balance events, and opens the catalog
 * page on click. Handles custom colors from configuration.
 * In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/purse/indicators/SeasonalCurrencyIndicator.as
 */
export class SeasonalCurrencyIndicator extends CurrencyIndicatorBase 
{
    private static readonly BG_COLOR_LIGHT: number = 0xFF70806D;
    private static readonly BG_COLOR_DARK: number = 0xFF4D5F4E;

    private _toolbar: HabboToolbar | null;
    private _catalog: IHabboCatalog | null;
    private _localization: IHabboLocalizationManager | null;
    private _previousBalance: number = -1;

    constructor(toolbar: HabboToolbar, windowManager: IHabboWindowManager, catalog: IHabboCatalog, localization: IHabboLocalizationManager | null) 
    {
        super(windowManager);

        this._toolbar = toolbar;
        this._catalog = catalog;
        this._localization = localization;
        this.bgColorLight = SeasonalCurrencyIndicator.BG_COLOR_LIGHT;
        this.bgColorDark = SeasonalCurrencyIndicator.BG_COLOR_DARK;
        this.textElementName = 'amount';
        this.amountZeroText = localization?.getLocalization('purse.snowflakes.zero.amount.text', 'Info') ?? 'Info';

        this.createWindow('purse_indicator_seasonal_xml', null);
        this.setAmount(0);
        this.initializeCurrencyLayouts();
        toolbar.extensionView?.attachExtension(ToolbarDisplayExtensionIds.SEASONAL_CURRENCY, this.window, 5);
        this.registerUpdateEvents(catalog.events);
    }

    private _balance: number = 0;

    get balance(): number 
    {
        return this._balance;
    }

    get displayedActivityPointType(): number 
    {
        if(!this._toolbar) return 1;

        return this._toolbar.getInteger('seasonalcurrencyindicator.currency', 1);
    }

    get currencyBackgroundColor(): number 
    {
        if(!this._toolbar) return 0;

        return this.hexToNumber(this._toolbar.getProperty(`seasonalcurrency.preset.${this.currencyColor}.border`));
    }

    get currencyTextColor(): number 
    {
        if(!this._toolbar) return 0;

        return this.hexToNumber(this._toolbar.getProperty(`seasonalcurrency.preset.${this.currencyColor}.font`));
    }

    private get seasonalCurrencyId(): string 
    {
        if(!this._toolbar) return '';

        return this._toolbar.getProperty(`seasonalcurrency.id.${this.displayedActivityPointType}`);
    }

    private get catalogPageName(): string 
    {
        if(!this._toolbar) return '';

        return this._toolbar.getProperty('seasonalcurrencyindicator.page');
    }

    private get currencyColor(): string 
    {
        if(!this._toolbar) return '';

        return this._toolbar.getProperty(`seasonalcurrency.${this.seasonalCurrencyId}.color`);
    }

    public onBalance = (event: PurseEvent): void => 
    {
        if(event.activityPointType !== this.displayedActivityPointType) return;

        this._balance = event.balance;
        this.setAmount(event.balance);

        if(this._previousBalance !== -1) 
        {
            this.animateChange(this._previousBalance, event.balance);
        }

        this._previousBalance = event.balance;
    };

    public override registerUpdateEvents(dispatcher: unknown): void 
    {
        (dispatcher as { on?: (type: string, listener: (event: PurseEvent) => void) => void }).on?.(
            PurseEvent.ACTIVITY_POINT_BALANCE,
            this.onBalance
        );
    }

    public override unregisterUpdateEvents(dispatcher: unknown): void 
    {
        (dispatcher as { off?: (type: string, listener: (event: PurseEvent) => void) => void }).off?.(
            PurseEvent.ACTIVITY_POINT_BALANCE,
            this.onBalance
        );
    }

    public override dispose(): void 
    {
        if(this._catalog) 
        {
            this.unregisterUpdateEvents(this._catalog.events);
        }

        this._toolbar = null;
        this._catalog = null;
        this._localization = null;
        super.dispose();
    }

    protected override onContainerClick(_event: WindowMouseEvent): void 
    {
        this._catalog?.openCatalogPage(this.catalogPageName);
    }

    protected override setAmount(amount: number, _minutes: number = -1): void 
    {
        this._balance = amount;

        if(amount === 0) 
        {
            this.setTextUnderline(true);
            this.setText(this.amountZeroText ?? 'Info');

            return;
        }

        this.setTextUnderline(false);
        this.setText(formatPurseAmount(amount, this._localization));
    }

    private initializeCurrencyLayouts(): void 
    {
        if(!this.window) return;

        const name = this.window.findChildByName('seasonal_name');

        if(name) 
        {
            name.caption = this.getActivityPointName(this.displayedActivityPointType);
            name.color = this.currencyTextColor;
        }

        const bg = this.window.findChildByName('seasonal_bg');

        if(bg) 
        {
            bg.color = this.currencyBackgroundColor;
        }

        const overlay = this.window.findChildByName('change_overlay');

        if(overlay) 
        {
            overlay.color = this.currencyBackgroundColor;
        }

        const icon = this.window.findChildByName('seasonal_icon') as unknown as {
            style?: number;
            fitToSize?: () => void
        } | null;

        if(icon && this._toolbar?.configuration) 
        {
            icon.style = ActivityPointTypeEnum.getIconStyleFor(this.displayedActivityPointType, this._toolbar.configuration, true);
            icon.fitToSize?.();
        }
    }

    private getActivityPointName(type: number): string 
    {
        return this._localization?.getLocalization(`achievements.activitypoint.${type}`, `Currency ${type}`) ?? `Currency ${type}`;
    }

    private hexToNumber(value: string): number 
    {
        const normalized = value.replace('#', '').replace('0x', '');
        const parsed = parseInt(normalized, 16);

        return Number.isNaN(parsed) ? 0 : parsed;
    }
}
