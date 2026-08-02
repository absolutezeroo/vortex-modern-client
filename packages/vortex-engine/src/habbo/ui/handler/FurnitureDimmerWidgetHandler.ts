import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IRoomCreator} from '@habbo/room/IRoomCreator';
import {RoomEngineDimmerStateEvent} from '@habbo/room/events/RoomEngineDimmerStateEvent';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomSessionDimmerPresetsEvent} from '@habbo/session/events/RoomSessionDimmerPresetsEvent';
import {RoomWidgetDimmerStateUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetDimmerStateUpdateEvent';
import {RoomWidgetDimmerUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetDimmerUpdateEvent';
import {RoomWidgetDimmerChangeStateMessage} from '@habbo/ui/widget/messages/RoomWidgetDimmerChangeStateMessage';
import {RoomWidgetDimmerPreviewMessage} from '@habbo/ui/widget/messages/RoomWidgetDimmerPreviewMessage';
import {RoomWidgetDimmerSavePresetMessage} from '@habbo/ui/widget/messages/RoomWidgetDimmerSavePresetMessage';
import {RoomWidgetFurniToWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniToWidgetMessage';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';

/**
 * FurnitureDimmerWidgetHandler
 *
 * The moodlight's handler. Three of its four messages go out to the server through the room
 * session; the fourth, the preview, never leaves the client — it recolours the room engine
 * directly, which is what makes dragging a slider change the room live.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureDimmerWidgetHandler.as
 */
export class FurnitureDimmerWidgetHandler implements IRoomWidgetHandler
{
    // AS3: FurnitureDimmerWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: FurnitureDimmerWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: FurnitureDimmerWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurnitureDimmerWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_ROOM_DIMMER';
    }

    // AS3: FurnitureDimmerWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // TS-only: read back by the widget, which needs the container for the room engine.
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: FurnitureDimmerWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_DIMMER_WIDGET,
            RoomWidgetDimmerSavePresetMessage.WIDGET_MESSAGE_SAVE_DIMMER_PRESET,
            RoomWidgetDimmerChangeStateMessage.CHANGE_STATE,
            RoomWidgetDimmerPreviewMessage.PREVIEW
        ];
    }

    /**
     * The preview case is deliberately outside `validateRights()`: it only repaints this
     * client's own room, so a visitor watching an owner drag the slider still sees it.
     */
    // AS3: FurnitureDimmerWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        const widgetMessage = message as RoomWidgetMessage | null;

        if(widgetMessage === null || this._container === null) return null;

        switch(widgetMessage.type)
        {
            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_DIMMER_WIDGET:
                if(this.validateRights())
                {
                    const request = widgetMessage as RoomWidgetFurniToWidgetMessage;

                    this._container.roomSession?.sendRoomDimmerGetPresetsMessage(request.id);
                }
                break;
            case RoomWidgetDimmerSavePresetMessage.WIDGET_MESSAGE_SAVE_DIMMER_PRESET:
                if(this.validateRights())
                {
                    const save = widgetMessage as RoomWidgetDimmerSavePresetMessage;

                    this._container.roomSession?.sendRoomDimmerSavePresetMessage(
                        save.presetNumber, save.effectTypeId, save.color, save.brightness, save.apply, save.objectId
                    );
                }
                break;
            case RoomWidgetDimmerChangeStateMessage.CHANGE_STATE:
                if(this.validateRights())
                {
                    const changeState = widgetMessage as RoomWidgetDimmerChangeStateMessage;

                    this._container.roomSession?.sendRoomDimmerChangeStateMessage(changeState.objectId);
                }
                break;
            case RoomWidgetDimmerPreviewMessage.PREVIEW:
            {
                const roomId = this._container.roomSession?.roomId ?? 0;
                const preview = widgetMessage as RoomWidgetDimmerPreviewMessage;

                if(this._container.roomEngine === null) return null;

                // `updateObjectRoomColor` is declared on `IRoomCreator`, not `IRoomEngine`;
                // `RoomEngine` implements both, and the container only hands out the
                // narrower one. AS3 has no such split — its IRoomEngine carries the method.
                (this._container.roomEngine as unknown as IRoomCreator).updateObjectRoomColor(
                    roomId, preview.color, preview.brightness, preview.bgOnly
                );
                break;
            }
        }

        return null;
    }

    /**
     * Owner, any-room controller, or room-controller level >= 1 — the same three-way test
     * every furni-editing handler uses.
     */
    // AS3: FurnitureDimmerWidgetHandler.as::validateRights()
    private validateRights(): boolean
    {
        const isOwner = this._container?.roomSession?.isRoomOwner ?? false;
        const hasControllerLevel = (this._container?.roomSession?.roomControllerLevel ?? 0) >= 1;
        const isAnyRoomController = this._container?.sessionDataManager?.isAnyRoomController ?? false;

        return isOwner || isAnyRoomController || hasControllerLevel;
    }

    // AS3: FurnitureDimmerWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [
            RoomSessionDimmerPresetsEvent.ROOM_DIMMER_PRESETS,
            RoomEngineDimmerStateEvent.CYCLED,
            RoomEngineToWidgetEvent.REMOVE_DIMMER
        ];
    }

    // AS3: FurnitureDimmerWidgetHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        if(this._container === null || this._container.desktopEvents === null) return;

        const sourceEvent = event as {type?: string} | null;

        switch(sourceEvent?.type)
        {
            case RoomSessionDimmerPresetsEvent.ROOM_DIMMER_PRESETS:
            {
                const presetsEvent = event as RoomSessionDimmerPresetsEvent;
                const update = new RoomWidgetDimmerUpdateEvent(RoomWidgetDimmerUpdateEvent.PRESETS);

                update.selectedPresetId = presetsEvent.selectedPresetId;
                update.itemId = presetsEvent.itemId;
                update.isOn = presetsEvent.isOn;

                for(let i = 0; i < presetsEvent.presetCount; i += 1)
                {
                    const preset = presetsEvent.getPreset(i);

                    if(preset !== null)
                    {
                        update.storePreset(preset.id, preset.type, preset.color, preset.light);
                    }
                }

                this._container.desktopEvents.emit(update.type, update);
                break;
            }
            case RoomEngineDimmerStateEvent.CYCLED:
            {
                const stateEvent = event as RoomEngineDimmerStateEvent;
                const update = new RoomWidgetDimmerStateUpdateEvent(
                    stateEvent.objectId,
                    stateEvent.state,
                    stateEvent.presetId,
                    stateEvent.effectId,
                    stateEvent.color,
                    stateEvent.brightness
                );

                this._container.desktopEvents.emit(update.type, update);
                break;
            }
            case RoomEngineToWidgetEvent.REMOVE_DIMMER:
            {
                const engineEvent = event as RoomEngineToWidgetEvent;
                const update = new RoomWidgetDimmerUpdateEvent(RoomWidgetDimmerUpdateEvent.DIMMER_HIDE);

                update.itemId = engineEvent.objectId;

                this._container.desktopEvents.emit(update.type, update);
                break;
            }
        }
    }

    // AS3: FurnitureDimmerWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: FurnitureDimmerWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}
