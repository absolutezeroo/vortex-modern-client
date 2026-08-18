/**
 * RewardTrackPrizeView — one prize tile on the track: its product icon, a quantity badge, and the
 * lock/tick overlays.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/prizes/RewardTrackPrizeView.as
 *
 * Pooled like the point indicators: the constructor clones and wires the click region once,
 * `initialize()` binds a prize, `clear()` unbinds and hides. The click listener therefore outlives
 * every binding, which is why `onClick` starts by testing for a null prize.
 *
 * The click has three outcomes and they are ordered: a claimed prize does nothing, a premium-locked
 * one opens the purchase confirmation, and only a genuinely claimable one sends the claim.
 *
 * Note what the dimming keys off — `hasEnoughPoints`, not `isAvailable`. A premium prize the player
 * has the points for is drawn at full strength with a padlock, rather than greyed out.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {WindowUtils} from '@core/window/utils/WindowUtils';
import type {ProductIconWidget} from '@habbo/window/widgets/ProductIconWidget';
import type {RewardTrack} from '../../data/RewardTrack';
import type {RewardTrackPrize} from '../../data/RewardTrackPrize';
import {RewardTrackRewardDisplayWrapper} from '../../data/RewardTrackRewardDisplayWrapper';
import type {RewardTrackController} from '../../RewardTrackController';

export class RewardTrackPrizeView
{
    /** Derived name — `_SafeStr_10533`: how far the icon lifts to make room for the quantity badge. */
    // AS3: RewardTrackPrizeView.as::_SafeStr_10533
    private static readonly QUANTITY_ICON_OFFSET: number = 3;

    /** AS3's literal `0.75` — how far a prize the player cannot afford is dimmed. */
    // AS3: RewardTrackPrizeView.as::refreshState()
    private static readonly DISABLED_DIM_FACTOR: number = 0.75;

    /** Derived name — `_SafeStr_4593`. */
    // AS3: RewardTrackPrizeView.as::_SafeStr_4593
    private _controller: RewardTrackController | null = null;

    /** Derived name — `_SafeStr_4821`. */
    // AS3: RewardTrackPrizeView.as::_SafeStr_4821
    private _track: RewardTrack | null = null;

    /** Derived name — `_SafeStr_4765`. */
    // AS3: RewardTrackPrizeView.as::_SafeStr_4765
    private _prize: RewardTrackPrize | null = null;

    // AS3: RewardTrackPrizeView.as::_window
    private _window: IWindowContainer | null;

    /** Derived name — `_SafeStr_8418`: the icon's designed `y`, before any quantity offset. */
    // AS3: RewardTrackPrizeView.as::_SafeStr_8418
    private _iconBaseY: number;

    // AS3: RewardTrackPrizeView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackPrizeView.as::RewardTrackPrizeView()
    constructor(template: IWindowContainer)
    {
        this._window = (template as unknown as IWindow).clone() as unknown as IWindowContainer;
        this._iconBaseY = (this.productIcon as unknown as IWindow | null)?.y ?? 0;

        (this.clickRegion as unknown as IWindow | null)?.addEventListener('WME_CLICK', this.onClick);
    }

    // AS3: RewardTrackPrizeView.as::initialize()
    public initialize(controller: RewardTrackController, track: RewardTrack, prize: RewardTrackPrize): void
    {
        this._controller = controller;
        this._track = track;
        this._prize = prize;

        this.refresh();
    }

    // AS3: RewardTrackPrizeView.as::refresh()
    public refresh(): void
    {
        if(this._prize === null) return;

        const widget = (this.productIcon?.widget ?? null) as ProductIconWidget | null;

        if(widget !== null)
        {
            widget.productInfo = new RewardTrackRewardDisplayWrapper(this._prize);
        }

        const stacked = this._prize.rewardAmount > 1;
        const quantityContainer = this.quantityContainer as unknown as IWindow | null;

        if(quantityContainer !== null) quantityContainer.visible = stacked;

        const quantityText = this.quantityText;

        if(quantityText !== null) quantityText.text = String(this._prize.rewardAmount);

        const icon = this.productIcon as unknown as IWindow | null;

        if(icon !== null)
        {
            icon.y = stacked
                ? this._iconBaseY - RewardTrackPrizeView.QUANTITY_ICON_OFFSET
                : this._iconBaseY;
        }

        this.refreshState();
    }

    // AS3: RewardTrackPrizeView.as::refreshState()
    public refreshState(): void
    {
        const prize = this._prize;
        const track = this._track;

        if(prize === null || track === null) return;

        const claimedIcon = this.claimedIcon;
        const lockedIcon = this.lockedIcon;
        const locked = prize.isPremiumLocked(track);

        if(claimedIcon !== null) claimedIcon.visible = prize.claimed;
        if(lockedIcon !== null) lockedIcon.visible = locked;

        const region = this.clickRegion;

        if(region !== null)
        {
            if(prize.claimed)
            {
                region.toolTipCaption = '${reward_track.rewards.reward_tooltip.claimed}';
            }
            else if(locked)
            {
                region.toolTipCaption = '${reward_track.rewards.reward_tooltip.premium}';
            }
            else if(!prize.isAvailable(track))
            {
                region.toolTipCaption = '${reward_track.rewards.reward_tooltip.not_enough_points}';
            }
            else
            {
                region.toolTipCaption = '${reward_track.rewards.reward_tooltip.claim}';
            }
        }

        const window = this._window as unknown as IWindow | null;

        if(window !== null)
        {
            WindowUtils.disableSection(
                window, !prize.hasEnoughPoints(track), RewardTrackPrizeView.DISABLED_DIM_FACTOR
            );
        }
    }

    /** Releases the tile back to the pool. The click listener stays wired — see the class note. */
    // AS3: RewardTrackPrizeView.as::clear()
    public clear(): void
    {
        this._controller = null;
        this._track = null;
        this._prize = null;

        const window = this._window as unknown as IWindow | null;

        if(window !== null) window.visible = false;
    }

    // AS3: RewardTrackPrizeView.as::onClick()
    private onClick = (): void =>
    {
        const prize = this._prize;
        const track = this._track;

        if(prize === null || track === null) return;

        if(prize.claimed) return;

        if(prize.isPremiumLocked(track))
        {
            this._controller?.openPremiumPurchaseConfirmation(track);

            return;
        }

        if(prize.isClaimable(track))
        {
            this._controller?.claimPrize(track.id, prize.id);
        }
    };

    // AS3: RewardTrackPrizeView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackPrizeView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: RewardTrackPrizeView.as::get prize()
    public get prize(): RewardTrackPrize | null
    {
        return this._prize;
    }

    // AS3: RewardTrackPrizeView.as::get clickRegion()
    private get clickRegion(): IRegionWindow | null
    {
        return (this._window?.findChildByName('click_region') ?? null) as unknown as IRegionWindow | null;
    }

    // AS3: RewardTrackPrizeView.as::get productIcon()
    private get productIcon(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('product_icon') ?? null) as unknown as IWidgetWindow | null;
    }

    // AS3: RewardTrackPrizeView.as::get quantityContainer()
    private get quantityContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('quantity_container') ?? null) as IWindowContainer | null;
    }

    /** AS3 reaches for the container's first child rather than naming the text window. */
    // AS3: RewardTrackPrizeView.as::get quantityText()
    private get quantityText(): ITextWindow | null
    {
        return (this.quantityContainer?.getChildAt(0) ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPrizeView.as::get lockedIcon()
    private get lockedIcon(): IWindow | null
    {
        return this._window?.findChildByName('locked_icon') ?? null;
    }

    // AS3: RewardTrackPrizeView.as::get claimedIcon()
    private get claimedIcon(): IWindow | null
    {
        return this._window?.findChildByName('claimed_icon') ?? null;
    }

    // AS3: RewardTrackPrizeView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        const window = this._window as unknown as IWindow | null;

        if(window !== null && window.parent !== null)
        {
            (window.parent as unknown as IWindowContainer).removeChild(window);
        }

        (this.clickRegion as unknown as IWindow | null)?.removeEventListener('WME_CLICK', this.onClick);

        window?.dispose();

        this._window = null;
        this._controller = null;
        this._track = null;
        this._prize = null;
    }
}
