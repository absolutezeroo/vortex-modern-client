import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';
import type {IRoomObject} from '@room/object/IRoomObject';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import type {VimeoDisplayWidget} from '@habbo/ui/widget/furniture/video/VimeoDisplayWidget';
import {SetObjectDataMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/SetObjectDataMessageComposer';

/**
 * VimeoDisplayWidgetHandler — the `RWE_VIMEO` handler.
 *
 * The class name is **derived**, not recovered: the handler is `_SafeCls_3484` in the primary
 * tree, `class_3409` in `win63_version`. It registers no message events of its own — the
 * furni's video id lives in its own `furniture_data` string map and is read straight off the
 * room object, and `setVideo()` reuses the existing `SetObjectDataMessageComposer` (header 246)
 * rather than a dedicated one — see `VimeoDisplayWidget.as`'s `VIDEO_ID_KEY = "videoId"`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3484.as
 */
export class VimeoDisplayWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/_SafeCls_3484.as::VIDEO_ID_KEY
    private static readonly VIDEO_ID_KEY: string = 'videoId';

    // AS3: .../handler/_SafeCls_3484.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/_SafeCls_3484.as::_SafeStr_4549
    private _widget: VimeoDisplayWidget | null = null;

    // AS3: .../handler/_SafeCls_3484.as::get type()
    get type(): string
    {
        return 'RWE_VIMEO';
    }

    // AS3: .../handler/_SafeCls_3484.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/_SafeCls_3484.as::set widget()
    set widget(value: VimeoDisplayWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/_SafeCls_3484.as::getWidgetMessages()
    getWidgetMessages(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3484.as::processWidgetMessage()
    processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3484.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [];
    }

    /**
     * AS3: .../handler/_SafeCls_3484.as::processEvent()
     *
     * Playback control (the editable video-id field) is granted only to staff with security
     * level 5.
     */
    processEvent(event: unknown): void
    {
        if(this._container?.roomEngine == null) return;

        const widgetEvent = event as RoomEngineToWidgetEvent;

        if(!(widgetEvent instanceof RoomEngineToWidgetEvent)) return;

        const roomObject: IRoomObject | null = this._container.roomEngine.getRoomObject(
            widgetEvent.roomId, widgetEvent.objectId, widgetEvent.category
        );

        switch(widgetEvent.type)
        {
            case RoomEngineToWidgetEvent.REQUEST_OPEN_WIDGET:
                if(roomObject !== null)
                {
                    const canEditVideoId = this._container.sessionDataManager?.hasSecurity(5) ?? false;
                    const videoId = roomObject.getModel()
                        .getStringToStringMap(RoomObjectVariableEnum.FURNITURE_DATA)
                        .get(VimeoDisplayWidgetHandler.VIDEO_ID_KEY) ?? '';

                    this._widget?.show(roomObject, canEditVideoId, parseInt(videoId, 10) || 0);
                }

                break;

            case RoomEngineToWidgetEvent.REQUEST_CLOSE_WIDGET:
                this._widget?.hide(roomObject);

                break;
        }
    }

    // AS3: .../handler/_SafeCls_3484.as::update()
    update(): void
    {
    }

    // AS3: .../handler/_SafeCls_3484.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._container = null;
    }

    // AS3: .../handler/_SafeCls_3484.as::get disposed()
    get disposed(): boolean
    {
        return this._container === null;
    }

    // AS3: .../handler/_SafeCls_3484.as::setVideo()
    setVideo(roomObject: IRoomObject, videoId: number): void
    {
        const data = new Map<string, string>([[VimeoDisplayWidgetHandler.VIDEO_ID_KEY, videoId.toString()]]);

        this._container?.connection?.send(new SetObjectDataMessageComposer(roomObject.getId(), data));
    }
}
