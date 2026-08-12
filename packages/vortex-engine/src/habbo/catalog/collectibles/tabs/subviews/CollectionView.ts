import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import {NftCollection} from '@habbo/communication/messages/parser/collectibles/NftCollection';
import type {CollectibleCollectionItem} from '@habbo/communication/messages/parser/collectibles/CollectibleCollectionItem';
import {
    NftCollectiblesClaimBonusItemComposer
} from '@habbo/communication/messages/outgoing/collectibles/NftCollectiblesClaimBonusItemComposer';
import {
    NftCollectiblesClaimRewardItemComposer
} from '@habbo/communication/messages/outgoing/collectibles/NftCollectiblesClaimRewardItemComposer';

import type {CollectionsTab} from '../CollectionsTab';
import {CollectibleProductPreviewer} from './CollectibleProductPreviewer';
import {CollectionItemWrapper} from '../../renderer/model/CollectionItemWrapper';
import {CollectionProgressColor} from '../../renderer/collections/CollectionProgressColor';
import {CollectibleItemRenderer} from '../../renderer/collections/CollectibleItemRenderer';

/** AS3: CollectionView.as::PREVIEW_STATUS_* — what the right-hand panel is currently showing. */
const PREVIEW_STATUS_NONE = 0;
const PREVIEW_STATUS_BONUS = 1;
const PREVIEW_STATUS_REWARD = 2;
const PREVIEW_STATUS_COLLECTION = 3;
const PREVIEW_STATUS_ITEM = 4;

/** AS3: CollectionView.as — the bonus timer's two colour pairs. The expired ones carry alpha. */
const BONUS_PROGRESS_ACTIVE_TOP_COLOR = 37130;
const BONUS_PROGRESS_ACTIVE_BOTTOM_COLOR = 228352;
const BONUS_PROGRESS_EXPIRED_TOP_COLOR = 4294913325;
const BONUS_PROGRESS_EXPIRED_BOTTOM_COLOR = 4289724416;

// AS3: CollectionView.as::PROGRESS_BAR_UPDATE_THRESHOLD — ms between countdown repaints.
const PROGRESS_BAR_UPDATE_THRESHOLD = 1000;

/** AS3: CollectionView.as::initRewardItem() — the header grows to fit the bonus timer. */
const HEADER_HEIGHT_WITH_TIMER = 60;
const HEADER_HEIGHT_WITHOUT_TIMER = 38;

/**
 * The right-hand panel of the collections tab: one collection's grid, its progress, and whichever
 * claimable reward it currently offers.
 *
 * `_previewStatus` is the whole state machine. `initRewardClaim()` picks it from the collection's
 * claim state in a fixed order — claimable bonus, claimable reward, unclaimed bonus, unclaimed
 * reward, else nothing — and `onClickClaim()` reads it back to decide which of two composers to
 * send. Clicking a grid cell switches it to ITEM and clicking the same cell again switches back.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/tabs/subviews/CollectionView.as
 */
export class CollectionView
{
    // AS3: CollectionView.as::_SafeStr_5769 (the disposed flag)
    private _disposed: boolean = false;
    // AS3: CollectionView.as::_SafeStr_4908 (the owning tab)
    private _tab: CollectionsTab;
    // AS3: CollectionView.as::_container
    private _container: IWindowContainer;
    // AS3: CollectionView.as::_SafeStr_4700 (from `get nftCollection()`)
    private _nftCollection: NftCollection;
    // AS3: CollectionView.as::_previewStatus
    private _previewStatus: number = PREVIEW_STATUS_NONE;
    // AS3: CollectionView.as::_SafeStr_7449 (ms accumulated since the last countdown repaint)
    private _progressBarElapsed: number = 0;
    // AS3: CollectionView.as::_gridItems
    private _gridItems: CollectibleItemRenderer[] = [];
    // AS3: CollectionView.as::_SafeStr_4690 (the selected cell)
    private _selectedItem: CollectibleItemRenderer | null = null;
    // AS3: CollectionView.as::_SafeStr_6819 (the preview surface)
    private _previewer: CollectibleProductPreviewer;
    // AS3: CollectionView.as::_SafeStr_6700 (the expired state has been painted)
    private _expiredStatePainted: boolean = false;

