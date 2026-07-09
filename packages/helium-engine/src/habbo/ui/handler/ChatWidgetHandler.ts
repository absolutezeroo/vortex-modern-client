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
 * TODO(AS3): avatar head images and pet images in chat bubbles are not
 * ported — `getUserImage()`/`getPetImage()` always return null. Two real
 * gaps here: (1) `IRoomWidgetHandlerContainer` doesn't expose
 * `avatarRenderManager` yet (AS3's interface does), and (2)
 * `IAvatarImage.getCroppedImage()` returns a PixiJS `Texture`, not the
 * `ImageBitmap` chat bubbles composite with — there's no conversion utility
 * yet. `IRoomEngine.getPetImage()` also doesn't exist. Game chat
 * (`gce_game_chat`, the `habbo/game` module) isn't ported either.
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
    private _disposed: boolean = false;
    private _container: IRoomWidgetHandlerContainer | null = null;
    private _connection: IConnection | null = null;
    private _widget: RoomChatWidget | null = null;

    private _referencePoint: {x: number; y: number} | null = null;
    private _referenceScale: number = 0;

    public set widget(value: RoomChatWidget)
    {
        this._widget = value;
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public get type(): string
    {
        return 'RWE_CHAT_WIDGET';
    }

    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    public set connection(value: IConnection | null)
    {
        this._connection = value;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/handler/ChatWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
        this._referencePoint = null;
    }

    public getWidgetMessages(): string[]
    {
        return [];
    }

    public processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        return null;
    }

    public getProcessedEvents(): string[]
    {
        return ['RSCE_CHAT_EVENT', 'gce_game_chat'];
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/handler/ChatWidgetHandler.as::processEvent()
    // TODO(AS3): AS3 wraps this whole method in
    // `if(container.freeFlowChat && !container.freeFlowChat.isDisabledInPreferences)`.
    // IRoomWidgetHandlerContainer has no freeFlowChat property yet (habbo/freeflowchat
    // isn't wired into RoomUI/RoomDesktop - same gap already flagged in
    // widget/roomtools/RoomToolsWidget.ts and RoomToolsToolbarCtrl.ts), so this guard
    // is intentionally omitted rather than ported with a field that's always undefined
    // (which would disable all chat bubble rendering, not just this preference).
    public processEvent(event: {type: string}): void
    {
        if(!this._container) return;

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

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/handler/ChatWidgetHandler.as::processEvent() (RSCE_CHAT_EVENT branch)
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

        if(chatEvent.chatType === 5)
        {
            // TODO(AS3): hand-item localization lookup (widget.chatbubble.handitem) not ported.
            styleId = 1;
        }

        if(chatEvent.chatType === 10)
        {
            // TODO(AS3): mute-time localization lookup (widget.chatbubble.mutetime) not ported.
            styleId = 1;
        }

        if(chatEvent.chatType === 7 || chatEvent.chatType === 8 || chatEvent.chatType === 9)
        {
            // TODO(AS3): pet-revive/fertilize localization lookup not ported.
            styleId = 1;
        }

        if(chatEvent.chatType === 11)
        {
            // TODO(AS3): generic "translate raw text through localization" passthrough
            // not ported yet. IHabboLocalizationManager.getLocalization()/registerParameter()/
            // getLocalizationRaw() already exist (see ExtendedProfileWindowCtrl.ts for a live
            // caller) - this is just not-yet-done, not blocked on missing infra.
            styleId = 1;
        }

        const chatUpdateEvent = new RoomWidgetChatUpdateEvent(
            RoomWidgetChatUpdateEvent.WIDGET_UPDATE_EVENT_CHAT, chatEvent.userId, text, userName, 100,
            userType, petType, x, y, userImage, 0, chatEvent.session.roomId, chatEvent.chatType, styleId, chatEvent.links
        );

        container.desktopEvents.emit(chatUpdateEvent.type, chatUpdateEvent);
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/handler/ChatWidgetHandler.as::getUserImage()
    // TODO(AS3): see file header — avatar head image extraction not wired yet.
    public getUserImage(_figureString: string): ImageBitmap | null
    {
        return null;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/handler/ChatWidgetHandler.as::getPetImage()
    // TODO(AS3): see file header — IRoomEngine.getPetImage() doesn't exist yet.
    private getPetImage(_figureString: string): ImageBitmap | null
    {
        return null;
    }

    public update(): void
    {
        this.updateWidgetPosition();
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/handler/ChatWidgetHandler.as::updateWidgetPosition()
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
                    const event = new RoomWidgetRoomViewUpdateEvent(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_POSITION_CHANGED, null, {x: dx, y: dy});

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
