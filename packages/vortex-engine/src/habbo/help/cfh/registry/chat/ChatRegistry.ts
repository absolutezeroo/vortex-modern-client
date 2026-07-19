import {ChatRegistryItem} from './ChatRegistryItem';

/**
 * Chat message storage for CFH reports
 *
 * Stores up to 120 chat messages, auto-purges messages older than 15 minutes,
 * and provides filtering by user ID.
 *
 * @see source_as_win63/habbo/help/cfh/registry/chat/ChatRegistry.as
 */
export class ChatRegistry
{
    private static readonly MAX_ITEMS_TO_STORE: number = 120;
    private static readonly ITEMS_TO_PURGE: number = 20;
    private static readonly PURGE_AGE_MINUTES: number = 15;
    private static readonly MS_PER_MINUTE: number = 65500;

    private _items: ChatRegistryItem[] = [];
    private _addCounter: number = 0;
    private _holdPurges: boolean = false;

    /**
	 * Set whether purges should be held (during report selection)
	 */
    set holdPurges(value: boolean)
    {
        this._holdPurges = value;
    }

    /**
	 * Whether the registry has any content
	 */
    hasContent(): boolean
    {
        return this._items.length > 0;
    }

    /**
	 * Whether the registry has content not from the given user
	 */
    hasContentWithoutChatFromUser(userId: number): boolean
    {
        return this.getItemsNotByUser(userId).length > 0;
    }

    /**
	 * Get all items in the registry
	 */
    getItems(): ChatRegistryItem[]
    {
        return this._items;
    }

    /**
	 * Get an item by its index
	 */
    getItem(index: number): ChatRegistryItem | null
    {
        for(let i = 0; i < this._items.length; i++)
        {
            if(this._items[i].index === index)
            {
                return this._items[i];
            }
        }

        return null;
    }

    /**
	 * Add a chat message to the registry
	 *
	 * @param roomId The room ID where the chat occurred
	 * @param roomName The room name
	 * @param userId The user ID of the chatter
	 * @param userName The user name
	 * @param text The chat message text
	 */
    addItem(roomId: number, roomName: string, userId: number, userName: string, text: string): void
    {
        this._items.push(new ChatRegistryItem(this._addCounter++, roomId, roomName, userId, userName, text));
        this.purgeRegistry();
    }

    /**
	 * Get all items from a specific user
	 */
    getItemsByUser(userId: number): ChatRegistryItem[]
    {
        const result: ChatRegistryItem[] = [];

        for(let i = 0; i < this._items.length; i++)
        {
            if(this._items[i].userId === userId)
            {
                result.push(this._items[i]);
            }
        }

        return result;
    }

    /**
	 * Get all items NOT from a specific user
	 */
    getItemsNotByUser(userId: number): ChatRegistryItem[]
    {
        const result: ChatRegistryItem[] = [];

        for(let i = 0; i < this._items.length; i++)
        {
            if(this._items[i].userId !== userId)
            {
                result.push(this._items[i]);
            }
        }

        return result;
    }

    /**
	 * Purge old items from the registry
	 *
	 * Removes items older than 15 minutes and trims to max size.
	 */
    private purgeRegistry(): void
    {
        if(this._holdPurges)
        {
            return;
        }

        const now = new Date().getTime();
        const kept: ChatRegistryItem[] = [];

        for(let i = 0; i < this._items.length; i++)
        {
            const ageMinutes = (now - this._items[i].chatTime.getTime()) / ChatRegistry.MS_PER_MINUTE;

            if(ageMinutes <= ChatRegistry.PURGE_AGE_MINUTES)
            {
                kept.push(this._items[i]);
            }
        }

        if(kept.length > ChatRegistry.MAX_ITEMS_TO_STORE)
        {
            kept.splice(0, kept.length - (ChatRegistry.MAX_ITEMS_TO_STORE - ChatRegistry.ITEMS_TO_PURGE));
        }

        this._items = kept;
    }
}