    // AS3: CollectionView.as::CollectionView()
    constructor(tab: CollectionsTab, container: IWindowContainer, nftCollection: NftCollection)
    {
        this._tab = tab;
        this._container = container;
        this._nftCollection = nftCollection;

        this._previewer = new CollectibleProductPreviewer(
            this.productPreviewBitmap,
            this.badgeImageWidget,
            this.petImageWidget,
            this.unknownImageWindow,
            this.avatarImageWidget,
            this.placeholderImage,
            this.effectImageWidget,
            tab.controller.avatarRenderManager
        );

        this.initHeader();
        this.initCollectionPreview();
        this.populateGridItems();

        this.productNameContainer?.addEventListener(WindowMouseEvent.OVER, this.onProductNameHover);
        this.productNameContainer?.addEventListener(WindowMouseEvent.OUT, this.onProductNameUnhover);
        this.claimButton?.addEventListener(WindowMouseEvent.CLICK, this.onClickClaim);
    }

    // AS3: CollectionView.as::initHeader()
    private initHeader(): void
    {
        const title = this.titleText;
        const collected = this._nftCollection.collectedItemCount;
        const total = this._nftCollection.totalItemCount;

        if(title !== null)
        {
            title.text = this.localization?.getLocalization(
                `collectibles.set.${this._nftCollection.collectionId}`,
                this._nftCollection.collectionName
            ) ?? this._nftCollection.collectionName;
        }

        const progress = this.progressText;

        if(progress !== null) progress.text = `${collected}/${total}`;

        const colorContainer = this.progressColorContainer;

        if(colorContainer !== null) colorContainer.color = CollectionProgressColor.getColor(collected, total);
    }

    /**
     * The two score lines are HTML: AS3 embeds `<font color="...">` around the numbers, so they are
     * assigned as markup and not as plain text.
     */
    // AS3: CollectionView.as::initCollectionPreview()
    private initCollectionPreview(): void
    {
        const rewardItem = this.initRewardClaim();
        const complete = this._nftCollection.collectedItemCount === this._nftCollection.totalItemCount;

        const progressContainer = this.collectionProgressContainer;
        const scoreText = this.collectionProgressScoreText;
        const rewardText = this.collectionProgressRewardText;

        if(progressContainer !== null) progressContainer.visible = true;

        if(scoreText !== null)
        {
            scoreText.text = this.localization?.getLocalizationWithParams(
                'collectibles.preview.score', '',
                'progress', `<font color="#00FF12">${this._nftCollection.collectionScore}</font>`,
                'goal', `${this._nftCollection.collectionTotalScore}`
            ) ?? '';
        }

        if(rewardText !== null)
        {
            rewardText.text = this.localization?.getLocalizationWithParams(
                complete ? 'collectibles.preview.reward_collected' : 'collectibles.preview.reward', '',
                'amount', `<font color="#FFC800">${this._nftCollection.collectionBoostScore}</font>`
            ) ?? '';
        }

        const nameContainer = this.productNameContainer;
        const productProgress = this.productProgressContainer;

        if(nameContainer !== null) nameContainer.visible = false;
        if(productProgress !== null) productProgress.visible = false;

        this.setProductInfoVisible(false);

        if(rewardItem === null)
        {
            this._previewer.setPlaceholder();

            return;
        }

        this._tab.controller.previewImage(new CollectionItemWrapper(rewardItem), this._previewer);
    }

