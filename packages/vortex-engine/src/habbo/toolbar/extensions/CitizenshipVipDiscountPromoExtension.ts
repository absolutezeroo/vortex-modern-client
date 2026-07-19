import type {HabboToolbar} from '../HabboToolbar';
import type {IExtensionView} from '../IExtensionView';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CitizenshipVipDiscountPromoExtension');

/**
 * VIP discount promotion extension for the toolbar
 *
 * In AS3 this creates a promotion window for VIP club extend discounts,
 * handles expand/collapse toggling, and manages an expiration timer.
 * In Vortex, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/CitizenshipVipDiscountPromoExtension.as
 */
export class CitizenshipVipDiscountPromoExtension
{
    private _toolbar: HabboToolbar | null;
    private _expandedHeight: number = 216;
    private _expirationTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        log.debug('CitizenshipVipDiscountPromoExtension constructed');
    }

    private _expanded: boolean = true;

    /**
	 * Whether the promo is expanded
	 */
    get expanded(): boolean
    {
        return this._expanded;
    }

    private _windowCreated: boolean = false;

    /**
	 * Whether the promo window has been created
	 */
    get windowCreated(): boolean
    {
        return this._windowCreated;
    }

    /**
	 * Whether the extension is disposed
	 */
    get disposed(): boolean
    {
        return this._toolbar == null;
    }

    /**
	 * Get the extension view from the toolbar
	 */
    private get extensionView(): IExtensionView | null
    {
        return this._toolbar?.extensionView ?? null;
    }

    /**
	 * Handle club membership change
	 *
	 * Shows or hides the VIP discount promo based on club expiration status.
	 */
    public onClubChanged(citizenshipVipIsExpiring: boolean, clubMinutesUntilExpiration: number): void
    {
        if(!this._toolbar) return;

        if(citizenshipVipIsExpiring && !this._windowCreated && this.isExtensionEnabled())
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

            this.assignState();

            if(this.extensionView && !this.extensionView.hasExtension('vip_quests'))
            {
                // In AS3: extensionView.attachExtension("club_promo", window, 10)
                log.debug('VIP discount promo: attached to extension view');
            }
        }
        else
        {
            if(this.extensionView)
            {
                this.extensionView.detachExtension('vip_quests');
            }

            this.destroyWindow();
        }
    }

    /**
	 * Toggle expand/collapse state
	 */
    public toggleMinMax(): void
    {
        this._expanded = !this._expanded;
        this.assignState();
    }

    /**
	 * Dispose of this extension
	 */
    public dispose(): void
    {
        if(this._toolbar == null) return;

        if(this.extensionView)
        {
            this.extensionView.detachExtension('club_promo');
        }

        this.destroyWindow();
        this._toolbar = null;
    }

    private assignState(): void
    {
        // State is tracked; UI layer reads expanded + windowCreated
        log.debug(`VIP discount promo: expanded=${this._expanded}`);
    }

    private isExtensionEnabled(): boolean
    {
        if(!this._toolbar) return false;

        return this._toolbar.getBoolean('club.membership.extend.vip.promotion.enabled');
    }

    private destroyWindow(): void
    {
        this._windowCreated = false;
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
        if(this.extensionView)
        {
            this.extensionView.detachExtension('club_promo');
        }

        this.destroyWindow();
    }
}
