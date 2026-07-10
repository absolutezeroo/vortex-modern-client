import type {IDisposable} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {RoomChatInputView} from '../RoomChatInputView';

/** AS3: ChatStyleGridView.as::CHAT_BAR_POPUP_OFFSET */
const CHAT_BAR_POPUP_OFFSET = 55;

/**
 * ChatStyleGridView
 *
 * Wraps the `styleselector_menu_new_xml` popup window - the style grid and
 * font-size list live inside it as named children.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridView.as
 */
export class ChatStyleGridView implements IDisposable
{
    private _window: IWindowContainer | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridView.as::ChatStyleGridView()
    constructor(chatInputView: RoomChatInputView)
    {
        this._window = chatInputView.widget?.windowManager.buildWidgetLayout('styleselector_menu_new_xml') as IWindowContainer | null;

        if(this._window) this._window.visible = false;
    }

    get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridView.as::dispose()
    dispose(): void
    {
        this._window?.dispose();
        this._window = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridView.as::get grid()
    get grid(): IItemGridWindow | null
    {
        return (this._window?.findChildByName('itemgrid') as IItemGridWindow | null) ?? null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridView.as::get fontSizeList()
    get fontSizeList(): IItemListWindow | null
    {
        return (this._window?.findChildByName('font_size_list') as IItemListWindow | null) ?? null;
    }

    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridView.as::alignToSelector()
    // Only the net effect is ported - AS3 computes an on-screen-left-border shift here
    // (SCREEN_LEFT_BORDER=92) that's immediately overwritten by the unconditional
    // `x = selectorRect.x` two lines later in every source tree checked (win63_2026,
    // win63_version, flash_version - flash_version's own decompiler even collapsed the
    // shift to `x = x + 0`, confirming it never mattered) - so the real result is always
    // just this.
    alignToSelector(selector: IWindowContainer | null): void
    {
        if(!this._window || !selector || !this._window.parent) return;

        const selectorRect = {x: 0, y: 0, width: 0, height: 0};

        selector.getGlobalRectangle(selectorRect);

        const popupParent = this._window.parent as IWindowContainer;

        popupParent.x = selectorRect.x;
        popupParent.y = selectorRect.y + selectorRect.height - CHAT_BAR_POPUP_OFFSET - this._window.height;
    }
}
