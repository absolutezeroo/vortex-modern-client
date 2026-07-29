import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator';
import type {HabboGroupDetailsData} from '@habbo/communication/messages/incoming/users/HabboGroupDetailsData';
import {GetHabboGroupDetailsMessageComposer} from '@habbo/communication/messages/outgoing/users/GetHabboGroupDetailsMessageComposer';
import {GetGuildEditInfoMessageComposer} from '@habbo/communication/messages/outgoing/users/GetGuildEditInfoMessageComposer';
import {JoinHabboGroupMessageComposer} from '@habbo/communication/messages/outgoing/users/JoinHabboGroupMessageComposer';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('habbo.groups.GroupRoomInfoCtrl');

/**
 * GroupRoomInfoCtrl
 *
 * The small panel that says "you are in <group>'s base", attached to the toolbar's
 * extension strip while the player stands in a group's base room. It collapses to a
 * title bar on click, and offers join / request-membership / manage depending on what
 * the group details say the player may do.
 *
 * Driven entirely by two messages: the room's `GetGuestRoomResult` supplies the group
 * id, which is turned into a group-details request, and the details that come back are
 * what the panel renders. The two are correlated by `expectedGroupId`, so details for
 * some other group — a profile click, say — do not hijack the panel.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/GroupRoomInfoCtrl.as
 */
export class GroupRoomInfoCtrl
{
    // AS3: .../GroupRoomInfoCtrl.as::TOOLBAR_EXTENSION_ID
    private static readonly TOOLBAR_EXTENSION_ID: string = 'room_group_info';

    /**
     * Extensions this panel must sit before on the toolbar strip. AS3 passes the array
     * inline to `attachExtension()`.
     */
    // AS3: .../GroupRoomInfoCtrl.as::refresh() (the attachExtension() argument)
    private static readonly TOOLBAR_EXTENSION_ORDER: string[] = ['next_quest_timer', 'quest_tracker', 'event_info_window'];

    // AS3: .../GroupRoomInfoCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../GroupRoomInfoCtrl.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: .../GroupRoomInfoCtrl.as::_expanded
    private _expanded: boolean = true;
    // AS3: .../GroupRoomInfoCtrl.as::_group
    private _group: HabboGroupDetailsData | null = null;
    // AS3: .../GroupRoomInfoCtrl.as::_SafeStr_5663
    private _expectedGroupId: number = 0;

