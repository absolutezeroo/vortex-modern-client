import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowUtils} from '@core/window/utils/WindowUtils';
import {ActivityPointTypeEnum} from '@habbo/catalog/purse/ActivityPointTypeEnum';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';

import type {HabbiconController} from './HabbiconController';
import type {HabbiconEntryModel} from './HabbiconEntryModel';
import type {HabbiconSetModel} from './HabbiconSetModel';
import type {HabbiconTileView} from './HabbiconTileView';

/**
 * The panel at the foot of a set page: the habbicon you get for completing it, and — while it is
 * still incomplete — an offer to buy the whole set instead.
 *
 * **`rewardTile` returns null, always.** The constructor still wires a click listener onto the
 * reward artwork gated on it, and `onRewardTileClick()` still tests it before forwarding, so the
 * reward image is not clickable and the callback passed in is never invoked. Transcribed as-is: this
 * is AS3's own dead path, not a porting gap. `update()` is likewise empty in the source.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconRewardPanelView.as
 */
export class HabbiconRewardPanelView implements IDisposable
{
    // AS3: HabbiconRewardPanelView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: HabbiconController | null;

    // AS3: HabbiconRewardPanelView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconRewardPanelView.as::_SafeStr_4833 (name derived: the set on show)
    private _set: HabbiconSetModel | null = null;

    // AS3: HabbiconRewardPanelView.as::_SafeStr_6652 (name derived: the tile-click callback)
    private _onTileClicked: ((tile: HabbiconTileView) => void) | null;

    // AS3: HabbiconRewardPanelView.as::_SafeStr_6934 (name derived: whatever the click was bound to)
    private _clickTarget: IWindow | null = null;

    // AS3: HabbiconRewardPanelView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconRewardPanelView.as::HabbiconRewardPanelView()
    constructor(
        controller: HabbiconController | null,
        window: IWindowContainer | null,
        onTileClicked: ((tile: HabbiconTileView) => void) | null
    )
    {
        this._controller = controller;
        this._window = window;
        this._onTileClicked = onTileClicked;

        const habbicon = this.rewardHabbicon;

        if(habbicon !== null) habbicon.disposesBitmap = true;

        this.rewardActionButton?.addEventListener('WME_CLICK', this.onClaimClicked);
        this.rewardBuyButton?.addEventListener('WME_CLICK', this.onBuyClicked);

        if(this._onTileClicked !== null && this.rewardTile !== null)
        {
            this._clickTarget = this.rewardHabbiconFrame ?? (habbicon as unknown as IWindow | null);
            this._clickTarget?.addEventListener('WME_CLICK', this.onRewardTileClick);
        }
    }

    /**
	 * With no reward, the action button is hidden *and* reset to the claim caption — so a later set
	 * that does have one never briefly shows "claimed".
	 */
    // AS3: HabbiconRewardPanelView.as::refresh()
    refresh(set: HabbiconSetModel | null, _animate: boolean): void
    {
        this._set = set;

        const panel = this.rewardPanel;
        const actionButton = this.rewardActionButton;
        const buyContainer = this.rewardBuyContainer;

        if(set === null || set.rewardHabbicon === null)
        {
            if(panel !== null) (panel as unknown as IWindow).visible = false;
            if(buyContainer !== null) (buyContainer as unknown as IWindow).visible = false;

            if(actionButton !== null)
            {
                actionButton.visible = false;
                actionButton.caption = '${habbicon_reward.claim}';
                WindowUtils.disableSection(actionButton, true);
            }

            this.clearRewardBitmap();

            return;
        }

        const reward = set.rewardHabbicon;
        const owned = HabbiconRewardPanelView.isRewardOwned(reward);
        const claimable = HabbiconRewardPanelView.isRewardClaimable(reward);
        const buyable = HabbiconRewardPanelView.isRewardBuyable(set, reward);
        const localization = this._controller?.localizationManager ?? null;

        let description: string;

        if(claimable)
        {
            description = localization?.getLocalization('habbicon_book.reward.claimable', 'Reward ready to claim.') ?? '';
        }
        else if(owned)
        {
            description = localization?.getLocalization('habbicon_book.reward.claimed', 'Reward claimed.') ?? '';
        }
        else
        {
            description = localization?.getLocalization(
                'habbicon_book.reward.locked', 'Complete this set to unlock the reward.'
            ) ?? '';
        }

        if(panel !== null) (panel as unknown as IWindow).visible = true;

        this.updateRewardBitmap(reward);

        const title = this.rewardTitle;
        const descriptionWindow = this.rewardDescription;

        if(title !== null) title.text = '${habbicon_book.reward.title}';
        if(descriptionWindow !== null) descriptionWindow.text = description;

        if(actionButton !== null)
        {
            actionButton.visible = true;
            actionButton.caption = owned ? '${habbicon_reward.claimed}' : '${habbicon_reward.claim}';
            WindowUtils.disableSection(actionButton, !claimable);
        }

        if(buyContainer !== null) (buyContainer as unknown as IWindow).visible = buyable;

        if(!buyable) return;

        const price = this.rewardBuyPrice;
        const icon = this.rewardBuyCurrencyIcon;

        if(price !== null)
        {
            price.text = HabbiconRewardPanelView.formatPrice(set.priceCredits, set.priceActivityPoints);
        }

        if(icon !== null)
        {
            icon.style = this.getPriceIconStyle(set.priceActivityPoints, set.activityPointType);
            icon.fitToSize();
        }
    }

