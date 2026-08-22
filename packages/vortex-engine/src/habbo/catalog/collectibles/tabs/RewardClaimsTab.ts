import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IUpdateReceiver} from '@core/runtime';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {NftClaim} from '@habbo/communication/messages/parser/collectibles/NftClaim';
import type {NftClaimsMessageParser} from '@habbo/communication/messages/parser/collectibles/NftClaimsMessageParser';
import type {NftClaimResultMessageParser} from '@habbo/communication/messages/parser/collectibles/NftClaimResultMessageParser';
import {NftClaimsMessageEvent} from '@habbo/communication/messages/incoming/collectibles/NftClaimsMessageEvent';
import {NftClaimResultMessageEvent} from '@habbo/communication/messages/incoming/collectibles/NftClaimResultMessageEvent';
import {GetNftClaimsComposer} from '@habbo/communication/messages/outgoing/collectibles/GetNftClaimsComposer';
import {ClaimNftClaimsComposer} from '@habbo/communication/messages/outgoing/collectibles/ClaimNftClaimsComposer';

import type {CollectiblesController} from '../CollectiblesController';
import type {CollectiblesView} from '../CollectiblesView';
import {RewardCollectibleItemRenderer} from '../renderer/RewardCollectibleItemRenderer';

/**
 * The "claim your rewards" tab: everything the player is owed across all their wallets, and one
 * button that claims the lot.
 *
 * The wallet queue is the interesting part. The server answers one wallet per request, so
 * `requestClaimsForWallet()` pushes onto a queue and a 600 ms timer drains it one at a time —
 * `_isRequestInProgress` gates the next send until the previous answer lands, and the timer stops
 * only once the queue is empty. Claims accumulate across those replies rather than replacing each
 * other, which is why `onNftClaimsMessage()` appends and never clears.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/tabs/RewardClaimsTab.as
 */
export class RewardClaimsTab implements IUpdateReceiver
{
    /**
    * AS3: RewardClaimsTab.as::update() reads `CollectionsTab._SafeStr_7248`, which is 90 — degrees per
    * second for the loading spinner. Duplicated here rather than imported, because CollectionsTab is
    * unported; when it lands, this should point at its constant instead.
    */
    private static readonly LOADING_ICON_ROTATE_SPEED = 90;

    /**
    * AS3: RewardClaimsTab.as — one wallet is queried every 600 ms, not all at once.
    */
    private static readonly WALLET_REQUEST_INTERVAL_MS = 600;

    // AS3: RewardClaimsTab.as::_disposed
    private _disposed: boolean = false;
    // AS3: RewardClaimsTab.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];
    // AS3: RewardClaimsTab.as::_SafeStr_5556 (the hub view)
    private _view: CollectiblesView | null;
    // AS3: RewardClaimsTab.as::_SafeStr_4649 (this tab's container)
    private _container: IWindowContainer | null = null;
    // AS3: RewardClaimsTab.as::_SafeStr_4729 (the controller)
    private _controller: CollectiblesController;
    // AS3: RewardClaimsTab.as::_SafeStr_5510 (the claims list)
    private _itemList: IItemListWindow | null = null;
    // AS3: RewardClaimsTab.as::_listItems
    private _listItems: RewardCollectibleItemRenderer[] = [];
    // AS3: RewardClaimsTab.as::_SafeStr_7033 (the row template)
    private _rowTemplate: IWindow | null = null;
    // AS3: RewardClaimsTab.as::_SafeStr_5861 (from `get isReady()`)
    private _isReady: boolean = false;
    // AS3: RewardClaimsTab.as::_SafeStr_8248 (a claim-all is in flight)
    private _claimInFlight: boolean = false;
    // AS3: RewardClaimsTab.as::_SafeStr_7414 (the pending wallet queue)
    private _pendingWallets: string[] = [];
    // AS3: RewardClaimsTab.as::_SafeStr_6605 (the 600 ms drain timer)
    private _requestTimer: ReturnType<typeof setInterval> | null = null;
    // AS3: RewardClaimsTab.as::_isRequestInProgress
    private _isRequestInProgress: boolean = false;
    // AS3: RewardClaimsTab.as::_loadingIcon
    private _loadingIcon: IStaticBitmapWrapperWindow | null = null;