    // AS3: .../GroupRoomInfoCtrl.as::GroupRoomInfoCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
    }

    // AS3: .../GroupRoomInfoCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: .../GroupRoomInfoCtrl.as::set expectedGroupId()
    set expectedGroupId(value: number)
    {
        this._expectedGroupId = value;
    }

    /**
     * Room data arrived: if it names a group, ask for that group's details; if it does
     * not, the player is not in a base room and the panel goes away.
     */
    // AS3: .../GroupRoomInfoCtrl.as::onRoomInfo()
    onRoomInfo(roomData: GuestRoomData): void
    {
        if(!this._groupsManager?.groupRoomInfoEnabled) return;

        if(roomData.habboGroupId > 0)
        {
            this._expectedGroupId = roomData.habboGroupId;
            this._groupsManager.send(new GetHabboGroupDetailsMessageComposer(roomData.habboGroupId, false));
        }
        else
        {
            this._expectedGroupId = 0;
            this.close();
        }
    }

    // AS3: .../GroupRoomInfoCtrl.as::onGroupDeactivated()
    onGroupDeactivated(groupId: number): void
    {
        if(groupId === this._group?.groupId || groupId === this._expectedGroupId)
        {
            this.expectedGroupId = 0;
            this.close();
        }
    }

    // AS3: .../GroupRoomInfoCtrl.as::onGroupDetails()
    onGroupDetails(group: HabboGroupDetailsData): void
    {
        if(!this._groupsManager?.groupRoomInfoEnabled) return;

        if(group.groupId === this._expectedGroupId)
        {
            this._expanded = true;
            this._group = group;
            this.refresh();
        }
    }

    // AS3: .../GroupRoomInfoCtrl.as::isDisplayingGroup()
    isDisplayingGroup(groupId: number): boolean
    {
        return this._window !== null && this._group !== null && groupId === this._group.groupId;
    }

    // AS3: .../GroupRoomInfoCtrl.as::refresh()
    private refresh(): void
    {
        const group = this._group;

        if(!group || !group.isGuild) return;

        this.prepareWindow();

        const window = this._window;

        if(!window) return;

        const expandedBg = window.findChildByName('bg_expanded');
        const contractedBg = window.findChildByName('bg_contracted');
        const nameText = window.findChildByName('group_name_txt');
        const joinButton = window.findChildByName('join_button');
        const requestButton = window.findChildByName('request_membership_button');
        const manageButton = window.findChildByName('manage_button');
        const logo = window.findChildByName('group_logo') as IWidgetWindow | null;
        const infoRegion = window.findChildByName('info_region');

        if(expandedBg) expandedBg.visible = this._expanded;
        if(contractedBg) contractedBg.visible = !this._expanded;

        if(nameText)
        {
            nameText.visible = this._expanded;
            nameText.caption = group.groupName;
        }

        if(joinButton)
        {
            joinButton.visible = this._expanded && group.joiningAllowed;
            joinButton.enable();
        }

        if(requestButton) requestButton.visible = this._expanded && group.requestMembershipAllowed;
        if(manageButton) manageButton.visible = this._expanded && group.isOwner;
        if(logo) logo.visible = this._expanded;
        if(infoRegion) infoRegion.visible = this._expanded;

        const badgeWidget = (logo?.widget ?? null) as IBadgeImageWidget | null;

        if(badgeWidget)
        {
            badgeWidget.badgeId = group.badgeCode;
            badgeWidget.groupId = group.groupId;
        }

        window.x = 0;
        window.y = 0;
        window.height = this._expanded ? (expandedBg?.height ?? window.height) : (contractedBg?.height ?? window.height);

        if(this.toolbarAttachAllowed())
        {
            this._groupsManager?.toolbar?.extensionView?.attachExtension(
                GroupRoomInfoCtrl.TOOLBAR_EXTENSION_ID,
                window,
                -1,
                GroupRoomInfoCtrl.TOOLBAR_EXTENSION_ORDER
            );
        }
    }

    // AS3: .../GroupRoomInfoCtrl.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null) return;

        const window = this._groupsManager?.getXmlWindow('group_room_info') as IWindowContainer | null;

        if(!window)
        {
            log.error('prepareWindow: getXmlWindow("group_room_info") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const bind = (name: string, procedure: (event: WindowEvent, window: IWindow) => void): void =>
        {
            const child = window.findChildByName(name);

            if(child) child.procedure = procedure;
            else log.warn(`prepareWindow: group_room_info has no "${name}" child`);
        };

        bind('join_button', this.onJoin);
        bind('request_membership_button', this.onJoin);
        bind('manage_button', this.onManage);
        bind('title_region', this.onTitleClick);
        bind('info_region', this.onInfoClick);
    }

    /**
     * AS3 detaches the toolbar extension and drops the group, but does not hide or
     * dispose the window — detaching is what removes it from view.
     */
    // AS3: .../GroupRoomInfoCtrl.as::close()
    close(): void
    {
        if(this._window === null) return;

        if(this.toolbarAttachAllowed())
        {
            this._groupsManager?.toolbar?.extensionView?.detachExtension(GroupRoomInfoCtrl.TOOLBAR_EXTENSION_ID);
        }

        this._expectedGroupId = 0;
        this._group = null;
    }

    // AS3: .../GroupRoomInfoCtrl.as::onTitleClick()
    private onTitleClick = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._expanded = !this._expanded;
        this.refresh();
        this._groupsManager?.toolbar?.toolbarEvents.emit(HabboToolbarEvent.GROUP_ROOM_INFO_CLICK, new HabboToolbarEvent(HabboToolbarEvent.GROUP_ROOM_INFO_CLICK));
    };

    // AS3: .../GroupRoomInfoCtrl.as::onInfoClick()
    private onInfoClick = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._group || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupRoomInfo', 'groupInfo');
        this._groupsManager.send(new GetHabboGroupDetailsMessageComposer(this._group.groupId, true));
        this._groupsManager.toolbar?.toolbarEvents.emit(HabboToolbarEvent.GROUP_ROOM_INFO_CLICK, new HabboToolbarEvent(HabboToolbarEvent.GROUP_ROOM_INFO_CLICK));
    };

    // AS3: .../GroupRoomInfoCtrl.as::onManage()
    private onManage = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._group || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupRoomInfo', 'manageGroup');
        this._groupsManager.send(new GetGuildEditInfoMessageComposer(this._group.groupId));
        this._groupsManager.toolbar?.toolbarEvents.emit(HabboToolbarEvent.GROUP_ROOM_INFO_CLICK, new HabboToolbarEvent(HabboToolbarEvent.GROUP_ROOM_INFO_CLICK));
    };

    // AS3: .../GroupRoomInfoCtrl.as::onJoin()
    private onJoin = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._group || !this._groupsManager) return;

        this._groupsManager.trackGoogle('groupRoomInfo', 'joinGroup');

        // Disabled until the reply redraws the panel, so the join cannot be sent twice.
        this._window?.findChildByName('join_button')?.disable();

        this._groupsManager.send(new JoinHabboGroupMessageComposer(this._group.groupId));
        this._groupsManager.send(new EventLogMessageComposer('HabboGroups', `${this._group.groupId}`, 'join'));
        this._groupsManager.toolbar?.toolbarEvents.emit(HabboToolbarEvent.GROUP_ROOM_INFO_CLICK, new HabboToolbarEvent(HabboToolbarEvent.GROUP_ROOM_INFO_CLICK));
    };

    // AS3: .../GroupRoomInfoCtrl.as::toolbarAttachAllowed()
    private toolbarAttachAllowed(): boolean
    {
        return this._groupsManager !== null
            && this._groupsManager.toolbar !== null
            && this._groupsManager.toolbar.extensionView !== null
            && this._groupsManager.toolbarAttachEnabled;
    }

    // AS3: .../GroupRoomInfoCtrl.as::dispose()
    dispose(): void
    {
        if(this.toolbarAttachAllowed())
        {
            this._groupsManager?.toolbar?.extensionView?.detachExtension(GroupRoomInfoCtrl.TOOLBAR_EXTENSION_ID);
        }

        this._groupsManager = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
