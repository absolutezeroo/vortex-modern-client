import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import {Logger} from '@core/utils/Logger';

import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {HabboGroupDetailsData} from '@habbo/communication/messages/incoming/users/HabboGroupDetailsData';
import {JoinHabboGroupMessageComposer} from '@habbo/communication/messages/outgoing/users/JoinHabboGroupMessageComposer';
import {GetGuildEditInfoMessageComposer} from '@habbo/communication/messages/outgoing/users/GetGuildEditInfoMessageComposer';
import {
    DeactivateGuildMessageComposer
} from '@habbo/communication/messages/outgoing/users/DeactivateGuildMessageComposer';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('habbo.groups.GroupDetailsCtrl');

/**
 * GroupDetailsCtrl
 *
 * The group card: badge, name, description, creation line, member counts, and the strip
 * of links underneath — base room, forum, members, pending members, manage, delete, buy
 * furni, hottest groups — each shown or hidden by what the details say the player may do.
 *
 * It owns no frame of its own. `DetailsWindowCtrl` supplies the container it attaches to,
 * which is how the same card serves both the standalone group window and any other host
 * that hands it a parent.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/GroupDetailsCtrl.as
 */
export class GroupDetailsCtrl
{
    // AS3: .../GroupDetailsCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;

    // AS3: .../GroupDetailsCtrl.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../GroupDetailsCtrl.as::_selectedGroup
    private _selectedGroup: HabboGroupDetailsData | null = null;

    /**
     * AS3 takes a second `Boolean` the constructor never reads and no other member ever
     * looks at — `DetailsWindowCtrl` passes `true`. Kept so the two match.
     */
    // AS3: .../GroupDetailsCtrl.as::GroupDetailsCtrl()
    constructor(groupsManager: HabboGroupsManager, _standalone: boolean)
    {
        this._groupsManager = groupsManager;
    }

    // AS3: .../GroupDetailsCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: .../GroupDetailsCtrl.as::prepareWindow()
    private prepareWindow(_parent: IWindowContainer): void
    {
        if(this._window !== null) return;

        const window = this._groupsManager?.getXmlWindow('group') as IWindowContainer | null;

        if(!window)
        {
            log.error('prepareWindow: getXmlWindow("group") returned null - layout not registered?');

            return;
        }

        this._window = window;

        this.setProc('group_room_link_region', this.onRoomLink);
        this.setProc('manage_guild_region', this.onManageGuild);
        this.setProc('delete_guild_region', this.onDeleteGuild);
        this.setProc('members_region', this.onMembers);
        this.setProc('pending_members_region', this.onPendingMembers);
        this.setProc('show_groups_link_region', this.onShowGroups);
        this.setProc('buy_furni_link_region', this.onBuyFurni);

        const bind = (name: string, procedure: (event: WindowEvent, window: IWindow) => void): void =>
        {
            const child = window.findChildByName(name);

            if(child) child.procedure = procedure;
            else log.warn(`prepareWindow: the group card has no "${name}" child`);
        };

        bind('leave_button', this.onLeave);
        bind('join_button', this.onJoin);
        bind('request_membership_button', this.onJoin);
    }

    // AS3: .../GroupDetailsCtrl.as::attachWindow()
    private attachWindow(parent: IWindowContainer): void
    {
        if(this._window === null) return;

        if(parent.getChildIndex(this._window) === -1)
        {
            parent.addChild(this._window);
        }
    }

