import type {HabboToolbar} from '../../HabboToolbar';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {CurrencyIndicatorBase} from './CurrencyIndicatorBase';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('PurseClubArea');

/**
 * Club membership area display in the purse extension
 *
 * In AS3 this extends CurrencyIndicatorBase to show club days remaining,
 * club icon (HC/VIP), and handles club status changes with animation.
 * In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/purse/PurseClubArea.as
 */
export class PurseClubArea extends CurrencyIndicatorBase
{
    private static readonly BG_COLOR_LIGHT: number = 0xFF70806D;
    private static readonly BG_COLOR_DARK: number = 0xFF4D5F4E;
    private static readonly ICON_STYLE_CLUB: number = 13;
    private static readonly ICON_STYLE_VIP: number = 14;
    private static readonly ICON_ANIMATION: string[] = [
        'toolbar_hc_icon_0',
        'toolbar_hc_icon_1',
        'toolbar_hc_icon_2',
        'toolbar_hc_icon_1',
        'toolbar_hc_icon_0',
    ];

    private _previousDays: number = -1;
    private _toolbar: HabboToolbar | null;
    private _previousMinutes: number = 0;
    private _clubLevel: number = 0;
    private _clubIconStyle: number = PurseClubArea.ICON_STYLE_VIP;

    constructor(toolbar: HabboToolbar, window: IWindowContainer)
    {
        super(toolbar.windowManager);

        this._toolbar = toolbar;
        this._window = window;
        this.bgColorLight = PurseClubArea.BG_COLOR_LIGHT;
        this.bgColorDark = PurseClubArea.BG_COLOR_DARK;
        this.textElementName = 'days';
        this.iconAnimationSequence = PurseClubArea.ICON_ANIMATION;
        this.iconAnimationDelay = 50;
        this.amountZeroText = toolbar.localization?.getLocalization('purse.clubdays.zero.amount.text', 'Get') ?? 'Get';

        this.onClubChanged();

        log.debug('PurseClubArea constructed');
    }

    get clubLevel(): number { return this._clubLevel; }
    get clubIconStyle(): number { return this._clubIconStyle; }

    public onClubChanged(): void
    {
        if(!this._toolbar?.inventory) return;

        const purse = this._toolbar.inventory.purse;
        const totalDays = purse.clubPeriods * 31 + purse.clubDays;
        const minutes = purse.minutesUntilExpiration;
        const clubLevel = this._toolbar.sessionDataManager?.clubLevel ?? (purse.isVIP ? 2 : (purse.hasClub ? 1 : 0));

        this._clubLevel = clubLevel;

        if(this._previousDays !== -1 && clubLevel !== 0)
        {
            this.setAmount(totalDays, minutes);
        }
        else if(clubLevel === 0)
        {
            this.setAmount(0, minutes);
        }

        this._previousDays = totalDays;
        this._previousMinutes = minutes;

        switch(clubLevel)
        {
            case 0:
                this.setClubIcon(PurseClubArea.ICON_STYLE_VIP);
                this.setText(this.amountZeroText ?? 'Get');
                break;
            case 1:
                this.setClubIcon(PurseClubArea.ICON_STYLE_CLUB);
                break;
            case 2:
                this.setClubIcon(PurseClubArea.ICON_STYLE_VIP);
                break;
        }
    }

    protected override setAmount(amount: number, minutes: number = -1): void
    {
        const daysWindow = this._window?.findChildByName('days');
        const joinWindow = this._window?.findChildByName('join');

        if(amount < 1)
        {
            if(daysWindow) daysWindow.visible = false;
            if(joinWindow) joinWindow.visible = true;

            this.textElementName = 'join';
            this.setText(this.amountZeroText ?? 'Get');

            return;
        }

        if(daysWindow) daysWindow.visible = true;
        if(joinWindow) joinWindow.visible = false;

        this.textElementName = 'days';

        if(minutes !== -1 && minutes < 1440)
        {
            this.setText(this.getShortFriendlyTime(minutes * 60));
        }
        else
        {
            this.setText(this.getShortFriendlyTime(amount * 86400));
        }
    }

    private setClubIcon(style: number): void
    {
        this._clubIconStyle = style;

        const icon = this._window?.findChildByName('club_icon') as unknown as { style?: number; invalidate?: () => void } | null;

        if(icon)
        {
            icon.style = style;
            icon.invalidate?.();
        }
    }

    private getShortFriendlyTime(seconds: number): string
    {
        const days = Math.floor(seconds / 86400);

        if(days > 0) return `${days} d.`;

        const hours = Math.floor(seconds / 3600);

        if(hours > 0) return `${hours} h`;

        const minutes = Math.max(1, Math.floor(seconds / 60));

        return `${minutes} min`;
    }

    public override dispose(): void
    {
        this._toolbar = null;
        super.dispose();
    }
}
