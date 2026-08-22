import type {WiredTradingModel} from './WiredTradingModel';
import type {IWiredTradingView} from './IWiredTradingView';
import type {IInventoryView} from '../IInventoryView';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IAssetLibrary} from '@core/assets';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {TradingView} from '../trading/TradingView';
import {ItemPopupCtrl} from '../ItemPopupCtrl';
import {CreditTradingItem} from '../items/CreditTradingItem';
import {FurnitureCategory} from '../enum';
import {Util} from '../Util';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.inventory.wired_trading.WiredTradingView');

/**
 * The wired-trading tab: your offer on one side, the wired machine's on the other.
 *
 * It is the trading window's sibling, and deliberately so — the layout is a second copy of the
 * trading one and the grids are filled by `TradingView`'s own static. Three things separate it
 * from a player-to-player trade:
 *
 * - **the other side has no user.** It is a wired furni, so there is no "they accepted" state and
 *   no name to show; the machine's half is either an offer grid or a payment placeholder.
 * - **it can be a payment rather than a trade.** `isPayment()` swaps the arrow between the two
 *   sides for a one-way icon and hides the offer grid behind a per-layout payment image.
 * - **it expires.** `secondsLeft` counts down in the header and the trade dies at zero, which is
 *   what the second timer here drives.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/WiredTradingView.as
 */
export class WiredTradingView implements IWiredTradingView, IInventoryView
{
    // AS3: WiredTradingView.as::_SafeStr_4570
    private _model: WiredTradingModel | null;

    // AS3: WiredTradingView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: WiredTradingView.as::_localization
    private _localization: IHabboLocalizationManager | null;

    // AS3: WiredTradingView.as::_roomEngine
    private _roomEngine: IRoomEngine | null;

    // AS3: WiredTradingView.as::_SafeStr_5517 (the asset library)
    private _assets: IAssetLibrary | null;

    // AS3: WiredTradingView.as::_soundManager
    private _soundManager: IHabboSoundManager | null;

    // AS3: WiredTradingView.as::_SafeStr_6090
    private _itemPopup: ItemPopupCtrl | null = null;

    // AS3: WiredTradingView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: WiredTradingView.as::_SafeStr_4902 (the three-second confirm countdown)
    // TS-only shape: AS3 uses a `flash.utils.Timer` with `repeatCount`; here it is an interval
    // plus the tick counter that `Timer.currentCount` provided.
    private _confirmTimer: ReturnType<typeof setInterval> | null = null;
    private _confirmTick: number = 0;

    // AS3: WiredTradingView.as::_SafeStr_5313 (the one-second expiry clock)
    private _secondsLeftTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: WiredTradingView.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredTradingView.as::WiredTradingView()
    constructor(
        model: WiredTradingModel,
        windowManager: IHabboWindowManager | null,
        assets: IAssetLibrary | null,
        roomEngine: IRoomEngine | null,
        localization: IHabboLocalizationManager | null,
        soundManager: IHabboSoundManager | null
    )
    {
        this._model = model;
        this._windowManager = windowManager;
        this._localization = localization;
        this._assets = assets;
        this._roomEngine = roomEngine;
        this._soundManager = soundManager;

        const popupWindow = windowManager?.buildWidgetLayout('item_popup_xml') as IWindowContainer | null;

        if(popupWindow !== null)
        {
            popupWindow.visible = false;
            this._itemPopup = new ItemPopupCtrl(popupWindow, assets, windowManager, model.getInventory());
        }

        this.createWindow();
    }

    /**
     * Builds the window and wires both grids.
     *
     * Every cell carries its own index as `id`, which is what the thumb handlers read to address
     * the model — the grid is a fixed set of tiles, not a list that grows.
     */
    // AS3: WiredTradingView.as::createWindow()
    private createWindow(): void
    {
        const window = this._windowManager?.buildWidgetLayout('inventory_trading_wired_xml') as IWindowContainer | null;

        if(window == null)
        {
            log.warn('inventory_trading_wired_xml did not build - the wired-trading tab has no contents');

            return;
        }

        // By tag, not by name: the two grids are `item_grid_0`/`item_grid_1` but AS3 finds them
        // through the tags the layout puts on them here.
        this.prepareGrid(window.findChildByTag('OWN_USER_GRID') as unknown as IItemGridWindow | null, this.ownThumbEventProc);
        this.prepareGrid(window.findChildByTag('OTHER_USER_GRID') as unknown as IItemGridWindow | null, this.othersThumbEventProc);

        this._window = window;

        this.acceptButton?.addEventListener('WME_CLICK', this.onAcceptClick);
        this.cancelButton?.addEventListener('WME_CLICK', this.onCancelClick);

        const secondsLeft = this.secondsLeftText;

        if(secondsLeft !== null) secondsLeft.visible = false;
    }

