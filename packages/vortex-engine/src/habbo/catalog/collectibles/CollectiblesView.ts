import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowLinkEvent} from '@core/window/events/WindowLinkEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCatalogPurse} from '@habbo/catalog/purse/IHabboCatalogPurse';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {CollectibleWalletAddressesMessageParser} from '@habbo/communication/messages/parser/collectibles/CollectibleWalletAddressesMessageParser';
import type {NftCollectionsScoreMessageParser} from '@habbo/communication/messages/parser/collectibles/NftCollectionsScoreMessageParser';
import {CollectibleWalletAddressesMessageEvent} from '@habbo/communication/messages/incoming/collectibles/CollectibleWalletAddressesMessageEvent';
import {NftCollectionsScoreMessageEvent} from '@habbo/communication/messages/incoming/collectibles/NftCollectionsScoreMessageEvent';
import {GetCollectibleWalletAddressesComposer} from '@habbo/communication/messages/outgoing/collectibles/GetCollectibleWalletAddressesComposer';
import {GetCollectorScoreComposer} from '@habbo/communication/messages/outgoing/collectibles/GetCollectorScoreComposer';

import type {CollectiblesController} from './CollectiblesController';
import {RewardClaimsTab} from './tabs/RewardClaimsTab';
import {TransferNftsTab} from './tabs/TransferNftsTab';

// AS3: CollectiblesView.as::DESKTOP_WINDOW_LAYER
const DESKTOP_WINDOW_LAYER = 1;

/** AS3: CollectiblesView.as::TAB_* — each is the *window name* of its tab button. */
const TAB_COLLECTIONS = 'top_view_collections_button';
const TAB_MINT = 'top_view_minting_button';
const TAB_INFO = 'top_view_info_button';
const TAB_TRANSFER = 'top_view_transfer_button';
const TAB_SHOP = 'top_view_shop_button';
const TAB_REWARDS = 'top_view_rewards_button';
const TAB_COLLECTOR_PROFILE = 'top_view_profile_button';
const TAB_LEVELS = 'top_view_levels_button';

const ALL_TABS = [
    TAB_COLLECTOR_PROFILE, TAB_COLLECTIONS, TAB_LEVELS, TAB_MINT,
    TAB_INFO, TAB_TRANSFER, TAB_SHOP, TAB_REWARDS,
];

/** AS3: CollectiblesView.as::onCollectionsScoreMessage() — one colour per five collector levels. */
const LEVEL_BAND_COLORS = [8162450, 2529547, 32234, 13828339];
const LEVEL_BAND_COLOR_MAX = 15571457;

/**
 * The collectibles hub window: the eight-tab frame, the collector score header, the currency
 * balances and the wallet list every tab reads from.
 *
 * **Only the rewards tab is ported.** AS3's `initWidgets()` builds all five in the constructor;
 * here the four unported ones are TODOs at their construction sites, so the frame, the tab bar, the
 * score header and the wallet plumbing are all real and the four containers simply come up empty.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/CollectiblesView.as
 */
export class CollectiblesView
{
    // AS3: CollectiblesView.as::STARDUST_WALLET_DISPLAY_NAME
    public static readonly STARDUST_WALLET_DISPLAY_NAME: string = 'Collector Wallet';

    // AS3: CollectiblesView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;
    // AS3: CollectiblesView.as::_SafeStr_4593 (the controller)
    private _controller: CollectiblesController | null;
    // AS3: CollectiblesView.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: CollectiblesView.as::_currentTab
    private _currentTab: string = TAB_REWARDS;
    // AS3: CollectiblesView.as::_SafeStr_6174 (the rewards tab)
    private _rewardClaimsTab: RewardClaimsTab | null = null;
    // AS3: CollectiblesView.as::_SafeStr_5031 (the transfer tab)
    private _transferTab: TransferNftsTab | null = null;
    // AS3: CollectiblesView.as::_SafeStr_7673 (a wallet request is in flight)
    private _walletRequestInFlight: boolean = false;
    // AS3: CollectiblesView.as::_walletAddresses
    private _walletAddresses: string[] | null = null;
    // AS3: CollectiblesView.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];
    // AS3: CollectiblesView.as::_SafeStr_6459 (from `get activeWallet()`)
    private _activeWallet: string | null = null;
    // AS3: CollectiblesView.as::_SafeStr_8687 (from `get stardustWallet()`)
    private _stardustWallet: string = '';

