import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {GuildMemberData} from '@habbo/communication/messages/incoming/users/GuildMemberData';
import type {
    GuildMemberEntryData
} from '@habbo/communication/messages/incoming/users/GuildMemberEntryData';
import type {
    GuildMembersMessageEvent
} from '@habbo/communication/messages/incoming/users/GuildMembersMessageEvent';
import type {
    GuildMembershipUpdatedMessageEvent
} from '@habbo/communication/messages/incoming/users/GuildMembershipUpdatedMessageEvent';
import type {
    GuildMemberMgmtFailedMessageEvent
} from '@habbo/communication/messages/incoming/users/GuildMemberMgmtFailedMessageEvent';
import type {
    GuildMembershipRejectedMessageEvent
} from '@habbo/communication/messages/incoming/users/GuildMembershipRejectedMessageEvent';
import type {
    GuildMembershipRejectedMessageParser
} from '@habbo/communication/messages/parser/users/GuildMembershipRejectedMessageParser';
import type {
    GroupMembershipRequestedMessageEvent
} from '@habbo/communication/messages/incoming/users/GroupMembershipRequestedMessageEvent';
import type {
    GroupMembershipRequestedMessageParser
} from '@habbo/communication/messages/parser/users/GroupMembershipRequestedMessageParser';
import {
    GetGuildMembersMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetGuildMembersMessageComposer';
import {
    RejectMembershipRequestMessageComposer
} from '@habbo/communication/messages/outgoing/users/RejectMembershipRequestMessageComposer';
import {
    UnblockGroupMemberMessageComposer
} from '@habbo/communication/messages/outgoing/users/UnblockGroupMemberMessageComposer';
import {
    RemoveAdminRightsFromMemberMessageComposer
} from '@habbo/communication/messages/outgoing/users/RemoveAdminRightsFromMemberMessageComposer';
import {
    AddAdminRightsToMemberMessageComposer
} from '@habbo/communication/messages/outgoing/users/AddAdminRightsToMemberMessageComposer';
import {
    ApproveMembershipRequestMessageComposer
} from '@habbo/communication/messages/outgoing/users/ApproveMembershipRequestMessageComposer';
import {
    ApproveAllMembershipRequestsMessageComposer
} from '@habbo/communication/messages/outgoing/users/ApproveAllMembershipRequestsMessageComposer';
import {
    GetExtendedProfileMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {InfoText} from '@habbo/utils/InfoText';
import {LoadingIcon} from '@habbo/utils/LoadingIcon';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('habbo.groups.GuildMembersWindowCtrl');

/**
 * GuildMembersWindowCtrl
 *
 * The members list: a paged grid of two-column rows, each with the member's avatar, an
 * action link whose meaning depends on their rank (accept / give rights / remove rights /
 * unblock), a remove icon and — where enabled — a block icon.
 *
 * Every action is fire-and-forget: nothing is applied locally. The server answers with
 * either `GuildMembershipUpdated`, which patches the one row, or `GuildMemberMgmtFailed`,
 * which alerts and re-runs the search. Searching itself is debounced twice over — a 1s
 * timer after typing, and a hard 500ms floor between any two requests.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/GuildMembersWindowCtrl.as
 */
export class GuildMembersWindowCtrl
{
    /** AS3 declares this and never reads it; `doSearch()` compares against the literal. */
    // AS3: .../GuildMembersWindowCtrl.as::REQUEST_PAGE_RATELIMIT
    public static readonly REQUEST_PAGE_RATELIMIT: number = 500;

    // AS3: .../GuildMembersWindowCtrl.as::MEMBER_SPACING
    private static readonly MEMBER_SPACING: {x: number; y: number} = {x: 5, y: 5};

    /** Flash `Timer(1000, 1)`: one shot, a second after the last keystroke. */
    // AS3: .../GuildMembersWindowCtrl.as::_SafeStr_5342
    private static readonly SEARCH_DELAY: number = 1000;

    // AS3: .../GuildMembersWindowCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;

    // AS3: .../GuildMembersWindowCtrl.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: .../GuildMembersWindowCtrl.as::_groupId
    private _groupId: number = 0;

    // AS3: .../GuildMembersWindowCtrl.as::_SafeStr_5342
    private _searchTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../GuildMembersWindowCtrl.as::_SafeStr_4556
    private _data: GuildMemberData | null = null;

    // AS3: .../GuildMembersWindowCtrl.as::_SafeStr_5423
    private _filterInfoText: InfoText | null = null;

    // AS3: .../GuildMembersWindowCtrl.as::_loadingIcon
    private _loadingIcon: LoadingIcon | null;

    /**
     * The page currently drawn, and the page a request is in flight for. AS3 sets both and
     * clears `_requestedPageIndex` when the reply matches, but reads neither anywhere —
     * they are bookkeeping only, kept so the port does not quietly diverge.
     */
    // AS3: .../GuildMembersWindowCtrl.as::_SafeStr_4846
    private _shownPageIndex: number = -1;

    // AS3: .../GuildMembersWindowCtrl.as::_SafeStr_6941
    private _requestedPageIndex: number = -1;

    // AS3: .../GuildMembersWindowCtrl.as::_SafeStr_8573
    private _lastRequestTime: number = 0;

    // AS3: .../GuildMembersWindowCtrl.as::GuildMembersWindowCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
        this._loadingIcon = new LoadingIcon();
    }

    // AS3: .../GuildMembersWindowCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: .../GuildMembersWindowCtrl.as::get data()
    get data(): GuildMemberData | null
    {
        return this._data;
    }

    // AS3: .../GuildMembersWindowCtrl.as::setSearchingIcon()
    private setSearchingIcon(searching: boolean): void
    {
        if(this._window === null) return;

        const icon = this._window.findChildByName('searching_icon') as IIconWindow | null;

        if(icon !== null) this._loadingIcon?.setVisible(icon, searching);
    }

    // AS3: .../GuildMembersWindowCtrl.as::onGuildMembers()
    onGuildMembers(event: IMessageEvent): void
    {
        this._data = (event as GuildMembersMessageEvent).data;

        if(this._data === null) return;

        this.show();
        this.populateSearchTypes();
        this.populateUserNameFilter();
    }

    // AS3: .../GuildMembersWindowCtrl.as::onGuildMembershipUpdated()
    onGuildMembershipUpdated(event: IMessageEvent): void
    {
        const updated = event as GuildMembershipUpdatedMessageEvent;
        const entry = updated.data;

        if(this._data !== null && entry !== null && this._data.groupId === updated.guildId)
        {
            this._data.update(entry);
            this.reload();
        }
    }

    /** The reason is a localization key, so an unknown one degrades to showing the key. */
    // AS3: .../GuildMembersWindowCtrl.as::onGuildMemberMgmtFailed()
    onGuildMemberMgmtFailed(event: IMessageEvent): void
    {
        const failed = event as GuildMemberMgmtFailedMessageEvent;
        const key = `group.membermgmt.fail.${failed.reason}`;
        const message = this._groupsManager?.localization?.getLocalization(key, key) ?? key;

        this._groupsManager?.windowManager?.alert('${group.membermgmt.fail.title}', message, 0, null);

        if(this._data !== null && this._data.groupId === failed.guildId && this._window !== null && this._window.visible)
        {
            this.doSearch(this._data.pageIndex);
        }
    }

    // AS3: .../GuildMembersWindowCtrl.as::onGuildMembershipRejected()
    onGuildMembershipRejected(event: IMessageEvent): void
    {
        const rejected = event as GuildMembershipRejectedMessageEvent;

        if(this._window !== null && this._window.visible && this._data !== null
            && this._data.groupId === rejected.getParser<GuildMembershipRejectedMessageParser>().guildId)
        {
            this.doSearch(this._data.pageIndex);
        }
    }

    // AS3: .../GuildMembersWindowCtrl.as::onMembershipRequested()
    onMembershipRequested(event: IMessageEvent): void
    {
        const parser = (event as GroupMembershipRequestedMessageEvent).getParser<GroupMembershipRequestedMessageParser>();

        if(this._window !== null && this._window.visible && this._data !== null
            && this._data.groupId === parser.groupId)
        {
            this.doSearch(this._data.pageIndex);
        }
    }

    /** A second click on the same group's list closes it; any other group replaces it. */
    // AS3: .../GuildMembersWindowCtrl.as::onMembersClick()
    onMembersClick(groupId: number, searchType: number): void
    {
        if(!(this._groupsManager?.getBoolean('groupMembers.enabled') ?? false)) return;

        if(this._window !== null && this._window.visible && this._groupId === groupId)
        {
            this.close();

            return;
        }

        this._filterInfoText?.goBackToInitialState();
        this._groupId = groupId;
        this._groupsManager?.send(new GetGuildMembersMessageComposer(groupId, 0, '', searchType));
    }

    // AS3: .../GuildMembersWindowCtrl.as::show()
    show(): void
    {
        this.prepareWindow();
        this.refresh();

        if(this._window === null) return;

        this._window.visible = true;
        this._window.activate();
    }

    // AS3: .../GuildMembersWindowCtrl.as::reload()
    reload(): void
    {
        if(this._window !== null && this._window.visible) this.refresh();
    }

    // AS3: .../GuildMembersWindowCtrl.as::refresh()
    private refresh(): void
    {
        const data = this._data;
        const window = this._window;
        const groupsManager = this._groupsManager;

        if(data === null || window === null || groupsManager === null) return;

        groupsManager.localization?.registerParameter('group.members.title', 'groupName', data.groupName);

        const container = window.findChildByName('members_cont') as IWindowContainer | null;
        const entries = data.entries;

        if(container !== null)
        {
            for(let index = 0; index < data.pageSize; index++)
            {
                this.refreshEntry(container, index, entries[index] ?? null);
            }
        }

        const logo = window.findChildByName('group_logo') as IWidgetWindow | null;
        const badgeWidget = (logo?.widget ?? null) as IBadgeImageWidget | null;

        if(badgeWidget !== null)
        {
            badgeWidget.badgeId = data.badgeCode;
            badgeWidget.groupId = data.groupId;
        }

        this._shownPageIndex = data.pageIndex;

        if(data.pageIndex === this._requestedPageIndex) this._requestedPageIndex = -1;

        // One localization string carries the whole pager: "%amount% members, page %page%
        // of %totalPages%". Splitting on the input's own placeholder is what puts the text
        // either side of it, so a translation without %page% simply leaves the pager blank.
        const pageInfo = groupsManager.localization?.getLocalization('group.members.pageinfo') ?? '';
        const parts = pageInfo.split('%page%');

        if(parts.length === 2)
        {
            const start = this.pageTextStart;
            const end = this.pageTextEnd;
            const input = this.pageNumberInput;

            if(start !== null) start.text = parts[0].replace('%amount%', `${data.totalEntries}`);
            if(end !== null) end.text = parts[1].replace('%totalPages%', `${data.totalPages}`);
            if(input !== null) input.text = `${data.pageIndex + 1}`;
        }

        const previous = window.findChildByName('previous_page_button');
        const next = window.findChildByName('next_page_button');

        if(previous !== null) previous.visible = this.hasPreviousPage();
        if(next !== null) next.visible = this.hasNextPage();
    }

    /** Clicking outside the page box commits it — except when closing the window. */
    // AS3: .../GuildMembersWindowCtrl.as::onPageInputClickAway()
    private onPageInputClickAway = (event: WindowMouseEvent): void =>
    {
        const related = (event as unknown as {related: IWindow | null}).related ?? null;

        if(related !== null && related.tags.indexOf('close') !== -1) return;

        this.navigateToInputPage();
    };

    // AS3: .../GuildMembersWindowCtrl.as::onPageInputDown()
    private onPageInputDown = (event: WindowKeyboardEvent): void =>
    {
        if(event === null) return;

        if(event.keyCode === 13) this.navigateToInputPage();
    };

    /** Out-of-range input is clamped and written back before the search goes out. */
    // AS3: .../GuildMembersWindowCtrl.as::navigateToInputPage()
    private navigateToInputPage(): void
    {
        const input = this.pageNumberInput;

        if(input === null) return;

        const typed = parseInt(input.text, 10) || 0;
        const clamped = this.limitPageIndex(typed - 1) + 1;

        if(clamped !== typed) input.text = `${clamped}`;

        this.doSearch(clamped - 1);
    }

    // AS3: .../GuildMembersWindowCtrl.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null) return;

        const window = this._groupsManager?.getXmlWindow('guild_members_window') as IFrameWindow | null;

        if(!window)
        {
            log.error('prepareWindow: getXmlWindow("guild_members_window") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const closeButton = window.findChildByTag('close');

        if(closeButton) closeButton.procedure = this.onClose;

        const previous = window.findChildByName('previous_page_button');
        const next = window.findChildByName('next_page_button');

        if(previous) previous.procedure = this.onPreviousPage;
        if(next) next.procedure = this.onNextPage;

        const filterInput = window.findChildByName('filter_members_input') as unknown as ITextFieldWindow | null;

        if(filterInput !== null)
        {
            this._filterInfoText = new InfoText(
                filterInput, this._groupsManager?.localization?.getLocalization('group.members.searchinfo') ?? null
            );
        }

        const pageInput = this.pageNumberInput;

        if(pageInput !== null)
        {
            pageInput.restrict = '0-9';
            pageInput.addEventListener('WKE_KEY_DOWN', this.onPageInputDown as unknown as (event: WindowEvent) => void);
            pageInput.addEventListener('WME_CLICK_AWAY', this.onPageInputClickAway as unknown as (event: WindowEvent) => void);
        }

        window.center();
    }

    // AS3: .../GuildMembersWindowCtrl.as::onClose()
    private onClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.close();
    };

    // AS3: .../GuildMembersWindowCtrl.as::close()
    close(): void
    {
        if(this._window === null) return;

        this._groupId = 0;
        this._window.visible = false;
    }

    /**
     * Rows are built once and reused: an index past the current page's entries is hidden
     * rather than destroyed, which is why a shorter page leaves no gap.
     */
    // AS3: .../GuildMembersWindowCtrl.as::refreshEntry()
    private refreshEntry(container: IWindowContainer, index: number, entry: GuildMemberEntryData | null): void
    {
        let row = container.getChildAt(index) as IWindowContainer | null;

        if(row === null || row === undefined)
        {
            if(entry === null) return;

            row = this.getListEntry();

            if(row === null) return;

            row.tags[0] = `${index}`;
            container.addChild(row);

            row.x = index % 2 === 0 ? 0 : row.width + GuildMembersWindowCtrl.MEMBER_SPACING.x;
            row.y = Math.floor(index / 2) * (row.height + GuildMembersWindowCtrl.MEMBER_SPACING.y);
        }

        if(entry !== null)
        {
            this.refreshUserEntry(row, entry);
            row.visible = true;
        }
        else
        {
            row.visible = false;
        }
    }

    // AS3: .../GuildMembersWindowCtrl.as::refreshUserEntry()
    refreshUserEntry(row: IWindowContainer, entry: GuildMemberEntryData): void
    {
        const data = this._data;
        const groupsManager = this._groupsManager;

        if(data === null || groupsManager === null) return;

        const nameText = row.findChildByName('user_name_txt');

        if(nameText) nameText.caption = entry.userName;

        const ownerIcon = row.findChildByName('icon_owner');

        if(ownerIcon) ownerIcon.visible = entry.owner;

        this.setAdminState(entry.member, entry.admin, row);

        const adminContainer = row.findChildByName('admin_container');

        // AS3 reads `_loc8_` — the "is this me" flag — here, three lines BEFORE assigning
        // it, so this always tests against false. Preserved: fixing it would show the admin
        // column on the player's own row, which the original never does.
        if(adminContainer) adminContainer.visible = entry.admin || data.allowedToManage;

        const bgRegion = row.findChildByName('bg_region') as IRegionWindow | null;

        if(bgRegion) bgRegion.id = entry.userId;

        this.setRemoveState(false, row);
        this.setActionLinkState(false, row);

        const isSelf = entry.userId === groupsManager.avatarId;

        const removeRegion = row.findChildByName('remove_region') as IRegionWindow | null;

        if(removeRegion)
        {
            removeRegion.toolTipCaption = groupsManager.localization?.getLocalization(
                entry.member ? 'group.members.kick' : 'group.members.reject'
            ) ?? '';
            removeRegion.visible = !entry.owner && !isSelf && data.allowedToManage && !entry.blocked;
            removeRegion.id = entry.userId;
        }

        const blockRegion = row.findChildByName('block_region') as IRegionWindow | null;

        if(blockRegion)
        {
            blockRegion.toolTipCaption = groupsManager.localization?.getLocalization('group.members.block') ?? '';
            blockRegion.visible = entry.member && !entry.owner && !isSelf && data.allowedToManage
                && groupsManager.getBoolean('group.blocking.enabled') && !entry.blocked;
            blockRegion.id = entry.userId;
        }

        const canManage = !isSelf && data.allowedToManage;
        const actionRegion = row.findChildByName('action_link_region') as IRegionWindow | null;

        if(actionRegion)
        {
            actionRegion.visible = canManage;
            actionRegion.id = entry.userId;
        }

        // The join date takes the action link's place, so only one of the two is ever up.
        const sinceText = row.findChildByName('member_since_txt') as unknown as ITextWindow | null;

        if(sinceText !== null)
        {
            sinceText.visible = !canManage && entry.memberSince !== '';
            groupsManager.localization?.registerParameter('group.members.since', 'date', entry.memberSince);
            sinceText.caption = groupsManager.localization?.getLocalization('group.members.since') ?? '';
        }

        const avatar = row.findChildByName('avatar_image') as IWidgetWindow | null;
        const avatarWidget = (avatar?.widget ?? null) as IAvatarImageWidget | null;

        if(avatarWidget !== null) avatarWidget.figure = entry.figure;

        if(entry.blocked) this.setActionLink(row, 'group.members.unblock', false);
        else if(entry.owner) this.setActionLink(row, 'group.members.owner', false);
        else if(entry.admin) this.setActionLink(row, 'group.members.removerights', true);
        else if(entry.member) this.setActionLink(row, 'group.members.giverights', true);
        else this.setActionLink(row, 'group.members.accept', true);
    }

    // AS3: .../GuildMembersWindowCtrl.as::getListEntry()
    getListEntry(): IWindowContainer | null
    {
        const row = this._groupsManager?.getXmlWindow('member_entry') as IWindowContainer | null;

        if(!row)
        {
            log.error('getListEntry: getXmlWindow("member_entry") returned null - layout not registered?');

            return null;
        }

        const bgRegion = row.findChildByName('bg_region');

        if(bgRegion) bgRegion.procedure = this.onBg;

        const blockRegion = row.findChildByName('block_region');

        if(blockRegion)
        {
            blockRegion.addEventListener('WME_OVER', this.onRemoveMouseOver);
            blockRegion.addEventListener('WME_OUT', this.onRemoveMouseOut);
            blockRegion.addEventListener('WME_CLICK', this.onBlockMouseClick);
        }

        const removeRegion = row.findChildByName('remove_region');

        if(removeRegion)
        {
            removeRegion.addEventListener('WME_OVER', this.onRemoveMouseOver);
            removeRegion.addEventListener('WME_OUT', this.onRemoveMouseOut);
            removeRegion.addEventListener('WME_CLICK', this.onRemoveMouseClick);
        }

        const actionRegion = row.findChildByName('action_link_region');

        if(actionRegion)
        {
            actionRegion.addEventListener('WME_OVER', this.onActionLinkMouseOver);
            actionRegion.addEventListener('WME_OUT', this.onActionLinkMouseOut);
            actionRegion.addEventListener('WME_CLICK', this.onActionLinkClick);
        }

        return row;
    }

    /**
     * AS3 passes the REGION to `setRemoveState()`, which then looks the three icons up on
     * it rather than on the row — the icons are the region's own children, so this works
     * and the hover only ever repaints the row it belongs to.
     */
    // AS3: .../GuildMembersWindowCtrl.as::onRemoveMouseOver()
    private onRemoveMouseOver = (event: WindowEvent): void =>
    {
        this.setRemoveState(true, event.target as unknown as IWindowContainer);
    };

    // AS3: .../GuildMembersWindowCtrl.as::onRemoveMouseOut()
    private onRemoveMouseOut = (event: WindowEvent): void =>
    {
        this.setRemoveState(false, event.target as unknown as IWindowContainer);
    };

    /** A pending request is rejected outright; a member goes through the kick dialog. */
    // AS3: .../GuildMembersWindowCtrl.as::onRemoveMouseClick()
    private onRemoveMouseClick = (event: WindowEvent): void =>
    {
        const target = event.target as unknown as IWindow | null;
        const entry = this._data?.getUser(target?.id ?? 0) ?? null;

        if(entry === null || entry.owner || this._data === null) return;

        if(entry.member) this._groupsManager?.handleUserKick(target?.id ?? 0, this._data.groupId);
        else this._groupsManager?.send(new RejectMembershipRequestMessageComposer(this._data.groupId, entry.userId));
    };

    // AS3: .../GuildMembersWindowCtrl.as::onBlockMouseClick()
    private onBlockMouseClick = (event: WindowEvent): void =>
    {
        const target = event.target as unknown as IWindow | null;
        const entry = this._data?.getUser(target?.id ?? 0) ?? null;

        if(entry === null || entry.owner || this._data === null) return;

        if(entry.member) this._groupsManager?.handleUserBlock(target?.id ?? 0, this._data.groupId);
    };

    // AS3: .../GuildMembersWindowCtrl.as::setActionLink()
    private setActionLink(row: IWindowContainer, key: string, underline: boolean): void
    {
        const link = row.findChildByName('action_link') as unknown as ITextWindow | null;

        if(link === null) return;

        link.text = this._groupsManager?.localization?.getLocalization(key, key) ?? key;
        link.underline = underline;
    }

    /** The pressed icon is never shown: AS3 hides it in both branches. */
    // AS3: .../GuildMembersWindowCtrl.as::setRemoveState()
    private setRemoveState(over: boolean, container: IWindowContainer): void
    {
        const off = container.findChildByName('icon_close_off');
        const on = container.findChildByName('icon_close_over');
        const down = container.findChildByName('icon_close_down');

        if(off) off.visible = !over;
        if(on) on.visible = over;
        if(down) down.visible = false;
    }

    /**
     * The two colours are AS3's literals, kept as declared. They are ARGB with a full
     * alpha byte (0xFF3E3E3C hovered, 0xFF8E8E65 idle), which is how they exceed the
     * 24-bit range a plain RGB colour would occupy.
     */
    // AS3: .../GuildMembersWindowCtrl.as::setActionLinkState()
    private setActionLinkState(over: boolean, container: IWindowContainer): void
    {
        const link = container.findChildByName('action_link') as unknown as ITextWindow | null;

        if(link === null) return;

        link.textColor = over ? 4280984060 : 4285492837;
    }

    /** Hovering previews the rank the click would produce, hence the inverted `admin`. */
    // AS3: .../GuildMembersWindowCtrl.as::onActionLinkMouseOver()
    private onActionLinkMouseOver = (event: WindowEvent): void =>
    {
        const region = event.target as unknown as IWindowContainer | null;
        const entry = this._data?.getUser((event.target as unknown as IWindow | null)?.id ?? 0) ?? null;

        if(region === null || entry === null || entry.owner) return;

        this.setActionLinkState(true, region);

        const parent = region.parent as unknown as IWindowContainer | null;

        if(parent !== null) this.setAdminState(entry.member, !entry.admin, parent);
    };

    // AS3: .../GuildMembersWindowCtrl.as::onActionLinkMouseOut()
    private onActionLinkMouseOut = (event: WindowEvent): void =>
    {
        const region = event.target as unknown as IWindowContainer | null;

        if(region === null) return;

        this.setActionLinkState(false, region);

        const entry = this._data?.getUser((event.target as unknown as IWindow | null)?.id ?? 0) ?? null;
        const parent = region.parent as unknown as IWindowContainer | null;

        if(entry !== null && parent !== null) this.setAdminState(entry.member, entry.admin, parent);
    };

    // AS3: .../GuildMembersWindowCtrl.as::onActionLinkClick()
    private onActionLinkClick = (event: WindowEvent): void =>
    {
        const entry = this._data?.getUser((event.target as unknown as IWindow | null)?.id ?? 0) ?? null;

        if(entry === null || entry.owner || this._data === null) return;

        const groupId = this._data.groupId;

        if(entry.blocked) this._groupsManager?.send(new UnblockGroupMemberMessageComposer(groupId, entry.userId));
        else if(entry.admin) this._groupsManager?.send(new RemoveAdminRightsFromMemberMessageComposer(groupId, entry.userId));
        else if(entry.member) this._groupsManager?.send(new AddAdminRightsToMemberMessageComposer(groupId, entry.userId));
        else this._groupsManager?.send(new ApproveMembershipRequestMessageComposer(groupId, entry.userId));
    };

    // AS3: .../GuildMembersWindowCtrl.as::setAdminState()
    private setAdminState(member: boolean, admin: boolean, container: IWindowContainer): void
    {
        const off = container.findChildByName('icon_admin_off');
        const on = container.findChildByName('icon_admin_over');

        if(off) off.visible = member && admin;
        if(on) on.visible = member && !admin;
    }

    /** Clicking a row opens that user's profile. */
    // AS3: .../GuildMembersWindowCtrl.as::onBg()
    private onBg = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._groupsManager?.send(new GetExtendedProfileMessageComposer(window.id));
    };

    // AS3: .../GuildMembersWindowCtrl.as::onFilterMembers()
    private onFilterMembers = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WE_CHANGE') return;

        this.restartSearchTimer();
        this.setSearchingIcon(true);
    };

    // AS3: .../GuildMembersWindowCtrl.as::onTypeDropmenu()
    private onTypeDropmenu = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WE_SELECTED') return;

        this.doSearch(0);
    };

    /** Flash `Timer.reset()` + `start()`: the countdown restarts from zero on each key. */
    // AS3: .../GuildMembersWindowCtrl.as::onFilterMembers() (the _SafeStr_5342 reset/start pair)
    private restartSearchTimer(): void
    {
        this.stopSearchTimer();

        this._searchTimer = setTimeout(this.onSearchTimer, GuildMembersWindowCtrl.SEARCH_DELAY);
    }

    // AS3: .../GuildMembersWindowCtrl.as::doSearch() (the _SafeStr_5342 stop/reset pair)
    private stopSearchTimer(): void
    {
        if(this._searchTimer !== null)
        {
            clearTimeout(this._searchTimer);
            this._searchTimer = null;
        }
    }

    /**
     * The hard floor under every request, whatever asked for it: paging, typing and the
     * type menu all funnel through here, and anything inside 500ms of the last one is
     * dropped outright rather than queued.
     */
    // AS3: .../GuildMembersWindowCtrl.as::doSearch()
    private doSearch(pageIndex: number): void
    {
        const now = performance.now();

        if(this._lastRequestTime > now - GuildMembersWindowCtrl.REQUEST_PAGE_RATELIMIT) return;

        const data = this._data;

        if(data === null) return;

        this._requestedPageIndex = pageIndex;
        this._lastRequestTime = now;

        this.stopSearchTimer();
        this.setSearchingIcon(true);

        const filter = this._filterInfoText?.getText() ?? '';
        const searchType = this.getTypeDropMenu()?.selection ?? 0;

        this._groupsManager?.send(new GetGuildMembersMessageComposer(data.groupId, pageIndex, filter, searchType));
    }

    /**
     * AS3 declares this and never installs it as a procedure — the members layout's
     * accept-all button is left unbound — so nothing calls it. Ported for fidelity.
     */
    // AS3: .../GuildMembersWindowCtrl.as::onAcceptAll()
    private onAcceptAll = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null) return;

        this._groupsManager?.send(new ApproveAllMembershipRequestsMessageComposer(this._data.groupId));
    };

    // AS3: .../GuildMembersWindowCtrl.as::getTypeDropMenu()
    private getTypeDropMenu(): IDropMenuWindow | null
    {
        return (this._window?.findChildByName('type_drop_menu') ?? null) as IDropMenuWindow | null;
    }

    // AS3: .../GuildMembersWindowCtrl.as::onSearchTimer()
    private onSearchTimer = (): void =>
    {
        this._searchTimer = null;

        if(this._window !== null && this._window.visible) this.doSearch(0);
    };

    // AS3: .../GuildMembersWindowCtrl.as::onNextPage()
    private onNextPage = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null) return;

        this.doSearch(this.limitPageIndex(this._data.pageIndex + 1));
    };

    // AS3: .../GuildMembersWindowCtrl.as::onPreviousPage()
    private onPreviousPage = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null) return;

        this.doSearch(this.limitPageIndex(this._data.pageIndex - 1));
    };

    /** "Is there a page that way" asked as "does clamping move me" — same answer. */
    // AS3: .../GuildMembersWindowCtrl.as::hasPreviousPage()
    private hasPreviousPage(): boolean
    {
        if(this._data === null) return false;

        return this._data.pageIndex !== this.limitPageIndex(this._data.pageIndex - 1);
    }

    // AS3: .../GuildMembersWindowCtrl.as::hasNextPage()
    private hasNextPage(): boolean
    {
        if(this._data === null) return false;

        return this._data.pageIndex !== this.limitPageIndex(this._data.pageIndex + 1);
    }

    // AS3: .../GuildMembersWindowCtrl.as::limitPageIndex()
    private limitPageIndex(pageIndex: number): number
    {
        if(this._data === null) return 0;

        const pages = Math.ceil(this._data.totalEntries / this._data.pageSize);

        return Math.max(0, Math.min(pageIndex, pages - 1));
    }

    /**
     * Blocked is offered only where blocking is enabled, and neither it nor pending is
     * offered to someone who cannot manage — whose selection is also clamped to the two
     * entries they do have.
     */
    // AS3: .../GuildMembersWindowCtrl.as::populateSearchTypes()
    private populateSearchTypes(): void
    {
        const data = this._data;
        const menu = this.getTypeDropMenu();

        if(data === null || menu === null) return;

        const items: string[] = ['${group.members.search.all}', '${group.members.search.admins}'];

        if(data.allowedToManage)
        {
            items.push('${group.members.search.pending}');

            if(this._groupsManager?.getBoolean('group.blocking.enabled') ?? false)
            {
                items.push('${group.members.search.blocked}');
            }
        }

        menu.procedure = null;
        menu.populate(items);
        menu.selection = data.allowedToManage ? data.searchType : Math.min(data.searchType, 1);
        menu.procedure = this.onTypeDropmenu;
    }

    /** The procedure is dropped around the write so echoing the filter cannot re-search. */
    // AS3: .../GuildMembersWindowCtrl.as::populateUserNameFilter()
    private populateUserNameFilter(): void
    {
        const input = this._filterInfoText?.input ?? null;

        if(input === null || this._data === null) return;

        input.procedure = null;

        if(this._filterInfoText?.getText() !== this._data.userNameFilter)
        {
            this._filterInfoText?.setText(this._data.userNameFilter);
        }

        input.procedure = this.onFilterMembers;

        this.stopSearchTimer();
        this.setSearchingIcon(false);
    }

    // AS3: .../GuildMembersWindowCtrl.as::get pageTextStart()
    private get pageTextStart(): ITextWindow | null
    {
        return (this._window?.findChildByName('pagina_text_start') ?? null) as unknown as ITextWindow | null;
    }

    // AS3: .../GuildMembersWindowCtrl.as::get pageNumberInput()
    private get pageNumberInput(): ITextFieldWindow | null
    {
        return (this._window?.findChildByName('pagina_number_input') ?? null) as unknown as ITextFieldWindow | null;
    }

    // AS3: .../GuildMembersWindowCtrl.as::get pageTextEnd()
    private get pageTextEnd(): ITextWindow | null
    {
        return (this._window?.findChildByName('pagina_text_end') ?? null) as unknown as ITextWindow | null;
    }

    // AS3: .../GuildMembersWindowCtrl.as::dispose()
    dispose(): void
    {
        this._groupsManager = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._filterInfoText !== null)
        {
            this._filterInfoText.dispose();
            this._filterInfoText = null;
        }

        this.stopSearchTimer();

        if(this._loadingIcon)
        {
            this._loadingIcon.dispose();
            this._loadingIcon = null;
        }
    }
}