    // AS3: WiredTradingView.as::createWindow() — the per-grid half, written twice there.
    private prepareGrid(grid: IItemGridWindow | null, procedure: (event: WindowEvent, window: IWindow) => void): void
    {
        if(grid === null) return;

        for(let i = 0; i < grid.numGridItems; i++)
        {
            const gridItem = grid.getGridItemAt(i);

            if(gridItem === null) continue;

            gridItem.id = i;
            gridItem.procedure = procedure;
            gridItem.addEventListener('WME_OVER', procedure);
            gridItem.addEventListener('WME_OUT', procedure);
        }
    }

    // AS3: WiredTradingView.as::onCancelClick()
    private onCancelClick = (): void =>
    {
        this._model?.requestCancelTrading();
    };

    /**
     * One button for two jobs: it accepts while items are being added, and confirms once both
     * sides are locked. The three-second countdown between them starts here.
     */
    // AS3: WiredTradingView.as::onAcceptClick()
    private onAcceptClick = (): void =>
    {
        const model = this._model;

        if(model === null) return;

        if(model.state === WiredTradingView.STATE_ADDING_ITEMS)
        {
            if(model.requestAccept()) this.startConfirmCountdown();
        }
        else if(model.state === WiredTradingView.STATE_CONFIRMING)
        {
            model.requestConfirm();
        }
    };

    // AS3: WiredTradingView.as::updateAllUI()
    updateAllUI(): void
    {
        this.updateUI();
        this.updateItemList(false);
        this.updateItemList(true);
        this.updateStateUI();
        this.updateOfferInfoUI();
    }

    /**
     * The half of the window that depends on *what kind* of transaction this is rather than on how
     * far along it is.
     */
    // AS3: WiredTradingView.as::updateUI()
    updateUI(): void
    {
        const model = this._model;

        if(model === null) return;

        const accept = this.acceptButton;

        if(accept !== null) Util.disableButton(accept, !model.canAccept);

        const isPayment = model.isPayment();
        const splitter = this.tradeTypeSplitter;

        if(splitter !== null)
        {
            splitter.assetUri = isPayment
                ? 'inventory_trading_trading_arrow_icon'
                : 'inventory_trading_trading_split_icon';
        }

        if(isPayment)
        {
            const paymentImage = this.paymentLayoutImage;

            if(paymentImage !== null) paymentImage.assetUri = `wired_chests_images_${model.paymentLayoutType}_payments`;
        }

        const offerings = this.wiredOfferings;
        const placeholder = this.wiredPaymentPlaceholder;

        if(offerings !== null) offerings.visible = !isPayment;
        if(placeholder !== null) placeholder.visible = isPayment;
    }

    // AS3: WiredTradingView.as::tradeStateUpdated()
    tradeStateUpdated(): void
    {
        this.updateStateUI();
    }

    /**
     * The padlock, the note and the button caption, for each of the five states.
     *
     * `STATE_COUNTDOWN` leaves the caption as the raw localization key `${inventory.trading.countdown}`
     * — that key carries a `counter` parameter the confirm timer rewrites every second, and the
     * window re-resolves it on each repaint, which is how the button counts down in place.
     */
    // AS3: WiredTradingView.as::updateStateUI()
    private updateStateUI(): void
    {
        const model = this._model;
        const accept = this.acceptButton;
        const info = this.infoText;

        if(model === null) return;

        const type = model.tradeTypeLocalization.toLowerCase();
        const lock = this.lockIcon;

        if(lock !== null)
        {
            lock.assetUri = (model.state === WiredTradingView.STATE_ADDING_ITEMS || model.state === WiredTradingView.STATE_READY)
                ? 'inventory_trading_trading_unlocked_icon'
                : 'inventory_trading_trading_locked_icon';
        }

        if(model.state === WiredTradingView.STATE_ADDING_ITEMS)
        {
            if(info !== null) info.text = this._localization?.getLocalizationWithParams('inventory.wired_trading.note.add_items', '', 'type', type) ?? '';
            if(accept !== null) accept.caption = this._localization?.getLocalization('inventory.trading.accept') ?? '';
        }
        else if(model.state === WiredTradingView.STATE_COUNTDOWN)
        {
            if(info !== null) info.text = this._localization?.getLocalization('inventory.wired_trading.note.countdown') ?? '';

            if(accept !== null)
            {
                accept.caption = '${inventory.trading.countdown}';
                accept.disable();
            }
        }
        else if(model.state === WiredTradingView.STATE_CONFIRMING || model.state === WiredTradingView.STATE_CONFIRMED)
        {
            if(info !== null) info.text = this._localization?.getLocalizationWithParams('inventory.wired_trading.note.verify', '', 'type', type) ?? '';

            if(accept !== null)
            {
                accept.caption = this._localization?.getLocalization('inventory.trading.confirm') ?? '';

                if(model.state === WiredTradingView.STATE_CONFIRMED) accept.disable();
                else accept.enable();
            }
        }
    }

