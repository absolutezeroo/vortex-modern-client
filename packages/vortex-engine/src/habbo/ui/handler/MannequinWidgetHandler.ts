import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import type {MannequinWidget} from '@habbo/ui/widget/furniture/mannequin/MannequinWidget';

/**
 * MannequinWidgetHandler
 *
 * The thinnest handler in the set: no widget messages at all, one event, and the whole
 * payload comes off the room object's model. Everything the mannequin does afterwards it
 * sends itself, through the container's connection.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/MannequinWidgetHandler.as
 */
export class MannequinWidgetHandler implements IRoomWidgetHandler
{
    // AS3: MannequinWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: MannequinWidgetHandler.as::_SafeStr_4549
    private _widget: MannequinWidget | null = null;

    // AS3: MannequinWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: MannequinWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: MannequinWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_MANNEQUIN';
    }

    // AS3: MannequinWidgetHandler.as::set widget()
    public set widget(value: MannequinWidget | null)
    {
        this._widget = value;
    }

    // AS3: MannequinWidgetHandler.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: MannequinWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: MannequinWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [];
    }

    // AS3: MannequinWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    // AS3: MannequinWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [RoomEngineToWidgetEvent.REQUEST_MANNEQUIN];
    }

    /**
     * Figure and gender are both required — a mannequin with neither is one the server has
     * not described yet, and AS3 leaves the window shut rather than opening it empty.
     */
    // AS3: MannequinWidgetHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        const engineEvent = event as RoomEngineObjectEvent | null;

        if(engineEvent?.type !== RoomEngineToWidgetEvent.REQUEST_MANNEQUIN) return;

        const roomObject = this._container?.roomEngine?.getRoomObject(
            engineEvent.roomId, engineEvent.objectId, engineEvent.category
        ) ?? null;

        if(roomObject === null) return;

        const model = roomObject.getModel();

        if(model === null) return;

        const figure = model.getString(RoomObjectVariableEnum.FURNITURE_MANNEQUIN_FIGURE);
        const gender = model.getString(RoomObjectVariableEnum.FURNITURE_MANNEQUIN_GENDER);
        const name = model.getString(RoomObjectVariableEnum.FURNITURE_MANNEQUIN_NAME);

        if(figure !== null && gender !== null)
        {
            this._widget?.open(roomObject.getId(), figure, gender, name ?? '');
        }
    }

    // AS3: MannequinWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: MannequinWidgetHandler.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._container = null;
        this._disposed = true;
    }
}
