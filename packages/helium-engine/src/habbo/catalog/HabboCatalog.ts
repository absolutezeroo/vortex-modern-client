import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IProductData} from '@habbo/session/product/IProductData';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {RoomPreviewer} from '@habbo/room/preview/RoomPreviewer';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '@habbo/toolbar/HabboToolbarIconEnum';
import {CreditBalanceEvent} from '@habbo/communication/messages/incoming/inventory/purse/CreditBalanceEvent';
import type {
    CreditBalanceEventParser
} from '@habbo/communication/messages/parser/inventory/purse/CreditBalanceEventParser';
import {
    ActivityPointsMessageEvent
} from '@habbo/communication/messages/incoming/notifications/ActivityPointsMessageEvent';
import type {
    ActivityPointsMessageParser
} from '@habbo/communication/messages/parser/notifications/ActivityPointsMessageParser';
import {ScrSendUserInfoEvent} from '@habbo/communication/messages/incoming/users/ScrSendUserInfoEvent';
import type {FrontPageItem} from '@habbo/communication/messages/incoming/catalog/FrontPageItem';
import type {ScrSendUserInfoMessageParser} from '@habbo/communication/messages/parser/users/ScrSendUserInfoMessageParser';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import {GetCreditsInfoComposer} from '@habbo/communication/messages/outgoing/inventory/purse/GetCreditsInfoComposer';
import {GetCatalogPageComposer} from '@habbo/communication/messages/outgoing/catalog/GetCatalogPageComposer';
import {PurchaseFromCatalogComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseFromCatalogComposer';
import {GetProductOfferComposer} from '@habbo/communication/messages/outgoing/catalog/GetProductOfferComposer';
import {CatalogIndexMessageEvent} from '@habbo/communication/messages/incoming/catalog/CatalogIndexMessageEvent';
import type {
    CatalogIndexMessageEventParser
} from '@habbo/communication/messages/parser/catalog/CatalogIndexMessageEventParser';
import {CatalogPageMessageEvent} from '@habbo/communication/messages/incoming/catalog/CatalogPageMessageEvent';
import type {
    CatalogPageMessageEventParser
} from '@habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser';
import {GetCatalogIndexComposer} from '@habbo/communication/messages/outgoing/catalog/GetCatalogIndexComposer';
import {BuildersClubQueryFurniCountMessageComposer} from '@habbo/communication/messages/outgoing/catalog/BuildersClubQueryFurniCountMessageComposer';
import {RedeemVoucherMessageComposer} from '@habbo/communication/messages/outgoing/catalog/RedeemVoucherMessageComposer';
import {VoucherRedeemOkMessageEvent} from '@habbo/communication/messages/incoming/catalog/VoucherRedeemOkMessageEvent';
import type {VoucherRedeemOkMessageEventParser} from '@habbo/communication/messages/parser/catalog/VoucherRedeemOkMessageEventParser';
import {VoucherRedeemErrorMessageEvent} from '@habbo/communication/messages/incoming/catalog/VoucherRedeemErrorMessageEvent';
import type {VoucherRedeemErrorMessageEventParser} from '@habbo/communication/messages/parser/catalog/VoucherRedeemErrorMessageEventParser';
import {GetClubOffersMessageComposer} from '@habbo/communication/messages/outgoing/catalog/GetClubOffersMessageComposer';
import {HabboClubOffersMessageEvent} from '@habbo/communication/messages/incoming/catalog/HabboClubOffersMessageEvent';
import type {HabboClubOffersMessageEventParser} from '@habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser';
import {HabboClubExtendOfferMessageEvent} from '@habbo/communication/messages/incoming/catalog/HabboClubExtendOfferMessageEvent';
import {PurchaseVipMembershipExtensionComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseVipMembershipExtensionComposer';
import {PurchaseBasicMembershipExtensionComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseBasicMembershipExtensionComposer';
import {ClubGiftInfoEvent} from '@habbo/communication/messages/incoming/catalog/ClubGiftInfoEvent';
import type {ClubGiftInfoEventParser} from '@habbo/communication/messages/parser/catalog/ClubGiftInfoEventParser';
import {ClubBuyController} from './club/ClubBuyController';
import {ClubExtendController} from './club/ClubExtendController';
import {ClubGiftController} from './club/ClubGiftController';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IDisposable} from '@core/runtime/IDisposable';
import {PurchaseConfirmationDialog} from './purchase/PurchaseConfirmationDialog';
import type {IHabboCatalog} from './IHabboCatalog';
import type {IPurchasableOffer} from './IPurchasableOffer';
import type {ICatalogNavigator} from './navigation/ICatalogNavigator';
import {CatalogNavigator} from './navigation/CatalogNavigator';
import {RequestedPage} from './navigation/RequestedPage';
import {CatalogViewer} from './viewer/CatalogViewer';
import {PageLocalization} from './viewer/PageLocalization';
import {Offer} from './viewer/Offer';
import {Product} from './viewer/Product';
import {HabboCatalogUtils} from './HabboCatalogUtils';
import {WindowToggle} from '@habbo/utils/WindowToggle';
import {CatalogEvent} from './event/CatalogEvent';
import {CatalogEarnings} from './CatalogEarnings';
import {Purse} from './purse/Purse';
import {PurseEvent} from './purse/PurseEvent';
import {PurseUpdateEvent} from './purse/PurseUpdateEvent';

const log = Logger.getLogger('HabboCatalog');

/**
 * Habbo catalog component.
 *
 * This restores the AS3 purse event flow used by the toolbar: incoming purse
 * messages update the catalog-owned `Purse`, then emit `PurseEvent`.
 *
 * @see sources/win63_version/habbo/catalog/HabboCatalog.as
 */
export class HabboCatalog extends Component implements IHabboCatalog 
{
    private _communication: IHabboCommunicationManager | null = null;
    private _toolbar: IHabboToolbar | null = null;

    private _tracking: IHabboTracking | null = null;
    private _mainWindow: IWindowContainer | null = null;
    private _catalogNavigators: Map<string, CatalogNavigator> | null = null;
    private _catalogViewer: CatalogViewer | null = null;
    private _requestedPage: RequestedPage = new RequestedPage();
    private _initialized: boolean = false;
    private _pendingPageId: number = 0;
    private _messageEvents: IMessageEvent[] = [];
    private _purse: Purse = new Purse();

    private _clubBuyController: ClubBuyController | null = null;

    private _clubExtendController: ClubExtendController | null = null;

    private _clubGiftController: ClubGiftController | null = null;
    private _earnings: CatalogEarnings = new CatalogEarnings();
    private _purchaseWillBeGift: boolean = false;
    private _purchaseConfirmationDialog: PurchaseConfirmationDialog | null = null;

    constructor(context: IContext, assetLibrary: IAssetLibrary | null = null) 
    {
        super(context, 0, assetLibrary);
    }

    private _windowManager: IHabboWindowManager | null = null;

    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // TS-only: no direct AS3 equivalent (AS3's HabboTracking is reached via a global singleton,
    // HabboTracking.getInstance()) - exposed here so HabboCatalogUtils's
    // spinnerValueChangedEventTrack()/bundlesInfoShownEventTrack()/discountShownEventTrack() can
    // reach it through the existing DI ComponentDependency pattern instead.
    get tracking(): IHabboTracking | null
    {
        return this._tracking;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get mainContainer()
    get mainContainer(): IWindowContainer | null
    {
        return this._mainWindow;
    }

    private _localization: IHabboLocalizationManager | null = null;

    get localization(): IHabboLocalizationManager | null 
    {
        return this._localization;
    }

    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null 
    {
        return this._sessionDataManager;
    }

    private _avatarRenderManager: IAvatarRenderManager | null = null;

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get avatarRenderManager()
    get avatarRenderManager(): IAvatarRenderManager | null 
    {
        return this._avatarRenderManager;
    }

    private _roomEngine: IRoomEngine | null = null;

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get roomEngine()
    get roomEngine(): IRoomEngine | null 
    {
        return this._roomEngine;
    }

    private _utils: HabboCatalogUtils = new HabboCatalogUtils(this);

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get utils()
    get utils(): HabboCatalogUtils 
    {
        return this._utils;
    }

    private _giftReceiver: string = '';

    get giftReceiver(): string 
    {
        return this._giftReceiver;
    }

    set giftReceiver(value: string) 
    {
        this._giftReceiver = value;
    }

    private _catalogType: string = 'NORMAL';

    get catalogType(): string 
    {
        return this._catalogType;
    }

    private _videoOffers: { readonly enabled: boolean } = {enabled: false};

    get videoOffers(): { readonly enabled: boolean } 
    {
        return this._videoOffers;
    }

    private _roomPreviewer: RoomPreviewer | null = null;

    // config flag are enforced here.
    get roomPreviewer(): RoomPreviewer | null 
    {
        if(this._roomPreviewer == null) 
        {
            this.initializeRoomPreviewer();
        }

        return this._roomPreviewer;
    }

    get assets(): IAssetLibrary | null 
    {
        return super.assets;
    }

    get connection(): IConnection | null 
    {
        return this._communication?.connection ?? null;
    }

    get privateRoomSessionActive(): boolean 
    {
        return false;
    }

    get tradingActive(): boolean 
    {
        return false;
    }

    get imageGalleryHost(): string 
    {
        return this.getProperty('image.library.catalogue.url');
    }

    get buildersClubEnabled(): boolean 
    {
        return this.getBoolean('builders.club.enabled');
    }

    get collectorHub(): unknown | null
    {
        return null;
    }

    private _frontPageItems: FrontPageItem[] | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::get frontPageItems()
    get frontPageItems(): FrontPageItem[] | null
    {
        return this._frontPageItems;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get roomPreviewer()
    // TODO(AS3): AS3 also requires _roomEngine.isInitialized; IRoomEngine has no isInitialized
    // accessor yet (see RoomPreviewer.isRoomEngineReady's own note), so only the null check and

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get multiplePurchaseEnabled()
    get multiplePurchaseEnabled(): boolean 
    {
        return this.getBoolean('catalog.multiple.purchase.enabled') && this._catalogType !== 'BUILDERS_CLUB';
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get bundleDiscountEnabled()
    get bundleDiscountEnabled(): boolean 
    {
        return this._catalogType !== 'BUILDERS_CLUB';
    }

    // loaded yet").
    get bundleDiscountRuleset(): unknown | null 
    {
        return null;
    }

    // every offer except that flow.
    get roomAdPurchaseData(): { offerId: number; flatId: number; name: string } | null 
    {
        return null;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::get bundleDiscountRuleset()
    // The bundle-discount ruleset is set from a config message this port doesn't parse yet;
    // always null means bundle-quantity discounts don't apply, which is safe (matches "not

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get currentCatalogNavigator()
    get currentCatalogNavigator(): ICatalogNavigator | null 
    {
        return this.getCatalogNavigator(this._catalogType);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected override get dependencies(): Array<ComponentDependency<any>> 
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => 
                {
                    this._communication = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => 
                {
                    this._windowManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => 
                {
                    this._localization = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) => 
                {
                    this._sessionDataManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_AvatarRenderManager,
                (manager: IAvatarRenderManager | null) => 
                {
                    this._avatarRenderManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (manager: IRoomEngine | null) => 
                {
                    this._roomEngine = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) => 
                {
                    if(this._toolbar) 
                    {
                        this._toolbar.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
                    }

                    this._toolbar = toolbar;

                    if(toolbar)
                    {
                        toolbar.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
                    }
                },
                false
            ),
            new ComponentDependency(
                IID_HabboTracking,
                (tracking: IHabboTracking | null) =>
                {
                    this._tracking = tracking;
                },
                false
            ),
        ];
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::getFurnitureDataByName()
    getFurnitureDataByName(name: string, productType: string): IFurnitureData | null 
    {
        if(this._sessionDataManager == null) return null;

        if(productType === 's') return this._sessionDataManager.getFloorItemDataByName(name);

        if(productType === 'i') return this._sessionDataManager.getWallItemDataByName(name);

        return null;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::get roomAdPurchaseData()
    // The room-ad purchase flow (extend-rental-from-room-ad) isn't ported; always null means
    // PurchaseCatalogWidget's room-ad-specific checks are always skipped, which is correct for

    // AS3's HabboCatalog itself doubles as a config accessor (getBoolean/getProperty/propertyExists
    // are already inherited from Component, delegating to context.configuration - these two
    // mirror that same pattern for the two config methods Component doesn't already expose).
    interpolate(value: string): string
    {
        return this.context.configuration?.interpolate(value) ?? value;
    }

    updateUrlProtocol(url: string): string
    {
        return this.context.configuration?.updateUrlProtocol(url) ?? url;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::purchaseWillBeGift()
    purchaseWillBeGift(isGift: boolean): void
    {
        this._purchaseWillBeGift = isGift;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseProduct()
    // TODO(AS3): the roomAdPurchaseData-based extend/replace branch is not ported - roomAdPurchaseData
    // is a pre-existing always-null stub on this port (see its own getter's note), so the real AS3
    // condition (`roomAdPurchaseData == null || roomAdPurchaseData.offerId != offerId`) is always
    // true here, matching the simple PurchaseFromCatalogComposer path unconditionally.
    purchaseProduct(pageId: number, offerId: number, extraParam: string = '', quantity: number = 1): void
    {
        this.connection?.send(new PurchaseFromCatalogComposer(pageId, offerId, extraParam, quantity));
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::purchaseVipMembershipExtension()
    purchaseVipMembershipExtension(offerId: number): void
    {
        this.connection?.send(new PurchaseVipMembershipExtensionComposer(offerId));
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::purchaseBasicMembershipExtension()
    purchaseBasicMembershipExtension(offerId: number): void
    {
        this.connection?.send(new PurchaseBasicMembershipExtensionComposer(offerId));
    }

    // TODO(AS3): sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::doNotCloseAfterVipPurchase()
    // Sibling of the pre-existing rememberPageDuringVipPurchase()/forgetPageDuringVipPurchase()
    // stubs below - all three back the same deferred "reopen the remembered page after a club
    // purchase" flow (see onSubscriptionInfo()'s own TODO).
    doNotCloseAfterVipPurchase(): void
    {
    }

    // TODO(AS3): sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::forgetPageDuringVipPurchase()
    forgetPageDuringVipPurchase(): void
    {
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::sendRoomAdPurchaseInitiatedEvent()
    // Needs RoomAdPurchaseInitiatedComposer, which isn't ported. Only reachable from a
    // "ROOM_INITIATE_PURCHASE"-tagged purchase widget layout, which the ported catalog pages

    // don't use yet.
    sendRoomAdPurchaseInitiatedEvent(): void 
    {
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::rememberPageDuringVipPurchase()
    // Stores the page name to return to after a club upsell purchase; not wired to any caller yet
    // (PurchaseCatalogWidget's onBuyClub isn't attached to a button in the ported layouts).
    rememberPageDuringVipPurchase(_pageId: number): void 
    {
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::requestSelectedItemToMover()
    // Needs CatalogObjectMover (drag-offer-into-room-canvas flow), which isn't ported (see
    // Offer.ts's port notes).
    requestSelectedItemToMover(_receiver: unknown, _offer: IPurchasableOffer, _placeMany: boolean = false): void
    {
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::showPurchaseConfirmation()
    // TODO(AS3): this port's PurchaseConfirmationDialog is a minimal confirm/cancel dialog -
    // see its own file header for what AS3 sub-flows (gifting, gift wrapping, spending
    // disclaimer, room-ad extension) are not yet ported.
    showPurchaseConfirmation(
        offer: IPurchasableOffer,
        pageId: number,
        extraParam: string = '',
        quantity: number = 1,
        stuffData: IStuffData | null = null,
        _giftMessage: string | null = null
    ): void 
    {
        if(pageId === -12345678) 
        {
            const nodes = this.currentCatalogNavigator?.getNodesByOfferId(offer.offerId, true);

            if(nodes != null && nodes.length > 0) 
            {
                pageId = nodes[0]!.pageId;
            }
        }

        log.debug(`buy: ${[quantity, offer.offerId, extraParam]}`);

        const priceInCredits = offer.priceInCredits;
        const priceInActivityPoints = offer.priceInActivityPoints;

        if(priceInCredits > 0 && priceInCredits > this._purse.credits) 
        {
            this.showNotEnoughCreditsAlert();

            return;
        }

        if(priceInActivityPoints > 0 && priceInActivityPoints > this._purse.getActivityPointsForType(offer.activityPointType)) 
        {
            this.showNotEnoughActivityPointsAlert(offer.activityPointType);

            return;
        }

        if(this._purchaseConfirmationDialog == null || this._purchaseConfirmationDialog.disposed) 
        {
            this._purchaseConfirmationDialog = new PurchaseConfirmationDialog(this, this._windowManager!);
        }

        this._purchaseConfirmationDialog.showOffer(offer, pageId, extraParam, quantity, stuffData, this._purchaseWillBeGift);
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::getSeasonalCurrencyActivityPointType()
    getSeasonalCurrencyActivityPointType(): number 
    {
        return this.getInteger('seasonalcurrencyindicator.currency', 1);
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::setLeftPaneVisibility()
    // Toggles the navigator/search pane's visibility on the catalog's main window
    // (`navigationContainer`/`searchContainer`) - real logic, but a no-op until
    // createMainWindow() (Phase 5: real openCatalog/loadCatalogPage wiring) exists.
    public setLeftPaneVisibility(visible: boolean): void 
    {
        if(!this._mainWindow) return;

        const navigationContainer = this._mainWindow.findChildByName('navigationContainer');

        if(navigationContainer) 
        {
            navigationContainer.visible = visible;
        }

        const searchContainer = this._mainWindow.findChildByName('searchContainer');

        if(searchContainer) 
        {
            searchContainer.visible = visible;
        }
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::redeemVoucher()
    public redeemVoucher(voucher: string): void
    {
        this.connection?.send(new RedeemVoucherMessageComposer(voucher));
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::loadCatalogPage()
    public loadCatalogPage(pageId: number, offerId: number, catalogType: string): void
    {
        this._pendingPageId = pageId;
        this.connection?.send(new GetCatalogPageComposer(pageId, offerId, catalogType));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::sendGetProductOffer()
    // TODO(AS3): the response (ProductOfferEvent/onProductOffer) isn't ported yet - it needs a
    // full offer/product reconstruction (same shape as the catalog-page response) plus
    // CatalogPage.updateLimitedItemsLeft()/ProductOfferUpdatedEvent wiring. The request goes out
    // correctly, but nothing currently updates the UI when the reply arrives.
    public sendGetProductOffer(offerId: number): void
    {
        this.connection?.send(new GetProductOfferComposer(offerId));
    }

    public getRecyclerStatus(): void 
    {
    }

    public getRecyclerPrizes(): void 
    {
    }

    public sendRecycleItems(_items: unknown[]): void 
    {
    }

    // tracked). The core open/close/navigate flow is real.
    public toggleCatalog(catalogType: string, forceOpen: boolean = false, showMainWindow: boolean = true): void 
    {
        if(!this._sessionDataManager?.hasSecurity(5) && !this.buildersClubEnabled) 
        {
            catalogType = 'NORMAL';
        }

        const catalogTypeChanged = catalogType !== this._catalogType;

        this._catalogType = catalogType;
        // TODO(AS3): cancelFurniInMover() - CatalogObjectMover isn't ported (see Offer.ts's notes).

        if(this._mainWindow == null) 
        {
            if(!this.init()) return;
        }

        if(this.currentCatalogNavigator == null || !this.currentCatalogNavigator.initialized) 
        {
            this.refreshCatalogIndex(this._catalogType);
        }

        if(!this.mainWindowVisible() || forceOpen || catalogTypeChanged) 
        {
            this.showMainWindow();
        }
        else if(!WindowToggle.isHiddenByOtherWindows(this._mainWindow!)) 
        {
            this.hideMainWindow();
        }

        if(this.mainWindowVisible()) 
        {
            this._mainWindow!.activate();

            const searchInput = this._mainWindow!.findChildByName('search.input') as unknown as ITextFieldWindow | null;

            if(searchInput) 
            {
                searchInput.focus();
                searchInput.setSelection(0, searchInput.text.length);
            }
        }

        if(this._mainWindow != null) 
        {
            this._mainWindow.color = catalogType === 'NORMAL' ? 4296112 : 16758076;
            this._mainWindow.caption = catalogType === 'NORMAL' ? '${catalog.title}' : '${builder.catalog.title}';

            const border = this._mainWindow.findChildByName('catalog.header.background.border');

            if(border) border.color = catalogType === 'NORMAL' ? 4281819765 : 4283320388;

            const body = this._mainWindow.findChildByName('catalog.header.background.body');

            if(body) body.color = catalogType === 'NORMAL' ? 4279123794 : 4281149220;

            const catalogHeader = this._mainWindow.findChildByName('catalog.mode.header');

            if(catalogHeader) catalogHeader.visible = catalogType === 'NORMAL';

            const builderHeader = this._mainWindow.findChildByName('builder.mode.header');

            if(builderHeader) builderHeader.visible = catalogType === 'BUILDERS_CLUB';
        }

        if(catalogTypeChanged && this.currentCatalogNavigator != null) 
        {
            if(showMainWindow) 
            {
                this.currentCatalogNavigator.deactivateCurrentNode();
                this.currentCatalogNavigator.loadFrontPage();
            }

            this.currentCatalogNavigator.showIndex();
            this._catalogViewer?.setForceRefresh();
        }
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::toggleCatalog()
    // TODO(AS3): several secondary effects are not wired yet, each because their backing system
    // isn't ported: new-additions badge clearing (markNewAdditionPageOpened() needs
    // MarkCatalogNewAdditionsPageOpenedComposer), recycler activate/cancel on open/close
    // (Recycler isn't ported), refreshBuilderStatus() (Builders Club membership timers aren't

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::openCatalog()
    public openCatalog(): void 
    {
        this.toggleCatalog('NORMAL', true);
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::openCatalogPage()
    public openCatalogPage(pageName: string, catalogType: string | null = null): void 
    {
        this.toggleCatalog(catalogType ?? 'NORMAL', true, false);

        if(!this._initialized || this._catalogNavigators == null || !this.currentCatalogNavigator!.initialized) 
        {
            this._requestedPage.requestByName = pageName;

            return;
        }

        this.currentCatalogNavigator!.openPage(pageName);
    }

    // ported (same deferred area as the in-room "buy this placed item" flow noted in Offer.ts).
    public openRoomAdCatalogPageInExtendedMode(
        _roomId: string,
        _roomName: string,
        _flatId: string,
        _description: string,
        _expiration: Date,
        _categoryId: number
    ): void 
    {
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::openRoomAdCatalogPageInExtendedMode()
    // Needs RoomAdPurchaseData + getRoomAdsPurchaseInfo() - the room-ad purchase flow isn't

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::openCatalogPageById()
    public openCatalogPageById(pageId: number, offerId: number, catalogType: string): void 
    {
        if(this._initialized && this._catalogNavigators != null && this.getCatalogNavigator(catalogType)?.initialized) 
        {
            this.toggleCatalog(catalogType, true, false);
            this._catalogViewer?.setForceRefresh();
            this.currentCatalogNavigator!.openPageById(pageId, offerId);
        }
        else 
        {
            this.toggleCatalog(catalogType);
            this._requestedPage.requestById = pageId;
            this._requestedPage.requestedOfferId = offerId;
        }
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::openCatalogPageByOfferId()
    public openCatalogPageByOfferId(offerId: number, catalogType: string): void 
    {
        this.openCatalogPageById(-12345678, offerId, catalogType);
    }

    public openInventoryCategory(category: string): void 
    {
        this.context.createLinkEvent(`inventory/open/${category}`);
    }

    public openCreditsHabblet(): void 
    {
        this.context.createLinkEvent('habblet/open/credits');
    }

    public setupInventoryForRecycler(_enabled: boolean): void 
    {
    }

    public requestInventoryFurniToRecycler(): number 
    {
        return 0;
    }

    public returnInventoryFurniFromRecycler(_itemId: number): boolean 
    {
        return false;
    }

    public getProductData(localizationId: string): IProductData | null 
    {
        return this._sessionDataManager?.getProductData(localizationId) ?? null;
    }

    // instead of returning it - reconstructed to return the looked-up data.
    public getFurnitureData(classId: number, productType: string): IFurnitureData | null 
    {
        if(productType === 's') return this._sessionDataManager?.getFloorItemData(classId) ?? null;
        if(productType === 'i') return this._sessionDataManager?.getWallItemData(classId) ?? null;

        return null;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::getFurnitureData()
    // The decompiled source computes the result into a local but always `return null`s

    public getPixelEffectIcon(_effectId: number): ImageBitmap | null 
    {
        return null;
    }

    public getSubscriptionProductIcon(_productId: number): ImageBitmap | null 
    {
        return null;
    }

    // Defaulting to false (drag-and-drop disabled) rather than guessing at the gating logic.
    public isDraggable(_offer: IPurchasableOffer): boolean 
    {
        return false;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::isDraggable()
    // Real logic needs room-session state (isRoomOwner/isGuildRoom/roomControllerLevel),
    // the active navigator page's allowDragging, and Builders Club furniture-placement
    // status (getBuilderFurniPlaceableStatusForOffer(), itself dependent on room-session
    // furniture counts) - none of that catalog/room-session cross-wiring exists yet.

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::getBuilderFurniPlaceableStatusForOffer()
    // TODO(AS3): real logic needs builderFurniCount/builderFurniLimit and roomSession
    // (isRoomOwner/isGuildRoom/roomControllerLevel/userDataManager, none of which are wired on
    // this port yet) via the further getBuilderFurniPlaceableStatus() - always returning 0
    // ("placeable") is the safe default: BuilderCatalogWidget's place buttons stay enabled and
    // show no false error, and the actual placement action (requestSelectedItemToMover()) is
    // itself still a CatalogObjectMover-blocked stub, so nothing is placed either way yet.
    public getBuilderFurniPlaceableStatusForOffer(_offer: IPurchasableOffer | null): number
    {
        if(_offer == null) return 1;

        return 0;
    }

    // path isn't wired up yet. The synchronous cache-hit path is implemented for real.
    public setImageFromAsset(target: unknown, assetName: string | null, _onAssetReady?: ((event: unknown) => void) | null): void 
    {
        if(!assetName || !this.assets) return;

        const asset = this.assets.getAssetByName(assetName);

        if(!asset || !target) return;

        (target as { bitmap: ImageBitmap | null }).bitmap = asset.content as ImageBitmap;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::setImageFromAsset()
    // Real logic loads a named asset from the asset library and, on a cache miss, retrieves
    // it via retrievePreviewAsset() (async network fetch) before applying it - that fetch

    public getPurse(): Purse
    {
        return this._purse;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::getClubBuyController()
    // Controllers are created eagerly in initComponent() (see createClubBuyController() etc.
    // below), not lazily here - matches AS3, where these are plain field getters.
    public getClubBuyController(): ClubBuyController | null
    {
        return this._clubBuyController;
    }

    private createClubBuyController(): void
    {
        if(this._clubBuyController == null)
        {
            this._clubBuyController = new ClubBuyController(this, this.connection);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::getClubExtendController()
    public getClubExtendController(): ClubExtendController | null
    {
        return this._clubExtendController;
    }

    private createClubExtendController(): void
    {
        if(this._clubExtendController == null)
        {
            this._clubExtendController = new ClubExtendController(this);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::getClubGiftController()
    public getClubGiftController(): ClubGiftController | null
    {
        return this._clubGiftController;
    }

    private createClubGiftController(): void
    {
        if(this._clubGiftController == null)
        {
            this._clubGiftController = new ClubGiftController(this);
        }
    }

    public getEarnings(): CatalogEarnings
    {
        return this._earnings;
    }

    public getRecycler(): unknown | null 
    {
        return null;
    }

    public getMarketPlace(): unknown | null 
    {
        return null;
    }

    public getPublicMarketPlaceOffers(_minPrice: number, _maxPrice: number, _searchQuery: string, _filter: number): void 
    {
    }

    public getOwnMarketPlaceOffers(): void 
    {
    }

    public buyMarketPlaceOffer(_offerId: number): void 
    {
    }

    public redeemSoldMarketPlaceOffers(): void 
    {
    }

    public redeemExpiredMarketPlaceOffer(_offerId: number): void 
    {
    }

    public getMarketplaceItemStats(_furniType: number, _furniCategory: number): void 
    {
    }

    public showNotEnoughCreditsAlert(): void 
    {
    }

    public showNotEnoughActivityPointsAlert(_activityPointType: number): void 
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::getHabboClubOffers()
    public getHabboClubOffers(source: number): void
    {
        this.connection?.send(new GetClubOffersMessageComposer(source));
    }

    public openClubCenter(): void 
    {
        this.context.createLinkEvent('habboUI/open/hccenter');
    }

    public openVault(): void 
    {
        this.context.createLinkEvent('habboUI/open/vault');
    }

    public verifyClubLevel(_clubLevel: number = 1): boolean 
    {
        return true;
    }

    public buySnowWarTokensOffer(_localizationId: string): void 
    {
    }

    public showVipBenefits(): void 
    {
    }

    public displayProductIcon(productType: string, classId: number, target: unknown): void 
    {
        this._utils.displayProductIcon(productType, classId, target as IBitmapWrapperWindow);
    }

    public openRentConfirmationWindow(
        _data: unknown,
        _isWallItem: boolean,
        _extraParam: number = -1,
        _price: number = -1,
        _rent: boolean = false
    ): void 
    {
    }

    public toggleBuilderCatalog(): void 
    {
        this.toggleCatalog('BUILDERS_CLUB');
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::getCatalogNavigator()
    public getCatalogNavigator(catalogType: string): ICatalogNavigator | null 
    {
        return this._catalogNavigators?.get(catalogType) ?? null;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::useNonTabbedCatalog()
    public useNonTabbedCatalog(): boolean 
    {
        return this.getBoolean('client.desktop.use.non.tabbed.catalog');
    }

    public getOfferCenter(_extension: unknown): unknown | null 
    {
        return null;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::init()
    // TODO(AS3): several one-time setup steps are still skipped, each because their backing
    // system isn't ported yet: refreshFurniData(), createRecycler(), createMarketPlace(),
    // getGiftWrappingConfiguration(), createGroupMembershipsController(), initBundleDiscounts().
    // createClubGiftController()/createClubBuyController()/createClubExtendController() (the
    // club/ purchase controllers - separate from the already-ported clubcenter/ status display)
    // are now real - see below. The core main-window/navigator/

    public itemAddedToInventory(_classId: number, _itemId: number, _category: number): void 
    {
    }

    // AS3 loads this via assets.getAssetByName(name).content + buildFromXML(); this port
    // pre-compiles window layouts into a named registry instead (see IHabboWindowManager

    public getActivityPointName(activityPointType: number): string 
    {
        return this._localization?.getLocalization(`achievements.activitypoint.${activityPointType}`, '') ?? '';
    }

    public canPlaceWithBC(): boolean 
    {
        return false;
    }

    override dispose(): void 
    {
        if(this._disposed) return;

        if(this._communication) 
        {
            for(const event of this._messageEvents) 
            {
                this._communication.removeMessageEvent(event);
            }
        }

        this._messageEvents.length = 0;
        this._communication = null;
        this._windowManager = null;
        this._localization = null;
        super.dispose();
    }

    protected override initComponent(): void 
    {
        this.addMessageEvent(new CreditBalanceEvent(this.onCreditBalance.bind(this)));
        this.addMessageEvent(new ActivityPointsMessageEvent(this.onActivityPoints.bind(this)));
        this.addMessageEvent(new CatalogIndexMessageEvent(this.onCatalogIndex.bind(this)));
        this.addMessageEvent(new CatalogPageMessageEvent(this.onCatalogPage.bind(this)));
        this.addMessageEvent(new ScrSendUserInfoEvent(this.onSubscriptionInfo.bind(this)));
        this.addMessageEvent(new VoucherRedeemOkMessageEvent(this.onVoucherRedeemOk.bind(this)));
        this.addMessageEvent(new VoucherRedeemErrorMessageEvent(this.onVoucherRedeemError.bind(this)));
        this.addMessageEvent(new HabboClubOffersMessageEvent(this.onHabboClubOffers.bind(this)));
        this.addMessageEvent(new HabboClubExtendOfferMessageEvent(this.onHabboClubExtendOffer.bind(this)));
        this.addMessageEvent(new ClubGiftInfoEvent(this.onClubGiftInfo.bind(this)));
        this.connection?.send(new GetCreditsInfoComposer());
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::initializeRoomPreviewer()
    private initializeRoomPreviewer(): void 
    {
        if(this._roomEngine != null && this.getBoolean('catalog.furniture.animation')) 
        {
            if(this._roomPreviewer == null) 
            {
                this._roomPreviewer = new RoomPreviewer(this._roomEngine);
                this._roomPreviewer.createRoomForPreviews();
            }
        }
    }

    // viewer setup is real.
    private init(): boolean 
    {
        if(this._initialized) return false;

        this.createMainWindow();
        this.createCatalogNavigators();
        this.createCatalogViewer();
        this.updatePurse();
        this.createClubGiftController();
        this.createClubBuyController();
        this.createClubExtendController();
        this._initialized = true;
        this.events.emit(CatalogEvent.CATALOG_INITIALIZED, new CatalogEvent(CatalogEvent.CATALOG_INITIALIZED));
        this.connection?.send(new BuildersClubQueryFurniCountMessageComposer());

        return true;
    }

    // buildWidgetLayout() doc: "AS3: buildFromXML(assets.getAssetByName(name).content as XML)").
    private createMainWindow(): void 
    {
        const assetName = this.useNonTabbedCatalog() ? 'catalog_ubuntu' : 'catalog_ubuntu_with_tabs';

        this._mainWindow = this._windowManager!.buildWidgetLayout(assetName, 1) as unknown as IWindowContainer;
        this._mainWindow.tags.push('habbo_catalog');
        this._mainWindow.position = {x: 100, y: 5};
        this.hideMainWindow();

        const closeButton = this._mainWindow.findChildByName('titlebar_close_button') ?? this._mainWindow.findChildByTag('close');

        if(closeButton) 
        {
            closeButton.addEventListener('WME_CLICK', this.onWindowClose);
        }

        const searchInput = this._mainWindow.findChildByName('search.input') as unknown as ITextFieldWindow | null;

        if(searchInput) 
        {
            searchInput.setSelection(0, searchInput.text.length);
            searchInput.focus();
        }
    }

    private createCatalogNavigators(): void 
    {
        this._catalogNavigators = new Map();
        this._catalogNavigators.set('NORMAL', new CatalogNavigator(this, this._mainWindow!, 'NORMAL'));
        this._catalogNavigators.set('BUILDERS_CLUB', new CatalogNavigator(this, this._mainWindow!, 'BUILDERS_CLUB'));
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::updatePurse()
    // win63's decompile of this method is corrupted (literal `if(true)`/`if(false)` branches
    // replacing the real hasClubLeft/isVIP checks) - ported from the clean vortex-client
    // reference instead. This replaces the previous setElementImage('creditsIcon'/'pixelsIcon'/
    // 'clubIcon', ...) calls, which were a DIFFERENT (dead, non-bitmap-based in the real client)
    // code path that doesn't match this layout's actual elements - updatePurse() only touches
    // clubIcon/clubText via IIconWindow.style, and registers localization parameters that
    // ${catalog.purse.creditbalance}/${catalog.purse.pixelbalance} template captions elsewhere
    // resolve on their own.
    private updatePurse(): void
    {
        if(this._mainWindow == null) return;

        this._localization?.registerParameter('catalog.purse.creditbalance', 'balance', String(this._purse.credits));
        this._localization?.registerParameter('catalog.purse.pixelbalance', 'balance', String(this._purse.getActivityPointsForType(0)));

        let style = 11;
        let key: string;

        if(!this._purse.hasClubLeft)
        {
            key = 'catalog.purse.club.join';
        }
        else
        {
            if(this._purse.isVIP)
            {
                key = 'catalog.purse.vipdays';
                style = 12;
            }
            else
            {
                key = 'catalog.purse.clubdays';
            }

            this._localization?.registerParameter(key, 'days', String(this._purse.clubDays));
            this._localization?.registerParameter(key, 'months', String(this._purse.clubPeriods));
        }

        const clubIcon = this._mainWindow.findChildByName('clubIcon');

        if(clubIcon != null)
        {
            clubIcon.style = style;
        }

        const clubText = this._mainWindow.findChildByName('clubText');

        if(clubText != null)
        {
            clubText.caption = this._localization?.getLocalization(key) ?? '';
        }
    }

    private createCatalogViewer(): void 
    {
        const layoutContainer = this._mainWindow!.findChildByName('layoutContainer') as unknown as IWindowContainer;

        this._catalogViewer = new CatalogViewer(this, layoutContainer);
    }

    private showMainWindow(): void 
    {
        if(this._windowManager != null && this._mainWindow != null && this._mainWindow.parent == null) 
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            desktop?.addChild(this._mainWindow);
        }
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::onCatalogIndex()
    // TODO(AS3): the new-additions auto-open branch (var_2609/var_4292/newAdditionsPageOpenDisabled)

    private hideMainWindow(): void 
    {
        if(this._windowManager != null && this._mainWindow != null && this._mainWindow.parent != null) 
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null) 
            {
                desktop.removeChild(this._mainWindow);
                this._catalogViewer?.catalogWindowClosed();
            }
        }
    }

    private mainWindowVisible(): boolean 
    {
        return this._windowManager != null && this._mainWindow != null && this._mainWindow.parent != null;
    }

    private setElementImage(elementName: string, assetName: string): void 
    {
        const element = this._mainWindow?.findChildByName(elementName) as unknown as IBitmapWrapperWindow | null;

        if(element == null) 
        {
            log.warn(`Could not find element: ${elementName}`);

            return;
        }

        const asset = this.assets?.getAssetByName(assetName);

        if(asset) 
        {
            element.bitmap = asset.content as ImageBitmap;
        }
    }

    private refreshCatalogIndex(catalogType: string): void 
    {
        this.connection?.send(new GetCatalogIndexComposer(catalogType));
    }

    private onWindowClose = (_event: WindowEvent): void => 
    {
        this.hideMainWindow();
        this._catalogViewer?.catalogWindowClosed();
    };

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::onHabboToolbarEvent()
    private onHabboToolbarEvent = (event: HabboToolbarEvent): void => 
    {
        if(event.type !== HabboToolbarEvent.TOOLBAR_CLICK) return;

        switch(event.iconId) 
        {
            case HabboToolbarIconEnum.CATALOGUE:
                this.toggleCatalog('NORMAL');
                break;
            case HabboToolbarIconEnum.BUILDER:
                this.toggleCatalog('BUILDERS_CLUB');
                break;
        }
    };

    // isn't ported - always falls through to loadFrontPage() for a fresh index.
    private onCatalogIndex(event: IMessageEvent): void 
    {
        const parser = event.parser as CatalogIndexMessageEventParser | null;

        if(!parser || !parser.root) return;

        const navigator = this.getCatalogNavigator(parser.catalogType);

        if(navigator == null) return;

        navigator.buildCatalogIndex(parser.root);

        if(parser.catalogType === this._catalogType) 
        {
            navigator.showIndex();
        }

        switch(this._requestedPage.requestType) 
        {
            case RequestedPage.REQUEST_TYPE_ID:
                navigator.openPageById(this._requestedPage.requestId, this._requestedPage.requestedOfferId);
                this._requestedPage.resetRequest();
                break;
            case RequestedPage.REQUEST_TYPE_NAME:
                navigator.openPage(this._requestedPage.requestName);
                this._requestedPage.resetRequest();
                break;
            default:
                navigator.loadFrontPage();
        }
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::onCatalogPage()
    private onCatalogPage(event: IMessageEvent): void 
    {
        const parser = event.parser as CatalogPageMessageEventParser | null;

        if(!parser || parser.catalogType !== this._catalogType) return;

        const localization = new PageLocalization(
            [...(parser.localization?.images ?? [])],
            [...(parser.localization?.texts ?? [])]
        );

        const offers: IPurchasableOffer[] = [];

        for(const offerData of parser.offers) 
        {
            const products = offerData.products.map((productData) => new Product(
                productData.productType,
                productData.furniClassId,
                productData.extraParam,
                productData.productCount,
                this.getProductData(offerData.localizationId),
                this.getFurnitureData(productData.furniClassId, productData.productType),
                this,
                productData.uniqueLimitedItem,
                productData.uniqueLimitedItemSeriesSize,
                productData.uniqueLimitedItemsLeft
            ));

            if(products.length === 0 && !HabboCatalogUtils.buildersClub(offerData.localizationId)) continue;

            const offer = new Offer(
                offerData.offerId,
                offerData.localizationId,
                offerData.isRent,
                offerData.priceInCredits,
                offerData.priceInActivityPoints,
                offerData.activityPointType,
                offerData.priceInSilver,
                offerData.giftable,
                offerData.clubLevel,
                products,
                offerData.bundlePurchaseAllowed,
                this
            );

            if(offer.productContainer != null && this.isOfferCompatibleWithCurrentMode(offer)) 
            {
                offers.push(offer);
            }
            else 
            {
                offer.dispose();
            }
        }

        if(parser.frontPageItems != null && parser.frontPageItems.length > 0)
        {
            this._frontPageItems = parser.frontPageItems;
        }

        if(this._catalogViewer != null && this._pendingPageId === parser.pageId)
        {
            this._catalogViewer.showCatalogPage(
                parser.pageId,
                parser.layoutCode,
                localization,
                offers,
                parser.offerId,
                parser.acceptSeasonCurrencyAsCredits
            );
        }
    }

    private isOfferCompatibleWithCurrentMode(offer: IPurchasableOffer): boolean 
    {
        return this._catalogType === 'NORMAL'
            || (offer.pricingModel !== 'pricing_model_bundle' && offer.pricingModel !== 'pricing_model_multi');
    }

    private addMessageEvent(event: IMessageEvent): void 
    {
        this._communication?.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    private onCreditBalance(event: IMessageEvent): void 
    {
        if(!event) return;

        const parser = event.parser as CreditBalanceEventParser | null;

        if(!parser) return;

        this._purse.credits = parser.balance;
        this.events.emit(PurseEvent.CREDIT_BALANCE, new PurseEvent(PurseEvent.CREDIT_BALANCE, parser.balance, 0));
        this.events.emit(PurseUpdateEvent.UPDATE, new PurseUpdateEvent());
    }

    private onActivityPoints(event: IMessageEvent): void 
    {
        if(!event) return;

        const parser = event.parser as ActivityPointsMessageParser | null;

        if(!parser) return;

        this._purse.setActivityPoints(parser.points);

        for(const [type, amount] of parser.points) 
        {
            this.events.emit(PurseEvent.ACTIVITY_POINT_BALANCE, new PurseEvent(PurseEvent.ACTIVITY_POINT_BALANCE, amount, type));
        }

        this.events.emit(PurseUpdateEvent.UPDATE, new PurseUpdateEvent());
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::onSubscriptionInfo()
    // TODO(AS3): the responseType === RESPONSE_TYPE_PURCHASE branch (reset() + reopen the page
    // remembered via rememberPageDuringVipPurchase()) isn't ported - reset() tears down and
    // reloads the whole catalog (navigators/viewer/product data) after a club purchase, and its
    // prerequisite rememberPageDuringVipPurchase() is still a no-op stub (see its own TODO above).
    private onSubscriptionInfo(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as ScrSendUserInfoMessageParser | null;

        if(!parser) return;

        this._purse.clubDays = Math.max(0, parser.daysToPeriodEnd);
        this._purse.clubPeriods = Math.max(0, parser.periodsSubscribedAhead);
        this._purse.isVIP = parser.isVIP;
        this._purse.pastClubDays = parser.pastClubDays;
        this._purse.pastVipDays = parser.pastVipDays;
        this._purse.isExpiring = parser.responseType === 3;
        this._purse.minutesUntilExpiration = parser.minutesUntilExpiration;
        this._purse.minutesSinceLastModified = parser.minutesSinceLastModified;

        if(parser.productName === 'habbo_club' || parser.productName === 'club_habbo')
        {
            HabboWebTools.subscriptionUpdated(parser.isVIP && parser.minutesUntilExpiration > 0);
        }

        this.updatePurse();
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::onVoucherRedeemOk()
    private onVoucherRedeemOk(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as VoucherRedeemOkMessageEventParser | null;

        if(!parser) return;

        let description = '${catalog.alert.voucherredeem.ok.description}';

        if(parser.productName !== '')
        {
            const key = 'catalog.alert.voucherredeem.ok.description.furni';

            this._localization?.registerParameter(key, 'productName', parser.productName);
            this._localization?.registerParameter(key, 'productDescription', parser.productDescription);
            description = `\${${key}}`;
        }

        this._windowManager?.alert('${catalog.alert.voucherredeem.ok.title}', description, 0, this.alertDialogEventProcessor);
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::onVoucherRedeemError()
    private onVoucherRedeemError(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as VoucherRedeemErrorMessageEventParser | null;

        if(!parser) return;

        const description = `\${catalog.alert.voucherredeem.error.description.${parser.errorCode}}`;

        this._windowManager?.alert('${catalog.alert.voucherredeem.error.title}', description, 0, this.alertDialogEventProcessor);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::onHabboClubOffers()
    private onHabboClubOffers(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as HabboClubOffersMessageEventParser | null;

        if(!parser || !this._clubBuyController) return;

        if(parser.source === 0 || parser.source === 1 || parser.source === 2 || parser.source === 6)
        {
            this._clubBuyController.onOffers(parser.offers);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::onHabboClubExtendOffer()
    // Unlike onHabboClubOffers() above, AS3 forwards the raw event here (not its parser) -
    // ClubExtendController.onOffer() does its own event.getParser() extraction. Preserved as-is,
    // a genuine inconsistency in the primary source between these two otherwise-similar handlers.
    private onHabboClubExtendOffer(event: IMessageEvent): void
    {
        if(!this._initialized) this.init();

        if(this._clubExtendController) this._clubExtendController.onOffer(event);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::onClubGiftInfo()
    private onClubGiftInfo(event: IMessageEvent): void
    {
        if(!event || !this._clubGiftController) return;

        const parser = event.parser as ClubGiftInfoEventParser | null;

        if(!parser) return;

        this._clubGiftController.setInfo(parser.daysUntilNextGift, parser.giftsAvailable, parser.offers, parser.giftData);
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::alertDialogEventProcessor()
    private alertDialogEventProcessor = (dialog: IDisposable, _event: WindowEvent): void =>
    {
        dialog.dispose();
        this.resetPlacedOfferData();
    };

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::resetPlacedOfferData()
    // TODO(AS3): resetObjectMover() (CatalogObjectMover teardown) and the placed-offer-preview
    // state it tracks (PlacedObjectPurchaseData) are Phase 4 scope (CatalogObjectMover) and don't
    // exist on this port yet - nothing sets that state today, so this is currently a faithful
    // no-op rather than a shortcut. Kept as a real method so Phase 4 has the right hook to fill in.
    public resetPlacedOfferData(_placingItem: boolean = false): void
    {
    }
}
