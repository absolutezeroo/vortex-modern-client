/**
 * PlayListEditorWidgetHandler — the room-side half of the Trax playlist editor widget.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/PlayListEditorWidgetHandler.as
 *
 * Turns a jukebox double-click into either "show the editor" (owner) or a fire-and-forget
 * "use furniture" ping (any room controller, so a non-owner controller can still hand a
 * furni-inventory refresh to whoever *does* own it — AS3's own comment-free way of nudging the
 * owner's client). The three outgoing modification messages the widget sends become the three
 * jukebox composers already ported for the Trax sequencer; the three furni-list events it
 * listens to are the same ones `HabboInventory` already subscribes to for the "my stuff changed"
 * refresh — this handler just adds its own listener alongside that one.
 */
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {FurniListMessageEvent} from '@habbo/communication/messages/incoming/inventory/furni/FurniListMessageEvent';
import {FurniListAddOrUpdateMessageEvent} from '@habbo/communication/messages/incoming/inventory/furni/FurniListAddOrUpdateMessageEvent';
import {FurniListRemoveMessageEvent} from '@habbo/communication/messages/incoming/inventory/furni/FurniListRemoveMessageEvent';
import type {FurniListMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListMessageParser';
import {UseFurnitureMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/UseFurnitureMessageComposer';
import {AddJukeboxDiskComposer} from '@habbo/communication/messages/outgoing/sound/AddJukeboxDiskComposer';
import {RemoveJukeboxDiskComposer} from '@habbo/communication/messages/outgoing/sound/RemoveJukeboxDiskComposer';
import {NowPlayingEvent} from '@habbo/sound/events/NowPlayingEvent';
import {PlayListStatusEvent} from '@habbo/sound/events/PlayListStatusEvent';
import {SongDiskInventoryReceivedEvent} from '@habbo/sound/events/SongDiskInventoryReceivedEvent';
import {RoomEngineSoundMachineEvent} from '@habbo/room/events/RoomEngineSoundMachineEvent';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import {RoomWidgetFurniToWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniToWidgetMessage';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import {RoomWidgetPlayListModificationMessage} from '@habbo/ui/widget/messages/RoomWidgetPlayListModificationMessage';
import {RoomWidgetPlayListPlayStateMessage} from '@habbo/ui/widget/messages/RoomWidgetPlayListPlayStateMessage';
import {RoomWidgetPlayListUserActionMessage} from '@habbo/ui/widget/messages/RoomWidgetPlayListUserActionMessage';
import {RoomWidgetPlayListEditorEvent} from '@habbo/ui/widget/events/RoomWidgetPlayListEditorEvent';
import {RoomWidgetPlayListEditorNowPlayingEvent} from '@habbo/ui/widget/events/RoomWidgetPlayListEditorNowPlayingEvent';
import type {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';

export class PlayListEditorWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../PlayListEditorWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../PlayListEditorWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../PlayListEditorWidgetHandler.as::_SafeStr_4568 (the connection)
    private _connection: IConnection | null = null;

    // AS3: .../PlayListEditorWidgetHandler.as::_SafeStr_6951 (FurniListComposer event, i.e. FurniListMessageEvent)
    private _furniListEvent: IMessageEvent | null = null;

    // AS3: .../PlayListEditorWidgetHandler.as::_SafeStr_8748 (FurniListRemoveComposer event)
    private _furniListRemoveEvent: IMessageEvent | null = null;

    // AS3: .../PlayListEditorWidgetHandler.as::_SafeStr_5885 (FurniListAddOrUpdateComposer event)
    private _furniListAddOrUpdateEvent: IMessageEvent | null = null;

    // AS3: .../PlayListEditorWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../PlayListEditorWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_PLAYLIST_EDITOR_WIDGET';
    }

    // AS3: .../PlayListEditorWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;

        const soundManager = this._container?.soundManager ?? null;

        if(soundManager)
        {
            soundManager.events.on(SongDiskInventoryReceivedEvent.SONG_DISK_INVENTORY_RECEIVED, this.processSoundManagerEvent);
            soundManager.events.on(PlayListStatusEvent.PLAY_LIST_UPDATED, this.processSoundManagerEvent);
            soundManager.events.on(PlayListStatusEvent.PLAY_LIST_FULL, this.processSoundManagerEvent);
            soundManager.events.on(NowPlayingEvent.NOW_PLAYING_SONG_CHANGED, this.processSoundManagerEvent);
            soundManager.events.on(NowPlayingEvent.USER_PLAY_SONG, this.processSoundManagerEvent);
            soundManager.events.on(NowPlayingEvent.USER_STOP_SONG, this.processSoundManagerEvent);
        }
    }

    // AS3: .../PlayListEditorWidgetHandler.as::set connection()
    set connection(value: IConnection | null)
    {
        this._furniListEvent = new FurniListMessageEvent(this.onFurniListUpdated);
        this._furniListRemoveEvent = new FurniListRemoveMessageEvent(this.onFurniListUpdated);
        this._furniListAddOrUpdateEvent = new FurniListAddOrUpdateMessageEvent(this.onFurniListUpdated);
        this._connection = value;
        this._connection?.addMessageEvent(this._furniListEvent);
        this._connection?.addMessageEvent(this._furniListRemoveEvent);
        this._connection?.addMessageEvent(this._furniListAddOrUpdateEvent);
    }

    // AS3: .../PlayListEditorWidgetHandler.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._connection)
        {
            if(this._furniListEvent) this._connection.removeMessageEvent(this._furniListEvent);
            if(this._furniListRemoveEvent) this._connection.removeMessageEvent(this._furniListRemoveEvent);
            if(this._furniListAddOrUpdateEvent) this._connection.removeMessageEvent(this._furniListAddOrUpdateEvent);
        }

        this._connection = null;
        this._furniListEvent = null;
        this._furniListRemoveEvent = null;
        this._furniListAddOrUpdateEvent = null;

        const soundManager = this._container?.soundManager ?? null;

        if(soundManager)
        {
            soundManager.events.off(SongDiskInventoryReceivedEvent.SONG_DISK_INVENTORY_RECEIVED, this.processSoundManagerEvent);
            soundManager.events.off(PlayListStatusEvent.PLAY_LIST_UPDATED, this.processSoundManagerEvent);
            soundManager.events.off(PlayListStatusEvent.PLAY_LIST_FULL, this.processSoundManagerEvent);
            soundManager.events.off(NowPlayingEvent.NOW_PLAYING_SONG_CHANGED, this.processSoundManagerEvent);
            soundManager.events.off(NowPlayingEvent.USER_PLAY_SONG, this.processSoundManagerEvent);
            soundManager.events.off(NowPlayingEvent.USER_STOP_SONG, this.processSoundManagerEvent);
        }

        this._container = null;
    }

    // AS3: .../PlayListEditorWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[]
    {
        return [
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_PLAYLIST_EDITOR_WIDGET,
            RoomWidgetPlayListModificationMessage.ADD_TO_PLAYLIST,
            RoomWidgetPlayListModificationMessage.REMOVE_FROM_PLAYLIST,
            RoomWidgetPlayListPlayStateMessage.TOGGLE_PLAY_PAUSE,
            RoomWidgetPlayListUserActionMessage.OPEN_CATALOGUE_BUTTON_PRESSED
        ];
    }

    // AS3: .../PlayListEditorWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(message: unknown): unknown
    {
        const widgetMessage = message as RoomWidgetMessage;

        switch(widgetMessage.type)
        {
            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_PLAYLIST_EDITOR_WIDGET:
            {
                const furniMessage = message as RoomWidgetFurniToWidgetMessage;
                const roomObject = this._container?.roomEngine?.getRoomObject(
                    furniMessage.roomId, furniMessage.id, furniMessage.category
                ) ?? null;

                if(roomObject !== null)
                {
                    const isOwner = this._container?.isOwnerOfFurniture(roomObject) ?? false;
                    const isController = (this._container?.roomSession?.isRoomOwner ?? false) ||
                        (this._container?.roomSession?.roomControllerLevel ?? 0) >= 1 ||
                        (this._container?.sessionDataManager?.isAnyRoomController ?? false);

                    if(isOwner)
                    {
                        this._container?.desktopEvents.emit(
                            RoomWidgetPlayListEditorEvent.SHOW_PLAYLIST_EDITOR,
                            new RoomWidgetPlayListEditorEvent(RoomWidgetPlayListEditorEvent.SHOW_PLAYLIST_EDITOR, furniMessage.id)
                        );
                    }
                    else if(isController)
                    {
                        this._connection?.send(new UseFurnitureMessageComposer(roomObject.getId(), -2));
                    }
                }

                break;
            }
            case RoomWidgetPlayListModificationMessage.ADD_TO_PLAYLIST:
            {
                const modification = message as RoomWidgetPlayListModificationMessage;

                this._connection?.send(new AddJukeboxDiskComposer(modification.diskId, modification.slotNumber));

                break;
            }
            case RoomWidgetPlayListModificationMessage.REMOVE_FROM_PLAYLIST:
            {
                const modification = message as RoomWidgetPlayListModificationMessage;

                this._connection?.send(new RemoveJukeboxDiskComposer(modification.slotNumber));

                break;
            }
            case RoomWidgetPlayListPlayStateMessage.TOGGLE_PLAY_PAUSE:
            {
                const playState = message as RoomWidgetPlayListPlayStateMessage;

                this._connection?.send(new UseFurnitureMessageComposer(playState.furniId, playState.position));

                break;
            }
            case RoomWidgetPlayListUserActionMessage.OPEN_CATALOGUE_BUTTON_PRESSED:
                this._container?.habboTracking?.trackGoogle('playlistEditorPanelOpenCatalogue', 'click');
                break;
        }

        return null;
    }

    // AS3: .../PlayListEditorWidgetHandler.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [RoomEngineSoundMachineEvent.JUKEBOX_DISPOSE];
    }

    // AS3: .../PlayListEditorWidgetHandler.as::processEvent()
    processEvent(event: unknown): void
    {
        const soundMachineEvent = event as RoomEngineSoundMachineEvent;

        if(soundMachineEvent?.type === RoomEngineSoundMachineEvent.JUKEBOX_DISPOSE)
        {
            this._container?.desktopEvents.emit(
                RoomWidgetPlayListEditorEvent.HIDE_PLAYLIST_EDITOR,
                new RoomWidgetPlayListEditorEvent(RoomWidgetPlayListEditorEvent.HIDE_PLAYLIST_EDITOR, soundMachineEvent.objectId)
            );
        }
    }

    // AS3: .../PlayListEditorWidgetHandler.as::update()
    update(): void
    {
    }

    /**
     * AS3 registers this same callback on all three furni-list events, but only ever casts the
     * event to `FurniListMessageEvent` (the full-list one) before reading `fragmentNo` off its
     * parser — the remove/add-or-update branches always fail that cast and do nothing. Read the
     * body, not the name: this is not a bug to "fix" by giving the other two their own logic, it
     * is exactly what AS3 does.
     */
    // AS3: .../PlayListEditorWidgetHandler.as::onFurniListUpdated()
    private onFurniListUpdated = (event: IMessageEvent): void =>
    {
        if(!(event instanceof FurniListMessageEvent)) return;

        const parser = event.parser as FurniListMessageParser | null;

        if(parser !== null && parser.fragmentNo === 0)
        {
            this._container?.desktopEvents.emit(
                RoomWidgetPlayListEditorEvent.INVENTORY_UPDATED,
                new RoomWidgetPlayListEditorEvent(RoomWidgetPlayListEditorEvent.INVENTORY_UPDATED, -1)
            );
        }
    };

    // AS3: .../PlayListEditorWidgetHandler.as::processSoundManagerEvent()
    private processSoundManagerEvent = (event: PlayListStatusEvent | SongDiskInventoryReceivedEvent | NowPlayingEvent): void =>
    {
        switch(event.type)
        {
            case SongDiskInventoryReceivedEvent.SONG_DISK_INVENTORY_RECEIVED:
                this._container?.desktopEvents.emit(
                    RoomWidgetPlayListEditorEvent.SONG_DISK_INVENTORY_UPDATED,
                    new RoomWidgetPlayListEditorEvent(RoomWidgetPlayListEditorEvent.SONG_DISK_INVENTORY_UPDATED)
                );
                break;
            case PlayListStatusEvent.PLAY_LIST_UPDATED:
                this._container?.desktopEvents.emit(
                    RoomWidgetPlayListEditorEvent.PLAY_LIST_UPDATED,
                    new RoomWidgetPlayListEditorEvent(RoomWidgetPlayListEditorEvent.PLAY_LIST_UPDATED)
                );
                break;
            case PlayListStatusEvent.PLAY_LIST_FULL:
                this._container?.desktopEvents.emit(
                    RoomWidgetPlayListEditorEvent.PLAY_LIST_FULL,
                    new RoomWidgetPlayListEditorEvent(RoomWidgetPlayListEditorEvent.PLAY_LIST_FULL)
                );
                break;
            case NowPlayingEvent.NOW_PLAYING_SONG_CHANGED:
                this.dispatchNowPlaying(RoomWidgetPlayListEditorNowPlayingEvent.NOW_PLAYING_SONG_CHANGED, event as NowPlayingEvent);
                break;
            case NowPlayingEvent.USER_PLAY_SONG:
                this.dispatchNowPlaying(RoomWidgetPlayListEditorNowPlayingEvent.USER_PLAY_SONG, event as NowPlayingEvent);
                break;
            case NowPlayingEvent.USER_STOP_SONG:
                this.dispatchNowPlaying(RoomWidgetPlayListEditorNowPlayingEvent.USER_STOP_SONG, event as NowPlayingEvent);
                break;
        }
    };

    // AS3: .../PlayListEditorWidgetHandler.as::processSoundManagerEvent() (the three NPE_/NPW_ branches)
    private dispatchNowPlaying(type: string, event: NowPlayingEvent): void
    {
        const translated: RoomWidgetUpdateEvent = new RoomWidgetPlayListEditorNowPlayingEvent(type, event.id, event.position, event.priority);

        this._container?.desktopEvents.emit(type, translated);
    }
}
