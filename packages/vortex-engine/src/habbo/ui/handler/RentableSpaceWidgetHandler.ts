import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {
    RentableSpaceStatusMessageEvent
} from '@habbo/communication/messages/incoming/room/furniture/RentableSpaceStatusMessageEvent';
import {
    RentableSpaceRentOkMessageEvent
} from '@habbo/communication/messages/incoming/room/furniture/RentableSpaceRentOkMessageEvent';
import {
    RentableSpaceRentFailedMessageEvent
} from '@habbo/communication/messages/incoming/room/furniture/RentableSpaceRentFailedMessageEvent';
import {
    RentableSpaceStatusMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/RentableSpaceStatusMessageComposer';
import {
    RentableSpaceRentMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/RentableSpaceRentMessageComposer';
import {
    RentableSpaceCancelRentMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/RentableSpaceCancelRentMessageComposer';
import type {RentableSpaceDisplayWidget} from '@habbo/ui/widget/furniture/rentablespace/RentableSpaceDisplayWidget';

/**
 * Drives the rentable-space furniture: opens the widget when the object is clicked, and carries
 * the three rent messages between it and the connection.
 *
 * **Derived class name.** The AS3 class is `_SafeCls_3971`, obfuscated in every tree; it is
 * identified by `implements IRoomWidgetHandler` plus its `type` of `RWE_RENTABLESPACE`, and named
 * here after that type in the shape the other handlers use.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3971.as
 */
export class RentableSpaceWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/_SafeCls_3971.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/_SafeCls_3971.as::_SafeStr_4549
    private _widget: RentableSpaceDisplayWidget | null = null;

    // AS3: .../handler/_SafeCls_3971.as::_SafeStr_6802
    private _statusEvent: IMessageEvent | null = null;

    // AS3: .../handler/_SafeCls_3971.as::_SafeStr_6708
    private _rentOkEvent: IMessageEvent | null = null;

    // AS3: .../handler/_SafeCls_3971.as::_SafeStr_6844
    private _rentFailedEvent: IMessageEvent | null = null;

    // AS3: .../handler/_SafeCls_3971.as::get type()
    public get type(): string
    {
        return 'RWE_RENTABLESPACE';
    }

    // AS3: .../handler/_SafeCls_3971.as::set widget()
    public set widget(value: RentableSpaceDisplayWidget | null)
    {
        this._widget = value;
    }

    /**
     * AS3: .../handler/_SafeCls_3971.as::set container()
     *
     * Subscribes unconditionally — unlike most handlers there is no "already subscribed" guard, so
     * a second container would subscribe twice. Ported as written.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/_SafeCls_3971.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;

        this._statusEvent = new RentableSpaceStatusMessageEvent(this.onRentableSpaceStatusMessage.bind(this));
        this._container?.connection?.addMessageEvent(this._statusEvent);

        this._rentOkEvent = new RentableSpaceRentOkMessageEvent(this.onRentableSpaceRentOkMessage.bind(this));
        this._container?.connection?.addMessageEvent(this._rentOkEvent);

        this._rentFailedEvent = new RentableSpaceRentFailedMessageEvent(this.onRentableSpaceRentFailedMessage.bind(this));
        this._container?.connection?.addMessageEvent(this._rentFailedEvent);
    }

    // AS3: .../handler/_SafeCls_3971.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    /**
     * AS3: .../handler/_SafeCls_3971.as::get disposed()
     *
     * Derived from the container, not from a flag of its own.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/_SafeCls_3971.as::get disposed()
    public get disposed(): boolean
    {
        return this._container === null;
    }

    /**
     * AS3: .../handler/_SafeCls_3971.as::getWidgetMessages()
     *
     * Returns null — this handler takes no widget messages at all. The widget talks to it through
     * the public methods below instead.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/_SafeCls_3971.as::getWidgetMessages()
    public getWidgetMessages(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3971.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    /**
     * AS3: .../handler/_SafeCls_3971.as::getProcessedEvents()
     *
     * Empty: RoomDesktop appends the open/close pair to whatever this returns, and those two are
     * the only events `processEvent()` handles.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/_SafeCls_3971.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: .../handler/_SafeCls_3971.as::processEvent()
    public processEvent(event: unknown): void
    {
        if(!this._container?.roomEngine) return;

        const widgetEvent = event as RoomEngineToWidgetEvent | null;

        if(!widgetEvent) return;

        const roomObject = this._container.roomEngine.getRoomObject(
            widgetEvent.roomId, widgetEvent.objectId, widgetEvent.category
        );

        switch(widgetEvent.type)
        {
            case 'RETWE_OPEN_WIDGET':
                if(roomObject != null)
                {
                    this._widget?.show(roomObject);
                }
                break;
            // Closing passes the object through even when it is null — the widget compares it
            // against the one it is showing and ignores a mismatch.
            case 'RETWE_CLOSE_WIDGET':
                this._widget?.hide(roomObject);
        }
    }

    // AS3: .../handler/_SafeCls_3971.as::update()
    public update(): void
    {
    }

    // AS3: .../handler/_SafeCls_3971.as::onRentableSpaceStatusMessage()
    public onRentableSpaceStatusMessage(event: IMessageEvent): void
    {
        const parser = (event as RentableSpaceStatusMessageEvent).rentableSpaceStatusParser;

        if(!parser) return;

        this._widget?.populateRentInfo(
            parser.rented,
            parser.canRent,
            parser.canRentErrorCode,
            parser.renterId,
            parser.renterName,
            parser.timeRemaining,
            parser.price
        );
    }

    /**
     * AS3: .../handler/_SafeCls_3971.as::onRentableSpaceRentOkMessage()
     *
     * Ignores the payload and re-asks for the status, so the view is repainted from one source.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/_SafeCls_3971.as::onRentableSpaceRentOkMessage()
    public onRentableSpaceRentOkMessage(_event: IMessageEvent): void
    {
        this._widget?.updateWidgetState();
    }

    // AS3: .../handler/_SafeCls_3971.as::onRentableSpaceRentFailedMessage()
    public onRentableSpaceRentFailedMessage(event: IMessageEvent): void
    {
        const parser = (event as RentableSpaceRentFailedMessageEvent).rentableSpaceRentFailedParser;

        if(!parser) return;

        this._widget?.showErrorView(parser.reason);
    }

    // AS3: .../handler/_SafeCls_3971.as::getRentableSpaceStatus()
    public getRentableSpaceStatus(objectId: number): void
    {
        this._container?.connection?.send(new RentableSpaceStatusMessageComposer(objectId));
    }

    // AS3: .../handler/_SafeCls_3971.as::cancelRent()
    public cancelRent(objectId: number): void
    {
        this._container?.connection?.send(new RentableSpaceCancelRentMessageComposer(objectId));
    }

    // AS3: .../handler/_SafeCls_3971.as::rentSpace()
    public rentSpace(objectId: number): void
    {
        this._container?.connection?.send(new RentableSpaceRentMessageComposer(objectId));
    }

    /**
     * AS3: .../handler/_SafeCls_3971.as::getUsersClubLevel()
     *
     * Declared and called by nothing — the widget checks credits, not club level. Kept so the
     * class's member list matches the source.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/_SafeCls_3971.as::getUsersClubLevel()
    public getUsersClubLevel(): number
    {
        return this._container?.sessionDataManager?.clubLevel ?? 0;
    }

    // AS3: .../handler/_SafeCls_3971.as::getUsersCreditAmount()
    public getUsersCreditAmount(): number
    {
        return this._container?.catalog?.getPurse()?.credits ?? 0;
    }

    // AS3: .../handler/_SafeCls_3971.as::dispose()
    public dispose(): void
    {
        if(this.disposed) return;

        const connection = this._container?.connection ?? null;

        if(this._statusEvent != null)
        {
            connection?.removeMessageEvent(this._statusEvent);
            this._statusEvent = null;
        }

        if(this._rentOkEvent != null)
        {
            connection?.removeMessageEvent(this._rentOkEvent);
            this._rentOkEvent = null;
        }

        if(this._rentFailedEvent != null)
        {
            connection?.removeMessageEvent(this._rentFailedEvent);
            this._rentFailedEvent = null;
        }

        this._container = null;
    }
}
