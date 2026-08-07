import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {ChooserItem} from '../widget/chooser/ChooserItem';
import {RoomWidgetChooserContentEvent} from '../widget/events/RoomWidgetChooserContentEvent';
import {RoomWidgetRoomObjectMessage} from '../widget/messages/RoomWidgetRoomObjectMessage';
import {RoomWidgetRequestWidgetMessage} from '../widget/messages/RoomWidgetRequestWidgetMessage';

/**
 * Builds the "who is in this room" list by walking the room's user objects, and turns a picked
 * row into a room-object selection.
 *
 * It reads the room engine rather than the session's user list: the engine knows who is actually
 * *rendered*, which is what the chooser is for.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/UserChooserWidgetHandler.as
 */
export class UserChooserWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/UserChooserWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/UserChooserWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/UserChooserWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/UserChooserWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_USER_CHOOSER';
    }

    // AS3: .../handler/UserChooserWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/UserChooserWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[]
    {
        return [RoomWidgetRequestWidgetMessage.REQUEST_USER_CHOOSER, RoomWidgetRoomObjectMessage.SELECT_OBJECT];
    }

    // AS3: .../handler/UserChooserWidgetHandler.as::isChooserDisabled()
    // A room variable a room can set to opt out of being listed.
    isChooserDisabled(): boolean
    {
        return this._container?.roomEngine?.activeRoomHasChooserDisabled === true;
    }

    /**
     * `RWROM_SELECT_OBJECT` is filtered to the **user** category only, even though the message
     * carries whatever category the caller passed — so this handler can share that message type
     * with the furni chooser without either acting on the other's rows.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/UserChooserWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(message === null || message === undefined) return null;

        switch(message.type)
        {
            case RoomWidgetRequestWidgetMessage.REQUEST_USER_CHOOSER:
                this.handleUserChooserRequest();
                break;

            case RoomWidgetRoomObjectMessage.SELECT_OBJECT:
            {
                if(!(message instanceof RoomWidgetRoomObjectMessage)) return null;

                if(message.category !== RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) break;

                this._container?.roomEngine?.selectRoomObject(
                    this._container.roomSession.roomId, message.id, message.category
                );

                break;
            }
        }

        return null;
    }

    // AS3: .../handler/UserChooserWidgetHandler.as::getProcessedEvents()
    // Null, not [] — this handler listens to no room events at all.
    getProcessedEvents(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/UserChooserWidgetHandler.as::processEvent()
    // Empty in AS3 too.
    processEvent(_event: unknown): void
    {
    }

    // AS3: .../handler/UserChooserWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/UserChooserWidgetHandler.as::dispose()
    dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }

    /**
     * Walks the room's user objects by index and looks each one up in the user-data manager —
     * the engine gives the room index, the manager gives the name and type.
     *
     * A room object with no user data is skipped silently, which is how an avatar still loading
     * stays out of the list.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/UserChooserWidgetHandler.as::handleUserChooserRequest()
    private handleUserChooserRequest(): void
    {
        const container = this._container;

        if(container === null || container.roomSession === null || container.roomEngine === null) return;

        const userDataManager = container.roomSession.userDataManager;

        if(userDataManager === null || userDataManager === undefined) return;

        const roomId = container.roomSession.roomId;
        const category = RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
        const items: ChooserItem[] = [];
        const count = container.roomEngine.getRoomObjectCount(roomId, category);

        for(let i = 0; i < count; i++)
        {
            const object = container.roomEngine.getRoomObjectWithIndex(roomId, i, category);

            if(object === null) continue;

            const userData = userDataManager.getUserDataByIndex(object.getId());

            if(userData === null) continue;

            items.push(new ChooserItem(userData.roomObjectId, category, userData.name, null, userData.type));
        }

        items.sort(UserChooserWidgetHandler.compareItems);

        container.desktopEvents.emit(
            RoomWidgetChooserContentEvent.USER_CHOOSER_CONTENT,
            new RoomWidgetChooserContentEvent(RoomWidgetChooserContentEvent.USER_CHOOSER_CONTENT, items)
        );
    }

    /**
     * AS3's comparator, kept exactly — including that it **never returns 0**. Equal names, an
     * empty name or a null item all return 1, which makes the sort unstable rather than
     * order-preserving for those cases. The widget re-sorts the list properly afterwards, which
     * is presumably why nobody noticed.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/UserChooserWidgetHandler.as::compareItems()
    private static compareItems(a: ChooserItem | null, b: ChooserItem | null): number
    {
        if(a === null || b === null || a.name === b.name || a.name.length === 0 || b.name.length === 0) return 1;

        return a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1;
    }
}
