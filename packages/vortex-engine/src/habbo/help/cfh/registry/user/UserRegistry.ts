import {UserRegistryItem} from './UserRegistryItem';

/**
 * User tracking registry for CFH reports
 *
 * Stores up to 80 users with their room context, providing
 * lookup by user ID for the reporting flow.
 *
 * @see source_as_win63/habbo/help/cfh/registry/user/UserRegistry.as
 */
export class UserRegistry
{
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::MAX_USERS_TO_STORE
    private static readonly MAX_USERS_TO_STORE: number = 80;

    private _users: Map<number, UserRegistryItem> = new Map();
    private _userOrder: number[] = [];
    private _missingRoomNames: number[] = [];
    private _currentRoomId: number = 0;
    private _currentRoomName: string = '';

    /**
	 * Get the current room ID
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::get roomId()
    get roomId(): number
    {
        return this._currentRoomId;
    }

    /**
	 * Get the current room name
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::get roomName()
    get roomName(): string
    {
        return this._currentRoomName;
    }

    /**
	 * Get all registered users
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::getRegistry()
    getRegistry(): Map<number, UserRegistryItem>
    {
        return this._users;
    }

    /**
	 * Get a user entry by ID
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::getEntry()
    getEntry(userId: number): UserRegistryItem | null
    {
        return this._users.get(userId) ?? null;
    }

    /**
	 * Register the current room context
	 *
	 * @param roomId The room ID
	 * @param roomName The room name
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::registerRoom()
    registerRoom(roomId: number, roomName: string): void
    {
        this._currentRoomId = roomId;
        this._currentRoomName = roomName;

        if(this._currentRoomName !== '')
        {
            this.addRoomNameForMissing();
        }
    }

    /**
	 * Register a user in the registry
	 *
	 * @param userId The user ID
	 * @param userName The user name
	 * @param figure The user figure string
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::registerUser()
    registerUser(userId: number, userName: string, figure: string = ''): void
    {
        if(this._users.has(userId))
        {
            this._users.delete(userId);
        }

        const item = new UserRegistryItem(userId, userName, figure, this._currentRoomId, this._currentRoomName);

        if(this._currentRoomName === '')
        {
            this._missingRoomNames.push(userId);
        }

        this._users.set(userId, item);
        this.purgeUserIndex();
    }

    /**
	 * Purge excess users to stay within the limit
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::purgeUserIndex()
    private purgeUserIndex(): void
    {
        while(this._users.size > UserRegistry.MAX_USERS_TO_STORE)
        {
            const firstKey = this._users.keys().next().value;

            if(firstKey !== undefined)
            {
                this._users.delete(firstKey);
            }
            else
            {
                break;
            }
        }
    }

    /**
	 * Add the current room name to users that were missing it
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistry.as::addRoomNameForMissing()
    private addRoomNameForMissing(): void
    {
        while(this._missingRoomNames.length > 0)
        {
            const userId = this._missingRoomNames.shift()!;
            const item = this._users.get(userId);

            if(item && item.roomId === this._currentRoomId)
            {
                item.roomName = this._currentRoomName;
            }
        }
    }
}
