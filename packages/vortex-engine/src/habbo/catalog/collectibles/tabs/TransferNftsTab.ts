import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IUpdateReceiver} from '@core/runtime';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {NftTransferFeeMessageParser} from '@habbo/communication/messages/parser/collectibles/NftTransferFeeMessageParser';
import type {NftTransferAssetsResultMessageParser} from '@habbo/communication/messages/parser/collectibles/NftTransferAssetsResultMessageParser';
import {NftTransferFeeMessageEvent} from '@habbo/communication/messages/incoming/collectibles/NftTransferFeeMessageEvent';
import {NftTransferAssetsResultMessageEvent} from '@habbo/communication/messages/incoming/collectibles/NftTransferAssetsResultMessageEvent';
import {GetNftTransferFeeComposer} from '@habbo/communication/messages/outgoing/collectibles/GetNftTransferFeeComposer';
import {NftTransferAssetsComposer} from '@habbo/communication/messages/outgoing/collectibles/NftTransferAssetsComposer';

import type {CollectiblesController} from '../CollectiblesController';
import type {CollectiblesView} from '../CollectiblesView';

/**
 * AS3: TransferNftsTab.as::update() reads `CollectionsTab._SafeStr_7248`, which is 90 — degrees per
 * second for the loading spinner. Duplicated here rather than imported, because CollectionsTab is
 * unported; when it lands, this should point at its constant instead.
 */
const LOADING_ICON_ROTATE_SPEED = 90;

/** AS3: TransferNftsTab.as::onSelectWallet() — a wallet address longer than this is elided. */
const WALLET_CAPTION_MAX_LENGTH = 32;

/** AS3: TransferNftsTab.as::initializeTransferWallets() — the dropdown's two background colours. */
const WALLET_SELECTION_COLOR_DISABLED = 13421772;
const WALLET_SELECTION_COLOR_ENABLED = 16777215;

/** AS3: TransferNftsTab.as::onTransferClicked() — the confirmation dialog's title bar. */
const CONFIRM_TITLE_BAR_COLOR = 2763306;

/**
 * The "move my NFTs out" tab: pick an external wallet, pay the silver fee, confirm.
 *
 * Readiness is two independent waits ANDed together — the fee reply and the wallet list — and each
 * clears its own flag, so the spinner runs until both have landed. The transfer button then has
 * four conditions on top of that; see `updateTransferButtonState()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/tabs/TransferNftsTab.as
 */
export class TransferNftsTab implements IUpdateReceiver
{
    // AS3: TransferNftsTab.as::_disposed
    private _disposed: boolean = false;
    // AS3: TransferNftsTab.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];
    // AS3: TransferNftsTab.as::_SafeStr_5556 (the hub view)
    private _view: CollectiblesView | null;
    // AS3: TransferNftsTab.as::_SafeStr_4649 (this tab's container)
    private _container: IWindowContainer | null = null;
    // AS3: TransferNftsTab.as::_SafeStr_4729 (the controller)
    private _controller: CollectiblesController;
    // AS3: TransferNftsTab.as::_SafeStr_7760 (waiting for the fee reply)
    private _waitingForFee: boolean = false;
    // AS3: TransferNftsTab.as::_waitingForAddresses
    private _waitingForAddresses: boolean = false;
    // AS3: TransferNftsTab.as::_SafeStr_7284 (the silver fee)
    private _transferFee: number = 0;
    // AS3: TransferNftsTab.as::_isTransferring
    private _isTransferring: boolean = false;
    // AS3: TransferNftsTab.as::_SafeStr_7644 (the wallet list behind the dropdown)
    private _wallets: string[] | null = null;
    // AS3: TransferNftsTab.as::_loadingIcon
    private _loadingIcon: IStaticBitmapWrapperWindow | null = null;

    // AS3: TransferNftsTab.as::TransferNftsTab()
    constructor(view: CollectiblesView, controller: CollectiblesController)
    {
        this._view = view;
        this._controller = controller;

        this._container = view.window?.findChildByName('transferContainer') as IWindowContainer | null ?? null;

        if(this._container === null) return;

        this._loadingIcon = this._container.findChildByName('loading_icon') as IStaticBitmapWrapperWindow | null;

        this.addMessageEvents();
        this.initializeData();
        this.updateReadyState();
        this.updateTransferButtonState();

        controller.registerUpdateReceiver(this, 1);

        this.transferButton?.addEventListener(WindowMouseEvent.CLICK, this.onTransferClicked as unknown as (...args: unknown[]) => void);
        this.transferWalletSelection?.addEventListener('WE_SELECTED', this.onSelectWallet as unknown as (...args: unknown[]) => void);
    }

