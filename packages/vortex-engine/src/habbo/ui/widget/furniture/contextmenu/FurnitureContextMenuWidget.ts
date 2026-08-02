/**
 * FurnitureContextMenuWidget — one widget behind every furniture context bubble and dialog.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/contextmenu/FurnitureContextMenuWidget.as
 *
 * AS3 keeps one instance of each sub-view alive for the whole room and swaps which one is the
 * "active view", so only one bubble can be on screen at a time. `_activeView` is that slot; the
 * per-frame `update()` is registered only while something occupies it.
 *
 * This port carries the mystery-box and mystery-trophy views. The guild, random-teleport,
 * monsterplant-seed, friend-furni, generic-usable, purchasable-clothing and effect-box views are
 * TODO(AS3) stubs — none of them is ported, and the room engine does not raise their requests yet.
 */
import {Logger} from '@core/utils/Logger';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {FurnitureContextMenuWidgetHandler} from '@habbo/ui/handler/FurnitureContextMenuWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {ContextInfoView} from '@habbo/ui/widget/contextmenu/ContextInfoView';
import type {IContextMenuParentWidget} from '@habbo/ui/widget/contextmenu/IContextMenuParentWidget';
import {FriendFurniContextMenuView} from '@habbo/ui/widget/furniture/friendfurni/FriendFurniContextMenuView';
import {MysteryBoxContextMenuView} from '@habbo/ui/widget/furniture/mysterybox/MysteryBoxContextMenuView';
import {MysteryBoxOpenDialogView} from '@habbo/ui/widget/furniture/mysterybox/MysteryBoxOpenDialogView';
import {MysteryTrophyOpenDialogView} from '@habbo/ui/widget/furniture/mysterytrophy/MysteryTrophyOpenDialogView';
import {FurnitureContextInfoView} from './FurnitureContextInfoView';

const log = Logger.getLogger('habbo.ui.widget.furniture.contextmenu.FurnitureContextMenuWidget');

// AS3: FurnitureContextMenuWidget.as::showMysteryBoxContextMenu() etc. — the update priority.
const UPDATE_RECEIVER_PRIORITY: number = 10;

export class FurnitureContextMenuWidget extends RoomWidgetBase implements IContextMenuParentWidget, IUpdateReceiver
{
    // AS3: FurnitureContextMenuWidget.as::_SafeStr_4550 (the active view)
    private _activeView: FurnitureContextInfoView | null = null;

    // AS3: FurnitureContextMenuWidget.as::_selectedObject
    private _selectedObject: IRoomObject | null = null;

    // AS3: FurnitureContextMenuWidget.as::_SafeStr_5601
    private _mysteryBoxContextMenuView: MysteryBoxContextMenuView | null = null;

    // AS3: FurnitureContextMenuWidget.as::_SafeStr_5807
    private _friendFurniContextMenuView: FriendFurniContextMenuView | null = null;

    // AS3: FurnitureContextMenuWidget.as::_SafeStr_6960
    private _mysteryBoxOpenDialogView: MysteryBoxOpenDialogView | null = null;

    // AS3: FurnitureContextMenuWidget.as::_SafeStr_5901
    private _mysteryTrophyOpenDialogView: MysteryTrophyOpenDialogView | null = null;

    // AS3: FurnitureContextMenuWidget.as::_catalog
    private _catalog: IHabboCatalog | null;

    /**
     * AS3 registers on the component that owns the update loop (`_SafeCls_50`, the room UI). This
     * port drives per-frame widget updates off the window manager, same as AvatarInfoWidget.
     */
    private _updateRegistered: boolean = false;

    // AS3: FurnitureContextMenuWidget.as::FurnitureContextMenuWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        catalog: IHabboCatalog | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._catalog = catalog;

