import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IUpdateReceiver} from '@core/runtime';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {NftCollection} from '@habbo/communication/messages/parser/collectibles/NftCollection';
import type {NftCollectionsMessageParser} from '@habbo/communication/messages/parser/collectibles/NftCollectionsMessageParser';
import type {NftBonusItemClaimResultMessageParser} from '@habbo/communication/messages/parser/collectibles/NftBonusItemClaimResultMessageParser';
import type {NftRewardItemClaimResultMessageParser} from '@habbo/communication/messages/parser/collectibles/NftRewardItemClaimResultMessageParser';
import {NftCollectionsMessageEvent} from '@habbo/communication/messages/incoming/collectibles/NftCollectionsMessageEvent';
import {NftBonusItemClaimResultMessageEvent} from '@habbo/communication/messages/incoming/collectibles/NftBonusItemClaimResultMessageEvent';
import {NftRewardItemClaimResultMessageEvent} from '@habbo/communication/messages/incoming/collectibles/NftRewardItemClaimResultMessageEvent';
import {GetNftCollectionsComposer} from '@habbo/communication/messages/outgoing/collectibles/GetNftCollectionsComposer';
import {CatalogEvent} from '../../event/CatalogEvent';

import type {CollectiblesController} from '../CollectiblesController';
import {CollectiblesView} from '../CollectiblesView';
import {CollectionsNavigationNodeRenderer} from '../renderer/collections/CollectionsNavigationNodeRenderer';
import {CollectionView} from './subviews/CollectionView';

const log = Logger.getLogger('habbo.catalog.collectibles.tabs.CollectionsTab');

/**
 * The collections tab: every NFT collection this wallet holds, sorted and searchable, with one
 * `CollectionView` panel beside the list.
 *
 * The control flow through sorting is worth stating, because nothing in `onNftCollectionsMessage()`
 * builds a node. It stores the collections and sets `sortSelection.selection = 0` — and *that*
 * dispatches WE_SELECTED, which runs `onSortSelectAction()`, which is what actually clears the list
 * and builds one node per collection. Change the dropdown to not dispatch on assignment and the tab
 * renders nothing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/tabs/CollectionsTab.as
 */
export class CollectionsTab implements IUpdateReceiver
{
    /** AS3: CollectionsTab.as — the two rotation speeds every sibling tab borrows from this class. */
    private static readonly BG_STAR_ROTATE_SPEED = 20;

    private static readonly LOADING_ICON_ROTATE_SPEED = 90;

    /** AS3: CollectionsTab.as::initializeWallets() — the dropdown's two background colours. */
    private static readonly WALLET_SELECTION_COLOR_DISABLED = 13421772;

    private static readonly WALLET_SELECTION_COLOR_ENABLED = 16777215;

    /** AS3: CollectionsTab.as::set activeWallet() — a wallet caption longer than this is elided. */
    private static readonly WALLET_CAPTION_MAX_LENGTH = 19;

    /** AS3: CollectionsTab.as::onSortSelectAction() — the sort dropdown's three entries. */
    private static readonly SORT_DEFAULT = 0;

    private static readonly SORT_PROGRESS = 1;

    private static readonly SORT_SCORE = 2;

