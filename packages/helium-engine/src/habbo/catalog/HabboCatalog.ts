import {Component, ComponentDependency, type IContext} from '@core/runtime';
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
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {CreditBalanceEvent} from '@habbo/communication/messages/incoming/inventory/purse/CreditBalanceEvent';
import type {CreditBalanceEventParser} from '@habbo/communication/messages/parser/inventory/purse/CreditBalanceEventParser';
import {ActivityPointsMessageEvent} from '@habbo/communication/messages/incoming/notifications/ActivityPointsMessageEvent';
import type {ActivityPointsMessageParser} from '@habbo/communication/messages/parser/notifications/ActivityPointsMessageParser';
import {GetCreditsInfoComposer} from '@habbo/communication/messages/outgoing/inventory/purse/GetCreditsInfoComposer';
import type {IHabboCatalog} from './IHabboCatalog';
import type {IPurchasableOffer} from './IPurchasableOffer';
import {CatalogEarnings} from './CatalogEarnings';
import {Purse} from './purse/Purse';
import {PurseEvent} from './purse/PurseEvent';
import {PurseUpdateEvent} from './purse/PurseUpdateEvent';

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
    private _windowManager: IHabboWindowManager | null = null;
    private _localization: IHabboLocalizationManager | null = null;
    private _sessionDataManager: ISessionDataManager | null = null;
    private _avatarRenderManager: IAvatarRenderManager | null = null;
    private _roomEngine: IRoomEngine | null = null;
    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::var_39 (main window)
    // Set once createMainWindow() (Phase 5) exists; setLeftPaneVisibility() no-ops until then.
    private _mainWindow: IWindowContainer | null = null;
    private _messageEvents: IMessageEvent[] = [];
    private _purse: Purse = new Purse();
    private _earnings: CatalogEarnings = new CatalogEarnings();
    private _giftReceiver: string = '';
    private _catalogType: string = 'NORMAL';
    private _videoOffers: { readonly enabled: boolean } = {enabled: false};

    constructor(context: IContext)
    {
        super(context);
    }

    get assets(): IAssetLibrary | null { return super.assets; }
    get windowManager(): IHabboWindowManager | null { return this._windowManager; }
    get localization(): IHabboLocalizationManager | null { return this._localization; }
    get connection(): IConnection | null { return this._communication?.connection ?? null; }
    get videoOffers(): { readonly enabled: boolean } { return this._videoOffers; }
    get privateRoomSessionActive(): boolean { return false; }
    get tradingActive(): boolean { return false; }
    get imageGalleryHost(): string { return this.getProperty('image.library.catalogue.url'); }
    get buildersClubEnabled(): boolean { return this.getBoolean('builders.club.enabled'); }
    get catalogType(): string { return this._catalogType; }
    get collectorHub(): unknown | null { return null; }

    get giftReceiver(): string
    {
        return this._giftReceiver;
    }

    set giftReceiver(value: string)
    {
        this._giftReceiver = value;
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
        ];
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get avatarRenderManager()
    get avatarRenderManager(): IAvatarRenderManager | null
    {
        return this._avatarRenderManager;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
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

    protected override initComponent(): void
    {
        this.addMessageEvent(new CreditBalanceEvent(this.onCreditBalance.bind(this)));
        this.addMessageEvent(new ActivityPointsMessageEvent(this.onActivityPoints.bind(this)));
        this.connection?.send(new GetCreditsInfoComposer());
    }

    public redeemVoucher(_voucher: string): void
    {
    }

    public loadCatalogPage(_pageId: number, _offerId: number, catalogType: string): void
    {
        this._catalogType = catalogType;
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

    public toggleCatalog(pageName: string, _forceOpen: boolean = false, _showMainWindow: boolean = true): void
    {
        if(pageName !== '')
        {
            this.openCatalogPage(pageName);
        }
        else
        {
            this.openCatalog();
        }
    }

    public openCatalog(): void
    {
        this.context.createLinkEvent('catalog/open');
    }

    public openCatalogPage(pageName: string, catalogType: string | null = null): void
    {
        if(catalogType !== null)
        {
            this._catalogType = catalogType;
        }

        this.context.createLinkEvent(`catalog/open/${pageName}`);
    }

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

    public openCatalogPageById(_pageId: number, _offerId: number, catalogType: string): void
    {
        this._catalogType = catalogType;
    }

    public openCatalogPageByOfferId(_offerId: number, catalogType: string): void
    {
        this._catalogType = catalogType;
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

    // AS3: sources/win63_version/habbo/catalog/HabboCatalog.as::getFurnitureData()
    // The decompiled source computes the result into a local but always `return null`s
    // instead of returning it - reconstructed to return the looked-up data.
    public getFurnitureData(classId: number, productType: string): IFurnitureData | null
    {
        if(productType === 's') return this._sessionDataManager?.getFloorItemData(classId) ?? null;
        if(productType === 'i') return this._sessionDataManager?.getWallItemData(classId) ?? null;

        return null;
    }

    public getPixelEffectIcon(_effectId: number): ImageBitmap | null
    {
        return null;
    }

    public getSubscriptionProductIcon(_productId: number): ImageBitmap | null
    {
        return null;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::isDraggable()
    // Real logic needs room-session state (isRoomOwner/isGuildRoom/roomControllerLevel),
    // the active navigator page's allowDragging, and Builders Club furniture-placement
    // status (getBuilderFurniPlaceableStatusForOffer(), itself dependent on room-session
    // furniture counts) - none of that catalog/room-session cross-wiring exists yet.
    // Defaulting to false (drag-and-drop disabled) rather than guessing at the gating logic.
    public isDraggable(_offer: IPurchasableOffer): boolean
    {
        return false;
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalog.as::setImageFromAsset()
    // Real logic loads a named asset from the asset library and, on a cache miss, retrieves
    // it via retrievePreviewAsset() (async network fetch) before applying it - that fetch
    // path isn't wired up yet. The synchronous cache-hit path is implemented for real.
    public setImageFromAsset(target: unknown, assetName: string | null, _onAssetReady?: ((event: unknown) => void) | null): void
    {
        if(!assetName || !this.assets) return;

        const asset = this.assets.getAssetByName(assetName);

        if(!asset || !target) return;

        (target as {bitmap: ImageBitmap | null}).bitmap = asset.content as ImageBitmap;
    }

    public getPurse(): Purse
    {
        return this._purse;
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

    public getHabboClubOffers(_clubType: number): void
    {
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

    public displayProductIcon(_productType: string, _classId: number, _target: unknown): void
    {
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

    public getCatalogNavigator(_catalogType: string): unknown | null
    {
        return null;
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

    public itemAddedToInventory(_classId: number, _itemId: number, _category: number): void
    {
    }

    public getActivityPointName(activityPointType: number): string
    {
        return this._localization?.getLocalization(`achievements.activitypoint.${activityPointType}`, '') ?? '';
    }

    public canPlaceWithBC(): boolean
    {
        return false;
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
}
