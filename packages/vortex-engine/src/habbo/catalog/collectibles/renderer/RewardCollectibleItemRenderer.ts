import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {NftClaim} from '@habbo/communication/messages/parser/collectibles/NftClaim';
import type {CollectibleItem} from '@habbo/communication/messages/parser/collectibles/CollectibleItem';

import type {CollectiblesController} from '../CollectiblesController';
import {BaseItemWrapper} from './model/BaseItemWrapper';
import {AbstractCollectibleItemRenderer} from './AbstractCollectibleItemRenderer';
import type {RewardClaimsTab} from '../tabs/RewardClaimsTab';

/**
 * One row in the reward-claims tab: what the reward is, how many are left to claim, which
 * collection it came from and which wallet it would be minted to.
 *
 * The only cell renderer whose `onClick()` does nothing — a claim row is not selectable, the whole
 * list is claimed at once by the tab's button.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/RewardCollectibleItemRenderer.as
 */
export class RewardCollectibleItemRenderer extends AbstractCollectibleItemRenderer
{
    /**
     * **AS3 assigns all three before `super()`; TypeScript cannot.**
     *
     * AS3 allows statements ahead of the base constructor call and relies on it here, so the
     * `updateVisuals()` that the base constructor invokes can read them. TypeScript forbids
     * touching `this` before `super()`, so the assignments follow it and that first
     * `updateVisuals()` necessarily sees `undefined`.
     *
     * Two things make that harmless: the guard in `updateVisuals()`, and the fact that
     * `RewardClaimsTab.createRewardItem()` calls `updateVisuals()` again explicitly right after
     * construction — which AS3 also does, and which is the reason it does.
     *
     * `declare` keeps TypeScript from emitting field initialisers that would run after `super()`
     * and overwrite the constructor's assignments.
     */
    // AS3: RewardCollectibleItemRenderer.as::_SafeStr_10299 (the owning tab)
    private declare _tab: RewardClaimsTab;
    // AS3: RewardCollectibleItemRenderer.as::_rewardClaim
    private declare _rewardClaim: NftClaim;
    // AS3: RewardCollectibleItemRenderer.as::_SafeStr_8370 (the wrapper it renders)
    private declare _itemWrapper: BaseItemWrapper;

    // AS3: RewardCollectibleItemRenderer.as::RewardCollectibleItemRenderer()
    constructor(
        controller: CollectiblesController,
        rewardClaim: NftClaim,
        container: IWindowContainer,
        tab: RewardClaimsTab
    )
    {
        const wrapper = new BaseItemWrapper(rewardClaim.claimItem);

        super(controller, wrapper, container);

        this._tab = tab;
        this._rewardClaim = rewardClaim;
        this._itemWrapper = wrapper;
    }

    /**
     * Empty in AS3 — overridden only to *suppress* the base's click behaviour, which there is also
     * empty. Kept so the intent is on the record: a claim row is not selectable.
     */
    // AS3: RewardCollectibleItemRenderer.as::onClick()
    protected override onClick(_event: WindowMouseEvent): void
    {
    }

    /**
     * Runs from `super()` before this class's fields exist, and again from
     * `RewardClaimsTab.createRewardItem()` once they do. The guard covers the first pass — see the
     * field note.
     */
    // AS3: RewardCollectibleItemRenderer.as::updateVisuals()
    override updateVisuals(): void
    {
        if(this._rewardClaim === undefined) return;

        const name = this.nameText;
        const amount = this.amountText;
        const collection = this.collectionText;
        const wallet = this.walletText;

        if(name !== null) name.text = this._controller.getProductName(this._itemWrapper);

        if(amount !== null)
        {
            amount.text = `x${this._rewardClaim.claimLimit - this._rewardClaim.claimedAmount}`;
        }

        if(collection !== null)
        {
            const label = this.localization?.getLocalization('collectibles.claim.collection') ?? '';

            collection.text = `<b>${label}</b> ${this.collectionName}`;
        }

        if(wallet !== null) wallet.text = this._rewardClaim.wallet;
    }

    // AS3: RewardCollectibleItemRenderer.as::updateExpiresText()
    updateExpiresText(formattedDate: string): void
    {
        const expires = this.expiresText;

        if(expires === null) return;

        const label = this.localization?.getLocalization('collectibles.claim.expiration') ?? '';

        expires.text = `<b>${label}</b> ${formattedDate}`;
    }

    // AS3: RewardCollectibleItemRenderer.as::get item()
    get item(): CollectibleItem
    {
        return (this.renderableItem as BaseItemWrapper).baseItem;
    }

    // AS3: RewardCollectibleItemRenderer.as::get rewardClaim()
    get rewardClaim(): NftClaim
    {
        return this._rewardClaim;
    }

    // AS3: RewardCollectibleItemRenderer.as::get borderOutline()
    protected override get borderOutline(): IWindow | null
    {
        return this.container?.findChildByName('border_outline') ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get borderBackground()
    protected override get borderBackground(): IWindow | null
    {
        return this.container?.findChildByName('border_background') ?? null;
    }

    /** By *tag*, not by name — this row's amount label is the only one addressed that way. */
    // AS3: RewardCollectibleItemRenderer.as::get amountText()
    protected override get amountText(): ITextWindow | null
    {
        return this.container?.findChildByTag('AMOUNT_TITLE') as ITextWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get amountTextBorder()
    protected override get amountTextBorder(): IWindow | null
    {
        return this.container?.findChildByName('text_border') ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get bitmapWindow()
    protected override get bitmapWindow(): IBitmapWrapperWindow | null
    {
        return this.container?.findChildByTag('BITMAP') as IBitmapWrapperWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get unknownImageWindow()
    protected override get unknownImageWindow(): IStaticBitmapWrapperWindow | null
    {
        return this.container?.findChildByName('unknown_image') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get badgeImageWindow()
    protected override get badgeImageWindow(): IWidgetWindow | null
    {
        return this.container?.findChildByName('badge_image_widget') as IWidgetWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get petImageWindow()
    protected override get petImageWindow(): IWidgetWindow | null
    {
        return this.container?.findChildByName('pet_image_widget') as IWidgetWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get nameText()
    private get nameText(): ITextWindow | null
    {
        return this.container?.findChildByTag('NAME_TITLE') as ITextWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get walletText()
    private get walletText(): ITextWindow | null
    {
        return this.container?.findChildByName('wallet_text') as ITextWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get collectionText()
    private get collectionText(): ITextWindow | null
    {
        return this.container?.findChildByName('collection_text') as ITextWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get expiresText()
    private get expiresText(): ITextWindow | null
    {
        return this.container?.findChildByName('expires_text') as ITextWindow | null ?? null;
    }

    // AS3: RewardCollectibleItemRenderer.as::get localization()
    private get localization(): IHabboLocalizationManager | null
    {
        return this._controller.localizationManager;
    }

    // AS3: RewardCollectibleItemRenderer.as::get collectionName()
    private get collectionName(): string
    {
        return this.localization?.getLocalization(`collectibles.set.${this._rewardClaim.claimItem.setId}`) ?? '';
    }
}
