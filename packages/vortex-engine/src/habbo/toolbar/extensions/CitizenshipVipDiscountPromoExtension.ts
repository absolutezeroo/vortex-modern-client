import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {Logger} from '@core/utils/Logger';
import {
    EventLogMessageComposer
} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {
    GetHabboClubExtendOfferMessageComposer
} from '@habbo/communication/messages/outgoing/catalog/GetHabboClubExtendOfferMessageComposer';

import type {HabboToolbar} from '../HabboToolbar';
import type {IExtensionView} from '../IExtensionView';

const log = Logger.getLogger('habbo.toolbar.extensions.CitizenshipVipDiscountPromoExtension');

/**
 * The "your VIP is about to run out — extend it at a discount" bar above the toolbar.
 *
 * It exists only for a **club level 2** player whose citizenship VIP is expiring, and only while the
 * server has `club.membership.extend.vip.promotion.enabled`. Clicking through logs the click and asks
 * for the offer (2931); the catalog answers.
 *
 * **Collapsing does not rebuild anything** — the two regions in the layout toggle the content list
 * and the artwork, and the window drops to a 33px header strip. The expanded height is whatever the
 * layout was authored at, read once when it is built.
 *
 * A timer closes the bar when the offer expires, but only when expiry is inside a day: AS3 refuses
 * to arm a `Timer` for longer than that, and a bar for an offer expiring next week would outlive
 * several room visits anyway.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/extensions/CitizenshipVipDiscountPromoExtension.as
 */
export class CitizenshipVipDiscountPromoExtension
{
    /**
	 * Height of the bar once collapsed, and the cut-off past which the expiry timer is not armed
	 * (one day, in minutes). AS3 inlines both.
	 */
    // AS3: CitizenshipVipDiscountPromoExtension.as::assignState() — inline literal (name derived)
    private static readonly COLLAPSED_HEIGHT: number = 33;

    // AS3: CitizenshipVipDiscountPromoExtension.as::onClubChanged() — inline literal (name derived)
    private static readonly MAX_TIMER_MINUTES: number = 1440;

    /**
	 * The club level the discount exists for. AS3 inlines 2 at both of its tests.
	 */
    // AS3: CitizenshipVipDiscountPromoExtension.as::isExtensionEnabled() — inline literal (name derived)
    private static readonly CLUB_LEVEL_VIP: number = 2;

    // AS3: CitizenshipVipDiscountPromoExtension.as::_toolbar
    private _toolbar: HabboToolbar | null;

    // AS3: CitizenshipVipDiscountPromoExtension.as::_SafeStr_4550 (name derived: the promo window)
    private _window: IWindowContainer | null = null;

    // AS3: CitizenshipVipDiscountPromoExtension.as::_expanded
    private _expanded: boolean = true;

    // AS3: CitizenshipVipDiscountPromoExtension.as::_SafeStr_9118 (name derived: the expanded height)
    private _expandedHeight: number = 216;