    /**
     * The expiry clock, shown only inside the last two minutes.
     *
     * The minute split is integer division, and the seconds are zero-padded — AS3 pads only the
     * seconds, so "1:05" is right and "01:05" would not be.
     */
    // AS3: WiredTradingView.as::updateSecondsLeftUI()
    private updateSecondsLeftUI(): void
    {
        const text = this.secondsLeftText;

        if(text === null || this._model === null) return;

        const secondsLeft = this._model.secondsLeft;

        if(secondsLeft < 0 || secondsLeft >= 120)
        {
            text.visible = false;

            return;
        }

        text.visible = true;

        const minutes = Math.trunc(secondsLeft / 60);
        const seconds = secondsLeft - minutes * 60;

        text.text = this._localization?.getLocalizationWithParams(
            'inventory.wired_trading.seconds_left',
            '',
            'seconds', seconds < 10 ? `0${seconds}` : String(seconds),
            'minutes', String(minutes)
        ) ?? '';
    }

    /**
     * Three seconds between accepting and being allowed to confirm.
     *
     * The counter is written into the localization *parameter* rather than into the caption, so
     * the button re-renders itself from `${inventory.trading.countdown}` each tick.
     */
    // AS3: WiredTradingView.as::startConfirmCountdown()
    startConfirmCountdown(): void
    {
        this.stopConfirmCountdown();

        this._confirmTick = 0;
        this._windowManager?.registerLocalizationParameter('inventory.trading.countdown', 'counter', '3');

        this._confirmTimer = setInterval(() => this.onConfirmTimer(), 1000);
    }

    // AS3: WiredTradingView.as::timerEventHandler()
    private onConfirmTimer(): void
    {
        this._confirmTick++;

        this._windowManager?.registerLocalizationParameter(
            'inventory.trading.countdown', 'counter', String(3 - this._confirmTick)
        );

        if(this._confirmTick < 3) return;

        this._model?.confirmCountdownReady();
        this.stopConfirmCountdown();
        this.acceptButton?.enable();
    }

    // TS-only: AS3's `Timer.reset()` covers both stopping and rewinding; two calls here.
    private stopConfirmCountdown(): void
    {
        if(this._confirmTimer === null) return;

        clearInterval(this._confirmTimer);

        this._confirmTimer = null;
        this._confirmTick = 0;
    }

    // AS3: WiredTradingView.as::startSecondsLeftTimer()
    startSecondsLeftTimer(): void
    {
        this.stopSecondsLeftTimer();

        this._secondsLeftTimer = setInterval(() => this.onSecondsLeftTimer(), 1000);

        this.updateSecondsLeftUI();
    }

    // AS3: WiredTradingView.as::stopSecondsLeftTimer()
    stopSecondsLeftTimer(): void
    {
        if(this._secondsLeftTimer === null) return;

        clearInterval(this._secondsLeftTimer);

        this._secondsLeftTimer = null;
    }

    // AS3: WiredTradingView.as::onSecondsLeftTimer()
    private onSecondsLeftTimer(): void
    {
        this.updateSecondsLeftUI();

        if((this._model?.secondsLeft ?? 0) <= 0) this.stopSecondsLeftTimer();
    }

    // AS3: WiredTradingView.as::updateItemList()
    updateItemList(isOwnUser: boolean): void
    {
        const model = this._model;

        if(model === null) return;

        TradingView.updateItemsGrid(
            isOwnUser ? this.yourItemGrid : this.wiredItemGrid,
            isOwnUser ? model.ownUserItems : model.wiredItems
        );

        this.updateOfferInfoUI();
    }