    /**
     * Elides a long address into the dropdown's caption. Note the asymmetry, which is AS3's: an
     * address of 32 characters or fewer leaves the caption untouched rather than setting it to the
     * full address, so the dropdown keeps whatever it already displayed.
     */
    // AS3: TransferNftsTab.as::onSelectWallet()
    private onSelectWallet = (): void =>
    {
        const dropdown = this.transferWalletSelection;

        if(dropdown !== null)
        {
            const index = dropdown.selection;

            if(index >= 0)
            {
                const wallet = dropdown.enumerateSelection()[index];

                if(wallet !== undefined && wallet.length > WALLET_CAPTION_MAX_LENGTH)
                {
                    dropdown.caption = `${wallet.substring(0, WALLET_CAPTION_MAX_LENGTH)}...`;
                }
            }
        }

        this.updateReadyState();
    };

    // AS3: TransferNftsTab.as::addMessageEvents()
    private addMessageEvents(): void
    {
        this._messageEvents = [
            new NftTransferFeeMessageEvent(this.onNftTransferFeeMessage),
            new NftTransferAssetsResultMessageEvent(this.onNftTransferResultMessage),
        ];

        for(const event of this._messageEvents) this._controller.addMessageEvent(event);
    }

    /** A zero fee hides both the number and the silver icon rather than showing "0". */
    // AS3: TransferNftsTab.as::onNftTransferFeeMessage()
    private onNftTransferFeeMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as NftTransferFeeMessageParser | null;

        if(parser === null) return;

        this._waitingForFee = false;
        this._transferFee = parser.transferFee;

        const text = this.silverFeeText;
        const icon = this.silverIcon;

        if(text !== null)
        {
            text.text = String(this._transferFee);
            text.visible = this._transferFee > 0;
        }

        if(icon !== null) icon.visible = this._transferFee > 0;