    // AS3: CitizenshipVipDiscountPromoExtension.as::_SafeStr_5756 (name derived: the expiry timer)
    private _expirationTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: CitizenshipVipDiscountPromoExtension.as::CitizenshipVipDiscountPromoExtension()
    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;
    }

    /**
	 * AS3 returns the window rather than assigning it, and returns null when the layout is missing —
	 * which is what leaves `onClubChanged` attaching nothing.
	 */
    // AS3: CitizenshipVipDiscountPromoExtension.as::createWindow()
    private createWindow(): IWindowContainer | null
    {
        const asset = (this._toolbar?.assets?.getAssetByName('vip_discount_promotion_v2_xml') as XmlAsset | null) ?? null;

        if(asset == null)
        {
            log.warn('Missing layout "vip_discount_promotion_v2_xml" — the VIP discount promo is not built');

            return null;
        }

        const window = (this._toolbar?.windowManager?.buildFromXML(
            asset.content as unknown as string, 1
        ) as IWindowContainer | null) ?? null;

        if(window == null) return null;

        window.findChildByName('extend_button')?.addEventListener('WME_CLICK', this.onButtonClicked);
        window.findChildByName('minimize_region')?.addEventListener('WME_CLICK', this.onMinMax);
        window.findChildByName('maximize_region')?.addEventListener('WME_CLICK', this.onMinMax);

        this._expandedHeight = (window as unknown as IWindow).height;

        return window;
    }

    // AS3: CitizenshipVipDiscountPromoExtension.as::destroyWindow()
    private destroyWindow(): void
    {
        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
        }

        this.destroyExpirationTimer();
    }

    // AS3: CitizenshipVipDiscountPromoExtension.as::get extensionView()
    private get extensionView(): IExtensionView | null
    {
        return this._toolbar?.extensionView ?? null;
    }

    // AS3: CitizenshipVipDiscountPromoExtension.as::dispose()
    dispose(): void
    {
        if(this._toolbar == null) return;

        this.extensionView?.detachExtension('club_promo');
        this.destroyWindow();
        this._toolbar = null;
    }

    /**
	 * The level is re-tested at click time, not just at build time — the bar can outlive the state
	 * that raised it.
	 */
    // AS3: CitizenshipVipDiscountPromoExtension.as::onButtonClicked()
    private onButtonClicked = (): void =>
    {
        if((this._toolbar?.inventory?.clubLevel ?? 0) !== CitizenshipVipDiscountPromoExtension.CLUB_LEVEL_VIP) return;

        this._toolbar?.connection?.send(
            new EventLogMessageComposer('DiscountPromo', 'citizenshipdiscount', 'client.club.extend.discount.clicked')
        );
        this._toolbar?.connection?.send(new GetHabboClubExtendOfferMessageComposer());
    };

    // AS3: CitizenshipVipDiscountPromoExtension.as::assignState()
    private assignState(): void
    {
        if(this._window == null) return;

        const contentList = this._window.findChildByName('content_itemlist');
        const promoImage = this._window.findChildByName('promo_img');

        if(contentList) contentList.visible = this._expanded;
        if(promoImage) promoImage.visible = this._expanded;

        (this._window as unknown as IWindow).height = this._expanded
            ? this._expandedHeight
            : CitizenshipVipDiscountPromoExtension.COLLAPSED_HEIGHT;
    }

    /**
	 * **The `else` branch detaches `vip_quests`, not `club_promo`** — and the `if` branch declines to
	 * attach while `vip_quests` is up. The two promos share the slot, and this is AS3's way of
	 * letting the quests bar win it. Transcribed as written, mismatched ids included; `dispose()` is
	 * the only place that detaches this extension by its own id.
	 *
	 * The port takes the two values as arguments where AS3 reads them off `_toolbar.inventory`,
	 * because this port keeps them on the purse — the caller in `HabboToolbar.onClubChanged()` does
	 * the lookup.
	 */
    // AS3: CitizenshipVipDiscountPromoExtension.as::onClubChanged()
    onClubChanged(citizenshipVipIsExpiring: boolean, clubMinutesUntilExpiration: number): void
    {
        if(this._toolbar == null) return;

        if(citizenshipVipIsExpiring && this._window == null && this.isExtensionEnabled())
        {
            this._window = this.createWindow();

            if(this._expirationTimer !== null)
            {
                this.destroyExpirationTimer();
            }

            if(clubMinutesUntilExpiration < CitizenshipVipDiscountPromoExtension.MAX_TIMER_MINUTES
                && clubMinutesUntilExpiration > 0)
            {
                this._expirationTimer = setTimeout(
                    () => this.onExtendOfferExpire(),
                    clubMinutesUntilExpiration * 60 * 1000
                );
            }

            this.assignState();

            if(this._window !== null && !(this.extensionView?.hasExtension('vip_quests') ?? false))
            {
                this.extensionView?.attachExtension('club_promo', this._window, 10);
            }
        }
        else
        {
            this.extensionView?.detachExtension('vip_quests');
            this.destroyWindow();
        }
    }

    // AS3: CitizenshipVipDiscountPromoExtension.as::destroyExpirationTimer()
    private destroyExpirationTimer(): void
    {
        if(this._expirationTimer !== null)
        {
            clearTimeout(this._expirationTimer);
            this._expirationTimer = null;
        }
    }

    // AS3: CitizenshipVipDiscountPromoExtension.as::onExtendOfferExpire()
    private onExtendOfferExpire(): void
    {
        this.extensionView?.detachExtension('club_promo');
        this.destroyWindow();
    }

    /**
	 * Both halves matter: the port used to test only the config flag, which would have shown the bar
	 * to a player with no VIP at all had it built a window to show.
	 */
    // AS3: CitizenshipVipDiscountPromoExtension.as::isExtensionEnabled()
    private isExtensionEnabled(): boolean
    {
        if(this._toolbar == null) return false;

        return this._toolbar.inventory?.clubLevel === CitizenshipVipDiscountPromoExtension.CLUB_LEVEL_VIP
            && this._toolbar.getBoolean('club.membership.extend.vip.promotion.enabled');
    }

    // AS3: CitizenshipVipDiscountPromoExtension.as::onMinMax()
    private onMinMax = (): void =>
    {
        this._expanded = !this._expanded;
        this.assignState();
    };

    // AS3: CitizenshipVipDiscountPromoExtension.as::_expanded (read by the toolbar's layout pass)
    get expanded(): boolean
    {
        return this._expanded;
    }

    // TS-only: no AS3 counterpart; `_toolbar == null` is how AS3's dispose() marks itself done.
    get disposed(): boolean
    {
        return this._toolbar == null;
    }
}
