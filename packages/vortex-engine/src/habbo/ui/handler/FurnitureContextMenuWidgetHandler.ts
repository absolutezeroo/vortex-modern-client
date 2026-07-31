/**
 * FurnitureContextMenuWidgetHandler — the room-side half of the furniture context-menu widget.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureContextMenuWidgetHandler.as
 *
 * Two responsibilities that look unrelated but are not: it turns room-engine events into calls on
 * the widget's `show*` methods, and it owns the mystery-box toolbar tracker — which lives here
 * rather than in the widget because it must survive with the handler for as long as the room does.
 * `set widget()` is what creates it, so the tracker appears the moment the widget is constructed.
 *
 * Ported for the mystery-box / mystery-trophy flow. The guild-furni, purchasable-clothing and
 * monsterplant paths are carried through as TODO(AS3) stubs — their messages and views are not
 * ported, and the room engine does not emit their requests yet either.
 */
import {Logger} from '@core/utils/Logger';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IRoomObject} from '@room/object/IRoomObject';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {FurnitureContextMenuWidget} from '@habbo/ui/widget/furniture/contextmenu/FurnitureContextMenuWidget';
import {MysteryBoxToolbarExtension} from '@habbo/ui/widget/furniture/mysterybox/MysteryBoxToolbarExtension';

const log = Logger.getLogger('habbo.ui.handler.FurnitureContextMenuWidgetHandler');

/**
 * AS3: FurnitureContextMenuWidgetHandler.as::PENDING_PURCHASABLE_CLOTHING_TIMEOUT_MS
 *
 * Kept even though the clothing flow is a stub — the constant is readable in AS3 and belongs with
 * the fields it guards.
 */
const PENDING_PURCHASABLE_CLOTHING_TIMEOUT_MS: number = 5000;

/**
 * AS3: FurnitureContextMenuWidgetHandler.as::processEvent() — the `contextMenu` names a furniture
 * logic returns from `get contextMenu()`, which is what the widget switches on.
 */
const CONTEXT_MENU_FRIEND_FURNITURE: string = 'FRIEND_FURNITURE';
const CONTEXT_MENU_MONSTERPLANT_SEED: string = 'MONSTERPLANT_SEED';
const CONTEXT_MENU_MYSTERY_BOX: string = 'MYSTERY_BOX';
const CONTEXT_MENU_RANDOM_TELEPORT: string = 'RANDOM_TELEPORT';
const CONTEXT_MENU_PURCHASABLE_CLOTHING: string = 'PURCHASABLE_CLOTHING';

export class FurnitureContextMenuWidgetHandler implements IRoomWidgetHandler
{
    private _disposed: boolean = false;

    // AS3: FurnitureContextMenuWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: FurnitureContextMenuWidgetHandler.as::_SafeStr_4549 (the widget)
    private _widget: FurnitureContextMenuWidget | null = null;

    // AS3: FurnitureContextMenuWidgetHandler.as::_SafeStr_4568 (the connection)
    private _connection: IConnection | null = null;

    // AS3: FurnitureContextMenuWidgetHandler.as::_SafeStr_6714 (the mystery box tracker)
    private _mysteryBoxToolbarExtension: MysteryBoxToolbarExtension | null = null;

    // AS3: FurnitureContextMenuWidgetHandler.as::_pendingPurchasableClothingFurniName
    private _pendingPurchasableClothingFurniName: string | null = null;

    // AS3: FurnitureContextMenuWidgetHandler.as::_SafeStr_7268 (request timestamp, -1 = none)
    private _pendingPurchasableClothingTime: number = -1;

