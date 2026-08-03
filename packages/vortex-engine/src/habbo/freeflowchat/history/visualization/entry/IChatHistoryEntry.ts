import type {Rectangle} from 'pixi.js';

/**
 * IChatHistoryEntry Interface
 *
 * A single rendered row in the chat history tray — either a chat bubble
 * baked to a bitmap (ChatHistoryEntryBitmapBubble) or a room-change marker
 * (ChatHistoryRoomChangeEntry).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2418.as
 */
export interface IChatHistoryEntry
{
    readonly bitmap: ImageBitmap | null;
    readonly overlap: Rectangle | null;
    readonly userIndex: number;
    readonly webId: number;
    readonly roomId: number;
    readonly canIgnore: boolean;
    readonly userName: string;
}