    /**
     * Picks what the completion header offers, in AS3's exact order — and the order matters,
     * because a collection can have both a bonus and a reward outstanding at once:
     *
     * 1. a claimable bonus wins outright
     * 2. then a claimable reward
     * 3. then an *unclaimed* bonus, shown with its claim button hidden
     * 4. then an unclaimed reward, same
     * 5. otherwise the header is hidden and the panel shows the collection itself
     *
     * Cases 3 and 4 pass `canClaim` as the button's visibility, so the item is displayed without
     * offering an action.
     */
    // AS3: CollectionView.as::initRewardClaim()
    private initRewardClaim(): CollectibleCollectionItem | null
    {
        const collection = this._nftCollection;

        if(collection.canClaimBonus)
        {
            this.initRewardItem(collection.bonusItem, true, true);

            return collection.bonusItem;
        }

        if(collection.canClaimReward)
        {
            this.initRewardItem(collection.rewardItem, true, false);

            return collection.rewardItem;
        }

        if(collection.hasBonusItem && !collection.bonusClaimed)
        {
            this.initRewardItem(collection.bonusItem, collection.canClaimBonus, true);

            return collection.bonusItem;
        }

        if(collection.hasRewardItem && !collection.rewardClaimed)
        {
            this.initRewardItem(collection.rewardItem, collection.canClaimReward, false);

            return collection.rewardItem;
        }

        this._previewStatus = PREVIEW_STATUS_COLLECTION;

        const completion = this.completionContainer;

        if(completion !== null) completion.visible = false;

        return null;
    }

    // AS3: CollectionView.as::initRewardItem()
    private initRewardItem(item: CollectibleCollectionItem | null, canClaim: boolean, isBonus: boolean): void
    {
        this._previewStatus = isBonus ? PREVIEW_STATUS_BONUS : PREVIEW_STATUS_REWARD;

        const completion = this.completionContainer;
        const nameText = this.completionRewardNameText;
        const progressBar = this.completionProgressBar;
        const header = this.completionHeaderContainer;

        if(completion !== null) completion.visible = true;

        // AS3 dereferences the item unguarded; every path into here passes a non-null one, because
        // `hasBonusItem`/`hasRewardItem` gate the two that could not.
        if(nameText !== null && item !== null)
        {
            nameText.text = this._tab.controller.getProductName(new CollectionItemWrapper(item));
        }

        if(progressBar !== null) progressBar.visible = isBonus;
        if(header !== null) header.height = isBonus ? HEADER_HEIGHT_WITH_TIMER : HEADER_HEIGHT_WITHOUT_TIMER;

        if(isBonus) this.updateBonusProgressBar();

        const claimingStatus = isBonus
            ? this._nftCollection.claimingBonusStatus
            : this._nftCollection.claimingRewardStatus;

        const button = this.claimButton;

        if(claimingStatus === NftCollection.CLAIMING_IDLE)
        {
            button?.enable();
        }
        else
        {
            button?.disable();
        }

        if(button !== null) button.visible = canClaim;
    }

    /**
     * Marks the claim as awaiting *before* sending, so a second click finds the button disabled and
     * the collection already in flight. The wait notification is the tab's, not this view's.
     */
    // AS3: CollectionView.as::onClickClaim()
    private onClickClaim = (): void =>
    {
        const wallet = this._tab.activeWallet;

        if(wallet === null) return;

        if(this._previewStatus === PREVIEW_STATUS_BONUS)
        {
            this._nftCollection.claimBonusAwaiting();
            this._tab.controller.send(new NftCollectiblesClaimBonusItemComposer(this._nftCollection.collectionId, wallet));
            this._tab.sendClaimWaitNotification();
        }
        else
        {
            if(this._previewStatus !== PREVIEW_STATUS_REWARD) return;

            this._nftCollection.claimRewardAwaiting();
            this._tab.controller.send(new NftCollectiblesClaimRewardItemComposer(this._nftCollection.collectionId, wallet));
            this._tab.sendClaimWaitNotification();
        }

        this.claimButton?.disable();
    };

    /**
     * Both parameters are ignored in AS3 — the body only tests `_previewStatus` and re-runs
     * `initCollectionPreview()`. Kept in the signature because `CollectionsTab` passes them.
     */
    // AS3: CollectionView.as::claimingFinished()
    claimingFinished(_finished: boolean, _success: boolean): void
    {
        if(this._previewStatus === PREVIEW_STATUS_REWARD || this._previewStatus === PREVIEW_STATUS_BONUS)
        {
            this.initCollectionPreview();
        }
    }

