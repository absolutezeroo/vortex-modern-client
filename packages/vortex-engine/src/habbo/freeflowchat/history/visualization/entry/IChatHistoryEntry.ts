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
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2418.as::get bitmap()
    readonly bitmap: ImageBitmap | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2418.as::get overlap()
    readonly overlap: Rectangle | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2418.as::get userIndex()
    readonly userIndex: number;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2418.as::get webId()
    readonly webId: number;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2418.as::get roomId()
    readonly roomId: number;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2418.as::get canIgnore()
    readonly canIgnore: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2418.as::get userName()
    readonly userName: string;
}
