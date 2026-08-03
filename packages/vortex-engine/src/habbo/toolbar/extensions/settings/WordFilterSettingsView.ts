import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import {
    GetCustomFilterResultMessageEvent
} from '@habbo/communication/messages/incoming/preferences/GetCustomFilterResultMessageEvent';
import {
    ModifyCustomFilterResultMessageEvent
} from '@habbo/communication/messages/incoming/preferences/ModifyCustomFilterResultMessageEvent';
import type {
    GetCustomFilterResultMessageEventParser
} from '@habbo/communication/messages/parser/preferences/GetCustomFilterResultMessageEventParser';
import type {
    ModifyCustomFilterResultMessageEventParser
} from '@habbo/communication/messages/parser/preferences/ModifyCustomFilterResultMessageEventParser';
import {
    GetCustomFilterMessageComposer
} from '@habbo/communication/messages/outgoing/preferences/GetCustomFilterMessageComposer';
import {
    AddToCustomFilterMessageComposer
} from '@habbo/communication/messages/outgoing/preferences/AddToCustomFilterMessageComposer';
import {
    RemoveFromCustomFilterMessageComposer
} from '@habbo/communication/messages/outgoing/preferences/RemoveFromCustomFilterMessageComposer';
import type {HabboToolbar} from '../../HabboToolbar';

const log = Logger.getLogger('habbo.toolbar.extensions.settings.WordFilterSettingsView');

/**
 * WordFilterSettingsView
 *
 * The player's personal word filter: a list, a text field and add/remove buttons. Nothing
 * is applied locally — adding and removing both go to the server and the list only moves
 * when `ModifyCustomFilterResult` comes back, which is also what keeps two open clients
 * consistent.
 *
 * Unlike the other settings windows this one owns message events, so it registers them in
 * its constructor and drops them when it closes.
 *
 * **Server caveat, not visible in this file**: the three composers and two events here use
 * WIN63's own registry numbers. `vortex-emulator` names all five differently in
 * `Headers.cs` — with no verification comment — and carries no handler, parser or
 * serializer for any of them, so the whole feature is unimplemented server-side. The
 * button that opens this window is itself gated on `user.custom.filter.enabled`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/extensions/settings/WordFilterSettingsView.as
 */
export class WordFilterSettingsView
{
    // AS3: .../WordFilterSettingsView.as::_toolbar
    private _toolbar: HabboToolbar | null;

    /** Index of the row the player last clicked, or -1. Remove acts on this. */
    // AS3: .../WordFilterSettingsView.as::_SafeStr_4907
    private _selectedIndex: number = -1;

    // AS3: .../WordFilterSettingsView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../WordFilterSettingsView.as::_SafeStr_5075
    private _words: string[] = [];

    // AS3: .../WordFilterSettingsView.as::_SafeStr_5112
    private _wordList: IItemListWindow | null = null;

    // AS3: .../WordFilterSettingsView.as::_SafeStr_5867
    private _addWordInput: ITextFieldWindow | null = null;

    // AS3: .../WordFilterSettingsView.as::_messageEvents
    private _messageEvents: IMessageEvent[] | null = [];

    // AS3: .../WordFilterSettingsView.as::WordFilterSettingsView()
    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        this.addMessageEvent(new ModifyCustomFilterResultMessageEvent(this.onModifyCustomFilter));
        this.addMessageEvent(new GetCustomFilterResultMessageEvent(this.onCustomWords));

