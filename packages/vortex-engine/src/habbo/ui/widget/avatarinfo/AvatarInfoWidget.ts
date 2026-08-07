/**
 * AvatarInfoWidget — the RWE_AVATAR_INFO widget, own-avatar slice.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/AvatarInfoWidget.as
 *
 * Owns the own-avatar bubble (OwnAvatarMenuView) and the whole pet side: the two context
 * bubbles (PetMenuView / OwnPetMenuView) opened on RWUIUE_OWN_USER / RWPIUE_PET_INFO, the
 * per-pet use-product and breed-with bubbles, and the five pet dialogs (use-product
 * confirmation, monsterplant breeding confirmation, nest breeding confirmation, breeding
 * result, nest breeding success). It repositions every visible bubble each frame against its
 * pet's on-screen box and owns the three breeding composers.
 *
 * Still deferred (TODO(AS3)): bots/other-avatar menus, decorate mode, the avatar name bubbles
 * and the avatar-highlight timer.
 *
 * AS3 adaptations: positioning uses roomEngine.getRoomObjectBoundingRectangle
 * directly (no RWGOI message round-trip); the per-frame tick uses the window
 * manager's update receiver.
 */
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {RoomWidgetRoomObjectMessage} from '@habbo/ui/widget/messages/RoomWidgetRoomObjectMessage';
import {RoomWidgetUserInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent';
import {RoomWidgetRoomObjectUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetRoomObjectUpdateEvent';
import {RoomWidgetPetInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetInfoUpdateEvent';
import {RoomWidgetPetStatusUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetStatusUpdateEvent';
import {RoomWidgetPetLevelUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetLevelUpdateEvent';
import {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';
import {HabboInventoryEffectsEvent} from '@habbo/inventory/events/HabboInventoryEffectsEvent';
import type {IContextMenuParentWidget} from '../contextmenu/IContextMenuParentWidget';
import type {ContextInfoView} from '../contextmenu/ContextInfoView';
import type {AvatarContextInfoButtonView} from './AvatarContextInfoButtonView';
import {AvatarInfoData} from './AvatarInfoData';
import {OwnAvatarMenuView} from './OwnAvatarMenuView';
import {PetInfoData} from './PetInfoData';
import {PetMenuView} from './PetMenuView';
import {OwnPetMenuView} from './OwnPetMenuView';
import {UseProductView} from './UseProductView';
import {BreedPetView} from './BreedPetView';
import {UseProductConfirmationView} from './UseProductConfirmationView';
import {BreedMonsterPlantsConfirmationView} from './BreedMonsterPlantsConfirmationView';
import {ConfirmPetBreedingView} from './ConfirmPetBreedingView';
import {BreedPetsResultView} from './BreedPetsResultView';
import {BreedPetsResultData} from './BreedPetsResultData';
import {NestBreedingSuccessView} from './NestBreedingSuccessView';
import {RoomWidgetPetBreedingEvent} from '@habbo/ui/widget/events/RoomWidgetPetBreedingEvent';
import {RoomWidgetPetBreedingResultEvent} from '@habbo/ui/widget/events/RoomWidgetPetBreedingResultEvent';
import {RoomWidgetConfirmPetBreedingEvent} from '@habbo/ui/widget/events/RoomWidgetConfirmPetBreedingEvent';
import {RoomWidgetConfirmPetBreedingResultEvent} from '@habbo/ui/widget/events/RoomWidgetConfirmPetBreedingResultEvent';
import {BreedPetsMessageComposer} from '@habbo/communication/messages/outgoing/room/pet/BreedPetsMessageComposer';
import {ConfirmPetBreedingComposer} from '@habbo/communication/messages/outgoing/inventory/pets/ConfirmPetBreedingComposer';
import {CancelPetBreedingComposer} from '@habbo/communication/messages/outgoing/inventory/pets/CancelPetBreedingComposer';
import type {UseProductItem} from '@habbo/ui/widget/events/UseProductItem';
import type {ConfirmPetBreedingPetData} from '@habbo/ui/widget/events/ConfirmPetBreedingPetData';
import type {BreedingRarityCategoryData} from '@habbo/ui/widget/events/BreedingRarityCategoryData';
import type {IUserData} from '@habbo/session/IUserData';
import type {IConfirmDialog} from '@habbo/window/utils/ConfirmDialog';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {AvatarInfoWidgetHandler} from '@habbo/ui/handler/AvatarInfoWidgetHandler';

// figure_effect ids that mean "in water" / "riding" (AvatarInfoWidget.as).
const SWIM_EFFECTS: number[] = [29, 30, 185];
const RIDE_EFFECT: number = 77;

// IUserData.type for a pet — the literal AS3 passes to PetMenuView.setup()/getUserDataByType().
const USER_TYPE_PET: number = 2;

// PetInfoData.petType for a monsterplant (AvatarInfoWidget.as::isMonsterPlant()).
const PET_TYPE_MONSTERPLANT: number = 16;

export class AvatarInfoWidget extends RoomWidgetBase implements IContextMenuParentWidget, IUpdateReceiver
{
    private _config: IHabboConfigurationManager | null;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/AvatarInfoWidget.as::_catalog
    private _catalog: IHabboCatalog | null;
    private _data: AvatarInfoData = new AvatarInfoData();
    // AS3: AvatarInfoWidget.as::_activeView (obfuscated `_SafeStr_4550`; named from removeView(),
    // which clears it, and updatePetView(), which tests what it currently is)
    private _activeView: AvatarContextInfoButtonView | null = null;
    private _cachedOwnMenu: OwnAvatarMenuView | null = null;
    private _isDancing: boolean = false;
    private _ownRoomIndex: number = -1;
    private _updateRegistered: boolean = false;

    // AS3: AvatarInfoWidget.as::_petData (obfuscated `_SafeStr_5133`) — the pet state kept
    // between RWPIUE_PET_INFO events; both pet bubbles read it.
    private _petData: PetInfoData = new PetInfoData();
    // AS3: AvatarInfoWidget.as::_cachedOwnPetMenu (obfuscated `_SafeStr_6484`; the AS3 sibling
    // `_cachedOwnAvatarMenu` is readable and names the pattern)
    private _cachedOwnPetMenu: OwnPetMenuView | null = null;
    // AS3: AvatarInfoWidget.as::_cachedPetMenu (obfuscated `_SafeStr_5550`)
    private _cachedPetMenu: PetMenuView | null = null;

    // AS3: AvatarInfoWidget.as::_handlePetInfo
    private _handlePetInfo: boolean = true;

    // AS3: AvatarInfoWidget.as::_pendingMenuRoomIndex (obfuscated `_SafeStr_5652`) — with
    // _buttonsSetup below, the menu build deferred until the wired click handler has had its
    // say (setupMenuView()).
    private _pendingMenuRoomIndex: number = -1;
    // AS3: AvatarInfoWidget.as::_buttonsSetup
    private _buttonsSetup: (() => void) | null = null;

    // AS3: AvatarInfoWidget.as::_useProductBubbles — one bubble per candidate pet, keyed on its
    // webID (AS3 keys its own map by the same string).
    private _useProductBubbles: Map<string, UseProductView> = new Map();
    // AS3: AvatarInfoWidget.as::_breedPetBubbles
    private _breedPetBubbles: Map<string, BreedPetView> = new Map();

    // The five modal pet dialogs, each at most one at a time.
    // AS3: AvatarInfoWidget.as::_useProductConfirmationView (obfuscated `_SafeStr_4966`)
    private _useProductConfirmationView: UseProductConfirmationView | null = null;
    // AS3: AvatarInfoWidget.as::_breedMonsterPlantsConfirmationView (obfuscated `_SafeStr_4972`)
    private _breedMonsterPlantsConfirmationView: BreedMonsterPlantsConfirmationView | null = null;
    // AS3: AvatarInfoWidget.as::_confirmPetBreedingView (obfuscated `_SafeStr_5284`)
    private _confirmPetBreedingView: ConfirmPetBreedingView | null = null;
    // AS3: AvatarInfoWidget.as::_breedPetsResultView (obfuscated `_SafeStr_4888`)
    private _breedPetsResultView: BreedPetsResultView | null = null;
    // AS3: AvatarInfoWidget.as::_nestBreedingSuccessView (obfuscated `_SafeStr_8360`)
    private _nestBreedingSuccessView: NestBreedingSuccessView | null = null;

    // AS3: AvatarInfoWidget.as::_breedingConfirmationAlert
    private _breedingConfirmationAlert: IConfirmDialog | null = null;
    // AS3: AvatarInfoWidget.as::_breedingAlertRequestObjectId (obfuscated `_SafeStr_7960`; named
    // from showBreedingPetsWaitingConfirmationAlert(), which stores the pair the alert can cancel)
    private _breedingAlertRequestObjectId: number = -1;
    // AS3: AvatarInfoWidget.as::_breedingAlertTargetObjectId (obfuscated `_SafeStr_6730`)
    private _breedingAlertTargetObjectId: number = -1;

    // AS3: AvatarInfoWidget.as::AvatarInfoWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        config: IHabboConfigurationManager | null,
        catalog: IHabboCatalog | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._config = config;
        this._catalog = catalog;
        this.handler.widget = this;

        this.container?.desktopEvents.on(RoomWidgetUserInfoUpdateEvent.OWN_USER, this.onUserInfoUpdate);
        this.container?.desktopEvents.on(RoomWidgetRoomObjectUpdateEvent.OBJECT_DESELECTED, this.onObjectDeselected);
        this.container?.desktopEvents.on(RoomWidgetRoomObjectUpdateEvent.OBJECT_SELECTED, this.onObjectSelected);
        this.container?.desktopEvents.on(RoomWidgetPetInfoUpdateEvent.PET_INFO, this.onPetInfoUpdate);
        this.container?.desktopEvents.on(RoomWidgetPetStatusUpdateEvent.PET_STATUS_UPDATE, this.onPetStatusUpdate);
        this.container?.desktopEvents.on(RoomWidgetPetLevelUpdateEvent.PET_LEVEL_UPDATE, this.onPetLevelUpdate);
        this.container?.desktopEvents.on(RoomWidgetPetBreedingEvent.PET_BREEDING, this.onPetBreeding);
        this.container?.desktopEvents.on(RoomWidgetPetBreedingResultEvent.PET_BREEDING_RESULT, this.onPetBreedingResult);
        this.container?.desktopEvents.on(RoomWidgetConfirmPetBreedingEvent.CONFIRM_PET_BREEDING, this.onConfirmPetBreeding);
        this.container?.desktopEvents.on(RoomWidgetConfirmPetBreedingResultEvent.CONFIRM_PET_BREEDING_RESULT, this.onConfirmPetBreedingResult);
        this.container?.desktopEvents.on(RoomWidgetRoomObjectUpdateEvent.FURNI_ADDED, this.onFurniAdded);
        this.container?.inventory?.events.on(HabboInventoryEffectsEvent.HIEE_EFFECTS_CHANGED, this.onEffectsChanged);
    }

    // AS3: AvatarInfoWidget.as::get handler()
    public get handler(): AvatarInfoWidgetHandler
    {
        return this.widgetHandler as AvatarInfoWidgetHandler;
    }

    private get container(): IRoomWidgetHandlerContainer | null
    {
        return this.handler?.container ?? null;
    }

    // --- IContextMenuParentWidget ---

    // AS3: AvatarInfoWidget.as::get configuration()
    public get configuration(): IHabboConfigurationManager | null
    {
        return this._config;
    }

    // AS3: AvatarInfoWidget.as::get catalog()
    public get catalog(): IHabboCatalog | null
    {
        return this._catalog;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/AvatarInfoWidget.as::get friendList()
    public get friendList(): IHabboFriendList | null
    {
        return this.container?.friendList ?? null;
    }

    // AS3: AvatarInfoWidget.as::removeView()
    // The menu bubbles are cached and only hidden; the per-pet use-product/breed bubbles are
    // one-shot, so they leave their map and are disposed outright.
    public removeView(view: ContextInfoView, animate: boolean): void
    {
        view.hide(animate);

        if(view === this._activeView)
        {
            this._activeView = null;
        }

        if(view instanceof UseProductView)
        {
            this._useProductBubbles.delete(view.userId.toString());
            view.dispose();
        }

        if(view instanceof BreedPetView)
        {
            this._breedPetBubbles.delete(view.userId.toString());
            view.dispose();
        }

        this.checkUpdateNeed();
    }

    // AS3: AvatarInfoWidget.as::close()
    public close(): void
    {
        if(this._activeView) this.removeView(this._activeView, false);
    }

    // --- open flow ---

    // AS3: AvatarInfoWidget.as::selectOwnAvatar()
    // AS3 adaptation: roomEngine.selectAvatar isn't exposed in the port, so we
    // send GET_OBJECT_INFO for the own avatar directly — the InfoStand handler
    // answers with a RWUIUE_OWN_USER event we consume in onUserInfoUpdate.
    public selectOwnAvatar(): void
    {
        const container = this.container;

        if(!container || !container.sessionDataManager) return;

        const userId = container.sessionDataManager.userId;
        const userData = container.roomSession.userDataManager.getUserData(userId);

        if(!userData) return;

        this._ownRoomIndex = userData.roomObjectId;

        container.processWidgetMessage(
            new RoomWidgetRoomObjectMessage(RoomWidgetRoomObjectMessage.GET_OBJECT_INFO, userData.roomObjectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER)
        );
    }

    // AS3: AvatarInfoWidget.as::updateEventHandler (RWUIUE_OWN_USER case) + updateUserView()
    private onUserInfoUpdate = (event: RoomWidgetUserInfoUpdateEvent): void =>
    {
        if(event.type !== RoomWidgetUserInfoUpdateEvent.OWN_USER) return;

        this._data.populate(event);

        // Resolve the own room-object id here too — this event also fires when the
        // user clicks their own avatar directly (not only via selectOwnAvatar), and
        // the bubble needs the id to position itself. Without this, clicking your
        // avatar did nothing until the toolbar me-menu had been opened once.
        const container = this.container;
        const userId = container?.sessionDataManager?.userId ?? -1;
        const userData = userId >= 0 ? (container?.roomSession.userDataManager.getUserData(userId) ?? null) : null;

        if(userData) this._ownRoomIndex = userData.roomObjectId;

        if(!this._cachedOwnMenu)
        {
            this._cachedOwnMenu = new OwnAvatarMenuView(this);
        }

        this._activeView = this._cachedOwnMenu;

        OwnAvatarMenuView.setup(this._cachedOwnMenu, event.webID, event.name, this._ownRoomIndex, 1, this._data);

        this.checkUpdateNeed();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler (RWROUE_OBJECT_DESELECTED case)
    // — the bubble is dismissed when the avatar/selection is deselected, which the
    // room engine now emits for an unhandled (floor/empty-space) click.
    private onObjectDeselected = (): void =>
    {
        this.close();
        this.removeUseProductViews();
        this.removeBreedPetViews();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWROUE_OBJECT_SELECTED case)
    // Selecting a unit re-arms pet-info handling, which RWUAM_REQUEST_PET_UPDATE turned off so
    // the infostand's own refresh would not re-open the bubble. Without this the bubble stops
    // opening for the rest of the session after the first refresh.
    private onObjectSelected = (event: RoomWidgetRoomObjectUpdateEvent): void =>
    {
        if(event.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) this._handlePetInfo = true;

        this.removeBreedPetViews();
    };

    // AS3: AvatarInfoWidget.as::onEffectsChanged()
    private onEffectsChanged = (): void =>
    {
        if(this._activeView instanceof OwnAvatarMenuView) this._activeView.updateButtons();
    };

    // --- pets ---

    // AS3: AvatarInfoWidget.as::set handlePetInfo()
    // Cleared by the RWUAM_REQUEST_PET_UPDATE action so the refresh the infostand asks for
    // does not re-open the bubble; RWROUE_OBJECT_SELECTED sets it back.
    public set handlePetInfo(value: boolean)
    {
        this._handlePetInfo = value;
    }

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWPIUE_PET_INFO case)
    private onPetInfoUpdate = (event: RoomWidgetPetInfoUpdateEvent): void =>
    {
        if(!this._handlePetInfo) return;

        this._petData.populate(event);
        this.updatePetView(event.id, event.name, event.roomIndex, this._petData);
        this.checkUpdateNeed();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWPIUE_PET_STATUS_UPDATE case)
    // The bubble's buttons are decided at setup time, so a status change closes it rather
    // than re-rendering — the next click rebuilds it from the fresh data.
    private onPetStatusUpdate = (event: RoomWidgetPetStatusUpdateEvent): void =>
    {
        if(this._activeView instanceof OwnPetMenuView) this.closeIfSamePet(event.petId);

        this.removeBreedPetViewsWithId(event.petId);
        this.checkUpdateNeed();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWPLUE_PET_LEVEL_UPDATE case)
    private onPetLevelUpdate = (event: RoomWidgetPetLevelUpdateEvent): void =>
    {
        if(this._activeView instanceof OwnPetMenuView) this.closeIfSamePet(event.petId);

        this.removeBreedPetViewsWithId(event.petId);
        this.checkUpdateNeed();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler() — the shared body of the two cases above.
    // The event carries the pet's *room index*; the open bubble is keyed on its webID.
    private closeIfSamePet(roomIndex: number): void
    {
        const userData = this.container?.roomSession.userDataManager.getUserDataByIndex(roomIndex) ?? null;

        if(userData && userData.webID === this._petData.id && this._activeView)
        {
            this.removeView(this._activeView, true);
        }
    }

    // AS3: AvatarInfoWidget.as::updatePetView()
    private updatePetView(petId: number, userName: string, roomIndex: number, petData: PetInfoData): void
    {
        if(!petData) return;

        const active = this._activeView;

        if(active && !(active instanceof OwnAvatarMenuView || active instanceof PetMenuView || active instanceof OwnPetMenuView))
        {
            this.removeView(active, false);
        }

        if(!this._activeView
            || this._activeView.userId !== petId
            || this._activeView.userName !== userName
            || this._activeView.roomIndex !== roomIndex
            || this._activeView.userType !== USER_TYPE_PET)
        {
            if(this._activeView) this.removeView(this._activeView, false);

            if(this.isGameMode()) return;

            this._pendingMenuRoomIndex = roomIndex;

            if(petData.isOwnPet)
            {
                if(!this._cachedOwnPetMenu) this._cachedOwnPetMenu = new OwnPetMenuView(this, this._catalog);

                this._buttonsSetup = (): void =>
                {
                    const view = this._cachedOwnPetMenu;

                    if(!view) return;

                    this._activeView = view;
                    OwnPetMenuView.setup(view, petId, userName, roomIndex, USER_TYPE_PET, petData);
                };
            }
            else
            {
                if(!this._cachedPetMenu) this._cachedPetMenu = new PetMenuView(this);

                this._buttonsSetup = (): void =>
                {
                    const view = this._cachedPetMenu;

                    if(!view) return;

                    this._activeView = view;
                    PetMenuView.setup(view, petId, userName, roomIndex, USER_TYPE_PET, petData);
                };
            }

            this.maybeSetupMenuView(roomIndex);
        }
        else if(this._activeView instanceof OwnAvatarMenuView && this._activeView.userName === userName)
        {
            this.removeView(this._activeView, false);
        }
    }

    // AS3: AvatarInfoWidget.as::maybeSetupMenuView()
    // A room whose wired handles user clicks decides whether the menu opens; the wired
    // module is not implemented in this port (userDefinedRoomEvents is always null), so the
    // gate reads as "no wired" and the menu opens immediately.
    // TODO(AS3): once IHabboUserDefinedRoomEvents has an implementation, also subscribe to
    // WIRED_USER_CLICK_HANDLED (onUserClickHandledEvent) to build the deferred menu.
    private maybeSetupMenuView(roomIndex: number): void
    {
        if(this.container?.userDefinedRoomEvents?.hasClickUserWired() ?? false) return;

        this.setupMenuView(roomIndex);
    }

    // AS3: AvatarInfoWidget.as::setupMenuView()
    private setupMenuView(roomIndex: number): void
    {
        if(this._pendingMenuRoomIndex === roomIndex && this._buttonsSetup !== null)
        {
            this._buttonsSetup();
            this._pendingMenuRoomIndex = -1;
            this._buttonsSetup = null;
        }
    }

    // AS3: AvatarInfoWidget.as::isGameMode()
    private isGameMode(): boolean
    {
        return this.container?.roomEngine?.getActiveRoomIsPlayingGame() ?? false;
    }

    // --- use-product / breed-with bubbles ---

    // AS3: AvatarInfoWidget.as::showUseProductMenuForItems()
    public showUseProductMenuForItems(items: UseProductItem[]): void
    {
        this.removeUseProductViews();
        this.removeUseProductConfirmationView();
        this.removeBreedMonsterPlantsConfirmationView();

        const userDataManager = this.container?.roomSession.userDataManager ?? null;

        for(const item of items)
        {
            const userData = userDataManager?.getUserDataByIndex(item.id) ?? null;

            if(userData) this.showUseProductMenu(userData, item);
        }
    }

    // AS3: AvatarInfoWidget.as::showBreedPetMenuForItems()
    public showBreedPetMenuForItems(items: UseProductItem[]): void
    {
        this.removeBreedPetViews();
        this.removeUseProductConfirmationView();
        this.removeBreedMonsterPlantsConfirmationView();

        const userDataManager = this.container?.roomSession.userDataManager ?? null;

        for(const item of items)
        {
            const userData = userDataManager?.getUserDataByIndex(item.id) ?? null;

            if(userData) this.showBreedPetMenu(userData, item);
        }
    }

    // AS3: AvatarInfoWidget.as::showUseProductMenu()
    private showUseProductMenu(userData: IUserData, item: UseProductItem): void
    {
        const key = userData.webID.toString();

        if(this._useProductBubbles.has(key)) return;

        const view = new UseProductView(this);

        UseProductView.setup(view, userData.webID, userData.name, -1, USER_TYPE_PET, item);
        this._useProductBubbles.set(key, view);
        this.checkUpdateNeed();
    }

    // AS3: AvatarInfoWidget.as::showBreedPetMenu()
    private showBreedPetMenu(userData: IUserData, item: UseProductItem): void
    {
        const key = userData.webID.toString();

        if(this._breedPetBubbles.has(key)) return;

        const view = new BreedPetView(this);

        BreedPetView.setup(view, userData.webID, userData.name, -1, USER_TYPE_PET, item, userData.canBreed);
        this._breedPetBubbles.set(key, view);
        this.checkUpdateNeed();
    }

    // AS3: AvatarInfoWidget.as::removeUseProductViews()
    public removeUseProductViews(): void
    {
        for(const view of this._useProductBubbles.values()) view.dispose();

        this._useProductBubbles.clear();
        this.checkUpdateNeed();
    }

    // AS3: AvatarInfoWidget.as::removeBreedPetViews()
    public removeBreedPetViews(): void
    {
        for(const view of this._breedPetBubbles.values()) view.dispose();

        this._breedPetBubbles.clear();
        this.checkUpdateNeed();
    }

    // AS3: AvatarInfoWidget.as::removeBreedPetViewsWithId()
    // Both the bubble's own pet and the pet that raised the round are matched, so a status
    // change on either end clears the offer.
    private removeBreedPetViewsWithId(objectId: number): void
    {
        const doomed: BreedPetView[] = [];

        for(const view of this._breedPetBubbles.values())
        {
            if(view.objectId === objectId || view.requestRoomObjectId === objectId) doomed.push(view);
        }

        for(const view of doomed) this.removeView(view, false);
    }

    // --- breeding ---

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWPPBE_PET_BREEDING_ case)
    private onPetBreeding = (event: RoomWidgetPetBreedingEvent): void =>
    {
        const requestObjectId = this.findPetRoomObjectIdByWebId(event.ownPetId);
        const targetObjectId = this.findPetRoomObjectIdByWebId(event.otherPetId);

        switch(event.state)
        {
            case RoomWidgetPetBreedingEvent.TYPE_START:
                this.showBreedMonsterPlantsConfirmationView(requestObjectId, targetObjectId, false);
                break;
            case RoomWidgetPetBreedingEvent.TYPE_CANCEL:
                this.cancelBreedingPets(requestObjectId, targetObjectId);
                break;
            case RoomWidgetPetBreedingEvent.TYPE_ACCEPT:
                this.acceptBreedingPets(requestObjectId, targetObjectId);
                break;
            case RoomWidgetPetBreedingEvent.TYPE_REQUEST:
                this.showBreedMonsterPlantsConfirmationView(requestObjectId, targetObjectId, true);
                break;
        }

        this.checkUpdateNeed();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWPBRE_PET_BREEDING_RESULT case)
    private onPetBreedingResult = (event: RoomWidgetPetBreedingResultEvent): void =>
    {
        const first = new BreedPetsResultData();

        first.stuffId = event.resultData.stuffId;
        first.classId = event.resultData.classId;
        first.productCode = event.resultData.productCode;
        first.userId = event.resultData.userId;
        first.userName = event.resultData.userName;
        first.rarityLevel = event.resultData.rarityLevel;
        first.hasMutation = event.resultData.hasMutation;

        const second = new BreedPetsResultData();

        second.stuffId = event.resultData2.stuffId;
        second.classId = event.resultData2.classId;
        second.productCode = event.resultData2.productCode;
        second.userId = event.resultData2.userId;
        second.userName = event.resultData2.userName;
        second.rarityLevel = event.resultData2.rarityLevel;
        second.hasMutation = event.resultData2.hasMutation;

        this.showBreedPetsResultView(first, second);
        this.checkUpdateNeed();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWPPBE_CONFIRM_PET_BREEDING_ case)
    private onConfirmPetBreeding = (event: RoomWidgetConfirmPetBreedingEvent): void =>
    {
        this.showConfirmPetBreedingView(event.pet1, event.pet2, event.nestId, event.rarityCategories, event.resultPetTypeId);
        this.checkUpdateNeed();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWPPBE_CONFIRM_PET_BREEDING_RESULT case)
    private onConfirmPetBreedingResult = (event: RoomWidgetConfirmPetBreedingResultEvent): void =>
    {
        switch(event.result)
        {
            case RoomWidgetConfirmPetBreedingResultEvent.SUCCESS:
                this.removeConfirmPetBreedingView();
                break;
            case RoomWidgetConfirmPetBreedingResultEvent.NO_NEST_FOUND:
                this.windowManager.simpleAlert(
                    '${breedpets.confirmation.alert.title}',
                    '${breedpets.confirmation.alert.nonest.head}',
                    '${breedpets.confirmation.alert.nonest.desc}'
                );
                this.removeConfirmPetBreedingView();
                break;
            case RoomWidgetConfirmPetBreedingResultEvent.PETS_MISSING:
                this.windowManager.simpleAlert(
                    '${breedpets.confirmation.alert.title}',
                    '${breedpets.confirmation.alert.petsmissing.head}',
                    '${breedpets.confirmation.alert.petsmissing.desc}'
                );
                this.removeConfirmPetBreedingView();
                break;
            case RoomWidgetConfirmPetBreedingResultEvent.INVALID_NAME:
                // The dialog stays up so the name can be corrected.
                this.windowManager.simpleAlert(
                    '${breedpets.confirmation.alert.title}',
                    '${breedpets.confirmation.alert.name.invalid.head}',
                    '${breedpets.confirmation.alert.name.invalid.desc}'
                );
                this._confirmPetBreedingView?.enable();
                break;
        }

        this.checkUpdateNeed();
    };

    // AS3: AvatarInfoWidget.as::updateEventHandler() (RWROUE_FURNI_ADDED case)
    // The result dialog's place/pick pair depends on where the seed currently is.
    private onFurniAdded = (event: RoomWidgetRoomObjectUpdateEvent): void =>
    {
        if(event.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
        {
            this._breedPetsResultView?.roomObjectAdded(event.id);
        }
    };

    // AS3: AvatarInfoWidget.as::findPetRoomObjectIdByWebId()
    private findPetRoomObjectIdByWebId(webId: number): number
    {
        const container = this.container;

        if(!container?.roomEngine) return -1;

        const roomId = container.roomSession.roomId;
        const count = container.roomEngine.getRoomObjectCount(roomId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

        for(let i = 0; i < count; i++)
        {
            const object = container.roomEngine.getRoomObjectWithIndex(roomId, i, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

            if(!object) continue;

            const userData = container.roomSession.userDataManager.getUserDataByIndex(object.getId());

            if(userData && userData.type === USER_TYPE_PET && userData.webID === webId) return object.getId();
        }

        return -1;
    }

    // AS3: AvatarInfoWidget.as::showUseProductConfirmation()
    public showUseProductConfirmation(objectId: number, targetRoomObjectId: number, inventoryStripId: number): void
    {
        if(!this._useProductConfirmationView)
        {
            this._useProductConfirmationView = new UseProductConfirmationView(this);
        }

        this._useProductConfirmationView.open(objectId, targetRoomObjectId, inventoryStripId);
    }

    // AS3: AvatarInfoWidget.as::removeUseProductConfirmationView()
    private removeUseProductConfirmationView(): void
    {
        this._useProductConfirmationView?.dispose();
        this._useProductConfirmationView = null;
    }

    // AS3: AvatarInfoWidget.as::showBreedingPetsWaitingConfirmationAlert()
    public showBreedingPetsWaitingConfirmationAlert(requestObjectId: number, targetObjectId: number): void
    {
        this.removeBreedingPetsWaitingConfirmationAlert();

        this._breedingConfirmationAlert = this.windowManager.confirm(
            '${breedpets.confirmation.notification.title}',
            '${breedpets.confirmation.notification.text}',
            0,
            this.onWaitingConfirmationAlert
        );

        this._breedingAlertRequestObjectId = requestObjectId;
        this._breedingAlertTargetObjectId = targetObjectId;
    }

    // AS3: AvatarInfoWidget.as::onWaitingConfirmationAlert()
    // Cancelling the wait cancels the breeding request itself; WE_OK just closes the alert.
    public onWaitingConfirmationAlert = (_dialog: IDisposable, event: WindowEvent): void =>
    {
        if(event.type === 'WE_CANCEL' && this._breedingAlertTargetObjectId !== -1)
        {
            this.cancelBreedPets(this._breedingAlertRequestObjectId, this._breedingAlertTargetObjectId);
        }

        this.removeBreedingPetsWaitingConfirmationAlert();
    };

    // AS3: AvatarInfoWidget.as::removeBreedingPetsWaitingConfirmationAlert()
    private removeBreedingPetsWaitingConfirmationAlert(): void
    {
        if(this._breedingConfirmationAlert)
        {
            this._breedingConfirmationAlert.dispose();
            this._breedingConfirmationAlert = null;
            this._breedingAlertRequestObjectId = -1;
            this._breedingAlertTargetObjectId = -1;
        }
    }

    // AS3: AvatarInfoWidget.as::acceptBreedingPets()
    public acceptBreedingPets(requestObjectId: number, targetObjectId: number): void
    {
        if(this._breedMonsterPlantsConfirmationView
            && this._breedMonsterPlantsConfirmationView.requestRoomObjectId === requestObjectId
            && this._breedMonsterPlantsConfirmationView.targetRoomObjectId === targetObjectId)
        {
            this.removeBreedMonsterPlantsConfirmationView();
        }

        this._breedingConfirmationAlert?.dispose();
    }

    // AS3: AvatarInfoWidget.as::cancelBreedingPets()
    public cancelBreedingPets(requestObjectId: number, targetObjectId: number): void
    {
        if(this._breedMonsterPlantsConfirmationView
            && this._breedMonsterPlantsConfirmationView.requestRoomObjectId === requestObjectId
            && this._breedMonsterPlantsConfirmationView.targetRoomObjectId === targetObjectId)
        {
            this.removeBreedMonsterPlantsConfirmationView();
        }

        this.removeBreedingPetsWaitingConfirmationAlert();
        this.windowManager.alert(
            '${breedpets.cancel.notification.title}',
            '${breedpets.cancel.notification.text}',
            0,
            this.onBreedingAlert
        );
    }

    // AS3: AvatarInfoWidget.as::onBreedingAlert()
    public onBreedingAlert = (dialog: IDisposable, event: WindowEvent): void =>
    {
        if(event.type === 'WE_OK' || event.type === 'WE_CANCEL') dialog.dispose();
    };

    // AS3: AvatarInfoWidget.as::showBreedMonsterPlantsConfirmationView()
    public showBreedMonsterPlantsConfirmationView(requestObjectId: number, targetObjectId: number, requested: boolean): void
    {
        if(!this._breedMonsterPlantsConfirmationView)
        {
            this._breedMonsterPlantsConfirmationView = new BreedMonsterPlantsConfirmationView(this);
        }

        this._breedMonsterPlantsConfirmationView.open(requestObjectId, targetObjectId, requested);
    }

    // AS3: AvatarInfoWidget.as::showConfirmPetBreedingView()
    public showConfirmPetBreedingView(
        pet1: ConfirmPetBreedingPetData,
        pet2: ConfirmPetBreedingPetData,
        nestId: number,
        rarityCategories: BreedingRarityCategoryData[],
        resultPetTypeId: number
    ): void
    {
        if(!this._confirmPetBreedingView)
        {
            this._confirmPetBreedingView = new ConfirmPetBreedingView(this);
        }

        const requestObjectId = this.findPetRoomObjectIdByWebId(pet1.webId);
        const targetObjectId = this.findPetRoomObjectIdByWebId(pet2.webId);

        this._confirmPetBreedingView.open(
            requestObjectId, targetObjectId, nestId, rarityCategories, resultPetTypeId, pet1.level, pet2.level
        );
    }

    // AS3: AvatarInfoWidget.as::removeBreedMonsterPlantsConfirmationView()
    private removeBreedMonsterPlantsConfirmationView(): void
    {
        this._breedMonsterPlantsConfirmationView?.dispose();
        this._breedMonsterPlantsConfirmationView = null;
    }

    // AS3: AvatarInfoWidget.as::removeConfirmPetBreedingView()
    private removeConfirmPetBreedingView(): void
    {
        this._confirmPetBreedingView?.dispose();
        this._confirmPetBreedingView = null;
    }

    // AS3: AvatarInfoWidget.as::showBreedPetsResultView()
    public showBreedPetsResultView(first: BreedPetsResultData, second: BreedPetsResultData): void
    {
        if(!this._breedPetsResultView)
        {
            this._breedPetsResultView = new BreedPetsResultView(this);
        }

        this._breedPetsResultView.open(first, second);
    }

    // AS3: AvatarInfoWidget.as::removeBreedPetsResultView()
    public removeBreedPetsResultView(view: BreedPetsResultView | null): void
    {
        if(!view) return;

        if(view === this._breedPetsResultView)
        {
            this._breedPetsResultView.dispose();
            this._breedPetsResultView = null;
        }
        else
        {
            view.dispose();
        }
    }

    // AS3: AvatarInfoWidget.as::showNestBreedingSuccess()
    public showNestBreedingSuccess(petId: number, rarityCategory: number): void
    {
        if(!this._nestBreedingSuccessView)
        {
            this._nestBreedingSuccessView = new NestBreedingSuccessView(this);
        }

        this._nestBreedingSuccessView.open(this.findPetRoomObjectIdByWebId(petId), rarityCategory);
    }

    // AS3: AvatarInfoWidget.as::breedPets()
    // The three monsterplant negotiation steps are the same composer with a different state.
    public breedPets(requestObjectId: number, targetObjectId: number): void
    {
        this.sendBreedPets(BreedPetsMessageComposer.STATE_REQUEST, requestObjectId, targetObjectId);
    }

    // AS3: AvatarInfoWidget.as::cancelBreedPets()
    public cancelBreedPets(requestObjectId: number, targetObjectId: number): void
    {
        this.sendBreedPets(BreedPetsMessageComposer.STATE_CANCEL, requestObjectId, targetObjectId);
    }

    // AS3: AvatarInfoWidget.as::acceptBreedPets()
    public acceptBreedPets(requestObjectId: number, targetObjectId: number): void
    {
        this.sendBreedPets(BreedPetsMessageComposer.STATE_ACCEPT, requestObjectId, targetObjectId);
    }

    // AS3: AvatarInfoWidget.as::breedPets()/cancelBreedPets()/acceptBreedPets() — the shared body.
    // The views address the plants by room index; the wire wants their webIDs.
    private sendBreedPets(state: number, requestObjectId: number, targetObjectId: number): void
    {
        const container = this.container;
        const userDataManager = container?.roomSession.userDataManager ?? null;
        const first = userDataManager?.getUserDataByIndex(requestObjectId) ?? null;
        const second = userDataManager?.getUserDataByIndex(targetObjectId) ?? null;

        if(first && second)
        {
            container?.connection?.send(new BreedPetsMessageComposer(state, first.webID, second.webID));
        }
    }

    // AS3: AvatarInfoWidget.as::cancelPetBreeding()
    public cancelPetBreeding(nestId: number): void
    {
        this.container?.connection?.send(new CancelPetBreedingComposer(nestId));
    }

    // AS3: AvatarInfoWidget.as::confirmPetBreeding()
    public confirmPetBreeding(nestId: number, name: string, petId1: number, petId2: number): void
    {
        this.container?.connection?.send(new ConfirmPetBreedingComposer(nestId, name, petId1, petId2));
    }

    // --- per-frame positioning ---

    // AS3: AvatarInfoWidget.as::checkUpdateNeed()
    private checkUpdateNeed(): void
    {
        const needed = this._activeView !== null || this._useProductBubbles.size > 0 || this._breedPetBubbles.size > 0;

        if(needed && !this._updateRegistered)
        {
            this.windowManager.registerUpdateReceiver(this, 10);
            this._updateRegistered = true;
        }
        else if(!needed && this._updateRegistered)
        {
            this.windowManager.removeUpdateReceiver(this);
            this._updateRegistered = false;
        }
    }

    // AS3: AvatarInfoWidget.as::update() (IUpdateReceiver)
    public update(deltaTime: number): void
    {
        if(this._activeView) this.positionView(this._activeView, deltaTime);

        for(const view of this._useProductBubbles.values()) this.positionView(view, deltaTime);
        for(const view of this._breedPetBubbles.values()) this.positionView(view, deltaTime);
    }

    // AS3: AvatarInfoWidget.as::update() — the per-view body of the four loops.
    // AS3 asks the room engine for the view's object through RWGOI_MESSAGE_GET_OBJECT_LOCATION
    // with the view's own userId/userType; this port reads the bounding rectangle directly, which
    // needs the room index. The menu bubbles carry it; the use-product/breed bubbles are set up
    // with -1 (they only know the pet's webID), so it is resolved here.
    //
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/AvatarInfoWidget.as::update()
    // — route this through `ObjectLocationRequestHandler`, which is now ported and registered for
    // both RWGOI_ message types. It is deliberately *not* done in the same change as the handler:
    // AS3 takes `screenLocation` from `getRoomObjectScreenLocation()`, which projects the object's
    // own location (an avatar's feet), while the block below computes
    // `(left + width/2, bottom)` off the bounding box. Those are near but not equal, so swapping
    // the source would move every bubble — it needs its own before/after check rather than being
    // folded into a handler port.
    private positionView(view: AvatarContextInfoButtonView, deltaTime: number): void
    {
        const container = this.container;

        if(!container?.roomEngine) return;

        let roomIndex = view.roomIndex;

        if(roomIndex < 0)
        {
            const userData = container.roomSession.userDataManager.getUserDataByType(view.userId, view.userType);

            if(!userData) return;

            roomIndex = userData.roomObjectId;
        }

        const roomId = container.roomSession.roomId;
        const canvasId = container.getFirstCanvasId();
        const rect = container.roomEngine.getRoomObjectBoundingRectangle(roomId, roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER, canvasId);

        if(!rect) return;

        const viewRect = container.getRoomViewRect();
        const offsetX = viewRect?.x ?? 0;
        const offsetY = viewRect?.y ?? 0;

        const screenRect = {
            left: rect.left + offsetX,
            top: rect.top + offsetY,
            right: rect.right + offsetX,
            bottom: rect.bottom + offsetY,
            width: rect.width,
            height: rect.height,
        };

        const screenLocation = {
            x: screenRect.left + screenRect.width / 2,
            y: screenRect.bottom,
        };

        view.update(screenRect, screenLocation, deltaTime);
    }

    // --- state getters read by OwnAvatarMenuView ---

    // AS3: AvatarInfoWidget.as::get/set isDancing()
    public get isDancing(): boolean
    {
        return this._isDancing;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/AvatarInfoWidget.as::set isDancing()
    public set isDancing(value: boolean)
    {
        this._isDancing = value;
    }

    // AS3: AvatarInfoWidget.as::get hasClub()
    public get hasClub(): boolean
    {
        return this.container?.sessionDataManager?.hasClub ?? false;
    }

    // AS3: AvatarInfoWidget.as::get hasVip()
    public get hasVip(): boolean
    {
        return this.container?.sessionDataManager?.hasVip ?? false;
    }

    // AS3: AvatarInfoWidget.as::get hasEffectOn()
    public get hasEffectOn(): boolean
    {
        const effects = this.container?.inventory?.getActivatedAvatarEffects() ?? [];

        return effects.some(e => e.isInUse);
    }

    // AS3: AvatarInfoWidget.as::get ownAvatarPosture()
    public get ownAvatarPosture(): string
    {
        return this.getOwnModelString('figure_posture', 'std');
    }

    // AS3: AvatarInfoWidget.as::get canStandUp()
    public get canStandUp(): boolean
    {
        return this.getOwnModelNumber('figure_can_stand_up') > 0;
    }

    // AS3: AvatarInfoWidget.as::get isSwimming()
    public get isSwimming(): boolean
    {
        return SWIM_EFFECTS.indexOf(this.getOwnModelNumber('figure_effect')) !== -1;
    }

    // AS3: AvatarInfoWidget.as::get isCurrentUserRiding()
    public get isCurrentUserRiding(): boolean
    {
        return this.getOwnModelNumber('figure_effect') === RIDE_EFFECT;
    }

    // AS3: AvatarInfoWidget.as::get hasFreeSaddle()
    public get hasFreeSaddle(): boolean
    {
        return this._petData.hasFreeSaddle;
    }

    // AS3: AvatarInfoWidget.as::get isRiding()
    public get isRiding(): boolean
    {
        return this._petData.isRiding;
    }

    // AS3: AvatarInfoWidget.as::isMonsterPlant()
    public isMonsterPlant(): boolean
    {
        return this._petData.petType === PET_TYPE_MONSTERPLANT;
    }

    // AS3: AvatarInfoWidget.as::openTrainingView()
    // The pet-training window belongs to the infostand widget, which listens for this on the
    // shared desktop bus.
    public openTrainingView(): void
    {
        this.container?.desktopEvents.emit('RWPCUE_OPEN_PET_TRAINING', new RoomWidgetUpdateEvent('RWPCUE_OPEN_PET_TRAINING'));
    }

    // AS3: AvatarInfoWidget.as::closeTrainingView()
    public closeTrainingView(): void
    {
        this.container?.desktopEvents.emit('RWPCUE_CLOSE_PET_TRAINING', new RoomWidgetUpdateEvent('RWPCUE_CLOSE_PET_TRAINING'));
    }

    // AS3: AvatarInfoWidget.as::get/set useMinimizedOwnAvatarMenu()
    public get useMinimizedOwnAvatarMenu(): boolean
    {
        return this.container?.config?.getBoolean('use_minimized_own_avatar_menu') ?? false;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/AvatarInfoWidget.as::set useMinimizedOwnAvatarMenu()
    public set useMinimizedOwnAvatarMenu(value: boolean)
    {
        this.container?.config?.setProperty('use_minimized_own_avatar_menu', value ? '1' : '0');
    }

    // --- action helpers ---

    // AS3: AvatarInfoWidget.as::sendSignRequest()
    public sendSignRequest(id: number): void
    {
        this.container?.roomSession.sendSignMessage(id);
    }

    // AS3: AvatarInfoWidget.as::openAvatarEditor()
    // TODO(AS3): avatarEditor.openEditor(...) — the avatar editor isn't ported;
    // route through the link-event system when available.
    public openAvatarEditor(): void
    {
    }

    // AS3: AvatarInfoWidget.as::set isUserDecorating()
    // TODO(AS3): DecorateModeView deferred in this slice.
    public set isUserDecorating(_value: boolean)
    {
    }

    // --- helpers ---

    private getOwnModelString(key: string, fallback: string): string
    {
        const model = this.getOwnModel();

        return model?.getString(key) ?? fallback;
    }

    private getOwnModelNumber(key: string): number
    {
        const model = this.getOwnModel();

        return model?.getNumber(key) ?? 0;
    }

    private getOwnModel(): { getString(key: string): string; getNumber(key: string): number } | null
    {
        const container = this.container;

        if(!container || !container.roomEngine || this._ownRoomIndex < 0) return null;

        const roomId = container.roomSession.roomId;
        const object = container.roomEngine.getRoomObject(roomId, this._ownRoomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) ?? null;

        return object?.getModel() ?? null;
    }

    // AS3: AvatarInfoWidget.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        this.container?.desktopEvents.off(RoomWidgetUserInfoUpdateEvent.OWN_USER, this.onUserInfoUpdate);
        this.container?.desktopEvents.off(RoomWidgetRoomObjectUpdateEvent.OBJECT_DESELECTED, this.onObjectDeselected);
        this.container?.desktopEvents.off(RoomWidgetRoomObjectUpdateEvent.OBJECT_SELECTED, this.onObjectSelected);
        this.container?.desktopEvents.off(RoomWidgetPetInfoUpdateEvent.PET_INFO, this.onPetInfoUpdate);
        this.container?.desktopEvents.off(RoomWidgetPetStatusUpdateEvent.PET_STATUS_UPDATE, this.onPetStatusUpdate);
        this.container?.desktopEvents.off(RoomWidgetPetLevelUpdateEvent.PET_LEVEL_UPDATE, this.onPetLevelUpdate);
        this.container?.desktopEvents.off(RoomWidgetPetBreedingEvent.PET_BREEDING, this.onPetBreeding);
        this.container?.desktopEvents.off(RoomWidgetPetBreedingResultEvent.PET_BREEDING_RESULT, this.onPetBreedingResult);
        this.container?.desktopEvents.off(RoomWidgetConfirmPetBreedingEvent.CONFIRM_PET_BREEDING, this.onConfirmPetBreeding);
        this.container?.desktopEvents.off(RoomWidgetConfirmPetBreedingResultEvent.CONFIRM_PET_BREEDING_RESULT, this.onConfirmPetBreedingResult);
        this.container?.desktopEvents.off(RoomWidgetRoomObjectUpdateEvent.FURNI_ADDED, this.onFurniAdded);
        this.container?.inventory?.events.off(HabboInventoryEffectsEvent.HIEE_EFFECTS_CHANGED, this.onEffectsChanged);

        if(this._updateRegistered)
        {
            this.windowManager.removeUpdateReceiver(this);
            this._updateRegistered = false;
        }

        this._cachedOwnMenu?.dispose();
        this._cachedOwnMenu = null;
        this._cachedOwnPetMenu?.dispose();
        this._cachedOwnPetMenu = null;
        this._cachedPetMenu?.dispose();
        this._cachedPetMenu = null;
        this._buttonsSetup = null;
        this._activeView = null;

        this.removeUseProductViews();
        this.removeBreedPetViews();
        this.removeUseProductConfirmationView();
        this.removeBreedMonsterPlantsConfirmationView();
        this.removeConfirmPetBreedingView();
        this.removeBreedingPetsWaitingConfirmationAlert();
        this._breedPetsResultView?.dispose();
        this._breedPetsResultView = null;
        this._nestBreedingSuccessView?.dispose();
        this._nestBreedingSuccessView = null;

        super.dispose();
    }
}
