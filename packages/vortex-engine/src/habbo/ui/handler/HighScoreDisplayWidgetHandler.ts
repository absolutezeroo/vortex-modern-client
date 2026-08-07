import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import type {HighScoreDisplayWidget} from '../widget/furniture/highscore/HighScoreDisplayWidget';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {HighScoreStuffData} from '@habbo/room/object/data/HighScoreStuffData';

/**
 * Opens and closes the scoreboard bubble, and — uniquely among the handlers ported so far —
 * **repositions it every frame** from `update()`.
 *
 * That is why it registers itself as an update listener from its own `container` setter rather
 * than waiting to be added: the bubble is placed in room coordinates and has to follow the furni
 * as the room scrolls.
 *
 * Class name DERIVED: the AS3 file is `_SafeCls_3964.as` and the identifier exists in no tree.
 * Named after the widget it drives, the way its siblings are.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3964.as
 */
export class HighScoreDisplayWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/_SafeCls_3964.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/_SafeCls_3964.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/_SafeCls_3964.as::_widget
    private _widget: HighScoreDisplayWidget | null = null;

    // AS3: .../handler/_SafeCls_3964.as::_openEvent
    // Name DERIVED (`_SafeStr_5502`): the engine event that opened the bubble, kept so `update()`
    // can ask where its object is now. Never cleared — see `update()`.
    private _openEvent: {roomId: number; objectId: number; category: number} | null = null;

    // AS3: .../handler/_SafeCls_3964.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/_SafeCls_3964.as::get type()
    get type(): string
    {
        return 'RWE_HIGH_SCORE_DISPLAY';
    }

    // AS3: .../handler/_SafeCls_3964.as::get container()
    // A getter as well as a setter, like the area-hide handler's — the widget reads it to reach
    // the localization manager.
    get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/_SafeCls_3964.as::set container()
    // Registers for the update loop on assignment; nothing else does this.
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
        this._container?.addUpdateListener(this);
    }

    // AS3: .../handler/_SafeCls_3964.as::set widget()
    set widget(value: HighScoreDisplayWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/_SafeCls_3964.as::getWidgetMessages()
    // Null: the scoreboard has no buttons.
    getWidgetMessages(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3964.as::processWidgetMessage()
    processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3964.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [
            RoomEngineToWidgetEvent.REQUEST_HIGH_SCORE_DISPLAY,
            RoomEngineToWidgetEvent.REQUEST_HIDE_HIGH_SCORE_DISPLAY
        ];
    }

    /**
     * The open case rebuilds the scoreboard from the object's *model* rather than from a message:
     * `HighScoreStuffData.initializeFromRoomObjectModel()` reads back what the furni already
     * carries, so no server round-trip is needed to show it.
     *
     * The close case is guarded on identity — a hide for a different furni is ignored, which is
     * what lets two scoreboards in one room not close each other.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3964.as::processEvent()
    processEvent(event: {type: string; roomId: number; objectId: number; category: number}): void
    {
        if(this._disposed) return;

        if(this._widget === null) return;

        switch(event.type)
        {
            case RoomEngineToWidgetEvent.REQUEST_HIGH_SCORE_DISPLAY:
            {
                const object = this._container?.roomEngine?.getRoomObject(event.roomId, event.objectId, event.category) ?? null;

                if(object === null) return;

                const model = object.getModel();

                if(model !== null)
                {
                    const data = new HighScoreStuffData();

                    data.initializeFromRoomObjectModel(model);
                    this._widget.open(event.objectId, event.roomId, data);
                }

                // Set even when the model was null, as in AS3 — the position tracking is keyed on
                // the event, not on whether the bubble drew.
                this._openEvent = {roomId: event.roomId, objectId: event.objectId, category: event.category};

                break;
            }

            case RoomEngineToWidgetEvent.REQUEST_HIDE_HIGH_SCORE_DISPLAY:
                if(event.roomId === this._widget.roomId && event.objectId === this._widget.roomObjId)
                {
                    this._widget.close();
                }

                break;
        }
    }

    /**
     * Follows the furni. All four conditions are needed: an event to track, an open bubble, and
     * the bubble's room *and* object matching that event — which is how a stale `_openEvent`
     * (never cleared on close) stops driving anything once the bubble closes and resets its ids
     * to -1.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3964.as::update()
    update(): void
    {
        const openEvent = this._openEvent;

        if(openEvent === null || this._widget === null) return;

        if(!this._widget.isOpen) return;

        if(this._widget.roomId !== openEvent.roomId || this._widget.roomObjId !== openEvent.objectId) return;

        const engine = this._container?.roomEngine ?? null;

        if(engine === null) return;

        // AS3 fetches the object and discards it — the null check is the only use.
        if(engine.getRoomObject(openEvent.roomId, openEvent.objectId, openEvent.category) === null) return;

        const location = engine.getRoomObjectScreenLocation(openEvent.roomId, openEvent.objectId, openEvent.category);

        if(location === null) return;

        this._widget.setRelativePositionToRoomObjectAt(location.x, location.y);
    }

    // AS3: .../handler/_SafeCls_3964.as::dispose()
    // Removes itself from the update loop, which the setter added it to.
    dispose(): void
    {
        this._container?.removeUpdateListener(this);

        this._disposed = true;
        this._container = null;
        this._widget = null;
    }
}