    // AS3: CollectionsTab.as::_disposed
    private _disposed: boolean = false;
    // AS3: CollectionsTab.as::_SafeStr_5556 (the hub view)
    private _view: CollectiblesView | null;
    // AS3: CollectionsTab.as::_SafeStr_4729 (the controller)
    private _controller: CollectiblesController;
    // AS3: CollectionsTab.as::_SafeStr_4649 (this tab's container)
    private _container: IWindowContainer | null = null;
    // AS3: CollectionsTab.as::_navigationList
    private _navigationList: IItemListWindow | null = null;
    // AS3: CollectionsTab.as::_renderableItems
    private _renderableItems: CollectionsNavigationNodeRenderer[] = [];
    // AS3: CollectionsTab.as::_SafeStr_9551 (from `get navigationItemTemplate()`)
    private _navigationItemTemplate: IWindowContainer | null = null;
    // AS3: CollectionsTab.as::_SafeStr_7599 (waiting for the collections reply)
    private _waitingForCollections: boolean = false;
    // AS3: CollectionsTab.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];
    // AS3: CollectionsTab.as::_SafeStr_5202 (the active node)
    private _activeNode: CollectionsNavigationNodeRenderer | null = null;
    // AS3: CollectionsTab.as::_SafeStr_5458 (the panel beside the list)
    private _collectionView: CollectionView | null = null;
    // AS3: CollectionsTab.as::_SafeStr_6510 (the rotating backdrop star)
    private _backgroundStar: IStaticBitmapWrapperWindow | null = null;
    // AS3: CollectionsTab.as::_loadingIcon
    private _loadingIcon: IStaticBitmapWrapperWindow | null = null;
    // AS3: CollectionsTab.as::_SafeStr_5861 (the ready flag)
    private _isReady: boolean = false;
    // AS3: CollectionsTab.as::_SafeStr_9580 (from `get gridItemTemplate()`)
    private _gridItemTemplate: IWindowContainer | null = null;
    // AS3: CollectionsTab.as::_SafeStr_9412 (from `get productInfoEntryTemplate()`)
    private _productInfoEntryTemplate: IWindowContainer | null = null;
    // AS3: CollectionsTab.as::_ignoreWalletSelectionEvents
    private _ignoreWalletSelectionEvents: boolean = false;
    // AS3: CollectionsTab.as::_SafeStr_6856 (the unsorted collections)
    private _collections: NftCollection[] = [];

    // AS3: CollectionsTab.as::CollectionsTab()
    constructor(view: CollectiblesView, controller: CollectiblesController)
    {
        this._view = view;
        this._controller = controller;

        this._container = view.window?.findChildByName('collectionsContainer') as IWindowContainer | null ?? null;

        if(this._container === null) return;

        this._navigationList = this._container.findChildByName('navigationList') as IItemListWindow | null;

        const navTemplate = this._navigationList?.getListItemByName('item_template') ?? null;

        if(navTemplate !== null)
        {
            this._navigationItemTemplate = this._navigationList?.removeListItem(navTemplate) as IWindowContainer | null ?? null;
        }

        // Three templates come out of the layout here — the nav row above, the grid cell, and the
        // product-info row that `CollectionView.addInfoEntry()` clones.
        const grid = this._container.findChildByName('itemgrid_collection') as IItemGridWindow | null;

        this._gridItemTemplate = grid?.getGridItemAt(0) as IWindowContainer | null ?? null;
        grid?.removeGridItems();

        const infoList = this._container.findChildByName('product_info_list') as IItemListWindow | null;

        this._productInfoEntryTemplate = infoList?.getListItemAt(0) as IWindowContainer | null ?? null;
        infoList?.removeListItems();

        this.setReady(false);
        this.addMessageEvents();

        const wallets = view.walletAddresses;

        if(wallets !== null) this.initializeWallets(wallets);

        this.walletSelection?.addEventListener('WE_SELECTED', this.onWalletSelectAction as unknown as (...args: unknown[]) => void);

        this.populateSortOptions();

        this.sortSelection?.addEventListener('WE_SELECTED', this.onSortSelectAction as unknown as (...args: unknown[]) => void);
        this.searchInput?.addEventListener('WE_CHANGE', this.onFilterChangeAction as unknown as (...args: unknown[]) => void);
        this.clearSearchButton?.addEventListener(WindowMouseEvent.CLICK, this.onClearSearchAction as unknown as (...args: unknown[]) => void);

        this._backgroundStar = this._container.findChildByName('bg_star') as IStaticBitmapWrapperWindow | null;
        this._loadingIcon = this._container.findChildByName('loading_icon') as IStaticBitmapWrapperWindow | null;

        controller.registerUpdateReceiver(this, 1);
    }

