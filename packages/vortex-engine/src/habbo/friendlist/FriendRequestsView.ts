import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {AcceptFriendMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/AcceptFriendMessageComposer';
import {DeclineFriendMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/DeclineFriendMessageComposer';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {UserInfoRegionUtil} from '@habbo/utils/UserInfoRegionUtil';
import {Util} from './Util';
import {FriendListTabEnum} from './FriendListTabEnum';
import {FriendRequest} from './domain/FriendRequest';
import {FriendRequestEvent} from './events/FriendRequestEvent';
import type {ITabView} from './ITabView';
import type {IFriendRequestsView} from './IFriendRequestsView';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.FriendRequestsView');

/**
 * FriendRequestsView
 *
 * The friend-requests tab. Unlike the other two tabs, rows are not recycled — each
 * `FriendRequest` owns its row window and destroys it with itself.
 *
 * A resolved request keeps its row, showing "accepted"/"declined"/"failed" instead of
 * its buttons, and is only swept when the tab is next clicked.
 *
 * The primary tree obfuscates this class to `_SafeCls_3766` and no tree recovers it.
 * **The name `FriendRequestsView` is derived**, from the two interfaces it implements
 * (`ITabView` and the requests-view interface) and from `FriendListTabs`, which builds
 * it as the tab-2 view alongside `FriendsView` and `SearchView`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_3766.as
 */
export class FriendRequestsView implements ITabView, IFriendRequestsView
{
    // AS3: .../_SafeCls_3766.as::NO_REQS_INFO
    private static readonly NO_REQS_INFO: string = 'no_reqs_info';

    // AS3: .../_SafeCls_3766.as::_friendList
    private _friendList: HabboFriendList | null = null;

    // AS3: .../_SafeCls_3766.as::_SafeStr_4652
    private _list: IItemListWindow | null = null;

    // AS3: .../_SafeCls_3766.as::_SafeStr_8436
    private _acceptAllButton: IWindowContainer | null = null;

    // AS3: .../_SafeCls_3766.as::_SafeStr_8666
    private _rejectAllButton: IWindowContainer | null = null;

    // AS3: .../_SafeCls_3766.as::init()
    init(friendList: HabboFriendList): void
    {
        this._friendList = friendList;
    }

    // AS3: .../_SafeCls_3766.as::getEntryCount()
    getEntryCount(): number
    {
        return this._friendList?.friendRequests?.getCountOfOpenRequests() ?? 0;
    }

    // AS3: .../_SafeCls_3766.as::fillFooter()
    fillFooter(footer: IWindowContainer): void
    {
        this._acceptAllButton = footer.findChildByName('accept_all_but') as IWindowContainer | null;
        this._rejectAllButton = footer.findChildByName('reject_all_but') as IWindowContainer | null;

        if(this._rejectAllButton !== null)
        {
            this._rejectAllButton.procedure = this.onDismissAllButtonClick;
        }

        if(this._acceptAllButton !== null)
        {
            this._acceptAllButton.procedure = this.onAcceptAllButtonClick;
        }

        this.refreshButtons();
    }

    // AS3: .../_SafeCls_3766.as::fillList()
    fillList(list: IItemListWindow): void
    {
        this._list = list;

        for(const request of this._friendList?.friendRequests?.requests ?? [])
        {
            this.getRequestEntry(request);
            this.refreshRequestEntry(request);

            if(request.view !== null)
            {
                list.addListItem(request.view);
            }
        }

        this._friendList?.friendRequests?.refreshShading();
    }

    /** Opening any tab sweeps the requests that have already been answered. */
    // AS3: .../_SafeCls_3766.as::tabClicked()
    tabClicked(_tabId: number): void
    {
        if(this._list === null)
        {
            return;
        }

        this._friendList?.friendRequests?.clearAndUpdateView(true);
    }

    // AS3: .../_SafeCls_3766.as::refreshShading()
    refreshShading(request: FriendRequest, shaded: boolean): void
    {
        if(this._list === null || this._friendList === null || request.view === null)
        {
            return;
        }

        request.view.color = this._friendList.laf.getRowShadingColor(FriendListTabEnum.TABID_FRIEND_REQUESTS, shaded);

        this.setButtonBg(request.view, 'reject');
        this.setButtonBg(request.view, 'accept');
    }

    // AS3: .../_SafeCls_3766.as::refreshRequestEntry()
    refreshRequestEntry(request: FriendRequest): void
    {
        if(this._list === null || this._friendList === null)
        {
            return;
        }

        const entry = request.view;

        if(entry === null)
        {
            return;
        }

        Util.hideChildren(entry);

        const bgRegion = entry.findChildByName('bg_region');

        if(bgRegion !== null)
        {
            bgRegion.visible = true;
            bgRegion.procedure = this.onEntry;
            bgRegion.id = request.requesterUserId;
        }

        const userInfoRegion = entry.findChildByName('user_info_region');

        if(userInfoRegion !== null)
        {
            userInfoRegion.visible = true;
        }

        UserInfoRegionUtil.setUserInfoState(false, entry);

        this._friendList.refreshText(entry, 'requester_name_text', true, request.requesterName);

        if(request.state === FriendRequest.STATE_OPEN)
        {
            this._friendList.refreshIcon(entry, 'accept', true, this.onAcceptButtonClick, request.requestId);
            this._friendList.refreshIcon(entry, 'reject', true, this.onDeclineButtonClick, request.requestId);
        }
        else if(request.state === FriendRequest.STATE_ACCEPTED)
        {
            this._friendList.refreshText(entry, 'info_text', true, '${friendlist.request.accepted}');
        }
        else if(request.state === FriendRequest.STATE_DECLINED)
        {
            this._friendList.refreshText(entry, 'info_text', true, '${friendlist.request.declined}');
        }
        else if(request.state === FriendRequest.STATE_FAILED)
        {
            this._friendList.refreshText(entry, 'info_text', true, '${friendlist.request.failed}');
        }
    }

    // AS3: .../_SafeCls_3766.as::addRequest()
    addRequest(request: FriendRequest): void
    {
        if(this._list === null)
        {
            return;
        }

        this.getRequestEntry(request);
        this.refreshRequestEntry(request);

        if(request.view !== null)
        {
            this._list.addListItem(request.view);
        }

        this._friendList?.friendRequests?.refreshShading();
        this.refreshButtons();
    }

    // AS3: .../_SafeCls_3766.as::removeRequest()
    removeRequest(request: FriendRequest): void
    {
        if(this._list === null || request.view === null)
        {
            return;
        }

        this._list.removeListItem(request.view);
        this.refreshButtons();
    }

    /**
     * Accepting is refused locally when the list is already full — the state is set to
     * accepted first regardless, matching AS3.
     */
    // AS3: .../_SafeCls_3766.as::acceptRequest()
    acceptRequest(requestId: number): void
    {
        const request = this._friendList?.friendRequests?.getRequest(requestId) ?? null;

        if(request === null || this._friendList === null)
        {
            return;
        }

        request.state = FriendRequest.STATE_ACCEPTED;

        const friendCount = this._friendList.categories?.getFriendCount(false) ?? 0;
        const limit = this._friendList.friendRequests?.limit ?? 0;

        if(friendCount >= limit)
        {
            this._friendList.showLimitReachedAlert();

            return;
        }

        this._friendList.send(new AcceptFriendMessageComposer(request.requestId));
        this.refreshRequestEntry(request);
        this.refresh();

        this._friendList.events.emit(FriendRequestEvent.ACCEPTED, new FriendRequestEvent(FriendRequestEvent.ACCEPTED, requestId));
    }

    // AS3: .../_SafeCls_3766.as::acceptAllRequests()
    acceptAllRequests(): void
    {
        if(this._friendList === null)
        {
            return;
        }

        const friendCount = this._friendList.categories?.getFriendCount(false) ?? 0;
        const requests = this._friendList.friendRequests?.requests ?? [];
        const limit = this._friendList.friendRequests?.limit ?? 0;

        if(friendCount + requests.length > limit)
        {
            this._friendList.showLimitReachedAlert();

            return;
        }

        const accepted: number[] = [];

        for(const request of requests)
        {
            if(request.state !== FriendRequest.STATE_ACCEPTED && request.state !== FriendRequest.STATE_DECLINED)
            {
                accepted.push(request.requestId);
                request.state = FriendRequest.STATE_ACCEPTED;
                this.refreshRequestEntry(request);

                this._friendList.events.emit(FriendRequestEvent.ACCEPTED, new FriendRequestEvent(FriendRequestEvent.ACCEPTED, request.requestId));
            }
        }

        this._friendList.send(new AcceptFriendMessageComposer(...accepted));
        this.refresh();
    }

    // AS3: .../_SafeCls_3766.as::declineRequest()
    declineRequest(requestId: number): void
    {
        const request = this._friendList?.friendRequests?.getRequest(requestId) ?? null;

        if(request === null || this._friendList === null)
        {
            return;
        }

        request.state = FriendRequest.STATE_DECLINED;

        this._friendList.send(new DeclineFriendMessageComposer(false, requestId));
        this.refreshRequestEntry(request);
        this.refresh();

        this._friendList.events.emit(FriendRequestEvent.DECLINED, new FriendRequestEvent(FriendRequestEvent.DECLINED, requestId));
    }

    /**
     * The "decline all" packet carries no ids — an empty decline *is* decline-all on
     * the wire — so it goes out before the rows are walked, not per row.
     */
    // AS3: .../_SafeCls_3766.as::declineAllRequests()
    declineAllRequests(): void
    {
        if(this._friendList === null)
        {
            return;
        }

        this._friendList.send(new DeclineFriendMessageComposer(true));

        for(const request of this._friendList.friendRequests?.requests ?? [])
        {
            if(request.state !== FriendRequest.STATE_ACCEPTED && request.state !== FriendRequest.STATE_DECLINED)
            {
                request.state = FriendRequest.STATE_DECLINED;
                this.refreshRequestEntry(request);

                this._friendList.events.emit(FriendRequestEvent.DECLINED, new FriendRequestEvent(FriendRequestEvent.DECLINED, request.requestId));
            }
        }

        this.refresh();
    }

    /** The accept/reject buttons sit on the row and take its shading colour. */
    // AS3: .../_SafeCls_3766.as::setButtonBg()
    private setButtonBg(entry: IWindowContainer, name: string): void
    {
        const button = entry.findChildByName(name);

        if(button !== null)
        {
            button.color = entry.color;
        }
    }

    // AS3: .../_SafeCls_3766.as::getRequestEntry()
    private getRequestEntry(request: FriendRequest): void
    {
        const entry = this._friendList?.getXmlWindow('friend_request_entry') as IWindowContainer | null;

        if(entry === null)
        {
            logger.error('getRequestEntry: getXmlWindow("friend_request_entry") returned null - layout not registered?');

            return;
        }

        request.view = entry;
    }

    // AS3: .../_SafeCls_3766.as::onAcceptButtonClick()
    private onAcceptButtonClick = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.accept}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug(`accept clicked: ${window.id}`);

        this.acceptRequest(window.id);
    };

    // AS3: .../_SafeCls_3766.as::onDeclineButtonClick()
    private onDeclineButtonClick = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.decline}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug(`decline clicked: ${window.id}`);

        this.declineRequest(window.id);
    };

    // AS3: .../_SafeCls_3766.as::onEntry()
    private onEntry = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${infostand.profile.link.tooltip}');

        UserInfoRegionUtil.onEntry(event, window);

        if(event.type === 'WME_CLICK')
        {
            this._friendList?.trackGoogle('extendedProfile', 'friendList_friendRequests');
            this._friendList?.send(new GetExtendedProfileMessageComposer(window.id));
        }
    };

    // AS3: .../_SafeCls_3766.as::onDismissAllButtonClick()
    private onDismissAllButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.declineall}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug('Dismiss all clicked');

        this.declineAllRequests();
    };

    // AS3: .../_SafeCls_3766.as::onAcceptAllButtonClick()
    private onAcceptAllButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        this._friendList?.view?.showInfo(event, '${friendlist.tip.acceptall}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug('Accept all clicked');

        this.acceptAllRequests();
    };

    // AS3: .../_SafeCls_3766.as::refresh()
    private refresh(): void
    {
        this.refreshButtons();
    }

    // AS3: .../_SafeCls_3766.as::refreshButtons()
    private refreshButtons(): void
    {
        const hasOpen = (this._friendList?.friendRequests?.getCountOfOpenRequests() ?? 0) > 0;

        this.setEnabled(this._acceptAllButton, hasOpen);
        this.setEnabled(this._rejectAllButton, hasOpen);
    }

    // AS3: .../_SafeCls_3766.as::setEnabled()
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
}
