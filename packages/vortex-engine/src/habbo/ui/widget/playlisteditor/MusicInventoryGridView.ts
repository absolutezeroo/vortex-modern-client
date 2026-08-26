/**
 * MusicInventoryGridView — the "my music" grid: builds/refreshes one `MusicInventoryGridItem` per
 * owned disk, and routes their button/selection clicks back to the widget.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/MusicInventoryGridView.as
 */
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IWindow} from '@core/window/IWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboMusicController} from '@habbo/sound/IHabboMusicController';
import {SongInfoReceivedEvent} from '@habbo/sound/events/SongInfoReceivedEvent';
import type {PlayListEditorWidget} from './PlayListEditorWidget';
import type {IDiskColorTint} from './PlayListEditorWidget';
import {MusicInventoryGridItem} from './MusicInventoryGridItem';

export class MusicInventoryGridView
{
    // AS3: .../MusicInventoryGridView.as::_SafeStr_5008 (the music controller)
    private _musicController: IHabboMusicController | null;

    // AS3: .../MusicInventoryGridView.as::_SafeStr_5752 (the grid)
    private _grid: IItemGridWindow | null;

    // AS3: .../MusicInventoryGridView.as::_items
    private _items: OrderedMap<number, MusicInventoryGridItem> = new OrderedMap();

    // AS3: .../MusicInventoryGridView.as::_SafeStr_4549 (the widget)
    private _widget: PlayListEditorWidget | null;

    // AS3: .../MusicInventoryGridView.as::_SafeStr_4690 (the selected item)
    private _selectedItem: MusicInventoryGridItem | null = null;

    // AS3: .../MusicInventoryGridView.as::MusicInventoryGridView()
    constructor(widget: PlayListEditorWidget, grid: IItemGridWindow | null, musicController: IHabboMusicController | null)
    {
        this._musicController = musicController;
        this._grid = grid;
        this._widget = widget;

        this._musicController?.events.on(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, this.onSongInfoReceivedEvent);
    }

    // AS3: .../MusicInventoryGridView.as::get itemCount()
    get itemCount(): number
    {
        return this._items.length;
    }

    // AS3: .../MusicInventoryGridView.as::destroy()
    destroy(): void
    {
        if(this._grid !== null)
        {
            this._grid.destroyGridItems();
            this._grid = null;
        }

        this._musicController?.events.off(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, this.onSongInfoReceivedEvent);
        this._musicController = null;

        this._items.reset();

        this._selectedItem = null;
        this._widget = null;
    }

    // AS3: .../MusicInventoryGridView.as::refresh()
    refresh(): void
    {
        if(this._grid === null || this._widget === null || this._musicController === null) return;

        this._grid.removeGridItems();

        const previous = this._items;
        const remainingKeys = previous.getKeys();

        this._items = new OrderedMap();

        const size = this._musicController.getSongDiskInventorySize();

        for(let i = 0; i < size; i++)
        {
            const diskId = this._musicController.getSongDiskInventoryDiskId(i);
            const songId = this._musicController.getSongDiskInventorySongId(i);
            const songInfo = this._musicController.getSongInfo(songId);

            let trackName: string | null = null;
            let tint: IDiskColorTint | null = null;

            if(songInfo !== null)
            {
                trackName = songInfo.name;
                tint = this._widget.getDiskColorTransformFromSongData(songInfo.songData);
            }

            let item: MusicInventoryGridItem;
            const existingIndex = remainingKeys.indexOf(diskId);

            if(existingIndex === -1)
            {
                item = new MusicInventoryGridItem(this._widget, diskId, songId, trackName, tint);
            }
            else
            {
                item = previous.getValue(diskId) as MusicInventoryGridItem;
                remainingKeys.splice(existingIndex, 1);
            }

            item.window.procedure = this.gridItemEventProc;

            if(item.toPlayListButton !== null) item.toPlayListButton.procedure = this.gridItemEventProc;

            this._grid.addGridItem(item.window);
            this._items.add(diskId, item);
        }

        for(const key of remainingKeys)
        {
            const removed = previous.getValue(key) as MusicInventoryGridItem;

            removed.destroy();
            previous.remove(key);
        }
    }