    /**
     * The default sort is by *bonus urgency*, not alphabetical: claimable bonuses first, then
     * bonuses whose snapshot has not passed yet, then everything else. Each group keeps its arrival
     * order.
     */
    // AS3: CollectionsTab.as::sortCollectionsByBonus()
    private static sortCollectionsByBonus(collections: NftCollection[]): NftCollection[]
    {
        const claimable: NftCollection[] = [];
        const pending: NftCollection[] = [];
        const rest: NftCollection[] = [];

        for(const collection of collections)
        {
            if(collection.canClaimBonus)
            {
                claimable.push(collection);
            }
            else if(collection.hasBonusItem && !collection.isBonusSnapshotPassed())
            {
                pending.push(collection);
            }
            else
            {
                rest.push(collection);
            }
        }

        return [...claimable, ...pending, ...rest];
    }

    // AS3: CollectionsTab.as::addMessageEvents()
    private addMessageEvents(): void
    {
        this._messageEvents = [
            new NftCollectionsMessageEvent(this.onNftCollectionsMessage),
            new NftBonusItemClaimResultMessageEvent(this.onBonusClaimResult),
            new NftRewardItemClaimResultMessageEvent(this.onRewardClaimResult),
        ];

        for(const event of this._messageEvents) this._controller.addMessageEvent(event);
    }

    // AS3: CollectionsTab.as::onWalletsAddressesUpdated()
    onWalletsAddressesUpdated(wallets: string[]): void
    {
        this.initializeWallets(wallets);
    }

    /**
     * The Stardust wallet is shown under a friendly name rather than its address — the only place
     * `STARDUST_WALLET_DISPLAY_NAME` is used, and it is a literal, not a localization key.
     */
    // AS3: CollectionsTab.as::initializeWallets()
    private initializeWallets(wallets: string[]): void
    {
        const dropdown = this.walletSelection;

        if(dropdown === null) return;

        if(wallets.length === 0)
        {
            dropdown.color = CollectionsTab.WALLET_SELECTION_COLOR_DISABLED;
            dropdown.disable();

            return;
        }

        dropdown.color = CollectionsTab.WALLET_SELECTION_COLOR_ENABLED;
        dropdown.enable();

        const stardust = this._view?.stardustWallet ?? '';

        dropdown.populateWithStrings(
            wallets.map((wallet) => wallet === stardust ? CollectiblesView.STARDUST_WALLET_DISPLAY_NAME : wallet)
        );
    }

    // AS3: CollectionsTab.as::populateSortOptions()
    private populateSortOptions(): void
    {
        const localization = this._controller.localizationManager;

        this.sortSelection?.populateWithStrings([
            localization?.getLocalization('collectibles.sort.default', 'Default') ?? 'Default',
            localization?.getLocalization('collectibles.sort.progress', 'Progress') ?? 'Progress',
            localization?.getLocalization('collectibles.sort.score', 'Score') ?? 'Score',
        ]);
    }

    /** This is what builds the nodes — see the class note on why it, and not the message handler. */
    // AS3: CollectionsTab.as::onSortSelectAction()
    private onSortSelectAction = (): void =>
    {
        this.clearNavigationList();

        const selection = this.sortSelection?.selection ?? CollectionsTab.SORT_DEFAULT;
        let sorted: NftCollection[];

        if(selection === CollectionsTab.SORT_PROGRESS)
        {
            sorted = CollectionsTab.sortCollectionsByProgress(this._collections);
        }
        else if(selection === CollectionsTab.SORT_SCORE)
        {
            sorted = CollectionsTab.sortCollectionsByScore(this._collections);
        }
        else
        {
            sorted = CollectionsTab.sortCollectionsByBonus(this._collections);
        }

        for(const collection of sorted)
        {
            const node = new CollectionsNavigationNodeRenderer(this, collection);

            if(node.window !== null) this._navigationList?.addListItem(node.window);

            this._renderableItems.push(node);
        }

        this.filterSearchResults();
    };

