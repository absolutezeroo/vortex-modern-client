/**
 * PlayListEditorWidget — the Trax playlist editor's room widget: opens/closes the main window and
 * forwards the sound-manager/inventory pokes the handler translates into
 * `RoomWidgetPlayListEditorEvent`s. Everything visual lives in `MainWindowHandler` and the views
 * it owns; this class is the AS3-mandated go-between plus a handful of helpers those views share
 * (disk tint colour, image-gallery asset loading, the two outgoing user actions).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/PlayListEditorWidget.as
 */
import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {AssetLoaderEvent} from '@core/assets/loaders/AssetLoaderEvent';
import type {IWindow} from '@core/window/IWindow';
import {Logger} from '@core/utils/Logger';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetPlayListEditorEvent} from '@habbo/ui/widget/events/RoomWidgetPlayListEditorEvent';
import {RoomWidgetPlayListEditorNowPlayingEvent} from '@habbo/ui/widget/events/RoomWidgetPlayListEditorNowPlayingEvent';
import {RoomWidgetPlayListModificationMessage} from '@habbo/ui/widget/messages/RoomWidgetPlayListModificationMessage';
import {RoomWidgetPlayListPlayStateMessage} from '@habbo/ui/widget/messages/RoomWidgetPlayListPlayStateMessage';
import {RoomWidgetPlayListUserActionMessage} from '@habbo/ui/widget/messages/RoomWidgetPlayListUserActionMessage';
import {MainWindowHandler} from './MainWindowHandler';

const log = Logger.getLogger('habbo.ui.widget.playlisteditor.PlayListEditorWidget');

/**
 * TS-only: AS3's `getDiskColorTransformFromSongData()` returns a Flash `ColorTransform`, which this
 * port has no type for. The three multiplier channels come back as raw bytes in [130, 229] — the
 * exact range AS3's own hashing arithmetic produces — ready to feed `tintDiskBitmap()`'s canvas
 * `multiply` blend directly.
 */
export interface IDiskColorTint
{
    // TS-only: stands in for AS3's `ColorTransform.redMultiplier`.
    red: number;
    // TS-only: stands in for AS3's `ColorTransform.greenMultiplier`.
    green: number;
    // TS-only: stands in for AS3's `ColorTransform.blueMultiplier`.
    blue: number;
}

/**
 * TS-only: factors out the clone-then-`ColorTransform` two-liner that AS3 repeats verbatim in both
 * `MusicInventoryGridItem.set diskColor()` and `PlayListEditorItem.set diskColor()`. Same technique
 * as `ColorGridCtrl.cloneBitmap()` — a `multiply` fill over the source, `destination-in` to restore
 * its alpha.
 */
export function tintDiskBitmap(source: ImageBitmap, tint: IDiskColorTint): ImageBitmap | null
{
    if(typeof OffscreenCanvas === 'undefined' || source.width < 1 || source.height < 1) return null;

    const canvas = new OffscreenCanvas(source.width, source.height);
    const context = canvas.getContext('2d');

    if(!context) return null;

    context.drawImage(source, 0, 0);
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = `rgb(${tint.red}, ${tint.green}, ${tint.blue})`;
    context.fillRect(0, 0, source.width, source.height);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(source, 0, 0);

    return canvas.transferToImageBitmap();
}

export class PlayListEditorWidget extends RoomWidgetBase
{
    // AS3: .../PlayListEditorWidget.as::DISK_COLOR_RED_MIN
    private static readonly DISK_COLOR_RED_MIN: number = 130;
    // AS3: .../PlayListEditorWidget.as::DISK_COLOR_RED_RANGE
    private static readonly DISK_COLOR_RED_RANGE: number = 100;
    // AS3: .../PlayListEditorWidget.as::DISK_COLOR_GREEN_MIN
    private static readonly DISK_COLOR_GREEN_MIN: number = 130;
    // AS3: .../PlayListEditorWidget.as::DISK_COLOR_GREEN_RANGE
    private static readonly DISK_COLOR_GREEN_RANGE: number = 100;
    // AS3: .../PlayListEditorWidget.as::DISK_COLOR_BLUE_MIN
    private static readonly DISK_COLOR_BLUE_MIN: number = 130;
    // AS3: .../PlayListEditorWidget.as::DISK_COLOR_BLUE_RANGE
    private static readonly DISK_COLOR_BLUE_RANGE: number = 100;

    // AS3: .../PlayListEditorWidget.as::_catalog
    private _catalog: IHabboCatalog | null;

    // AS3: .../PlayListEditorWidget.as::_SafeStr_5128 (config)
    private _config: IHabboConfigurationManager | null;

