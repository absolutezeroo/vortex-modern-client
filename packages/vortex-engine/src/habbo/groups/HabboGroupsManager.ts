import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';
import type {IHabboGroupsManager} from './IHabboGroupsManager';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboNewNavigator} from '@iid/IIDHabboNewNavigator';
import {IID_HabboFriendList} from '@iid/IIDHabboFriendList';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import {
    GroupDetailsChangedMessageEvent,
    GuildCreatedMessageEvent,
    GuildCreationInfoMessageEvent,
    GuildEditFailedMessageEvent,
    GuildEditInfoMessageEvent,
    GuildMemberFurniCountInHQMessageEvent,
    GuildMemberMgmtFailedMessageEvent,
    GuildMembersMessageEvent,
    GuildMembershipRejectedMessageEvent,
    GuildMembershipUpdatedMessageEvent,
    GroupMembershipRequestedMessageEvent,
    GuildEditorDataMessageEvent,
    HabboGroupDeactivatedMessageEvent,
    HabboGroupDetailsMessageEvent,
    HabboGroupJoinFailedMessageEvent,
    HabboUserBadgesMessageEvent,
    ExtendedProfileMessageEvent,
    ExtendedProfileChangedMessageEvent,
    type GuildEditorData,
    type HabboGroupDetailsData
} from '@habbo/communication/messages/incoming/users';
import {
    GetExtendedProfileMessageComposer,
    GetGuildEditorDataMessageComposer,
    GetMemberGuildItemCountMessageComposer,
    KickMemberMessageComposer,
    GetHabboGroupDetailsMessageComposer
} from '@habbo/communication/messages/outgoing/users';
import {GuildEditFailedMessageParser} from '@habbo/communication/messages/parser/users/GuildEditFailedMessageParser';
import {ScrSendUserInfoEvent} from '@habbo/communication/messages/incoming/users/ScrSendUserInfoEvent';
import type {ScrSendUserInfoMessageParser} from '@habbo/communication/messages/parser/users/ScrSendUserInfoMessageParser';
import {FlatCreatedMessageEvent} from '@habbo/communication/messages/incoming/navigator/FlatCreatedMessageEvent';
import type {FlatCreatedMessageParser} from '@habbo/communication/messages/parser/navigator/FlatCreatedMessageParser';
import {RoomEntryInfoMessageEvent} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';
import {GetGuestRoomResultMessageEvent} from '@habbo/communication/messages/incoming/navigator/GetGuestRoomResultMessageEvent';
import {CloseConnectionMessageEvent} from '@habbo/communication/messages/incoming/room/session/CloseConnectionMessageEvent';
import type {GetGuestRoomResultMessageParser} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import type {RoomEntryInfoMessageParser} from '@habbo/communication/messages/parser/room/engine/RoomEntryInfoMessageParser';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import {HabboGroupsEditorData} from './events/HabboGroupsEditorData';
import {ExtendedProfileWindowCtrl} from './ExtendedProfileWindowCtrl';
import {GuildManagementWindowCtrl} from './GuildManagementWindowCtrl';
import {DetailsWindowCtrl} from './DetailsWindowCtrl';
import {GuildMembersWindowCtrl} from './GuildMembersWindowCtrl';
import {GuildKickData} from './GuildKickData';
import {GroupCreatedWindowCtrl} from './GroupCreatedWindowCtrl';
import {HcRequiredWindowCtrl} from './HcRequiredWindowCtrl';
import {GroupRoomInfoCtrl} from './GroupRoomInfoCtrl';

const log = Logger.getLogger('habbo.groups.HabboGroupsManager');

/**
 * Habbo Groups Manager
 *
 * Owns the group message events and the window controllers they drive: the extended
 * profile, the creation/edit wizard, the congratulations window, the HC-required window
 * and the in-room group panel. It also caches the guild editor data, which every badge
 * and colour pane reads and which is fetched once per session.
 *
 * Three of AS3's controllers are still unported and their handlers say so at the point of
 * use: `GuildMembersWindowCtrl`, `GroupDetailsCtrl` and `DetailsWindowCtrl`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as
 */
export class HabboGroupsManager extends Component implements IHabboGroupsManager, ILinkEventTracker
{
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::GROUPS_TRACKING_CATEGORY
    public static readonly GROUPS_TRACKING_CATEGORY: string = 'HabboGroups';