    // AS3: CollectionsTab.as::onFilterChangeAction()
    private onFilterChangeAction = (): void =>
    {
        this.filterSearchResults();
    };

    /**
     * Filters by hiding rows rather than rebuilding the list, with `autoArrangeItems` switched off
     * around the loop so the list reflows once instead of per row.
     *
     * The match is case-sensitive on the *query*: AS3 lower-cases the collection name but not
     * `searchInput.text`, so a capital letter typed by the player matches nothing. Kept.
     */
    // AS3: CollectionsTab.as::filterSearchResults()
    private filterSearchResults(): void
    {
        const list = this._navigationList;
        const query = this.searchInput?.text ?? '';

        if(list !== null) list.autoArrangeItems = false;

        for(const node of this._renderableItems)
        {
            if(node.window === null) continue;

            if(query.length === 0)
            {
                node.window.visible = true;

                continue;
            }

            node.window.visible = node.nftCollection.collectionName.toLowerCase().indexOf(query) !== -1;
        }

        if(list !== null) list.autoArrangeItems = true;

        this.setSearchState(query.length > 0);
    }

    // AS3: CollectionsTab.as::setSearchState()
    private setSearchState(searching: boolean): void
    {
        const icon = this.searchIcon;
        const placeholder = this.searchPlaceholder;

        if(icon !== null) icon.visible = searching;
        if(placeholder !== null) placeholder.visible = !searching;
    }

    // AS3: CollectionsTab.as::onClearSearchAction()
    private onClearSearchAction = (): void =>
    {
        const input = this.searchInput;

        if(input !== null) input.text = '';

        this.filterSearchResults();
    };

    /**
     * The guard is what stops the round trip: `set activeWallet` writes the dropdown's selection,
     * which dispatches WE_SELECTED, which would tell the hub to change wallet again.
     */
    // AS3: CollectionsTab.as::onWalletSelectAction()
    private onWalletSelectAction = (): void =>
    {
        if(this._ignoreWalletSelectionEvents) return;

        this._view?.setActiveWalletIndex(this.walletSelection?.selection ?? 0);
    };

    // AS3: CollectionsTab.as::set activeWallet()
    set activeWallet(wallet: string | null)
    {
        const index = this._view?.walletAddresses?.indexOf(wallet ?? '') ?? -1;

        if(index === -1 && wallet !== null)
        {
            log.warn('selected an unavailable wallet');

            return;
        }

        const dropdown = this.walletSelection;

        this._ignoreWalletSelectionEvents = true;

        if(dropdown !== null) dropdown.selection = index;

        this._ignoreWalletSelectionEvents = false;

        this.setReady(false);
        this.requestCollections(wallet);

        const caption = dropdown?.enumerateSelection()[index];

        if(dropdown !== null && caption !== undefined && caption.length > CollectionsTab.WALLET_CAPTION_MAX_LENGTH)
        {
            dropdown.caption = `${caption.substring(0, CollectionsTab.WALLET_CAPTION_MAX_LENGTH)}...`;
        }
    }

    /**
     * Same double guard as the shop's offers handler — waiting flag AND an empty navigation list —
     * so a second collections message cannot duplicate the tree.
     *
     * `_renderableItems.length > 0` is tested *after* `sortSelection.selection = 0`, and reads as
     * dead until you notice that assignment is what fills the array. See the class note.
     */
    // AS3: CollectionsTab.as::onNftCollectionsMessage()
    private onNftCollectionsMessage = (event: IMessageEvent): void =>
    {
        if(!this._waitingForCollections || (this._navigationList?.numListItems ?? 0) !== 0) return;

        const parser = event.parser as NftCollectionsMessageParser | null;

        if(parser === null) return;

        this._waitingForCollections = false;
        this._collections = parser.nftCollections;

        const sort = this.sortSelection;

        if(sort !== null) sort.selection = CollectionsTab.SORT_DEFAULT;

        if(this._renderableItems.length > 0) this.activateCollection(this._renderableItems[0]);

        this.setReady(true);

        const container = this.collectionContainer;

        if(container !== null) container.visible = this._renderableItems.length > 0;
    };

