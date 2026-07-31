import {FriendListTabEnum} from '../FriendListTabEnum';
import {FriendsView} from '../FriendsView';
import {FriendRequestsView} from '../FriendRequestsView';
import {SearchView} from '../SearchView';
import {FriendListTab} from './FriendListTab';
import type {IFriendListTabsDeps} from './IFriendListTabsDeps';

/**
 * FriendListTabs
 *
 * The three tabs, and the accordion rule between them: at most one open, clicking the
 * open one closes it.
 *
 * The closed state is a height of zero, so the height in force before closing is
 * stashed and restored on reopening — that is what makes a resized friend list come
 * back the size the user left it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendListTabs.as
 */
export class FriendListTabs
{
    // AS3: .../domain/FriendListTabs.as::FriendListTabs()
    constructor(deps: IFriendListTabsDeps)
    {
        this._deps = deps;

        const friendList = this._deps.getFriendList();

        this._tabs.push(new FriendListTab(friendList, FriendListTabEnum.TABID_FRIENDS, new FriendsView(), '${friendlist.friends}', 'friends_footer', 'hdr_friends'));
        this._tabs.push(new FriendListTab(friendList, FriendListTabEnum.TABID_FRIEND_REQUESTS, new FriendRequestsView(), '${friendlist.tab.friendrequests}', 'friend_requests_footer', 'hdr_friend_requests'));
        this._tabs.push(new FriendListTab(friendList, FriendListTabEnum.TABID_SEARCH, new SearchView(), '${generic.search}', 'search_footer', 'hdr_search'));

        // Starts closed: with no tab selected, toggling null collapses the accordion.
        this.toggleSelected(null);
    }

    // AS3: .../domain/FriendListTabs.as::_SafeStr_5299
    private _deps: IFriendListTabsDeps;

    // AS3: .../domain/FriendListTabs.as::_SafeStr_5431
    private _tabs: FriendListTab[] = [];

    // AS3: .../domain/FriendListTabs.as::_SafeStr_8498
    private _lastSelectedTab: FriendListTab | null = null;

    // AS3: .../domain/FriendListTabs.as::_SafeStr_6349
    private _tabContentHeight: number = 200;

    // AS3: .../domain/FriendListTabs.as::get tabContentHeight()
    get tabContentHeight(): number
    {
        return this._tabContentHeight;
    }

    // AS3: .../domain/FriendListTabs.as::set tabContentHeight()
    set tabContentHeight(value: number)
    {
        this._tabContentHeight = value;
    }

    // AS3: .../domain/FriendListTabs.as::_SafeStr_8975
    private _lastOpenTabContentHeight: number = 200;

    // AS3: .../domain/FriendListTabs.as::_windowWidth
    private _windowWidth: number = 230;

    // AS3: .../domain/FriendListTabs.as::get windowWidth()
    get windowWidth(): number
    {
        return this._windowWidth;
    }

    // AS3: .../domain/FriendListTabs.as::set windowWidth()
    set windowWidth(value: number)
    {
        this._windowWidth = value;
    }

    /** The tab strip is inset by one pixel on each side of the window. */
    // AS3: .../domain/FriendListTabs.as::get tabContentWidth()
    get tabContentWidth(): number
    {
        return this._windowWidth - 2;
    }

    // AS3: .../domain/FriendListTabs.as::getTabs()
    getTabs(): FriendListTab[]
    {
        return this._tabs;
    }

    // AS3: .../domain/FriendListTabs.as::findTab()
    findTab(id: number): FriendListTab | null
    {
        for(const tab of this._tabs)
        {
            if(tab.id === id)
            {
                return tab;
            }
        }

        return null;
    }

    // AS3: .../domain/FriendListTabs.as::clearSelections()
    clearSelections(): void
    {
        for(const tab of this._tabs)
        {
            tab.setSelected(false);
        }
    }

    // AS3: .../domain/FriendListTabs.as::findSelectedTab()
    findSelectedTab(): FriendListTab | null
    {
        for(const tab of this._tabs)
        {
            if(tab.selected)
            {
                return tab;
            }
        }

        return null;
    }

    /**
     * Three cases: nothing open (open `tab`, or the last one used), clicking the open
     * tab or closing outright (collapse, stashing the height), and switching tabs.
     */
    // AS3: .../domain/FriendListTabs.as::toggleSelected()
    toggleSelected(tab: FriendListTab | null): void
    {
        const selected = this.findSelectedTab();

        if(selected === null)
        {
            this._tabContentHeight = this._lastOpenTabContentHeight;
            this.setSelected(this.determineDisplayedTab(tab), true);
        }
        else if(selected === tab || tab === null)
        {
            this._lastOpenTabContentHeight = this._tabContentHeight;
            this._tabContentHeight = 0;
            this.clearSelections();
        }
        else
        {
            this.setSelected(this.determineDisplayedTab(tab), true);
        }
    }

    // AS3: .../domain/FriendListTabs.as::setSelected()
    private setSelected(tab: FriendListTab | null, selected: boolean): void
    {
        if(tab === null)
        {
            return;
        }

        this.clearSelections();
        tab.setSelected(selected);

        if(selected)
        {
            this._lastSelectedTab = tab;
        }
    }

    /** With no tab asked for, reopen the last one used, else the first. */
    // AS3: .../domain/FriendListTabs.as::determineDisplayedTab()
    private determineDisplayedTab(tab: FriendListTab | null): FriendListTab | null
    {
        if(tab !== null)
        {
            return tab;
        }

        if(this._lastSelectedTab !== null)
        {
            return this._lastSelectedTab;
        }

        return this._tabs[0] ?? null;
    }
}
