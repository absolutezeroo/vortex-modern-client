import type {ChatItem} from '../data/ChatItem';

/**
 * Ring buffer for chat history. Stores up to MAX_CHAT_ITEMS chat items.
 * When the buffer overflows, the oldest item is spliced from the top.
 *
 * In the AS3 version, entries are PooledChatBubble visual elements (class_3535).
 * In the Vortex ENGINE version, we store ChatItem data models directly since
 * the VIEW layer (SolidJS) handles rendering separately.
 *
 * @see source_as_win63/habbo/freeflowchat/history/ChatHistoryBuffer.as
 */
export class ChatHistoryBuffer
{
    private static readonly MAX_CHAT_ITEMS: number = 1000;

    private _entries: ChatItem[] = [];

    get entries(): ChatItem[]
    {
        return this._entries;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Total number of entries in the buffer.
	 */
    get length(): number
    {
        return this._entries.length;
    }

    /**
	 * Insert a chat item into the history buffer.
	 * If the buffer exceeds MAX_CHAT_ITEMS, the oldest entry is removed.
	 *
	 * @param item The chat item to insert
	 */
    insertChat(item: ChatItem): void
    {
        this._entries.push(item);
        this.checkBufferOverflow();
    }

    /**
	 * Dispose of the buffer and clear all entries.
	 */
    dispose(): void
    {
        if(this._disposed) return;

        this._entries = [];
        this._disposed = true;
    }

    /**
	 * Check if the buffer has exceeded max capacity and splice the top if needed.
	 */
    private checkBufferOverflow(): void
    {
        if(this._entries.length > ChatHistoryBuffer.MAX_CHAT_ITEMS)
        {
            this._entries.splice(0, 1);
        }
    }
}
