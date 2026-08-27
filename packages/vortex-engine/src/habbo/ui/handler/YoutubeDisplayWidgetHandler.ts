import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';
import type {YoutubeDisplayWidget} from '@habbo/ui/widget/furniture/video/YoutubeDisplayWidget';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {YoutubeDisplayVideoMessageEvent} from '@habbo/communication/messages/incoming/room/furniture/YoutubeDisplayVideoMessageEvent';
import type {YoutubeDisplayVideoMessageEventParser} from '@habbo/communication/messages/parser/room/furniture/YoutubeDisplayVideoMessageEventParser';
import {YoutubeDisplayPlaylistsMessageEvent} from '@habbo/communication/messages/incoming/room/furniture/YoutubeDisplayPlaylistsMessageEvent';
import type {YoutubeDisplayPlaylistsMessageEventParser} from '@habbo/communication/messages/parser/room/furniture/YoutubeDisplayPlaylistsMessageEventParser';
import {YoutubeControlVideoMessageEvent} from '@habbo/communication/messages/incoming/room/furniture/YoutubeControlVideoMessageEvent';
import type {YoutubeControlVideoMessageEventParser} from '@habbo/communication/messages/parser/room/furniture/YoutubeControlVideoMessageEventParser';
import {GetYoutubeDisplayStatusMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/GetYoutubeDisplayStatusMessageComposer';
import {SetYoutubeDisplayPlaylistMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/SetYoutubeDisplayPlaylistMessageComposer';
import {ControlYoutubeDisplayPlaybackMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/ControlYoutubeDisplayPlaybackMessageComposer';

/**
 * YoutubeDisplayWidgetHandler — the `RWE_YOUTUBE` handler.
 *
 * The class name is **derived**, not recovered: the handler is `_SafeCls_3849` in the primary
 * tree, `class_2671` in `win63_version`. Method names below are recovered from the primary tree
 * (readable) and cross-checked against `win63_version/habbo/ui/handler/class_2671.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3849.as
 */
export class YoutubeDisplayWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/_SafeCls_3849.as::CONTROL_COMMAND_PREVIOUS_VIDEO
    private static readonly CONTROL_COMMAND_PREVIOUS_VIDEO: number = 0;

    // AS3: .../handler/_SafeCls_3849.as::CONTROL_COMMAND_NEXT_VIDEO
    private static readonly CONTROL_COMMAND_NEXT_VIDEO: number = 1;

    // AS3: .../handler/_SafeCls_3849.as::CONTROL_COMMAND_PAUSE_VIDEO
    private static readonly CONTROL_COMMAND_PAUSE_VIDEO: number = 2;

    // AS3: .../handler/_SafeCls_3849.as::CONTROL_COMMAND_CONTINUE_VIDEO
    private static readonly CONTROL_COMMAND_CONTINUE_VIDEO: number = 3;

    // AS3: .../handler/_SafeCls_3849.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/_SafeCls_3849.as::_SafeStr_4549
    private _widget: YoutubeDisplayWidget | null = null;

    // AS3: .../handler/_SafeCls_3849.as::_SafeStr_4546
    private _events: IMessageEvent[] = [];

    // AS3: .../handler/_SafeCls_3849.as::get type()
    get type(): string
    {
        return 'RWE_YOUTUBE';
    }

    // AS3: .../handler/_SafeCls_3849.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;

        if(value === null) return;

        this.addMessageEvent(new YoutubeDisplayVideoMessageEvent(this.onVideo));
        this.addMessageEvent(new YoutubeDisplayPlaylistsMessageEvent(this.onPlaylists));
        this.addMessageEvent(new YoutubeControlVideoMessageEvent(this.onControlVideo));
    }

    // AS3: .../handler/_SafeCls_3849.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        this._events.push(event);
        this._container?.connection?.addMessageEvent(event);
    }

    // AS3: .../handler/_SafeCls_3849.as::removeEvents()
    private removeEvents(): void
    {
        for(const event of this._events)
        {
            this._container?.connection?.removeMessageEvent(event);
            event.dispose();
        }

        this._events = [];
    }

    // AS3: .../handler/_SafeCls_3849.as::onVideo()
    private onVideo = (event: IMessageEvent): void =>
    {
        const parser = event.parser as YoutubeDisplayVideoMessageEventParser;

        this._widget?.showVideo(
            parser.furniId, parser.videoId, parser.startAtSeconds, parser.endAtSeconds, parser.state
        );
    };

    // AS3: .../handler/_SafeCls_3849.as::onControlVideo()
    private onControlVideo = (event: IMessageEvent): void =>
    {
        const parser = event.parser as YoutubeControlVideoMessageEventParser;

        this._widget?.controlVideo(parser.furniId, parser.commandId);
    };

    // AS3: .../handler/_SafeCls_3849.as::onPlaylists()
    private onPlaylists = (event: IMessageEvent): void =>
    {
        const parser = event.parser as YoutubeDisplayPlaylistsMessageEventParser;

        this._widget?.populatePlaylists(parser.furniId, parser.playlists, parser.selectedPlaylistId);
    };

    // AS3: .../handler/_SafeCls_3849.as::set widget()
    set widget(value: YoutubeDisplayWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/_SafeCls_3849.as::getWidgetMessages()
    getWidgetMessages(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3849.as::processWidgetMessage()
    processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3849.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [];
    }

    /**
     * AS3: .../handler/_SafeCls_3849.as::processEvent()
     *
     * Playback control is granted to the furni's owner or to staff with security level 4.
     */
    // AS3: .../handler/_SafeCls_3849.as::processEvent()
    processEvent(event: unknown): void
    {
        if(this._container?.roomEngine == null) return;

        const widgetEvent = event as RoomEngineToWidgetEvent;

        if(!(widgetEvent instanceof RoomEngineToWidgetEvent)) return;

        const roomObject = this._container.roomEngine.getRoomObject(
            widgetEvent.roomId, widgetEvent.objectId, widgetEvent.category
        );

        switch(widgetEvent.type)
        {
            case RoomEngineToWidgetEvent.REQUEST_OPEN_WIDGET:
                if(roomObject !== null)
                {
                    const canControlPlayback = this._container.isOwnerOfFurniture(roomObject)
                        || (this._container.sessionDataManager?.hasSecurity(4) ?? false);

                    this._widget?.show(roomObject, canControlPlayback);
                    this._container.connection?.send(new GetYoutubeDisplayStatusMessageComposer(roomObject.getId()));
                }

                break;

            case RoomEngineToWidgetEvent.REQUEST_CLOSE_WIDGET:
                this._widget?.hide(roomObject);

                break;
        }
    }

    // AS3: .../handler/_SafeCls_3849.as::update()
    update(): void
    {
    }

    // AS3: .../handler/_SafeCls_3849.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this.removeEvents();
        this._container = null;
    }

    // AS3: .../handler/_SafeCls_3849.as::get disposed()
    get disposed(): boolean
    {
        return this._container === null;
    }

    // AS3: .../handler/_SafeCls_3849.as::selectPlaylist()
    selectPlaylist(furniId: number, playlistId: string): void
    {
        this._container?.connection?.send(new SetYoutubeDisplayPlaylistMessageComposer(furniId, playlistId));
    }

    // AS3: .../handler/_SafeCls_3849.as::switchToPreviousVideo()
    switchToPreviousVideo(furniId: number): void
    {
        this._container?.connection?.send(
            new ControlYoutubeDisplayPlaybackMessageComposer(furniId, YoutubeDisplayWidgetHandler.CONTROL_COMMAND_PREVIOUS_VIDEO)
        );
    }

    // AS3: .../handler/_SafeCls_3849.as::switchToNextVideo()
    switchToNextVideo(furniId: number): void
    {
        this._container?.connection?.send(
            new ControlYoutubeDisplayPlaybackMessageComposer(furniId, YoutubeDisplayWidgetHandler.CONTROL_COMMAND_NEXT_VIDEO)
        );
    }

    // AS3: .../handler/_SafeCls_3849.as::pauseVideo()
    pauseVideo(furniId: number): void
    {
        this._container?.connection?.send(
            new ControlYoutubeDisplayPlaybackMessageComposer(furniId, YoutubeDisplayWidgetHandler.CONTROL_COMMAND_PAUSE_VIDEO)
        );
    }

    // AS3: .../handler/_SafeCls_3849.as::continueVideo()
    continueVideo(furniId: number): void
    {
        this._container?.connection?.send(
            new ControlYoutubeDisplayPlaybackMessageComposer(furniId, YoutubeDisplayWidgetHandler.CONTROL_COMMAND_CONTINUE_VIDEO)
        );
    }
}
