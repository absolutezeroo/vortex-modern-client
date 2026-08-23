import type {Rectangle} from 'pixi.js';
import type {ChatItem} from '@habbo/freeflowchat/data/ChatItem';
import type {IChatHistoryEntry} from './IChatHistoryEntry';
import {ChatHistoryVisualizationEnum} from '../enum/ChatHistoryVisualizationEnum';
import {HabboFreeFlowChat} from '@habbo/freeflowchat/HabboFreeFlowChat';

/**
 * ChatHistoryEntryBitmapBubble
 *
 * One row of the chat-history tray: a "HH:MM:SS" timestamp in a fixed 62px column, then the chat
 * bubble as it appeared in the room.
 *
 * The composite happens in the constructor, as AS3 does, so `bitmap` is the finished row. The
 * timestamp's y comes off the bubble's `overlap` rectangle — a bubble whose art overhangs its box
 * pushes the clock down with it, so the two read as one line.
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
    // `bitmap` is `| null` here where AS3's is not: a bubble that failed to render leaves the row
    // without one rather than throwing inside a constructor.
    constructor(item: ChatItem, canIgnore: boolean, webId: number, userName: string, bitmap: ImageBitmap | null, overlap: Rectangle | null = null)
    {
        this._overlap = overlap;
        this._userIndex = item.userId;
        this._webId = webId;
        this._roomId = item.roomId;
        this._bitmap = ChatHistoryEntryBitmapBubble.composeRow(bitmap, overlap);
        this._canIgnore = canIgnore;
        this._userName = userName;
    }

    /**
     * Timestamp column, then the bubble at x = 62.
     *
     * AS3 reads `param6.top` without a null check even though `param6` defaults to null — an NPE
     * waiting for a caller that never came. The `?? 0` here is that missing check, and gives the
     * same answer for every caller that does exist.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryEntryBitmapBubble.as::ChatHistoryEntryBitmapBubble()
    private static composeRow(bubble: ImageBitmap | null, overlap: Rectangle | null): ImageBitmap | null
    {
        if(bubble === null) return null;

        const width = ChatHistoryVisualizationEnum.TIMESTAMP_FIXED_WIDTH + bubble.width;
        const canvas = new OffscreenCanvas(width, bubble.height);
        const ctx = canvas.getContext('2d');

        if(ctx === null) return bubble;

        const top = Math.max(
            ChatHistoryVisualizationEnum.LEFT_MARGIN,
            ChatHistoryVisualizationEnum.LEFT_MARGIN + (overlap?.top ?? 0)
        );

        ChatHistoryVisualizationEnum.drawText(
            ctx,
            HabboFreeFlowChat.getTimeStampNow(),
            ChatHistoryVisualizationEnum.TEXT_FORMAT_TIMESTAMP,
            0,
            top
        );
        ctx.drawImage(bubble, ChatHistoryVisualizationEnum.TIMESTAMP_FIXED_WIDTH, 0);

        return canvas.transferToImageBitmap();
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