    // AS3: WiredTradingView.as::updateOfferInfoUI()
    updateOfferInfoUI(): void
    {
        const model = this._model;
        const localization = this._localization;

        if(model === null || localization === null) return;

        const yourItems = this.yourItemCountText;
        const wiredItems = this.wiredItemCountText;
        const yourCredits = this.yourCreditCountText;
        const wiredCredits = this.wiredCreditCountText;

        if(yourItems !== null) yourItems.text = localization.getLocalizationWithParams('inventory.trading.info.itemcount', '', 'value', String(model.ownUserNumItems));
        if(wiredItems !== null) wiredItems.text = localization.getLocalizationWithParams('inventory.trading.info.itemcount', '', 'value', String(model.wiredNumItems));
        if(yourCredits !== null) yourCredits.text = localization.getLocalizationWithParams('inventory.trading.info.creditvalue', '', 'value', String(model.ownUserNumCredits));
        if(wiredCredits !== null) wiredCredits.text = localization.getLocalizationWithParams('inventory.trading.info.creditvalue', '', 'value', String(model.wiredNumCredits));
    }

    // AS3: WiredTradingView.as::ownThumbEventProc()
    private ownThumbEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        this.thumbEventProc(event, window, true);
    };

    // AS3: WiredTradingView.as::othersThumbEventProc()
    private othersThumbEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        this.thumbEventProc(event, window, false);
    };

    /**
     * Click removes one of your own tiles; hover opens the tooltip beside either side's.
     *
     * AS3 shares `TradingView.thumbEventProc()` here, and calls it *without* its two optional
     * trailing arguments — the NFT maps and the sound manager. So a wired offer has no NFT tiles
     * and a Trax disc shows its furniture name rather than the song's, in AS3 too. This is the
     * same method with those two branches left out rather than stubbed.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingView.as::thumbEventProc()
    private thumbEventProc(event: WindowEvent, window: IWindow, isOwnUser: boolean): void
    {
        const model = this._model;

        if(isOwnUser && event.type === 'WME_CLICK') model?.requestRemoveItemFromTrading(window.id);

        if(event.type === 'WME_OUT')
        {
            this._itemPopup?.hideDelayed();

            return;
        }

        if(event.type !== 'WME_OVER' || model === null || this._itemPopup === null) return;

        const groupItem = (isOwnUser ? model.ownUserItems : model.wiredItems).getWithIndex(window.id);

        if(groupItem === null) return;

        // The credits tile carries its own text and icon rather than resolving furni data, and only
        // the *other* side's is described — your own credits need no explaining.
        if(groupItem instanceof CreditTradingItem)
        {
            if(!isOwnUser)
            {
                this._itemPopup.updateContent(
                    window as unknown as IWindowContainer,
                    groupItem.getItemTooltipText(),
                    groupItem.getItemIcon(),
                    null,
                    null,
                    ItemPopupCtrl.LOCATION_RIGHT,
                    false
                );
                this._itemPopup.show();
            }

            return;
        }

        const item = groupItem.peek();

        if(item === null) return;

        const inventory = model.getInventory();
        let name = item.isWallItem ? `\${wallItem.name.${item.type}}` : `\${roomItem.name.${item.type}}`;

        if(item.category === FurnitureCategory.POSTER)
        {
            name = `\${poster_${item.stuffData?.getLegacyString() ?? ''}_name}`;
        }

        if(item.category === FurnitureCategory.ECOTRON_BOX)
        {
            const created = new Date(item.creationYear, item.creationMonth - 1, item.creationDay);

            name = `${this._localization?.getLocalization(`roomItem.name.${item.type}`) ?? ''} ${created.toLocaleDateString()}`;
        }

        this._itemPopup.updateContent(
            window as unknown as IWindowContainer,
            name,
            inventory?.getItemImage(item) ?? null,
            null,
            item.stuffData,
            ItemPopupCtrl.LOCATION_RIGHT,
            false
        );
        this._itemPopup.show();
    }

    /**
     * Why the trade ended.
     *
     * Failure type 0 is silent: it is the "you cancelled it yourself" code, and the player does not
     * need an alert telling them what they just did.
     */
    // AS3: WiredTradingView.as::alertTradeCancelled()
    alertTradeCancelled(transactionFailureTypeId: number): void
    {
        if(transactionFailureTypeId === WiredTradingView.TRANSACTION_FAILURE_NONE) return;

        const localization = this._localization;
        const title = localization?.getLocalization('wired_transactions.notification.fail.popup.title') ?? '';
        const reason = localization?.getLocalization(`wired_transactions.notification.fail.${transactionFailureTypeId}`) ?? '';
        const body = localization?.getLocalizationWithParams('wired_transactions.notification.fail', '', 'reason', reason) ?? '';

        this._windowManager?.alert(title, body, 0, null);
    }

    // AS3: WiredTradingView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: WiredTradingView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredTradingModel.as::STATE_READY — read here rather than imported, because importing
    // the model would close a cycle (the model constructs this view).
    private static readonly STATE_READY: number = 0;
    private static readonly STATE_ADDING_ITEMS: number = 1;
    private static readonly STATE_COUNTDOWN: number = 2;
    private static readonly STATE_CONFIRMING: number = 3;
    private static readonly STATE_CONFIRMED: number = 4;

    // AS3: WiredTradingModel.as::_SafeStr_10342 — the "no failure" code, `0`.
    private static readonly TRANSACTION_FAILURE_NONE: number = 0;

    // AS3: WiredTradingView.as::get infoText()
    private get infoText(): ITextWindow | null
    {
        return (this._window?.findChildByName('info_text') as unknown as ITextWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get tradeTypeSplitter()
    private get tradeTypeSplitter(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('trade_type_splitter') as unknown as IStaticBitmapWrapperWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get lockIcon()
    private get lockIcon(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('lock_0') as unknown as IStaticBitmapWrapperWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get acceptButton()
    private get acceptButton(): IWindow | null
    {
        return this._window?.findChildByName('button_accept') ?? null;
    }

    // AS3: WiredTradingView.as::get cancelButton()
    private get cancelButton(): IWindow | null
    {
        return this._window?.findChildByName('button_cancel') ?? null;
    }

    // AS3: WiredTradingView.as::get requirementsButton()
    // Nothing reads it here yet — the requirements panel is its own view — but it is the window
    // that opens it, and AS3 exposes it for that.
    public get requirementsButton(): IWindow | null
    {
        return this._window?.findChildByName('requirements_button') ?? null;
    }

    // AS3: WiredTradingView.as::get yourItemGrid()
    private get yourItemGrid(): IItemGridWindow | null
    {
        return (this._window?.findChildByName('item_grid_0') as unknown as IItemGridWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get yourItemCountText()
    private get yourItemCountText(): ITextWindow | null
    {
        return (this._window?.findChildByName('content_text_1_a') as unknown as ITextWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get yourCreditCountText()
    private get yourCreditCountText(): ITextWindow | null
    {
        return (this._window?.findChildByName('content_text_1_b') as unknown as ITextWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get wiredOfferings()
    private get wiredOfferings(): IWindow | null
    {
        return this._window?.findChildByName('offers_1') ?? null;
    }

    // AS3: WiredTradingView.as::get wiredPaymentPlaceholder()
    private get wiredPaymentPlaceholder(): IWindow | null
    {
        return this._window?.findChildByName('offers_1_payment_placeholder') ?? null;
    }

    // AS3: WiredTradingView.as::get paymentLayoutImage()
    private get paymentLayoutImage(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('payment_layout_image') as unknown as IStaticBitmapWrapperWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get wiredItemGrid()
    private get wiredItemGrid(): IItemGridWindow | null
    {
        return (this._window?.findChildByName('item_grid_1') as unknown as IItemGridWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get wiredItemCountText()
    private get wiredItemCountText(): ITextWindow | null
    {
        return (this._window?.findChildByName('content_text_2_a') as unknown as ITextWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get wiredCreditCountText()
    private get wiredCreditCountText(): ITextWindow | null
    {
        return (this._window?.findChildByName('content_text_2_b') as unknown as ITextWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::get secondsLeftText()
    private get secondsLeftText(): ITextWindow | null
    {
        return (this._window?.findChildByName('seconds_left_text') as unknown as ITextWindow | null) ?? null;
    }

    // AS3: WiredTradingView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.stopConfirmCountdown();
        this.stopSecondsLeftTimer();

        this._window?.dispose();
        this._window = null;
        this._model = null;
        this._windowManager = null;
        this._localization = null;
        this._roomEngine = null;
        this._assets = null;
        this._soundManager = null;

        this._itemPopup?.dispose();
        this._itemPopup = null;

        this._disposed = true;
    }
}
