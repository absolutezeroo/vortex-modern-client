import {Logger} from '@core/utils/Logger';
import type {IAvatarImage} from '@habbo/avatar/IAvatarImage';
import {HabboFaceFocuser} from '@habbo/utils/HabboFaceFocuser';
import type {FriendListUpdateMessageEvent} from '@habbo/communication/messages/incoming/friendlist/FriendListUpdateMessageEvent';
import type {FriendListUpdateMessageParser} from '@habbo/communication/messages/parser/friendlist/FriendListUpdateMessageParser';
import type {FriendCategoryData} from '@habbo/communication/messages/parser/friendlist/MessengerInitParser';
import {Util} from '../Util';
import type {IFriendsView} from '../IFriendsView';
import {Friend} from './Friend';
import {FriendCategory} from './FriendCategory';
import {FriendOnlineImageListener} from './FriendOnlineImageListener';
import type {IFriendCategoriesDeps} from './IFriendCategoriesDeps';

const logger = Logger.getLogger('habbo.friendlist.FriendCategories');

/**
 * FriendCategories
 *
 * The friend list itself: every category, the flat id → friend index the rest of the
 * client looks friends up in, and the incoming-update path that keeps both in step
 * with the server.
 *
 * A friend is filed by `categoryId` only while online — offline friends all collapse
 * into the offline category regardless of the category the server sent.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendCategories.as
 */
export class FriendCategories
{
    /**
     * Above this many friends in one category, an incremental update stops re-sorting
     * it — `sort(true)` skips any category at or over the threshold.
     */
    // AS3: .../domain/FriendCategories.as::STOP_SORTING_FRIENDLIST
    private static readonly STOP_SORTING_FRIENDLIST: number = 200;

    // AS3: .../domain/FriendCategories.as::FriendCategories()
    constructor(deps: IFriendCategoriesDeps)
    {
        this._deps = deps;
    }

    // AS3: .../domain/FriendCategories.as::_SafeStr_5299
    private _deps: IFriendCategoriesDeps;

    // AS3: .../domain/FriendCategories.as::get deps()
    get deps(): IFriendCategoriesDeps
    {
        return this._deps;
    }

    // AS3: .../domain/FriendCategories.as::_categories
    private _categories: FriendCategory[] = [];

    /**
     * The flat index behind `findFriend()`. AS3 blanks an entry rather than deleting
     * it (`_SafeStr_6245[id] = null`) and every reader skips nulls, so removing the
     * key outright is the same thing to all of them.
     */
    // AS3: .../domain/FriendCategories.as::_SafeStr_6245
    private _allFriends: Map<number, Friend> = new Map<number, Friend>();

    // AS3: .../domain/FriendCategories.as::get view()
    get view(): IFriendsView
    {
        return this._deps.view;
    }

    // AS3: .../domain/FriendCategories.as::addFriend()
    addFriend(friend: Friend): FriendCategory | null
    {
        const categoryId = friend.online ? friend.categoryId : FriendCategory.CATID_OFFLINE;
        const category = this.findCategory(categoryId);

        if(category !== null)
        {
            category.addFriend(friend);
            this._allFriends.set(friend.id, friend);

            return category;
        }

        logger.warn(`No category ${categoryId} found for friend ${friend.id}. Ignoring`);

        return null;
    }

    // AS3: .../domain/FriendCategories.as::sort()
    sort(skipLargeCategories: boolean = false): void
    {
        for(const category of this._categories)
        {
            if(!skipLargeCategories || category.friends.length < FriendCategories.STOP_SORTING_FRIENDLIST)
            {
                category.sort();
            }
        }
    }

    // AS3: .../domain/FriendCategories.as::getSelectedFriends()
    getSelectedFriends(): Friend[]
    {
        const selected: Friend[] = [];

        for(const category of this._categories)
        {
            category.getSelectedFriends(selected);
        }

        return selected;
    }

