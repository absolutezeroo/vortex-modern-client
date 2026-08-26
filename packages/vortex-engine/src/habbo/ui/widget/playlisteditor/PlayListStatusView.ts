/**
 * PlayListStatusView — the small status pane above the playlist: "add songs", "press play", or
 * "now playing" (with a pause button), swapped by `selectView()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/PlayListStatusView.as
 */
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {PlayListEditorWidget} from './PlayListEditorWidget';

export class PlayListStatusView
{
    // AS3: .../PlayListStatusView.as::ADD_SONGS
    static readonly ADD_SONGS: string = 'PLSV_ADD_SONGS';

    // AS3: .../PlayListStatusView.as::START_PLAYBACK
    static readonly START_PLAYBACK: string = 'PLSV_START_PLAYBACK';

    // AS3: .../PlayListStatusView.as::NOW_PLAYING
    static readonly NOW_PLAYING: string = 'PLSV_NOW_PLAYING';

    // AS3: .../PlayListStatusView.as::_container
    private _container: IWindowContainer | null;

    // AS3: .../PlayListStatusView.as::_windows
    private _windows: OrderedMap<string, IWindowContainer> = new OrderedMap();

    // AS3: .../PlayListStatusView.as::_SafeStr_4549 (the widget)
    private _widget: PlayListEditorWidget | null;

    // AS3: .../PlayListStatusView.as::_SafeStr_4612 (the currently selected view name)
    private _selectedView: string | null = null;

    // AS3: .../PlayListStatusView.as::PlayListStatusView()
    constructor(widget: PlayListEditorWidget, container: IWindowContainer | null)
    {
        this._container = container;
        this._widget = widget;

        this.createWindows();
    }

    // AS3: .../PlayListStatusView.as::destroy()
    destroy(): void
    {
        for(const window of this._windows.getValues()) window.destroy();
    }

    // AS3: .../PlayListStatusView.as::selectView()
    selectView(name: string): void
    {
        if(!this._container) return;

        this._container.removeChildAt(0);

        const view = this._windows.getValue(name);

        if(view !== null) this._container.addChildAt(view, 0);

        this._selectedView = name;
    }

    // AS3: .../PlayListStatusView.as::set nowPlayingTrackName()
    set nowPlayingTrackName(value: string)
    {
        if(this._selectedView !== PlayListStatusView.NOW_PLAYING) return;

        const view = this._windows.getValue(this._selectedView);
        const target = view?.getChildByName('now_playing_track_name') as ITextWindow | null;

        if(target !== null) target.text = value;
    }

    // AS3: .../PlayListStatusView.as::set nowPlayingAuthorName()
    set nowPlayingAuthorName(value: string)
    {
        if(this._selectedView !== PlayListStatusView.NOW_PLAYING) return;

        const view = this._windows.getValue(this._selectedView);
        const target = view?.getChildByName('now_playing_author_name') as ITextWindow | null;

        if(target !== null) target.text = value;
    }

    // AS3: .../PlayListStatusView.as::set addSongsBackgroundImage()
    set addSongsBackgroundImage(bitmap: ImageBitmap | null)
    {
        if(bitmap === null) return;

        const view = this._windows.getValue(PlayListStatusView.ADD_SONGS);
        const target = (view?.getChildByName('background_image') as IBitmapWrapperWindow | null) ?? null;

        if(target === null) return;

        target.bitmap = bitmap;
        target.width = bitmap.width;
        target.height = bitmap.height;
    }

    // AS3: .../PlayListStatusView.as::createWindows()
    private createWindows(): void
    {
        if(!this._widget) return;

        const addSongsAsset = this._widget.assets?.getAssetByName('playlisteditor_playlist_subwindow_add_songs') ?? null;
        const addSongsWindow = this._widget.windowManager.buildFromXML(addSongsAsset?.content as unknown as string) as IWindowContainer | null;

        if(addSongsWindow !== null) this._windows.add(PlayListStatusView.ADD_SONGS, addSongsWindow);

        const playNowAsset = this._widget.assets?.getAssetByName('playlisteditor_playlist_subwindow_play_now') ?? null;
        const playNowWindow = this._widget.windowManager.buildFromXML(playNowAsset?.content as unknown as string) as IWindowContainer | null;

        if(playNowWindow !== null)
        {
            this._windows.add(PlayListStatusView.START_PLAYBACK, playNowWindow);

            playNowWindow.getChildByName('play_now_button')?.addEventListener(WindowMouseEvent.CLICK, this.onPlayPauseClicked);
        }

        const nowPlayingAsset = this._widget.assets?.getAssetByName('playlisteditor_playlist_subwindow_nowplaying') ?? null;
        const nowPlayingWindow = this._widget.windowManager.buildFromXML(nowPlayingAsset?.content as unknown as string) as IWindowContainer | null;

        if(nowPlayingWindow !== null)
        {
            this._windows.add(PlayListStatusView.NOW_PLAYING, nowPlayingWindow);

            const pauseButton = nowPlayingWindow.getChildByName('button_pause') as IWindowContainer | null;

            pauseButton?.addEventListener(WindowMouseEvent.CLICK, this.onPlayPauseClicked);

            this.assignAssetToElement('icon_pause_large', pauseButton?.getChildByName('pause_image') as IBitmapWrapperWindow | null);
            this.assignAssetToElement('jb_icon_disc', nowPlayingWindow.getChildByName('song_name_icon_bitmap') as IBitmapWrapperWindow | null);
            this.assignAssetToElement('jb_icon_composer', nowPlayingWindow.getChildByName('author_name_icon_bitmap') as IBitmapWrapperWindow | null);
        }
    }

    // AS3: .../PlayListStatusView.as::assignAssetToElement()
    private assignAssetToElement(assetName: string, target: IBitmapWrapperWindow | null): void
    {
        const bitmap = (this._widget?.assets?.getAssetByName(assetName)?.content as ImageBitmap | null) ?? null;

        if(target !== null && bitmap !== null) target.bitmap = bitmap;
    }

    // AS3: .../PlayListStatusView.as::onPlayPauseClicked()
    private onPlayPauseClicked = (_event: WindowEvent): void =>
    {
        this._widget?.sendTogglePlayPauseStateMessage();
    };
}
