import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {GetBotInventoryComposer} from '@habbo/communication/messages/outgoing/inventory/GetBotInventoryComposer';
import {PlaceBotMessageComposer} from '@habbo/communication/messages/outgoing/room/bot/PlaceBotMessageComposer';

import type {HabboInventory} from '../HabboInventory';
import type {IBotsModel} from './IBotsModel';
import type {Bot} from './Bot';
import {BotsView} from './BotsView';

/**
 * BotsModel — the bots-inventory tab controller (an IInventoryModel).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/bots/BotsModel.as
 *
 * Owns the item store AND a BotsView, forwarding every mutation into the view. This replaces the
 * earlier data-only stub, which had no view, did not implement IInventoryModel, and was therefore
 * never registered as a category — the bots tab could not render at all.
 */
export class BotsModel implements IBotsModel
{
    // AS3: BotsModel.as::placeItemToRoom() passes 4 — `rentable_bot` in RoomObjectUserTypes, the same
    // slot RoomEngine.placeObject() tests to pick PlaceBotMessageComposer over PlacePetComposer.
    private static readonly USER_TYPE_RENTABLE_BOT = 4;

    // Unseen-item tracker category for bots (AS3 uses category 5).
    private static readonly UNSEEN_CATEGORY_BOTS = 5;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::_SafeStr_4593
    private _controller: HabboInventory;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::_communication
    private _communication: IHabboCommunicationManager;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::_roomEngine
    private _roomEngine: IRoomEngine;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::_SafeStr_4550
    private _view: BotsView;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::_items
    private _items: Map<number, Bot> = new Map<number, Bot>();
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::_SafeStr_8992
    private _listInitialized: boolean = false;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::_SafeStr_7251
    private _placementPending: boolean = false;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::_disposed
    private _disposed: boolean = false;

    constructor(
        controller: HabboInventory,
        windowManager: IHabboWindowManager,
        communication: IHabboCommunicationManager,
        roomEngine: IRoomEngine,
        avatarRenderer: IAvatarRenderManager | null
    )
    {
        this._controller = controller;
        this._communication = communication;
        this._roomEngine = roomEngine;
        this._view = new BotsView(this, windowManager, avatarRenderer);
        this._roomEngine.events.on('REOE_PLACED', this.onObjectPlaced);
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::get controller()
    get controller(): HabboInventory
    {
        return this._controller;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::get roomSession()
    get roomSession(): IRoomSession | null
    {
        return this._controller.roomSession;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::get items()
    get items(): Map<number, Bot>
    {
        return this._items;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::isListInitialized()
    isListInitialized(): boolean
    {
        return this._listInitialized;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::setListInitialized()
    setListInitialized(): void
    {
        this._listInitialized = true;
        this._view.updateState();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::requestInventory()
    requestInventory(): void
    {
        this._communication.connection?.send(new GetBotInventoryComposer());
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::requestInitialization()
    requestInitialization(): void
    {
        this.requestInventory();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::addItem()
    addItem(data: Bot): void
    {
        if(!this._items.has(data.id))
        {
            this._items.set(data.id, data);
            this._view.addItem(data);
        }

        this._view.updateState();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::updateItems()
    updateItems(items: Map<number, Bot>): void
    {
        const incoming = new Set(items.keys());

        for(const id of Array.from(this._items.keys()))
        {
            if(!incoming.has(id))
            {
                this._items.delete(id);
                this._view.removeItem(id);
            }
        }

        for(const [id, data] of items)
        {
            if(!this._items.has(id))
            {
                this._items.set(id, data);
                this._view.addItem(data);
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::removeItem()
    removeItem(id: number): void
    {
        this._items.delete(id);
        this._view.removeItem(id);
        this._view.updateState();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::getItemById()
    getItemById(id: number): Bot | null
    {
        return this._items.get(id) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::categorySwitch()
    categorySwitch(category: string): void
    {
        if(category === 'bots' && this._controller.isVisible)
        {
            this._controller.events.emit('HABBO_INVENTORY_TRACKING_EVENT_BOTS');
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::subCategorySwitch()
    // Empty in AS3 too — the bots tab has no sub-page of its own. Required by IInventoryModel.
    subCategorySwitch(_category: string): void
    {
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        return this._view.getWindowContainer();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::closingInventoryView()
    closingInventoryView(): void
    {
        if(this._view.isVisible)
        {
            this.resetUnseenItems();
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::updateView()
    updateView(): void
    {
        this._view.update();
    }

    /**
     * AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::placeItemToRoom()
     *
     * Note the order against PetsModel: bots test `areBotsAllowed` FIRST, so even the room owner
     * cannot place one in a room with bots switched off. AS3 reads `roomSession` without a guard
     * and would throw outside a room; the port returns false instead, which is what the AS3 flow
     * amounts to (the place button is disabled with no session).
     */
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::placeItemToRoom()
    placeItemToRoom(id: number, skipServer: boolean = false): boolean
    {
        const data = this.getItemById(id);

        if(data === null) return false;

        const roomSession = this._controller.roomSession;

        if(roomSession === null || !roomSession.areBotsAllowed) return false;

        if(roomSession.isRoomOwner)
        {
            // The ghost carries a NEGATIVE id so it cannot collide with a real room object;
            // RoomEngine.placeObject() un-negates it before the composer goes out.
            this._placementPending = this._roomEngine.initializeRoomObjectInsert(
                'inventory',
                id * -1,
                RoomObjectCategoryEnum.OBJECT_CATEGORY_USER,
                BotsModel.USER_TYPE_RENTABLE_BOT,
                data.figure
            );
            this._controller.closeView();

            return this._placementPending;
        }

        if(!skipServer)
        {
            // AS3 guest branch — `new _SafeCls_3369(item.id, 0, 0)`. The server resolves the actual
            // drop tile, so x/y are always 0.
            this._communication.connection?.send(new PlaceBotMessageComposer(data.id, 0, 0));
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::onObjectPlaced()
    private onObjectPlaced = (event: {type?: string}): void =>
    {
        if(this._placementPending && event.type === 'REOE_PLACED')
        {
            this._controller.showView();
            this._placementPending = false;
        }
    };

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::resetUnseenItems()
    resetUnseenItems(): void
    {
        this._controller.unseenItemTracker.resetCategory(BotsModel.UNSEEN_CATEGORY_BOTS);
        this._controller.updateUnseenItemCounts();
        this._view.update();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::isUnseen()
    isUnseen(id: number): boolean
    {
        return this._controller.unseenItemTracker.isUnseen(BotsModel.UNSEEN_CATEGORY_BOTS, id);
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::selectItemById()
    // AS3 takes a String and parses it — the id travels as a string through IInventoryModel,
    // because the link handler that produces it (`inventory/open/<category>/<id>`) has strings.
    selectItemById(itemId: string): void
    {
        this._view.selectById(parseInt(itemId, 10));
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._roomEngine.events.off('REOE_PLACED', this.onObjectPlaced);
        this._view.dispose();
        this._items.clear();
    }
}