    // AS3: CollectiblesView.as::CollectiblesView()
    constructor(controller: CollectiblesController, windowManager: IHabboWindowManager)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        // AS3 reads the layout via `assets.getAssetByName(...).content` + `buildFromXML(xml, 1)`;
        // `buildWidgetLayout()` is those two steps behind one call, layer included.
        this._window = windowManager.buildWidgetLayout('collectible_view_xml', DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        if(this._window === null) return;

        for(const tab of ALL_TABS)
        {
            const button = this._window.findChildByName(tab);

            if(button !== null) button.procedure = this.onTab;
        }

        // The captions are localization placeholders the window system resolves; AS3 sets six of
        // the eight and leaves the profile and levels tabs with whatever the layout carries.
        this.setTabCaption(TAB_COLLECTIONS, '${collectibles.collections.title}');
        this.setTabCaption(TAB_SHOP, '${collectibles.shop.title}');
        this.setTabCaption(TAB_MINT, '${shop.minting.title}');
        this.setTabCaption(TAB_TRANSFER, '${collectibles.transfer}');
        this.setTabCaption(TAB_INFO, '${collectibles.info.title}');
        this.setTabCaption(TAB_REWARDS, '${collectibles.claim.title}');

        this.addMessageEvents();
        this.refresh();
        this.requestWalletAddresses();

        this.setTabVisible(TAB_MINT, controller.getBoolean('nft.minting.enabled'));
        this.setTabVisible(TAB_TRANSFER, controller.getBoolean('collectibles.transfer.enabled'));
        this.setTabVisible(TAB_SHOP, controller.getBoolean('nft.shop.enabled'));

        const title = this.levelTitle;

        if(title !== null)
        {
            title.text = (controller.localizationManager?.getLocalization('collectibles.level') ?? '').toUpperCase();
        }

        this.centerTabLayout();
        this.initWidgets();

        this._window.findChildByName('header_button_close')
            ?.addEventListener(WindowMouseEvent.CLICK, this.onWindowClose as unknown as (...args: unknown[]) => void);

        for(const link of [this.infoLink, this.transferLink])
        {
            link?.addEventListener(WindowLinkEvent.WE_LINK, this.onClickHtmlLink as unknown as (...args: unknown[]) => void);
        }

        // TODO(AS3): AS3 also calls `initializeLinkStyle()` on both links, which paints them as
        // links rather than plain text. The port's IHTMLTextWindow declares no such member — only
        // `html` and `linkTarget` — so the two descriptions render unstyled.
    }

    // TS-only: AS3 repeats `findChildByName(tab).caption = ...` eight times inline.
    private setTabCaption(tab: string, caption: string): void
    {
        const button = this._window?.findChildByName(tab) ?? null;

        if(button !== null) button.caption = caption;
    }

    // TS-only: the same shape for the three configuration-gated tabs.
    private setTabVisible(tab: string, visible: boolean): void
    {
        const button = this._window?.findChildByName(tab) ?? null;

        if(button !== null) button.visible = visible;
    }

