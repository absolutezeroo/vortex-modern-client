import type {Rectangle} from 'pixi.js';
import type {ChatItem} from '@habbo/freeflowchat/data/ChatItem';
import type {IChatHistoryEntry} from './IChatHistoryEntry';

/**
 * ChatHistoryEntryBitmapBubble
 *
 * TODO(AS3): AS3 composites a "HH:MM:SS" timestamp `TextField` to the left of
 * the passed-in bubble bitmap (via `HabboFreeFlowChat.getTimeStampNow()` and
 * a `_SafeCls_2520.TEXT_FORMAT_TIMESTAMP` text format) into one final
 * `BitmapData`. Neither the timestamp text format enum nor a canvas-based
 * TextField-equivalent renderer exist yet, so `bitmap` here exposes the raw
 * bubble bitmap unmodified (no timestamp prefix) until that's ported.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as
 */
export class ChatHistoryEntryBitmapBubble implements IChatHistoryEntry
{
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::_bitmap
    private readonly _bitmap: ImageBitmap | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::_overlap
    private readonly _overlap: Rectangle | null;
    private readonly _userIndex: number;
    private readonly _webId: number;
    private readonly _roomId: number;
    private readonly _canIgnore: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::_userName
    private readonly _userName: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::ChatHistoryEntryBitmapBubble()
    // `bitmap` is `| null` here (AS3's is not) — see class header: callers can't
    // produce the real composited bitmap (ChatBubble isn't ported) yet.
    constructor(item: ChatItem, canIgnore: boolean, webId: number, userName: string, bitmap: ImageBitmap | null, overlap: Rectangle | null = null)
    {
        this._overlap = overlap;
        this._userIndex = item.userId;
        this._webId = webId;
        this._roomId = item.roomId;
        this._bitmap = bitmap;
        this._canIgnore = canIgnore;
        this._userName = userName;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::get bitmap()
    get bitmap(): ImageBitmap | null
    {
        return this._bitmap;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::get overlap()
    get overlap(): Rectangle | null
    {
        return this._overlap;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::get userIndex()
    get userIndex(): number
    {
        return this._userIndex;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::get webId()
    get webId(): number
    {
        return this._webId;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::get canIgnore()
    get canIgnore(): boolean
    {
        return this._canIgnore;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::get userName()
    get userName(): string
    {
        return this._userName;
    }
}
