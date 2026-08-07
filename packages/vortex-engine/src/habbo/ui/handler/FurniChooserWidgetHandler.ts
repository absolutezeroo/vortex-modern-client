import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import type {IRoomObject} from '@room/object/IRoomObject';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {ChooserItem} from '../widget/chooser/ChooserItem';
import {RoomWidgetChooserContentEvent} from '../widget/events/RoomWidgetChooserContentEvent';
import {RoomWidgetRoomObjectMessage} from '../widget/messages/RoomWidgetRoomObjectMessage';
import {RoomWidgetRequestWidgetMessage} from '../widget/messages/RoomWidgetRequestWidgetMessage';

/**
 * Builds the "what furniture is in this room" list, over **both** categories — floor items and
 * wall items, in that order — and answers the widget's single-item top-ups.
 *
 * Resolving a name is the interesting part: the model carries only a type id, so the name comes
 * from the session's furniture data, with the object's own type string as the fallback.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurniChooserWidgetHandler.as
 */
export class FurniChooserWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/FurniChooserWidgetHandler.as::POSTER_TYPE_PREFIX
    // Name DERIVED: AS3 tests `type.indexOf("poster") == 0` inline.
    private static readonly POSTER_TYPE_PREFIX: string = 'poster';

    // AS3: .../handler/FurniChooserWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/FurniChooserWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/FurniChooserWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/FurniChooserWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_FURNI_CHOOSER';
    }

    // AS3: .../handler/FurniChooserWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/FurniChooserWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[]
    {
        return [
            RoomWidgetRequestWidgetMessage.REQUEST_FURNI_CHOOSER,
            RoomWidgetRequestWidgetMessage.REQUEST_FURNI_CHOOSER_ADD,
            RoomWidgetRoomObjectMessage.SELECT_OBJECT
        ];
    }

    /**
     * The add case looks the object up in the **active** room rather than the session's, which is
     * the only place this handler uses `activeRoomId` — everything else goes through the session.
     *
     * `RWROM_SELECT_OBJECT` is filtered to the two furni categories, mirroring the user chooser's
     * filter to the user category, so the two handlers can share that message type.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurniChooserWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(message === null || message === undefined) return null;

        const container = this._container;

        if(container === null) return null;

        switch(message.type)
        {
            case RoomWidgetRequestWidgetMessage.REQUEST_FURNI_CHOOSER:
                this.handleFurniChooserRequest();
                break;

            case RoomWidgetRequestWidgetMessage.REQUEST_FURNI_CHOOSER_ADD:
            {
                if(!(message instanceof RoomWidgetRequestWidgetMessage)) return null;

                const object = container.roomEngine?.getRoomObject(
                    container.roomEngine.activeRoomId, message.id, message.category
                ) ?? null;

                const item = this.getChooserItemFor(object, message.category);

                if(item === null) break;

                container.desktopEvents.emit(
                    RoomWidgetChooserContentEvent.FURNI_CHOOSER_CONTENT_ADD,
                    new RoomWidgetChooserContentEvent(
                        RoomWidgetChooserContentEvent.FURNI_CHOOSER_CONTENT_ADD,
                        [item],
                        container.sessionDataManager?.isAnyRoomController ?? false
                    )
                );

                break;
            }

            case RoomWidgetRoomObjectMessage.SELECT_OBJECT:
            {
                if(!(message instanceof RoomWidgetRoomObjectMessage)) return null;

                if(message.category !== RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
                    && message.category !== RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
                {
                    break;
                }

                container.roomEngine?.selectRoomObject(container.roomSession.roomId, message.id, message.category);

                break;
            }
        }

        return null;
    }

    /**
     * Both categories resolve a name the same way — type id → furniture data → localized name —
     * but the wall branch has a special case first: a poster's type string carries its number, and
     * its name comes from a `poster_<n>_name` localisation key rather than from furniture data.
     *
     * The wall branch also requires a *non-empty* localized name before using it, where the floor
     * branch accepts whatever the data gives.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurniChooserWidgetHandler.as::getChooserItemFor()
    getChooserItemFor(object: IRoomObject | null, category: number): ChooserItem | null
    {
        if(object === null) return null;

        const container = this._container;

        if(container === null) return null;

        if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
        {
            const typeId = object.getModel().getNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID);
            const data = container.sessionDataManager?.getFloorItemData(typeId) ?? null;
            const name = data !== null ? data.localizedName : object.getType();
            const owner = object.getModel().getString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME);

            return new ChooserItem(object.getId(), category, name, owner);
        }

        if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
        {
            const type = object.getType();

            let name: string;

            if(type.indexOf(FurniChooserWidgetHandler.POSTER_TYPE_PREFIX) === 0)
            {
                const posterNumber = Number.parseInt(type.replace(FurniChooserWidgetHandler.POSTER_TYPE_PREFIX, ''), 10);
                const key = `poster_${posterNumber}_name`;

                name = container.localization?.getLocalization(key, key) ?? key;
            }
            else
            {
                const typeId = object.getModel().getNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID);
                const data = container.sessionDataManager?.getWallItemData(typeId) ?? null;

                name = data !== null && data.localizedName.length > 0 ? data.localizedName : type;
            }

            const owner = object.getModel().getString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME);

            return new ChooserItem(object.getId(), category, name, owner);
        }

        return null;
    }

    // AS3: .../handler/FurniChooserWidgetHandler.as::getProcessedEvents()
    // Null, not [] — this handler listens to no room events at all.
    getProcessedEvents(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/FurniChooserWidgetHandler.as::processEvent()
    // Empty in AS3 too.
    processEvent(_event: unknown): void
    {
    }

    // AS3: .../handler/FurniChooserWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/FurniChooserWidgetHandler.as::dispose()
    dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }

    /**
     * Floor items first, then wall items, appended to one list — so the chooser's default order
     * is by category before the widget re-sorts it by name.
     *
     * The `userDataManager` guard is AS3's and is dead weight here: nothing in this method touches
     * it. Kept, because it also happens to reject a session that is not ready.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurniChooserWidgetHandler.as::handleFurniChooserRequest()
    private handleFurniChooserRequest(): void
    {
        const container = this._container;

        if(container === null || container.roomSession === null || container.roomEngine === null) return;

        if(container.roomSession.userDataManager === null || container.roomSession.userDataManager === undefined) return;

        const roomId = container.roomSession.roomId;
        const items: ChooserItem[] = [];

        for(const category of [RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL])
        {
            const count = container.roomEngine.getRoomObjectCount(roomId, category);

            for(let i = 0; i < count; i++)
            {
                const object = container.roomEngine.getRoomObjectWithIndex(roomId, i, category);
                const item = this.getChooserItemFor(object, category);

                if(item !== null) items.push(item);
            }
        }

        container.desktopEvents.emit(
            RoomWidgetChooserContentEvent.FURNI_CHOOSER_CONTENT,
            new RoomWidgetChooserContentEvent(
                RoomWidgetChooserContentEvent.FURNI_CHOOSER_CONTENT,
                items,
                container.sessionDataManager?.isAnyRoomController ?? false
            )
        );
    }
}
