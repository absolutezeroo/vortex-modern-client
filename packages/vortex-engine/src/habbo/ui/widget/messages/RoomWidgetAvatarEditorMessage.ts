import type {IWindowContainer} from '@core/window/IWindowContainer';
import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * The three avatar-editor requests: open it, fetch the wardrobe, or report that its view was
 * disposed.
 *
 * `context` is a window the editor may embed itself into rather than opening standalone — the
 * me-menu never passes one, so its "clothes" button always opens the full editor.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetAvatarEditorMessage.as
 */
export class RoomWidgetAvatarEditorMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetAvatarEditorMessage.as::OPEN_AVATAR_EDITOR
    // Name DERIVED (`_SafeStr_10841`), from its value.
    public static readonly OPEN_AVATAR_EDITOR: string = 'RWCM_OPEN_AVATAR_EDITOR';

    // AS3: .../widget/messages/RoomWidgetAvatarEditorMessage.as::WIDGET_MESSAGE_GET_WARDROBE
    public static readonly WIDGET_MESSAGE_GET_WARDROBE: string = 'RWCM_GET_WARDROBE';

    // AS3: .../widget/messages/RoomWidgetAvatarEditorMessage.as::AVATAR_EDITOR_VIEW_DISPOSED
    // Name DERIVED (`_SafeStr_10939`), from its value.
    public static readonly AVATAR_EDITOR_VIEW_DISPOSED: string = 'RWAEM_AVATAR_EDITOR_VIEW_DISPOSED';

    // AS3: .../widget/messages/RoomWidgetAvatarEditorMessage.as::_context
    private _context: IWindowContainer | null;

    // AS3: .../widget/messages/RoomWidgetAvatarEditorMessage.as::RoomWidgetAvatarEditorMessage()
    constructor(type: string, context: IWindowContainer | null = null)
    {
        super(type);

        this._context = context;
    }

    // AS3: .../widget/messages/RoomWidgetAvatarEditorMessage.as::get context()
    public get context(): IWindowContainer | null
    {
        return this._context;
    }
}