    /**
     * The single selected friend, or null — two selected rows is "no selection" to
     * every caller of this.
     */
    // AS3: .../domain/FriendCategories.as::getSelectedFriend()
    getSelectedFriend(): Friend | null
    {
        const selected = this.getSelectedFriends();

        return selected.length === 1 ? selected[0]! : null;
    }

    // AS3: .../domain/FriendCategories.as::getAllFriends()
    getAllFriends(): Map<number, Friend>
    {
        return this._allFriends;
    }

    // AS3: .../domain/FriendCategories.as::getFriendCount()
    getFriendCount(onlineOnly: boolean, followableOnly: boolean = false): number
    {
        let count = 0;

        for(const category of this._categories)
        {
            count += category.getFriendCount(onlineOnly, followableOnly);
        }

        return count;
    }

    // AS3: .../domain/FriendCategories.as::getCategories()
    getCategories(): FriendCategory[]
    {
        return this._categories;
    }

    // AS3: .../domain/FriendCategories.as::addCategory()
    addCategory(category: FriendCategory): void
    {
        this._categories.push(category);
    }

    // AS3: .../domain/FriendCategories.as::findFriend()
    findFriend(id: number): Friend | null
    {
        return this._allFriends.get(id) ?? null;
    }

    // AS3: .../domain/FriendCategories.as::findCategory()
    findCategory(id: number): FriendCategory | null
    {
        for(const category of this._categories)
        {
            if(category.id === id)
            {
                return category;
            }
        }

        return null;
    }

    // AS3: .../domain/FriendCategories.as::getFriendNames()
    getFriendNames(): string[]
    {
        const names: string[] = [];

        for(const friend of this._allFriends.values())
        {
            if(friend !== null)
            {
                names.push(friend.name);
            }
        }

        return names;
    }

    /**
     * The incremental update: categories first (so a friend can be filed into one that
     * only just arrived), then removals, then updates, then insertions.
     *
     * An update is a remove-and-re-add rather than a mutation — that is how a friend
     * moves between the online and offline categories — and the only state carried
     * across is the selection. Coming online is detected on the *old* entry, so the
     * notification fires once, on the transition.
     */
    // AS3: .../domain/FriendCategories.as::onFriendListUpdate()
    onFriendListUpdate(event: FriendListUpdateMessageEvent): void
    {
        const parser = event.getParser<FriendListUpdateMessageParser>();

        this.updateCategories(parser.categories);

        for(const removedId of parser.removedFriendIds)
        {
            this.removeFriend(removedId, true);
        }

        for(const updated of parser.updatedFriends)
        {
            logger.trace(`Got UPDATE: ${updated.id}, ${updated.online}, ${updated.name}, ${updated.followingAllowed}`);

            this._deps.messenger.setFollowingAllowed(updated.id, updated.followingAllowed && updated.online);

            const wasOnline = this.isFriendOnline(updated.id);

            if(wasOnline && !updated.online)
            {
                this._deps.messenger.setOnlineStatus(updated.id, updated.online);
            }

            if(!wasOnline && updated.online)
            {
                this._deps.messenger.setOnlineStatus(updated.id, updated.online);
                this._deps.view.setNewMessageArrived();
            }

            const previous = this.removeFriend(updated.id, true);
            const friend = new Friend(updated);

            friend.selected = previous?.selected ?? false;
            this.addFriend(friend);

            if(previous !== null && !previous.online && friend.online)
            {
                this.notifyFriendOnline(friend);
            }
        }

        for(const added of parser.addedFriends)
        {
            const friend = new Friend(added);

            logger.trace(`Got INSERT: ${added.id}, ${added.name}`);

            this.removeFriend(added.id, true);
            this.addFriend(friend);
        }

        this.sort(true);
        this._deps.view.refreshList();
    }