    /**
     * Collections with a non-zero score sort above those without, and the zero group keeps arrival
     * order rather than being sorted too.
     */
    // AS3: CollectionsTab.as::sortCollectionsByScore()
    private static sortCollectionsByScore(collections: NftCollection[]): NftCollection[]
    {
        const scored = collections.filter((c) => c.collectionScore > 0);
        const unscored = collections.filter((c) => c.collectionScore <= 0);

        scored.sort(CollectionsTab.compareByScore);

        return [...scored, ...unscored];
    }

    // AS3: CollectionsTab.as::sortCollectionsByProgress()
    private static sortCollectionsByProgress(collections: NftCollection[]): NftCollection[]
    {
        const started = collections.filter((c) => c.progressPercentage > 0);
        const unstarted = collections.filter((c) => c.progressPercentage <= 0);

        started.sort(CollectionsTab.compareByProgress);

        return [...started, ...unstarted];
    }

    /**
     * Returns -1 for *equal* as well as greater, which is not a valid comparator: it claims a < b
     * and b < a for two equal entries. Flash's sort tolerates it; so does V8's, which falls back to
     * insertion sort for short arrays and is stable for long ones. Ported as written rather than
     * corrected — "fixing" it would reorder equal-scoring collections against the Flash client.
     */
    // AS3: CollectionsTab.as::compareByProgress()
    private static compareByProgress(a: NftCollection, b: NftCollection): number
    {
        if(a.progressPercentage >= b.progressPercentage) return -1;

        if(a.progressPercentage < b.progressPercentage) return 1;

        return 0;
    }

    // AS3: CollectionsTab.as::compareByScore()
    private static compareByScore(a: NftCollection, b: NftCollection): number
    {
        if(a.collectionScore >= b.collectionScore) return -1;

        if(a.collectionScore < b.collectionScore) return 1;

        return 0;
    }

    /**
     * The asymmetry is in the *values*, not the constant names: AS3 declares
     * `COLLECTIBLES_CLAIM_SUCCESS = "COLLECTIBLE_CLAIM_SUCCESS"` (singular string) alongside
     * `COLLECTIBLES_CLAIM_FAIL = "COLLECTIBLES_CLAIM_FAIL"` (plural). Anything listening has to
     * match the strings, not the identifiers.
     */
    // AS3: CollectionsTab.as::sendClaimNotification()
    private sendClaimNotification(success: boolean): void
    {
        const type = success ? CatalogEvent.COLLECTIBLES_CLAIM_SUCCESS : CatalogEvent.COLLECTIBLES_CLAIM_FAIL;

        this._controller.catalog?.events.emit(type, new CatalogEvent(type));
    }

    // AS3: CollectionsTab.as::sendClaimWaitNotification()
    sendClaimWaitNotification(): void
    {
        this._controller.catalog?.events.emit(
            CatalogEvent.COLLECTIBLES_CLAIM_WAIT,
            new CatalogEvent(CatalogEvent.COLLECTIBLES_CLAIM_WAIT)
        );
    }

    /**
     * The notification fires for *any* wallet's result; only the local bookkeeping is gated on the
     * result being for the wallet currently shown. That ordering is AS3's.
     */
    // AS3: CollectionsTab.as::onBonusClaimResult()
    private onBonusClaimResult = (event: IMessageEvent): void =>
    {
        const parser = event.parser as NftBonusItemClaimResultMessageParser | null;

        if(parser === null) return;

        this.sendClaimNotification(parser.success);

        if(this._view?.activeWallet !== parser.walletAddress) return;

        const collection = this.getCollectionById(parser.collectionId);

        if(collection === null) return;

        collection.claimBonusFinished(parser.success);

        if(this._collectionView?.nftCollection.collectionId === parser.collectionId)
        {
            this._collectionView.claimingFinished(true, parser.success);
        }
    };