        this._mysteryBoxContextMenuView = new MysteryBoxContextMenuView(this);
        this._friendFurniContextMenuView = new FriendFurniContextMenuView(this);
        this._mysteryBoxOpenDialogView = new MysteryBoxOpenDialogView(this);
        this._mysteryTrophyOpenDialogView = new MysteryTrophyOpenDialogView(this);

        // TODO(AS3): FurnitureContextMenuWidget.as::FurnitureContextMenuWidget() also builds
        // GuildFurnitureContextMenuView, RandomTeleportContextMenuView,
        // MonsterPlantSeedContextMenuView, MonsterPlantSeedConfirmationView,
        // GenericUsableFurnitureContextMenuView, EffectBoxOpenDialogView and
        // PurchasableClothingConfirmationView. None of those is ported.

        this.handler.widget = this;

        this.handler.roomEngine?.events.on(RoomEngineObjectEvent.REOE_REMOVED, this.onRoomObjectRemoved, this);
    }

    // AS3: FurnitureContextMenuWidget.as::get handler()
    public get handler(): FurnitureContextMenuWidgetHandler
    {
        return this.widgetHandler as FurnitureContextMenuWidgetHandler;
    }

    // AS3: FurnitureContextMenuWidget.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this.handler?.container ?? null;
    }

    // AS3: FurnitureContextMenuWidget.as::get roomEngine()
    public get roomEngine(): IRoomEngine | null
    {
        return this.container?.roomEngine ?? null;
    }

    // AS3: FurnitureContextMenuWidget.as::get catalog()
    public get catalog(): IHabboCatalog | null
    {
        return this._catalog;
    }

    /**
     * AS3 returns null outright — the furniture menus never need the friend list, but the
     * interface they share with the avatar menu declares it.
     */
    // AS3: FurnitureContextMenuWidget.as::get friendList()
    public get friendList(): IHabboFriendList | null
    {
        return null;
    }

    // AS3: FurnitureContextMenuWidget.as::hideContextMenu()
    public hideContextMenu(object: IRoomObject): void
    {
        if(this._selectedObject !== null && this._selectedObject.getId() === object.getId())
        {
            this.removeView(this._activeView, false);
            this.removeUpdateReceiver();
            this._selectedObject = null;
        }
    }

    /**
     * The caption flips between "Open box" and "Use key" on ownership, which is also what decides
     * which half of the flow the click starts.
     */
    // AS3: FurnitureContextMenuWidget.as::showMysteryBoxContextMenu()
    public showMysteryBoxContextMenu(object: IRoomObject): void
    {
        this._selectedObject = object;

        if(this._activeView !== null) this.removeView(this._activeView, false);

        if(this._mysteryBoxContextMenuView === null)
        {
            this._mysteryBoxContextMenuView = new MysteryBoxContextMenuView(this);
        }

        this._mysteryBoxContextMenuView.isOwnerMode = this.container?.isOwnerOfFurniture(object) ?? false;
        this._mysteryBoxContextMenuView.show();

        this._activeView = this._mysteryBoxContextMenuView;

        FurnitureContextInfoView.setup(this._activeView, object);

        this.registerUpdateReceiver();
    }

    // AS3: FurnitureContextMenuWidget.as::showFriendFurnitureContextMenu()
    public showFriendFurnitureContextMenu(object: IRoomObject): void
    {
        this._selectedObject = object;

        if(this._activeView !== null) this.removeView(this._activeView, false);

        if(this._friendFurniContextMenuView === null)
        {
            this._friendFurniContextMenuView = new FriendFurniContextMenuView(this);
        }

        this._friendFurniContextMenuView.show();

        this._activeView = this._friendFurniContextMenuView;

        FurnitureContextInfoView.setup(this._activeView, object);

        this.registerUpdateReceiver();
    }

    /**
     * Not a bubble — this one goes straight out on the wire and waits for the server to say which
     * dialog to show, so the context menu is dismissed first and nothing takes its place.
     */
    // AS3: FurnitureContextMenuWidget.as::showMysteryBoxOpenDialog()
    public showMysteryBoxOpenDialog(object: IRoomObject): void
    {
        this._selectedObject = object;

        if(this._activeView !== null) this.removeView(this._activeView, false);

        this._mysteryBoxOpenDialogView?.startOpenFlow(object);
    }

    // AS3: FurnitureContextMenuWidget.as::showMysteryTrophyOpenDialog()
    public showMysteryTrophyOpenDialog(object: IRoomObject): void
    {
        this._selectedObject = object;

        if(this._activeView !== null) this.removeView(this._activeView, false);

        if(this._mysteryTrophyOpenDialogView === null)
        {
            this._mysteryTrophyOpenDialogView = new MysteryTrophyOpenDialogView(this);
        }

        this._mysteryTrophyOpenDialogView.open(object.getId());
    }

    // AS3: FurnitureContextMenuWidget.as::removeView()
    public removeView(view: ContextInfoView | null, animate: boolean): void
    {
        if(!view) return;

        view.hide(animate);

        if(view === this._activeView)
        {
            this._activeView = null;
        }
    }

    /**
     * AS3 registers this widget as an update receiver only while a view is up, and the view does
     * the actual positioning from the object's on-screen rectangle.
     */
    // AS3: FurnitureContextMenuWidget.as::update()
    public update(time: number): void
    {
        if(this._activeView === null || this._selectedObject === null) return;

        const objectId = this._selectedObject.getId();
        const screenLocation = this.handler.getObjectScreenLocation(objectId);

        if(screenLocation === null) return;

        this._activeView.update(this.handler.getObjectRectangle(objectId), screenLocation, time);
    }

    // AS3: FurnitureContextMenuWidget.as::onRoomObjectRemoved()
    private onRoomObjectRemoved(event: RoomEngineObjectEvent): void
    {
        if(event.category !== RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) return;

        if(this._selectedObject !== null && this._selectedObject.getId() === event.objectId)
        {
            this.removeView(this._activeView, false);

            // TODO(AS3): AS3 also calls removePlantSeedConfirmationView() here — the monsterplant
            // confirmation view is not ported.

            this.removeUpdateReceiver();
            this._selectedObject = null;
        }
    }

    private registerUpdateReceiver(): void
    {
        if(this._updateRegistered) return;

        this.windowManager.registerUpdateReceiver(this, UPDATE_RECEIVER_PRIORITY);
        this._updateRegistered = true;
    }

    private removeUpdateReceiver(): void
    {
        if(!this._updateRegistered) return;

        this.windowManager.removeUpdateReceiver(this);
        this._updateRegistered = false;
    }

    // AS3: FurnitureContextMenuWidget.as::release()
    public override release(): void
    {
        if(this._selectedObject !== null)
        {
            this.hideContextMenu(this._selectedObject);
        }

        if(this._activeView !== null)
        {
            this.removeView(this._activeView, false);
        }

        super.release();
    }

    // AS3: FurnitureContextMenuWidget.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        this.handler?.roomEngine?.events.off(RoomEngineObjectEvent.REOE_REMOVED, this.onRoomObjectRemoved, this);

        this.removeUpdateReceiver();
        this.removeView(this._activeView, false);

        if(this._mysteryBoxContextMenuView !== null)
        {
            this._mysteryBoxContextMenuView.dispose();
            this._mysteryBoxContextMenuView = null;
        }

        if(this._mysteryBoxOpenDialogView !== null)
        {
            this._mysteryBoxOpenDialogView.dispose();
            this._mysteryBoxOpenDialogView = null;
        }

        if(this._mysteryTrophyOpenDialogView !== null)
        {
            this._mysteryTrophyOpenDialogView.dispose();
            this._mysteryTrophyOpenDialogView = null;
        }

        this._catalog = null;
        this._selectedObject = null;

        log.debug('Furniture context menu widget disposed');

        super.dispose();
    }
}
