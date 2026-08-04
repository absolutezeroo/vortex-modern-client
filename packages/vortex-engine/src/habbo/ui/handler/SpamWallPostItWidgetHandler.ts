import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import {
    RoomWidgetSpamWallPostItEditEvent
} from '@habbo/ui/widget/events/RoomWidgetSpamWallPostItEditEvent';
import {
    RoomWidgetSpamWallPostItFinishEditingMessage
} from '@habbo/ui/widget/messages/RoomWidgetSpamWallPostItFinishEditingMessage';
import {
    RequestSpamWallPostItMessageEvent
} from '@habbo/communication/messages/incoming/room/furniture/RequestSpamWallPostItMessageEvent';
import type {
    RequestSpamWallPostItMessageParser
} from '@habbo/communication/messages/parser/room/furniture/RequestSpamWallPostItMessageParser';
import {
    AddSpamWallPostItMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/AddSpamWallPostItMessageComposer';

const log = Logger.getLogger('habbo.ui.handler.SpamWallPostItWidgetHandler');

/**
 * SpamWallPostItWidgetHandler
 *
 * Opens the spam-wall post-it editor when the server asks, and puts the finished note back
 * on the wire.
 *
 * Unlike its siblings this handler owns a message event of its own, registered the moment a
 * connection is handed to it — the open request is a server push, not something the room
 * engine translates.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/SpamWallPostItWidgetHandler.as
 */
export class SpamWallPostItWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../SpamWallPostItWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../SpamWallPostItWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../SpamWallPostItWidgetHandler.as::_SafeStr_4568
    private _connection: IConnection | null = null;

    // AS3: .../SpamWallPostItWidgetHandler.as::_SafeStr_8493
    private _messageEvent: IMessageEvent | null = null;

    // AS3: .../SpamWallPostItWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../SpamWallPostItWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_SPAMWALL_POSTIT_WIDGET';
    }

    // AS3: .../SpamWallPostItWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // TS-only: read back, as the port's other handlers expose it.
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../SpamWallPostItWidgetHandler.as::set connection()
    public set connection(value: IConnection | null)
    {
        this._messageEvent = new RequestSpamWallPostItMessageEvent(this.onSpamWallPostItRequest);
        this._connection = value;
        this._connection?.addMessageEvent(this._messageEvent);
    }

    /**
     * The note's type decides which skin the widget draws. It comes from the inventory item
     * behind the id, and only a `post_it_*` wall type is taken — anything else falls back to
     * the plain `post_it`.
     */
    // AS3: .../SpamWallPostItWidgetHandler.as::onSpamWallPostItRequest()
    private onSpamWallPostItRequest = (event: IMessageEvent): void =>
    {
        if(event === null) return;

        const parser = event.parser as RequestSpamWallPostItMessageParser;

        if(!parser) return;

        const itemId = parser.itemId;
        const location = parser.location;

        let objectType = 'post_it';

        const item = this._container?.inventory?.getWallItemById(itemId) ?? null;

        if(item !== null && this._container?.roomEngine)
        {
            const wallItemType = this._container.roomEngine.getWallItemType(item.type);

            if(wallItemType !== null && wallItemType.match('post_it_')) objectType = wallItemType;
        }

        this._container?.desktopEvents?.emit(
            RoomWidgetSpamWallPostItEditEvent.OPEN_EDITOR,
            new RoomWidgetSpamWallPostItEditEvent(
                RoomWidgetSpamWallPostItEditEvent.OPEN_EDITOR, itemId, location, objectType
            )
        );
    };

    // AS3: .../SpamWallPostItWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [
            RoomWidgetSpamWallPostItEditEvent.OPEN_EDITOR,
            RoomWidgetSpamWallPostItFinishEditingMessage.SEND_POSTIT_DATA
        ];
    }

    // AS3: .../SpamWallPostItWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        const widgetMessage = message as RoomWidgetMessage | null;

        if(widgetMessage === null) return null;

        if(widgetMessage.type === RoomWidgetSpamWallPostItFinishEditingMessage.SEND_POSTIT_DATA)
        {
            const finish = widgetMessage as RoomWidgetSpamWallPostItFinishEditingMessage;

            if(this._connection === null)
            {
                log.warn('No connection - the finished post-it cannot be sent');

                return null;
            }

            this._connection.send(new AddSpamWallPostItMessageComposer(
                finish.objectId, finish.location, finish.colorHex, finish.text
            ));
        }

        return null;
    }

    // AS3: .../SpamWallPostItWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: .../SpamWallPostItWidgetHandler.as::processEvent()
    public processEvent(_event: unknown): void
    {
        // AS3 no-op.
    }

    // AS3: .../SpamWallPostItWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: .../SpamWallPostItWidgetHandler.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._messageEvent !== null) this._connection?.removeMessageEvent(this._messageEvent);

        this._messageEvent = null;
        this._connection = null;
        this._container = null;
    }
}
