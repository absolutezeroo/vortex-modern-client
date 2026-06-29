import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
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
	HabboGroupDeactivatedMessageEvent,
	HabboGroupDetailsMessageEvent,
	HabboGroupJoinFailedMessageEvent,
	type HabboGroupDetailsData
} from '@habbo/communication/messages/incoming/users';
import {
	GetExtendedProfileMessageComposer,
	GetHabboGroupDetailsMessageComposer
} from '@habbo/communication/messages/outgoing/users';

const log = Logger.getLogger('Groups');

/**
 * Habbo Groups Manager
 *
 * Manages group (guild) operations including viewing group info,
 * managing members, and handling group-related link events.
 *
 * In the AS3 source this class also manages several VIEW controllers
 * (DetailsWindowCtrl, GuildMembersWindowCtrl, etc.) which are omitted
 * here as the UI layer is handled by SolidJS.
 *
 * @see source_as_win63/habbo/groups/HabboGroupsManager.as
 */
export class HabboGroupsManager extends Component implements IHabboGroupsManager, ILinkEventTracker
{
	public static readonly GROUPS_TRACKING_CATEGORY: string = 'HabboGroups';

	private _communicationManager: IHabboCommunicationManager | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _localization: IHabboLocalizationManager | null = null;
	private _navigator: IHabboNavigator | null = null;
	private _newNavigator: IHabboNewNavigator | null = null;
	private _friendList: IHabboFriendList | null = null;
	private _catalog: unknown | null = null;
	private _toolbar: IHabboToolbar | null = null;
	private _sessionDataManager: ISessionDataManager | null = null;
	private _habboTracking: IHabboTracking | null = null;
	private _messageEvents: IMessageEvent[] = [];
	private _groupDetailsById: Map<number, HabboGroupDetailsData> = new Map();

	constructor(context: IContext)
	{
		super(context);
	}

	/**
	 * The URL prefix pattern this tracker handles
	 */
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
				}
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
	linkReceived(link: string): void
	{
		const parts = link.split('/');

		if (parts.length !== 2)
		{
			return;
		}

		const groupId = parseInt(parts[1], 10);

		if (!isNaN(groupId))
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
	updateVisibleExtendedProfile(userId: number): void
	{
		log.debug('updateVisibleExtendedProfile:', userId);
	}

	/**
	 * Show the extended profile for a user
	 *
	 * @param userId The user ID whose profile to show
	 */
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
	openGroupForum(groupId: number): void
	{
		this.context.createLinkEvent('groupforum/' + groupId);
	}

	dispose(): void
	{
		if (this._disposed) return;

		for(const event of this._messageEvents)
		{
			this._communicationManager?.removeMessageEvent(event);
		}

		this._messageEvents.length = 0;
		this._groupDetailsById.clear();
		this.context.removeLinkEventTracker(this);
		this._communicationManager = null;

		super.dispose();
	}

	protected override initComponent(): void
	{
		this.context.addLinkEventTracker(this);
		this.addMessageEvent(new HabboGroupDetailsMessageEvent(this.onGroupDetails.bind(this)));
		this.addMessageEvent(new GroupDetailsChangedMessageEvent(this.onGroupDetailsChanged.bind(this)));
		this.addMessageEvent(new HabboGroupDeactivatedMessageEvent(this.onGroupDeactivated.bind(this)));
		this.addMessageEvent(new HabboGroupJoinFailedMessageEvent(this.onGroupJoinFailed.bind(this)));

		log.debug('Groups manager initialized');
	}

	private send(composer: IMessageComposer<unknown[]>): void
	{
		this._communicationManager?.connection?.send(composer);
	}

	private addMessageEvent(event: IMessageEvent): void
	{
		if(!this._communicationManager)
		{
			return;
		}

		this._communicationManager.addMessageEvent(event);
		this._messageEvents.push(event);
	}

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
	}

	private onGroupDetailsChanged(event: IMessageEvent): void
	{
		const changedEvent = event as GroupDetailsChangedMessageEvent;

		if(changedEvent === null)
		{
			return;
		}

		if(this._groupDetailsById.has(changedEvent.groupId))
		{
			this.send(new GetHabboGroupDetailsMessageComposer(changedEvent.groupId, false));
		}
	}

	private onGroupDeactivated(event: IMessageEvent): void
	{
		const deactivatedEvent = event as HabboGroupDeactivatedMessageEvent;

		if(deactivatedEvent === null)
		{
			return;
		}

		this._groupDetailsById.delete(deactivatedEvent.groupId);
	}

	private onGroupJoinFailed(event: IMessageEvent): void
	{
		const failedEvent = event as HabboGroupJoinFailedMessageEvent;

		if(failedEvent === null)
		{
			return;
		}

		log.warn(`Group join failed with reason ${failedEvent.reason}`);
	}
}
