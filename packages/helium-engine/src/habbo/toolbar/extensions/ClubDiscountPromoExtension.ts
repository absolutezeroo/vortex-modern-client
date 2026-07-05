import type {HabboToolbar} from '../HabboToolbar';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ClubDiscountPromoExtension');

/**
 * Club discount promotion extension for the toolbar
 *
 * In AS3 this creates a promotion window for club extend discounts with
 * text, animation effects, and club icon display. Manages an expiration timer
 * and a flashing animation timer. In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/ClubDiscountPromoExtension.as
 */
export class ClubDiscountPromoExtension
{
    private static readonly EXTENSION_ID: string = 'club_promo';
    private static readonly ICON_STYLE_VIP: number = 14;
    private static readonly LINK_COLOR_NORMAL: number = 0xFFFFFF;
    private static readonly LINK_COLOR_HIGHLIGHT: number = 0xBACB09;

    private _toolbar: HabboToolbar | null;
    private _animating: boolean = false;
    private _expirationTimer: ReturnType<typeof setTimeout> | null = null;
    private _animationTimer: ReturnType<typeof setInterval> | null = null;

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        log.debug('ClubDiscountPromoExtension constructed');
    }

    private _disposed: boolean = false;

    /**
	 * Whether the extension is disposed
	 */
    get disposed(): boolean
    {
        return this._disposed;
    }

    private _windowCreated: boolean = false;

    /**
	 * Whether the promo window has been created
	 */
    get windowCreated(): boolean
    {
        return this._windowCreated;
    }

    private _promoText: string = '';

    /**
	 * The current promo text
	 */
    get promoText(): string
    {
        return this._promoText;
    }

    private _clubIconStyle: number = 0;

    /**
	 * The current club icon style
	 */
    get clubIconStyle(): number
    {
        return this._clubIconStyle;
    }

    /**
	 * Handle club membership change
	 *
	 * Shows or hides the club discount promo based on club expiration status.
	 *
	 * @param clubIsExpiring Whether the club membership is expiring
	 * @param clubMinutesUntilExpiration Minutes until club expiration
	 * @param clubLevel The current club level (0=none, 1=HC, 2=VIP)
	 */
    public onClubChanged(clubIsExpiring: boolean, clubMinutesUntilExpiration: number, clubLevel: number): void
    {
        if(!this._toolbar) return;

        if(clubIsExpiring && !this._windowCreated && this.isExtensionEnabled(clubLevel))
        {
            this._windowCreated = true;

            this.destroyExpirationTimer();

            if(clubMinutesUntilExpiration < 1440 && clubMinutesUntilExpiration > 0)
            {
                this._expirationTimer = setTimeout(
                    () => this.onExtendOfferExpire(),
                    clubMinutesUntilExpiration * 60 * 1000
                );
            }

            this.assignState(clubLevel);
            this.animate(true);

            log.debug('Club discount promo: attached');
        }
        else
        {
            if(this._toolbar.extensionView)
            {
                this._toolbar.extensionView.detachExtension('club_promo');
            }

            this.destroyWindow();
        }
    }

    /**
	 * Dispose of this extension
	 */
    public dispose(): void
    {
        if(this._disposed || !this._toolbar) return;

        if(this._toolbar.extensionView)
        {
            this._toolbar.extensionView.detachExtension('club_promo');
        }

        this.clearAnimation();
        this.destroyWindow();
        this._toolbar = null;
        this._disposed = true;
    }

    private assignState(clubLevel: number): void
    {
        switch(clubLevel)
        {
            case 0:
                this._promoText = '${discount.bar.no.club.promo}';
                this._clubIconStyle = ClubDiscountPromoExtension.ICON_STYLE_VIP;
                break;
            case 2:
                this._promoText = '${discount.bar.vip.expiring}';
                this._clubIconStyle = ClubDiscountPromoExtension.ICON_STYLE_VIP;
                break;
        }
    }

    private isExtensionEnabled(clubLevel: number): boolean
    {
        if(!this._toolbar) return false;

        return clubLevel === 2 && this._toolbar.getBoolean('club.membership.extend.vip.promotion.enabled');
    }

    private animate(start: boolean): void
    {
        if(start)
        {
            this.clearAnimation();

            this._animating = true;
            this._animationTimer = setInterval(() => this.onTriggerTimer(), 15000);
        }
        else
        {
            this._animating = false;
            this.clearAnimation();
        }
    }

    private clearAnimation(): void
    {
        if(this._animationTimer !== null)
        {
            clearInterval(this._animationTimer);
            this._animationTimer = null;
        }
    }

    private onTriggerTimer(): void
    {
        // In AS3, this triggers a flash animation across the promo bar
        // In Helium, the UI layer handles any animation via CSS
        log.debug('Club discount promo: animation trigger');
    }

    private destroyWindow(): void
    {
        this._windowCreated = false;
        this.animate(false);
        this.destroyExpirationTimer();
    }

    private destroyExpirationTimer(): void
    {
        if(this._expirationTimer !== null)
        {
            clearTimeout(this._expirationTimer);
            this._expirationTimer = null;
        }
    }

    private onExtendOfferExpire(): void
    {
        if(this._toolbar?.extensionView)
        {
            this._toolbar.extensionView.detachExtension('club_promo');
        }

        this.destroyWindow();
    }
}