    // AS3: RewardClaimsTab.as::RewardClaimsTab()
    constructor(view: CollectiblesView, controller: CollectiblesController)
    {
        this._view = view;
        this._controller = controller;

        this._container = view.window?.findChildByName('rewardsContainer') as IWindowContainer | null ?? null;

        if(this._container === null) return;

        this._loadingIcon = this._container.findChildByName('loading_icon') as IStaticBitmapWrapperWindow | null;
        this._itemList = this._container.findChildByName('itemlist') as IItemListWindow | null;

        // The layout's `item_template` entry is a prototype, taken out of the list and cloned per
        // row — the same pattern the daily-tasks board uses.
        const template = this._itemList?.getListItemByName('item_template') ?? null;

        if(template !== null) this._rowTemplate = this._itemList?.removeListItem(template) ?? null;

        this.setReady(false);
        this.addMessageEvents();
        this.updateClaimButtonState();

        controller.registerUpdateReceiver(this, 1);

        this.claimButton?.addEventListener(WindowMouseEvent.CLICK, this.onClaimClicked as unknown as (...args: unknown[]) => void);
    }

    // AS3: RewardClaimsTab.as::addMessageEvents()
    private addMessageEvents(): void
    {
        this._messageEvents = [
            new NftClaimsMessageEvent(this.onNftClaimsMessage),
            new NftClaimResultMessageEvent(this.onNftClaimResultMessage),
        ];

        for(const event of this._messageEvents) this._controller.addMessageEvent(event);
    }

    // AS3: RewardClaimsTab.as::onWalletsAddressesUpdated()
    onWalletsAddressesUpdated(wallets: string[]): void
    {
        this.requestRewardClaims(wallets);
    }

    // AS3: RewardClaimsTab.as::requestRewardClaims()
    private requestRewardClaims(wallets: string[]): void
    {
        for(const wallet of wallets) this.requestClaimsForWallet(wallet);
    }

    // AS3: RewardClaimsTab.as::requestClaimsForWallet()
    private requestClaimsForWallet(wallet: string): void
    {
        this._pendingWallets.push(wallet);

        if(this._requestTimer === null)
        {
            this._requestTimer = setInterval(this.processNextRequest, RewardClaimsTab.WALLET_REQUEST_INTERVAL_MS);
        }
    }

    // AS3: RewardClaimsTab.as::processNextRequest()
    private processNextRequest = (): void =>
    {
        if(this._isRequestInProgress || this._pendingWallets.length === 0) return;

        const wallet = this._pendingWallets.shift();

        if(wallet === undefined) return;

        this._controller.send(new GetNftClaimsComposer(wallet));
        this._isRequestInProgress = true;
    };

    // AS3: RewardClaimsTab.as::updateClaimButtonState()
    private updateClaimButtonState(): void
    {
        const hasItems = this._itemList !== null && this._itemList.numListItems > 0;
        const idle = !this._claimInFlight && !this._isRequestInProgress;

        if(hasItems && idle)
        {
            this.claimButton?.enable();
        }
        else
        {
            this.claimButton?.disable();
        }
    }

    /** Claims *everything*: the composer carries no ids, both its strings default to empty. */
    // AS3: RewardClaimsTab.as::onClaimClicked()
    private onClaimClicked = (): void =>
    {
        this.claimButton?.disable();
        this._claimInFlight = true;
        this._controller.send(new ClaimNftClaimsComposer());
        this.setReady(false);
    };

    /**
     * Note the filter: a claim whose `claimedAmount` has reached its `claimLimit` is skipped, so a
     * fully-claimed reward never appears even though the server still sends it.
     */
    // AS3: RewardClaimsTab.as::onNftClaimsMessage()
    private onNftClaimsMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as NftClaimsMessageParser | null;

        if(parser === null) return;

        for(const claim of parser.nftClaims)
        {
            if(claim.claimedAmount < claim.claimLimit) this.createRewardItem(claim);
        }

        this._isRequestInProgress = false;

