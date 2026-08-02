import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import type {FriendFurniEngravingWidget} from '@habbo/ui/widget/furniture/friendfurni/FriendFurniEngravingWidget';

/**
 * FriendFurniEngravingWidgetHandler
 *
 * Opens the friendship plaque. Like the mannequin's, it takes no widget messages: the
 * engraving is read straight off the room object, and the view only ever closes itself.
 *
 * The class name is **derived**, not recovered: the handler is `_SafeCls_2994` in every tree
 * and no unobfuscated build carries it. Named after the widget it drives and the
 * `RWE_FRIEND_FURNI_ENGRAVING` type it answers to.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_2994.as
 */
export class FriendFurniEngravingWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/_SafeCls_2994.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: .../handler/_SafeCls_2994.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/_SafeCls_2994.as::_SafeStr_4549
    private _widget: FriendFurniEngravingWidget | null = null;

    // AS3: .../handler/_SafeCls_2994.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/_SafeCls_2994.as::get type()
    public get type(): string
    {
        return 'RWE_FRIEND_FURNI_ENGRAVING';
    }

    // AS3: .../handler/_SafeCls_2994.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/_SafeCls_2994.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/_SafeCls_2994.as::set widget()
    public set widget(value: FriendFurniEngravingWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/_SafeCls_2994.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [];
    }

    // AS3: .../handler/_SafeCls_2994.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_2994.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [RoomEngineToWidgetEvent.REQUEST_FRIEND_FURNITURE_ENGRAVING];
    }

    /**
     * The names, figures and date are a `StringArrayStuffData` read out of the room object's
     * own model rather than requested from the server.
     */
    // AS3: .../handler/_SafeCls_2994.as::processEvent()
    public processEvent(event: unknown): void
    {
        if(this._disposed || event === null) return;

        const engineEvent = event as RoomEngineObjectEvent | null;

        if(engineEvent?.type !== RoomEngineToWidgetEvent.REQUEST_FRIEND_FURNITURE_ENGRAVING) return;

        const roomObject = this._container?.roomEngine?.getRoomObject(
            engineEvent.roomId, engineEvent.objectId, engineEvent.category
        ) ?? null;

        if(roomObject === null) return;

        const model = roomObject.getModel();

        if(model === null) return;

        const stuffData = new StringArrayStuffData();

        stuffData.initializeFromRoomObjectModel(model);

        this._widget?.open(
            roomObject.getId(),
            model.getNumber(RoomObjectVariableEnum.FURNITURE_FRIENDFURNI_ENGRAVING_TYPE),
            stuffData
        );
    }

    // AS3: .../handler/_SafeCls_2994.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: .../handler/_SafeCls_2994.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
        this._widget = null;
    }
}