    // AS3: CollectionsTab.as::onRewardClaimResult()
    private onRewardClaimResult = (event: IMessageEvent): void =>
    {
        const parser = event.parser as NftRewardItemClaimResultMessageParser | null;

        if(parser === null) return;

        this.sendClaimNotification(parser.success);

        if(this._view?.activeWallet !== parser.walletAddress) return;

        const collection = this.getCollectionById(parser.collectionId);

        if(collection === null) return;

        collection.claimRewardFinished(parser.success);

        if(this._collectionView?.nftCollection.collectionId === parser.collectionId)
        {
            this._collectionView.claimingFinished(true, parser.success);
        }
    };

    /** Searches the *rendered nodes*, not `_collections` — so a filtered-out collection is still found. */
    // AS3: CollectionsTab.as::getCollectionById()
    private getCollectionById(collectionId: string): NftCollection | null
    {
        for(const node of this._renderableItems)
        {
            if(node.nftCollection.collectionId === collectionId) return node.nftCollection;
        }

        return null;
    }

    // AS3: CollectionsTab.as::setReady()
    private setReady(ready: boolean): void
    {
        const loaded = this.loadedContainer;
        const loading = this.loadingContainer;

        if(loaded !== null) loaded.visible = ready;
        if(loading !== null) loading.visible = !ready;

        this._isReady = ready;
    }

    // AS3: CollectionsTab.as::requestCollections()
    private requestCollections(wallet: string | null): void
    {
        this.clearNavigationList();
        this._waitingForCollections = true;
        this._controller.send(new GetNftCollectionsComposer(wallet ?? ''));
    }

    // AS3: CollectionsTab.as::get navigationItemTemplate()
    get navigationItemTemplate(): IWindowContainer | null
    {
        return this._navigationItemTemplate;
    }

    /**
     * Note the order: the old panel is disposed *before* `_activeNode` is reassigned, and the new
     * `CollectionView` is built before the node is activated. Rebuilding the panel per activation
     * is AS3's design — the view holds one collection and is thrown away with it.
     */
    // AS3: CollectionsTab.as::activateCollection()
    activateCollection(node: CollectionsNavigationNodeRenderer): void
    {
        if(this._activeNode === node) return;

        this._activeNode?.deactivate();
        this._collectionView?.dispose();

        this._activeNode = node;

        const container = this.collectionContainer;

        if(container !== null)
        {
            this._collectionView = new CollectionView(this, container, node.nftCollection);
        }

        this._activeNode.activate();
    }

    // AS3: CollectionsTab.as::get collectionContainer()
    private get collectionContainer(): IWindowContainer | null
    {
        return this._container?.findChildByName('collection_content') as IWindowContainer | null ?? null;
    }

    // AS3: CollectionsTab.as::get loadingContainer()
    private get loadingContainer(): IWindowContainer | null
    {
        return this._container?.findChildByName('loading_contents') as IWindowContainer | null ?? null;
    }

    // AS3: CollectionsTab.as::get loadedContainer()
    private get loadedContainer(): IWindowContainer | null
    {
        return this._container?.findChildByName('loaded_content') as IWindowContainer | null ?? null;
    }

    // AS3: CollectionsTab.as::clearNavigationList()
    private clearNavigationList(): void
    {
        this._activeNode = null;
        this._navigationList?.removeListItems();

        for(const node of this._renderableItems) node.dispose();

        this._renderableItems = [];
    }

    // AS3: CollectionsTab.as::removeMessageEvents()
    private removeMessageEvents(): void
    {
        for(const event of this._messageEvents) this._controller.removeMessageEvent(event);

        this._messageEvents = [];
    }

    // AS3: CollectionsTab.as::get controller()
    get controller(): CollectiblesController
    {
        return this._controller;
    }

