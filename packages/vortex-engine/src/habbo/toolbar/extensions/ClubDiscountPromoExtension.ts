import type {XmlAsset} from '@core/assets/XmlAsset';
import {AssetBitmap} from '@core/assets/AssetBitmap';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {Logger} from '@core/utils/Logger';
import {
    EventLogMessageComposer
} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {
    GetHabboClubExtendOfferMessageComposer
} from '@habbo/communication/messages/outgoing/catalog/GetHabboClubExtendOfferMessageComposer';

import type {HabboToolbar} from '../HabboToolbar';

const log = Logger.getLogger('habbo.toolbar.extensions.ClubDiscountPromoExtension');

/**
 * The "your club is about to run out" bar above the toolbar, with the sliding highlight.
 *
 * Same shape as its citizenship sibling — build a window, arm an expiry timer, attach to the
 * extension slot — with one addition: **a highlight strip sweeps across the bar every 15 seconds**.
 * That sweep is 26 ticks of 25ms, and past the two-thirds mark the strip is *cropped* rather than
 * moved, so it appears to slide off the right edge instead of overhanging it.
 *
 * The crop is why the source bitmap is kept: AS3 clones it on every reset and rebuilds a narrower
 * copy per tick. This port does the same with an `OffscreenCanvas`, which is the established
 * synchronous stand-in for `BitmapData.copyPixels()` (see `core/utils/BitmapSlot`) — the async
 * `createImageBitmap()` cannot be used on a 25ms tick.
 *
 * **`assignState()` has no default branch**: club levels 1 and 3+ leave the text and icon exactly as
 * the layout authored them. Transcribed as written.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/extensions/ClubDiscountPromoExtension.as
 */
export class ClubDiscountPromoExtension
{
    // AS3: ClubDiscountPromoExtension.as::_SafeStr_10818 (name derived from its value)
    private static readonly EXTENSION_ID: string = 'club_promo';

    // AS3: ClubDiscountPromoExtension.as::ICON_STYLE_VIP
    private static readonly ICON_STYLE_VIP: number = 14;

    // AS3: ClubDiscountPromoExtension.as::LINK_COLOR_NORMAL
    private static readonly LINK_COLOR_NORMAL: number = 0xFFFFFF;

    // AS3: ClubDiscountPromoExtension.as::LINK_COLOR_HIGHLIGHT
    private static readonly LINK_COLOR_HIGHLIGHT: number = 0xBACB09;

    /**
	 * The sweep, in AS3's inline numbers: one every 15s, 26 ticks of 25ms, and the position divided
	 * across 20 steps — so the strip reaches the end at tick 20 and the last six crop it away.
	 */
    // AS3: ClubDiscountPromoExtension.as::animate() — inline literal (name derived)
    private static readonly ANIMATION_INTERVAL_MS: number = 15000;

    // AS3: ClubDiscountPromoExtension.as::startAnimationTimer() — inline literal (name derived)
    private static readonly ANIMATION_TICK_MS: number = 25;

    // AS3: ClubDiscountPromoExtension.as::startAnimationTimer() — inline literal (name derived)
    private static readonly ANIMATION_TICK_COUNT: number = 26;

    // AS3: ClubDiscountPromoExtension.as::onAnimationTimer() — inline literal (name derived)
    private static readonly ANIMATION_STEPS: number = 20;

    // AS3: ClubDiscountPromoExtension.as::resetAnimationVariables() — inline literals (names derived)
    private static readonly ANIMATION_MARGIN: number = 3;

    /**
	 * The club level the discount exists for. AS3 inlines 2 at both of its tests.
	 */
    // AS3: ClubDiscountPromoExtension.as::isExtensionEnabled() — inline literal (name derived)
    private static readonly CLUB_LEVEL_VIP: number = 2;

    // AS3: ClubDiscountPromoExtension.as::_toolbar
    private _toolbar: HabboToolbar | null;

    // AS3: ClubDiscountPromoExtension.as::_SafeStr_4550 (name derived: the promo window)
    private _window: IWindowContainer | null = null;

    // AS3: ClubDiscountPromoExtension.as::_disposed
    private _disposed: boolean = false;

    // AS3: ClubDiscountPromoExtension.as::_SafeStr_4657 (name derived: the sliding highlight)
    private _highlight: IBitmapWrapperWindow | null = null;

    // AS3: ClubDiscountPromoExtension.as::_SafeStr_5592 (name derived: the per-tick sweep timer)
    private _sweepTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: ClubDiscountPromoExtension.as::_SafeStr_7214 (name derived: the current sweep tick)
    private _sweepTick: number = 0;

    // AS3: ClubDiscountPromoExtension.as::_animBlockMoveAmount
    private _animBlockMoveAmount: number = 0;