    /**
     * The "X is online" toast, with the friend's head cut into a circle for its icon.
     *
     * With no image passed in, this asks for one and hands the request a listener —
     * a placeholder means the figure's assets are still downloading, so it gives up
     * and lets `FriendOnlineImageListener` call back in once they land.
     *
     * `internal` in AS3; the listener is its only outside caller.
     */
    // AS3: .../domain/FriendCategories.as::notifyFriendOnline()
    notifyFriendOnline(friend: Friend, avatarImage: IAvatarImage | null = null): void
    {
        // AS3 casts the messenger to the runtime component interface (`_SafeCls_50`)
        // purely to read a config flag off it; the messenger interface itself has no
        // `getBoolean()`.
        const configurable = this._deps.messenger as unknown as {getBoolean(key: string): boolean};

        if(!configurable.getBoolean('friend_online_indicator.enabled'))
        {
            return;
        }

        if(avatarImage === null)
        {
            const listener = new FriendOnlineImageListener(friend, this);

            avatarImage = this._deps.avatarManager.createAvatarImage(friend.figure, 'h', '', listener, null);
        }

        if(avatarImage === null || avatarImage.isPlaceholder())
        {
            avatarImage?.dispose();

            return;
        }

        let face = HabboFaceFocuser.focusUserFace(avatarImage, 'head', 2, 1);

        if(face !== null)
        {
            face = HabboFaceFocuser.cutCircleFromBitmap(face, 22);
        }

        avatarImage.dispose();

        const message = this._deps.localizations.getLocalizationWithParams('notifications.friend_online', '', 'name', friend.name);

        this._deps.notifications.addItemWithBitmap(message, 'friendonline', face, `messenger/${friend.id}`);
    }

    /**
     * Re-syncs the category list against the one the server just sent: the two
     * built-in categories are always kept, named categories are renamed in place, and
     * a category nobody mentioned is dropped only if it is empty.
     */
    // AS3: .../domain/FriendCategories.as::updateCategories()
    private updateCategories(categories: FriendCategoryData[]): void
    {
        this.flushReceivedStatus();

        const offline = this.findCategory(FriendCategory.CATID_OFFLINE);
        const online = this.findCategory(FriendCategory.CATID_ONLINE);

        if(offline !== null)
        {
            offline.received = true;
        }

        if(online !== null)
        {
            online.received = true;
        }

        for(const data of categories)
        {
            const category = this.findCategory(data.id);

            if(category !== null)
            {
                category.received = true;

                if(category.name !== data.name)
                {
                    category.name = data.name;
                }
            }
        }

        for(const category of this.getCategoriesNotReceived())
        {
            if(category.friends.length <= 0)
            {
                Util.remove(this._categories, category);
                category.dispose();
            }
        }
    }

    /**
     * Removes the friend from every category — an id can only be filed once, but the
     * sweep is unconditional — and returns the entry it found. With `dispose` set the
     * entry is disposed as well, and the returned object is only good for reading the
     * plain fields off it.
     */
    // AS3: .../domain/FriendCategories.as::removeFriend()
    private removeFriend(id: number, dispose: boolean): Friend | null
    {
        if(dispose)
        {
            this._allFriends.delete(id);
        }

        let removed: Friend | null = null;

        for(const category of this._categories)
        {
            const friend = category.removeFriend(id);

            if(friend !== null)
            {
                removed = friend;

                if(dispose)
                {
                    friend.dispose();
                }
            }
        }

        return removed;
    }

    // AS3: .../domain/FriendCategories.as::flushReceivedStatus()
    private flushReceivedStatus(): void
    {
        for(const category of this._categories)
        {
            category.received = false;
        }
    }

    // AS3: .../domain/FriendCategories.as::getCategoriesNotReceived()
    private getCategoriesNotReceived(): FriendCategory[]
    {
        const notReceived: FriendCategory[] = [];

        for(const category of this._categories)
        {
            if(!category.received)
            {
                notReceived.push(category);
            }
        }

        return notReceived;
    }

    // AS3: .../domain/FriendCategories.as::isFriendOnline()
    private isFriendOnline(id: number): boolean
    {
        return this.findFriend(id)?.online ?? false;
    }
}
