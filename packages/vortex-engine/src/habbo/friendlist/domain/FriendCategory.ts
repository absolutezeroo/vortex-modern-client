import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {Friend} from './Friend';

/**
 * FriendCategory
 *
 * One collapsible group of the friend list — "Online", "Offline", or a server-defined
 * category. Owns the friends filed under it, the search filter applied to them, and
 * the page the list window is currently showing.
 *
 * The filter keeps a second map rather than filtering on read: every list refresh asks
 * for `filteredFriends`, and the categories are re-paged off its length.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendCategory.as
 */
export class FriendCategory implements IDisposable
{
    // AS3: .../domain/FriendCategory.as::PAGE_SIZE
    static readonly PAGE_SIZE: number = 100;

    // AS3: .../domain/FriendCategory.as::CATID_ONLINE
    static readonly CATID_ONLINE: number = 0;

    // AS3: .../domain/FriendCategory.as::CATID_OFFLINE
    static readonly CATID_OFFLINE: number = -1;

    // AS3: .../domain/FriendCategory.as::FriendCategory()
    constructor(id: number, name: string)
    {
        this._id = id;
        this._name = name;
        this._open = this._id !== FriendCategory.CATID_OFFLINE;
    }

    // AS3: .../domain/FriendCategory.as::_SafeStr_5023
    private _friends: OrderedMap<number, Friend> = new OrderedMap<number, Friend>();

    // AS3: .../domain/FriendCategory.as::_SafeStr_5513
    private _filtered: OrderedMap<number, Friend> | null = null;

    // AS3: .../domain/FriendCategory.as::_SafeStr_4872
    private _id: number;

    // AS3: .../domain/FriendCategory.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../domain/FriendCategory.as::set id()
    set id(value: number)
    {
        this._id = value;
    }

    // AS3: .../domain/FriendCategory.as::_name
    private _name: string;

    // AS3: .../domain/FriendCategory.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../domain/FriendCategory.as::set name()
    set name(value: string)
    {
        this._name = value;
    }

    // AS3: .../domain/FriendCategory.as::_open
    private _open: boolean;

    // AS3: .../domain/FriendCategory.as::get open()
    get open(): boolean
    {
        return this._open;
    }

    // AS3: .../domain/FriendCategory.as::_SafeStr_8822
    private _received: boolean = false;

    // AS3: .../domain/FriendCategory.as::get received()
    get received(): boolean
    {
        return this._received;
    }

    // AS3: .../domain/FriendCategory.as::set received()
    set received(value: boolean)
    {
        this._received = value;
    }

    // AS3: .../domain/FriendCategory.as::_SafeStr_4550
    private _view: IWindowContainer | null = null;

    // AS3: .../domain/FriendCategory.as::get view()
    get view(): IWindowContainer | null
    {
        return this._view;
    }

    // AS3: .../domain/FriendCategory.as::set view()
    set view(value: IWindowContainer | null)
    {
        this._view = value;
    }

    // AS3: .../domain/FriendCategory.as::_SafeStr_4726
    private _pageIndex: number = 0;

    // AS3: .../domain/FriendCategory.as::get pageIndex()
    get pageIndex(): number
    {
        return this._pageIndex;
    }

    // AS3: .../domain/FriendCategory.as::set pageIndex()
    set pageIndex(value: number)
    {
        this._pageIndex = value;
    }

    // AS3: .../domain/FriendCategory.as::_SafeStr_4691
    private _filter: string = '';

    // AS3: .../domain/FriendCategory.as::get filter()
    get filter(): string
    {
        return this._filter;
    }

    // AS3: .../domain/FriendCategory.as::set filter()
    set filter(value: string)
    {
        if(value !== this._filter)
        {
            this._filter = value;
            this.updateFilteredFriends();
        }
    }

    // AS3: .../domain/FriendCategory.as::get friends()
    get friends(): Friend[]
    {
        return this._friends.getValues();
    }

    // AS3: .../domain/FriendCategory.as::get filteredFriends()
    get filteredFriends(): Friend[]
    {
        return this._filtered === null ? this._friends.getValues() : this._filtered.getValues();
    }

