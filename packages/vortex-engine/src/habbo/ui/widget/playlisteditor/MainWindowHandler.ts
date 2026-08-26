/**
 * MainWindowHandler — builds and owns the playlist editor's main window: the two bordered panes
 * (my music / playlist), their scrollbars, and the four sub-views layered into them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/MainWindowHandler.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IScrollbarWindow} from '@core/window/components/IScrollbarWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboMusicController} from '@habbo/sound/IHabboMusicController';
import {RoomWidgetPlayListEditorNowPlayingEvent} from '@habbo/ui/widget/events/RoomWidgetPlayListEditorNowPlayingEvent';
import type {PlayListEditorWidget} from './PlayListEditorWidget';
import {MusicInventoryGridView} from './MusicInventoryGridView';
import {PlayListEditorItemListView} from './PlayListEditorItemListView';
import {MusicInventoryStatusView} from './MusicInventoryStatusView';
import {PlayListStatusView} from './PlayListStatusView';

export class MainWindowHandler
{
    // AS3: .../MainWindowHandler.as::SHOW_BUY_MORE_MUSIC_DISK_COUNT
    private static readonly SHOW_BUY_MORE_MUSIC_DISK_COUNT: number = 6;

    // AS3: .../MainWindowHandler.as::MY_MUSIC_SHOW_SCROLLBAR_ITEM_COUNT_LIMIT
    private static readonly MY_MUSIC_SHOW_SCROLLBAR_ITEM_COUNT_LIMIT: number = 9;

    // AS3: .../MainWindowHandler.as::PLAYLIST_SHOW_SCROLLBAR_ITEM_COUNT_LIMIT
    private static readonly PLAYLIST_SHOW_SCROLLBAR_ITEM_COUNT_LIMIT: number = 5;

    // AS3: .../MainWindowHandler.as::_SafeStr_4549 (the widget)
    private _widget: PlayListEditorWidget | null;

    // AS3: .../MainWindowHandler.as::_SafeStr_5008 (the music controller)
    private _musicController: IHabboMusicController | null;

    // AS3: .../MainWindowHandler.as::_SafeStr_4565 (the window)
    private _window: IWindowContainer | null = null;

    // AS3: .../MainWindowHandler.as::_SafeStr_6786 (my_music_border)
    private _myMusicBorder: IWindowContainer | null = null;

    // AS3: .../MainWindowHandler.as::_SafeStr_6862 (playlist_border)
    private _playlistBorder: IWindowContainer | null = null;

    // AS3: .../MainWindowHandler.as::_SafeStr_5586 (musicInventoryView)
    private _musicInventoryView: MusicInventoryGridView | null = null;

    // AS3: .../MainWindowHandler.as::_SafeStr_5987 (playListEditorView)
    private _playListEditorView: PlayListEditorItemListView | null = null;

    // AS3: .../MainWindowHandler.as::_SafeStr_4990 (musicInventoryStatusView)
    private _musicInventoryStatusView: MusicInventoryStatusView | null = null;

    // AS3: .../MainWindowHandler.as::_SafeStr_5162 (playListStatusView)
    private _playListStatusView: PlayListStatusView | null = null;

    // AS3: .../MainWindowHandler.as::_SafeStr_8757 (music_inventory_scrollbar)
    private _musicInventoryScrollbar: IScrollbarWindow | null = null;

    // AS3: .../MainWindowHandler.as::_SafeStr_8504 (playlist_scrollbar)
    private _playlistScrollbar: IScrollbarWindow | null = null;

    // AS3: .../MainWindowHandler.as::MainWindowHandler()
    constructor(widget: PlayListEditorWidget, musicController: IHabboMusicController | null)
    {
        this._widget = widget;
        this._musicController = musicController;

        for(const assetName of [
            'title_mymusic', 'title_playlist', 'background_preview_playing', 'background_get_more_music', 'background_add_songs'
        ])
        {
            const bitmap = widget.getImageGalleryAssetBitmap(assetName);

            // AS3 disposes its own clone here, since getImageGalleryAssetBitmap() clones the
            // BitmapData there. This port's version returns the shared, un-cloned asset content
            // (see its own doc comment) — there is nothing to dispose, only "does it already
            // exist" matters.
            if(bitmap === null) widget.retrieveWidgetImage(assetName);
        }

        this.createWindow();

        this._musicInventoryView = new MusicInventoryGridView(widget, this.getMusicInventoryGrid(), musicController);
        this._playListEditorView = new PlayListEditorItemListView(widget, this.getPlayListEditorItemList());
        this._musicInventoryStatusView = new MusicInventoryStatusView(widget, this.getMusicInventoryStatusContainer());
        this._playListStatusView = new PlayListStatusView(widget, this.getPlayListStatusContainer());

        this.refreshLoadableAsset();
    }

    // AS3: .../MainWindowHandler.as::get window()
    get window(): IWindow
    {
        return this._window as unknown as IWindow;
    }

    // AS3: .../MainWindowHandler.as::get musicInventoryView()
    get musicInventoryView(): MusicInventoryGridView | null
    {
        return this._musicInventoryView;
    }

    // AS3: .../MainWindowHandler.as::get playListEditorView()
    get playListEditorView(): PlayListEditorItemListView | null
    {
        return this._playListEditorView;
    }

    // AS3: .../MainWindowHandler.as::destroy()
    destroy(): void
    {
        if(this._musicController)
        {
            this._musicController.stop(2);
            this._musicController = null;
        }

        if(this._musicInventoryView)
        {
            this._musicInventoryView.destroy();
            this._musicInventoryView = null;
        }

        if(this._playListEditorView)
        {
            this._playListEditorView.destroy();
            this._playListEditorView = null;
        }

        if(this._playListStatusView)
        {
            this._playListStatusView.destroy();
            this._playListStatusView = null;
        }

        if(this._musicInventoryStatusView)
        {
            this._musicInventoryStatusView.destroy();
            this._musicInventoryStatusView = null;
        }

        this._window?.destroy();
        this._window = null;
    }

    // AS3: .../MainWindowHandler.as::hide()
    hide(): void
    {
        if(this._window) this._window.visible = false;

        this._widget?.stopUserSong();
    }

    // AS3: .../MainWindowHandler.as::show()
    show(): void
    {
        this._musicController?.requestUserSongDisks();

        const playList = this._musicController?.getRoomItemPlaylist() ?? null;

        if(playList !== null)
        {
            playList.requestPlayList();
            this.selectPlayListStatusViewByFurniPlayListState();
        }

        if(this._window) this._window.visible = true;
    }

    // AS3: .../MainWindowHandler.as::refreshLoadableAsset()
    refreshLoadableAsset(assetName: string = ''): void
    {
        if(assetName === '' || assetName === 'title_mymusic')
        {
            this.assignWindowBitmapByAsset(this._myMusicBorder, 'music_inventory_splash_image', 'title_mymusic');
        }

        if(assetName === '' || assetName === 'title_playlist')
        {
            this.assignWindowBitmapByAsset(this._playlistBorder, 'playlist_editor_splash_image', 'title_playlist');
        }

        if(assetName === '' || assetName === 'background_preview_playing')
        {
            this._musicInventoryStatusView?.setPreviewPlayingBackgroundImage(
                this._widget?.getImageGalleryAssetBitmap('background_preview_playing') ?? null
            );
        }

        if(assetName === '' || assetName === 'background_get_more_music')
        {
            this._musicInventoryStatusView?.setGetMoreMusicBackgroundImage(
                this._widget?.getImageGalleryAssetBitmap('background_get_more_music') ?? null
            );
        }

        if((assetName === '' || assetName === 'background_add_songs') && this._playListStatusView)
        {
            this._playListStatusView.addSongsBackgroundImage = this._widget?.getImageGalleryAssetBitmap('background_add_songs') ?? null;
        }
    }

    // AS3: .../MainWindowHandler.as::assignWindowBitmapByAsset()
    private assignWindowBitmapByAsset(container: IWindowContainer | null, elementName: string, assetName: string): void
    {
        const target = container?.getChildByName(elementName) as IBitmapWrapperWindow | null;

        if(!target) return;

        const bitmap = this._widget?.getImageGalleryAssetBitmap(assetName) ?? null;

        if(bitmap !== null)
        {
            target.bitmap = bitmap;
            target.width = bitmap.width;
            target.height = bitmap.height;
        }
    }

    // AS3: .../MainWindowHandler.as::createWindow()
    private createWindow(): void
    {
        if(!this._widget) return;

        const asset = this._widget.assets?.getAssetByName('playlisteditor_main_window') ?? null;
        const built = this._widget.windowManager.buildFromXML(asset?.content as unknown as string) as IWindowContainer | null;

        if(built === null) throw new Error('Failed to construct window from XML!');

        this._window = built;
        this._window.position = {x: 80, y: 0};

        const contentArea = this._window.getChildByName('content_area') as IWindowContainer | null;

        if(contentArea === null) throw new Error("Window is missing 'content_area' element");

        this._myMusicBorder = contentArea.getChildByName('my_music_border') as IWindowContainer | null;
        this._playlistBorder = contentArea.getChildByName('playlist_border') as IWindowContainer | null;

        if(this._myMusicBorder === null) throw new Error("Window content area is missing 'my_music_border' window element");
        if(this._playlistBorder === null) throw new Error("Window content area is missing 'playlist_border' window element");

        this._musicInventoryScrollbar = this._myMusicBorder.getChildByName('music_inventory_scrollbar') as IScrollbarWindow | null;
        this._playlistScrollbar = this._playlistBorder.getChildByName('playlist_scrollbar') as IScrollbarWindow | null;

        if(this._musicInventoryScrollbar === null)
        {
            throw new Error("Window content area is missing 'music_inventory_scrollbar' window element");
        }

        if(this._playlistScrollbar === null)
        {
            throw new Error("Window content area is missing 'playlist_scrollbar' window element");
        }

        this._window.findChildByTag('close')?.addEventListener('WME_CLICK', this.onClose);
    }

    // AS3: .../MainWindowHandler.as::getMusicInventoryGrid()
    private getMusicInventoryGrid(): IItemGridWindow | null
    {
        return (this._myMusicBorder?.getChildByName('music_inventory_itemgrid') as IItemGridWindow | null) ?? null;
    }

    // AS3: .../MainWindowHandler.as::getPlayListEditorItemList()
    private getPlayListEditorItemList(): IItemListWindow | null
    {
        return (this._playlistBorder?.getChildByName('playlist_editor_itemlist') as IItemListWindow | null) ?? null;
    }

    // AS3: .../MainWindowHandler.as::getMusicInventoryStatusContainer()
    private getMusicInventoryStatusContainer(): IWindowContainer | null
    {
        return (this._myMusicBorder?.getChildByName('preview_play_container') as IWindowContainer | null) ?? null;
    }

    // AS3: .../MainWindowHandler.as::getPlayListStatusContainer()
    private getPlayListStatusContainer(): IWindowContainer | null
    {
        return (this._playlistBorder?.getChildByName('now_playing_container') as IWindowContainer | null) ?? null;
    }

    // AS3: .../MainWindowHandler.as::selectPlayListStatusViewByFurniPlayListState()
    private selectPlayListStatusViewByFurniPlayListState(): void
    {
        const playList = this._musicController?.getRoomItemPlaylist() ?? null;

        if(playList === null) return;

        if(playList.isPlaying)
        {
            this._playListStatusView?.selectView(PlayListStatusView.NOW_PLAYING);
        }
        else if(playList.length > 0)
        {
            this._playListStatusView?.selectView(PlayListStatusView.START_PLAYBACK);
        }
        else
        {
            this._playListStatusView?.selectView(PlayListStatusView.ADD_SONGS);
        }
    }

    // AS3: .../MainWindowHandler.as::selectMusicStatusViewByMusicState()
    private selectMusicStatusViewByMusicState(): void
    {
        if(this.isPreviewPlaying())
        {
            this._musicInventoryStatusView?.show();
            this._musicInventoryStatusView?.selectView(MusicInventoryStatusView.PREVIEW_PLAYING);
        }
        else if((this._musicController?.getSongDiskInventorySize() ?? 0) <= MainWindowHandler.SHOW_BUY_MORE_MUSIC_DISK_COUNT)
        {
            this._musicInventoryStatusView?.show();
            this._musicInventoryStatusView?.selectView(MusicInventoryStatusView.BUY_MORE);
        }
        else
        {
            this._musicInventoryStatusView?.hide();
        }
    }

    // AS3: .../MainWindowHandler.as::updatePlaylistEditorView()
    private updatePlaylistEditorView(): void
    {
        const playList = this._musicController?.getRoomItemPlaylist() ?? null;
        const entries = [];
        let playPosition = -1;

        if(playList !== null)
        {
            for(let i = 0; i < playList.length; i++)
            {
                const entry = playList.getEntry(i);

                if(entry !== null) entries.push(entry);
            }

            playPosition = playList.playPosition;
        }

        this._playListEditorView?.refresh(entries, playPosition);
    }

    // AS3: .../MainWindowHandler.as::onPlayListUpdated()
    onPlayListUpdated(): void
    {
        this.updatePlaylistEditorView();
        this.selectPlayListStatusViewByFurniPlayListState();

        const playList = this._musicController?.getRoomItemPlaylist() ?? null;

        if(playList === null) return;

        const nowPlayingSongId = playList.nowPlayingSongId;

        if(nowPlayingSongId !== -1 && this._playListStatusView)
        {
            // AS3 does not null-check getSongInfo() here; kept defensive rather than throwing if
            // the song's metadata has not arrived yet.
            const songInfo = this._musicController?.getSongInfo(nowPlayingSongId) ?? null;

            this._playListStatusView.nowPlayingTrackName = songInfo?.name ?? '';
            this._playListStatusView.nowPlayingAuthorName = songInfo?.creator ?? '';
        }

        if(this._playlistScrollbar) this._playlistScrollbar.visible = playList.length > MainWindowHandler.PLAYLIST_SHOW_SCROLLBAR_ITEM_COUNT_LIMIT;
    }

    // AS3: .../MainWindowHandler.as::onSongDiskInventoryReceived()
    onSongDiskInventoryReceived(): void
    {
        this._musicInventoryView?.refresh();
        this.selectMusicStatusViewByMusicState();

        if(this._musicInventoryScrollbar && this._musicInventoryView)
        {
            this._musicInventoryScrollbar.visible = this._musicInventoryView.itemCount > MainWindowHandler.MY_MUSIC_SHOW_SCROLLBAR_ITEM_COUNT_LIMIT;
        }
    }

    // AS3: .../MainWindowHandler.as::onNowPlayingChanged()
    onNowPlayingChanged(event: RoomWidgetPlayListEditorNowPlayingEvent): void
    {
        switch(event.type)
        {
            case RoomWidgetPlayListEditorNowPlayingEvent.NOW_PLAYING_SONG_CHANGED:
            {
                this.selectPlayListStatusViewByFurniPlayListState();
                this._playListEditorView?.setItemIndexPlaying(event.position);

                if(event.id !== -1 && this._playListStatusView)
                {
                    const songInfo = this._musicController?.getSongInfo(event.id) ?? null;

                    this._playListStatusView.nowPlayingTrackName = songInfo?.name ?? '';
                    this._playListStatusView.nowPlayingAuthorName = songInfo?.creator ?? '';
                }

                break;
            }
            case RoomWidgetPlayListEditorNowPlayingEvent.USER_PLAY_SONG:
            {
                this._musicInventoryView?.setPreviewIconToPause();

                const songInfo = this._musicController?.getSongInfo(event.id) ?? null;

                if(this._musicInventoryStatusView)
                {
                    this._musicInventoryStatusView.songName = songInfo?.name ?? '';
                    this._musicInventoryStatusView.authorName = songInfo?.creator ?? '';
                }

                this.selectMusicStatusViewByMusicState();

                break;
            }
            case RoomWidgetPlayListEditorNowPlayingEvent.USER_STOP_SONG:
                this._musicInventoryView?.setPreviewIconToPlay();
                this.selectMusicStatusViewByMusicState();
                break;
        }
    }

    // AS3: .../MainWindowHandler.as::onClose()
    private onClose = (_event: WindowEvent): void =>
    {
        this.hide();
    };

    // AS3: .../MainWindowHandler.as::isPreviewPlaying()
    private isPreviewPlaying(): boolean
    {
        return (this._musicController?.getSongIdPlayingAtPriority(2) ?? -1) !== -1;
    }
}