    // AS3: .../GroupDetailsCtrl.as::onGroupDetails()
    onGroupDetails(parent: IWindowContainer, group: HabboGroupDetailsData): void
    {
        this._selectedGroup = group;

        this.prepareWindow(parent);
        this.attachWindow(parent);

        const window = this._window;
        const groupsManager = this._groupsManager;

        if(!window || !groupsManager) return;

        const decorateIcon = window.findChildByName('group_decorate_icon_region');
        const nameText = window.findChildByName('group_name');

        if(nameText) nameText.caption = group.groupName;

        if(decorateIcon)
        {
            decorateIcon.visible = group.membersCanDecorate;

            // The name slides right to clear the decorate icon only when that icon is up.
            if(nameText) nameText.x = group.membersCanDecorate ? decorateIcon.x + decorateIcon.width : decorateIcon.x;
        }

        const description = window.findChildByName('group_description') as unknown as ITextWindow | null;

        if(description)
        {
            description.caption = group.description;
            description.height = description.textHeight + 5;

            const itemList = window.findChildByName('group_description_item_list');
            const scrollbar = window.findChildByName('group_description_scrollbar');

            if(scrollbar) scrollbar.visible = description.height > (itemList?.height ?? 0);
        }

        const hasBoard = group.hasBoard;
        const forumRegion = window.findChildByName('show_forum_link_region');

        if(forumRegion) forumRegion.visible = hasBoard;

        const forumLink = window.findChildByName('show_forum_link');

        if(forumLink) forumLink.visible = hasBoard;

        if(hasBoard) this.setProc('show_forum_link_region', this.onForumLink);

        const windowManager = groupsManager.windowManager;
        const localization = groupsManager.localization;

        windowManager?.registerLocalizationParameter('group.created', 'date', `${group.creationDate}`);
        windowManager?.registerLocalizationParameter('group.created', 'owner', `${group.ownerName}`);

        const createdText = window.findChildByName('created_txt');

        if(createdText) createdText.caption = localization?.getLocalization('group.created') ?? '';

        windowManager?.registerLocalizationParameter('group.membercount', 'totalMembers', `${group.totalMembers}`);

        const membersText = window.findChildByName('members_txt');

        if(membersText) membersText.caption = localization?.getLocalization('group.membercount') ?? '';

        const roomLinkRegion = window.findChildByName('group_room_link_region');

        if(roomLinkRegion) roomLinkRegion.visible = group.roomId > -1;

        windowManager?.registerLocalizationParameter('group.linktobase', 'room_name', group.roomName);

        const roomLink = window.findChildByName('group_room_link');

        if(roomLink) roomLink.caption = localization?.getLocalization('group.linktobase') ?? '';

        const logo = window.findChildByName('group_logo') as IWidgetWindow | null;
        const badgeWidget = (logo?.widget ?? null) as IBadgeImageWidget | null;

        if(badgeWidget)
        {
            badgeWidget.badgeId = group.badgeCode;
            badgeWidget.groupId = group.groupId;
        }

        const joinButton = window.findChildByName('join_button');

        if(joinButton)
        {
            joinButton.visible = group.joiningAllowed;
            joinButton.enable();
        }

        const requestButton = window.findChildByName('request_membership_button');

        if(requestButton) requestButton.visible = group.requestMembershipAllowed;

        const leaveButton = window.findChildByName('leave_button');

        if(leaveButton) leaveButton.visible = group.leaveAllowed;

        const pendingText = window.findChildByName('membership_pending_txt');

        if(pendingText) pendingText.visible = group.status === 2;

        const memberText = window.findChildByName('youaremember_txt');
        const memberIcon = window.findChildByName('youaremember_icon');
        const plainMember = !group.isGuild && group.status === 1;

        if(memberText) memberText.visible = plainMember;
        if(memberIcon) memberIcon.visible = plainMember;

        const pendingRegion = window.findChildByName('pending_members_region');

        if(pendingRegion) pendingRegion.visible = group.pendingMemberCount > 0;

        if(group.pendingMemberCount > 0)
        {
            windowManager?.registerLocalizationParameter('group.pendingmembercount', 'amount', `${group.pendingMemberCount}`);

            const pendingMembersText = window.findChildByName('pending_members_txt');

            if(pendingMembersText) pendingMembersText.caption = localization?.getLocalization('group.pendingmembercount') ?? '';
        }

        const manageRegion = window.findChildByName('manage_guild_region');

        if(manageRegion)
        {
            manageRegion.visible = group.isOwner && group.isGuild;

            // Both links stack under the pending-members line, each shifting down 16px only
            // if the row above it is up. Note AS3's fallback for the delete link is the
            // PENDING region's y, not the manage link's — so with manage hidden the two
            // land on the same row, which is what makes the stack collapse cleanly.
            if(pendingRegion) manageRegion.y = pendingRegion.visible ? pendingRegion.y + 16 : pendingRegion.y;
        }

        const deleteRegion = window.findChildByName('delete_guild_region');

        if(deleteRegion)
        {
            deleteRegion.visible = group.isGuild
                && (this._groupsManager?.groupDeletionEnabled ?? false)
                && (group.isOwner || (this._groupsManager?.sessionDataManager?.hasSecurity(5) ?? false));

            if(manageRegion && pendingRegion)
            {
                deleteRegion.y = manageRegion.visible ? manageRegion.y + 16 : pendingRegion.y;
            }
        }

        const ownerRegion = window.findChildByName('you_are_owner_region');

        if(ownerRegion) ownerRegion.visible = group.isGuild && group.isOwner;

        const adminRegion = window.findChildByName('you_are_admin_region');

        if(adminRegion) adminRegion.visible = group.isGuild && group.isAdmin && !group.isOwner;

        const memberRegion = window.findChildByName('you_are_member_region');

        if(memberRegion) memberRegion.visible = group.isGuild && group.status === 1 && !(group.isAdmin || group.isOwner);

        for(let type = 0; type <= 2; type++)
        {
            const region = this.getGroupTypeRegion(type);

            if(region) region.visible = false;
        }

        const typeRegion = this.getGroupTypeRegion(group.type);

        if(typeRegion) typeRegion.visible = true;
    }

    // AS3: .../GroupDetailsCtrl.as::getGroupTypeRegion()
    private getGroupTypeRegion(type: number): IWindow | null
    {
        return this._window?.findChildByName(`grouptype_region_${type}`) ?? null;
    }

    /** AS3 declares this next to `getGroupTypeRegion()` and never calls it. */
    // AS3: .../GroupDetailsCtrl.as::getGroupTypeIcon()
    private getGroupTypeIcon(type: number): IWindow | null
    {
        return this._window?.findChildByName(`grouptype_icon_${type}`) ?? null;
    }