    // AS3: HabbiconRewardPanelView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Always null in AS3 — the reward is drawn as a plain bitmap, not as a pooled tile. Kept so the
	 * two guards that read it, and the caller wiring that depends on them, port faithfully.
	 */
    // AS3: HabbiconRewardPanelView.as::get rewardTile()
    get rewardTile(): HabbiconTileView | null
    {
        return null;
    }

    // AS3: HabbiconRewardPanelView.as::update()
    update(_delta: number): void
    {
        // AS3's body is empty — the reward panel has nothing that animates.
    }

    // AS3: HabbiconRewardPanelView.as::updateRewardBitmap()
    private updateRewardBitmap(reward: HabbiconEntryModel): void
    {
        const preview = HabbiconAssetManager.getPreviewBitmap(reward.habbiconId, false);

        this.clearRewardBitmap();

        const target = this.rewardHabbicon;

        if(target === null) return;

        target.bitmap = preview ?? HabbiconRewardPanelView.createPlaceholderBitmap();
        (target as unknown as IWindow).visible = true;
        (target as unknown as IWindow).invalidate();
    }

    /**
	 * AS3's placeholder is an *opaque* 40×40 fill in 0x8F94CF — grey-blue, matching the panel — not a
	 * transparent one. Same colour and same opacity here.
	 */
    // AS3: HabbiconRewardPanelView.as::updateRewardBitmap() — the `new BitmapData(...)` fallback
    private static createPlaceholderBitmap(): ImageBitmap | null
    {
        const canvas = new OffscreenCanvas(40, 40);
        const context = canvas.getContext('2d');

        if(context === null) return null;

        context.fillStyle = '#8F94CF';
        context.fillRect(0, 0, 40, 40);

        return canvas.transferToImageBitmap();
    }

    // AS3: HabbiconRewardPanelView.as::clearRewardBitmap()
    private clearRewardBitmap(): void
    {
        const target = this.rewardHabbicon;

        if(target === null || target.bitmap === null) return;

        target.bitmap = null;
        (target as unknown as IWindow).invalidate();
    }

    // AS3: HabbiconRewardPanelView.as::isRewardOwned()
    private static isRewardOwned(reward: HabbiconEntryModel | null): boolean
    {
        return reward !== null && (reward.owned || reward.favorite);
    }

    // AS3: HabbiconRewardPanelView.as::isRewardClaimable()
    private static isRewardClaimable(reward: HabbiconEntryModel | null): boolean
    {
        return reward !== null && reward.claimable && !HabbiconRewardPanelView.isRewardOwned(reward);
    }

    // AS3: HabbiconRewardPanelView.as::isRewardBuyable()
    private static isRewardBuyable(set: HabbiconSetModel | null, reward: HabbiconEntryModel | null): boolean
    {
        return set !== null
            && set.canBuy
            && reward !== null
            && !reward.owned
            && !reward.favorite
            && !reward.claimable;
    }