    /**
     * The bonus claim window's countdown.
     *
     * The third disjunct of the due-test is the interesting one: it fires *once* the moment the
     * window closes, even mid-throttle, because `_expiredStatePainted` has not been set yet. That
     * is what repaints the bar red at the instant of expiry rather than up to a second later.
     */
    // AS3: CollectionView.as::updateBonusProgressBar()
    updateBonusProgressBar(force: boolean = true, elapsedMs: number = 0): void
    {
        this._progressBarElapsed += elapsedMs;

        if(this._previewStatus !== PREVIEW_STATUS_BONUS) return;

        const releasedTime = this._nftCollection.releasedTime;
        const snapshotTime = this._nftCollection.snapshotTime;
        const now = Date.now();

        const due = force
            || this._progressBarElapsed >= PROGRESS_BAR_UPDATE_THRESHOLD
            || (CollectionView.hasBonusClaimWindow(releasedTime, snapshotTime)
                && now >= snapshotTime
                && !this._expiredStatePainted);

        if(!due) return;

        this._progressBarElapsed = 0;

        const progressBar = this.completionProgressBar;
        const header = this.completionHeaderContainer;

        if(!CollectionView.hasBonusClaimWindow(releasedTime, snapshotTime))
        {
            this._expiredStatePainted = false;

            if(progressBar !== null) progressBar.visible = false;
            if(header !== null) header.height = HEADER_HEIGHT_WITHOUT_TIMER;

            return;
        }

        if(progressBar !== null) progressBar.visible = true;
        if(header !== null) header.height = HEADER_HEIGHT_WITH_TIMER;

        if(now >= snapshotTime)
        {
            this.showExpiredBonusClaimState(snapshotTime);
            this._expiredStatePainted = true;

            return;
        }

        this._expiredStatePainted = false;
        this.showActiveBonusClaimTimer(releasedTime, snapshotTime, now);
    }

    /** -1 is the server's "no window", and NaN guards a field that never arrived. */
    // AS3: CollectionView.as::hasBonusClaimWindow()
    private static hasBonusClaimWindow(releasedTime: number, snapshotTime: number): boolean
    {
        return !Number.isNaN(releasedTime) && !Number.isNaN(snapshotTime)
            && releasedTime !== -1 && snapshotTime !== -1;
    }

    /** A zero-or-negative window is treated as fully remaining, not as expired. AS3's. */
    // AS3: CollectionView.as::showActiveBonusClaimTimer()
    private showActiveBonusClaimTimer(releasedTime: number, snapshotTime: number, now: number): void
    {
        const top = this.completionProgressBarTop;
        const bottom = this.completionProgressBarBottom;

        if(top !== null) top.color = BONUS_PROGRESS_ACTIVE_TOP_COLOR;
        if(bottom !== null) bottom.color = BONUS_PROGRESS_ACTIVE_BOTTOM_COLOR;

        const remaining = Math.max(0, snapshotTime - now);
        const total = snapshotTime - releasedTime;
        const fraction = total <= 0 ? 1 : Math.min(1, Math.max(0, remaining / total));
        const width = Math.trunc((this.completionProgressBarPadded?.width ?? 0) * fraction);

        if(top !== null)
        {
            top.width = width;
            top.invalidate();
        }

        if(bottom !== null)
        {
            bottom.width = width;
            bottom.invalidate();
        }

        const text = this.completionProgressBarText;

        if(text === null) return;

        const friendly = FriendlyTime.getFriendlyTime(this.localization, remaining / 1000);

        // AS3 calls getLocalizationWithParams() with a key and an empty default and no params,
        // which is a plain lookup. Ported as one.
        text.text = `${this.localization?.getLocalization('collectibles.preview.time_left') ?? ''}: ${friendly}`;
    }