    // AS3: .../PlayListEditorWidget.as::_soundManager
    private _soundManager: IHabboSoundManager | null;

    // AS3: .../PlayListEditorWidget.as::_SafeStr_4565 (the main window handler)
    private _mainWindowHandler: MainWindowHandler | null;

    // AS3: .../PlayListEditorWidget.as::_SafeStr_6628 (furniId)
    private _furniId: number = 0;

    // AS3: .../PlayListEditorWidget.as::PlayListEditorWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        soundManager: IHabboSoundManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        config: IHabboConfigurationManager | null,
        catalog: IHabboCatalog | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._soundManager = soundManager;
        this._config = config;
        this._catalog = catalog;
        this._mainWindowHandler = null;
    }

    // AS3: .../PlayListEditorWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._mainWindowHandler)
        {
            this._mainWindowHandler.destroy();
            this._mainWindowHandler = null;
        }

        this._soundManager = null;

        super.dispose();
    }

    // AS3: .../PlayListEditorWidget.as::get mainWindow()
    override get mainWindow(): IWindow | null
    {
        if(this._mainWindowHandler === null) return null;

        return this._mainWindowHandler.window;
    }

    // AS3: .../PlayListEditorWidget.as::registerUpdateEvents()
    // TS deviation: AS3 registers on a Flash IEventDispatcher passed in; this port's dispatcher is
    // the desktop's EventEmitter, and `.on()`/`.off()` are the AS3 add/removeEventListener pair.
    override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        super.registerUpdateEvents(dispatcher);

        dispatcher.on(RoomWidgetPlayListEditorEvent.SHOW_PLAYLIST_EDITOR, this.onShowPlayListEditorEvent);
        dispatcher.on(RoomWidgetPlayListEditorEvent.HIDE_PLAYLIST_EDITOR, this.onHidePlayListEditorEvent);
        dispatcher.on(RoomWidgetPlayListEditorEvent.INVENTORY_UPDATED, this.onInventoryUpdatedEvent);
        dispatcher.on(RoomWidgetPlayListEditorEvent.SONG_DISK_INVENTORY_UPDATED, this.onSongDiskInventoryUpdatedEvent);
        dispatcher.on(RoomWidgetPlayListEditorEvent.PLAY_LIST_UPDATED, this.onPlayListUpdatedEvent);
        dispatcher.on(RoomWidgetPlayListEditorEvent.PLAY_LIST_FULL, this.onPlayListFullEvent);

        const onNowPlaying = this.onNowPlayingChangedEvent;

        dispatcher.on(RoomWidgetPlayListEditorNowPlayingEvent.NOW_PLAYING_SONG_CHANGED, onNowPlaying);
        dispatcher.on(RoomWidgetPlayListEditorNowPlayingEvent.USER_PLAY_SONG, onNowPlaying);
        dispatcher.on(RoomWidgetPlayListEditorNowPlayingEvent.USER_STOP_SONG, onNowPlaying);
    }

    // AS3: .../PlayListEditorWidget.as::unregisterUpdateEvents()
    override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        dispatcher.off(RoomWidgetPlayListEditorEvent.SHOW_PLAYLIST_EDITOR, this.onShowPlayListEditorEvent);
        dispatcher.off(RoomWidgetPlayListEditorEvent.HIDE_PLAYLIST_EDITOR, this.onHidePlayListEditorEvent);
        dispatcher.off(RoomWidgetPlayListEditorEvent.INVENTORY_UPDATED, this.onInventoryUpdatedEvent);
        dispatcher.off(RoomWidgetPlayListEditorEvent.SONG_DISK_INVENTORY_UPDATED, this.onSongDiskInventoryUpdatedEvent);
        dispatcher.off(RoomWidgetPlayListEditorEvent.PLAY_LIST_UPDATED, this.onPlayListUpdatedEvent);
        dispatcher.off(RoomWidgetPlayListEditorEvent.PLAY_LIST_FULL, this.onPlayListFullEvent);

        const onNowPlaying = this.onNowPlayingChangedEvent;

        dispatcher.off(RoomWidgetPlayListEditorNowPlayingEvent.NOW_PLAYING_SONG_CHANGED, onNowPlaying);
        dispatcher.off(RoomWidgetPlayListEditorNowPlayingEvent.USER_PLAY_SONG, onNowPlaying);
        dispatcher.off(RoomWidgetPlayListEditorNowPlayingEvent.USER_STOP_SONG, onNowPlaying);
    }

    // AS3: .../PlayListEditorWidget.as::get mainWindowHandler()
    get mainWindowHandler(): MainWindowHandler | null
    {
        return this._mainWindowHandler;
    }

    // AS3: .../PlayListEditorWidget.as::get soundManager()
    // TS-only: no AS3 counterpart — the views under this widget need the sound manager to reach
    // `musicController`, and AS3 gets there through the widget's private field directly (same
    // package). This exposes the same reference without making the field itself public.
    get soundManager(): IHabboSoundManager | null
    {
        return this._soundManager;
    }

    // AS3: .../PlayListEditorWidget.as::getDiskColorTransformFromSongData()
    getDiskColorTransformFromSongData(songData: string): IDiskColorTint
    {
        let red = 0;
        let green = 0;
        let blue = 0;

        for(let i = 0; i < songData.length; i++)
        {
            const value = songData.charCodeAt(i) * 37;

            switch(i % 3)
            {
                case 0:
                    red += value;
                    break;
                case 1:
                    green += value;
                    break;
                case 2:
                    blue += value;
                    break;
            }
        }

        red = (red % PlayListEditorWidget.DISK_COLOR_RED_RANGE) + PlayListEditorWidget.DISK_COLOR_RED_MIN;
        green = (green % PlayListEditorWidget.DISK_COLOR_GREEN_RANGE) + PlayListEditorWidget.DISK_COLOR_GREEN_MIN;
        blue = (blue % PlayListEditorWidget.DISK_COLOR_BLUE_RANGE) + PlayListEditorWidget.DISK_COLOR_BLUE_MIN;

        return {red, green, blue};
    }

    // AS3: .../PlayListEditorWidget.as::sendAddToPlayListMessage()
    sendAddToPlayListMessage(diskId: number): void
    {
        const playList = this._soundManager?.musicController?.getRoomItemPlaylist() ?? null;

        if(playList === null) return;

        const message = new RoomWidgetPlayListModificationMessage(
            RoomWidgetPlayListModificationMessage.ADD_TO_PLAYLIST, playList.length, diskId
        );

        this.messageListener?.processWidgetMessage(message);
    }

    // AS3: .../PlayListEditorWidget.as::sendRemoveFromPlayListMessage()
    sendRemoveFromPlayListMessage(slotNumber: number): void
    {
        const message = new RoomWidgetPlayListModificationMessage(
            RoomWidgetPlayListModificationMessage.REMOVE_FROM_PLAYLIST, slotNumber
        );

        this.messageListener?.processWidgetMessage(message);
    }

    // AS3: .../PlayListEditorWidget.as::sendTogglePlayPauseStateMessage()
    sendTogglePlayPauseStateMessage(): void
    {
        const editorView = this._mainWindowHandler?.playListEditorView ?? null;
        const position = editorView !== null && editorView.selectedItemIndex !== -1 ? editorView.selectedItemIndex : 0;
        const message = new RoomWidgetPlayListPlayStateMessage(
            RoomWidgetPlayListPlayStateMessage.TOGGLE_PLAY_PAUSE, this._furniId, position
        );

        this.messageListener?.processWidgetMessage(message);
    }

    // AS3: .../PlayListEditorWidget.as::playUserSong()
    playUserSong(songId: number): void
    {
        const musicController = this._soundManager?.musicController ?? null;

        if(musicController === null) return;

        const roomSongId = musicController.getSongIdPlayingAtPriority(0);

        if(roomSongId !== -1)
        {
            const roomSong = musicController.getSongInfo(roomSongId);

            if(roomSong?.soundObject) roomSong.soundObject.fadeOutSeconds = 0;
        }

        musicController.playSong(songId, 2, 0, 0, 0, 0);
    }

    // AS3: .../PlayListEditorWidget.as::stopUserSong()
    stopUserSong(): void
    {
        this._soundManager?.musicController?.stop(2);
    }

    /**
     * AS3 clones the cached `BitmapData` because several callers own and later dispose their copy
     * (the disk-tint path, for one). This port's bitmap assets are shared, immutable textures —
     * every other ported caller of `asset.content` reads it the same way, un-cloned — so this
     * hands back the cached reference directly. `tintDiskBitmap()` is the one place that still
     * needs an owned copy, and it makes its own via canvas rather than mutating this one.
     */
    // AS3: .../PlayListEditorWidget.as::getImageGalleryAssetBitmap()
    getImageGalleryAssetBitmap(assetName: string): ImageBitmap | null
    {
        const asset = this.assets?.getAssetByName(assetName) ?? null;

        if(!asset) return null;

        return (asset.content as ImageBitmap | null) ?? null;
    }

    // AS3: .../PlayListEditorWidget.as::retrieveWidgetImage()
    retrieveWidgetImage(assetName: string): void
    {
        const baseUrl = this._config?.getProperty('image.library.playlist.url') ?? '';
        const url = `${baseUrl}${assetName}.gif`;

        log.debug(`[PlayListEditorWidget] : ${url}`);

        const loader = this.assets?.loadAssetFromFile(assetName, url, 'image/gif') ?? null;

        // The struct's dispatcher always fires on the fixed 'event' channel (see
        // AssetLoaderStruct.dispatchEvent()) with the real type on the payload — not on a channel
        // named after the type, the way AS3's own addEventListener("AssetLoaderEventComplete", ...)
        // reads. This is the idiom this port's other asset-loader callers use correctly (see
        // LocalizationCatalogWidget.retrievePreviewAsset()); addEventListener(type, ...) here would
        // never fire.
        loader?.events.on('event', (event: AssetLoaderEvent) =>
        {
            if(event.type === AssetLoaderEvent.COMPLETE) this.onWidgetImageReady(assetName);
        });
    }

    // AS3: .../PlayListEditorWidget.as::openSongDiskShopCataloguePage()
    openSongDiskShopCataloguePage(): void
    {
        const message = new RoomWidgetPlayListUserActionMessage(RoomWidgetPlayListUserActionMessage.OPEN_CATALOGUE_BUTTON_PRESSED);

        this.messageListener?.processWidgetMessage(message);

        this._catalog?.openCatalogPage('trax_songs');
    }

    // AS3: .../PlayListEditorWidget.as::alertPlayListFull()
    alertPlayListFull(): void
    {
        this.windowManager.alert(
            '${playlist.editor.alert.playlist.full.title}', '${playlist.editor.alert.playlist.full}', 0,
            (dialog) => dialog.dispose()
        );
    }

    // AS3: .../PlayListEditorWidget.as::onShowPlayListEditorEvent()
    private onShowPlayListEditorEvent = (event: RoomWidgetPlayListEditorEvent): void =>
    {
        this._furniId = event.furniId;

        if(!this._mainWindowHandler)
        {
            this._mainWindowHandler = new MainWindowHandler(this, this._soundManager?.musicController ?? null);
            this._mainWindowHandler.window.visible = false;
        }

        if(!this._mainWindowHandler.window.visible)
        {
            this._mainWindowHandler.show();

            const musicController = this._soundManager?.musicController ?? null;

            musicController?.requestUserSongDisks();
            musicController?.getRoomItemPlaylist()?.requestPlayList();
        }
    };

    // AS3: .../PlayListEditorWidget.as::onHidePlayListEditorEvent()
    private onHidePlayListEditorEvent = (_event: RoomWidgetPlayListEditorEvent): void =>
    {
        if(this._mainWindowHandler?.window.visible)
        {
            this._mainWindowHandler.hide();
        }
    };

    // AS3: .../PlayListEditorWidget.as::onInventoryUpdatedEvent()
    private onInventoryUpdatedEvent = (_event: RoomWidgetPlayListEditorEvent): void =>
    {
        if(!this._mainWindowHandler) return;

        if(this._mainWindowHandler.window.visible)
        {
            this._soundManager?.musicController?.requestUserSongDisks();
        }
    };

    // AS3: .../PlayListEditorWidget.as::onWidgetImageReady()
    private onWidgetImageReady(assetName: string): void
    {
        this._mainWindowHandler?.refreshLoadableAsset(assetName);
    }

    // AS3: .../PlayListEditorWidget.as::onSongDiskInventoryUpdatedEvent()
    private onSongDiskInventoryUpdatedEvent = (_event: RoomWidgetPlayListEditorEvent): void =>
    {
        this._mainWindowHandler?.onSongDiskInventoryReceived();
    };

    // AS3: .../PlayListEditorWidget.as::onPlayListUpdatedEvent()
    private onPlayListUpdatedEvent = (_event: RoomWidgetPlayListEditorEvent): void =>
    {
        this._mainWindowHandler?.onPlayListUpdated();
    };

    // AS3: .../PlayListEditorWidget.as::onPlayListFullEvent()
    private onPlayListFullEvent = (_event: RoomWidgetPlayListEditorEvent): void =>
    {
        this.alertPlayListFull();
    };

    // AS3: .../PlayListEditorWidget.as::onNowPlayingChangedEvent()
    private onNowPlayingChangedEvent = (event: RoomWidgetPlayListEditorNowPlayingEvent): void =>
    {
        this._mainWindowHandler?.onNowPlayingChanged(event);
    };
}