    // AS3: ClubDiscountPromoExtension.as::_SafeStr_5872 (name derived: the every-15s trigger)
    private _triggerTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: ClubDiscountPromoExtension.as::_SafeStr_6464 (name derived: the highlight's source pixels)
    private _highlightSource: ImageBitmap | null = null;

    // AS3: ClubDiscountPromoExtension.as::_SafeStr_5756 (name derived: the expiry timer)
    private _expirationTimer: ReturnType<typeof setTimeout> | null = null;

    /**
	 * One day, in minutes — past this the expiry timer is not armed.
	 */
    // AS3: ClubDiscountPromoExtension.as::onClubChanged() — inline literal (name derived)
    private static readonly MAX_TIMER_MINUTES: number = 1440;

    // AS3: ClubDiscountPromoExtension.as::ClubDiscountPromoExtension()
    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;
    }

    // AS3: ClubDiscountPromoExtension.as::createWindow()
    private createWindow(): IWindowContainer | null
    {
        const asset = (this._toolbar?.assets?.getAssetByName('club_discount_promotion_xml') as XmlAsset | null) ?? null;

        if(asset == null)
        {
            log.warn('Missing layout "club_discount_promotion_xml" — the club discount promo is not built');

            return null;
        }

        const window = (this._toolbar?.windowManager?.buildFromXML(
            asset.content as unknown as string, 1
        ) as IWindowContainer | null) ?? null;

        if(window == null) return null;

        // Assigned before `assignState()` runs, because that ends by arming the sweep.
        this._window = window;
        this._highlight = (window.findChildByName('flashing_animation') as IBitmapWrapperWindow | null) ?? null;

        if(this._highlight !== null)
        {
            // `content` is a Pixi Texture here, not an ImageBitmap — casting it straight through is
            // the mistake AssetBitmap exists to prevent, and it throws inside the render pass.
            const highlightAsset = this._toolbar?.assets?.getAssetByName('extend_hilite') ?? null;

            this._highlightSource = highlightAsset === null
                ? null
                : AssetBitmap.resolveSync(highlightAsset.content);

            if(this._highlightSource !== null)
            {
                this._highlight.bitmap = this.cloneHighlight(this._highlightSource.width);
            }

            (this._highlight as unknown as IWindow).visible = false;
        }

        const textRegion = (window.findChildByName('text_region') as IRegionWindow | null) ?? null;

        if(textRegion !== null)
        {
            const region = textRegion as unknown as IWindow;

            region.addEventListener('WME_CLICK', this.onTextRegionClicked);
            region.addEventListener('WME_OVER', this.onTextRegionMouseOver);
            region.addEventListener('WME_OUT', this.onTextRegionMouseOut);
        }

        this.assignState();

        return window;
    }

    /**
	 * TS-only: AS3 writes `_SafeStr_6464.clone()` and `copyPixels(...)`. Both are one operation here
	 * — draw the leftmost `width` pixels of the source into a fresh canvas — and both must be
	 * synchronous, so `createImageBitmap()` is out.
	 */
    // TS-only: no AS3 counterpart; Flash's BitmapData does clone/copyPixels natively.
    private cloneHighlight(width: number): ImageBitmap | null
    {
        const source = this._highlightSource;

        if(source === null) return null;

        const cropWidth = Math.max(1, Math.floor(width));
        const canvas = new OffscreenCanvas(cropWidth, source.height);
        const context = canvas.getContext('2d');

        if(context === null) return null;

        context.drawImage(source, 0, 0);

        return canvas.transferToImageBitmap();
    }

    // AS3: ClubDiscountPromoExtension.as::destroyWindow()
    private destroyWindow(): void
    {
        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
            this._highlight = null;
        }