    // AS3: .../MusicInventoryGridView.as::setPreviewIconToPause()
    setPreviewIconToPause(): void
    {
        if(this._selectedItem !== null) this._selectedItem.playButtonState = MusicInventoryGridItem.BUTTON_STATE_PAUSE;
    }

    // AS3: .../MusicInventoryGridView.as::setPreviewIconToPlay()
    setPreviewIconToPlay(): void
    {
        if(this._selectedItem !== null) this._selectedItem.playButtonState = MusicInventoryGridItem.BUTTON_STATE_PLAY;
    }

    // AS3: .../MusicInventoryGridView.as::deselectAny()
    deselectAny(): void
    {
        if(this._selectedItem !== null)
        {
            this._selectedItem.deselect();
            this._selectedItem = null;
        }
    }

    /**
     * AS3 reads the button name off the `window` procedure parameter and the grid index off
     * `event.window` — both name the same field in this port (see AvatarEditorGridView's own note
     * on the same idiom), so `window` alone is used throughout.
     */
    // AS3: .../MusicInventoryGridView.as::gridItemEventProc()
    private gridItemEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        const isDoubleClick = event.type === WindowMouseEvent.DOUBLE_CLICK;

        if(event.type !== WindowMouseEvent.CLICK && !isDoubleClick) return;

        if(window.name === 'button_to_playlist' || isDoubleClick)
        {
            if(this._selectedItem !== null)
            {
                const diskId = this._selectedItem.diskId;

                this._selectedItem.deselect();
                this.stopPreview();
                this._widget?.sendAddToPlayListMessage(diskId);
                this._selectedItem = null;
            }
        }
        else if(window.name === 'button_play_pause')
        {
            if(this._selectedItem?.playButtonState === MusicInventoryGridItem.BUTTON_STATE_PLAY)
            {
                this._selectedItem.playButtonState = MusicInventoryGridItem.BUTTON_STATE_DOWNLOAD;
                this._widget?.playUserSong(this._selectedItem.songId);
            }
            else
            {
                this.stopPreview();
            }
        }
        else
        {
            const index = this._grid?.getGridItemIndex(window) ?? -1;

            if(index !== -1)
            {
                const clicked = this._items.getWithIndex(index);

                if(clicked !== null && clicked !== this._selectedItem)
                {
                    this._selectedItem?.deselect();
                    this._selectedItem = clicked;
                    this._selectedItem.select();
                    this.stopPreview();
                }

                this._widget?.mainWindowHandler?.playListEditorView?.deselectAny();
            }
        }
    };

    // AS3: .../MusicInventoryGridView.as::stopPreview()
    private stopPreview(): void
    {
        this._widget?.stopUserSong();
        this.setPreviewIconToPlay();
    }

    // AS3: .../MusicInventoryGridView.as::onSongInfoReceivedEvent()
    private onSongInfoReceivedEvent = (event: SongInfoReceivedEvent): void =>
    {
        if(this._musicController === null) return;

        const songInfo = this._musicController.getSongInfo(event.id);

        if(songInfo === null) return;

        const trackName = songInfo.name;
        const tint = this._widget?.getDiskColorTransformFromSongData(songInfo.songData) ?? null;

        if(tint === null) return;

        // AS3 indexes `_items[param1.id]` — a *song* id — even though the map is keyed by disk id
        // everywhere else in this class. That only finds anything when a disk's id happens to equal
        // its song's id; kept as-is rather than "fixed" to key by song id, since nothing else here
        // does.
        const item = this._items.getValue(event.id);

        item?.update(event.id, trackName, tint);
    };
}