    /**
     * The join-failure reason that means "needs HC". AS3 inlines the 4 in
     * `onJoinFailed()`; there is no named constant for it in any tree, so this name is
     * DERIVED from that branch.
     *
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onJoinFailed()
     */
    private static readonly JOIN_FAILED_HC_REQUIRED: number = 4;

    private _communicationManager: IHabboCommunicationManager | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_localization
    private _localization: IHabboLocalizationManager | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_navigator
    private _navigator: IHabboNavigator | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_newNavigator
    private _newNavigator: IHabboNewNavigator | null = null;
    private _friendList: IHabboFriendList | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_catalog
    private _catalog: unknown | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_habboTracking
    private _habboTracking: IHabboTracking | null = null;
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];
    private _groupDetailsById: Map<number, HabboGroupDetailsData> = new Map();
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_5106
    private readonly _extendedProfileWindowCtrl: ExtendedProfileWindowCtrl;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_5442
    private readonly _guildManagementWindowCtrl: GuildManagementWindowCtrl;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_6928
    private readonly _groupCreatedWindowCtrl: GroupCreatedWindowCtrl;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_6265
    private readonly _hcRequiredWindowCtrl: HcRequiredWindowCtrl;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_5157
    private readonly _groupRoomInfoCtrl: GroupRoomInfoCtrl;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_5630
    private readonly _detailsWindowCtrl: DetailsWindowCtrl;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_5341
    private readonly _guildMembersWindowCtrl: GuildMembersWindowCtrl;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_5283
    private _kickData: GuildKickData | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_8664
    private _guildEditorData: GuildEditorData | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_9811
    private _hasVip: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::_SafeStr_6722
    private _roomId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::HabboGroupsManager()
    // The asset library is not optional in practice: getButtonImage() and every ColorGridCtrl
    // read their bitmaps out of it, and Component leaves `assets` null when none is passed.
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);

        this._extendedProfileWindowCtrl = new ExtendedProfileWindowCtrl(this);
        this._guildManagementWindowCtrl = new GuildManagementWindowCtrl(this);
        this._groupCreatedWindowCtrl = new GroupCreatedWindowCtrl(this);
        this._hcRequiredWindowCtrl = new HcRequiredWindowCtrl(this);
        this._groupRoomInfoCtrl = new GroupRoomInfoCtrl(this);
        this._detailsWindowCtrl = new DetailsWindowCtrl(this);
        this._guildMembersWindowCtrl = new GuildMembersWindowCtrl(this);
    }

    /**
	 * The URL prefix pattern this tracker handles
	 */
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::get linkPattern()
    get linkPattern(): string
    {
        return 'group/';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            ...super.dependencies,
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localization = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboNavigator,
                (navigator: IHabboNavigator | null) =>
                {
                    this._navigator = navigator;
                }
            ),
            new ComponentDependency(
                IID_HabboNewNavigator,
                (navigator: IHabboNewNavigator | null) =>
                {
                    this._newNavigator = navigator;
                }
            ),
            new ComponentDependency(
                IID_HabboFriendList,
                (friendList: IHabboFriendList | null) =>
                {
                    this._friendList = friendList;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: unknown | null) =>
                {
                    this._catalog = catalog;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) =>
                {
                    this._toolbar = toolbar;
                }
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboTracking,
                (tracking: IHabboTracking | null) =>
                {
                    this._habboTracking = tracking;
                }
            ),
        ];
    }

    /**
	 * Called when a link matching this tracker's pattern is received.
	 * Parses "group/{id}" and opens the group info.
	 *
	 * @param link The full link string
	 */
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length !== 2)
        {
            return;
        }

        const groupId = parseInt(parts[1], 10);

        if(!isNaN(groupId))
        {
            this.openGroupInfo(groupId);
        }
    }

    /**
	 * Show group badge info and open group details
	 *
	 * @param isStaff Whether the requesting user is staff
	 * @param groupId The group ID to show badge info for
	 */
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::showGroupBadgeInfo()
    showGroupBadgeInfo(isStaff: boolean, groupId: number): void
    {
        this.openGroupInfo(groupId);

        log.debug('showGroupBadgeInfo:', groupId, 'staff:', isStaff);
    }

    /**
	 * Open the group info panel for the given group
	 *
	 * @param groupId The group ID to open info for
	 */
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::openGroupInfo()
    openGroupInfo(groupId: number): void
    {
        log.debug('openGroupInfo:', groupId);
        this.send(new GetHabboGroupDetailsMessageComposer(groupId, true));
    }

    /**
	 * Update a currently visible extended profile
	 *
	 * @param userId The user ID whose profile should be updated
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::updateVisibleExtendedProfile()
    updateVisibleExtendedProfile(userId: number): void
    {
        this._extendedProfileWindowCtrl.updateVisibleExtendedProfile(userId);
    }

    /**
	 * Show the extended profile for a user
	 *
	 * @param userId The user ID whose profile to show
	 */
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::showExtendedProfile()
    showExtendedProfile(userId: number): void
    {
        log.debug('showExtendedProfile:', userId);
        this.send(new GetExtendedProfileMessageComposer(userId));
    }

    /**
	 * Open the group forum for the given group via link event
	 *
	 * @param groupId The group ID whose forum to open
	 */
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::openGroupForum()
    openGroupForum(groupId: number): void
    {
        this.context.createLinkEvent('groupforum/' + groupId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._localization;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get friendlist()
    get friendlist(): IHabboFriendList | null
    {
        return this._friendList;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get newNavigator()
    get newNavigator(): IHabboNewNavigator | null
    {
        return this._newNavigator;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get habboTracking()
    get habboTracking(): IHabboTracking | null
    {
        return this._habboTracking;
    }

    /**
	 * AS3 caches this off its own `UserObjectMessageEvent` subscription (`onUserObject()` writes
	 * the field this getter returns). The port reads the session data manager instead, which is
	 * fed by the same message — so the subscription is deliberately not reproduced rather than
	 * missing. Anything sweeping for unregistered AS3 message events will flag it; this is why.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get avatarId()
    get avatarId(): number
    {
        return this._sessionDataManager?.userId ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get isActivityDisplayEnabled()
    get isActivityDisplayEnabled(): boolean
    {
        return this.getBoolean('activity.point.display.enabled');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::getXmlWindow()
    // Delegates to windowManager.buildWidgetLayout() (fetch-asset-by-name + buildFromXML,
    // same as AS3's manual asset lookup) matching InfoStandWidget.getXmlWindow()'s pattern.
    getXmlWindow(name: string): IWindow | null
    {
        return this._windowManager?.buildWidgetLayout(name) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        for(const event of this._messageEvents)
        {
            this._communicationManager?.removeMessageEvent(event);
        }

        this._messageEvents.length = 0;
        this._groupDetailsById.clear();
        this.context.removeLinkEventTracker(this);
        this.context.removeLinkEventTracker(this._extendedProfileWindowCtrl);
        this._extendedProfileWindowCtrl.dispose();
        this._guildManagementWindowCtrl.dispose();
        this._groupCreatedWindowCtrl.dispose();
        this._hcRequiredWindowCtrl.dispose();
        this._groupRoomInfoCtrl.dispose();
        this._detailsWindowCtrl.dispose();
        this._guildMembersWindowCtrl.dispose();
        this._guildEditorData = null;
        this._communicationManager = null;

        super.dispose();
    }

    protected override initComponent(): void
    {
        this.context.addLinkEventTracker(this);
        this.context.addLinkEventTracker(this._extendedProfileWindowCtrl);
        this.addMessageEvent(new ExtendedProfileMessageEvent(this.onExtendedProfile.bind(this)));
        this.addMessageEvent(new ExtendedProfileChangedMessageEvent(this.onExtendedProfileChanged.bind(this)));
        this.addMessageEvent(new HabboUserBadgesMessageEvent(this.onUserBadgesMessage.bind(this)));
        this.addMessageEvent(new HabboGroupDetailsMessageEvent(this.onGroupDetails.bind(this)));
        this.addMessageEvent(new GroupDetailsChangedMessageEvent(this.onGroupDetailsChanged.bind(this)));
        this.addMessageEvent(new HabboGroupDeactivatedMessageEvent(this.onGroupDeactivated.bind(this)));
        this.addMessageEvent(new HabboGroupJoinFailedMessageEvent(this.onGroupJoinFailed.bind(this)));
        this.addMessageEvent(new GuildCreationInfoMessageEvent(this.onGuildCreationInfo.bind(this)));
        this.addMessageEvent(new GuildEditInfoMessageEvent(this.onGuildEditInfo.bind(this)));
        this.addMessageEvent(new GuildEditorDataMessageEvent(this.onGuildEditorData.bind(this)));
        this.addMessageEvent(new GuildCreatedMessageEvent(this.onGuildCreated.bind(this)));
        this.addMessageEvent(new GuildEditFailedMessageEvent(this.onGuildEditFailed.bind(this)));
        this.addMessageEvent(new GuildMemberFurniCountInHQMessageEvent(this.onKickConfirmation.bind(this)));
        this.addMessageEvent(new GuildMembersMessageEvent(this._guildMembersWindowCtrl.onGuildMembers.bind(this._guildMembersWindowCtrl)));
        this.addMessageEvent(new GuildMembershipUpdatedMessageEvent(this._guildMembersWindowCtrl.onGuildMembershipUpdated.bind(this._guildMembersWindowCtrl)));
        this.addMessageEvent(new GuildMemberMgmtFailedMessageEvent(this._guildMembersWindowCtrl.onGuildMemberMgmtFailed.bind(this._guildMembersWindowCtrl)));
        this.addMessageEvent(new GuildMembershipRejectedMessageEvent(this._guildMembersWindowCtrl.onGuildMembershipRejected.bind(this._guildMembersWindowCtrl)));
        this.addMessageEvent(new GroupMembershipRequestedMessageEvent(this._guildMembersWindowCtrl.onMembershipRequested.bind(this._guildMembersWindowCtrl)));
        this.addMessageEvent(new FlatCreatedMessageEvent(this.onFlatCreated.bind(this)));
        this.addMessageEvent(new ScrSendUserInfoEvent(this.onSubscriptionInfo.bind(this)));
        this.addMessageEvent(new RoomEntryInfoMessageEvent(this.onRoomEnter.bind(this)));
        this.addMessageEvent(new GetGuestRoomResultMessageEvent(this.onRoomInfo.bind(this)));
        this.addMessageEvent(new CloseConnectionMessageEvent(this.onRoomLeave.bind(this)));

        log.debug('Groups manager initialized');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::send()
    // Public: called externally by ExtendedProfileWindowCtrl (matches AS3, which
    // also calls _SafeStr_4571.send(...) from outside this class).
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager)
        {
            return;
        }

        this._communicationManager.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onExtendedProfile()
    private onExtendedProfile(event: IMessageEvent): void
    {
        const data = (event as ExtendedProfileMessageEvent).data;

        log.trace(`onExtendedProfile: received, userId=${data?.userId} openProfileWindow=${data?.openProfileWindow}`);

        if(!data || !data.openProfileWindow) return;

        this._extendedProfileWindowCtrl.badgeUpdateExpected = true;
        this._extendedProfileWindowCtrl.onProfile(data);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onExtendedProfileChanged()
    private onExtendedProfileChanged(event: IMessageEvent): void
    {
        this._extendedProfileWindowCtrl.onProfileChanged((event as ExtendedProfileChangedMessageEvent).userId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onUserBadgesMessage()
    private onUserBadgesMessage(event: IMessageEvent): void
    {
        const badgesEvent = event as HabboUserBadgesMessageEvent;

        this._extendedProfileWindowCtrl.onUserBadges(badgesEvent.userId, badgesEvent.badges);
    }

    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::onGroupDetails()
    private onGroupDetails(event: IMessageEvent): void
    {
        const detailsEvent = event as HabboGroupDetailsMessageEvent;

        if(detailsEvent === null)
        {
            return;
        }

        const data = detailsEvent.data;

        if(data === null)
        {
            return;
        }

        this._groupDetailsById.set(data.groupId, data);
        this._detailsWindowCtrl.onGroupDetails(data);
        this._groupRoomInfoCtrl.onGroupDetails(data);

        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onGroupDetails() also forwards to
        // ExtendedProfileWindowCtrl::onGroupDetails(), which the port's ExtendedProfileWindowCtrl does not implement.
    }

    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::onGroupDetailsChanged()
    private onGroupDetailsChanged(event: IMessageEvent): void
    {
        const changedEvent = event as GroupDetailsChangedMessageEvent;

        if(changedEvent === null)
        {
            return;
        }

        // AS3 gates this on DetailsWindowCtrl/GroupRoomInfoCtrl currently displaying the
        // group. The details cache stands in for the unported DetailsWindowCtrl half.
        if(this._groupDetailsById.has(changedEvent.groupId) || this._groupRoomInfoCtrl.isDisplayingGroup(changedEvent.groupId))
        {
            this.send(new GetHabboGroupDetailsMessageComposer(changedEvent.groupId, false));
        }
    }

    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::onGroupDeactivated()
    private onGroupDeactivated(event: IMessageEvent): void
    {
        const deactivatedEvent = event as HabboGroupDeactivatedMessageEvent;

        if(deactivatedEvent === null)
        {
            return;
        }

        this._groupDetailsById.delete(deactivatedEvent.groupId);
        this._detailsWindowCtrl.onGroupDeactivated(deactivatedEvent.groupId);
        this._groupRoomInfoCtrl.onGroupDeactivated(deactivatedEvent.groupId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onJoinFailed()
    private onGroupJoinFailed(event: IMessageEvent): void
    {
        const failedEvent = event as HabboGroupJoinFailedMessageEvent;

        if(failedEvent === null)
        {
            return;
        }

        const reason = failedEvent.reason;

        // Reason 4 is "needs HC" and gets the club window; everything else is a plain
        // localized alert. AS3 inlines the 4.
        if(reason === HabboGroupsManager.JOIN_FAILED_HC_REQUIRED)
        {
            this._hcRequiredWindowCtrl.show(false);

            return;
        }

        const key = `group.joinfail.${reason}`;

        this._windowManager?.alert(
            '${group.joinfail.title}',
            this._localization?.getLocalization(key, key) ?? key,
            0,
            this.onAlertClose
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onGuildCreationInfo()
    private onGuildCreationInfo(event: IMessageEvent): void
    {
        const data = (event as GuildCreationInfoMessageEvent).data;

        if(!data) return;

        this._guildManagementWindowCtrl.onGuildCreationInfo(data);
        this.requestGuildEditorData();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onGuildEditInfo()
    private onGuildEditInfo(event: IMessageEvent): void
    {
        const data = (event as GuildEditInfoMessageEvent).data;

        if(!data) return;

        this._guildManagementWindowCtrl.onGuildEditInfo(data);
        this.requestGuildEditorData();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onGuildEditorData()
    private onGuildEditorData(event: IMessageEvent): void
    {
        this._guildEditorData = (event as GuildEditorDataMessageEvent).data;
        this.events.emit(HabboGroupsEditorData.EDIT_INFO, new HabboGroupsEditorData());
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onGuildCreated()
    private onGuildCreated(event: IMessageEvent): void
    {
        const createdEvent = event as GuildCreatedMessageEvent;

        this._groupCreatedWindowCtrl.show(createdEvent.groupId);
        this._guildManagementWindowCtrl.close();

        // So the room-info panel recognises the new group's details when they arrive,
        // rather than discarding them as belonging to some other group.
        this._groupRoomInfoCtrl.expectedGroupId = createdEvent.groupId;

        if(this._roomId !== createdEvent.baseRoomId) this.navigator?.goToPrivateRoom(createdEvent.baseRoomId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onGuildEditFailed()
    private onGuildEditFailed(event: IMessageEvent): void
    {
        const reason = (event as GuildEditFailedMessageEvent).reason;

        if(reason === GuildEditFailedMessageParser.REASON_HC_REQUIRED)
        {
            this._hcRequiredWindowCtrl.show(true);

            return;
        }

        const key = `group.edit.fail.${reason}`;

        this._windowManager?.alert(
            '${group.edit.fail.title}',
            this._localization?.getLocalization(key, key) ?? key,
            0,
            this.onAlertClose
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onFlatCreated()
    private onFlatCreated(event: IMessageEvent): void
    {
        const parser = (event as FlatCreatedMessageEvent).getParser() as FlatCreatedMessageParser | null;

        if(!parser) return;

        this._guildManagementWindowCtrl.onFlatCreated(parser.flatId, parser.flatName);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onSubscriptionInfo()
    private onSubscriptionInfo(event: IMessageEvent): void
    {
        const parser = (event as ScrSendUserInfoEvent).getParser() as ScrSendUserInfoMessageParser | null;

        if(!parser) return;

        this._hasVip = parser.isVIP && parser.minutesUntilExpiration > 0;
        this._guildManagementWindowCtrl.onSubscriptionChange();
    }

    /**
     * Closes the group panel and records the room id, which `onGuildCreated()` compares
     * to decide whether the player already stands in the new group's base room.
     *
     * AS3 closes both windows here — entering a room means the group panel and the details window
     * are describing somewhere you are no longer looking at.
     *
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onRoomEnter()
     */
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::onRoomEnter()
    private onRoomEnter(event: IMessageEvent): void
    {
        const parser = (event as RoomEntryInfoMessageEvent).getParser() as RoomEntryInfoMessageParser | null;

        if(!parser) return;

        this._groupRoomInfoCtrl.close();
        this._detailsWindowCtrl.close();
        this._roomId = parser.guestRoomId;
    }

    /**
     * AS3 also closes DetailsWindowCtrl here, which is not ported.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onRoomLeave()
    private onRoomLeave(_event: IMessageEvent): void
    {
        this._groupRoomInfoCtrl.close();
    }

    /**
     * Only the payload that actually puts the player in the room counts — the navigator
     * asks for guest-room data for rooms it merely lists, and those replies must not
     * retarget the in-room panel.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onRoomInfo()
    private onRoomInfo(event: IMessageEvent): void
    {
        const parser = (event as GetGuestRoomResultMessageEvent).getParser() as GetGuestRoomResultMessageParser | null;

        if(!parser || !parser.enterRoom) return;

        const data = parser.data;

        if(!data) return;

        this._groupRoomInfoCtrl.onRoomInfo(data);
    }

    /**
     * Requested once: the badge parts and colour palettes never change within a session,
     * so the first creation- or edit-info payload that finds the cache empty asks for them
     * and every later one reuses what arrived.
     *
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::requestGuildEditorData()
     */
    // AS3: .../src/com/sulake/habbo/groups/HabboGroupsManager.as::requestGuildEditorData()
    private requestGuildEditorData(): void
    {
        if(this._guildEditorData === null) this.send(new GetGuildEditorDataMessageComposer());
    }

    /**
     * Step one of removing a member — and of leaving, which is a player kicking
     * themselves. Nothing is sent to the guild yet: this only asks how much furniture the
     * target has in the HQ, because that number picks the confirmation text.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::handleUserKick()
    handleUserKick(userId: number, groupId: number): void
    {
        this._kickData = new GuildKickData(groupId, userId);
        this.send(new GetMemberGuildItemCountMessageComposer(groupId, userId));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::handleUserBlock()
    handleUserBlock(userId: number, groupId: number): void
    {
        this._kickData = new GuildKickData(groupId, userId, true);
        this.send(new GetMemberGuildItemCountMessageComposer(groupId, userId));
    }

    /**
     * The furni count came back, so the confirmation can finally name a number — and, for
     * someone other than the player, a user. That name comes from the members list's own
     * page, which is the only place the client holds it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onKickConfirmation()
    private onKickConfirmation(event: IMessageEvent): void
    {
        const countEvent = event as GuildMemberFurniCountInHQMessageEvent;

        if(countEvent === null || this._kickData === null) return;

        const userId = countEvent.userId;
        const furniCount = countEvent.furniCount;
        const key = this._kickData.targetBlocked ? 'group.block' : 'group.kick';
        const isSelf = userId === this.avatarId;

        if(furniCount > 0)
        {
            if(isSelf)
            {
                this.localization?.registerParameter('group.leaveconfirm.desc', 'amount', `${furniCount}`);
                this.windowManager?.confirm('${group.leaveconfirm.title}', '${group.leaveconfirm.desc}', 0, this.onKickConfirmationClose);
            }
            else
            {
                const user = this._guildMembersWindowCtrl.data?.getUser(userId) ?? null;

                this.localization?.registerParameter(`${key}confirm.desc`, 'amount', `${furniCount}`);
                this.localization?.registerParameter(`${key}confirm.desc`, 'user', user?.userName ?? '');
                this.windowManager?.confirm(`\${${key}confirm.title}`, `\${${key}confirm.desc}`, 0, this.onKickConfirmationClose);
            }
        }
        else if(isSelf)
        {
            this.windowManager?.confirm('${group.leaveconfirm.title}', '${group.leaveconfirm_nofurni.desc}', 0, this.onKickConfirmationClose);
        }
        else if(this._guildMembersWindowCtrl.data !== null)
        {
            const user = this._guildMembersWindowCtrl.data.getUser(userId);

            this.localization?.registerParameter(`${key}confirm_nofurni.desc`, 'user', user?.userName ?? '');
            this.windowManager?.confirm(`\${${key}confirm.title}`, `\${${key}confirm_nofurni.desc}`, 0, this.onKickConfirmationClose);
        }
    }

    /** Only WE_OK sends the kick; every other way out of the dialog drops the request. */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onKickConfirmationClose()
    private onKickConfirmationClose = (dialog: IDisposable, event: WindowEvent): void =>
    {
        const kickData = this._kickData;

        this._kickData = null;

        if(dialog === null || kickData === null) return;

        dialog.dispose();

        if(event.type === 'WE_OK')
        {
            this.send(new KickMemberMessageComposer(kickData.kickGuildId, kickData.kickTargetId, kickData.targetBlocked));
        }
    };

    // Derived name: `detailsWindowCtrl` is declared in no AS3 tree — the trace points
    // at the class it belongs to, but the identifier itself is this port's.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get detailsWindowCtrl()
    get detailsWindowCtrl(): DetailsWindowCtrl
    {
        return this._detailsWindowCtrl;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::onAlertClose()
    private onAlertClose = (dialog: IDisposable): void =>
    {
        dialog.dispose();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get guildEditorData()
    get guildEditorData(): GuildEditorData | null
    {
        return this._guildEditorData;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get hasVip()
    get hasVip(): boolean
    {
        return this._hasVip;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get groupRoomInfoCtrl()
    get groupRoomInfoCtrl(): GroupRoomInfoCtrl
    {
        return this._groupRoomInfoCtrl;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get guildManagementWindowCtrl()
    get guildManagementWindowCtrl(): GuildManagementWindowCtrl
    {
        return this._guildManagementWindowCtrl;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get guildMembersWindowCtrl()
    get guildMembersWindowCtrl(): GuildMembersWindowCtrl
    {
        return this._guildMembersWindowCtrl;
    }

    /**
     * AS3 routes this through the new navigator's legacy handle rather than the legacy
     * navigator dependency directly.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get navigator()
    get navigator(): IHabboNavigator | null
    {
        return this._newNavigator?.legacyNavigator ?? this._navigator;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get toolbar()
    get toolbar(): IHabboToolbar | null
    {
        return this._toolbar;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::openCatalog()
    openCatalog(pageName: string): void
    {
        (this._catalog as IHabboCatalog | null)?.openCatalogPage(pageName);
    }

    /**
     * `source` is unused by AS3 too — it takes the caller's name and opens the club
     * centre regardless.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::openVipPurchase()
    openVipPurchase(_source: string): void
    {
        (this._catalog as IHabboCatalog | null)?.openClubCenter();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::trackGoogle()
    trackGoogle(category: string, action: string, value: number = -1): void
    {
        this._habboTracking?.trackGoogle(category, action, value);
    }

    /**
     * AS3 draws the named asset into a fresh transparent BitmapData so callers own the
     * copy; here the asset library already hands back an ImageBitmap, and the windows it
     * is given do not take ownership of it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::getButtonImage()
    getButtonImage(name: string): ImageBitmap | null
    {
        const bitmap = (this.assets?.getAssetByName(name)?.content ?? null) as ImageBitmap | null;

        if(!bitmap) log.warn(`getButtonImage: no bitmap asset named "${name}"`);

        return bitmap;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get groupRoomInfoEnabled()
    get groupRoomInfoEnabled(): boolean
    {
        return this.getBoolean('groupRoomInfo.enabled');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get groupDeletionEnabled()
    get groupDeletionEnabled(): boolean
    {
        return this.getBoolean('group.deletion.enabled');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get groupRoomInfoBadgeEnabled()
    get groupRoomInfoBadgeEnabled(): boolean
    {
        return this.groupRoomInfoEnabled && this.getBoolean('groupRoomInfo.badge.enabled');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HabboGroupsManager.as::get toolbarAttachEnabled()
    get toolbarAttachEnabled(): boolean
    {
        return this.groupRoomInfoEnabled && this.getBoolean('groupRoomInfo.attach.enabled');
    }
}
