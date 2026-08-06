import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ILabelWindow} from '@core/window/components/ILabelWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {ErrorReportStorage} from '@core/utils/ErrorReportStorage';
import {FollowFriendMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/FollowFriendMessageComposer';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import {UserInfoRegionUtil} from '@habbo/utils/UserInfoRegionUtil';
import {Util} from './Util';
import {FriendListTabEnum} from './FriendListTabEnum';
import {RelationshipStatusSelector} from './RelationshipStatusSelector';
import {RoomInviteView} from './RoomInviteView';
import {FriendRemoveView} from './FriendRemoveView';
import type {ITabView} from './ITabView';
import type {IFriendsView} from './IFriendsView';
import type {Friend} from './domain/Friend';
import type {FriendCategory} from './domain/FriendCategory';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.FriendsView');

/**
 * FriendsView
 *
 * The friends tab: categories, their friends, the row buttons, and the footer.
 *
 * Rows are recycled, not rebuilt. `refreshList()` walks the item list by index and
 * repaints entry N in place, then blanks every entry past the end — which is why
 * `refreshEntry()` takes a "may I create one" flag and reports back when it ran off
 * the end of the existing rows.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/FriendsView.as
 */
export class FriendsView implements ITabView, IFriendsView
{
    // AS3: .../FriendsView.as::BG_NAME
    static readonly BG_NAME: string = 'bg';

    /** Milliseconds between two room invitations; the button alerts inside it. */
    // AS3: .../FriendsView.as::ROOM_INVITATION_DELAY
    static readonly ROOM_INVITATION_DELAY: number = 60000;

    /** Below this many friends in a category, "select all" is not offered. */
    // AS3: .../FriendsView.as::_SafeStr_11271
    private static readonly SELECT_ALL_MIN_FRIENDS: number = 5;

    /** Recipient cap on a single minimail compose link. */
    // AS3: .../FriendsView.as::onMinimailButtonClick() loop bound
    private static readonly MINIMAIL_MAX_RECIPIENTS: number = 50;

    // AS3: .../FriendsView.as::_friendList
    private _friendList: HabboFriendList | null = null;

    // AS3: .../FriendsView.as::_SafeStr_8997
    private _minimailButton: IWindowContainer | null = null;

    // AS3: .../FriendsView.as::_SafeStr_9901
    private _homeButton: IWindowContainer | null = null;

    // AS3: .../FriendsView.as::_SafeStr_10058
    private _inviteButton: IWindowContainer | null = null;

    // AS3: .../FriendsView.as::_SafeStr_7005
    private _searchButton: IWindowContainer | null = null;

    // AS3: .../FriendsView.as::_SafeStr_9056
    private _removeButton: IWindowContainer | null = null;

    // AS3: .../FriendsView.as::_SafeStr_4880
    private _searchInput: ITextFieldWindow | null = null;

    // AS3: .../FriendsView.as::_SafeStr_7983
    private _clearInputRegion: IRegionWindow | null = null;

    // AS3: .../FriendsView.as::_SafeStr_4652
    private _list: IItemListWindow | null = null;

    // AS3: .../FriendsView.as::_SafeStr_5809
    private _relationshipSelector: RelationshipStatusSelector | null = null;

    // AS3: .../FriendsView.as::_SafeStr_9741
    private _selectAllEnabled: boolean = false;

    // AS3: .../FriendsView.as::init()
    init(friendList: HabboFriendList): void
    {
        this._friendList = friendList;
        this._selectAllEnabled = friendList.getBoolean('friend_list.select_all.enabled');
    }

    /** The tab header counts *online* friends, not all of them. */
    // AS3: .../FriendsView.as::getEntryCount()
    getEntryCount(): number
    {
        return this._friendList?.categories?.getFriendCount(true) ?? 0;
    }

    // AS3: .../FriendsView.as::fillFooter()
    fillFooter(footer: IWindowContainer): void
    {
        this._minimailButton = this.initButton('open_minimail', this.onMinimailButtonClick, footer);
        this._homeButton = this.initButton('open_homepage', this.onHomeButtonClick, footer);
        this._inviteButton = this.initButton('room_invite', this.onInviteButtonClick, footer);
        this._searchButton = this.initButton('search', this.onSearchButtonClick, footer);
        this._removeButton = this.initButton('remove_friend', this.onRemoveButtonClick, footer);

        this._searchInput = footer.findChildByName('friend_search') as ITextFieldWindow | null;
        this._clearInputRegion = footer.findChildByName('clear_input_region') as IRegionWindow | null;

        if(this._searchInput !== null)
        {
            (this._searchInput as unknown as IWindow).procedure = this.searchInputProcedure;
        }

        if(this._clearInputRegion !== null)
        {
            (this._clearInputRegion as unknown as IWindow).procedure = this.clearInputProcedure;
        }

        this.refreshButtons();
    }

    // AS3: .../FriendsView.as::fillList()
    fillList(list: IItemListWindow): void
    {
        this._list = list;
        this.refreshList();
    }

    // AS3: .../FriendsView.as::tabClicked()
    tabClicked(_tabId: number): void
    {
        this._relationshipSelector?.disappear();
    }

    // AS3: .../FriendsView.as::setNewMessageArrived()
    setNewMessageArrived(): void
    {
        this._friendList?.tabs?.findTab(FriendListTabEnum.TABID_FRIENDS)?.setNewMessageArrived(true);
    }

    /**
     * Repaints every row. `autoArrangeItems` is switched off for the duration so the
     * list does not relayout once per row.
     *
     * The trailing loop keeps blanking rows past the last real one until
     * `refreshEntry()` reports there are no more — recycled rows are hidden, never
     * removed.
     */
    // AS3: .../FriendsView.as::refreshList()
    refreshList(): void
    {
        if(this._list === null || this._friendList === null)
        {
            return;
        }

        const filter = this._searchInput !== null && (this._searchInput as unknown as IWindow).visible
            ? this._searchInput.text.toLowerCase()
            : '';

        if(this._relationshipSelector === null)
        {
            this._relationshipSelector = new RelationshipStatusSelector(this._friendList);
        }

        this._relationshipSelector.disappear();
        this._list.autoArrangeItems = false;

        let index = 0;

        for(const category of this._friendList.categories?.getCategories() ?? [])
        {
            category.filter = filter;
            this.refreshEntry(true, index, category, null);
            index++;

            if(category.open)
            {
                const start = category.getStartFriendIndex();
                const end = category.getEndFriendIndex();

                for(let i = start; i < end; i++)
                {
                    this.refreshEntry(true, index, category, category.filteredFriends[i] ?? null);
                    index++;
                }
            }
        }

        for(;;)
        {
            if(this.refreshEntry(false, index, null, null))
            {
                break;
            }

            index++;
        }

        this._list.autoArrangeItems = true;
        this.refreshButtons();
    }

    // AS3: .../FriendsView.as::refreshed()
    refreshed(): void
    {
        this._relationshipSelector?.disappear();
    }

    // AS3: .../FriendsView.as::initButton()
    private initButton(name: string, procedure: (event: WindowEvent, window: IWindow) => void, footer: IWindowContainer): IWindowContainer | null
    {
        const button = footer.findChildByName(`button_${name}`) as IWindowContainer | null;

        if(button === null)
        {
            return null;
        }

        button.procedure = procedure;

        const icon = button.findChildByName('icon') as IBitmapWrapperWindow | null;

        if(icon !== null)
        {
            icon.bitmap = this._friendList?.getButtonImage(name) ?? null;

            if(icon.bitmap !== null)
            {
                icon.width = icon.bitmap.width;
                icon.height = icon.bitmap.height;
            }
        }

        return button;
    }

    /**
     * Paints row `index`, creating it when `mayCreate` allows. Returns true only in the
     * one case the caller loops on: asked to blank a row that does not exist, i.e. the
     * end of the recycled rows.
     */
    // AS3: .../FriendsView.as::refreshEntry()
    private refreshEntry(mayCreate: boolean, index: number, category: FriendCategory | null, friend: Friend | null): boolean
    {
        if(this._list === null || this._friendList === null)
        {
            return true;
        }

        const shaded = index % 2 === 1;
        let entry = this._list.getListItemAt(index) as IWindowContainer | null;

        if(entry === null)
        {
            if(!mayCreate)
            {
                return true;
            }

            entry = this._friendList.getXmlWindow('friend_entry') as IWindowContainer | null;

            if(entry === null)
            {
                logger.error('refreshEntry: getXmlWindow("friend_entry") returned null - layout not registered?');

                return true;
            }

            const userInfoRegion = entry.findChildByName('user_info_region');

            if(userInfoRegion !== null)
            {
                userInfoRegion.procedure = this.onUserInfo;
            }

            this._list.addListItem(entry);
        }

        Util.hideChildren(entry);

        if(!mayCreate)
        {
            entry.height = 0;
            entry.visible = false;

            return false;
        }

        entry.height = 20;
        entry.visible = true;
        entry.color = this._friendList.laf.getRowShadingColor(FriendListTabEnum.TABID_FRIENDS, shaded);

        if(friend === null)
        {
            if(category !== null)
            {
                category.view = entry;
                this.refreshCategoryEntry(category, shaded);
            }
        }
        else
        {
            friend.view = entry;
            this.refreshFriendEntry(category, friend, shaded);
        }

        return false;
    }

    /**
     * A category row carries its id in `tags[0]` — that is how the click handlers find
     * which category was hit, from whichever child of the row received the event.
     */
    // AS3: .../FriendsView.as::refreshCategoryEntry()
    refreshCategoryEntry(category: FriendCategory, shaded: boolean): void
    {
        if(this._list === null || this._friendList === null)
        {
            return;
        }

        const entry = category.view;

        if(entry === null)
        {
            return;
        }

        entry.tags.splice(0, entry.tags.length);
        entry.tags.push(String(category.id));

        this._friendList.refreshText(entry, 'caption', true, `${category.name} (${category.filteredFriends.length})`);
        this.refreshCatIcon(entry, 'arrow_down_black', category.open, category.id, 6);
        this.refreshCatIcon(entry, 'arrow_right_black', !category.open, category.id, 9);

        const selectAllRegion = entry.findChildByName('select_all_region') as IWindowContainer | null;

        if(selectAllRegion !== null)
        {
            if(this._selectAllEnabled)
            {
                selectAllRegion.visible = category.open
                    && category.filteredFriends.length >= FriendsView.SELECT_ALL_MIN_FRIENDS
                    && category.id === 0;

                if(selectAllRegion.visible)
                {
                    const text = selectAllRegion.getChildByName('select_all_text');

                    if(text !== null)
                    {
                        text.caption = this.areAllFriendsSelected(category) ? '${friendlist.unselect_all}' : '${friendlist.select_all}';
                    }
                }

                selectAllRegion.procedure = this.onSelectAllClick;
            }
            else
            {
                selectAllRegion.visible = false;
            }
        }

        entry.procedure = this.onCategoryClick;

        // Hidden while the pager is laid out, so the row is measured once rather than
        // flickering through an intermediate height.
        entry.visible = false;
        this.refreshPager(category, shaded);
        entry.height = Math.max(Util.getLowestPoint(entry), 20);
        entry.visible = true;
    }

    // AS3: .../FriendsView.as::areAllFriendsSelected()
    private areAllFriendsSelected(category: FriendCategory): boolean
    {
        for(const friend of category.friends)
        {
            if(!friend.selected)
            {
                return false;
            }
        }

        return true;
    }

    // AS3: .../FriendsView.as::refreshFriendEntry()
    private refreshFriendEntry(category: FriendCategory | null, friend: Friend | null, shaded: boolean = false): void
    {
        if(category === null || friend === null || this._friendList === null)
        {
            return;
        }

        const entry = friend.view;

        if(entry === null)
        {
            return;
        }

        entry.id = friend.id;
        entry.procedure = this.onFriendClick;
        entry.visible = true;

        if(friend.selected)
        {
            entry.color = this._friendList.laf.getSelectedEntryBgColor();
        }
        else if(shaded)
        {
            entry.color = this._friendList.laf.getRowShadingColor(FriendListTabEnum.TABID_FRIENDS, true);
        }

        const nameLabel = entry.findChildByName('name') as ILabelWindow | null;

        if(nameLabel !== null)
        {
            nameLabel.textColor = this._friendList.laf.getFriendTextColor(friend.selected);
        }

        let displayName = friend.name;

        if(friend.realName !== null && friend.realName !== '')
        {
            displayName = `${displayName} (${friend.realName})`;
        }

        this._friendList.refreshText(entry, 'name', true, displayName);

        // Offline friends still get a chat button when the hotel persists messages and
        // this friend can receive them.
        const persisted = this._friendList.isMessagesPersisted() && (friend.persistedMessageUser || friend.pocketHabboUser);

        this._friendList.refreshButton(entry, 'start_chat', friend.online || persisted, this.onChatButtonClick, friend.id);
        this._friendList.refreshButton(entry, 'follow_friend', friend.followingAllowed, this.onFollowButtonClick, friend.id);
        this._friendList.refreshRelationshipRegion(entry, 'relationship_status', friend.relationshipStatus, this.onRelationshipStatusRegion, friend.id);

        this.refreshFigure(entry, friend);

        const userInfoRegion = entry.findChildByName('user_info_region');

        if(userInfoRegion !== null)
        {
            userInfoRegion.visible = true;
            userInfoRegion.id = friend.id;
        }

        UserInfoRegionUtil.setUserInfoState(false, entry);
    }

    // AS3: .../FriendsView.as::refreshCatIcon()
    private refreshCatIcon(entry: IWindowContainer, iconName: string, visible: boolean, categoryId: number, offset: number): void
    {
        this._friendList?.refreshButton(entry, iconName, visible, this.onCategoryClick, categoryId);

        if(!visible)
        {
            return;
        }

        const caption = entry.findChildByName('caption') as ILabelWindow | null;
        const icon = entry.findChildByName(iconName);

        if(caption !== null && icon !== null)
        {
            icon.x = caption.textWidth + offset;
        }
    }

    /**
     * Draws the friend's head into the row. Group "friends" (negative ids) show the
     * group badge instead of an avatar.
     *
     * AS3 keeps a fixed-size `BitmapData` in the slot and `copyPixels()` the face into
     * it, so the slot is cleared before each draw; here the face is an immutable
     * `ImageBitmap` and is assigned straight to the window, which the renderer draws at
     * the window's own size. The `tags[0]` figure check is kept — it is what stops a
     * redraw on every list refresh.
     */
    // AS3: .../FriendsView.as::refreshFigure()
    private refreshFigure(entry: IWindowContainer, friend: Friend): void
    {
        if(this._friendList === null)
        {
            ErrorReportStorage.addDebugData('FriendsView', 'refreshFigure: _friendList is null!');

            return;
        }

        const face = entry.getChildByName('face') as IBitmapWrapperWindow | null;

        if(face === null)
        {
            ErrorReportStorage.addDebugData('FriendsView', 'refreshFigure: child is null!');

            return;
        }

        if(friend.figure === null || friend.figure === '')
        {
            face.visible = false;

            return;
        }

        if(friend.face === null)
        {
            friend.face = friend.isGroupFriend()
                ? this._friendList.getSmallGroupBadgeBitmap(friend.figure)
                : this._friendList.getAvatarFaceBitmap(friend.figure);
        }

        if(face.tags[0] !== friend.figure)
        {
            face.tags.splice(0, face.tags.length);
            face.tags.push(friend.figure);
            face.bitmap = friend.face;
        }
        else
        {
            logger.trace(`Figure unchanged: ${face.tags[0]}`);
        }

        face.visible = true;
    }

    // AS3: .../FriendsView.as::getBgColor()
    private getBgColor(shaded: boolean): number
    {
        return this._friendList?.laf.getRowShadingColor(FriendListTabEnum.TABID_FRIENDS, shaded) ?? 0;
    }

    // AS3: .../FriendsView.as::refreshButtons()
    private refreshButtons(): void
    {
        const selected = this._friendList?.categories?.getSelectedFriends() ?? [];

        this.setEnabled(this._minimailButton, this.isEnableMinimailButton(selected));
        this.setEnabled(this._homeButton, this.isEnableHomeButton(selected));
        this.setEnabled(this._inviteButton, this.isEnableInviteButton(selected));
        this.setEnabled(this._removeButton, this.isEnableRemoveButton(selected));
    }

    // AS3: .../FriendsView.as::setEnabled()
    private setEnabled(button: IWindowContainer | null, enabled: boolean): void
    {
        if(button === null)
        {
            return;
        }

        if(enabled)
        {
            button.enable();
        }
        else
        {
            button.disable();
        }
    }

    /** With the embedded minimail, the button opens the inbox and needs no selection. */
    // AS3: .../FriendsView.as::isEnableMinimailButton()
    private isEnableMinimailButton(selected: Friend[]): boolean
    {
        return (this._friendList?.isEmbeddedMinimailEnabled() ?? false) || selected.length === 1;
    }

    // AS3: .../FriendsView.as::isEnableHomeButton()
    private isEnableHomeButton(selected: Friend[]): boolean
    {
        return selected.length === 1;
    }

    // AS3: .../FriendsView.as::isEnableInviteButton()
    private isEnableInviteButton(selected: Friend[]): boolean
    {
        if(selected.length < 1)
        {
            return false;
        }

        for(const friend of selected)
        {
            if(friend.online)
            {
                return true;
            }
        }

        return true;
    }

    // AS3: .../FriendsView.as::isEnableRemoveButton()
    private isEnableRemoveButton(selected: Friend[]): boolean
    {
        return selected.length > 0;
    }

    /**
     * The click can land on any child of the category row, so the handler walks up
     * until it finds the window carrying the category id in its tags.
     */
    // AS3: .../FriendsView.as::onSelectAllClick()
    private onSelectAllClick = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        let target: IWindow | null = window;

        while(target !== null && target.tags.length === 0)
        {
            target = target.parent;
        }

        if(target === null)
        {
            return;
        }

        const category = this._friendList?.categories?.findCategory(parseInt(target.tags[0]!, 10)) ?? null;

        if(category === null)
        {
            return;
        }

        const select = !this.areAllFriendsSelected(category);

        for(const friend of category.filteredFriends)
        {
            friend.selected = select;
        }

        this.refreshList();
        this._friendList?.view?.refresh('Selected/unselected all');
    };

    // AS3: .../FriendsView.as::onCategoryClick()
    private onCategoryClick = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        let target: IWindow | null = window;

        logger.trace(`Category clicked: ${target.name}, ${target.tags[0]}`);

        if(target.tags.length === 0)
        {
            target = target.parent;
        }

        if(target === null)
        {
            return;
        }

        const categoryId = parseInt(target.tags[0]!, 10);
        const category = this._friendList?.categories?.findCategory(categoryId) ?? null;

        if(category === null)
        {
            return;
        }

        category.setOpen(!category.open);
        this.refreshList();
        this._friendList?.view?.refresh('Cat open/closed');
    };

    /**
     * Click toggles the selection, double-click opens the chat. Group entries
     * (negative ids) cannot be selected, but the double-click still passes through.
     */
    // AS3: .../FriendsView.as::onFriendClick()
    private onFriendClick = (event: WindowEvent, window: IWindow): void =>
    {
        let target: IWindow | null = window;

        if(target === null)
        {
            return;
        }

        if(target.id === 0)
        {
            target = target.parent;

            if(target === null)
            {
                return;
            }
        }

        if(event.type !== 'WME_CLICK' && event.type !== 'WME_DOUBLE_CLICK')
        {
            return;
        }

        const friend = this._friendList?.categories?.findFriend(target.id) ?? null;

        if(friend !== null && friend.id > 0)
        {
            friend.selected = !friend.selected;
            this.refreshButtons();
            this.refreshList();
        }

        if(event.type === 'WME_DOUBLE_CLICK' && friend !== null && friend.online)
        {
            this._friendList?.messenger?.startConversation(friend.id);
        }
    };

    // AS3: .../FriendsView.as::onChatButtonClick()
    private onChatButtonClick = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.im}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug(`chat clicked: ${window.name}, ${window.id}`);

        this._friendList?.messenger?.startConversation(window.id);
    };

    // AS3: .../FriendsView.as::onFollowButtonClick()
    private onFollowButtonClick = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.follow}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        this._friendList?.send(new FollowFriendMessageComposer(window.id));
        this._friendList?.send(new EventLogMessageComposer('Navigation', 'Friend List', 'go.friendlist'));
    };

    // AS3: .../FriendsView.as::onRelationshipStatusRegion()
    private onRelationshipStatusRegion = (event: WindowEvent, window: IWindow): void =>
    {
        let target: IWindow | null = window;

        if(target === null)
        {
            return;
        }

        if(target.id === 0)
        {
            target = target.parent;

            if(target === null)
            {
                return;
            }
        }

        this._friendList?.view?.showInfo(event, '${friendlist.tip.relationship}');

        if(event.type === 'WME_CLICK' && this._relationshipSelector !== null)
        {
            this._relationshipSelector.friendId = target.id;
            this._relationshipSelector.appearAt(target, this._friendList?.view?.mainWindow ?? null);
        }
    };

    // AS3: .../FriendsView.as::onUserInfo()
    private onUserInfo = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${infostand.profile.link.tooltip}');

        if(event.type === 'WME_OVER')
        {
            UserInfoRegionUtil.setUserInfoState(true, window as IWindowContainer);
        }
        else if(event.type === 'WME_OUT')
        {
            UserInfoRegionUtil.setUserInfoState(false, window as IWindowContainer);
        }
        else if(event.type === 'WME_CLICK')
        {
            this._friendList?.trackGoogle('extendedProfile', 'friendList_friendsView');

            const parent = window.parent;

            if(parent !== null)
            {
                this._friendList?.send(new GetExtendedProfileMessageComposer(parent.id));
            }
        }
    };

    /**
     * With no selection this only does something when the minimail is embedded — the
     * external compose link needs recipients.
     */
    // AS3: .../FriendsView.as::onMinimailButtonClick()
    private onMinimailButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.compose}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        const selected = this._friendList?.categories?.getSelectedFriends() ?? [];

        if(selected.length === 0)
        {
            logger.debug('No friend found when minimail clicked');

            if(this._friendList?.isEmbeddedMinimailEnabled())
            {
                HabboWebTools.openMinimail('#mail/inbox/');
            }

            return;
        }

        const recipientIds: number[] = [];

        for(let i = 0; i < selected.length && i < FriendsView.MINIMAIL_MAX_RECIPIENTS; i++)
        {
            recipientIds.push(selected[i]!.id);
        }

        const parameters = new Map<string, string>();

        parameters.set('recipientid', recipientIds.join(','));
        parameters.set('random', `${Math.round(Math.random() * 100000000)}`);

        const mouseEvent = event as WindowMouseEvent;

        if(this._friendList?.isEmbeddedMinimailEnabled())
        {
            HabboWebTools.openMinimail(`#mail/compose/${parameters.get('recipientid')}/${parameters.get('random')}/`);
        }
        else
        {
            this._friendList?.openHabboWebPage('link.format.mail.compose', parameters, mouseEvent.stageX, mouseEvent.stageY);
        }
    };

    // AS3: .../FriendsView.as::onHomeButtonClick()
    private onHomeButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.home}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        const friend = this._friendList?.categories?.getSelectedFriend() ?? null;

        if(friend === null)
        {
            logger.debug('No friend found when home clicked');

            return;
        }

        const parameters = new Map<string, string>();

        parameters.set('ID', `${friend.id}`);
        parameters.set('username', friend.name);

        const mouseEvent = event as WindowMouseEvent;

        this._friendList?.openHabboWebPage('link.format.userpage', parameters, mouseEvent.stageX, mouseEvent.stageY);
    };

    // AS3: .../FriendsView.as::onInviteButtonClick()
    private onInviteButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.invite}');

        if(event.type !== 'WME_CLICK' || this._friendList === null)
        {
            return;
        }

        if(this._friendList.getTimer() - this._friendList.lastRoomInvitationTime < FriendsView.ROOM_INVITATION_DELAY)
        {
            this._friendList.simpleAlert('${friendlist.invite.frequentalert.title}', '${friendlist.invite.frequentalert.text}');

            return;
        }

        new RoomInviteView(this._friendList).show();
    };

    /** The search button is replaced by the input field it reveals. */
    // AS3: .../FriendsView.as::onSearchButtonClick()
    private onSearchButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        if(this._searchButton === null)
        {
            return;
        }

        this._friendList?.view?.showInfo(event, '${friendlist.tip.search}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        this._searchButton.visible = false;

        if(this._searchInput !== null)
        {
            (this._searchInput as unknown as IWindow).visible = true;
            this._searchInput.focus();
        }

        if(this._clearInputRegion !== null)
        {
            (this._clearInputRegion as unknown as IWindow).visible = true;
        }
    };

    /** Enter applies the filter, Escape clears it; typing alone does nothing. */
    // AS3: .../FriendsView.as::searchInputProcedure()
    private searchInputProcedure = (event: WindowEvent, _window: IWindow): void =>
    {
        if(this._searchButton === null)
        {
            return;
        }

        this._friendList?.view?.showInfo(event, '${friendlist.tip.search}');

        const keyboardEvent = event as WindowKeyboardEvent;

        if(keyboardEvent === null || keyboardEvent.keyCode === undefined)
        {
            return;
        }

        if(keyboardEvent.keyCode === 27)
        {
            this.clearInput();
        }
        else if(keyboardEvent.keyCode === 13)
        {
            this.refreshList();
            this._friendList?.view?.refresh('Apply filter');
            this._searchInput?.focus();
        }
    };

    // AS3: .../FriendsView.as::clearInputProcedure()
    private clearInputProcedure = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        this.clearInput();
    };

    // AS3: .../FriendsView.as::clearInput()
    private clearInput(): void
    {
        if(this._searchInput !== null)
        {
            this._searchInput.text = '';
            (this._searchInput as unknown as IWindow).visible = false;
        }

        if(this._searchButton !== null)
        {
            this._searchButton.visible = true;
        }

        if(this._clearInputRegion !== null)
        {
            (this._clearInputRegion as unknown as IWindow).visible = false;
        }

        this.refreshList();
        this._friendList?.view?.refresh('Clear filter');
    }

    // AS3: .../FriendsView.as::onRemoveButtonClick()
    private onRemoveButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.remove}');

        if(event.type !== 'WME_CLICK' || this._friendList === null)
        {
            return;
        }

        new FriendRemoveView(this._friendList).show();
    };

    /**
     * A category over one page grows a row of page links; under that, the pager is
     * hidden entirely.
     */
    // AS3: .../FriendsView.as::refreshPager()
    private refreshPager(category: FriendCategory, shaded: boolean): void
    {
        const pager = category.view?.findChildByName('pager') as IWindowContainer | null;

        if(pager === null)
        {
            return;
        }

        if(category.getPageCount() < 2 || !category.open)
        {
            logger.trace(`PAGER NOT VISIBLE: ${category.open}, ${category.getPageCount()}`);
            pager.visible = false;

            return;
        }

        pager.visible = true;
        Util.hideChildren(pager);

        for(let page = 0; page < category.getPageCount(); page++)
        {
            this.refreshPageLink(pager, page, category.pageIndex, shaded);
        }

        Util.layoutChildrenInArea(pager, pager.width, 15);
        pager.height = Util.getLowestPoint(pager);
    }

    /** Page links are built once per page index and then reused, keyed by name. */
    // AS3: .../FriendsView.as::refreshPageLink()
    private refreshPageLink(pager: IWindowContainer, page: number, currentPage: number, shaded: boolean): void
    {
        const name = `page.${page}`;
        let link = pager.getChildByName(name) as ITextWindowLink | null;

        if(link === null)
        {
            link = this._friendList?.getXmlWindow('pagelink') as ITextWindowLink | null;

            if(link === null)
            {
                logger.error('refreshPageLink: getXmlWindow("pagelink") returned null - layout not registered?');

                return;
            }

            link.name = name;
            pager.addChild(link as unknown as IWindow);
        }

        // The current page is the one *not* underlined.
        link.underline = page !== currentPage;
        link.text = `${page * 100 + 1}-${(page + 1) * 100}`;
        link.id = page;
        link.procedure = this.onPageLinkClick;
        link.width = link.textWidth + 5;
        link.color = this._friendList?.laf.getRowShadingColor(FriendListTabEnum.TABID_FRIENDS, shaded) ?? 0;
        link.visible = true;
    }

    // AS3: .../FriendsView.as::onPageLinkClick()
    private onPageLinkClick = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        // pager -> category row: the id lives two levels up.
        const categoryId = parseInt(window.parent?.parent?.tags[0] ?? '', 10);
        const page = window.id;

        logger.trace(`Page link clicked: ${categoryId}, ${page}`);

        const category = this._friendList?.categories?.findCategory(categoryId) ?? null;

        if(category === null)
        {
            return;
        }

        category.pageIndex = page;
        this.refreshList();
    };
}

/**
 * The pager's link windows are text windows with an `underline` flag; the layout gives
 * them no dedicated interface, so this is the shape `FriendsView` uses them through.
 */
type ITextWindowLink = IWindow & {text: string; textWidth: number; underline: boolean};