    // AS3: CollectionsTab.as::get activeWallet()
    get activeWallet(): string | null
    {
        return this._view?.activeWallet ?? null;
    }

    // AS3: CollectionsTab.as::get gridItemTemplate()
    get gridItemTemplate(): IWindowContainer | null
    {
        return this._gridItemTemplate;
    }

    // AS3: CollectionsTab.as::get productInfoEntryTemplate()
    get productInfoEntryTemplate(): IWindowContainer | null
    {
        return this._productInfoEntryTemplate;
    }

    // AS3: CollectionsTab.as::get walletSelection()
    private get walletSelection(): IDropMenuWindow | null
    {
        return this._container?.findChildByName('wallet_selection') as IDropMenuWindow | null ?? null;
    }

    // AS3: CollectionsTab.as::get sortSelection()
    private get sortSelection(): IDropMenuWindow | null
    {
        return this._container?.findChildByName('sort_selection') as IDropMenuWindow | null ?? null;
    }

    // AS3: CollectionsTab.as::get searchInput()
    private get searchInput(): ITextFieldWindow | null
    {
        return this._container?.findChildByName('search_input') as ITextFieldWindow | null ?? null;
    }

    // AS3: CollectionsTab.as::get searchPlaceholder()
    private get searchPlaceholder(): IWindow | null
    {
        return this._container?.findChildByName('search_placeholder') ?? null;
    }

    // AS3: CollectionsTab.as::get searchIcon()
    private get searchIcon(): IStaticBitmapWrapperWindow | null
    {
        return this._container?.findChildByName('search_icon') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: CollectionsTab.as::get clearSearchButton()
    private get clearSearchButton(): IWindow | null
    {
        return this._container?.findChildByName('search_clear_button') ?? null;
    }

    // AS3: CollectionsTab.as::update()
    update(elapsedMs: number): void
    {
        if(this._isReady)
        {
            if(this._backgroundStar !== null)
            {
                this._backgroundStar.rotation += CollectionsTab.BG_STAR_ROTATE_SPEED * (elapsedMs / 1000);
                this._backgroundStar.rotation %= 360;
                this._backgroundStar.invalidate();
            }

            this._collectionView?.updateBonusProgressBar(false, elapsedMs);

            return;
        }

        if(this._loadingIcon === null) return;

        this._loadingIcon.rotation += CollectionsTab.LOADING_ICON_ROTATE_SPEED * (elapsedMs / 1000);
        this._loadingIcon.rotation %= 360;
        this._loadingIcon.invalidate();
    }

    // AS3: CollectionsTab.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * AS3 ends by disposing `_SafeStr_5202` after `clearNavigationList()` has already disposed it
     * and nulled the field — dead, exactly as in ShopTab. Dropped. It also never disposes
     * `_collectionView`, which is a real leak there; the port disposes it.
     */
    // AS3: CollectionsTab.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._controller.removeUpdateReceiver(this);

        this._collectionView?.dispose();
        this._collectionView = null;

        this.clearNavigationList();
        this.removeMessageEvents();

        this.walletSelection?.removeEventListener('WE_SELECTED', this.onWalletSelectAction as unknown as (...args: unknown[]) => void);
        this.sortSelection?.removeEventListener('WE_SELECTED', this.onSortSelectAction as unknown as (...args: unknown[]) => void);
        this.searchInput?.removeEventListener('WE_CHANGE', this.onFilterChangeAction as unknown as (...args: unknown[]) => void);
        this.clearSearchButton?.removeEventListener(WindowMouseEvent.CLICK, this.onClearSearchAction as unknown as (...args: unknown[]) => void);

        this._container = null;
        this._navigationList = null;
        this._navigationItemTemplate = null;
        this._gridItemTemplate = null;
        this._productInfoEntryTemplate = null;
        this._backgroundStar = null;
        this._loadingIcon = null;
        this._view = null;
    }
}
