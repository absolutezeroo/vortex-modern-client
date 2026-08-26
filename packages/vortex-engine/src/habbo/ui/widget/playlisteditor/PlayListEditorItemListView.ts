/**
 * PlayListEditorItemListView — the playlist list itself: builds/refreshes one `PlayListEditorItem`
 * per song, tracks which row is selected and which one is currently playing, and routes row/remove
 * clicks back to the widget.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/PlayListEditorItemListView.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ISongInfo} from '@habbo/sound/ISongInfo';
import type {PlayListEditorWidget} from './PlayListEditorWidget';
import {PlayListEditorItem} from './PlayListEditorItem';

export class PlayListEditorItemListView
{
    // AS3: .../PlayListEditorItemListView.as::_SafeStr_6111 (the list)
    private _list: IItemListWindow | null;

    // AS3: .../PlayListEditorItemListView.as::_items
    private _items: PlayListEditorItem[] | null = null;

    // AS3: .../PlayListEditorItemListView.as::_SafeStr_4549 (the widget)
    private _widget: PlayListEditorWidget | null;

    // AS3: .../PlayListEditorItemListView.as::_SafeStr_4690 (the selected item)
    private _selectedItem: PlayListEditorItem | null = null;

    // AS3: .../PlayListEditorItemListView.as::_SafeStr_5899 (selectedItemIndex)
    private _selectedItemIndex: number = -1;

    // AS3: .../PlayListEditorItemListView.as::_SafeStr_6838 (the currently-playing row index)
    private _playingIndex: number = -1;

    // AS3: .../PlayListEditorItemListView.as::PlayListEditorItemListView()
    constructor(widget: PlayListEditorWidget, list: IItemListWindow | null)
    {
        this._list = list;
        this._widget = widget;
    }

    // AS3: .../PlayListEditorItemListView.as::get selectedItemIndex()
    get selectedItemIndex(): number
    {
        return this._selectedItemIndex;
    }

    // AS3: .../PlayListEditorItemListView.as::destroy()
    destroy(): void
    {
        this._list?.destroyListItems();
    }

    // AS3: .../PlayListEditorItemListView.as::refresh()
    refresh(entries: ISongInfo[] | null, playPosition: number): void
    {
        if(this._list === null || entries === null || this._widget === null) return;

        this._playingIndex = -1;
        this._items = [];
        this._list.destroyListItems();

        for(const entry of entries)
        {
            const tint = this._widget.getDiskColorTransformFromSongData(entry.songData);
            const item = new PlayListEditorItem(this._widget, entry.name, entry.creator, tint);

            item.window.procedure = this.itemEventProc;

            if(item.removeButton !== null) item.removeButton.procedure = this.itemEventProc;

            this._list.addListItem(item.window);
            this._items.push(item);
        }

        this.setItemIndexPlaying(playPosition);
    }

    // AS3: .../PlayListEditorItemListView.as::setItemIndexPlaying()
    setItemIndexPlaying(index: number): void
    {
        if(this._items === null) return;

        if(index < 0)
        {
            for(const item of this._items) item.setIconState(PlayListEditorItem.ICON_STATE_NORMAL);

            return;
        }

        if(index >= this._items.length) return;

        if(this._playingIndex >= 0 && this._playingIndex < this._items.length)
        {
            this._items[this._playingIndex].setIconState(PlayListEditorItem.ICON_STATE_NORMAL);
        }

        this._items[index].setIconState(PlayListEditorItem.ICON_STATE_PLAYING);
        this._playingIndex = index;
    }

    // AS3: .../PlayListEditorItemListView.as::deselectAny()
    deselectAny(): void
    {
        if(this._selectedItem !== null)
        {
            this._selectedItem.deselect();
            this._selectedItem = null;
            this._selectedItemIndex = -1;
        }
    }

    /**
     * Unlike `MusicInventoryGridView.gridItemEventProc()`, this one re-selects (and re-calls
     * `select()` on) an already-selected row every time it is clicked again — AS3 has no
     * "already this one" guard here, and this port keeps that asymmetry.
     *
     * AS3's `else` branch also repeats the `name == "button_remove_from_playlist"` check that put
     * it in the outer `if` in the first place — dead by then, since reaching `else` already proved
     * it false. Dropped rather than ported as unreachable code.
     */
    // AS3: .../PlayListEditorItemListView.as::itemEventProc()
    private itemEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        const isDoubleClick = event.type === WindowMouseEvent.DOUBLE_CLICK;

        if(event.type !== WindowMouseEvent.CLICK && !isDoubleClick) return;

        if(window.name === 'button_remove_from_playlist' || isDoubleClick)
        {
            this._selectedItem?.deselect();

            if(this._selectedItemIndex > -1) this._widget?.sendRemoveFromPlayListMessage(this._selectedItemIndex);

            this._selectedItem = null;
            this._selectedItemIndex = -1;
        }
        else
        {
            this._selectedItem?.deselect();

            const index = this._list?.getListItemIndex(window) ?? -1;

            if(index !== -1)
            {
                this._selectedItemIndex = index;
                this._selectedItem = this._items?.[index] ?? null;
                this._selectedItem?.select();

                this._widget?.mainWindowHandler?.musicInventoryView?.deselectAny();
            }
        }
    };
}
