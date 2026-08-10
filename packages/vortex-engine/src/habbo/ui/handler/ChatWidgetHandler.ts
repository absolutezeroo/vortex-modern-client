/**
 * ChatWidgetHandler
 *
 * @see sources/win63_2023_version/com/sulake/habbo/ui/handler/ChatWidgetHandler.as
 * (primary win63_version copy has decompiler corruption; cross-checked here)
 *
 * Bridges room-session chat events to the RoomChatWidget: builds
 * RoomWidgetChatUpdateEvent from RoomSessionChatEvent (resolving the
 * speaker's screen position via room canvas geometry) and tracks the room
 * camera to notify the widget when it pans/zooms.
 *
 * This handler's own `getUserImage()`/`getPetImage()` return null by decision, not by omission.
 * `processEvent()` returns early the moment `freeFlowChat` resolves, so every live bubble — face
 * included — comes from ChatBubbleFactory, which ports both lookups. Filling them in here would
 * need `IRoomWidgetHandlerContainer` to expose `avatarRenderManager` and a Texture -> ImageBitmap
 * conversion, both solely to feed a path no build after 2023 reaches.
 *
 * TODO(AS3): game chat (`gce_game_chat`) is the one real gap — the `habbo/game` module is
 * unported, independently of the above.
 */
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import {RoomWidgetChatUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetChatUpdateEvent';
import {RoomWidgetRoomViewUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent';
import type {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';
import type {RoomChatWidget} from '@habbo/ui/widget/roomchat/RoomChatWidget';
import {Vector3d} from '@room/utils/Vector3d';

export class ChatWidgetHandler implements IRoomWidgetHandler 
{
    private _referencePoint: { x: number; y: number } | null = null;
    private _referenceScale: number = 0;

    private _disposed: boolean = false;

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::get disposed()
    public get disposed(): boolean 
    {
        return this._disposed;
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null 
    {
        return this._container;
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null) 
    {
        this._container = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/ui/handler/ChatWidgetHandler.as::_connection
    private _connection: IConnection | null = null;

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::set connection()
    public set connection(value: IConnection | null) 
    {
        this._connection = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/ui/handler/ChatWidgetHandler.as::_widget
    private _widget: RoomChatWidget | null = null;

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::set widget()
    public set widget(value: RoomChatWidget) 
    {
        this._widget = value;
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::get type()
    public get type(): string 
    {
        return 'RWE_CHAT_WIDGET';
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::dispose()
    public dispose(): void 
    {
        this._disposed = true;
        this._container = null;
        this._referencePoint = null;
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[] 
    {
        return [];
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null 
    {
        return null;
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[] 
    {
        return ['RSCE_CHAT_EVENT', 'gce_game_chat'];
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::processEvent()
    // Older source trees (PRODUCTION-201601012205-226667486/win63_version) guard this whole method with
    // `if(container.freeFlowChat && !container.freeFlowChat.isDisabledInPreferences) return;`
    // (a user preference to fall back to the legacy bubble system). The primary source
    // (WIN63-202607011411-782849652) dropped that preference entirely along with the legacy
    // RWE_CHAT_WIDGET widget itself (RoomUI no longer even creates it once freeFlowChat is
    // present - see RoomUI.ts's REE_INITIALIZED handling) - freeflowchat is mandatory
    // there. This guard is a safety net for the (normally momentary) window before the
    // freeFlowChat DI dependency resolves, not a user-facing toggle.
    public processEvent(event: { type: string }): void 
    {
        if(!this._container) return;
        if(this._container.freeFlowChat) return;

        switch(event.type) 
        {
            case RoomSessionChatEvent.RSCE_CHAT_EVENT:
                this.handleChatEvent(event as RoomSessionChatEvent);
                break;
            case 'gce_game_chat':
                // TODO(AS3): habbo/game module not ported — see file header.
                break;
        }
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::getUserImage()
    // See the file header: null here is deliberate, not a missing port. The live face path is
    // ChatBubbleFactory.getUserImage(); this legacy handler is dead once freeFlowChat resolves,
    // and reviving it would need a Texture -> ImageBitmap conversion that has no consumer.
    public getUserImage(_figureString: string): ImageBitmap | null
    {
        return null;
    }

    public update(): void 
    {
        this.updateWidgetPosition();
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::processEvent() (RSCE_CHAT_EVENT branch)
    private handleChatEvent(chatEvent: RoomSessionChatEvent): void 
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        const roomObject = container.roomEngine.getRoomObject(chatEvent.session.roomId, chatEvent.userId, 100);

        if(!roomObject) return;

        const geometry = container.roomEngine.getRoomCanvasGeometry(chatEvent.session.roomId, container.getFirstCanvasId());

        if(!geometry) return;

        this.updateWidgetPosition();

        let x = 0;
        let y = 0;

        const screenPoint = geometry.getScreenPoint(roomObject.getLocation());

        if(screenPoint) 
        {
            x = screenPoint.x;
            y = screenPoint.y;

            const offset = container.roomEngine.getRoomCanvasScreenOffset(chatEvent.session.roomId, container.getFirstCanvasId());

            if(offset) 
            {
                x += offset.x;
                y += offset.y;
            }
        }

        const userData = chatEvent.session.userDataManager.getUserDataByIndex(chatEvent.userId);

        let userName = '';
        let userImage: ImageBitmap | null = null;
        let userType = 0;
        const petType = -1;
        const text = chatEvent.text;
        let styleId = chatEvent.styleId;

        if(userData) 
        {
            userType = userData.type;

            switch(userType) 
            {
                case 1:
                    userImage = this.getUserImage(userData.figure);
                    break;
                case 2:
                    userImage = this.getPetImage(userData.figure);
                    break;
                case 3:
                case 4:
                    styleId = 2;
                    break;
            }

            userName = userData.name;
        }

        // The four special chat types below only set their style here. Their text is built by
        // localisation lookups that used to be flagged as an unported gap — they are not: the
        // primary source has no ui/handler/ChatWidgetHandler.as at all, and this whole path is
        // dead the moment freeFlowChat resolves (processEvent() returns early). The live
        // implementation is ChatBubbleFactory.applySpecialChatContent(), which ports all of
        // chatType 3-12 verbatim, including the three below.
        //
        // Duplicating those lookups into this legacy handler would mean maintaining a second
        // copy of behaviour that no build after 2023 has, so it is deliberately not done. If
        // RWE_CHAT_WIDGET is ever revived, take it from ChatBubbleFactory, not from here.
        if(chatEvent.chatType === 5)
        {
            styleId = 1;
        }

        if(chatEvent.chatType === 10)
        {
            styleId = 1;
        }

        if(chatEvent.chatType === 7 || chatEvent.chatType === 8 || chatEvent.chatType === 9)
        {
            styleId = 1;
        }

        if(chatEvent.chatType === 11)
        {
            styleId = 1;
        }

        const chatUpdateEvent = new RoomWidgetChatUpdateEvent(
            RoomWidgetChatUpdateEvent.WIDGET_UPDATE_EVENT_CHAT, chatEvent.userId, text, userName, 100,
            userType, petType, x, y, userImage, 0, chatEvent.session.roomId, chatEvent.chatType, styleId, chatEvent.links
        );

        container.desktopEvents.emit(chatUpdateEvent.type, chatUpdateEvent);
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::getPetImage()
    // As getUserImage() above — `IRoomEngine.getPetImage()` does exist and ChatBubbleFactory
    // already uses it; only this dead legacy path is left returning null.
    private getPetImage(_figureString: string): ImageBitmap | null
    {
        return null;
    }

    // AS3: sources/win63_version/habbo/ui/handler/ChatWidgetHandler.as::updateWidgetPosition()
    private updateWidgetPosition(): void 
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        const canvasId = container.getFirstCanvasId();
        const roomId = container.roomSession.roomId;
        const geometry = container.roomEngine.getRoomCanvasGeometry(roomId, canvasId);

        if(!geometry) return;

        let scaleRatio = 1;

        if(this._referenceScale > 0) scaleRatio = geometry.scale / this._referenceScale;

        if(!this._referencePoint) 
        {
            this._referencePoint = geometry.getScreenPoint(new Vector3d(0, 0, 0)) ?? {x: 0, y: 0};
            // AS3 deliberately offsets by -10 here so the scale-changed branch below
            // always fires once on the next tick, bootstrapping downstream listeners
            // (e.g. RoomChatWidget's own camera-scale-ratio bootstrap).
            this._referenceScale = geometry.scale - 10;
        }

        const point = geometry.getScreenPoint(new Vector3d(0, 0, 0));

        if(point) 
        {
            const offset = container.roomEngine.getRoomCanvasScreenOffset(roomId, canvasId);

            if(offset) 
            {
                point.x += offset.x;
                point.y += offset.y;
            }

            if(point.x !== this._referencePoint.x || point.y !== this._referencePoint.y) 
            {
                const dx = point.x - this._referencePoint.x * scaleRatio;
                const dy = point.y - this._referencePoint.y * scaleRatio;

                if(dx !== 0 || dy !== 0) 
                {
                    const event = new RoomWidgetRoomViewUpdateEvent(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_POSITION_CHANGED, null, {
                        x: dx,
                        y: dy
                    });

                    container.desktopEvents.emit(event.type, event);
                }

                this._referencePoint = point;
            }
        }

        if(geometry.scale !== this._referenceScale) 
        {
            const event = new RoomWidgetRoomViewUpdateEvent(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_SCALE_CHANGED, null, null, geometry.scale);

            container.desktopEvents.emit(event.type, event);
            this._referenceScale = geometry.scale;
        }
    }
}