        this.prepareWindow();
    }

    // AS3: .../WordFilterSettingsView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../WordFilterSettingsView.as::get disposed()
    get disposed(): boolean
    {
        return this._toolbar === null;
    }

    // AS3: .../WordFilterSettingsView.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null) return;

        const asset = this._toolbar?.assets?.getAssetByName('custom_word_filter_settings_xml') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn('Missing layout "custom_word_filter_settings_xml" - the word filter cannot open');

            return;
        }

        this._window = this._toolbar?.windowManager?.buildFromXML(
            asset.content as unknown as string
        ) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.findChildByName('remove_btn')?.addEventListener('WME_CLICK', this.onRemoveWordClick);
        this._window.findChildByName('add_btn')?.addEventListener('WME_CLICK', this.onAddWordClick);
        this._window.findChildByName('back_btn')?.addEventListener('WME_CLICK', this.onCloseButtonClick);

        this._addWordInput = this._window.findChildByName('add_word_input') as unknown as ITextFieldWindow | null;
        this._wordList = this._window.findChildByName('wordlist') as unknown as IItemListWindow | null;

        this._toolbar?.connection?.send(new GetCustomFilterMessageComposer());
    }

    /** Add and remove share one reply; the result code says which happened. */
    // AS3: .../WordFilterSettingsView.as::onModifyCustomFilter()
    private onModifyCustomFilter = (event: IMessageEvent): void =>
    {
        const parser = (event as ModifyCustomFilterResultMessageEvent)
            .getParser<ModifyCustomFilterResultMessageEventParser>();

        if(parser.result === ModifyCustomFilterResultMessageEvent.RESULT_ADDED)
        {
            if(this._words.indexOf(parser.word) === -1) this._words.push(parser.word);
        }
        else if(parser.result === ModifyCustomFilterResultMessageEvent.RESULT_REMOVED)
        {
            const index = this._words.indexOf(parser.word);

            if(index !== -1) this._words.splice(index, 1);
        }

        this.refreshBadWords();
    };

    /** Merged rather than replaced, so a word added while the list loaded is not lost. */
    // AS3: .../WordFilterSettingsView.as::onCustomWords()
    private onCustomWords = (event: IMessageEvent): void =>
    {
        const parser = (event as GetCustomFilterResultMessageEvent)
            .getParser<GetCustomFilterResultMessageEventParser>();
        const words = parser.words;

        for(const word of words)
        {
            if(this._words.indexOf(word) === -1) this._words.push(word);
        }

        if(this._wordList !== null)
        {
            this._wordList.removeListItems();
            this.refreshBadWords();
        }
    };

    /**
     * Rows are built once and kept: a row past the end of the list collapses to zero
     * height instead of being removed, which is why the loop runs until it finds neither
     * an existing row nor a word for that index.
     */
    // AS3: .../WordFilterSettingsView.as::refreshBadWords()
    private refreshBadWords(): void
    {
        const list = this._wordList;

        if(list === null) return;

        list.autoArrangeItems = false;

        let index = 0;

        for(;;)
        {
            let row = list.getListItemAt(index) as IWindowContainer | null;

            if(row === null || row === undefined)
            {
                if(this._words[index] === undefined) break;

                row = this.getListEntry(index);

                if(row === null) break;

                list.addListItem(row);
            }

            if(this._words[index] !== undefined)
            {
                row.color = this.getBgColor(index, false);
                this.refreshEntryDetails(row, this._words[index]);
                row.visible = true;
                row.height = 20;
            }
            else
            {
                row.height = 0;
                row.visible = false;
            }

            index++;
        }

        list.autoArrangeItems = true;
        list.invalidate();
    }

    // AS3: .../WordFilterSettingsView.as::refreshEntryDetails()
    private refreshEntryDetails(row: IWindowContainer, word: string): void
    {
        const text = row.findChildByName('text');

        if(text) text.caption = word;
    }

    // AS3: .../WordFilterSettingsView.as::onCloseButtonClick()
    private onCloseButtonClick = (_event: WindowEvent): void =>
    {
        this.disposeWindow();
    };

    /** Refused silently when the word is empty or already listed. */
    // AS3: .../WordFilterSettingsView.as::onAddWordClick()
    private onAddWordClick = (_event: WindowEvent): void =>
    {
        if(this._addWordInput === null) return;

        const word = this._addWordInput.text;

        if(word && word.length > 0 && this._words.indexOf(word) === -1)
        {
            this._toolbar?.connection?.send(new AddToCustomFilterMessageComposer(word));

            this._addWordInput.text = '';
            this._selectedIndex = -1;
        }
    };

    /** Removes by the row's caption, not by index — the server keys on the word. */
    // AS3: .../WordFilterSettingsView.as::onRemoveWordClick()
    private onRemoveWordClick = (_event: WindowEvent): void =>
    {
        if(this._selectedIndex < 0) return;

        const row = this._wordList?.getListItemAt(this._selectedIndex) as IWindowContainer | null;

        if(row === null || row === undefined) return;

        const word = row.findChildByName('text')?.caption ?? '';

        this._selectedIndex = -1;

        this._toolbar?.connection?.send(new RemoveFromCustomFilterMessageComposer(word));
    };

    // AS3: .../WordFilterSettingsView.as::refreshColorsAfterClick()
    private refreshColorsAfterClick(list: IItemListWindow): void
    {
        for(let index = 0; index < this._words.length; index++)
        {
            const row = list.getListItemAt(index) as IWindowContainer | null;

            if(row !== null && row !== undefined) row.color = this.getBgColor(index, false);
        }
    }

    // AS3: .../WordFilterSettingsView.as::getListEntry()
    private getListEntry(index: number): IWindowContainer | null
    {
        const asset = this._toolbar?.assets?.getAssetByName('custom_word_filter_item_xml') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn('Missing layout "custom_word_filter_item_xml" - word rows cannot be built');

            return null;
        }

        const row = this._toolbar?.windowManager?.buildFromXML(
            asset.content as unknown as string
        ) as IWindowContainer | null;

        if(row === null || row === undefined) return null;

        const bgRegion = row.findChildByName('bg_region') as IRegionWindow | null;

        if(bgRegion !== null)
        {
            bgRegion.addEventListener('WME_CLICK', this.onBgMouseClick);
            bgRegion.addEventListener('WME_OVER', this.onBgMouseOver);
            bgRegion.addEventListener('WME_OUT', this.onBgMouseOut);
        }

        row.id = index;

        return row;
    }

    /**
     * Selection wins over hover, and hover over the stripe. The three literals are AS3's
     * own, ARGB with a full alpha byte: 0xFF9B9B99 selected, 0xFFC0C0FF hovered, and the
     * alternating 0xFFFFFFFF / 0xFFE1E1E1 stripe.
     */
    // AS3: .../WordFilterSettingsView.as::getBgColor()
    protected getBgColor(index: number, over: boolean): number
    {
        if(index === this._selectedIndex) return 4288329945;

        return over ? 4290173439 : (index % 2 !== 0 ? 4294967295 : 4293519841);
    }

    // AS3: .../WordFilterSettingsView.as::onBgMouseClick()
    private onBgMouseClick = (event: WindowEvent): void =>
    {
        const target = event.target as unknown as IWindow | null;

        this._selectedIndex = (target?.parent as IWindow | null)?.id ?? -1;

        const list = target?.findParentByName('wordlist') as unknown as IItemListWindow | null;

        if(list !== null && list !== undefined) this.refreshColorsAfterClick(list);
    };

    // AS3: .../WordFilterSettingsView.as::onBgMouseOver()
    private onBgMouseOver = (event: WindowEvent): void =>
    {
        const row = (event.target as unknown as IWindow | null)?.parent as IWindowContainer | null;

        if(row !== null && row !== undefined) row.color = this.getBgColor(-1, true);
    };

    // AS3: .../WordFilterSettingsView.as::onBgMouseOut()
    private onBgMouseOut = (event: WindowEvent): void =>
    {
        const row = (event.target as unknown as IWindow | null)?.parent as IWindowContainer | null;

        if(row !== null && row !== undefined) row.color = this.getBgColor(row.id, false);
    };

    // AS3: .../WordFilterSettingsView.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        const registered = this._toolbar?.communicationManager?.addHabboConnectionMessageEvent(event) ?? null;

        if(registered !== null) this._messageEvents?.push(registered);
    }

    // AS3: .../WordFilterSettingsView.as::removeMessageEvents()
    private removeMessageEvents(): void
    {
        const communicationManager = this._toolbar?.communicationManager ?? null;

        if(communicationManager === null || this._messageEvents === null) return;

        for(const event of this._messageEvents)
        {
            communicationManager.removeHabboConnectionMessageEvent(event);
            event.dispose();
        }

        this._messageEvents = null;
    }

    /** Closing tears the window down for good — reopening builds a fresh one. */
    // AS3: .../WordFilterSettingsView.as::disposeWindow()
    disposeWindow(): void
    {
        this.removeMessageEvents();

        if(this._window)
        {
            this._window.findChildByName('remove_btn')?.removeEventListener('WME_CLICK', this.onRemoveWordClick);
            this._window.findChildByName('add_btn')?.removeEventListener('WME_CLICK', this.onAddWordClick);
            this._window.findChildByName('back_btn')?.removeEventListener('WME_CLICK', this.onCloseButtonClick);

            this._window.visible = false;
            this._window.dispose();
            this._window = null;
        }

        if(this._wordList)
        {
            this._wordList.dispose();
            this._wordList = null;
        }

        if(this._addWordInput)
        {
            this._addWordInput.dispose();
            this._addWordInput = null;
        }

        this._words.length = 0;
    }

    // AS3: .../WordFilterSettingsView.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this.disposeWindow();

        this._toolbar = null;
    }
}