    // AS3: FurnitureContextMenuWidgetHandler.as::FurnitureContextMenuWidgetHandler()
    constructor()
    {
        this._mysteryBoxToolbarExtension = new MysteryBoxToolbarExtension(this);
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::get type()
    public get type(): string
    {
        return '';
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::get roomEngine()
    public get roomEngine(): IRoomEngine | null
    {
        return this._container ? this._container.roomEngine : null;
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::get roomSession()
    public get roomSession(): IRoomSession | null
    {
        return this._container ? this._container.roomSession : null;
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this.unsetContainer();

        this._container = value;

        if(value === null) return;

        const events = value.roomEngine?.events;

        if(!events) return;

        events.on(RoomEngineToWidgetEvent.REQUEST_MYSTERYBOX_OPEN_DIALOG, this.onMysteryBoxOpenDialogRequested, this);
        events.on(RoomEngineToWidgetEvent.REQUEST_MYSTERYTROPHY_OPEN_DIALOG, this.onMysteryTrophyOpenDialogRequested, this);
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::unsetContainer()
    private unsetContainer(): void
    {
        const events = this._container?.roomEngine?.events;

        if(events)
        {
            events.off(RoomEngineToWidgetEvent.REQUEST_MYSTERYBOX_OPEN_DIALOG, this.onMysteryBoxOpenDialogRequested, this);
            events.off(RoomEngineToWidgetEvent.REQUEST_MYSTERYTROPHY_OPEN_DIALOG, this.onMysteryTrophyOpenDialogRequested, this);
        }

        this._container = null;
    }

    /**
     * The widget hands itself over as soon as it is built, and that is the tracker's cue: AS3
     * creates the toolbar window here, gated on the hotel having the feature switched on.
     */
    // AS3: FurnitureContextMenuWidgetHandler.as::set widget()
    public set widget(value: FurnitureContextMenuWidget | null)
    {
        this._widget = value;

        if(this._container?.config?.getBoolean('mysterybox.tracker.active'))
        {
            this._mysteryBoxToolbarExtension?.createWindow();
        }
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::get widget()
    public get widget(): FurnitureContextMenuWidget | null
    {
        return this._widget;
    }

    /**
     * AS3 also registers `GuildFurniContextMenuInfo` and `FigureSetIds` message events here.
     */
    // AS3: FurnitureContextMenuWidgetHandler.as::set connection()
    public set connection(value: IConnection | null)
    {
        this._connection = value;

        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureContextMenuWidgetHandler.as::set connection()
        // adds `_SafeCls_2773` (GuildFurniContextMenuInfoMessageEvent → onGuildFurniContextMenuInfo)
        // and `_SafeCls_3295` (FigureSetIdsMessageEvent → onFigureSetIds). Neither message is
        // ported, and neither view they feed (guild menu, purchasable clothing) exists yet.
    }

    public get connection(): IConnection | null
    {
        return this._connection;
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        // TODO(AS3): AS3 returns ["RWUPM_MONSTERPLANT_SEED"], handled in processWidgetMessage()
        // below. `RoomWidgetUseProductMessage` is not ported, so nothing can send it yet.
        return [];
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        // TODO(AS3): the "RWUPM_MONSTERPLANT_SEED" case casts to RoomWidgetUseProductMessage and
        // calls `container.roomSession.plantSeed(roomObjectId)` (both sides exist; the message
        // class does not).
        return null;
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [
            RoomEngineToWidgetEvent.REQUEST_OPEN_FURNI_CONTEXT_MENU,
            RoomEngineToWidgetEvent.REQUEST_CLOSE_FURNI_CONTEXT_MENU
        ];
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        if(this._widget === null) return;

        const widgetEvent = event as RoomEngineToWidgetEvent | null;

        if(!widgetEvent) return;

        const object = this.getRoomObject(widgetEvent.objectId);

        if(object === null) return;

        switch(widgetEvent.type)
        {
            case RoomEngineToWidgetEvent.REQUEST_OPEN_FURNI_CONTEXT_MENU:
                switch(widgetEvent.contextMenu)
                {
                    case CONTEXT_MENU_MYSTERY_BOX:
                        this._widget.showMysteryBoxContextMenu(object);
                        break;
                    case CONTEXT_MENU_FRIEND_FURNITURE:
                    case CONTEXT_MENU_MONSTERPLANT_SEED:
                    case CONTEXT_MENU_RANDOM_TELEPORT:
                    case CONTEXT_MENU_PURCHASABLE_CLOTHING:
                        // TODO(AS3): FurnitureContextMenuWidgetHandler.as::processEvent() routes
                        // these to showFriendFurnitureContextMenu() / showMonsterPlantSeedContextMenu()
                        // (owner-gated) / showRandomTeleportContextMenu() /
                        // showUsableFurnitureContextMenu(). Those views are not ported.
                        log.warn(`Unported furniture context menu: ${widgetEvent.contextMenu}`);
                        break;
                }
                break;
            case RoomEngineToWidgetEvent.REQUEST_CLOSE_FURNI_CONTEXT_MENU:
                this._widget.hideContextMenu(object);
                break;
        }
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::update()
    public update(): void
    {
    }

    /**
     * AS3 returns the engine rectangle as-is because the Flash room canvas sits at the desktop
     * origin. Here the canvas is a child of the room view, so the view's own offset is added —
     * the same adaptation AvatarInfoWidget.update() makes for the avatar bubble.
     */
    // AS3: FurnitureContextMenuWidgetHandler.as::getObjectRectangle()
    public getObjectRectangle(objectId: number): {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number
    } | null
    {
        const container = this._container;

        if(!container?.roomEngine) return null;

        const rect = container.roomEngine.getRoomObjectBoundingRectangle(
            container.roomSession.roomId,
            objectId,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE,
            container.getFirstCanvasId()
        );

        if(!rect) return null;

        const viewRect = container.getRoomViewRect();
        const offsetX = viewRect?.x ?? 0;
        const offsetY = viewRect?.y ?? 0;

        return {
            left: rect.left + offsetX,
            top: rect.top + offsetY,
            right: rect.right + offsetX,
            bottom: rect.bottom + offsetY,
            width: rect.width,
            height: rect.height
        };
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::getObjectScreenLocation()
    public getObjectScreenLocation(objectId: number): { x: number; y: number } | null
    {
        const container = this._container;

        if(!container?.roomEngine) return null;

        const point = container.roomEngine.getRoomObjectScreenLocation(
            container.roomSession.roomId,
            objectId,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE,
            container.getFirstCanvasId()
        );

        if(!point) return null;

        const viewRect = container.getRoomViewRect();

        return {
            x: point.x + (viewRect?.x ?? 0),
            y: point.y + (viewRect?.y ?? 0)
        };
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::sendGoToHomeRoomMessage()
    public sendGoToHomeRoomMessage(roomId: number): void
    {
        this._container?.navigator?.goToPrivateRoom(roomId);
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::sendJoinToGroupMessage()
    public sendJoinToGroupMessage(_groupId: number): void
    {
        // TODO(AS3): sends `_SafeCls_3683` (JoinHabboGroupMessageComposer) on the connection. Only
        // the unported guild context menu calls this.
    }

    /**
     * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureContextMenuWidgetHandler.as::redeemPurchasableClothing()
     * sends `_SafeCls_3394` (redeem-clothing-furniture) and arms a pending request that
     * `onFigureSetIds()` completes if the reply naming this furni arrives within
     * PENDING_PURCHASABLE_CLOTHING_TIMEOUT_MS. Neither message is ported; the fields are recorded
     * so the timeout logic has somewhere to land.
     */
    // AS3: FurnitureContextMenuWidgetHandler.as::redeemPurchasableClothing()
    public redeemPurchasableClothing(_objectId: number, furniName: string, _figureSetId: string, _gender: string): void
    {
        this._pendingPurchasableClothingFurniName = furniName;
        this._pendingPurchasableClothingTime = performance.now();
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::hasFreshPendingPurchasableClothingRequest()
    private hasFreshPendingPurchasableClothingRequest(): boolean
    {
        if(this._pendingPurchasableClothingTime < 0 || this._pendingPurchasableClothingFurniName === null)
        {
            return false;
        }

        return (performance.now() - this._pendingPurchasableClothingTime) <= PENDING_PURCHASABLE_CLOTHING_TIMEOUT_MS;
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::clearPendingPurchasableClothingRequest()
    private clearPendingPurchasableClothingRequest(): void
    {
        this._pendingPurchasableClothingFurniName = null;
        this._pendingPurchasableClothingTime = -1;
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::getRoomObject()
    private getRoomObject(objectId: number): IRoomObject | null
    {
        const container = this._container;

        if(container === null || !container.roomEngine) return null;

        return container.roomEngine.getRoomObject(
            container.roomSession.roomId,
            objectId,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
        );
    }

    /**
     * No owner check, unlike every other dialog request below it in AS3 — anyone who used the box
     * gets the dialog, because the non-owner is exactly the person putting a key in.
     */
    // AS3: FurnitureContextMenuWidgetHandler.as::onMysteryBoxOpenDialogRequested()
    private onMysteryBoxOpenDialogRequested(event: RoomEngineToWidgetEvent): void
    {
        if(this._widget === null) return;

        const object = this.getRoomObject(event.objectId);

        if(object === null) return;

        this._widget.showMysteryBoxOpenDialog(object);
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::onMysteryTrophyOpenDialogRequested()
    private onMysteryTrophyOpenDialogRequested(event: RoomEngineToWidgetEvent): void
    {
        if(this._widget === null) return;

        const object = this.getRoomObject(event.objectId);

        if(object === null) return;

        if(!this._container?.isOwnerOfFurniture(object)) return;

        this._widget.showMysteryTrophyOpenDialog(object);
    }

    // AS3: FurnitureContextMenuWidgetHandler.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._mysteryBoxToolbarExtension !== null)
        {
            this._mysteryBoxToolbarExtension.dispose();
            this._mysteryBoxToolbarExtension = null;
        }

        this.unsetContainer();

        this._connection = null;
        this._widget = null;

        this.clearPendingPurchasableClothingRequest();

        this._disposed = true;
    }
}
