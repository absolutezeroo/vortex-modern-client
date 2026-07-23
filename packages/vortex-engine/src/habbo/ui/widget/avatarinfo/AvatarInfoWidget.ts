/**
 * AvatarInfoWidget — the RWE_AVATAR_INFO widget, own-avatar slice.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/AvatarInfoWidget.as
 *
 * Owns the own-avatar bubble (OwnAvatarMenuView): opens it on the RWUIUE_OWN_USER
 * info event, repositions it each frame relative to the avatar's on-screen box,
 * and exposes the live avatar state the view reads. Pets/bots/other-avatar menus,
 * decorate mode, breeding and use-product are deferred (TODO(AS3)).
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
import {HabboInventoryEffectsEvent} from '@habbo/inventory/events/HabboInventoryEffectsEvent';
import type {IContextMenuParentWidget} from '../contextmenu/IContextMenuParentWidget';
import type {ContextInfoView} from '../contextmenu/ContextInfoView';
import {AvatarInfoData} from './AvatarInfoData';
import {OwnAvatarMenuView} from './OwnAvatarMenuView';
import type {AvatarInfoWidgetHandler} from '@habbo/ui/handler/AvatarInfoWidgetHandler';

// figure_effect ids that mean "in water" / "riding" (AvatarInfoWidget.as).
const SWIM_EFFECTS: number[] = [29, 30, 185];
const RIDE_EFFECT: number = 77;

export class AvatarInfoWidget extends RoomWidgetBase implements IContextMenuParentWidget, IUpdateReceiver
{
    private _config: IHabboConfigurationManager | null;
    private _catalog: IHabboCatalog | null;
    private _data: AvatarInfoData = new AvatarInfoData();
    private _activeView: OwnAvatarMenuView | null = null;
    private _cachedOwnMenu: OwnAvatarMenuView | null = null;
    private _isDancing: boolean = false;
    private _ownRoomIndex: number = -1;
    private _updateRegistered: boolean = false;

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

    public get friendList(): IHabboFriendList | null
    {
        return this.container?.friendList ?? null;
    }

    // AS3: AvatarInfoWidget.as::removeView()
    public removeView(view: ContextInfoView, animate: boolean): void
    {
        view.hide(animate);

        if(view === this._activeView)
        {
            this._activeView = null;
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
    };

    // AS3: AvatarInfoWidget.as::onEffectsChanged()
    private onEffectsChanged = (): void =>
    {
        if(this._activeView) this._activeView.updateButtons();
    };

    // --- per-frame positioning ---

    // AS3: AvatarInfoWidget.as::checkUpdateNeed()
    private checkUpdateNeed(): void
    {
        if(this._activeView && !this._updateRegistered)
        {
            this.windowManager.registerUpdateReceiver(this, 10);
            this._updateRegistered = true;
        }
        else if(!this._activeView && this._updateRegistered)
        {
            this.windowManager.removeUpdateReceiver(this);
            this._updateRegistered = false;
        }
    }

    // AS3: AvatarInfoWidget.as::update() (IUpdateReceiver)
    public update(deltaTime: number): void
    {
        const container = this.container;

        if(!this._activeView || !container || !container.roomEngine) return;

        const roomId = container.roomSession.roomId;
        const canvasId = container.getFirstCanvasId();
        const rect = container.roomEngine.getRoomObjectBoundingRectangle(roomId, this._ownRoomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER, canvasId);

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

        this._activeView.update(screenRect, screenLocation, deltaTime);
    }

    // --- state getters read by OwnAvatarMenuView ---

    // AS3: AvatarInfoWidget.as::get/set isDancing()
    public get isDancing(): boolean
    {
        return this._isDancing;
    }

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

    // AS3: AvatarInfoWidget.as::get/set useMinimizedOwnAvatarMenu()
    public get useMinimizedOwnAvatarMenu(): boolean
    {
        return this.container?.config?.getBoolean('use_minimized_own_avatar_menu') ?? false;
    }

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
        this.container?.inventory?.events.off(HabboInventoryEffectsEvent.HIEE_EFFECTS_CHANGED, this.onEffectsChanged);

        if(this._updateRegistered)
        {
            this.windowManager.removeUpdateReceiver(this);
            this._updateRegistered = false;
        }

        this._cachedOwnMenu?.dispose();
        this._cachedOwnMenu = null;
        this._activeView = null;

        super.dispose();
    }
}