        this.animate(false);
        this.destroyExpirationTimer();
    }

    // AS3: ClubDiscountPromoExtension.as::dispose()
    dispose(): void
    {
        if(this._disposed || this._toolbar == null) return;

        this._toolbar.extensionView?.detachExtension(ClubDiscountPromoExtension.EXTENSION_ID);
        this.clearAnimation();
        this.destroyWindow();
        this._toolbar = null;
        this._disposed = true;
    }

    // AS3: ClubDiscountPromoExtension.as::onTextRegionClicked()
    private onTextRegionClicked = (): void =>
    {
        if((this._toolbar?.inventory?.clubLevel ?? 0) !== ClubDiscountPromoExtension.CLUB_LEVEL_VIP) return;

        this._toolbar?.connection?.send(
            new EventLogMessageComposer('DiscountPromo', 'discount', 'client.club.extend.discount.clicked')
        );
        this._toolbar?.connection?.send(new GetHabboClubExtendOfferMessageComposer());
    };

    // AS3: ClubDiscountPromoExtension.as::assignState()
    private assignState(): void
    {
        switch(this._toolbar?.inventory?.clubLevel ?? -1)
        {
            case 0:
                this.setText('${discount.bar.no.club.promo}');
                this.setClubIcon(ClubDiscountPromoExtension.ICON_STYLE_VIP);
                break;
            case ClubDiscountPromoExtension.CLUB_LEVEL_VIP:
                this.setText('${discount.bar.vip.expiring}');
                this.setClubIcon(ClubDiscountPromoExtension.ICON_STYLE_VIP);
                break;
        }

        this.animate(true);
    }

    /**
	 * Unlike its citizenship sibling, this one detaches by its **own** id in the `else` branch and
	 * attaches unconditionally — no sharing of the slot with the quests bar.
	 *
	 * The port takes the three values as arguments where AS3 reads them off `_toolbar.inventory`,
	 * because this port keeps two of them on the purse; `HabboToolbar.onClubChanged()` looks them up.
	 */
    // AS3: ClubDiscountPromoExtension.as::onClubChanged()
    onClubChanged(clubIsExpiring: boolean, clubMinutesUntilExpiration: number, _clubLevel: number): void
    {
        if(this._toolbar == null) return;

        if(clubIsExpiring && this._window == null && this.isExtensionEnabled())
        {
            const window = this.createWindow();

            if(this._expirationTimer !== null)
            {
                this.destroyExpirationTimer();
            }

            if(clubMinutesUntilExpiration < ClubDiscountPromoExtension.MAX_TIMER_MINUTES
                && clubMinutesUntilExpiration > 0)
            {
                this._expirationTimer = setTimeout(
                    () => this.onExtendOfferExpire(),
                    clubMinutesUntilExpiration * 60 * 1000
                );
            }

            this.assignState();

            if(window !== null)
            {
                this._toolbar.extensionView?.attachExtension(ClubDiscountPromoExtension.EXTENSION_ID, window, 10);
            }
        }
        else
        {
            this._toolbar.extensionView?.detachExtension(ClubDiscountPromoExtension.EXTENSION_ID);
            this.destroyWindow();
        }
    }

    // AS3: ClubDiscountPromoExtension.as::destroyExpirationTimer()
    private destroyExpirationTimer(): void
    {
        if(this._expirationTimer !== null)
        {
            clearTimeout(this._expirationTimer);
            this._expirationTimer = null;
        }
    }

    // AS3: ClubDiscountPromoExtension.as::onExtendOfferExpire()
    private onExtendOfferExpire(): void
    {
        this._toolbar?.extensionView?.detachExtension(ClubDiscountPromoExtension.EXTENSION_ID);
        this.destroyWindow();
    }

    // AS3: ClubDiscountPromoExtension.as::isExtensionEnabled()
    private isExtensionEnabled(): boolean
    {
        if(this._toolbar == null) return false;

        return this._toolbar.inventory?.clubLevel === ClubDiscountPromoExtension.CLUB_LEVEL_VIP
            && this._toolbar.getBoolean('club.membership.extend.vip.promotion.enabled');
    }

    /**
	 * Both the text and its drop shadow carry the same string — the shadow is a second text window
	 * offset by a pixel in the layout, not a filter.
	 */
    // AS3: ClubDiscountPromoExtension.as::setText()
    private setText(text: string): void
    {
        if(this._window == null) return;

        const promoText = (this._window.findChildByName('promo_text') as ITextWindow | null) ?? null;
        const promoShadow = (this._window.findChildByName('promo_text_shadow') as ITextWindow | null) ?? null;

        if(promoText !== null) promoText.text = text;
        if(promoShadow !== null) promoShadow.text = text;
    }

    // AS3: ClubDiscountPromoExtension.as::animate()
    private animate(enabled: boolean): void
    {
        if(enabled)
        {
            if(this._triggerTimer !== null)
            {
                clearInterval(this._triggerTimer);
            }

            this._triggerTimer = setInterval(
                () => this.onTriggerTimer(),
                ClubDiscountPromoExtension.ANIMATION_INTERVAL_MS
            );

            return;
        }

        if(this._triggerTimer !== null)
        {
            clearInterval(this._triggerTimer);
            this._triggerTimer = null;
        }

        this.clearAnimation();
    }

    /**
	 * AS3 nulls the highlight reference here, so a cleared animation cannot be restarted without
	 * rebuilding the window — which is exactly what `destroyWindow()` does next.
	 */
    // AS3: ClubDiscountPromoExtension.as::clearAnimation()
    private clearAnimation(): void
    {
        if(this._highlight === null) return;

        (this._highlight as unknown as IWindow).visible = false;
        this._highlight.bitmap = null;
        this._highlight = null;
        (this._window as unknown as IWindow | null)?.invalidate();

        if(this._sweepTimer !== null)
        {
            clearInterval(this._sweepTimer);
            this._sweepTimer = null;
        }
    }

    /**
	 * The `context` test is AS3's way of asking "is this window still attached to a live desktop" —
	 * a detached bar keeps its timer but must not paint.
	 */
    // AS3: ClubDiscountPromoExtension.as::onTriggerTimer()
    private onTriggerTimer(): void
    {
        if(this._highlight === null) return;

        if((this._highlight as unknown as IWindow).context == null) return;

        (this._highlight as unknown as IWindow).visible = true;
        this.resetAnimationVariables();
        this.startAnimationTimer();
    }

    // AS3: ClubDiscountPromoExtension.as::resetAnimationVariables()
    private resetAnimationVariables(): void
    {
        if(this._highlight === null || this._window === null || this._highlightSource === null) return;

        const highlight = this._highlight as unknown as IWindow;
        const margin = ClubDiscountPromoExtension.ANIMATION_MARGIN;

        highlight.x = margin;
        highlight.y = margin;
        this._highlight.bitmap = this.cloneHighlight(this._highlightSource.width);
        highlight.height = (this._window as unknown as IWindow).height - margin * 2;
        highlight.width = this._highlightSource.width;
        highlight.invalidate();

        this._animBlockMoveAmount = (this._window as unknown as IWindow).width - 7 - this._highlightSource.width;
        this._sweepTick = 0;
    }

    /**
	 * 26 ticks against 20 steps: the strip is already at the end by tick 20, and the remaining six
	 * are what crop it off the right edge.
	 */
    // AS3: ClubDiscountPromoExtension.as::startAnimationTimer()
    private startAnimationTimer(): void
    {
        if(this._sweepTimer !== null) clearInterval(this._sweepTimer);

        let ticksLeft = ClubDiscountPromoExtension.ANIMATION_TICK_COUNT;

        this._sweepTimer = setInterval(() =>
        {
            this.onAnimationTimer();

            ticksLeft -= 1;

            if(ticksLeft <= 0)
            {
                // AS3's Timer fires timerComplete after its repeat count; setInterval has no
                // equivalent, so the count is kept here and the completion called by hand.
                this.onAnimationTimerComplete();
            }
        }, ClubDiscountPromoExtension.ANIMATION_TICK_MS);
    }

    // AS3: ClubDiscountPromoExtension.as::onAnimationTimer()
    private onAnimationTimer(): void
    {
        if(this._highlight === null || this._window === null || this._highlightSource === null) return;

        const highlight = this._highlight as unknown as IWindow;
        const margin = ClubDiscountPromoExtension.ANIMATION_MARGIN;

        highlight.x = margin + (this._sweepTick / ClubDiscountPromoExtension.ANIMATION_STEPS) * this._animBlockMoveAmount;

        if(highlight.x > this._animBlockMoveAmount)
        {
            const visibleWidth = (this._window as unknown as IWindow).width - 4 - highlight.x;
            const cropped = this.cloneHighlight(visibleWidth);

            if(cropped !== null)
            {
                this._highlight.bitmap = cropped;
                highlight.width = visibleWidth;
            }
        }

        highlight.invalidate();
        this._sweepTick += 1;
    }

    // AS3: ClubDiscountPromoExtension.as::onAnimationTimerComplete()
    private onAnimationTimerComplete(): void
    {
        this.clearAnimation();
    }

    // AS3: ClubDiscountPromoExtension.as::setClubIcon()
    private setClubIcon(style: number): void
    {
        if(this._window == null) return;

        const icon = (this._window.findChildByName('club_icon') as IIconWindow | null) ?? null;

        if(icon === null) return;

        (icon as unknown as IWindow).style = style;
        (icon as unknown as IWindow).invalidate();
    }

    // AS3: ClubDiscountPromoExtension.as::onTextRegionMouseOver()
    private onTextRegionMouseOver = (): void =>
    {
        const promoText = (this._window?.findChildByName('promo_text') as ITextWindow | null) ?? null;

        if(promoText !== null) promoText.textColor = ClubDiscountPromoExtension.LINK_COLOR_HIGHLIGHT;
    };

    // AS3: ClubDiscountPromoExtension.as::onTextRegionMouseOut()
    private onTextRegionMouseOut = (): void =>
    {
        const promoText = (this._window?.findChildByName('promo_text') as ITextWindow | null) ?? null;

        if(promoText !== null) promoText.textColor = ClubDiscountPromoExtension.LINK_COLOR_NORMAL;
    };

    // TS-only: no AS3 counterpart; AS3 reads its own `_disposed` field directly.
    get disposed(): boolean
    {
        return this._disposed;
    }
}