    // AS3: CollectionView.as::showExpiredBonusClaimState()
    private showExpiredBonusClaimState(snapshotTime: number): void
    {
        const top = this.completionProgressBarTop;
        const bottom = this.completionProgressBarBottom;
        const fullWidth = this.completionProgressBarPadded?.width ?? 0;

        if(top !== null)
        {
            top.color = BONUS_PROGRESS_EXPIRED_TOP_COLOR;
            top.width = fullWidth;
            top.invalidate();
        }

        if(bottom !== null)
        {
            bottom.color = BONUS_PROGRESS_EXPIRED_BOTTOM_COLOR;
            bottom.width = fullWidth;
            bottom.invalidate();
        }

        const text = this.completionProgressBarText;

        if(text === null) return;

        // Same `dd/MM/yyyy` via `en-GB` as RewardClaimsTab — AS3's DateTimeFormatter("i-default").
        const date = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        }).format(new Date(snapshotTime));

        text.text = this.localization?.getLocalizationWithParams(
            'collectibles.preview.bonus_claim_ended',
            'Bonus item claim period ended - %date%',
            'date', date
        ) ?? '';
    }

    // AS3: CollectionView.as::initMintedItemPreview()
    private initMintedItemPreview(item: CollectibleCollectionItem): void
    {
        this._previewStatus = PREVIEW_STATUS_ITEM;

        const completion = this.completionContainer;
        const collectionProgress = this.collectionProgressContainer;

        if(completion !== null) completion.visible = false;
        if(collectionProgress !== null) collectionProgress.visible = false;

        this._previewer.clearPreviewer();

        const wrapper = new CollectionItemWrapper(item);

        this._tab.controller.previewImage(wrapper, this._previewer);

        const nameContainer = this.productNameContainer;
        const nameText = this.productNameText;
        const productProgress = this.productProgressContainer;
        const scoreText = this.productProgressScoreText;

        if(nameContainer !== null) nameContainer.visible = true;
        if(nameText !== null) nameText.text = this._tab.controller.getProductName(wrapper);
        if(productProgress !== null) productProgress.visible = true;

        if(scoreText !== null)
        {
            scoreText.text = this.localization?.getLocalizationWithParams(
                item.amount > 0 ? 'collectibles.preview.product.complete' : 'collectibles.preview.product.incomplete',
                '',
                'amount', `<font color="#FFC800">${item.score}</font>`
            ) ?? '';
        }

        this.initInfoEntries(item);
    }

    // AS3: CollectionView.as::initInfoEntries()
    private initInfoEntries(item: CollectibleCollectionItem): void
    {
        this.clearInfoEntries();

        this.addInfoEntry(
            this.localization?.getLocalization('collectibles.item.type') ?? '',
            this._tab.controller.getProductType(new CollectionItemWrapper(item))
        );
        this.addInfoEntry(
            this.localization?.getLocalization('collectibles.item.rarity') ?? '',
            item.rarity
        );
        this.addInfoEntry(
            this.localization?.getLocalization('collectibles.item.xp') ?? '',
            String(item.score)
        );
    }

    // AS3: CollectionView.as::addInfoEntry()
    private addInfoEntry(key: string, value: string): void
    {
        const template = this._tab.productInfoEntryTemplate;

        if(template === null) return;

        const entry = template.clone() as IWindowContainer;
        const keyWindow = entry.findChildByName('product_info_key');
        const valueWindow = entry.findChildByName('product_info_value');

        if(keyWindow !== null) keyWindow.caption = key;
        if(valueWindow !== null) valueWindow.caption = value;

        this.productInfoList?.addListItem(entry);
    }

    // AS3: CollectionView.as::clearInfoEntries()
    private clearInfoEntries(): void
    {
        this.productInfoList?.removeListItems();
    }

    // AS3: CollectionView.as::setProductInfoVisible()
    private setProductInfoVisible(visible: boolean): void
    {
        const container = this.productInfoContainer;

        if(container !== null) container.visible = visible;
    }

    // AS3: CollectionView.as::onProductNameUnhover()
    private onProductNameUnhover = (): void =>
    {
        this.setProductInfoVisible(false);
    };

    // AS3: CollectionView.as::onProductNameHover()
    private onProductNameHover = (): void =>
    {
        this.setProductInfoVisible(true);
    };

    // AS3: CollectionView.as::populateGridItems()
    populateGridItems(): void
    {
        this.clearGridItems();

        const template = this._tab.gridItemTemplate;

        if(template === null) return;

        for(const item of this._nftCollection.items)
        {
            const cell = template.clone() as IWindowContainer;
            const renderer = new CollectibleItemRenderer(this._tab.controller, item, cell, this);

            this.itemGrid?.addGridItem(cell);
            this._gridItems.push(renderer);
        }
    }

    // AS3: CollectionView.as::clearGridItems()
    clearGridItems(): void
    {
        for(const item of this._gridItems) item.dispose();

        this._gridItems = [];
        this.itemGrid?.destroyGridItems();
    }

    // AS3: CollectionView.as::get nftCollection()
    get nftCollection(): NftCollection
    {
        return this._nftCollection;
    }

    /**
     * Clicking the selected cell again *deselects* it and returns the panel to the collection view
     * — the only toggle of its kind in this package.
     */
    // AS3: CollectionView.as::selectItem()
    selectItem(item: CollectibleItemRenderer | null): void
    {
        if(item !== null && this._selectedItem === item)
        {
            item.deactivate();
            this._selectedItem = null;
            this.initCollectionPreview();

            return;
        }

        if(this._selectedItem !== null)
        {
            this._selectedItem.deactivate();
            this._selectedItem = null;
        }

        if(item === null)
        {
            this.initCollectionPreview();

            return;
        }

        this._selectedItem = item;
        this._selectedItem.activate();
        this.initMintedItemPreview(item.item);
    }

    // AS3: CollectionView.as::get localization()
    private get localization(): IHabboLocalizationManager | null
    {
        return this._tab.controller.localizationManager;
    }

    // AS3: CollectionView.as::get titleText()
    private get titleText(): ITextWindow | null
    {
        return this._container.findChildByName('collection_name') as ITextWindow | null;
    }

    // AS3: CollectionView.as::get progressColorContainer()
    private get progressColorContainer(): IWindow | null
    {
        return this._container.findChildByName('progress_color');
    }

    // AS3: CollectionView.as::get progressText()
    private get progressText(): ITextWindow | null
    {
        return this._container.findChildByName('progress_text') as ITextWindow | null;
    }

    // AS3: CollectionView.as::get completionContainer()
    private get completionContainer(): IWindowContainer | null
    {
        return this._container.findChildByName('bonus_or_reward_container') as IWindowContainer | null;
    }

    // AS3: CollectionView.as::get completionHeaderContainer()
    private get completionHeaderContainer(): IWindowContainer | null
    {
        return this._container.findChildByName('completion_header_container') as IWindowContainer | null;
    }

    // AS3: CollectionView.as::get completionRewardNameText()
    private get completionRewardNameText(): ITextWindow | null
    {
        return this._container.findChildByName('reward_furni_name') as ITextWindow | null;
    }

    // AS3: CollectionView.as::get completionProgressBar()
    private get completionProgressBar(): IWindow | null
    {
        return this._container.findChildByName('progress_bar');
    }

    // AS3: CollectionView.as::get completionProgressBarPadded()
    private get completionProgressBarPadded(): IWindow | null
    {
        return this._container.findChildByName('progress_padded_bar');
    }

    // AS3: CollectionView.as::get completionProgressBarTop()
    private get completionProgressBarTop(): IWindow | null
    {
        return this._container.findChildByName('progress_bar_top');
    }

    // AS3: CollectionView.as::get completionProgressBarBottom()
    private get completionProgressBarBottom(): IWindow | null
    {
        return this._container.findChildByName('progress_bar_bottom');
    }

    // AS3: CollectionView.as::get completionProgressBarText()
    private get completionProgressBarText(): ITextWindow | null
    {
        return this._container.findChildByName('progress_bar_text') as ITextWindow | null;
    }

    // AS3: CollectionView.as::get claimButton()
    private get claimButton(): IWindow | null
    {
        return this._container.findChildByName('claim_button');
    }

    // AS3: CollectionView.as::get collectionProgressContainer()
    private get collectionProgressContainer(): IWindowContainer | null
    {
        return this._container.findChildByName('collection_progress_container') as IWindowContainer | null;
    }

    // AS3: CollectionView.as::get collectionProgressScoreText()
    private get collectionProgressScoreText(): ITextWindow | null
    {
        return this._container.findChildByName('preview_score_text') as ITextWindow | null;
    }

    // AS3: CollectionView.as::get collectionProgressRewardText()
    private get collectionProgressRewardText(): ITextWindow | null
    {
        return this._container.findChildByName('preview_reward_text') as ITextWindow | null;
    }

    // AS3: CollectionView.as::get placeholderImage()
    private get placeholderImage(): IStaticBitmapWrapperWindow | null
    {
        return this._container.findChildByName('placeholder_image') as IStaticBitmapWrapperWindow | null;
    }

    // AS3: CollectionView.as::get productPreviewBitmap()
    private get productPreviewBitmap(): IBitmapWrapperWindow | null
    {
        return this._container.findChildByName('product_preview') as IBitmapWrapperWindow | null;
    }

    // AS3: CollectionView.as::get productNameContainer()
    private get productNameContainer(): IWindowContainer | null
    {
        return this._container.findChildByName('product_name_container') as IWindowContainer | null;
    }

    // AS3: CollectionView.as::get productNameText()
    private get productNameText(): ITextWindow | null
    {
        return this._container.findChildByName('preview_furni_name') as ITextWindow | null;
    }

    // AS3: CollectionView.as::get productInfoContainer()
    private get productInfoContainer(): IWindowContainer | null
    {
        return this._container.findChildByName('product_info_container') as IWindowContainer | null;
    }

    // AS3: CollectionView.as::get productInfoList()
    private get productInfoList(): IItemListWindow | null
    {
        return this._container.findChildByName('product_info_list') as IItemListWindow | null;
    }

    // AS3: CollectionView.as::get productProgressContainer()
    private get productProgressContainer(): IWindowContainer | null
    {
        return this._container.findChildByName('product_progress_container') as IWindowContainer | null;
    }

    /** `procuct_score_text` — the typo is the layout's, and the window really is named that. */
    // AS3: CollectionView.as::get productProgressScoreText()
    private get productProgressScoreText(): ITextWindow | null
    {
        return this._container.findChildByName('procuct_score_text') as ITextWindow | null;
    }

    // AS3: CollectionView.as::get itemGrid()
    private get itemGrid(): IItemGridWindow | null
    {
        return this._container.findChildByName('itemgrid_collection') as IItemGridWindow | null;
    }

    // AS3: CollectionView.as::get avatarImageWidget()
    private get avatarImageWidget(): IWidgetWindow | null
    {
        return this._container.findChildByName('avatar_image_widget') as IWidgetWindow | null;
    }

    // AS3: CollectionView.as::get badgeImageWidget()
    private get badgeImageWidget(): IWidgetWindow | null
    {
        return this._container.findChildByName('badge_image_widget') as IWidgetWindow | null;
    }

    // AS3: CollectionView.as::get petImageWidget()
    private get petImageWidget(): IWidgetWindow | null
    {
        return this._container.findChildByName('pet_image_widget') as IWidgetWindow | null;
    }

    // AS3: CollectionView.as::get effectImageWidget()
    private get effectImageWidget(): IWidgetWindow | null
    {
        return this._container.findChildByName('effect_image_widget') as IWidgetWindow | null;
    }

    // AS3: CollectionView.as::get unknownImageWindow()
    private get unknownImageWindow(): IStaticBitmapWrapperWindow | null
    {
        return this._container.findChildByName('unknown_image') as IStaticBitmapWrapperWindow | null;
    }

    // AS3: CollectionView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Note what is *not* disposed: `_container` belongs to the tab's layout, not to this view, and
     * a new CollectionView is built over the same container each time a collection is activated.
     * Disposing it would take the panel away permanently.
     */
    // AS3: CollectionView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._previewer.clearPreviewer();
        this._previewer.dispose();

        this.clearInfoEntries();
        this.clearGridItems();

        this.productNameContainer?.removeEventListener(WindowMouseEvent.OVER, this.onProductNameHover);
        this.productNameContainer?.removeEventListener(WindowMouseEvent.OUT, this.onProductNameUnhover);
        this.claimButton?.removeEventListener(WindowMouseEvent.CLICK, this.onClickClaim);

        this._disposed = true;
    }
}
