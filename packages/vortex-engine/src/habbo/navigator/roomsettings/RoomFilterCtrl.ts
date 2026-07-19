import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import {UpdateRoomFilterMessageComposer} from '@habbo/communication/messages/outgoing/room/settings/UpdateRoomFilterMessageComposer';
import {GetCustomRoomFilterMessageComposer} from '@habbo/communication/messages/outgoing/room/settings/GetCustomRoomFilterMessageComposer';

/**
 * Room word filter editor controller.
 * Manages the list of filtered words for a room.
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/RoomFilterCtrl.as
 */
export class RoomFilterCtrl implements IDisposable
{
    private _flatId: number = 0;
    private _navigator: IHabboTransitionalNavigator | null;
    private _selectedIndex: number = -1;
    private _window: IWindowContainer | null = null;
    private _badWords: string[] = [];
    private _listWindow: IItemListWindow | null = null;
    private _addWordInput: ITextFieldWindow | null = null;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
        this._badWords = [];
    }

    get disposed(): boolean
    {
        return this._navigator === null;
    }

    startRoomFilterEdit(flatId: number): void
    {
        if(!this._navigator) return;

        this._flatId = flatId;
        this._navigator.send(new GetCustomRoomFilterMessageComposer(flatId));
        this._refreshWindow();
    }

    onRoomFilterSettings(words: string[]): void
    {
        for(const word of words)
        {
            if(this._badWords.indexOf(word) === -1)
            {
                this._badWords.push(word);
            }
        }

        if(this._listWindow !== null)
        {
            this._listWindow.removeListItems();
            this._refreshBadWords();
        }
    }

    close(): void
    {
        this._flatId = 0;

        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    disposeWindow(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
            (this._window as unknown as { dispose(): void }).dispose();
            this._window = null;
        }

        if(this._listWindow !== null)
        {
            this._listWindow.removeListItems();
            (this._listWindow as unknown as { dispose(): void }).dispose();
            this._listWindow = null;
        }

        if(this._addWordInput !== null)
        {
            (this._addWordInput as unknown as { dispose(): void }).dispose();
            this._addWordInput = null;
        }

        this._badWords.length = 0;
    }

    dispose(): void
    {
        if(this.disposed) return;

        this.disposeWindow();
        this._navigator = null;
    }

    private _refreshWindow(): void
    {
        if(!this._navigator) return;

        if(this._navigator.data.enteredGuestRoom === null) return;

        this._prepareWindow();

        if(this._window !== null)
        {
            this._window.visible = true;
            (this._window as unknown as { invalidate(): void }).invalidate?.();
            (this._window as unknown as { activate(): void }).activate?.();
        }
    }

    private _prepareWindow(): void
    {
        if(this._window !== null) return;

        if(!this._navigator) return;

        const win = this._navigator.getXmlWindow('iro_room_filter_framed') as IWindowContainer | null;

        if(win === null) return;

        this._window = win;

        const removeBtn = win.findChildByName('badword_remove_btn');

        if(removeBtn !== null) removeBtn.addEventListener('WME_CLICK', this._onRemoveWordClick);

        const addBtn = win.findChildByName('badword_add_btn');

        if(addBtn !== null) addBtn.addEventListener('WME_CLICK', this._onAddWordClick);

        const closeBtn = win.findChildByTag('close');

        if(closeBtn !== null) closeBtn.addEventListener('WME_CLICK', this._onCloseButtonClick);

        this._addWordInput = win.findChildByName('roomfilter_addword_txt') as ITextFieldWindow | null;

        const listEl = win.findChildByName('badwords_itemlist');

        if(listEl !== null) this._listWindow = listEl as unknown as IItemListWindow;

        this._refreshBadWords();

        (win as unknown as { center(): void }).center?.();
    }

    private _refreshBadWords(): void
    {
        if(this._listWindow === null) return;

        this._listWindow.autoArrangeItems = false;

        let i = 0;

        while(true)
        {
            let entry = this._listWindow.getListItemAt(i) as IWindowContainer | null;

            if(entry === null)
            {
                if(this._badWords[i] === undefined) break;

                entry = this._getListEntry(i);
                this._listWindow.addListItem(entry as unknown as Parameters<typeof this._listWindow.addListItem>[0]);
            }

            if(this._badWords[i] !== undefined)
            {
                entry.color = this._getBgColor(i, false);
                this._refreshEntryDetails(entry, this._badWords[i]);
                entry.visible = true;
                entry.height = 20;
            }
            else
            {
                entry.height = 0;
                entry.visible = false;
            }

            i++;
        }

        this._listWindow.autoArrangeItems = true;
        (this._listWindow as unknown as { invalidate(): void }).invalidate?.();
    }

    private _refreshEntryDetails(entry: IWindowContainer, word: string): void
    {
        const txt = entry.findChildByName('badword_txt');

        if(txt !== null) txt.caption = word;
    }

    private _getListEntry(index: number): IWindowContainer
    {
        const entry = this._navigator!.getXmlWindow('ros_badword') as IWindowContainer;
        const bgRegion = entry.findChildByName('bg_region');

        if(bgRegion !== null)
        {
            bgRegion.addEventListener('WME_CLICK', this._onBgMouseClick);
            bgRegion.addEventListener('WME_OVER', this._onBgMouseOver);
            bgRegion.addEventListener('WME_OUT', this._onBgMouseOut);
        }

        entry.id = index;

        return entry;
    }

    private _getBgColor(index: number, highlighted: boolean): number
    {
        if(index === this._selectedIndex) return 0xFF9988D9;

        return highlighted ? 0xFFBBCCFF : (index % 2 !== 0 ? 0xFFFFFFFF : 0xFFEEEEE1);
    }

    private _refreshColorsAfterClick(): void
    {
        if(this._listWindow === null) return;

        for(let i = 0; i < this._badWords.length; i++)
        {
            const row = this._listWindow.getListItemAt(i) as IWindowContainer | null;

            if(row !== null) row.color = this._getBgColor(i, false);
        }
    }

    private _addBadWord(word: string): void
    {
        if(!this._navigator || !this._addWordInput) return;

        if(this._addWordInput.text.length > 0)
        {
            this._navigator.send(new UpdateRoomFilterMessageComposer(this._flatId, UpdateRoomFilterMessageComposer.ADD, word));
            this._navigator.send(new GetCustomRoomFilterMessageComposer(this._flatId));
            this._addWordInput.text = 'bobba';
        }
    }

    private _onCloseButtonClick = (_event: WindowEvent): void =>
    {
        this.disposeWindow();
    };

    private _onAddWordClick = (_event: WindowEvent): void =>
    {
        if(this._addWordInput !== null)
        {
            this._addBadWord(this._addWordInput.text);
        }
    };

    private _onRemoveWordClick = (_event: WindowEvent): void =>
    {
        if(this._selectedIndex < 0 || this._listWindow === null || !this._navigator) return;

        const entry = this._listWindow.getListItemAt(this._selectedIndex) as IWindowContainer | null;

        if(entry === null) return;

        const txt = entry.findChildByName('badword_txt');
        const word = txt !== null ? txt.caption : '';

        entry.height = 0;
        entry.visible = false;

        const idx = this._badWords.indexOf(word);

        if(idx >= 0) this._badWords.splice(idx, 1);

        this._navigator.send(new UpdateRoomFilterMessageComposer(this._flatId, UpdateRoomFilterMessageComposer.REMOVE, word));
    };

    private _onBgMouseClick = (event: WindowEvent): void =>
    {
        const target = event.target as IWindowContainer;
        this._selectedIndex = target.parent?.id ?? -1;
        this._refreshColorsAfterClick();
    };

    private _onBgMouseOver = (event: WindowEvent): void =>
    {
        const target = event.target as IWindowContainer;
        const row = target.parent as IWindowContainer | null;

        if(row !== null) row.color = this._getBgColor(-1, true);
    };

    private _onBgMouseOut = (event: WindowEvent): void =>
    {
        const target = event.target as IWindowContainer;
        const row = target.parent as IWindowContainer | null;

        if(row !== null) row.color = this._getBgColor(row.id, false);
    };
}