    // AS3: CollectiblesView.as::onWindowClose()
    private onWindowClose = (event: {type: string}): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.hideWindow();
    };

    // AS3: CollectiblesView.as::hideWindow()
    private hideWindow(): void
    {
        if(this._windowManager === null || this._window === null || this._window.parent === null) return;

        const desktop = this._windowManager.getDesktop(DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        desktop?.removeChild(this._window);
    }

    // AS3: CollectiblesView.as::showWindow()
    showWindow(): void
    {
        if(this._windowManager === null || this._window === null || this._window.parent !== null) return;

        const desktop = this._windowManager.getDesktop(DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        desktop?.addChild(this._window);
    }

    /**
     * Centres the tab strip on the window, and — note — *zeroes the width* of every hidden tab
     * first, so the three configuration-gated ones do not leave a gap. The 350px threshold decides
     * whether the strip gets a background behind it.
     */
    // AS3: CollectiblesView.as::centerTabLayout()
    private centerTabLayout(): void
    {
        if(this._window === null) return;

        const context = this._window.findChildByName('top_view_select_tab_context') as ITabContextWindow | null;
        const selector = context?.selector ?? null;

        if(selector === null) return;

        let totalWidth = 0;

        for(let i = 0; i < selector.numSelectables; i++)
        {
            const selectable = selector.getSelectableAt(i);

            if(selectable === null) continue;

            if(selectable.visible)
            {
                totalWidth += selectable.width;
            }
            else
            {
                selectable.width = 0;
            }
        }

        selector.x = this._window.width / 2 - totalWidth / 2;

        const background = this._window.findChildByName('tab_bg');

        if(background !== null) background.visible = totalWidth > 350;
    }

    // AS3: CollectiblesView.as::addMessageEvents()
    private addMessageEvents(): void
    {
        if(this._controller === null) return;

        this._messageEvents = [
            new CollectibleWalletAddressesMessageEvent(this.onCollectableWalletAddressMessage),
            new NftCollectionsScoreMessageEvent(this.onCollectionsScoreMessage),
        ];

        for(const event of this._messageEvents) this._controller.addMessageEvent(event);
    }

    // AS3: CollectiblesView.as::updateBalances()
    updateBalances(purse: IHabboCatalogPurse): void
    {
        if(this._window === null) return;

        const emerald = this._window.findChildByName('emerald_currency_value');
        const silver = this._window.findChildByName('silver_currency_value');

        if(emerald !== null) emerald.caption = `${purse.emeraldBalance}`;
        if(silver !== null) silver.caption = `${purse.silverBalance}`;

        this._transferTab?.onSilverBalanceUpdated();
    }

    /**
     * The header banner's colour steps once every five collector levels, and AS3's `(level - 1) / 5`
     * is integer division — level 1-5 is band 0, 6-10 band 1, and everything past 20 shares the
     * last colour.
     */
    // AS3: CollectiblesView.as::onCollectionsScoreMessage()
    private onCollectionsScoreMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as NftCollectionsScoreMessageParser | null;

        if(parser === null) return;

        const level = this.levelValue;
        const score = this.scoreValue;
        const hiscore = this.hiscoreValue;

        if(level !== null) level.text = String(parser.level);
        if(score !== null) score.text = String(parser.score);
        if(hiscore !== null) hiscore.text = String(parser.highestScore);

        const band = Math.max(0, Math.trunc((parser.level - 1) / 5));
        const color = band < LEVEL_BAND_COLORS.length ? LEVEL_BAND_COLORS[band] : LEVEL_BAND_COLOR_MAX;

        const bg = this.collectorLevelBg;
        const bg2 = this.collectorLevelBg2;

        if(bg !== null) bg.color = color;
        if(bg2 !== null) bg2.color = color;
    };

    // AS3: CollectiblesView.as::onCollectableWalletAddressMessage()
    private onCollectableWalletAddressMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CollectibleWalletAddressesMessageParser | null;

        if(parser === null) return;

        this._walletRequestInFlight = false;
        this._walletAddresses = parser.walletAddresses;
        this._stardustWallet = parser.stardustWalletAddress;

        // TODO(AS3): AS3 also hands the full list to `collectionsWidget`. CollectionsTab (627 l.)
        // is unported.
        this._rewardClaimsTab?.onWalletsAddressesUpdated(this._walletAddresses);

        // The transfer tab gets the non-Stardust subset only — you cannot transfer to your own
        // wallet. `nonStardustWallets` is non-null here because `_walletAddresses` just was.
        this._transferTab?.onWalletsAddressesUpdated(this.nonStardustWallets ?? []);

        this.setActiveWalletIndex(0);
    };

    /** The transfer tab offers every wallet *except* the Stardust one — you cannot transfer to it. */
    // AS3: CollectiblesView.as::get nonStardustWallets()
    get nonStardustWallets(): string[] | null
    {
        if(this._walletAddresses === null) return null;

        return this._walletAddresses.filter((wallet) => wallet !== this._stardustWallet);
    }

    // AS3: CollectiblesView.as::walletsLoaded()
    walletsLoaded(): boolean
    {
        return this._walletAddresses !== null;
    }

    /**
     * The guard reads backwards and is AS3's: with a non-empty list, an out-of-range index or one
     * already selected returns early — so only a *changed*, in-range index gets through. With an
     * empty list the guard is skipped entirely and the active wallet becomes null.
     */
    // AS3: CollectiblesView.as::setActiveWalletIndex()
    setActiveWalletIndex(index: number): void
    {
        const wallets = this._walletAddresses ?? [];

        if(wallets.length > 0 && (index < 0 || index >= wallets.length || wallets[index] === this._activeWallet))
        {
            return;
        }

        this._activeWallet = wallets.length > 0 ? wallets[index] : null;

        // TODO(AS3): AS3 also pushes the active wallet into `collectionsWidget` and
        // `mintInventoryListWidget`. Both tabs are unported.

        if(this._activeWallet !== null)
        {
            this._controller?.send(new GetCollectorScoreComposer(this._activeWallet));
        }
    }

    /** Once per view: the flag is set on send and cleared only when the answer lands. */
    // AS3: CollectiblesView.as::requestWalletAddresses()
    private requestWalletAddresses(): void
    {
        if(this._walletRequestInFlight) return;

        this._walletRequestInFlight = true;
        this._controller?.send(new GetCollectibleWalletAddressesComposer());
    }

    // AS3: CollectiblesView.as::get walletAddresses()
    get walletAddresses(): string[] | null
    {
        return this._walletAddresses;
    }

    /**
     * Selects the current tab button, hides every container, then shows the one that belongs to it
     * — building that tab on first visit.
     */
    // AS3: CollectiblesView.as::refresh()
    private refresh(): void
    {
        if(this._window === null) return;

        const context = this._window.findChildByName('top_view_select_tab_context') as ITabContextWindow | null;
        const button = this._window.findChildByName(this._currentTab) as ISelectableWindow | null;

        if(context?.selector !== null && button !== null) context?.selector?.setSelected(button);

        this.hideAllTabContainers();

        switch(this._currentTab)
        {
            case TAB_COLLECTOR_PROFILE:
                this.setContainerVisible('collectorProfileContainer', true);
                break;
            case TAB_COLLECTIONS:
                this.setContainerVisible('collectionsContainer', true);
                // TODO(AS3): `new CollectionsTab(this, controller)` — 627 l., unported.
                break;
            case TAB_LEVELS:
                this.setContainerVisible('levelsContainer', true);
                break;
            case TAB_MINT:
                this.setContainerVisible('mintingContainer', true);
                // TODO(AS3): `new MintInventoryListTab(this, controller)` — 769 l., unported.
                break;
            case TAB_TRANSFER:
                this.setContainerVisible('transferContainer', true);

                if(this._transferTab === null && this._controller !== null)
                {
                    this._transferTab = new TransferNftsTab(this, this._controller);
                }

                break;
            case TAB_INFO:
                this.setContainerVisible('infoContainer', true);
                break;
            case TAB_SHOP:
                this.setContainerVisible('shopContainer', true);
                // TODO(AS3): `new ShopTab(this, controller)` — 497 l., unported.
                break;
            case TAB_REWARDS:
                this.setContainerVisible('rewardsContainer', true);

                if(this._rewardClaimsTab === null && this._controller !== null)
                {
                    this._rewardClaimsTab = new RewardClaimsTab(this, this._controller);
                }

                break;
        }
    }

    /**
     * AS3 builds all five tabs here, up front, rather than waiting for each to be visited — which
     * is what lets `onCollectableWalletAddressMessage()` push wallets into tabs the player has
     * never opened. Only the rewards tab exists in this port.
     */
    // AS3: CollectiblesView.as::initWidgets()
    private initWidgets(): void
    {
        if(this._controller === null) return;

        // TODO(AS3): AS3 constructs CollectionsTab, MintInventoryListTab and ShopTab here too —
        // 1,893 lines between them, all unported. Their containers stay empty and the two wallet
        // hand-offs they would receive have nothing to hand to.
        if(this._rewardClaimsTab === null)
        {
            this._rewardClaimsTab = new RewardClaimsTab(this, this._controller);
        }

        if(this._transferTab === null)
        {
            this._transferTab = new TransferNftsTab(this, this._controller);
        }
    }

    // AS3: CollectiblesView.as::get transferWidget()
    get transferWidget(): TransferNftsTab | null
    {
        return this._transferTab;
    }

    // AS3: CollectiblesView.as::get activeWallet()
    get activeWallet(): string | null
    {
        return this._activeWallet;
    }

    // AS3: CollectiblesView.as::hideAllTabContainers()
    private hideAllTabContainers(): void
    {
        for(const name of [
            'collectorProfileContainer', 'collectionsContainer', 'levelsContainer', 'mintingContainer',
            'transferContainer', 'infoContainer', 'shopContainer', 'rewardsContainer',
        ])
        {
            this.setContainerVisible(name, false);
        }
    }

    // TS-only: AS3 spells each `findChildByName(...).visible = false` out in full.
    private setContainerVisible(name: string, visible: boolean): void
    {
        const container = this._window?.findChildByName(name) ?? null;

        if(container !== null) container.visible = visible;
    }

    // AS3: CollectiblesView.as::onTab()
    private onTab = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._currentTab = window.name;
        this.refresh();
    };

    // AS3: CollectiblesView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: CollectiblesView.as::onClickHtmlLink()
    private onClickHtmlLink = (event: WindowEvent): void =>
    {
        const linkEvent = event as WindowLinkEvent;

        if(linkEvent.link === undefined || linkEvent.link === null) return;

        HabboWebTools.openWebPageAndMinimizeClient(linkEvent.link);
    };

    // AS3: CollectiblesView.as::removeMessageEvents()
    private removeMessageEvents(): void
    {
        if(this._controller === null) return;

        for(const event of this._messageEvents) this._controller.removeMessageEvent(event);

        this._messageEvents = [];
    }

    // AS3: CollectiblesView.as::get stardustWallet()
    get stardustWallet(): string
    {
        return this._stardustWallet;
    }

    // AS3: CollectiblesView.as::get scoreValue()
    private get scoreValue(): ITextWindow | null
    {
        return this._window?.findChildByName('current_score_value') as ITextWindow | null ?? null;
    }

    // AS3: CollectiblesView.as::get hiscoreValue()
    private get hiscoreValue(): ITextWindow | null
    {
        return this._window?.findChildByName('current_hiscore_value') as ITextWindow | null ?? null;
    }

    // AS3: CollectiblesView.as::get levelValue()
    private get levelValue(): ITextWindow | null
    {
        return this._window?.findChildByName('collector_level') as ITextWindow | null ?? null;
    }

    // AS3: CollectiblesView.as::get levelTitle()
    private get levelTitle(): ITextWindow | null
    {
        return this._window?.findChildByName('level_title') as ITextWindow | null ?? null;
    }

    // AS3: CollectiblesView.as::get collectorLevelBg()
    private get collectorLevelBg(): IStaticBitmapWrapperWindow | null
    {
        return this._window?.findChildByName('collector_level_bg') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: CollectiblesView.as::get collectorLevelBg2()
    private get collectorLevelBg2(): IStaticBitmapWrapperWindow | null
    {
        return this._window?.findChildByName('collector_level_bg2') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: CollectiblesView.as::get infoLink()
    private get infoLink(): IWindow | null
    {
        return this._window?.findChildByName('info_desc') ?? null;
    }

    // AS3: CollectiblesView.as::get transferLink()
    private get transferLink(): IWindow | null
    {
        return this._window?.findChildByName('transfer_desc') ?? null;
    }

    /**
     * AS3 hard-codes `return false`, so a disposed view reports itself alive — and
     * `CollectiblesController.showCollectibleHub()` tests exactly this to decide whether to rebuild.
     * The port answers from the window it actually nulls.
     */
    // AS3: CollectiblesView.as::get disposed()
    get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: CollectiblesView.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this.removeMessageEvents();

        if(this._rewardClaimsTab !== null)
        {
            this._rewardClaimsTab.dispose();
            this._rewardClaimsTab = null;
        }

        if(this._transferTab !== null)
        {
            this._transferTab.dispose();
            this._transferTab = null;
        }

        // AS3 disposes the collections, mint and transfer tabs here and — a real slip — never the
        // shop tab *or the rewards tab*, both of which leak their message subscriptions. Both are
        // disposed above.

        // TODO(AS3): CollectionsTab and MintInventoryListTab are disposed here in AS3; unported.

        this._window?.dispose();
        this._window = null;
        this._controller = null;
        this._windowManager = null;
    }
}