        this.updateReadyState();
        this.updateTransferButtonState();
    };

    // AS3: TransferNftsTab.as::updateReadyState()
    private updateReadyState(): void
    {
        const loaded = this.loadedContainer;
        const loading = this.loadingContainer;

        if(loaded !== null) loaded.visible = this.isReady;
        if(loading !== null) loading.visible = !this.isReady;
    }

    /**
     * Four conditions, all of which must hold: the fee is affordable, a Stardust wallet exists to
     * transfer *from*, no transfer is already in flight, and a destination is selected.
     *
     * AS3 reads `catalog.getPurse().silverBalance` unguarded. With no catalog the port treats the
     * balance as 0, which fails the affordability test — the safe direction, since the alternative
     * is offering a transfer the player may not be able to pay for.
     */
    // AS3: TransferNftsTab.as::updateTransferButtonState()
    private updateTransferButtonState(): void
    {
        const silverBalance = this._controller.catalog?.getPurse().silverBalance ?? 0;
        const canAfford = this._transferFee <= silverBalance;
        const stardust = this._view?.stardustWallet ?? '';
        const hasStardustWallet = stardust !== '';
        const notTransferring = !this._isTransferring;
        const hasDestination = this.selectedWallet !== null;

        if(canAfford && hasStardustWallet && notTransferring && hasDestination)
        {
            this.transferButton?.enable();
        }
        else
        {
            this.transferButton?.disable();
        }
    }

    // AS3: TransferNftsTab.as::onSilverBalanceUpdated()
    onSilverBalanceUpdated(): void
    {
        this.updateTransferButtonState();
    }

    /**
     * The button is disabled on click and re-evaluated after the dialog closes — so cancelling
     * restores it, because `updateTransferButtonState()` runs on both branches of the confirm.
     */
    // AS3: TransferNftsTab.as::onTransferClicked()
    private onTransferClicked = (): void =>
    {
        this.transferButton?.disable();

        const dialog = this._controller.windowManager?.confirm(
            '${collectibles.transfer}',
            '${collectibles.transfer.confirm}',
            0,
            this.onTransferConfirm
        ) ?? null;

        if(dialog !== null) dialog.titleBarColor = CONFIRM_TITLE_BAR_COLOR;
    };

    // AS3: TransferNftsTab.as::onTransferConfirm()
    private onTransferConfirm = (dialog: IDisposable, event: WindowEvent): void =>
    {
        dialog.dispose();

        if(event.type === 'WE_OK')
        {
            const wallet = this.selectedWallet;

            if(wallet !== null)
            {
                this._isTransferring = true;
                this._controller.send(new NftTransferAssetsComposer(wallet));
            }
        }

        this.updateTransferButtonState();
    };

    // AS3: TransferNftsTab.as::onNftTransferResultMessage()
    private onNftTransferResultMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as NftTransferAssetsResultMessageParser | null;

        if(parser === null) return;

        const text = parser.success
            ? this.localization?.getLocalization('collectibles.transfer.success') ?? ''
            : this.localization?.getLocalizationWithParams(
                'collectibles.transfer.error', '', 'id', String(parser.resultCode)
            ) ?? '';

        this._controller.notifications?.addItem(text, 'info', 'icon_curator_stamp_large_png');

        this._isTransferring = false;
        this.updateTransferButtonState();
    };

    /** The hub hands this tab the non-Stardust wallets only — you cannot transfer to your own. */
    // AS3: TransferNftsTab.as::onWalletsAddressesUpdated()
    onWalletsAddressesUpdated(wallets: string[]): void
    {
        this.initializeTransferWallets(wallets);
    }

    // AS3: TransferNftsTab.as::initializeTransferWallets()
    private initializeTransferWallets(wallets: string[]): void
    {
        const dropdown = this.transferWalletSelection;

        dropdown?.populateWithStrings(wallets);

        this._wallets = wallets;

        if(dropdown !== null)
        {
            if(wallets.length === 0)
            {
                dropdown.color = WALLET_SELECTION_COLOR_DISABLED;
                dropdown.disable();
            }
            else
            {
                dropdown.color = WALLET_SELECTION_COLOR_ENABLED;
                dropdown.enable();
                dropdown.selection = 0;
            }
        }

        this._waitingForAddresses = false;

        this.updateReadyState();
        this.updateTransferButtonState();
    }

    // AS3: TransferNftsTab.as::get selectedWallet()
    private get selectedWallet(): string | null
    {
        if(this._wallets === null) return null;

        const index = this.transferWalletSelection?.selection ?? -1;

        if(index < 0 || index >= this._wallets.length) return null;

        return this._wallets[index];
    }

    /**
     * The wallet list may already be loaded — the hub requests it once for all tabs — so this uses
     * whatever is there and only waits if it is not. The fee is always requested.
     */
    // AS3: TransferNftsTab.as::initializeData()
    private initializeData(): void
    {
        this._waitingForFee = true;
        this._controller.send(new GetNftTransferFeeComposer());

        // AS3 reads `view.walletAddresses` here — *all* wallets, not the non-Stardust subset that
        // `onWalletsAddressesUpdated()` later receives. Kept: the first population can therefore
        // include the Stardust wallet, and the next wallet message replaces it.
        const wallets = this._view?.walletAddresses ?? null;

        if(wallets !== null) this.initializeTransferWallets(wallets);

        this._waitingForAddresses = wallets === null;
    }

    // AS3: TransferNftsTab.as::get isReady()
    private get isReady(): boolean
    {
        return !this._waitingForAddresses && !this._waitingForFee;
    }

    // AS3: TransferNftsTab.as::get localization()
    private get localization(): IHabboLocalizationManager | null
    {
        return this._controller.localizationManager;
    }

    // AS3: TransferNftsTab.as::removeMessageEvents()
    private removeMessageEvents(): void
    {
        for(const event of this._messageEvents) this._controller.removeMessageEvent(event);

        this._messageEvents = [];
    }

    // AS3: TransferNftsTab.as::update()
    update(elapsedMs: number): void
    {
        if(this.isReady || this._loadingIcon === null) return;

        this._loadingIcon.rotation += LOADING_ICON_ROTATE_SPEED * (elapsedMs / 1000);
        this._loadingIcon.rotation %= 360;
        this._loadingIcon.invalidate();
    }

    // AS3: TransferNftsTab.as::get loadingContainer()
    private get loadingContainer(): IWindowContainer | null
    {
        return this._container?.findChildByName('loading_contents') as IWindowContainer | null ?? null;
    }

    // AS3: TransferNftsTab.as::get loadedContainer()
    private get loadedContainer(): IWindowContainer | null
    {
        return this._container?.findChildByName('loaded_content') as IWindowContainer | null ?? null;
    }

    // AS3: TransferNftsTab.as::get silverFeeText()
    private get silverFeeText(): ITextWindow | null
    {
        return this._container?.findChildByName('transfer_fee_text') as ITextWindow | null ?? null;
    }

    // AS3: TransferNftsTab.as::get transferButton()
    private get transferButton(): IWindow | null
    {
        return this._container?.findChildByName('transfer_button') ?? null;
    }

    // AS3: TransferNftsTab.as::get transferWalletSelection()
    private get transferWalletSelection(): IDropMenuWindow | null
    {
        return this._container?.findChildByName('transfer_wallet_selection') as IDropMenuWindow | null ?? null;
    }

    // AS3: TransferNftsTab.as::get silverIcon()
    private get silverIcon(): IStaticBitmapWrapperWindow | null
    {
        return this._container?.findChildByName('transfer_fee_icon') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: TransferNftsTab.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: TransferNftsTab.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this.removeMessageEvents();

        // AS3 leaves both listeners attached; the port removes them, as its sibling tab does.
        this.transferButton?.removeEventListener(WindowMouseEvent.CLICK, this.onTransferClicked as unknown as (...args: unknown[]) => void);
        this.transferWalletSelection?.removeEventListener('WE_SELECTED', this.onSelectWallet as unknown as (...args: unknown[]) => void);

        this._controller.removeUpdateReceiver(this);

        this._container = null;
        this._loadingIcon = null;
        this._view = null;
    }
}
