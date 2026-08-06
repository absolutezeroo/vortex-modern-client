import {InstantMessageRegistryItem} from './InstantMessageRegistryItem';

/**
 * Instant message storage for CFH reports
 *
 * Stores up to 20 messages per user, auto-purges messages older than
 * 15 minutes, keyed by user ID.
 *
 * @see source_as_win63/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as
 */
export class InstantMessageRegistry
{
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::MAX_MESSAGES_TO_STORE
    private static readonly MAX_MESSAGES_TO_STORE: number = 20;
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::ITEMS_TO_PURGE
    private static readonly ITEMS_TO_PURGE: number = 5;
    private static readonly PURGE_AGE_MINUTES: number = 15;
    private static readonly MS_PER_MINUTE: number = 65500;

    private _items: Map<number, InstantMessageRegistryItem[]> = new Map();
    private _addCounter: number = 0;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::_purgeCounter
    private _purgeCounter: number = 0;
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::_holdPurges
    private _holdPurges: boolean = false;

    /**
	 * Set whether purges should be held (during report selection)
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::set holdPurges()
    set holdPurges(value: boolean)
    {
        this._holdPurges = value;
    }

    /**
	 * Add an instant message to the registry
	 *
	 * @param userId The user ID (or chat ID for group chats)
	 * @param userName The user name
	 * @param text The message text
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::addItem()
    addItem(userId: number, userName: string, text: string): void
    {
        const item = new InstantMessageRegistryItem(this._addCounter++, userId, userName, text);

        if(this._items.has(userId))
        {
            const items = this._items.get(userId)!;
            items.push(item);
        }
        else
        {
            this._items.set(userId, [item]);
        }

        this._purgeCounter++;

        if(this._purgeCounter % 3 === 0)
        {
            this.purgeRegistry();
        }
    }

    /**
	 * Get all items from a specific user
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::getItemsByUser()
    getItemsByUser(userId: number): InstantMessageRegistryItem[] | null
    {
        return this._items.get(userId) ?? null;
    }

    /**
	 * Get a specific item by user ID and index
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::getItem()
    getItem(userId: number, index: number): InstantMessageRegistryItem | null
    {
        const items = this.getItemsByUser(userId);

        if(!items) return null;

        for(let i = 0; i < items.length; i++)
        {
            if(items[i].index === index)
            {
                return items[i];
            }
        }

        return null;
    }

    /**
	 * Whether a user has any messages in the registry
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::hasUserChatted()
    hasUserChatted(userId: number): boolean
    {
        const items = this.getItemsByUser(userId);

        if(!items) return false;

        return items.length > 0;
    }

    /**
	 * Whether the registry has any content
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::hasContent()
    hasContent(): boolean
    {
        return this._items.size > 0;
    }

    /**
	 * Get all items in the registry
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::getItems()
    getItems(): Map<number, InstantMessageRegistryItem[]>
    {
        return this._items;
    }

    /**
	 * Purge old items from the registry
	 *
	 * Removes items older than 15 minutes and trims to max size per user.
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistry.as::purgeRegistry()
    private purgeRegistry(): void
    {
        if(this._holdPurges)
        {
            return;
        }

        const now = new Date().getTime();

        for(const [userId, items] of this._items)
        {
            if(!items || items.length === 0) continue;

            const kept: InstantMessageRegistryItem[] = [];

            for(let i = 0; i < items.length; i++)
            {
                const ageMinutes = (now - items[i].chatTime.getTime()) / InstantMessageRegistry.MS_PER_MINUTE;

                if(ageMinutes <= InstantMessageRegistry.PURGE_AGE_MINUTES)
                {
                    kept.push(items[i]);
                }
            }

            if(kept.length > InstantMessageRegistry.MAX_MESSAGES_TO_STORE)
            {
                kept.splice(0, kept.length - (InstantMessageRegistry.MAX_MESSAGES_TO_STORE - InstantMessageRegistry.ITEMS_TO_PURGE));
            }

            this._items.set(userId, kept);
        }
    }
}
