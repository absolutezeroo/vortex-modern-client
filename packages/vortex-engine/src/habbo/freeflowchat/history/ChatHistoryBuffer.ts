import type {ChatItem} from '../data/ChatItem';
import type {HabboFreeFlowChat} from '../HabboFreeFlowChat';
import type {IChatHistoryEntry} from './visualization/entry/IChatHistoryEntry';
import type {IRoomChangeData} from './visualization/entry/ChatHistoryRoomChangeEntry';
import {ChatHistoryVisualizationEnum} from './visualization/enum/ChatHistoryVisualizationEnum';

/**
 * The scrollback the history tray draws.
 *
 * It holds *rendered rows*, not chat items: every insert bakes the bubble to a bitmap through
 * `ChatBubbleFactory` and keeps that, because the tray scrolls thousands of rows and re-laying out
 * text per frame is not affordable. The row's height is therefore known the moment it is inserted,
 * which is what `totalHeight` and the scroll bar are both built on.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as
 */
export class ChatHistoryBuffer
{
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::MAX_CHAT_ITEMS
    private static readonly MAX_CHAT_ITEMS: number = 1000;

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::_entries
    private _entries: IChatHistoryEntry[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::ChatHistoryBuffer()
    constructor(private _chatFlow: HabboFreeFlowChat | null)
    {
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::get entries()
    get entries(): IChatHistoryEntry[]
    {
        return this._entries;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::get disposed()
    get disposed(): boolean
    {
        return this._chatFlow === null;
    }

    /**
	 * The stacked height of every row, which is what the scroll view scrolls through and what the
	 * scroll bar sizes its thumb against. Rows overlap by `ROW_HEIGHT_OVERLAP` and by the entry's
	 * own `overlap.y`, so this is not the sum of the bitmap heights.
	 */
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::get totalHeight()
    get totalHeight(): number
    {
        let total = 0;

        for(const entry of this._entries) total += ChatHistoryBuffer.entryHeight(entry);

        return total;
    }

    /**
	 * How far the next row starts below this one. Shared by `totalHeight()`, the overflow splice
	 * and the scroll view's own layout, all three of which AS3 writes out longhand.
	 */
    // TS-only: the one expression AS3 repeats at four call sites.
    static entryHeight(entry: IChatHistoryEntry): number
    {
        return (entry.bitmap?.height ?? 0) - (entry.overlap?.y ?? 0) - ChatHistoryVisualizationEnum.ROW_HEIGHT_OVERLAP;
    }

    /**
	 * Bake `item` into a row and append it.
	 *
	 * AS3 wraps the bake in a try/catch that swallows error 2015 — an invalid `BitmapData`, which
	 * Flash throws when the bubble came out zero-sized — and rethrows anything else. The port's
	 * factory answers `null` for that same case instead of throwing, so the guard is a null check.
	 */
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::insertChat()
    insertChat(item: ChatItem): void
    {
        const entry = this._chatFlow?.chatBubbleFactory?.getHistoryLineEntry(item) ?? null;

        if(entry === null) return;

        this._entries.push(entry);
        this.checkBufferOverflowAndSpliceTop(entry);

        const scrollView = this._chatFlow?.chatHistoryScrollView ?? null;

        if(scrollView !== null && scrollView.isActive)
        {
            scrollView.addHistoryEntry(this._entries[this._entries.length - 1]);
        }
    }

    /**
	 * The "you changed room" separator. Unlike `insertChat()` it never reaches the scroll view: the
	 * room change arrives while the tray is closed (it is a room *entry* message), so the row is
	 * only picked up by the next `activateView()`. AS3 has the same asymmetry.
	 */
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::insertRoomChange()
    insertRoomChange(roomData: IRoomChangeData | null): void
    {
        const entry = this._chatFlow?.chatBubbleFactory?.getHistoryRoomChangeEntry(roomData) ?? null;

        if(entry === null) return;

        this._entries.push(entry);
        this.checkBufferOverflowAndSpliceTop(entry);
    }

    /**
	 * AS3 scrolls the view up by the height of the row it just *added*, not the one it drops. Kept:
	 * the two are the same size often enough that it never showed, and correcting it here would
	 * desynchronise the view from `totalHeight()`, which is computed over the spliced array.
	 */
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::checkBufferOverflowAndSpliceTop()
    private checkBufferOverflowAndSpliceTop(entry: IChatHistoryEntry): void
    {
        if(this._entries.length <= ChatHistoryBuffer.MAX_CHAT_ITEMS) return;

        this._chatFlow?.chatHistoryScrollView?.scrollUpAndSpliceTopItem(ChatHistoryBuffer.entryHeight(entry));
        this._entries.splice(0, 1);
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/ChatHistoryBuffer.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._entries = [];
        this._chatFlow = null;
    }
}