        if(this._pendingWallets.length === 0)
        {
            this.stopRequestTimer();
            this.setReady(true);
            this.updateClaimButtonState();
        }
    };

    // AS3: RewardClaimsTab.as::onNftClaimResultMessage()
    private onNftClaimResultMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as NftClaimResultMessageParser | null;

        if(parser === null) return;

        const text = parser.success
            ? this.localization?.getLocalization('collectibles.claiming.success') ?? ''
            : this.localization?.getLocalizationWithParams(
                'collectibles.claiming.failed', '', 'id', String(parser.resultCode)
            ) ?? '';

        this._controller.notifications?.addItem(text, 'info', 'icon_curator_stamp_large_png');

        if(parser.success) this.clearItems();

        this._claimInFlight = false;
        this.updateClaimButtonState();
        this.setReady(true);
    };

    /**
     * `updateVisuals()` is called explicitly right after construction, and it has to be: the base
     * renderer's constructor already ran it once, before this subclass's fields existed. See
     * `RewardCollectibleItemRenderer`.
     */
    // AS3: RewardClaimsTab.as::createRewardItem()
    private createRewardItem(claim: NftClaim): void
    {
        if(this._rowTemplate === null || this._itemList === null) return;

        const row = this._rowTemplate.clone() as IWindowContainer;
        const renderer = new RewardCollectibleItemRenderer(this._controller, claim, row, this);

        this._listItems.push(renderer);
        this._itemList.addListItem(row);

        renderer.updateVisuals();
        renderer.updateExpiresText(RewardClaimsTab.formatExpiryDate(claim.validTo));
    }

    /**
     * AS3 formats with a `DateTimeFormatter("i-default")` set to `dd/MM/yyyy`. The port uses
     * `Intl.DateTimeFormat` with an explicit `en-GB`, which produces the same `dd/MM/yyyy` —
     * "i-default" is Flash's locale-independent default, not the user's locale, so following the
     * runtime locale here would have changed the format.
     */
    // AS3: RewardClaimsTab.as::_SafeStr_7224 (the DateTimeFormatter)
    private static formatExpiryDate(epochMillis: number): string
    {
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        }).format(new Date(epochMillis));
    }

    /** Three containers, exactly one visible: loading, the list, or "nothing to claim". */
    // AS3: RewardClaimsTab.as::setReady()
    private setReady(ready: boolean): void
    {
        const hasItems = this._itemList !== null && this._itemList.numListItems > 0;
        const loaded = this.loadedContainer;
        const empty = this.noContentContainer;
        const loading = this.loadingContainer;

        if(loaded !== null) loaded.visible = ready && hasItems;
        if(empty !== null) empty.visible = ready && !hasItems;
        if(loading !== null) loading.visible = !ready;

        this._isReady = ready;
    }

    // AS3: RewardClaimsTab.as::get isReady()
    private get isReady(): boolean
    {
        return this._isReady;
    }

    // AS3: RewardClaimsTab.as::get localization()
    private get localization(): IHabboLocalizationManager | null
    {
        return this._controller.localizationManager;
    }

    // AS3: RewardClaimsTab.as::removeMessageEvents()
    private removeMessageEvents(): void
    {
        for(const event of this._messageEvents) this._controller.removeMessageEvent(event);

        this._messageEvents = [];
    }

    // AS3: RewardClaimsTab.as::clearItems()
    private clearItems(): void
    {
        for(const item of this._listItems) item.dispose();

        this._listItems = [];
        this._itemList?.destroyListItems();
    }

    // TS-only: AS3's `Timer.stop()`; the port's timer is a setInterval handle.
    private stopRequestTimer(): void
    {
        if(this._requestTimer === null) return;

        clearInterval(this._requestTimer);
        this._requestTimer = null;
    }

    // AS3: RewardClaimsTab.as::update()
    update(elapsedMs: number): void
    {
        if(this.isReady || this._loadingIcon === null) return;

        this._loadingIcon.rotation += RewardClaimsTab.LOADING_ICON_ROTATE_SPEED * (elapsedMs / 1000);
        this._loadingIcon.rotation %= 360;
        this._loadingIcon.invalidate();
    }

    // AS3: RewardClaimsTab.as::get loadingContainer()
    private get loadingContainer(): IWindowContainer | null
    {
        return this._container?.findChildByName('loading_contents') as IWindowContainer | null ?? null;
    }

    // AS3: RewardClaimsTab.as::get loadedContainer()
    private get loadedContainer(): IWindowContainer | null
    {
        return this._container?.findChildByName('loaded_content') as IWindowContainer | null ?? null;
    }

    // AS3: RewardClaimsTab.as::get noContentContainer()
    private get noContentContainer(): IWindowContainer | null
    {
        return this._container?.findChildByName('no_content_container') as IWindowContainer | null ?? null;
    }

    // AS3: RewardClaimsTab.as::get claimButton()
    private get claimButton(): IWindow | null
    {
        return this._container?.findChildByName('claim_button') ?? null;
    }

    // AS3: RewardClaimsTab.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardClaimsTab.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this.clearItems();
        this.stopRequestTimer();
        this.removeMessageEvents();

        // AS3 leaves the claim button's listener attached; the port removes it, as the renderer
        // base does, so a disposed tab cannot still send a claim.
        this.claimButton?.removeEventListener(WindowMouseEvent.CLICK, this.onClaimClicked as unknown as (...args: unknown[]) => void);

        this._controller.removeUpdateReceiver(this);

        this._container = null;
        this._itemList = null;
        this._rowTemplate = null;
        this._loadingIcon = null;
        this._view = null;
    }
}
