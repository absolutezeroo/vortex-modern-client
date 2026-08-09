import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {HabboClubLevelEnum} from '@habbo/session/enum/HabboClubLevelEnum';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IProductData} from '@habbo/session/product/IProductData';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {IFurniDataListener} from '@habbo/session/furniture/IFurniDataListener';
import type {IProductDataListener} from '@habbo/session/product/IProductDataListener';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {RoomPreviewer} from '@habbo/room/preview/RoomPreviewer';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboSoundManager} from '@iid/IIDHabboSoundManager';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_HabboAvatarEditor} from '@iid/IIDHabboAvatarEditor';
import type {IHabboAvatarEditor} from '@habbo/avatar/IHabboAvatarEditor';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import {RoomSessionEvent} from '@habbo/session/events/RoomSessionEvent';
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
import {
    HabboActivityPointNotificationMessageEvent
} from '@habbo/communication/messages/incoming/notifications/HabboActivityPointNotificationMessageEvent';
import {ScrSendUserInfoEvent} from '@habbo/communication/messages/incoming/users/ScrSendUserInfoEvent';
import type {FrontPageItem} from '@habbo/communication/messages/incoming/catalog/FrontPageItem';
import type {ScrSendUserInfoMessageParser} from '@habbo/communication/messages/parser/users/ScrSendUserInfoMessageParser';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import {OrderedMap} from '@core/utils/OrderedMap';
import {ApproveNameMessageEvent} from '@habbo/communication/messages/incoming/users/ApproveNameMessageEvent';
import type {ApproveNameMessageParser} from '@habbo/communication/messages/parser/users/ApproveNameMessageParser';
import {ApproveNameMessageComposer} from '@habbo/communication/messages/outgoing/users/ApproveNameMessageComposer';
import {SellablePetPalettesMessageEvent} from '@habbo/communication/messages/incoming/catalog/SellablePetPalettesMessageEvent';
import type {SellablePetPalette} from '@habbo/communication/messages/parser/catalog/SellablePetPalette';
import type {SellablePetPalettesMessageEventParser} from '@habbo/communication/messages/parser/catalog/SellablePetPalettesMessageEventParser';
import {GetSellablePetPalettesComposer} from '@habbo/communication/messages/outgoing/catalog/GetSellablePetPalettesComposer';
import {CatalogWidgetApproveNameResultEvent} from './viewer/widgets/events/CatalogWidgetApproveNameResultEvent';
import {CatalogWidgetSellablePetPalettesEvent} from './viewer/widgets/events/CatalogWidgetSellablePetPalettesEvent';
import {GetCreditsInfoComposer} from '@habbo/communication/messages/outgoing/inventory/purse/GetCreditsInfoComposer';
import {GetCatalogPageComposer} from '@habbo/communication/messages/outgoing/catalog/GetCatalogPageComposer';
import {PurchaseFromCatalogComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseFromCatalogComposer';
import {GetProductOfferComposer} from '@habbo/communication/messages/outgoing/catalog/GetProductOfferComposer';
import {PurchaseNftOfferMessageComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseNftOfferMessageComposer';
import {PurchaseMintTokensMessageComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseMintTokensMessageComposer';
import {CheckGiftableMessageComposer} from '@habbo/communication/messages/outgoing/catalog/CheckGiftableMessageComposer';
import {GetRoomAdsPurchaseInfoMessageComposer} from '@habbo/communication/messages/outgoing/catalog/GetRoomAdsPurchaseInfoMessageComposer';
import {PurchaseProductAsGiftMessageComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseProductAsGiftMessageComposer';
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
import {BuildersClubFurniCountMessageEvent} from '@habbo/communication/messages/incoming/catalog/BuildersClubFurniCountMessageEvent';
import type {
    BuildersClubFurniCountMessageParser
} from '@habbo/communication/messages/parser/catalog/BuildersClubFurniCountMessageParser';
import {
    BuildersClubSubscriptionStatusMessageEvent
} from '@habbo/communication/messages/incoming/catalog/BuildersClubSubscriptionStatusMessageEvent';
import type {
    BuildersClubSubscriptionStatusMessageParser
} from '@habbo/communication/messages/parser/catalog/BuildersClubSubscriptionStatusMessageParser';
import {PurchaseOKMessageEvent} from '@habbo/communication/messages/incoming/catalog/PurchaseOKMessageEvent';
import type {PurchaseOKMessageEventParser} from '@habbo/communication/messages/parser/catalog/PurchaseOKMessageEventParser';
import {PurchaseErrorMessageEvent} from '@habbo/communication/messages/incoming/catalog/PurchaseErrorMessageEvent';
import type {PurchaseErrorMessageEventParser} from '@habbo/communication/messages/parser/catalog/PurchaseErrorMessageEventParser';
import {PurchaseNotAllowedMessageEvent} from '@habbo/communication/messages/incoming/catalog/PurchaseNotAllowedMessageEvent';
import type {PurchaseNotAllowedMessageEventParser} from '@habbo/communication/messages/parser/catalog/PurchaseNotAllowedMessageEventParser';
import {NotEnoughBalanceMessageEvent} from '@habbo/communication/messages/incoming/catalog/NotEnoughBalanceMessageEvent';
import type {NotEnoughBalanceMessageEventParser} from '@habbo/communication/messages/parser/catalog/NotEnoughBalanceMessageEventParser';
import {CatalogFurniPurchaseEvent} from './navigation/events/CatalogFurniPurchaseEvent';
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
import type {IMarketPlace} from './marketplace/IMarketPlace';
import {MarketPlaceLogic} from './marketplace/MarketPlaceLogic';
import {GetMarketplaceOffersMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/GetMarketplaceOffersMessageComposer';
import {GetMarketplaceOwnOffersMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/GetMarketplaceOwnOffersMessageComposer';
import {CancelAllMarketplaceOffersMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/CancelAllMarketplaceOffersMessageComposer';
import {ClearOwnMarketplaceHistoryMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/ClearOwnMarketplaceHistoryMessageComposer';
import {BuyMarketplaceOfferMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/BuyMarketplaceOfferMessageComposer';
import {RedeemMarketplaceOfferCreditsMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/RedeemMarketplaceOfferCreditsMessageComposer';
import {CancelMarketplaceOfferMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/CancelMarketplaceOfferMessageComposer';
import {GetMarketplaceItemStatsComposer} from '@habbo/communication/messages/outgoing/marketplace/GetMarketplaceItemStatsComposer';
import {MarketPlaceOffersEvent} from '@habbo/communication/messages/incoming/marketplace/MarketPlaceOffersEvent';
import {MarketPlaceOwnOffersEvent} from '@habbo/communication/messages/incoming/marketplace/MarketPlaceOwnOffersEvent';
import {MarketplaceBuyOfferResultEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceBuyOfferResultEvent';
import {MarketplaceCancelOfferResultEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceCancelOfferResultEvent';
import {MarketplaceCancelAllOffersResultEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceCancelAllOffersResultEvent';
import {MarketplaceClearOwnHistoryResultEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceClearOwnHistoryResultEvent';
import {MarketplaceConfigurationEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceConfigurationEvent';
import type {MarketplaceConfigurationEventParser} from '@habbo/communication/messages/parser/marketplace/MarketplaceConfigurationEventParser';
import {MarketplaceItemStatsEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceItemStatsEvent';
import type {MarketplaceItemStatsEventParser} from '@habbo/communication/messages/parser/marketplace/MarketplaceItemStatsEventParser';
import {MarketplaceItemStats} from './marketplace/MarketplaceItemStats';
import type {IRecycler} from './recycler/IRecycler';
import {RecyclerLogic} from './recycler/RecyclerLogic';
import {GetRecyclerStatusMessageComposer} from '@habbo/communication/messages/outgoing/catalog/GetRecyclerStatusMessageComposer';
import {GetRecyclerPrizesMessageComposer} from '@habbo/communication/messages/outgoing/catalog/GetRecyclerPrizesMessageComposer';
import {RecycleItemsMessageComposer} from '@habbo/communication/messages/outgoing/catalog/RecycleItemsMessageComposer';
import {RecyclerStatusMessageEvent} from '@habbo/communication/messages/incoming/catalog/RecyclerStatusMessageEvent';
import type {RecyclerStatusMessageEventParser} from '@habbo/communication/messages/parser/catalog/RecyclerStatusMessageEventParser';
import {RecyclerFinishedMessageEvent} from '@habbo/communication/messages/incoming/catalog/RecyclerFinishedMessageEvent';
import type {RecyclerFinishedMessageEventParser} from '@habbo/communication/messages/parser/catalog/RecyclerFinishedMessageEventParser';
import {RecyclerPrizesMessageEvent} from '@habbo/communication/messages/incoming/catalog/RecyclerPrizesMessageEvent';
import type {RecyclerPrizesMessageEventParser} from '@habbo/communication/messages/parser/catalog/RecyclerPrizesMessageEventParser';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IDisposable} from '@core/runtime/IDisposable';
import {IID_HabboNewNavigator} from '@iid/IIDHabboNewNavigator';
import {IID_HabboGroupsManager} from '@iid/IIDHabboGroupsManager';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import {GuildSettingsChangedInManageEvent} from '@habbo/groups/events/GuildSettingsChangedInManageEvent';
import {GuildMembershipsMessageEvent} from '@habbo/communication/messages/incoming/users/GuildMembershipsMessageEvent';
import {GuildMembershipsController} from './guilds/GuildMembershipsController';
import {PurchaseConfirmationDialog} from './purchase/PurchaseConfirmationDialog';
import type {IHabboCatalog} from './IHabboCatalog';
import type {IPurchasableOffer} from './IPurchasableOffer';
import type {ICatalogNavigator} from './navigation/ICatalogNavigator';
import {CatalogNavigator} from './navigation/CatalogNavigator';
import {RequestedPage} from './navigation/RequestedPage';
import {CatalogViewer} from './viewer/CatalogViewer';
import type {ICatalogPage} from './viewer/ICatalogPage';
import {PageLocalization} from './viewer/PageLocalization';
import {Offer} from './viewer/Offer';
import {ClubBuyOfferData} from './club/ClubBuyOfferData';
import {Product} from './viewer/Product';
import {CatalogWindowState} from './CatalogWindowState';
import {PlacedObjectPurchaseData} from './purchase/PlacedObjectPurchaseData';
import {RentConfirmationWindow} from './purchase/RentConfirmationWindow';
import {PlaceObjectFromCatalogComposer} from '@habbo/communication/messages/outgoing/catalog/PlaceObjectFromCatalogComposer';
import {PlaceWallItemFromCatalogComposer} from '@habbo/communication/messages/outgoing/catalog/PlaceWallItemFromCatalogComposer';
import {FurnitureCategory} from '@habbo/inventory/enum/FurnitureCategory';
import {PlaceObjectMessageComposer} from '@habbo/communication/messages/outgoing/room/engine/PlaceObjectMessageComposer';
import type {IDragAndDropDoneReceiver} from './viewer/IDragAndDropDoneReceiver';
import {CatalogWidgetRoomChangedEvent} from './viewer/widgets/events/CatalogWidgetRoomChangedEvent';
import {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import type {RoomEngineObjectPlacedEvent} from '@habbo/room/events/RoomEngineObjectPlacedEvent';
import type {RoomEngineObjectPlacedOnUserEvent} from '@habbo/room/events/RoomEngineObjectPlacedOnUserEvent';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {LegacyStuffData} from '@habbo/room/object/data/LegacyStuffData';
import {Vector3d} from '@room/utils/Vector3d';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IUserData} from '@habbo/session';
import {HabboCatalogUtils} from './HabboCatalogUtils';
import {WindowToggle} from '@habbo/utils/WindowToggle';
import {CatalogEvent} from './event/CatalogEvent';
import {CatalogEarnings} from './CatalogEarnings';
import {Purse} from './purse/Purse';
import {PurseEvent} from './purse/PurseEvent';
import {PurseUpdateEvent} from './purse/PurseUpdateEvent';

const log = Logger.getLogger('habbo.catalog.HabboCatalog');

/**
 * Habbo catalog component.
 *
 * This restores the AS3 purse event flow used by the toolbar: incoming purse
 * messages update the catalog-owned `Purse`, then emit `PurseEvent`.
 *
 * @see sources/win63_version/habbo/catalog/HabboCatalog.as
 */
export class HabboCatalog extends Component implements IHabboCatalog, ILinkEventTracker, IFurniDataListener, IProductDataListener
{
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    /**
     * AS3 exposes the manager so collaborators can register their own message events —
     * `RentConfirmationWindow` subscribes to the rent quote itself rather than being fed by the
     * catalog.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_communication
    get communication(): IHabboCommunicationManager | null
    {
        return this._communication;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;

    private _tracking: IHabboTracking | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_notifications
    private _notifications: IHabboNotifications | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_avatarEditor
    private _avatarEditor: IHabboAvatarEditor | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_roomSessionManager
    private _roomSessionManager: IRoomSessionManager | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_soundManager
    private _soundManager: IHabboSoundManager | null = null;

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_9727
     *
     * Name DERIVED: obfuscated in every tree. Starts true and is cleared by the first credit
     * balance, which is how the login-time balance push avoids playing the purchase chime.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_9727
    private _firstCreditBalancePending: boolean = true;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::roomSession (_SafeStr_5616)
    private _roomSession: IRoomSession | null = null;
    private _mainWindow: IWindowContainer | null = null;
    // Per-catalog-type state. _mainWindow/_catalogViewer above are re-pointed at the
    // active entry by setActiveCatalogState(); AS3 keeps exactly this shape.
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_catalogStates
    private _catalogStates: Map<string, CatalogWindowState> | null = null;
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_catalogNavigators
    private _catalogNavigators: Map<string, CatalogNavigator> | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_searchTimer
    private _searchTimer: ReturnType<typeof setTimeout> | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_5194 (furniture data cache)
    private _furnitureDataCache: IFurnitureData[] | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_6916 (search-index stale flag)
    private _searchIndexStale: boolean = true;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_pagesVisibleInBuilderMode
    private _pagesVisibleInBuilderMode: Map<string, boolean> | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_7748 (product data ready flag)
    private _productDataReady: boolean = false;
    private _catalogViewer: CatalogViewer | null = null;
    private _requestedPage: RequestedPage = new RequestedPage();
    private _initialized: boolean = false;
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_sellablePetPalettes
    private _sellablePetPalettes: OrderedMap<string, SellablePetPalette[]> | null = new OrderedMap<string, SellablePetPalette[]>();
    private _purse: Purse = new Purse();

    private _clubBuyController: ClubBuyController | null = null;

    private _clubExtendController: ClubExtendController | null = null;

    private _clubGiftController: ClubGiftController | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_6362 (name derived: the rent dialog)
    private _rentConfirmationWindow: RentConfirmationWindow | null = null;

    private _marketPlace: MarketPlaceLogic | null = null;
    private _recycler: RecyclerLogic | null = null;
    private _earnings: CatalogEarnings = new CatalogEarnings();
    private _purchaseWillBeGift: boolean = false;
    private _purchaseConfirmationDialog: PurchaseConfirmationDialog | null = null;

    constructor(context: IContext, assetLibrary: IAssetLibrary | null = null) 
    {
        super(context, 0, assetLibrary);
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get windowManager()
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

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get localization()
    get localization(): IHabboLocalizationManager | null 
    {
        return this._localization;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null 
    {
        return this._sessionDataManager;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_avatarRenderManager
    private _avatarRenderManager: IAvatarRenderManager | null = null;

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get avatarRenderManager()
    get avatarRenderManager(): IAvatarRenderManager | null 
    {
        return this._avatarRenderManager;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get currentPage()
    get currentPage(): ICatalogPage | null
    {
        return this._catalogViewer?.currentPage ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_newNavigator
    private _newNavigator: IHabboNewNavigator | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get notifications()
    get notifications(): IHabboNotifications | null
    {
        return this._notifications;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get avatarEditor()
    get avatarEditor(): IHabboAvatarEditor | null
    {
        return this._avatarEditor;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get specialItemsController()
    // TODO(AS3): SpecialItemsController (habbo/catalog/special_items_display/SpecialItemsController.as)
    // has no port anywhere in the engine - it's a full separate Component (own DI,
    // ILinkEventTracker, message events, makeClaimable()/makeClaim()/claimState/items/view, etc.).
    // Porting it is out of scope for this single-getter fix; always null until it exists.
    get specialItemsController(): unknown
    {
        return null;
    }

    private _groupMembershipsController: GuildMembershipsController | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get navigator()
    get navigator(): IHabboNavigator | null
    {
        return this._newNavigator?.legacyNavigator ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_utils
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

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::set giftReceiver()
    set giftReceiver(value: string) 
    {
        this._giftReceiver = value;
    }

    private _catalogType: string = 'NORMAL';

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get catalogType()
    get catalogType(): string 
    {
        return this._catalogType;
    }

    private _videoOffers: { readonly enabled: boolean } = {enabled: false};

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get videoOffers()
    get videoOffers(): { readonly enabled: boolean } 
    {
        return this._videoOffers;
    }

    private _roomPreviewer: RoomPreviewer | null = null;

    // config flag are enforced here.
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get roomPreviewer()
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

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get connection()
    get connection(): IConnection | null 
    {
        return this._communication?.connection ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onRoomSessionEvent()
    // (privateRoomSessionActive is _SafeStr_7595, set alongside roomSession in that same handler)
    get privateRoomSessionActive(): boolean
    {
        return this._roomSession?.isPrivateRoom ?? false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get tradingActive()
    get tradingActive(): boolean 
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get imageGalleryHost()
    get imageGalleryHost(): string 
    {
        return this.getProperty('image.library.catalogue.url');
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get buildersClubEnabled()
    get buildersClubEnabled(): boolean 
    {
        return this.getBoolean('builders.club.enabled');
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get collectorHub()
    get collectorHub(): unknown | null
    {
        return null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_frontPageItems
    private _frontPageItems: FrontPageItem[] | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get frontPageItems()
    get frontPageItems(): FrontPageItem[] | null
    {
        return this._frontPageItems;
    }

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
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get bundleDiscountRuleset()
    get bundleDiscountRuleset(): unknown | null 
    {
        return null;
    }

    // every offer except that flow.
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get roomAdPurchaseData()
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
            // AS3 registers the two placement callbacks on this dependency, not by hand — which is
            // why they unsubscribe with the dependency. Deferred reads of the arrow properties:
            // this array is built inside the base Component constructor, before this class's own
            // field initializers have run (same reason as the groups dependency below).
            new ComponentDependency(
                IID_RoomEngine,
                (manager: IRoomEngine | null) =>
                {
                    this._roomEngine = manager;
                },
                false,
                [
                    {
                        type: RoomEngineObjectEvent.REOE_PLACED,
                        callback: (...args: unknown[]) => this.onObjectPlacedInRoom(args[0] as RoomEngineObjectPlacedEvent)
                    },
                    {
                        type: RoomEngineObjectEvent.REOE_PLACED_ON_USER,
                        callback: (...args: unknown[]) => this.onObjectPlaceOnUser(args[0] as RoomEngineObjectPlacedOnUserEvent)
                    }
                    // TODO(AS3): AS3 also registers REOE_SELECTED -> onObjectSelected(), which
                    // eagerly inits the BUILDERS_CLUB navigator on the first room-object click and
                    // dispatches CatalogUserEvent(CATALOG_USER_SELECTED) for a clicked avatar.
                    // `CatalogUserEvent` has no port (only the type constant on `CatalogEvent`),
                    // and nothing consumes it yet.
                ]
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
            new ComponentDependency(
                IID_HabboSoundManager,
                (soundManager: IHabboSoundManager | null) =>
                {
                    this._soundManager = soundManager;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboNewNavigator,
                (navigator: IHabboNewNavigator | null) =>
                {
                    this._newNavigator = navigator;
                },
                false
            ),
            // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::dependencies
            // AS3 subscribes to IHabboGroupsManager's GSCIME_GUILD_VISUAL_SETTINGS_CHANGED event
            // with no plain setter (null) - only the event listener matters here. Currently dormant:
            // HabboGroupsManager never dispatches this event yet (the guild-settings management UI
            // that would fire it isn't ported), so onGuildVisualSettingsChanged() is real but
            // unreachable today, same as ClubBuyController.showConfirmation()'s documented gap.
            new ComponentDependency(
                IID_HabboGroupsManager,
                null,
                false,
                [
                    {
                        type: GuildSettingsChangedInManageEvent.GUILD_VISUAL_SETTINGS_CHANGED,
                        // Deferred read of this.onGuildVisualSettingsChanged: this array is built
                        // inside the base Component constructor, before this class's own arrow-
                        // function field initializers have run - a direct `this.onX` reference here
                        // would capture `undefined`. Wrapping it in a fresh closure defers the
                        // property read until the listener actually fires, by which point
                        // construction has completed (same reasoning as onHabboToolbarEvent above,
                        // which is safe only because it's read inside a nested setter callback).
                        callback: (...args: unknown[]) => this.onGuildVisualSettingsChanged(args[0] as GuildSettingsChangedInManageEvent)
                    }
                ]
            ),
            new ComponentDependency(
                IID_HabboNotifications,
                (notifications: IHabboNotifications | null) =>
                {
                    this._notifications = notifications;
                },
                false
            ),
            // Provided since `HabboAvatarEditorManager` landed. The IID is declared
            // `createIID<unknown>`, so the setter narrows here.
            new ComponentDependency(
                IID_HabboAvatarEditor,
                (avatarEditor: unknown) =>
                {
                    this._avatarEditor = (avatarEditor as IHabboAvatarEditor | null) ?? null;
                },
                false
            ),
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: IRoomSessionManager | null) =>
                {
                    this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this.onRoomSessionEvent);
                    this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_ENDED, this.onRoomSessionEvent);

                    this._roomSessionManager = manager;

                    manager?.sessionEvents.on(RoomSessionEvent.RSE_STARTED, this.onRoomSessionEvent);
                    manager?.sessionEvents.on(RoomSessionEvent.RSE_ENDED, this.onRoomSessionEvent);
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::furniDataReady()
    furniDataReady(): void
    {
        this._furnitureDataCache = this._sessionDataManager?.getFurniData(this) ?? null;
        this._searchIndexStale = true;
        this._pagesVisibleInBuilderMode = null;
    }

    /**
     * AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_6471 / _SafeStr_10150 / _SafeStr_9864
     *
     * Names DERIVED: all three obfuscated in every tree. A `toggleCatalog()` call that arrived
     * before the product data was loaded, held until `productDataReady()` can replay it. The type
     * being non-null is the "something is pending" flag.
     */
    private _pendingToggleCatalogType: string | null = null;
    private _pendingToggleForceOpen: boolean = false;
    private _pendingToggleShowMainWindow: boolean = true;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::productDataReady()
    productDataReady(): void
    {
        this._productDataReady = true;
        this._searchIndexStale = true;
        this.events.emit(CatalogEvent.CATALOG_INITIALIZED, new CatalogEvent(CatalogEvent.CATALOG_INITIALIZED));

        // Only replay while the catalog still has no states: a toggle that has since succeeded by
        // another route must not be re-run. AS3 clears the stash *before* the call, so a second
        // failure re-stashes cleanly instead of recursing on a stale copy.
        if(this._catalogStates == null && this._pendingToggleCatalogType !== null)
        {
            const catalogType = this._pendingToggleCatalogType;
            const forceOpen = this._pendingToggleForceOpen;
            const showMainWindow = this._pendingToggleShowMainWindow;

            this._pendingToggleCatalogType = null;

            this.toggleCatalog(catalogType, forceOpen, showMainWindow);
        }
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getSellablePetPalettes()
    // Returns the cached palettes for a product code, or null after firing the request off - the
    // response arrives asynchronously via onSellablePetPalettes() and reaches the widget as a
    // CatalogWidgetSellablePetPalettesEvent. Callers treat null as "not known yet", not "none".
    getSellablePetPalettes(productCode: string): SellablePetPalette[] | null
    {
        const cached = this._sellablePetPalettes?.getValue(productCode) ?? null;

        if(cached != null) return cached.slice();

        this.connection?.send(new GetSellablePetPalettesComposer(productCode));

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::approveName()
    approveName(name: string, validationType: number): void
    {
        this.connection?.send(new ApproveNameMessageComposer(name, validationType));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onSellablePalettes()
    private onSellablePetPalettes(event: IMessageEvent): void
    {
        const parser = event.parser as SellablePetPalettesMessageEventParser | null;

        if(parser == null) return;

        const productCode = parser.productCode;
        const palettes = parser.sellablePalettes;

        this._sellablePetPalettes?.remove(productCode);

        if(palettes == null) return;

        this._sellablePetPalettes?.add(productCode, palettes.slice());

        if(this._catalogViewer != null && this._catalogViewer.currentPage != null)
        {
            this._catalogViewer.dispatchWidgetEvent(new CatalogWidgetSellablePetPalettesEvent(productCode, palettes.slice()));
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onApproveNameResult()
    private onApproveNameResult(event: IMessageEvent): void
    {
        if(event == null || this._catalogViewer == null) return;

        const parser = event.parser as ApproveNameMessageParser | null;

        if(parser == null) return;

        this._catalogViewer.dispatchWidgetEvent(new CatalogWidgetApproveNameResultEvent(parser.result, parser.nameValidationInfo));
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::purchaseWillBeGift()
    purchaseWillBeGift(isGift: boolean): void
    {
        this._purchaseWillBeGift = isGift;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseProduct()
    // TODO(AS3): the roomAdPurchaseData-based extend/replace branch is not ported - roomAdPurchaseData
    // is a pre-existing always-null stub on this port (see its own getter's note), so the real AS3
    // condition (`roomAdPurchaseData == null || roomAdPurchaseData.offerId != offerId`) is always
    // true here, matching the simple PurchaseFromCatalogComposer path unconditionally.
    purchaseProduct(pageId: number, offerId: number, extraParam: string = '', quantity: number = 1): void
    {
        this.connection?.send(new PurchaseFromCatalogComposer(pageId, offerId, extraParam, quantity));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseOffer()
    purchaseOffer(offerId: number, extraParam: string = '', quantity: number = 1): void
    {
        const nodes = this.getCatalogNavigator('NORMAL')?.getNodesByOfferId(offerId, true);

        if(nodes != null && nodes.length > 0)
        {
            this.purchaseProduct(nodes[0].pageId, offerId, extraParam, quantity);
        }
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseNftOffer()
    purchaseNftOffer(offerId: string, extraParam: string): void
    {
        this.connection?.send(new PurchaseNftOfferMessageComposer(offerId, extraParam));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseMintTokens()
    purchaseMintTokens(amount: number, currency: string): void
    {
        this.connection?.send(new PurchaseMintTokensMessageComposer(amount, currency));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::checkGiftable()
    checkGiftable(offer: IPurchasableOffer): void
    {
        this.connection?.send(new CheckGiftableMessageComposer(offer.offerId));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseProductAsGift()
    // No current caller: PurchaseConfirmationDialog.ts documents implementing only the base
    // "confirm and buy" path, not the gift-wrapping flow (box/ribbon selectors, receiver name) -
    // same category as purchaseVipMembershipExtension()/purchaseBasicMembershipExtension() above,
    // which are also real composer-senders reachable only once their calling UI is wired.
    purchaseProductAsGift(pageId: number, offerId: number, extraParam: string, receiverName: string, giftMessage: string | null, giftBoxProductId: number, boxType: number, ribbonType: number, showPurchaserName: boolean = false): void
    {
        this.connection?.send(new PurchaseProductAsGiftMessageComposer(
            pageId, offerId, extraParam, receiverName, giftMessage, giftBoxProductId, boxType, ribbonType, showPurchaserName
        ));
    }

    /**
     * AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_5631
     *
     * Name DERIVED: obfuscated in every tree. The page to reopen once the club purchase comes back
     * — non-null is also the signal that a purchase is in flight, which is what
     * `doNotCloseAfterVipPurchase()` tests.
     */
    private _pageToReopenAfterVipPurchase: string | null = null;

    /**
     * AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_6885
     *
     * Name DERIVED: obfuscated in every tree. A one-shot veto on the next `hideMainWindow()`, so
     * the club purchase flow can leave the catalog standing. It clears itself on use.
     */
    private _suppressNextHideMainWindow: boolean = false;

    /**
     * Arms the one-shot hide veto, but only if a page is actually remembered — a purchase that
     * never went through `rememberPageDuringVipPurchase()` still closes the catalog normally.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::doNotCloseAfterVipPurchase()
    doNotCloseAfterVipPurchase(): void
    {
        this._suppressNextHideMainWindow = this._pageToReopenAfterVipPurchase !== null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::forgetPageDuringVipPurchase()
    forgetPageDuringVipPurchase(): void
    {
        this._pageToReopenAfterVipPurchase = null;
        this._suppressNextHideMainWindow = false;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::sendRoomAdPurchaseInitiatedEvent()
    // Needs RoomAdPurchaseInitiatedComposer, which isn't ported. Only reachable from a
    // "ROOM_INITIATE_PURCHASE"-tagged purchase widget layout, which the ported catalog pages
    // don't use yet.
    sendRoomAdPurchaseInitiatedEvent(): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getRoomAdsPurchaseInfo()
    // TODO(AS3): the response isn't parsed/stored yet - matches the pre-existing roomAdPurchaseData
    // always-null stub above. Sending the request is still correct and real, just currently
    // unconsumed.
    getRoomAdsPurchaseInfo(): void
    {
        this.connection?.send(new GetRoomAdsPurchaseInfoMessageComposer());
    }

    /**
     * A page id that resolves to no node still remembers something — AS3 falls back to
     * `"frontpage"` rather than leaving the field null, because null would also switch off
     * `doNotCloseAfterVipPurchase()`.
     *
     * No caller yet: `PurchaseCatalogWidget`'s onBuyClub is not attached to a button in the ported
     * layouts, so this is reachable only once that button exists.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::rememberPageDuringVipPurchase()
    rememberPageDuringVipPurchase(pageId: number): void
    {
        const node = this.currentCatalogNavigator?.getNodeById(pageId) ?? null;

        this._pageToReopenAfterVipPurchase = node !== null ? node.pageName : 'frontpage';
    }

    /**
     * The offer currently being dragged out of the catalog into the room. Distinct from
     * `_placedOfferData` below: this one lives from the drag starting until the room object is
     * placed or the drag is cancelled.
     */
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_offerInFurniPlacing
    private _offerInFurniPlacing: IPurchasableOffer | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_offerPlacingCallbackReceiver
    private _offerPlacingCallbackReceiver: IDragAndDropDoneReceiver | null = null;

    /**
     * AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_5130
     *
     * Name DERIVED: obfuscated in every tree. It gates all three placement callbacks — a
     * REOE_PLACED that did not come from a catalog drag must not touch any of this state — and is
     * also what `onPurchaseOK()` reads to decide whether to fly the icon to the toolbar.
     */
    private _placingFurni: boolean = false;

    /**
     * AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_9457
     *
     * Name DERIVED: obfuscated in every tree. Remembers `requestSelectedItemToMover()`'s
     * `placeMany` argument so the Builders Club branch can immediately re-arm the mover for the
     * next copy instead of closing the catalog.
     */
    private _placeManyInMover: boolean = false;

    /**
     * AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::_SafeStr_4676
     *
     * Name DERIVED: obfuscated in every tree. The ghost furni already standing in the room while
     * the purchase is in flight — see `PlacedObjectPurchaseData`.
     */
    private _placedOfferData: PlacedObjectPurchaseData | null = null;

    /**
     * Hands an offer to the room engine's object-inserter, so the next click in the room places it.
     * Note AS3 never involves `CatalogObjectMover` here — that class is the *widget*'s drag icon;
     * the catalog side of the flow is `initializeRoomObjectInsert()` plus the three placement
     * callbacks below.
     *
     * The window is hidden only once the insert is accepted, which is what keeps the catalog open
     * when the offer turns out not to be placeable.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::requestSelectedItemToMover()
    requestSelectedItemToMover(receiver: IDragAndDropDoneReceiver | null, offer: IPurchasableOffer, placeMany: boolean = false): void
    {
        if(!this.isDraggable(offer)) return;

        const product = offer.product;

        if(product === null) return;

        let category: number = 0;

        switch(product.productType)
        {
            case 's':
                category = RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE;
                break;
            case 'i':
                category = RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;
                break;
        }

        // AS3 passes the offer id negated: the inserter keys placement previews by object id, and a
        // negative one cannot collide with a real room object's.
        const accepted = this._roomEngine?.initializeRoomObjectInsert(
            'catalog',
            -offer.offerId,
            category,
            product.productClassId,
            product.extraParam ? product.extraParam.toString() : '',
            null,
            -1,
            -1,
            null,
            placeMany
        ) ?? false;

        if(accepted)
        {
            this._offerInFurniPlacing = offer;
            this._offerPlacingCallbackReceiver = receiver;

            this.hideMainWindow();

            this._placingFurni = true;
            this._placeManyInMover = placeMany;
        }
    }

    /**
     * Drops whatever the mover is holding. Called on every catalog open/close and page switch, so a
     * drag can never survive into an unrelated catalog state.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::cancelFurniInMover()
    cancelFurniInMover(): void
    {
        if(this._offerInFurniPlacing !== null)
        {
            this._roomEngine?.cancelRoomObjectInsert();

            this._placingFurni = false;
            this._offerInFurniPlacing = null;
        }
    }

    /**
     * Brings the catalog back after a drag ends. `showWindow` is false on the paths that are about
     * to re-arm the mover (place-many) or close the catalog themselves.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::resetObjectMover()
    private resetObjectMover(showWindow: boolean = true): void
    {
        if(showWindow && this._placingFurni)
        {
            // AS3 passes the state to both calls; this port's showMainWindow() already acts on the
            // active state's container, which is the same window for the same `_catalogType`.
            this.showMainWindow();
            this.dispatchRoomChangedToCatalogPage(this.getCatalogState(this._catalogType));
        }

        this._placingFurni = false;
        this._offerPlacingCallbackReceiver = null;
    }

    /**
     * Tells the open page its room context changed, so widgets gated on being in a room (the place
     * button, the Builders Club placement status) re-evaluate.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::dispatchRoomChangedToCatalogPage()
    private dispatchRoomChangedToCatalogPage(state: CatalogWindowState | null): void
    {
        if(state !== null && state.catalogViewer != null && state.catalogViewer.currentPage != null)
        {
            state.catalogViewer.currentPage.dispatchWidgetEvent(new CatalogWidgetRoomChangedEvent());
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::dispatchRoomChangedToCatalogPages()
    private dispatchRoomChangedToCatalogPages(): void
    {
        if(this._catalogStates == null) return;

        for(const state of this._catalogStates.values())
        {
            this.dispatchRoomChangedToCatalogPage(state);
        }
    }

    /**
     * The item landed somewhere in the room. AS3 immediately draws it locally at half alpha — the
     * ghost — and remembers where, so `itemAddedToInventory()` can turn it into the real placement
     * when the server confirms, or `resetPlacedOfferData()` can take it away again if it doesn't.
     *
     * A wall item whose class is floor/wallpaper/landscape is a decoration, not an object: it
     * "lands" on the floor or the wall rather than in the room, and applies through `updateRoom()`.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onObjectPlacedInRoom()
    private onObjectPlacedInRoom = (event: RoomEngineObjectPlacedEvent): void =>
    {
        if(!this._placingFurni || event.type !== RoomEngineObjectEvent.REOE_PLACED || event.placementSource !== 'catalog') return;

        this.resetPlacedOfferData(true);

        if(this._offerInFurniPlacing === null || this._offerInFurniPlacing.disposed)
        {
            this.resetObjectMover();

            return;
        }

        const category = event.category;
        const product = this._offerInFurniPlacing.product;
        const className = product?.furnitureData?.className ?? '';
        let placed: boolean;

        if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
        {
            switch(className)
            {
                case 'floor':
                case 'wallpaper':
                case 'landscape':
                    placed = event.placedOnFloor || event.placedOnWall;
                    break;
                default:
                    placed = event.placedInRoom;
            }
        }
        else
        {
            placed = event.placedInRoom;
        }

        if(!placed)
        {
            this.resetObjectMover();

            return;
        }

        this._placedOfferData = new PlacedObjectPurchaseData(
            event.roomId,
            event.objectId,
            event.category,
            event.wallLocation,
            event.x,
            event.y,
            event.direction,
            this._offerInFurniPlacing
        );

        // Captured before the callback, as AS3 does: the Builders Club branch below can re-arm the
        // mover, and `requestSelectedItemToMover()` overwrites `_offerPlacingCallbackReceiver`.
        // AS3 passes null as the second argument here; this port's interface types it `string`.
        const receiver = this._offerPlacingCallbackReceiver;

        receiver?.onDragAndDropDone(true, '');

        switch(this._catalogType)
        {
            case 'NORMAL':
                if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
                {
                    this._roomEngine?.addObjectFurniture(
                        event.roomId,
                        event.objectId,
                        product?.productClassId ?? 0,
                        new Vector3d(event.x, event.y, event.z),
                        new Vector3d(event.direction, 0, 0),
                        0,
                        new LegacyStuffData(),
                        NaN,
                        -1,
                        0,
                        0,
                        '',
                        true,
                        true,
                        -1
                    );
                }
                else if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
                {
                    switch(className)
                    {
                        case 'floor':
                        case 'wallpaper':
                        case 'landscape':
                            this.updateRoom(className, product?.extraParam ?? '');
                            break;
                        default:
                            // AS3 multiplies the direction by 45 here and nowhere else: wall items
                            // carry a direction index, the room object wants degrees.
                            this._roomEngine?.addObjectWallItem(
                                event.roomId,
                                event.objectId,
                                product?.productClassId ?? 0,
                                new Vector3d(event.x, event.y, event.z),
                                new Vector3d(event.direction * 45, 0, 0),
                                0,
                                event.instanceData ?? '',
                                0,
                                0,
                                '',
                                -1
                            );
                    }
                }

                // Half alpha is what makes it read as "not yours yet".
                {
                    const object = this._roomEngine?.getRoomObject(event.roomId, event.objectId, event.category) as IRoomObjectController | null;

                    object?.getModelController().setNumber(RoomObjectVariableEnum.FURNITURE_ALPHA_MULTIPLIER, 0.5);
                }

                break;
            case 'BUILDERS_CLUB':
            {
                // A Builders Club placement is a *purchase*: nothing is drawn locally, the server
                // is asked to place it and the real object arrives from the room engine. That is
                // why this branch has no addObjectFurniture()/half-alpha ghost.
                let pageId = this._offerInFurniPlacing.page?.pageId ?? CatalogNavigator.DUMMY_PAGE_ID_FOR_OFFER_SEARCH;

                // A search-result offer reports the dummy page id; resolve it back to a real page
                // through the offer, since the server keys the purchase by page.
                if(pageId === CatalogNavigator.DUMMY_PAGE_ID_FOR_OFFER_SEARCH)
                {
                    const nodes = this.currentCatalogNavigator?.getNodesByOfferId(this._offerInFurniPlacing.offerId, true) ?? null;

                    if(nodes != null && nodes.length > 0) pageId = nodes[0].pageId;
                }

                if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
                {
                    this.connection?.send(new PlaceObjectFromCatalogComposer(
                        pageId,
                        this._offerInFurniPlacing.offerId,
                        product?.extraParam ?? '',
                        event.x,
                        event.y,
                        event.direction
                    ));
                }
                else if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
                {
                    this.connection?.send(new PlaceWallItemFromCatalogComposer(
                        pageId,
                        this._offerInFurniPlacing.offerId,
                        product?.extraParam ?? '',
                        event.wallLocation
                    ));
                }

                // Place-many re-arms the mover with the same offer instead of closing: that is what
                // lets a builder lay out a whole row without reopening the catalog between items.
                if(this._placeManyInMover)
                {
                    this.requestSelectedItemToMover(receiver, this._offerInFurniPlacing, true);

                    break;
                }

                this.toggleBuilderCatalog();

                break;
            }
        }
    };

    /**
     * Dropping an offer onto a user is the drag-to-gift gesture: nothing is placed, the receiver is
     * told whose avatar it landed on, and the mover closes without restoring the catalog window
     * (`resetObjectMover(false)`) because `cancelFurniInMover()` follows immediately.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onObjectPlaceOnUser()
    private onObjectPlaceOnUser = (event: RoomEngineObjectPlacedOnUserEvent): void =>
    {
        if(!this._placingFurni || event.type !== RoomEngineObjectEvent.REOE_PLACED_ON_USER) return;

        this.resetPlacedOfferData(true);

        if(this._offerInFurniPlacing === null || this._offerInFurniPlacing.disposed)
        {
            this.resetObjectMover();

            return;
        }

        const userData = this.getUserDataForEvent(event);

        this._offerPlacingCallbackReceiver?.onDragAndDropDone(true, userData?.name ?? '');

        this.resetObjectMover(false);
        this.cancelFurniInMover();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getUserDataForEvent()
    private getUserDataForEvent(event: RoomEngineObjectEvent): IUserData | null
    {
        const session = this._roomSessionManager?.getSession(event.roomId) ?? null;

        return session?.userDataManager?.getUserDataByIndex(event.objectId) ?? null;
    }

    /**
     * The floor/wallpaper/landscape trio is one room update in AS3: changing any one of them has to
     * resend the other two, so each is read back off the room instance first. `'reset'` (and any
     * unknown value) re-applies all three unchanged, which is how the ghost decoration is undone.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::updateRoom()
    private updateRoom(type: string, value: string): void
    {
        if(this._roomEngine === null) return;

        const activeRoomId = this._roomEngine.activeRoomId;
        let wallType = this._roomEngine.getRoomStringValue(activeRoomId, RoomObjectVariableEnum.ROOM_WALL_TYPE);
        let floorType = this._roomEngine.getRoomStringValue(activeRoomId, RoomObjectVariableEnum.ROOM_FLOOR_TYPE);
        let landscapeType = this._roomEngine.getRoomStringValue(activeRoomId, RoomObjectVariableEnum.ROOM_LANDSCAPE_TYPE);

        wallType = wallType && wallType.length > 0 ? wallType : '101';
        floorType = floorType && floorType.length > 0 ? floorType : '101';
        landscapeType = landscapeType && landscapeType.length > 0 ? landscapeType : '1.1';

        switch(type)
        {
            case 'floor':
                this._roomEngine.updateObjectRoom(activeRoomId, value, wallType, landscapeType, true);
                break;
            case 'wallpaper':
                this._roomEngine.updateObjectRoom(activeRoomId, floorType, value, landscapeType, true);
                break;
            case 'landscape':
                this._roomEngine.updateObjectRoom(activeRoomId, floorType, wallType, value, true);
                break;
            default:
                this._roomEngine.updateObjectRoom(activeRoomId, floorType, wallType, landscapeType, true);
        }
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::showPurchaseConfirmation()
    // TODO(AS3): the dialog now builds the real `purchase_confirmation` layout; see its own file
    // header for the sub-flows still missing (gifting/gift wrapping, the collectible offer classes,
    // the LTD raffle).
    // `showConfirmation` (param7) is declared by AS3 but never read anywhere in its method body -
    // a dead parameter in the original client, kept here only so the pet widgets' 8-argument call
    // matches the real signature.
    // TODO(AS3): `previewImage` (param8) is accepted but not forwarded. AS3 passes it as
    // showOffer()'s last argument, where it short-circuits the rendered preview; the pet widgets do
    // supply a real rendered pet image, so wiring it through is what makes a pet offer show its own
    // portrait instead of the "no preview for product type" path.
    showPurchaseConfirmation(
        offer: IPurchasableOffer,
        pageId: number,
        extraParam: string = '',
        quantity: number = 1,
        stuffData: IStuffData | null = null,
        _giftMessage: string | null = null,
        _showConfirmation: boolean = true,
        _previewImage: ImageBitmap | null = null
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

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showPurchaseConfirmation()
        if(this.isHabbiconOfferOwned(offer))
        {
            this.showHabbiconAlreadyOwnedAlert();

            return;
        }

        // The balance is tested against what the user is about to spend, not the
        // unit price: buying 10 of a 5-credit offer costs 50. AS3 recomputes both
        // prices through calculateBundlePrice() before the two tests below, and
        // only when multiple purchase is enabled — otherwise quantity is always 1
        // and the unit price already is the total.
        let priceInCredits = offer.priceInCredits;
        let priceInActivityPoints = offer.priceInActivityPoints;

        if(this.multiplePurchaseEnabled)
        {
            priceInCredits = this._utils.calculateBundlePrice(true, offer.priceInCredits, quantity);
            priceInActivityPoints = this._utils.calculateBundlePrice(true, offer.priceInActivityPoints, quantity);
        }

        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showPurchaseConfirmation()
        // AS3 exempts GameTokensOffer from both balance tests (`_loc10_ = param1 is
        // GameTokensOffer`, ANDed as `&& !_loc10_` into each). GameTokensOffer is not
        // ported yet (see the TODO on the dialog branch below), so there is nothing to
        // test against; restore the exemption with the class.
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

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showPurchaseConfirmation()
        // AS3 splits here: furniture-shaped offers get the generic dialog, a ClubBuyOfferData goes
        // to the club buy controller instead. Note a gift always takes the generic path, even for a
        // club offer — that is why _purchaseWillBeGift is part of the first test, not a separate one.
        // TODO(AS3): AS3 also admits GameTokensOffer, MintTokenPurchaseOffer and
        // NftStorePurchaseOffer into the first branch; none of the three is ported yet.
        if(offer instanceof Offer || this._purchaseWillBeGift)
        {
            if(this._purchaseConfirmationDialog == null || this._purchaseConfirmationDialog.disposed)
            {
                this._purchaseConfirmationDialog = new PurchaseConfirmationDialog(this, this._windowManager!);
            }

            this._purchaseConfirmationDialog.showOffer(offer, pageId, extraParam, quantity, stuffData, this._purchaseWillBeGift);
        }
        else if(offer instanceof ClubBuyOfferData)
        {
            if(pageId === -1)
            {
                const node = this.currentCatalogNavigator?.getNodeByName('hc_membership') ?? null;

                if(node !== null)
                {
                    pageId = node.pageId;
                }
            }

            if(pageId >= 0)
            {
                this.getClubBuyController()?.showConfirmation(offer, pageId);
            }
        }

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showPurchaseConfirmation()
        // TODO(AS3): AS3 also calls _purchaseConfirmationDialog.turnIntoGifting() here - the
        // minimal dialog this port has doesn't support the gift flow yet (see this method's
        // header TODO), so only the flag reset is restored. Without it, _purchaseWillBeGift stays
        // true forever after the first gift purchase and every later purchase on this instance
        // would be misread as a gift too, once the gift flow exists to observe it.
        if(this._purchaseWillBeGift)
        {
            this._purchaseWillBeGift = false;
        }
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::getSeasonalCurrencyActivityPointType()
    getSeasonalCurrencyActivityPointType(): number 
    {
        return this.getInteger('seasonalcurrencyindicator.currency', 1);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::setLeftPaneVisibility()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::loadCatalogPage()
    public loadCatalogPage(pageId: number, offerId: number, catalogType: string): void
    {
        this.setCatalogBusy(catalogType, true);

        const state = this.getCatalogState(catalogType);

        if(state != null) state.lastPageRequestId = pageId;

        this.connection?.send(new GetCatalogPageComposer(pageId, offerId, catalogType));
    }

    /**
	 * Puts one catalog type's window into (or out of) its loading state.
	 *
	 * @param catalogType - The catalog type whose window to mark
	 * @param busy - Whether a page request is in flight
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::setCatalogBusy()
    private setCatalogBusy(catalogType: string, busy: boolean): void
    {
        const state = this.getCatalogState(catalogType);

        if(state == null || state.mainContainer == null) return;

        state.mainContainer.caption = busy
            ? '${generic.loading}'
            : (catalogType === 'NORMAL' ? '${catalog.title}' : '${builder.catalog.title}');

        const mask = state.mainContainer.findChildByName('search_waiting_for_results_mask');

        if(mask != null) mask.visible = busy;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::set isBusy()
    public set isBusy(value: boolean)
    {
        this.setCatalogBusy(this._catalogType, value);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::sendGetProductOffer()
    // TODO(AS3): the response (ProductOfferEvent/onProductOffer) isn't ported yet - it needs a
    // full offer/product reconstruction (same shape as the catalog-page response) plus
    // CatalogPage.updateLimitedItemsLeft()/ProductOfferUpdatedEvent wiring. The request goes out
    // correctly, but nothing currently updates the UI when the reply arrives.
    public sendGetProductOffer(offerId: number): void
    {
        this.connection?.send(new GetProductOfferComposer(offerId));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getRecyclerStatus()
    public getRecyclerStatus(): void
    {
        this.connection?.send(new GetRecyclerStatusMessageComposer());
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getRecyclerPrizes()
    public getRecyclerPrizes(): void
    {
        this.connection?.send(new GetRecyclerPrizesMessageComposer());
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::sendRecycleItems()
    public sendRecycleItems(items: number[]): void
    {
        this.connection?.send(new RecycleItemsMessageComposer(items));
    }

    // tracked). The core open/close/navigate flow is real.
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::toggleCatalog()
    public toggleCatalog(catalogType: string, forceOpen: boolean = false, showMainWindow: boolean = true): void 
    {
        if(!this._sessionDataManager?.hasSecurity(5) && !this.buildersClubEnabled) 
        {
            catalogType = 'NORMAL';
        }

        this.cancelFurniInMover();

        // AS3 gates on the states, not on a window: init() is what builds them.
        if(this._catalogStates == null)
        {
            if(!this.init(catalogType))
            {
                // init() fails while product data is still loading. AS3 stashes the whole call
                // rather than dropping it, so the click that arrived too early still opens the
                // catalog once productDataReady() fires.
                this._pendingToggleCatalogType = catalogType;
                this._pendingToggleForceOpen = forceOpen;
                this._pendingToggleShowMainWindow = showMainWindow;

                return;
            }
        }

        this._pendingToggleCatalogType = null;

        // Read the outgoing state before switching, so a type change can be detected
        // by identity and the window being left behind can be hidden.
        const previousState = this.getCatalogState(this._catalogType);
        const state = this.setActiveCatalogState(catalogType);
        const catalogTypeChanged = previousState != null && previousState !== state;

        if(state.catalogNavigator == null || !state.catalogNavigator.initialized)
        {
            this.refreshCatalogIndex(catalogType);
        }

        // Each type owns its window, so switching leaves the other one on the desktop
        // unless it is taken down explicitly. AS3 does this as hideMainWindow(old, false)
        // — the `false` being why the viewer is not told the catalog closed: it did not,
        // it moved.
        if(catalogTypeChanged && previousState?.mainContainer != null && previousState.mainContainer.parent != null)
        {
            const desktop = this._windowManager?.getDesktop(1) as unknown as IWindowContainer | null;

            desktop?.removeChild(previousState.mainContainer);
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
        this.cancelFurniInMover();
        this.toggleCatalog('NORMAL', true);
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::openCatalogPage()
    public openCatalogPage(pageName: string, catalogType: string | null = null): void
    {
        this.cancelFurniInMover();
        this.toggleCatalog(catalogType ?? 'NORMAL', true, false);

        if(!this._initialized || this._catalogNavigators == null || !this.currentCatalogNavigator!.initialized) 
        {
            this._requestedPage.requestByName = pageName;

            return;
        }

        this.currentCatalogNavigator!.openPage(pageName);
    }

    // ported (same deferred area as the in-room "buy this placed item" flow noted in Offer.ts).
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::openRoomAdCatalogPageInExtendedMode()
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

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::openInventoryCategory()
    public openInventoryCategory(category: string): void 
    {
        this.context.createLinkEvent(`inventory/open/${category}`);
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::openCreditsHabblet()
    public openCreditsHabblet(): void 
    {
        this.context.createLinkEvent('habblet/open/credits');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::setupInventoryForRecycler()
    // TODO(AS3): delegates to _inventory.setupRecycler() in AS3 (habbo/inventory/recycler/RecyclerModel.as,
    // toggles the inventory's "recyclable items" filter view) - HabboInventory isn't wired into
    // HabboCatalog yet, so this is a no-op until that dependency exists.
    public setupInventoryForRecycler(_enabled: boolean): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::requestInventoryFurniToRecycler()
    // TODO(AS3): delegates to _inventory.requestSelectedFurniToRecycler() in AS3 (RecyclerModel.as::lockSelectedFurni()) -
    // same HabboInventory gap as setupInventoryForRecycler(). Returning 0 matches AS3's own
    // "nothing selected/lockable" result, which RecyclerLogic.placeObjectAtSlot() already handles.
    public requestInventoryFurniToRecycler(): number
    {
        return 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::returnInventoryFurniFromRecycler()
    // TODO(AS3): delegates to _inventory.returnInventoryFurniFromRecycler() in AS3 (RecyclerModel.as::releaseFurni()) -
    // same HabboInventory gap. Returning false matches AS3's own "nothing to release" result.
    public returnInventoryFurniFromRecycler(_itemId: number): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::getProductData()
    public getProductData(localizationId: string): IProductData | null 
    {
        return this._sessionDataManager?.getProductData(localizationId) ?? null;
    }

    // instead of returning it - reconstructed to return the looked-up data.
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::getFurnitureData()
    public getFurnitureData(classId: number, productType: string): IFurnitureData | null 
    {
        if(productType === 's') return this._sessionDataManager?.getFloorItemData(classId) ?? null;
        if(productType === 'i') return this._sessionDataManager?.getWallItemData(classId) ?? null;

        return null;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::getFurnitureData()
    // The decompiled source computes the result into a local but always `return null`s

    /**
	 * Overrides the product count the server sent, for two bundles it gets wrong.
	 *
	 * Hardcoded in AS3 exactly as it is here — the two `wf_storage_*_bd` bundles
	 * ship five items but arrive with a different count, and the client patches
	 * it on the way in. Every other offer keeps the server's number.
	 *
	 * @param localizationId - The offer's localization id
	 * @param furnitureData - The product's furniture data, or null
	 * @param productCount - The count the server sent
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getProductCountOverride()
    private getProductCountOverride(localizationId: string, furnitureData: IFurnitureData | null, productCount: number): number
    {
        if(localizationId === 'wf_storage_furni_bd' && furnitureData?.className === 'wf_storage_furni1') return 5;
        if(localizationId === 'wf_storage_coins_bd' && furnitureData?.className === 'wf_storage_coins2') return 5;

        return productCount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getPixelEffectIcon()
    // TODO(AS3): see getMintTokenProductIcon()'s note below - same Texture-vs-ImageBitmap mismatch.
    public getPixelEffectIcon(_effectId: number): ImageBitmap | null
    {
        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getSubscriptionProductIcon()
    // TODO(AS3): see getMintTokenProductIcon()'s note below - same Texture-vs-ImageBitmap mismatch.
    public getSubscriptionProductIcon(_productId: number): ImageBitmap | null
    {
        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getMintTokenProductIcon()
    // TODO(AS3): AS3 looks up the "minting_token_large" asset and clones its BitmapData, falling
    // back to a blank bitmap when missing. findAssetByName() would return a PixiJS Texture here,
    // not an ImageBitmap - the same type mismatch already affects the two sibling methods above
    // (getPixelEffectIcon/getSubscriptionProductIcon), so simplified to null for consistency rather
    // than fixing one of the three one-off.
    public getMintTokenProductIcon(): ImageBitmap | null
    {
        return null;
    }

    /**
     * Five independent gates, all of which AS3 packs into one expression: the config flag, being in
     * a room at all, the page allowing drags, having the rights to place here (ownership in NORMAL,
     * Builders Club status in BUILDERS_CLUB), and the offer being a single placeable object —
     * bundles, multi-offers, effects (`e`) and Habbicons (`h`) are not draggable.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::isDraggable()
    public isDraggable(offer: IPurchasableOffer): boolean
    {
        if(!this.getBoolean('catalog.drag_and_drop') || this._roomSession === null) return false;

        const currentPage = this._catalogViewer?.currentPage ?? null;

        if(currentPage !== null && !currentPage.allowDragging) return false;

        const allowedHere = this._catalogType === 'NORMAL'
            ? this._roomSession.isRoomOwner || (this._roomSession.isGuildRoom && this._roomSession.roomControllerLevel >= 2)
            : this._catalogType === 'BUILDERS_CLUB' && this.getBuilderFurniPlaceableStatusForOffer(offer) === 0;

        if(!allowedHere) return false;

        return offer.pricingModel !== 'pricing_model_bundle'
            && offer.pricingModel !== 'pricing_model_multi'
            && offer.product !== null
            && offer.product.productType !== 'e'
            && offer.product.productType !== 'h';
    }

    // AS3: HabboCatalog.as::_builderFurniLimit / get builderFurniLimit()
    private _builderFurniLimit: number = 0;
    // AS3: HabboCatalog.as::_builderMaxFurniLimit / get builderMaxFurniLimit()
    private _builderMaxFurniLimit: number = 0;
    // AS3: HabboCatalog.as::_SafeStr_8644 / get builderFurniCount()
    private _builderFurniCount: number = -1;
    // AS3: HabboCatalog.as::_SafeStr_7775 / get builderSecondsLeft()
    private _builderSecondsLeft: number = 0;
    // AS3: HabboCatalog.as::_SafeStr_8610 / get builderSecondsLeftWithGrace()
    private _builderSecondsLeftWithGrace: number = 0;
    // AS3: HabboCatalog.as::_builderMembershipUpdateTime
    private _builderMembershipUpdateTime: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get builderFurniLimit()
    get builderFurniLimit(): number
    {
        return this._builderFurniLimit;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get builderMaxFurniLimit()
    get builderMaxFurniLimit(): number
    {
        return this._builderMaxFurniLimit;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::get builderFurniCount()
    get builderFurniCount(): number
    {
        return this._builderFurniCount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get builderSecondsLeft()
    get builderSecondsLeft(): number
    {
        return this._builderSecondsLeft - (HabboCatalog.getTimer() - this._builderMembershipUpdateTime) / 1000;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get builderSecondsLeftWithGrace()
    get builderSecondsLeftWithGrace(): number
    {
        return this._builderSecondsLeftWithGrace - (HabboCatalog.getTimer() - this._builderMembershipUpdateTime) / 1000;
    }

    // AS3: flash.utils.getTimer() - TS-only helper, no HabboCatalog.as member of this name; used by
    // builderSecondsLeft/builderSecondsLeftWithGrace exactly like SSOTicketMessageComposer.ts's own
    // getTimer() helper.
    private static getTimer(): number
    {
        if(typeof performance !== 'undefined')
        {
            return Math.floor(performance.now());
        }

        return Date.now();
    }

    // AS3: HabboCatalog.as::onBuildersClubSubscriptionStatus()
    private onBuildersClubSubscriptionStatus(event: IMessageEvent): void
    {
        const parser = event.parser as BuildersClubSubscriptionStatusMessageParser | null;

        if(!parser) return;

        this._builderFurniLimit = parser.furniLimit;
        this._builderMaxFurniLimit = parser.maxFurniLimit;
        this._builderSecondsLeft = parser.secondsLeft;
        this._builderMembershipUpdateTime = HabboCatalog.getTimer();
        this._builderSecondsLeftWithGrace = parser.secondsLeftWithGrace;

        // TODO(AS3): AS3 also calls refreshBuilderStatus() (builds the "member/grace/trial" header
        // text + dispatches CATALOG_BUILDER_MEMBERSHIP_IN_GRACE/EXPIRED) - that membership-status UI
        // cluster isn't ported yet, only the furni count/limit/seconds-left fields
        // getBuilderFurniPlaceableStatus() needs.
    }

    // AS3: HabboCatalog.as::onBuildersClubFurniCount()
    private onBuildersClubFurniCount(event: IMessageEvent): void
    {
        const parser = event.parser as BuildersClubFurniCountMessageParser | null;

        if(!parser) return;

        this._builderFurniCount = parser.furniCount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getBuilderFurniPlaceableStatusForOffer()
    public getBuilderFurniPlaceableStatusForOffer(_offer: IPurchasableOffer | null): number
    {
        if(_offer == null) return 1;

        if(this._builderFurniCount < 0 || this._builderFurniCount >= this._builderFurniLimit) return 2;

        if(this._roomSession == null) return 3;

        return this.getBuilderFurniPlaceableStatus();
    }

    /**
     * The last branch only applies once the membership has run out: a lapsed builder may keep
     * decorating, but not while anyone else is watching. Moderators and the builder's own avatar
     * do not count as onlookers.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getBuilderFurniPlaceableStatus()
    public getBuilderFurniPlaceableStatus(): number
    {
        if(this._roomSession == null) return 3;

        if(!this._roomSession.isRoomOwner && this._roomSession.isGuildRoom &&
            !this.getBoolean('builders.club.furniture.placement.group.room.enabled'))
        {
            return 5;
        }

        if(this._roomSession.roomControllerLevel < 3) return 4;

        if(this.builderSecondsLeft <= 0 && this._roomEngine != null)
        {
            const roomId = this._roomSession.roomId;
            const userCount = this._roomEngine.getRoomObjectCount(roomId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

            for(let i = 0; i < userCount; i++)
            {
                const object = this._roomEngine.getRoomObjectWithIndex(roomId, i, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

                if(object === null) continue;

                // AS3 looks the user up by the room object's *id*, through getUserDataByIndex() —
                // the room index and the object id are the same number for avatars.
                const userData = this._roomSession.userDataManager.getUserDataByIndex(object.getId());

                if(userData != null
                    && userData.type === 1
                    && userData.roomObjectId !== this._roomSession.ownUserRoomId
                    && !userData.isModerator)
                {
                    return 6;
                }
            }
        }

        return 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onRoomSessionEvent()
    private onRoomSessionEvent = (event: RoomSessionEvent): void =>
    {
        switch(event.type)
        {
            case RoomSessionEvent.RSE_STARTED:
                this._roomSession = event.session;
                break;

            case RoomSessionEvent.RSE_ENDED:
                this._roomSession = null;
                break;
        }

        // AS3 runs this for *both* cases, outside the switch: entering or leaving a room changes
        // what the open page may offer (placement, Builders Club status), and `isDraggable()` reads
        // the same session state.
        this.dispatchRoomChangedToCatalogPages();
    };

    // path isn't wired up yet. The synchronous cache-hit path is implemented for real.
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::setImageFromAsset()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getClubBuyController()
    // Controllers are created eagerly in initComponent() (see createClubBuyController() etc.
    // below), not lazily here - matches AS3, where these are plain field getters.
    public getClubBuyController(): ClubBuyController | null
    {
        return this._clubBuyController;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::createClubBuyController()
    private createClubBuyController(): void
    {
        if(this._clubBuyController == null)
        {
            this._clubBuyController = new ClubBuyController(this, this.connection);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getClubExtendController()
    public getClubExtendController(): ClubExtendController | null
    {
        return this._clubExtendController;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::createClubExtendController()
    private createClubExtendController(): void
    {
        if(this._clubExtendController == null)
        {
            this._clubExtendController = new ClubExtendController(this);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getClubGiftController()
    public getClubGiftController(): ClubGiftController | null
    {
        return this._clubGiftController;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::createClubGiftController()
    private createClubGiftController(): void
    {
        if(this._clubGiftController == null)
        {
            this._clubGiftController = new ClubGiftController(this);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getGroupMembershipsController()
    public getGroupMembershipsController(): GuildMembershipsController | null
    {
        return this._groupMembershipsController;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::createGroupMembershipsController()
    private createGroupMembershipsController(): void
    {
        if(this._groupMembershipsController == null)
        {
            this._groupMembershipsController = new GuildMembershipsController(this);
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::getEarnings()
    public getEarnings(): CatalogEarnings
    {
        return this._earnings;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getRecycler()
    public getRecycler(): IRecycler | null
    {
        return this._recycler;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::createRecycler()
    private createRecycler(): void
    {
        if(this._recycler == null && this._windowManager != null)
        {
            this._recycler = new RecyclerLogic(this, this._windowManager);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getMarketPlace()
    public getMarketPlace(): IMarketPlace | null
    {
        return this._marketPlace;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::createMarketPlace()
    private createMarketPlace(): void
    {
        if(this._marketPlace == null && this._windowManager != null && this._roomEngine != null)
        {
            this._marketPlace = new MarketPlaceLogic(this, this._windowManager, this._roomEngine);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getPublicMarketPlaceOffers()
    public getPublicMarketPlaceOffers(minPrice: number, maxPrice: number, searchString: string, category: number, combineUniques: boolean = true): void
    {
        this.connection?.send(new GetMarketplaceOffersMessageComposer(minPrice, maxPrice, searchString, category, combineUniques));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getOwnMarketPlaceOffers()
    public getOwnMarketPlaceOffers(category: number = 1): void
    {
        this.connection?.send(new GetMarketplaceOwnOffersMessageComposer(category));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::cancelAllMarketPlaceOffers()
    public cancelAllMarketPlaceOffers(): void
    {
        this.connection?.send(new CancelAllMarketplaceOffersMessageComposer());
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::clearOwnMarketPlaceHistory()
    public clearOwnMarketPlaceHistory(status: number): void
    {
        this.connection?.send(new ClearOwnMarketplaceHistoryMessageComposer(status));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::buyMarketPlaceOffer()
    public buyMarketPlaceOffer(offerId: number): void
    {
        this.connection?.send(new BuyMarketplaceOfferMessageComposer(offerId));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::redeemSoldMarketPlaceOffers()
    public redeemSoldMarketPlaceOffers(): void
    {
        this.connection?.send(new RedeemMarketplaceOfferCreditsMessageComposer());
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::redeemExpiredMarketPlaceOffer()
    public redeemExpiredMarketPlaceOffer(offerId: number): void
    {
        this.connection?.send(new CancelMarketplaceOfferMessageComposer(offerId));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getMarketplaceItemStats()
    public getMarketplaceItemStats(category: number, furniId: number, extraData: string | null = null): void
    {
        if(!this._communication) return;

        this.connection?.send(new GetMarketplaceItemStatsComposer(category, furniId, extraData));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showNotEnoughCreditsAlert()
    public showNotEnoughCreditsAlert(): void
    {
        if(!this._windowManager)
        {
            return;
        }

        this._windowManager.confirm(
            '${catalog.alert.notenough.title}',
            '${catalog.alert.notenough.credits.description}',
            0,
            this.noCreditsConfirmDialogEventProcessor
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showHabbiconAlreadyOwnedAlert()
    public showHabbiconAlreadyOwnedAlert(): void
    {
        this._windowManager?.alert(
            '${catalog.alert.purchaseerror.title}',
            '${habbicon.catalog.already_owned}',
            0,
            this.alertDialogEventProcessor
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::isHabbiconOfferOwned()
    // TODO(AS3): needs _habbiconController (habbo/catalog/habbicons/HabbiconController.as) - a full
    // unported Component subsystem (own DI, message events, buyHabbicon()/claimHabbicon()/
    // tryGetOwnedHabbicon(), etc). AS3 itself returns false here whenever habbicons.enabled is off,
    // which matches this port's current always-off state, so false is not a guess - it's what AS3
    // would return too.
    public isHabbiconOfferOwned(_offer: IPurchasableOffer | null): boolean
    {
        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::isHabbiconOwned()
    // TODO(AS3): same _habbiconController gap as isHabbiconOfferOwned() above.
    public isHabbiconOwned(_id: number): boolean
    {
        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showNotEnoughActivityPointsAlert()
    public showNotEnoughActivityPointsAlert(activityPointType: number): void
    {
        const currencyName = this.getActivityPointName(activityPointType);
        const title = this._localization?.getLocalizationWithParams('catalog.alert.notenough.activitypoints.title', '', 'currencyname', currencyName) ?? '';
        const description = this._localization?.getLocalizationWithParams('catalog.alert.notenough.activitypoints.description', '', 'currencyname', currencyName) ?? '';

        if(activityPointType === 0)
        {
            this._windowManager?.confirm(title, description, 0, this.noDucketsConfirmDialogEventProcessor);
        }
        else
        {
            this._windowManager?.alert(title, description, 0, this.alertDialogEventProcessor);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::noCreditsConfirmDialogEventProcessor()
    private noCreditsConfirmDialogEventProcessor = (dialog: IDisposable, event: WindowEvent): void =>
    {
        dialog.dispose();
        this.resetPlacedOfferData();

        if(event.type === WindowEvent.WE_OK)
        {
            HabboWebTools.openWebPageAndMinimizeClient(this.getProperty('web.shop.relativeUrl'));
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::noDucketsConfirmDialogEventProcessor()
    private noDucketsConfirmDialogEventProcessor = (dialog: IDisposable, event: WindowEvent): void =>
    {
        dialog.dispose();
        this.resetPlacedOfferData();

        if(event.type === WindowEvent.WE_OK)
        {
            const url = this.getProperty('link.format.duckets');

            if(url !== '')
            {
                this._windowManager?.alert('${catalog.alert.external.link.title}', '${catalog.alert.external.link.desc}', 0, this.onExternalLink);
                HabboWebTools.navigateToURL(url, HabboWebTools.WINDOW_HABBO_MAIN);
            }
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onExternalLink()
    private onExternalLink = (dialog: IDisposable, _event: WindowEvent): void =>
    {
        dialog.dispose();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getHabboClubOffers()
    public getHabboClubOffers(source: number): void
    {
        this.connection?.send(new GetClubOffersMessageComposer(source));
    }

    // --- ILinkEventTracker ---

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::get linkPattern()
    public get linkPattern(): string
    {
        return 'catalog/';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::linkReceived()
    public linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2)
        {
            return;
        }

        switch(parts[1])
        {
            case 'open':
                if(parts.length > 2)
                {
                    this.openCatalogPage(parts[2]);

                    break;
                }

                this.openCatalog();

                break;

            case 'warehouse':
                if(parts.length > 2)
                {
                    this.openCatalogPage(parts[2], 'BUILDERS_CLUB');

                    break;
                }

                this.toggleCatalog('BUILDERS_CLUB', true);

                break;

            case 'club_buy':
                this.openClubCenter();

                break;

            case 'habbicons':
                if(this.getBoolean('habbicons.enabled'))
                {
                    this.context.createLinkEvent('habbicons/open');
                }

                break;

            default:
                log.warn(`Catalog unknown link-type receive: ${parts[1]}`);

                break;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::openClubCenter()
    public openClubCenter(): void
    {
        this.context.createLinkEvent('habboUI/open/hccenter');
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::openVault()
    public openVault(): void 
    {
        this.context.createLinkEvent('habboUI/open/vault');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::verifyClubLevel()
    // AS3 opens the HC centre here on failure, and its only caller
    // (PurchaseCatalogWidget.as:280-283) opens it again right after. The redundancy is AS3's, and
    // the TS caller already mirrors it — kept as-is rather than "tidied" on one side only.
    public verifyClubLevel(clubLevel: number = 1): boolean
    {
        if((this._sessionDataManager?.clubLevel ?? HabboClubLevelEnum.NO_CLUB) >= clubLevel)
        {
            return true;
        }

        this.openClubCenter();

        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::isNewIdentity()
    public isNewIdentity(): boolean
    {
        return this.getInteger('new.identity', 0) > 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::buySnowWarTokensOffer()
    // TODO(AS3): real body shows a purchase-confirmation dialog for one of three cached
    // GameTokensOffer-typed fields (keyed by localizationId), or else requests a fresh offer via
    // GetSnowWarGameTokensOfferComposer - same GameTokensOffer/SnowWarGameTokensMessageEvent gap
    // documented on purchaseGameTokensOffer() below (a distinct AS3 method, not a duplicate).
    public buySnowWarTokensOffer(_localizationId: string): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseGameTokensOffer()
    // TODO(AS3): sends PurchaseSnowWarGameTokensOfferComposer (header 3243, resolved from
    // habbo/communication/_SafeCls_2046.as) using one of three cached GameTokensOffer-typed fields
    // keyed by localizationId (GET_SNOWWAR_TOKENS/2/3). Those fields are populated by
    // onSnowWarGameTokenOffer() from a SnowWarGameTokensMessageEvent/Parser response to
    // GetSnowWarGameTokensOfferComposer (sent from buySnowWarTokensOffer()'s else-branch in AS3) -
    // none of GameTokensOffer, the event/parser, or that request flow are ported yet (a distinct,
    // small subsystem from the already-ported catalog composers), so there is nothing to send a
    // real offerId for. This is a different AS3 method from the buySnowWarTokensOffer() stub above
    // (same GET_SNOWWAR_TOKENS* string switch, but that one shows a purchase-confirmation dialog or
    // requests a fresh offer - this one sends the purchase itself).
    public purchaseGameTokensOffer(_localizationId: string): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showVipBenefits()
    // AS3 also lazily calls init() first if _utils is still null - this port's _utils is always
    // constructed eagerly in the field initializer, so that guard has nothing to do here.
    public showVipBenefits(): void
    {
        if(!this.getCatalogNavigator('NORMAL')?.initialized)
        {
            this.refreshCatalogIndex('NORMAL');
        }

        this._utils.showVipBenefits();
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::displayProductIcon()
    public displayProductIcon(productType: string, classId: number, target: unknown): void 
    {
        this._utils.displayProductIcon(productType, classId, target as IBitmapWrapperWindow);
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::openRentConfirmationWindow()
    /**
     * Built lazily and kept: the window owns a message-event subscription, so re-creating it per
     * call would stack listeners.
     *
     * Note AS3's parameter names are misleading and preserved as such — the second is the *buyout*
     * flag, not a wall-item flag (the window derives that from the furni data itself), and the two
     * ids are the room object and the inventory strip item, which is how it picks its mode.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::openRentConfirmationWindow()
    public openRentConfirmationWindow(
        furniData: IFurnitureData | null,
        buyout: boolean,
        objectId: number = -1,
        stripId: number = -1,
        fromCatalogue: boolean = false
    ): void
    {
        if(this._rentConfirmationWindow == null)
        {
            this._rentConfirmationWindow = new RentConfirmationWindow(this);
        }

        this._rentConfirmationWindow.show(furniData, buyout, objectId, stripId, fromCatalogue);
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::toggleBuilderCatalog()
    public toggleBuilderCatalog(): void 
    {
        this.toggleCatalog('BUILDERS_CLUB');
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::getCatalogNavigator()
    public getCatalogNavigator(catalogType: string): ICatalogNavigator | null 
    {
        return this._catalogNavigators?.get(catalogType) ?? null;
    }

    /**
	 * Whether the given catalog type uses the tab-less catalog window.
	 *
	 * The Builders Club catalog always does, whatever the config says — it has no
	 * tabs to show. Honouring that needs one window per type, which is why this
	 * parameter and CatalogWindowState arrived together: with a shared window, the
	 * BUILDERS_CLUB navigator's constructor hid `tab_context` in the window NORMAL
	 * was also using, and NORMAL lost its tabs for good.
	 *
	 * @param catalogType - The catalog type ("NORMAL", "BUILDERS_CLUB", ...)
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::useNonTabbedCatalog()
    public useNonTabbedCatalog(catalogType: string): boolean
    {
        if(catalogType === 'BUILDERS_CLUB') return true;

        return this.getBoolean('client.desktop.use.non.tabbed.catalog');
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::getOfferCenter()
    public getOfferCenter(_extension: unknown): unknown | null 
    {
        return null;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::init()
    // TODO(AS3): several one-time setup steps are still skipped, each because their backing
    // system isn't ported yet: refreshFurniData(), getGiftWrappingConfiguration(),
    // initBundleDiscounts().
    // createClubGiftController()/createClubBuyController()/createClubExtendController() (the
    // club/ purchase controllers - separate from the already-ported clubcenter/ status display),
    // createMarketPlace(), createRecycler(), and createGroupMembershipsController() are now real -
    // see below. The core main-window/navigator/

    /**
     * The purchased item has landed in the inventory. If it is the one already standing in the room
     * as a ghost, this is what makes the placement real — it sends the placement the user already
     * performed, at the remembered position, and clears the ghost.
     *
     * **AS3 bug, ported as-is:** `category` is overwritten with the *room* category (10/20) and then
     * switched against `FurnitureCategory`'s WALL_PAPER/FLOOR/LANDSCAPE (2/3/4), so those three
     * branches can never be reached and every placement takes the default one. They are documented
     * below rather than silently dropped; the composer they need is unported anyway.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::itemAddedToInventory()
    public itemAddedToInventory(classId: number, itemId: number, category: number): void
    {
        if(this._placedOfferData === null || this._placedOfferData.productClassId !== classId) return;
        if(this._placedOfferData.roomId !== this._roomEngine?.activeRoomId) return;

        category = this._placedOfferData.category;

        switch(category)
        {
            case FurnitureCategory.WALL_PAPER:
            case FurnitureCategory.FLOOR:
            case FurnitureCategory.LANDSCAPE:
                // TODO(AS3): each of these three reads the room's matching decoration type back
                // (`room_wall_type` / `room_floor_type` / `room_landscape_type`) and, when the
                // placed item's extraParameter differs, sends `_SafePkg_2324._SafeCls_2323`
                // (a single-int "apply this decoration item" composer, header 2292 in WIN63's
                // registry). That composer has no port, and the reference server has no handler
                // for 2292 either. Unreachable regardless — see the note above.
                break;
            default:
                this.connection?.send(new PlaceObjectMessageComposer(
                    itemId,
                    category,
                    this._placedOfferData.wallLocation,
                    this._placedOfferData.x,
                    this._placedOfferData.y,
                    this._placedOfferData.direction
                ));
        }

        this.resetPlacedOfferData();
    }

    // AS3 loads this via assets.getAssetByName(name).content + buildFromXML(); this port
    // pre-compiles window layouts into a named registry instead (see IHabboWindowManager

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getActivityPointName()
    // The config supplies the localization key; it is not hardcoded. The key doubles as its own
    // default, so an unmapped currency shows the key rather than an empty string.
    public getActivityPointName(activityPointType: number): string
    {
        const key = this.getProperty(`activitypoint.name.${activityPointType}`);

        return this._localization?.getLocalization(key, key) ?? key;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::canPlaceWithBC()
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

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::dispose()
        this.context.removeLinkEventTracker(this);

        if(this._purchaseConfirmationDialog != null)
        {
            this._purchaseConfirmationDialog.dispose();
            this._purchaseConfirmationDialog = null;
        }

        if(this._clubBuyController != null)
        {
            this._clubBuyController.dispose();
            this._clubBuyController = null;
        }

        if(this._clubExtendController != null)
        {
            this._clubExtendController.dispose();
            this._clubExtendController = null;
        }

        if(this._groupMembershipsController != null)
        {
            this._groupMembershipsController.dispose();
            this._groupMembershipsController = null;
        }

        if(this._roomPreviewer != null)
        {
            this._roomPreviewer.dispose();
            this._roomPreviewer = null;
        }

        // Dropped, not disposed — AS3 only nulls this one (`_SafeStr_4730 = null`), and
        // the asymmetry is deliberate enough to keep: MarketPlaceLogic is reachable from
        // elsewhere, so disposing it here would take it out from under another owner.
        this._marketPlace = null;

        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::dispose()
        // AS3 never releases its ClubGiftController (_SafeStr_7444) or its recycler — neither
        // appears anywhere in dispose(). Left leaking to match, rather than "fixing" AS3 on a
        // guess: both hold windows, and taking them down here may be exactly what AS3 avoids.
        // Decide with a leak trace, not by reading.

        if(this._sellablePetPalettes != null)
        {
            this._sellablePetPalettes.dispose();
            this._sellablePetPalettes = null;
        }

        // AS3: .../HabboCatalog.as::dispose() — takes the ghost furni out of the room before the
        // state that describes it goes away, then clears the mover.
        this.resetPlacedOfferData();
        this._placingFurni = false;
        this._offerPlacingCallbackReceiver = null;

        this._utils.dispose();

        // Drop the flat references before the states that own the objects behind them,
        // then let each state take down its own window, navigator and viewer.
        this._catalogViewer = null;
        this._mainWindow = null;

        if(this._catalogStates != null)
        {
            for(const state of this._catalogStates.values())
            {
                state.dispose();
            }

            this._catalogStates = null;
        }

        this._catalogNavigators = null;

        this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this.onRoomSessionEvent);
        this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_ENDED, this.onRoomSessionEvent);
        this._roomSessionManager = null;
        this._roomSession = null;
        this._sessionDataManager?.removeFurniDataListener(this);
        this._notifications = null;
        this._avatarEditor = null;

        this._communication = null;
        this._windowManager = null;
        this._localization = null;
        super.dispose();
    }

    protected override initComponent(): void 
    {
        this.addMessageEvent(new CreditBalanceEvent(this.onCreditBalance.bind(this)));
        this.addMessageEvent(new ActivityPointsMessageEvent(this.onActivityPoints.bind(this)));
        this.addMessageEvent(new HabboActivityPointNotificationMessageEvent(this.onActivityPointNotification.bind(this)));
        this.addMessageEvent(new CatalogIndexMessageEvent(this.onCatalogIndex.bind(this)));
        this.addMessageEvent(new CatalogPageMessageEvent(this.onCatalogPage.bind(this)));
        this.addMessageEvent(new BuildersClubSubscriptionStatusMessageEvent(this.onBuildersClubSubscriptionStatus.bind(this)));
        this.addMessageEvent(new BuildersClubFurniCountMessageEvent(this.onBuildersClubFurniCount.bind(this)));
        this.addMessageEvent(new ScrSendUserInfoEvent(this.onSubscriptionInfo.bind(this)));
        this.addMessageEvent(new PurchaseOKMessageEvent(this.onPurchaseOK.bind(this)));
        this.addMessageEvent(new PurchaseErrorMessageEvent(this.onPurchaseError.bind(this)));
        this.addMessageEvent(new PurchaseNotAllowedMessageEvent(this.onPurchaseNotAllowed.bind(this)));
        this.addMessageEvent(new NotEnoughBalanceMessageEvent(this.onNotEnoughBalance.bind(this)));
        this.addMessageEvent(new VoucherRedeemOkMessageEvent(this.onVoucherRedeemOk.bind(this)));
        this.addMessageEvent(new VoucherRedeemErrorMessageEvent(this.onVoucherRedeemError.bind(this)));
        this.addMessageEvent(new HabboClubOffersMessageEvent(this.onHabboClubOffers.bind(this)));
        this.addMessageEvent(new HabboClubExtendOfferMessageEvent(this.onHabboClubExtendOffer.bind(this)));
        this.addMessageEvent(new ClubGiftInfoEvent(this.onClubGiftInfo.bind(this)));
        this.addMessageEvent(new MarketPlaceOffersEvent(this.onMarketPlaceOffers.bind(this)));
        this.addMessageEvent(new MarketPlaceOwnOffersEvent(this.onMarketPlaceOwnOffers.bind(this)));
        this.addMessageEvent(new MarketplaceBuyOfferResultEvent(this.onMarketPlaceBuyResult.bind(this)));
        this.addMessageEvent(new MarketplaceCancelOfferResultEvent(this.onMarketPlaceCancelResult.bind(this)));
        this.addMessageEvent(new MarketplaceCancelAllOffersResultEvent(this.onMarketPlaceCancelAllResult.bind(this)));
        this.addMessageEvent(new MarketplaceClearOwnHistoryResultEvent(this.onMarketPlaceClearOwnHistoryResult.bind(this)));
        this.addMessageEvent(new MarketplaceConfigurationEvent(this.onMarketplaceConfiguration.bind(this)));
        this.addMessageEvent(new MarketplaceItemStatsEvent(this.onMarketplaceItemStats.bind(this)));
        this.addMessageEvent(new RecyclerStatusMessageEvent(this.onRecyclerStatus.bind(this)));
        this.addMessageEvent(new RecyclerFinishedMessageEvent(this.onRecyclerFinished.bind(this)));
        this.addMessageEvent(new RecyclerPrizesMessageEvent(this.onRecyclerPrizes.bind(this)));
        this.addMessageEvent(new GuildMembershipsMessageEvent(this.onGuildMemberships.bind(this)));
        this.addMessageEvent(new SellablePetPalettesMessageEvent(this.onSellablePetPalettes.bind(this)));
        this.addMessageEvent(new ApproveNameMessageEvent(this.onApproveNameResult.bind(this)));

        // AS3 registers the tracker here, right after the message events (HabboCatalog.as:752).
        this.context.addLinkEventTracker(this);

        this.connection?.send(new GetCreditsInfoComposer());

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::initComponent()
        this._sessionDataManager?.loadProductData(this);
        this._furnitureDataCache = this._sessionDataManager?.getFurniData(this) ?? null;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::initializeRoomPreviewer()
    /**
     * The engine check is not redundant with the null one: a resolved-but-uninitialised engine has
     * no room manager yet, and `createRoomForPreviews()` would build the preview room into nothing.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::initializeRoomPreviewer()
    private initializeRoomPreviewer(): void
    {
        if(this._roomEngine != null && this._roomEngine.isInitialized && this.getBoolean('catalog.furniture.animation')) 
        {
            if(this._roomPreviewer == null)
            {
                this._roomPreviewer = new RoomPreviewer(this._roomEngine);
                this._roomPreviewer.centerWallItems = true;
                this._roomPreviewer.createRoomForPreviews();
            }
        }
    }

    // viewer setup is real.
    /**
	 * @param catalogType - The catalog type to activate once the states exist
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::init()
    private init(catalogType: string): boolean
    {
        if(this._initialized) return false;

        this.createCatalogWindowStates();
        this.setActiveCatalogState(catalogType);
        this.updatePurse();
        this.createClubGiftController();
        this.createClubBuyController();
        this.createClubExtendController();
        this.createGroupMembershipsController();
        this.createMarketPlace();
        this.createRecycler();
        this._initialized = true;
        this.events.emit(CatalogEvent.CATALOG_INITIALIZED, new CatalogEvent(CatalogEvent.CATALOG_INITIALIZED));
        this.connection?.send(new BuildersClubQueryFurniCountMessageComposer());

        return true;
    }

    /**
     * Tears the catalog back down to "never opened": the window states, both navigators and the
     * viewer all go, so the next `toggleCatalog()` rebuilds them from a fresh index. Used after the
     * catalog is republished server-side and after a club purchase, both of which invalidate the
     * pages currently held.
     *
     * `disposing` skips the product-data reload — during `dispose()` there is nothing left to
     * reload into.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::reset()
    private reset(disposing: boolean = false): void
    {
        this._initialized = false;
        this._catalogViewer = null;
        this._mainWindow = null;

        if(this._catalogStates != null)
        {
            for(const state of this._catalogStates.values())
            {
                state.dispose();
            }

            this._catalogStates = null;
        }

        this._catalogNavigators = null;

        if(disposing) return;

        if(this._sessionDataManager == null)
        {
            // AS3 calls `_SafeCls_48.crash(...)` here — a hard client crash with a code. This port
            // logs and bails instead: the catalog is already torn down, and taking the whole client
            // with it is a Flash-era choice, not a requirement of the flow.
            log.error('Could not reload product data after reset() because the session data manager was null');

            return;
        }

        if(!this._sessionDataManager.loadProductData(this))
        {
            this.events.emit(CatalogEvent.CATALOG_NOT_READY, new CatalogEvent(CatalogEvent.CATALOG_NOT_READY));
        }
    }

    /**
	 * Builds the main window for one catalog type and returns it.
	 *
	 * buildWidgetLayout() doc: "AS3: buildFromXML(assets.getAssetByName(name).content as XML)".
	 *
	 * @param catalogType - The catalog type this window is for
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::createMainWindow()
    private createMainWindow(catalogType: string): IWindowContainer
    {
        const assetName = this.useNonTabbedCatalog(catalogType) ? 'catalog_ubuntu' : 'catalog_ubuntu_with_tabs';

        const window = this._windowManager!.buildWidgetLayout(assetName, 1) as unknown as IWindowContainer;

        window.tags.push('habbo_catalog');
        window.position = {x: 100, y: 5};
        window.visible = false;

        // buildWidgetLayout() leaves the window parented, and both mainWindowVisible()
        // and showMainWindow() judge by `parent` — a window still attached here reads as
        // already open, so showMainWindow() skips it and it never appears. AS3 detaches
        // it the same way and for the same reason (`_loc3_ = _loc2_.parent; if(_loc3_ !=
        // null) _loc3_.removeChild(_loc2_)`). Before CatalogWindowState this was done by
        // calling hideMainWindow() from here, which no longer fits: it hides whichever
        // window is *active*, and during construction that is not this one.
        const parent = window.parent as unknown as IWindowContainer | null;

        parent?.removeChild(window as unknown as IWindow);

        const closeButton = window.findChildByName('titlebar_close_button') ?? window.findChildByTag('close');

        if(closeButton)
        {
            closeButton.addEventListener('WME_CLICK', this.onWindowClose);
        }

        const searchInput = window.findChildByName('search.input') as unknown as ITextFieldWindow | null;

        if(searchInput)
        {
            searchInput.setSelection(0, searchInput.text.length);
            searchInput.focus();

            // AS3 (HabboCatalog.as:1804-1812) wires the search field and clear button.
            // The port had never attached them, so typing in the catalog search did
            // nothing (user-reported). The node search backend (CatalogNavigator.filter)
            // already exists; this just drives it.
            searchInput.addEventListener(WindowKeyboardEvent.KEY_DOWN, this.onSearchInputEvent);
            searchInput.addEventListener(WindowKeyboardEvent.KEY_UP, this.onSearchInputEvent);

            const clearButton = window.findChildByName('clear_search_button');

            if(clearButton)
            {
                clearButton.addEventListener('WME_CLICK', this.onClearSearch);
            }
        }

        return window;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onSearchInputEvent()
    // KEY_DOWN stops the debounce; KEY_UP re-arms it (>= 3 chars), searches immediately on
    // Enter, and clears when the field empties.
    private onSearchInputEvent = (event: WindowEvent): void =>
    {
        const searchInput = event.target as unknown as ITextFieldWindow | null;

        if(searchInput === null) return;

        if(event.type === WindowKeyboardEvent.KEY_DOWN)
        {
            if(this._searchTimer !== null)
            {
                clearTimeout(this._searchTimer);
                this._searchTimer = null;
            }

            return;
        }

        const caption = searchInput.text ?? '';
        const keyCode = (event as WindowKeyboardEvent).keyCode;

        if(caption.length === 0)
        {
            this.onClearSearch();
        }
        else if(keyCode === 13)
        {
            this.performSearch(caption);
        }
        else if(caption.length >= 3)
        {
            if(this._searchTimer !== null) clearTimeout(this._searchTimer);

            this._searchTimer = setTimeout(() => this.performSearch(caption), 50);
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::performSearch()
    private performSearch(query: string): void
    {
        if(this._searchTimer !== null)
        {
            clearTimeout(this._searchTimer);
            this._searchTimer = null;
        }

        if(query.length === 0) return;

        // CatalogNavigator.searchNodesWith matches against a lowercased haystack.
        this.currentCatalogNavigator?.filter(query.trim().toLowerCase(), []);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onClearSearch()
    private onClearSearch = (): void =>
    {
        if(this._searchTimer !== null)
        {
            clearTimeout(this._searchTimer);
            this._searchTimer = null;
        }

        const searchInput = this._mainWindow?.findChildByName('search.input') as unknown as ITextFieldWindow | null;

        if(searchInput)
        {
            searchInput.text = '';
        }

        this.currentCatalogNavigator?.showIndex();
    };

    /**
	 * Builds both catalog types' state up front, as AS3 does — the Builders Club
	 * window exists from init(), it is not made on first use.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::createCatalogWindowStates()
    private createCatalogWindowStates(): void
    {
        this._catalogStates = new Map();
        this._catalogNavigators = new Map();
        this.createCatalogWindowState('NORMAL');
        this.createCatalogWindowState('BUILDERS_CLUB');
    }

    /**
	 * Builds one catalog type's window, navigator and viewer, and files them.
	 *
	 * Each type gets its *own* main window. That is what lets the navigator
	 * constructor hide `tab_context` for BUILDERS_CLUB without taking NORMAL's
	 * tabs with it — sharing one window between both is what made the per-type
	 * answer unusable before.
	 *
	 * @param catalogType - The catalog type to build
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::createCatalogWindowState()
    private createCatalogWindowState(catalogType: string): CatalogWindowState
    {
        const existing = this._catalogStates?.get(catalogType) ?? null;

        if(existing != null) return existing;

        const state = new CatalogWindowState(catalogType);

        state.mainContainer = this.createMainWindow(catalogType);

        if(catalogType === 'BUILDERS_CLUB')
        {
            state.mainContainer.height += 15;
        }

        state.catalogNavigator = new CatalogNavigator(this, state.mainContainer, catalogType);
        state.catalogViewer = new CatalogViewer(
            this,
            state.mainContainer.findChildByName('layoutContainer') as unknown as IWindowContainer,
            catalogType
        );

        this._catalogStates!.set(catalogType, state);
        this._catalogNavigators!.set(catalogType, state.catalogNavigator as CatalogNavigator);

        return state;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::getCatalogState()
    private getCatalogState(catalogType: string): CatalogWindowState | null
    {
        return this._catalogStates?.get(catalogType) ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::ensureCatalogState()
    private ensureCatalogState(catalogType: string): CatalogWindowState
    {
        if(this._catalogStates == null) this._catalogStates = new Map();
        if(this._catalogNavigators == null) this._catalogNavigators = new Map();

        return this.getCatalogState(catalogType) ?? this.createCatalogWindowState(catalogType);
    }

    /**
	 * Makes `catalogType` the active one and re-points the flat fields at its state.
	 *
	 * The flat `_mainWindow`/`_catalogViewer` are AS3's own design, not a
	 * simplification: it keeps the same two fields and re-points them here, so the
	 * ~40 call sites that read them need no notion of catalog type.
	 *
	 * @param catalogType - The catalog type to activate
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::setActiveCatalogState()
    private setActiveCatalogState(catalogType: string): CatalogWindowState
    {
        this._catalogType = catalogType;

        const state = this.ensureCatalogState(catalogType);

        this._mainWindow = state.mainContainer;
        this._catalogViewer = state.catalogViewer;

        return state;
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::showMainWindow()
    private showMainWindow(): void
    {
        if(this._windowManager != null && this._mainWindow != null && this._mainWindow.parent == null)
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            // AS3 sets visible before attaching. Nothing else ever sets it back to true,
            // so a window built hidden — as AS3 builds them — depends on this line.
            this._mainWindow.visible = true;

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

            // The club-purchase veto. Note AS3 clears it outside this inner `if` but inside the
            // outer one: a hide attempted while the window is already detached does *not* consume
            // it, so the veto survives until a hide that would really have closed something.
            if(desktop != null && !this._suppressNextHideMainWindow)
            {
                desktop.removeChild(this._mainWindow);
                this._catalogViewer?.catalogWindowClosed();
            }

            this._suppressNextHideMainWindow = false;
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::mainWindowVisible()
    private mainWindowVisible(): boolean 
    {
        return this._windowManager != null && this._mainWindow != null && this._mainWindow.parent != null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::setElementImage()
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

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::refreshCatalogIndex()
    private refreshCatalogIndex(catalogType: string): void 
    {
        this.connection?.send(new GetCatalogIndexComposer(catalogType));
    }

    private onWindowClose = (_event: WindowEvent): void =>
    {
        this.hideMainWindow();
        this._catalogViewer?.catalogWindowClosed();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onGuildVisualSettingsChanged()
    private onGuildVisualSettingsChanged = (event: GuildSettingsChangedInManageEvent): void =>
    {
        this._groupMembershipsController?.onGuildVisualSettingsChanged(event.guildId);
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
    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::onCatalogIndex()
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

        if(!parser) return;

        // Resolve the state the *response* belongs to, not the active one. A page for
        // the type the user is no longer looking at still renders into its own viewer;
        // dropping it (`parser.catalogType !== this._catalogType`) meant switching to
        // Builders Club showed whatever NORMAL had left behind, because the page that
        // was in flight when the switch happened was thrown away.
        const state = this.getCatalogState(parser.catalogType);

        if(state == null || state.catalogViewer == null) return;

        const localization = new PageLocalization(
            [...(parser.localization?.images ?? [])],
            [...(parser.localization?.texts ?? [])]
        );

        const offers: IPurchasableOffer[] = [];

        for(const offerData of parser.offers) 
        {
            const products = offerData.products.map((productData) =>
            {
                // AS3 resolves the furniture data once and hands it to both the count
                // override and the Product (_loc8_).
                const furnitureData = this.getFurnitureData(productData.furniClassId, productData.productType);

                return new Product(
                    productData.productType,
                    productData.furniClassId,
                    productData.extraParam,
                    this.getProductCountOverride(offerData.localizationId, furnitureData, productData.productCount),
                    this.getProductData(offerData.localizationId),
                    furnitureData,
                    this,
                    productData.uniqueLimitedItem,
                    productData.uniqueLimitedItemSeriesSize,
                    productData.uniqueLimitedItemsLeft
                );
            });

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

        // lastPageRequestId is a race guard: only render the page this state actually
        // asked for last. A reply for a page the user has already navigated away from
        // arrives anyway, and must not overwrite what replaced it.
        if(state.lastPageRequestId === parser.pageId)
        {
            state.catalogViewer.showCatalogPage(
                parser.pageId,
                parser.layoutCode,
                localization,
                offers,
                parser.offerId,
                parser.acceptSeasonCurrencyAsCredits
            );
        }

        this.setCatalogBusy(parser.catalogType, false);
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::isOfferCompatibleWithCurrentMode()
    private isOfferCompatibleWithCurrentMode(offer: IPurchasableOffer): boolean 
    {
        return this._catalogType === 'NORMAL'
            || (offer.pricingModel !== 'pricing_model_bundle' && offer.pricingModel !== 'pricing_model_multi');
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void 
    {
        this._communication?.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::onCreditBalance()
    private onCreditBalance(event: IMessageEvent): void 
    {
        if(!event) return;

        const parser = event.parser as CreditBalanceEventParser | null;

        if(!parser) return;

        this._purse.credits = parser.balance;

        // Both of these were missing: without updatePurse() the catalog header keeps showing the
        // old balance until something else refreshes it.
        this.updatePurse();

        if(!this._firstCreditBalancePending)
        {
            this._soundManager?.playSound('HBST_purchase');
        }

        this._firstCreditBalancePending = false;

        this.events.emit(PurseEvent.CREDIT_BALANCE, new PurseEvent(PurseEvent.CREDIT_BALANCE, parser.balance, 0));
        this.events.emit(PurseUpdateEvent.UPDATE, new PurseUpdateEvent());
    }

    /**
	 * Single-currency balance update, as opposed to onActivityPoints()'s whole wallet.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onActivityPointNotification()
    private onActivityPointNotification(event: IMessageEvent): void
    {
        if(!event) return;

        const notification = event as HabboActivityPointNotificationMessageEvent;

        if(!notification.parser) return;

        // AS3 writes straight into the purse's dictionary (`purse.activityPoints[type] = amount`),
        // which leaves the other currencies untouched - setActivityPoints() would clear them.
        this._purse.activityPoints.set(notification.type, notification.amount);

        this.updatePurse();

        // Only duckets (type 0) get a chime; the seasonal currencies are silent.
        if(notification.type === 0)
        {
            this._soundManager?.playSound('HBST_pixels');
        }

        this.events.emit(
            PurseEvent.ACTIVITY_POINT_BALANCE,
            new PurseEvent(PurseEvent.ACTIVITY_POINT_BALANCE, notification.amount, notification.type)
        );
        this.events.emit(PurseUpdateEvent.UPDATE, new PurseUpdateEvent());
    }

    // AS3: .../src/com/sulake/habbo/catalog/HabboCatalog.as::onActivityPoints()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onSubscriptionInfo()
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onSubscriptionInfo()
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

        // responseType 2 is the post-purchase push: the club level the pages were built against is
        // stale, so the whole catalog is rebuilt and the page the purchase started from reopened.
        // AS3 uses the bare literal here, as it does with 3 for `isExpiring` above.
        if(parser.responseType === 2)
        {
            this.reset();

            if(this._pageToReopenAfterVipPurchase !== null)
            {
                this.openCatalogPage(this._pageToReopenAfterVipPurchase);
                this._pageToReopenAfterVipPurchase = null;
            }
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onPurchaseOK()
    // TODO(AS3): AS3 also plays an icon-flyover animation toward the toolbar
    // (`_toolbar.createTransitionToIcon()` with the dialog's own icon bitmap, aimed at
    // HTIE_ICON_INVENTORY or HTIE_ICON_MEMENU for an effect), and calls the dialog's
    // ltdRaffleEnded() - the LTD raffle timer is not ported.
    private onPurchaseOK(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as PurchaseOKMessageEventParser | null;
        const offer = parser?.offer;

        if(offer)
        {
            this.events.emit(CatalogFurniPurchaseEvent.CATALOG_FURNI_PURCHASE, new CatalogFurniPurchaseEvent(offer.localizationId));
        }

        // AS3 closes the confirmation here, not on the buy click: the dialog stays up with its
        // buttons disabled until the server answers, which is what makes a rejected purchase leave
        // it open for onPurchaseError/onNotEnoughBalance to speak to.
        this._purchaseConfirmationDialog?.dispose();
        this._purchaseConfirmationDialog = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onPurchaseError()
    private onPurchaseError(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as PurchaseErrorMessageEventParser | null;

        if(!parser) return;

        const description = parser.errorCode > 0
            ? `\${catalog.alert.purchaseerror.description.${parser.errorCode}}`
            : '${catalog.alert.purchaseerror.description}';

        this._windowManager?.alert('${catalog.alert.purchaseerror.title}', description, 0, this.alertDialogEventProcessor);

        // AS3 tears the confirmation down here too - the buy and cancel buttons were disabled when
        // the composer went out, so leaving it up would strand the user on a dead dialog.
        this._purchaseConfirmationDialog?.dispose();
        this._purchaseConfirmationDialog = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onPurchaseNotAllowed()
    private onPurchaseNotAllowed(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as PurchaseNotAllowedMessageEventParser | null;

        if(!parser) return;

        const description = parser.errorCode - 1 === 0
            ? '${catalog.alert.purchasenotallowed.hc.description}'
            : '${catalog.alert.purchasenotallowed.unknown.description}';

        this._windowManager?.alert('${catalog.alert.purchasenotallowed.title}', description, 0, this.alertDialogEventProcessor);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onNotEnoughBalance()
    private onNotEnoughBalance(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as NotEnoughBalanceMessageEventParser | null;

        if(!parser) return;

        if(parser.notEnoughCredits)
        {
            this.showNotEnoughCreditsAlert();
        }
        else if(parser.notEnoughActivityPoints)
        {
            this.showNotEnoughActivityPointsAlert(parser.activityPointType);
        }

        this._purchaseConfirmationDialog?.notEnoughCredits();
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onHabboClubOffers()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onHabboClubExtendOffer()
    // Unlike onHabboClubOffers() above, AS3 forwards the raw event here (not its parser) -
    // ClubExtendController.onOffer() does its own event.getParser() extraction. Preserved as-is,
    // a genuine inconsistency in the primary source between these two otherwise-similar handlers.
    private onHabboClubExtendOffer(event: IMessageEvent): void
    {
        // Not a user-driven open: this arrives on a server message, so it initialises
        // against whichever type is already current rather than switching to one.
        if(!this._initialized) this.init(this._catalogType);

        if(this._clubExtendController) this._clubExtendController.onOffer(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onClubGiftInfo()
    private onClubGiftInfo(event: IMessageEvent): void
    {
        if(!event || !this._clubGiftController) return;

        const parser = event.parser as ClubGiftInfoEventParser | null;

        if(!parser) return;

        this._clubGiftController.setInfo(parser.daysUntilNextGift, parser.giftsAvailable, parser.offers, parser.giftData);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onMarketPlaceOffers()
    private onMarketPlaceOffers(event: IMessageEvent): void
    {
        this._marketPlace?.onOffers(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onMarketPlaceOwnOffers()
    private onMarketPlaceOwnOffers(event: IMessageEvent): void
    {
        this._marketPlace?.onOwnOffers(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onMarketPlaceBuyResult()
    private onMarketPlaceBuyResult(event: IMessageEvent): void
    {
        this._marketPlace?.onBuyResult(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onMarketPlaceCancelResult()
    private onMarketPlaceCancelResult(event: IMessageEvent): void
    {
        this._marketPlace?.onCancelResult(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onMarketPlaceCancelAllResult()
    private onMarketPlaceCancelAllResult(event: IMessageEvent): void
    {
        this._marketPlace?.onCancelAllResult(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onMarketPlaceClearOwnHistoryResult()
    private onMarketPlaceClearOwnHistoryResult(event: IMessageEvent): void
    {
        this._marketPlace?.onClearOwnHistoryResult(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onRecyclerStatus()
    private onRecyclerStatus(event: IMessageEvent): void
    {
        const parser = event.parser as RecyclerStatusMessageEventParser | null;

        if(!parser || !this._recycler) return;

        this._recycler.setSystemStatus(parser.recyclerStatus, parser.recyclerTimeoutSeconds);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onRecyclerFinished()
    private onRecyclerFinished(event: IMessageEvent): void
    {
        const parser = event.parser as RecyclerFinishedMessageEventParser | null;

        if(!parser || !this._recycler) return;

        this._recycler.setFinished(parser.recyclerFinishedStatus, parser.prizeId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onRecyclerPrizes()
    private onRecyclerPrizes(event: IMessageEvent): void
    {
        const parser = event.parser as RecyclerPrizesMessageEventParser | null;

        if(!parser || !this._recycler) return;

        this._recycler.storePrizeTable(parser.prizeLevels);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onGuildMemberships()
    public onGuildMemberships(event: IMessageEvent): void
    {
        this._groupMembershipsController?.onGuildMembershipsMessageEvent(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onMarketplaceItemStats()
    private onMarketplaceItemStats(event: IMessageEvent): void
    {
        if(!event || !this._marketPlace) return;

        const parser = event.parser as MarketplaceItemStatsEventParser | null;

        if(!parser) return;

        const stats = new MarketplaceItemStats();

        stats.averagePrice = parser.averagePrice;
        stats.offerCount = parser.offerCount;
        stats.historyLength = parser.historyLength;
        stats.dayOffsets = parser.dayOffsets;
        stats.averagePrices = parser.averagePrices;
        stats.soldAmounts = parser.soldAmounts;
        stats.furniCategoryId = parser.furniCategoryId;
        stats.furniTypeId = parser.furniTypeId;
        stats.lowestCurrentPrice = parser.lowestCurrentPrice;
        stats.suggestedPrice = parser.suggestedPrice;
        this._marketPlace.itemStats = stats;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::onMarketplaceConfiguration()
    private onMarketplaceConfiguration(event: IMessageEvent): void
    {
        if(!event || !this._marketPlace) return;

        const parser = event.parser as MarketplaceConfigurationEventParser | null;

        if(!parser) return;

        this._marketPlace.averagePricePeriod = parser.averagePricePeriod;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::alertDialogEventProcessor()
    private alertDialogEventProcessor = (dialog: IDisposable, _event: WindowEvent): void =>
    {
        dialog.dispose();
        this.resetPlacedOfferData();
    };

    /**
     * Takes the ghost furni back out of the room. `placingItem` is true only when called from the
     * placement callbacks themselves — they are mid-placement, so restoring the catalog window
     * there would fight the drag that is still running.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::resetPlacedOfferData()
    public resetPlacedOfferData(placingItem: boolean = false): void
    {
        if(!placingItem)
        {
            this.resetObjectMover();
        }

        if(this._placedOfferData === null) return;

        if(this._placedOfferData.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
        {
            this._roomEngine?.disposeObjectFurniture(this._placedOfferData.roomId, this._placedOfferData.objectId);
        }
        else if(this._placedOfferData.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
        {
            switch(this._placedOfferData.furniData?.className ?? '')
            {
                case 'floor':
                case 'wallpaper':
                case 'landscape':
                    // Re-applies the room's own three decoration types, undoing the preview.
                    this.updateRoom('reset', '');
                    break;
                default:
                    this._roomEngine?.disposeObjectWallItem(this._placedOfferData.roomId, this._placedOfferData.objectId);
            }
        }
        else
        {
            this._roomEngine?.deleteRoomObject(this._placedOfferData.objectId, this._placedOfferData.category);
        }

        this._placedOfferData.dispose();
        this._placedOfferData = null;
    }

    /**
     * Note the asymmetry, preserved from AS3: a purchase of a *different* offer clears the ghost,
     * but a purchase of the same one leaves it standing — that is the case where the ghost is about
     * to become the real item.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::syncPlacedOfferWithPurchase()
    public syncPlacedOfferWithPurchase(offer: IPurchasableOffer): void
    {
        if(this._placedOfferData !== null && this._placedOfferData.offerId !== offer.offerId)
        {
            this.resetPlacedOfferData();
        }
    }
}