    /** The link rows are regions, so they need their click threshold dropped to zero. */
    // AS3: .../GroupDetailsCtrl.as::setProc()
    private setProc(name: string, procedure: (event: WindowEvent, window: IWindow) => void): void
    {
        const child = this._window?.findChildByName(name) ?? null;

        if(child === null)
        {
            log.warn(`setProc: the group card has no "${name}" child`);

            return;
        }

        child.mouseThreshold = 0;
        child.procedure = procedure;
    }

    /**
     * Leaving is a kick of oneself — same confirmation, same message, so AS3 routes it
     * through the manager's kick flow with the player's own id.
     */
    // AS3: .../GroupDetailsCtrl.as::onLeave()
    private onLeave = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._selectedGroup || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'leaveGroup');
        this._groupsManager.handleUserKick(this._groupsManager.avatarId, this._selectedGroup.groupId);
    };

    // AS3: .../GroupDetailsCtrl.as::onJoin()
    private onJoin = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._selectedGroup || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'joinGroup');

        // Disabled until the reply redraws the card, so the join cannot be sent twice.
        this._window?.findChildByName('join_button')?.disable();

        this._groupsManager.send(new JoinHabboGroupMessageComposer(this._selectedGroup.groupId));
        this._groupsManager.send(new EventLogMessageComposer('HabboGroups', `${this._selectedGroup.groupId}`, 'join'));
    };

    // AS3: .../GroupDetailsCtrl.as::onRoomLink()
    private onRoomLink = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._selectedGroup || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'groupBaseRoom');
        this._groupsManager.navigator?.goToPrivateRoom(this._selectedGroup.roomId);
        this._groupsManager.send(new EventLogMessageComposer('HabboGroups', `${this._selectedGroup.groupId}`, 'base'));
    };

    // AS3: .../GroupDetailsCtrl.as::onForumLink()
    private onForumLink = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._selectedGroup || !this._groupsManager) return;

        this._groupsManager.openGroupForum(this._selectedGroup.groupId);
    };

    /**
     * AS3 declares this and never calls it — the card has no external link. Kept because
     * its alert callback below is the only thing that disposes the dialog.
     */
    // AS3: .../GroupDetailsCtrl.as::openExternalLink()
    private openExternalLink(url: string): void
    {
        if(url === '') return;

        this._groupsManager?.windowManager?.alert(
            '${catalog.alert.external.link.title}', '${catalog.alert.external.link.desc}', 0, this.onExternalLink
        );

        HabboWebTools.navigateToURL(url, '_empty');
    }

    // AS3: .../GroupDetailsCtrl.as::onExternalLink()
    private onExternalLink = (dialog: IDisposable, _event: WindowEvent): void =>
    {
        dialog.dispose();
    };

    // AS3: .../GroupDetailsCtrl.as::onManageGuild()
    private onManageGuild = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._selectedGroup || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'groupManage');
        this._groupsManager.send(new GetGuildEditInfoMessageComposer(this._selectedGroup.groupId));
    };

    // AS3: .../GroupDetailsCtrl.as::onDeleteGuild()
    private onDeleteGuild = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._groupsManager) return;

        this._groupsManager.windowManager?.confirm(
            '${group.deleteconfirm.title}', '${group.deleteconfirm.desc}', 0, this.onDeleteGuildConfirmation
        );
    };

    // AS3: .../GroupDetailsCtrl.as::onDeleteGuildConfirmation()
    private onDeleteGuildConfirmation = (dialog: IDisposable, event: WindowEvent): void =>
    {
        dialog.dispose();

        if(event.type !== 'WE_OK' || !this._selectedGroup || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'groupDelete');
        this._groupsManager.send(new DeactivateGuildMessageComposer(this._selectedGroup.groupId));
    };

    // AS3: .../GroupDetailsCtrl.as::onMembers()
    private onMembers = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._selectedGroup || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'groupMembers');
        this._groupsManager.guildMembersWindowCtrl?.onMembersClick(this._selectedGroup.groupId, 0);
    };

    // AS3: .../GroupDetailsCtrl.as::onPendingMembers()
    private onPendingMembers = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._selectedGroup || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'groupPendingMembers');
        this._groupsManager.guildMembersWindowCtrl?.onMembersClick(this._selectedGroup.groupId, 2);
    };

    // AS3: .../GroupDetailsCtrl.as::onShowGroups()
    private onShowGroups = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'hottestGroups');
        this._groupsManager.navigator?.performGuildBaseSearch();
    };

    // AS3: .../GroupDetailsCtrl.as::onBuyFurni()
    private onBuyFurni = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupDetails', 'groupFurni');
        this._groupsManager.openCatalog('guild_custom_furni');
    };

    // AS3: .../GroupDetailsCtrl.as::dispose()
    dispose(): void
    {
        this._groupsManager = null;
        this._selectedGroup = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
