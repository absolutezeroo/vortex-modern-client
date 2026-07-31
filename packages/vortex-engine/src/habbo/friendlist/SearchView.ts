import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {Logger} from '@core/utils/Logger';
import {HabboSearchMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/HabboSearchMessageComposer';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {UserInfoRegionUtil} from '@habbo/utils/UserInfoRegionUtil';
import {FriendListTabEnum} from './FriendListTabEnum';
import type {ITabView} from './ITabView';
import type {ISearchView} from './ISearchView';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.SearchView');

/**
 * SearchView
 *
 * The search tab. One flat list holds four kinds of row — a "friends" caption, the
 * matching friends, an "others" caption, then everyone else — so `refreshList()` walks
 * a single index and decides from its value which of the four it is at.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/SearchView.as
 */
export class SearchView implements ITabView, ISearchView
{
    /** Longest query the field accepts; enforced by truncating on each key. */
    // AS3: .../SearchView.as::onSearchStrInput() local `_loc2_`
    private static readonly MAX_QUERY_LENGTH: number = 25;

    // AS3: .../SearchView.as::_friendList
    private _friendList: HabboFriendList | null = null;

    // AS3: .../SearchView.as::_searchStr
    private _searchStr: ITextFieldWindow | null = null;

    // AS3: .../SearchView.as::_SafeStr_4652
    private _list: IItemListWindow | null = null;

    // AS3: .../SearchView.as::init()
    init(friendList: HabboFriendList): void
    {
        this._friendList = friendList;
    }

    // AS3: .../SearchView.as::getEntryCount()
    getEntryCount(): number
    {
        const results = this._friendList?.searchResults ?? null;

        if(results === null || results.friends === null)
        {
            return 0;
        }

        return results.friends.length + (results.others?.length ?? 0);
    }

    // AS3: .../SearchView.as::fillList()
    fillList(list: IItemListWindow): void
    {
        this._list = list;
    }

    // AS3: .../SearchView.as::fillFooter()
    fillFooter(footer: IWindowContainer): void
    {
        this._searchStr = footer.findChildByName('search_str') as ITextFieldWindow | null;

        if(this._searchStr !== null)
        {
            const field = this._searchStr as unknown as IWindow;

            field.procedure = this.onSearchInput;
            field.addEventListener('WKE_KEY_DOWN', this.onSearchStrInput);
        }

        const searchButton = footer.findChildByName('search_but');

        if(searchButton !== null)
        {
            searchButton.procedure = this.onSearchButtonClick;
        }

        this._friendList?.refreshButton(footer, 'search', true, null, 0);
    }

    // AS3: .../SearchView.as::tabClicked()
    tabClicked(_tabId: number): void
    {
        // Intentionally empty - see AS3.
    }

    /**
     * Rows are recycled like the friends tab's. Index 0 is always the friends caption
     * and index `friends.length + 1` the others caption, so the two blocks are offset
     * by one and two respectively.
     */
    // AS3: .../SearchView.as::refreshList()
    refreshList(): void
    {
        const results = this._friendList?.searchResults ?? null;

        if(this._list === null || this._friendList === null || results === null)
        {
            return;
        }

        this._list.autoArrangeItems = false;

        const friends = results.friends ?? [];
        const others = results.others ?? [];

        let index = 0;

        for(;;)
        {
            const persisted = this._friendList.isMessagesPersisted();

            if(index === 0)
            {
                this.refreshEntry(true, index, null, null, this.getFriendsCaption(), false, false, 0);
            }
            else if(index <= friends.length)
            {
                const result = friends[index - 1]!;

                this.refreshEntry(true, index, result.avatarFigure, result.avatarName, null, result.isAvatarOnline || persisted, false, result.avatarId);
            }
            else if(index === friends.length + 1)
            {
                this.refreshEntry(true, index, null, null, this.getOthersCaption(), false, false, 0);
            }
            else if(index <= friends.length + others.length + 1)
            {
                const result = others[index - 2 - friends.length]!;

                // "Add friend" is offered for everyone but yourself, and only until a
                // request has been sent this session.
                const askable = result.avatarId !== this._friendList.avatarId && !results.isFriendRequestSent(result.avatarId);

                this.refreshEntry(true, index, result.avatarFigure, result.avatarName, null, false, askable, result.avatarId);
            }
            else if(this.refreshEntry(false, index, null, null, null, false, false, 0))
            {
                break;
            }

            index++;
        }

        this.refreshShading();
        this._list.autoArrangeItems = true;
    }

    // AS3: .../SearchView.as::setSearchStr()
    setSearchStr(searchStr: string): void
    {
        if(this._searchStr !== null)
        {
            this._searchStr.text = searchStr;
        }
    }

    // AS3: .../SearchView.as::focus()
    focus(): void
    {
        this._searchStr?.focus();
    }

    /**
     * Shading is applied over the finished list rather than per row, because the two
     * captions take part in the alternation.
     */
    // AS3: .../SearchView.as::refreshShading()
    private refreshShading(): void
    {
        if(this._list === null || this._friendList === null)
        {
            return;
        }

        for(let i = 0; i < this._list.numListItems; i++)
        {
            const item = this._list.getListItemAt(i);

            if(item !== null)
            {
                item.color = this._friendList.laf.getRowShadingColor(FriendListTabEnum.TABID_SEARCH, i % 2 === 1);
            }
        }
    }

    // AS3: .../SearchView.as::getFriendsCaption()
    private getFriendsCaption(): string
    {
        const count = this._friendList?.searchResults?.friends?.length ?? 0;

        if(count === 0)
        {
            return '${friendlist.search.nofriendsfound}';
        }

        this._friendList?.registerParameter('friendlist.search.friendscaption', 'cnt', `${count}`);

        return '${friendlist.search.friendscaption}';
    }

    // AS3: .../SearchView.as::getOthersCaption()
    private getOthersCaption(): string
    {
        const count = this._friendList?.searchResults?.others?.length ?? 0;

        if(count === 0)
        {
            return '${friendlist.search.noothersfound}';
        }

        this._friendList?.registerParameter('friendlist.search.otherscaption', 'cnt', `${count}`);

        return '${friendlist.search.otherscaption}';
    }

    // AS3: .../SearchView.as::refreshEntry()
    private refreshEntry(
        visible: boolean,
        index: number,
        figure: string | null,
        name: string | null,
        caption: string | null,
        canChat: boolean,
        canAskForFriend: boolean,
        avatarId: number
    ): boolean
    {
        if(this._list === null || this._friendList === null)
        {
            return true;
        }

        let entry = this._list.getListItemAt(index) as IWindowContainer | null;

        if(entry === null)
        {
            if(!visible)
            {
                return true;
            }

            entry = this._friendList.getXmlWindow('search_entry') as IWindowContainer | null;

            if(entry === null)
            {
                logger.error('refreshEntry: getXmlWindow("search_entry") returned null - layout not registered?');

                return true;
            }

            const bgRegion = entry.findChildByName('bg_region');

            if(bgRegion !== null)
            {
                bgRegion.procedure = this.onSearchEntry;
            }

            this._list.addListItem(entry);
        }

        if(visible)
        {
            entry.height = 20;
            entry.visible = true;
        }
        else
        {
            entry.height = 0;
            entry.visible = false;
        }

        entry.id = avatarId;

        const bgRegion = entry.findChildByName('bg_region');

        if(bgRegion !== null)
        {
            bgRegion.id = avatarId;
        }

        // Negative ids are groups, and show a badge rather than a face.
        this.refreshFigure(entry, figure, avatarId < 0);

        this._friendList.refreshText(entry, 'name', name !== null, name ?? '');
        this._friendList.refreshText(entry, 'caption', caption !== null, caption ?? '');
        this._friendList.refreshButton(entry, 'start_chat', canChat, this.onChatButtonClick, avatarId);
        this._friendList.refreshButton(entry, 'ask_for_friend', canAskForFriend, this.onAskForFriendButtonClick, avatarId);

        UserInfoRegionUtil.setUserInfoState(false, entry);

        const userInfoRegion = entry.findChildByName('user_info_region');

        if(userInfoRegion !== null)
        {
            userInfoRegion.visible = avatarId > 0;
        }

        return false;
    }

    // AS3: .../SearchView.as::refreshFigure()
    private refreshFigure(entry: IWindowContainer, figure: string | null, isGroup: boolean = false): void
    {
        const face = entry.getChildByName('face') as IBitmapWrapperWindow | null;

        if(face === null)
        {
            return;
        }

        if(figure === null || figure === '')
        {
            face.visible = false;

            return;
        }

        face.bitmap = isGroup
            ? this._friendList?.getSmallGroupBadgeBitmap(figure) ?? null
            : this._friendList?.getAvatarFaceBitmap(figure) ?? null;

        if(face.bitmap !== null)
        {
            face.width = face.bitmap.width;
            face.height = face.bitmap.height;
        }

        face.visible = true;
    }

    // AS3: .../SearchView.as::onSearchEntry()
    private onSearchEntry = (event: WindowEvent, window: IWindow): void =>
    {
        if(window.id < 1)
        {
            return;
        }

        this._friendList?.view?.showInfo(event, '${infostand.profile.link.tooltip}');

        const parent = window.parent as IWindowContainer | null;

        if(event.type === 'WME_OVER' && parent !== null)
        {
            UserInfoRegionUtil.setUserInfoState(true, parent);
        }
        else if(event.type === 'WME_OUT' && parent !== null)
        {
            UserInfoRegionUtil.setUserInfoState(false, parent);
        }
        else if(event.type === 'WME_CLICK')
        {
            this._friendList?.trackGoogle('extendedProfile', 'friendList_friendsSearch');
            this._friendList?.send(new GetExtendedProfileMessageComposer(window.id));
        }
    };

    // AS3: .../SearchView.as::onSearchButtonClick()
    private onSearchButtonClick = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.search}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug(`Search clicked: ${window.name}`);

        this.searchAvatar();
    };

    /**
     * The request is refused locally when the friend list is full or the target is
     * already a friend; only the accepted case repaints the row, to drop its button.
     */
    // AS3: .../SearchView.as::onAskForFriendButtonClick()
    private onAskForFriendButtonClick = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.addfriend}');

        if(event.type !== 'WME_CLICK' || this._friendList === null)
        {
            return;
        }

        logger.debug(`Ask for friend clicked: ${window.id}`);

        const result = this._friendList.searchResults?.getResult(window.id) ?? null;

        if(result === null)
        {
            logger.warn(`No search result found with id: ${window.id}`);

            return;
        }

        logger.trace(`Search result found: ${result.avatarName}`);

        if(!this._friendList.askForAFriend(result.avatarId, result.avatarName))
        {
            this._friendList.showLimitReachedAlert();
        }
        else
        {
            this._friendList.showFriendRequestSentAlert(result.avatarName);
            this.refreshEntry(true, this.findIndexFor(result.avatarId), result.avatarFigure, result.avatarName, null, false, false, result.avatarId);
        }
    };

    // AS3: .../SearchView.as::findIndexFor()
    private findIndexFor(avatarId: number): number
    {
        if(this._list === null)
        {
            return -1;
        }

        for(let i = 0; i < this._list.numListItems; i++)
        {
            if(this._list.getListItemAt(i)?.id === avatarId)
            {
                return i;
            }
        }

        return -1;
    }

    // AS3: .../SearchView.as::onChatButtonClick()
    private onChatButtonClick = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.im}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        const result = this._friendList?.searchResults?.getResult(window.id) ?? null;

        if(result === null)
        {
            logger.warn(`No search result found with id: ${window.id}`);

            return;
        }

        this._friendList?.messenger?.startConversation(result.avatarId);
    };

    // AS3: .../SearchView.as::onSearchInput()
    private onSearchInput = (event: WindowEvent, _window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.searchstr}');
    };

    // AS3: .../SearchView.as::onSearchStrInput()
    private onSearchStrInput = (event: WindowEvent): void =>
    {
        const keyboardEvent = event as WindowKeyboardEvent;

        if(this._searchStr === null)
        {
            return;
        }

        if(keyboardEvent.charCode === 13)
        {
            this.searchAvatar();
        }
        else
        {
            const text = this._searchStr.text;

            if(text.length > SearchView.MAX_QUERY_LENGTH)
            {
                this._searchStr.text = text.substring(0, SearchView.MAX_QUERY_LENGTH);
            }
        }
    };

    // AS3: .../SearchView.as::searchAvatar()
    private searchAvatar(): void
    {
        const query = this._searchStr?.text ?? '';

        logger.debug(`Search avatar: ${query}`);

        if(query === '')
        {
            logger.trace('No text...');

            return;
        }

        this._friendList?.send(new HabboSearchMessageComposer(query));
    }
}
