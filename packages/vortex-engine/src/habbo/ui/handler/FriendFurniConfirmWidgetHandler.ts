import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import {
    FriendFurniCancelLockEvent
} from '@habbo/communication/messages/incoming/room/furniture/FriendFurniCancelLockEvent';
import {
    FriendFurniOtherLockConfirmedEvent
} from '@habbo/communication/messages/incoming/room/furniture/FriendFurniOtherLockConfirmedEvent';
import {
    FriendFurniStartConfirmationEvent
} from '@habbo/communication/messages/incoming/room/furniture/FriendFurniStartConfirmationEvent';
import type {
    FriendFurniCancelLockParser
} from '@habbo/communication/messages/parser/room/furniture/FriendFurniCancelLockParser';
import type {
    FriendFurniOtherLockConfirmedParser
} from '@habbo/communication/messages/parser/room/furniture/FriendFurniOtherLockConfirmedParser';
import type {
    FriendFurniStartConfirmationParser
} from '@habbo/communication/messages/parser/room/furniture/FriendFurniStartConfirmationParser';
import {
    FriendFurniConfirmLockMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/FriendFurniConfirmLockMessageComposer';
import type {FriendFurniConfirmWidget} from '@habbo/ui/widget/furniture/friendfurni/FriendFurniConfirmWidget';

/**
 * FriendFurniConfirmWidgetHandler
 *
 * The only handler in the set driven purely by the *network* rather than by the room engine:
 * it registers three incoming messages the moment it is given a connection, and its
 * `getProcessedEvents()` and `type` are both empty because nothing routes to it by widget
 * type.
 *
 * The class name is **derived**, not recovered: the handler is `_SafeCls_2535` in every tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_2535.as
 */
export class FriendFurniConfirmWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/_SafeCls_2535.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/_SafeCls_2535.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/_SafeCls_2535.as::_SafeStr_4549
    private _widget: FriendFurniConfirmWidget | null = null;

    // AS3: .../handler/_SafeCls_2535.as::_SafeStr_4568
    private _connection: IConnection | null = null;

    // AS3: .../handler/_SafeCls_2535.as::_SafeStr_7280
    private _startConfirmationEvent: IMessageEvent | null = null;

    // AS3: .../handler/_SafeCls_2535.as::_SafeStr_8480
    private _otherLockConfirmedEvent: IMessageEvent | null = null;

    // AS3: .../handler/_SafeCls_2535.as::_SafeStr_8386
    private _cancelLockEvent: IMessageEvent | null = null;

    // AS3: .../handler/_SafeCls_2535.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /** Empty in AS3 too — the confirm widget is not reached through the type switch. */
    // AS3: .../handler/_SafeCls_2535.as::get type()
    public get type(): string
    {
        return '';
    }

    // AS3: .../handler/_SafeCls_2535.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/_SafeCls_2535.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/_SafeCls_2535.as::set widget()
    public set widget(value: FriendFurniConfirmWidget | null)
    {
        this._widget = value;
    }

    /** Registering happens here rather than in the constructor: the connection arrives later. */
    // AS3: .../handler/_SafeCls_2535.as::set connection()
    public set connection(value: IConnection | null)
    {
        this._connection = value;

        if(this._startConfirmationEvent !== null || this._connection === null) return;

        this._startConfirmationEvent = new FriendFurniStartConfirmationEvent(this.onStartConfirmation);
        this._otherLockConfirmedEvent = new FriendFurniOtherLockConfirmedEvent(this.onOtherLockConfirmed);
        this._cancelLockEvent = new FriendFurniCancelLockEvent(this.onCancelLock);

        this._connection.addMessageEvent(this._startConfirmationEvent);
        this._connection.addMessageEvent(this._otherLockConfirmedEvent);
        this._connection.addMessageEvent(this._cancelLockEvent);
    }

    // AS3: .../handler/_SafeCls_2535.as::sendLockConfirm()
    public sendLockConfirm(stuffId: number, confirmed: boolean): void
    {
        this._connection?.send(new FriendFurniConfirmLockMessageComposer(stuffId, confirmed));
    }

    // AS3: .../handler/_SafeCls_2535.as::onStartConfirmation()
    private onStartConfirmation = (event: IMessageEvent): void =>
    {
        const parser = event.parser as FriendFurniStartConfirmationParser;

        this._widget?.open(parser.stuffId, parser.isOwner);
    };

    // AS3: .../handler/_SafeCls_2535.as::onOtherLockConfirmed()
    private onOtherLockConfirmed = (event: IMessageEvent): void =>
    {
        this._widget?.otherConfirmed((event.parser as FriendFurniOtherLockConfirmedParser).stuffId);
    };

    // AS3: .../handler/_SafeCls_2535.as::onCancelLock()
    private onCancelLock = (event: IMessageEvent): void =>
    {
        this._widget?.close((event.parser as FriendFurniCancelLockParser).stuffId);
    };

    // AS3: .../handler/_SafeCls_2535.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: .../handler/_SafeCls_2535.as::processEvent()
    public processEvent(_event: unknown): void
    {
        // AS3 no-op — this handler answers to messages, not room-engine events.
    }

    // AS3: .../handler/_SafeCls_2535.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [];
    }

    // AS3: .../handler/_SafeCls_2535.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_2535.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: .../handler/_SafeCls_2535.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._connection !== null && this._startConfirmationEvent !== null)
        {
            this._connection.removeMessageEvent(this._startConfirmationEvent);

            if(this._otherLockConfirmedEvent !== null)
            {
                this._connection.removeMessageEvent(this._otherLockConfirmedEvent);
            }

            if(this._cancelLockEvent !== null)
            {
                this._connection.removeMessageEvent(this._cancelLockEvent);
            }

            this._connection = null;
        }

        this._widget = null;
        this._container = null;
        this._disposed = true;
    }
}