    // AS3: .../domain/FriendCategory.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../domain/FriendCategory.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../domain/FriendCategory.as::addFriend()
    addFriend(friend: Friend): void
    {
        this.removeFriend(friend.id);
        this._friends.add(friend.id, friend);

        if(this._filtered !== null && this.acceptFilter(friend))
        {
            this._filtered.add(friend.id, friend);
        }
    }

    // AS3: .../domain/FriendCategory.as::removeFriend()
    removeFriend(id: number): Friend | null
    {
        const friend = this._friends.remove(id);

        if(friend === null)
        {
            return null;
        }

        if(this._filtered !== null && this.acceptFilter(friend))
        {
            this._filtered.remove(id);
        }

        return friend;
    }

    /**
     * `sortOn("name", 1)` — 1 is `Array.CASEINSENSITIVE`, so the list is ordered by
     * lowercased name. The map is rebuilt rather than reordered because its key order
     * *is* the display order.
     */
    // AS3: .../domain/FriendCategory.as::sort()
    sort(): void
    {
        const sorted = this._friends.getValues();

        sorted.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

        this._friends = new OrderedMap<number, Friend>();

        for(const friend of sorted)
        {
            this._friends.add(friend.id, friend);
        }

        this.updateFilteredFriends();
    }

    // AS3: .../domain/FriendCategory.as::getSelectedFriends()
    getSelectedFriends(target: Friend[]): void
    {
        for(const friend of this._friends.getValues())
        {
            if(friend.selected)
            {
                target.push(friend);
            }
        }
    }

    // AS3: .../domain/FriendCategory.as::getFriendCount()
    getFriendCount(onlineOnly: boolean, followableOnly: boolean = false): number
    {
        if(!onlineOnly && !followableOnly)
        {
            return this._friends.length;
        }

        let count = 0;

        for(const friend of this._friends.getValues())
        {
            if((!onlineOnly || friend.online) && (!followableOnly || friend.followingAllowed))
            {
                count += 1;
            }
        }

        return count;
    }

    // AS3: .../domain/FriendCategory.as::getPageCount()
    getPageCount(): number
    {
        return Math.ceil(this.filteredFriends.length / FriendCategory.PAGE_SIZE);
    }

    // AS3: .../domain/FriendCategory.as::getStartFriendIndex()
    getStartFriendIndex(): number
    {
        this.checkPageIndex();

        return this._pageIndex * FriendCategory.PAGE_SIZE;
    }

    // AS3: .../domain/FriendCategory.as::getEndFriendIndex()
    getEndFriendIndex(): number
    {
        this.checkPageIndex();

        return Math.min((this._pageIndex + 1) * FriendCategory.PAGE_SIZE, this.filteredFriends.length);
    }

    /**
     * Closing a category also drops every selection inside it — the selection is only
     * meaningful while the rows are on screen.
     */
    // AS3: .../domain/FriendCategory.as::setOpen()
    setOpen(open: boolean): void
    {
        this._open = open;

        if(!open)
        {
            for(const friend of this._friends.getValues())
            {
                friend.selected = false;
            }
        }
    }

    // AS3: .../domain/FriendCategory.as::checkPageIndex()
    private checkPageIndex(): void
    {
        if(this._pageIndex >= this.getPageCount())
        {
            this._pageIndex = Math.max(0, this.getPageCount() - 1);
        }
    }

    /**
     * The filter string is compared as given — `HabboFriendList` lowercases it before
     * assigning, so this does not lowercase it again.
     */
    // AS3: .../domain/FriendCategory.as::acceptFilter()
    private acceptFilter(friend: Friend): boolean
    {
        return this._filter.length === 0 || friend.name.toLowerCase().indexOf(this._filter) !== -1;
    }

    // AS3: .../domain/FriendCategory.as::updateFilteredFriends()
    private updateFilteredFriends(): void
    {
        if(this._filter.length === 0)
        {
            this._filtered = null;

            return;
        }

        this._filtered = new OrderedMap<number, Friend>();

        for(const friend of this._friends.getValues())
        {
            if(this.acceptFilter(friend))
            {
                this._filtered.add(friend.id, friend);
            }
        }
    }

    // AS3: .../domain/FriendCategory.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;
        this._view = null;
    }
}