    // AS3: HabbiconRewardPanelView.as::formatPrice()
    private static formatPrice(credits: number, activityPoints: number): string
    {
        if(credits > 0 && activityPoints > 0) return `${credits}c + ${activityPoints}`;

        if(credits > 0) return String(credits);

        return String(Math.max(0, activityPoints));
    }

    /**
	 * A price with any activity-point component picks that currency's icon; anything else is credits.
	 * The credits half of a mixed price is therefore not iconified.
	 */
    // AS3: HabbiconRewardPanelView.as::getPriceIconStyle()
    private getPriceIconStyle(activityPoints: number, activityPointType: number): number
    {
        const configuration = this._controller?.configuration ?? null;

        // AS3 passes a possibly-null manager and would throw on the loyalty/seasonal branches that
        // read it. Returning the credits style keeps the icon sane instead of taking down the paint.
        if(configuration === null) return 35;

        const type = activityPoints > 0 ? activityPointType : ActivityPointTypeEnum.CREDITS;

        return ActivityPointTypeEnum.getIconStyleFor(type, configuration, false);
    }

    // AS3: HabbiconRewardPanelView.as::onClaimClicked()
    private onClaimClicked = (_event: WindowMouseEvent): void =>
    {
        const reward = this._set?.rewardHabbicon ?? null;

        if(HabbiconRewardPanelView.isRewardClaimable(reward) && reward !== null)
        {
            this._controller?.claimHabbicon(reward.habbiconId);
        }
    };

    // AS3: HabbiconRewardPanelView.as::onBuyClicked()
    private onBuyClicked = (_event: WindowMouseEvent): void =>
    {
        const reward = this._set?.rewardHabbicon ?? null;

        if(HabbiconRewardPanelView.isRewardBuyable(this._set, reward))
        {
            this._controller?.openHabbiconSetPurchaseConfirmation(this._set);
        }
    };

    // AS3: HabbiconRewardPanelView.as::onRewardTileClick()
    private onRewardTileClick = (_event: WindowMouseEvent): void =>
    {
        const tile = this.rewardTile;

        if(this._onTileClicked !== null && tile !== null) this._onTileClicked(tile);
    };

    // AS3: HabbiconRewardPanelView.as::get rewardPanel()
    private get rewardPanel(): IWindowContainer | null
    {
        return (this._window?.findChildByName('reward_panel') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardTitle()
    private get rewardTitle(): ITextWindow | null
    {
        return (this._window?.findChildByName('reward_title') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardHabbiconFrame()
    private get rewardHabbiconFrame(): IWindow | null
    {
        return this._window?.findChildByName('reward_habbicon_frame') ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardHabbicon()
    private get rewardHabbicon(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('reward_habbicon') as IBitmapWrapperWindow | null) ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardDescription()
    private get rewardDescription(): ITextWindow | null
    {
        return (this._window?.findChildByName('reward_description') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardActionButton()
    private get rewardActionButton(): IWindow | null
    {
        return this._window?.findChildByName('reward_action_button') ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardBuyContainer()
    private get rewardBuyContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('reward_buy_container') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardBuyPrice()
    private get rewardBuyPrice(): ITextWindow | null
    {
        return (this._window?.findChildByName('reward_buy_price') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardBuyCurrencyIcon()
    private get rewardBuyCurrencyIcon(): IIconWindow | null
    {
        return (this._window?.findChildByName('reward_buy_currency_icon') as IIconWindow | null) ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::get rewardBuyButton()
    private get rewardBuyButton(): IWindow | null
    {
        return this._window?.findChildByName('reward_buy_button') ?? null;
    }

    // AS3: HabbiconRewardPanelView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.rewardActionButton?.removeEventListener('WME_CLICK', this.onClaimClicked);
        this.rewardBuyButton?.removeEventListener('WME_CLICK', this.onBuyClicked);

        if(this._clickTarget !== null)
        {
            this._clickTarget.removeEventListener('WME_CLICK', this.onRewardTileClick);
            this._clickTarget = null;
        }

        this.clearRewardBitmap();

        this._controller = null;
        this._window = null;
        this._set = null;
        this._onTileClicked = null;
        this._disposed = true;
    }
}
