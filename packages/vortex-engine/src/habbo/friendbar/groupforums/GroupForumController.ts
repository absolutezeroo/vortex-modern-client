import type {IContext} from '@core/runtime';
import {Component, ComponentDependency} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboHelp} from '@habbo/help/IHabboHelp';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboSoundManager} from '@iid/IIDHabboSoundManager';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';

import {ForumsListMessageEvent} from '@habbo/communication/messages/incoming/groupforums/ForumsListMessageEvent';
import {ForumThreadsMessageEvent} from '@habbo/communication/messages/incoming/groupforums/ForumThreadsMessageEvent';
import {ForumDataMessageEvent} from '@habbo/communication/messages/incoming/groupforums/ForumDataMessageEvent';
import {UnreadForumsCountMessageEvent} from '@habbo/communication/messages/incoming/groupforums/UnreadForumsCountMessageEvent';
import {PostMessageMessageEvent} from '@habbo/communication/messages/incoming/groupforums/PostMessageMessageEvent';
import {PostThreadMessageEvent} from '@habbo/communication/messages/incoming/groupforums/PostThreadMessageEvent';
import {UpdateThreadMessageEvent} from '@habbo/communication/messages/incoming/groupforums/UpdateThreadMessageEvent';
import {UpdateMessageMessageEvent} from '@habbo/communication/messages/incoming/groupforums/UpdateMessageMessageEvent';
import {ThreadMessagesMessageEvent} from '@habbo/communication/messages/incoming/groupforums/ThreadMessagesMessageEvent';

import type {ForumsListMessageParser} from '@habbo/communication/messages/parser/groupforums/ForumsListMessageParser';
import type {ForumThreadsMessageParser} from '@habbo/communication/messages/parser/groupforums/ForumThreadsMessageParser';
import type {ForumDataMessageParser} from '@habbo/communication/messages/parser/groupforums/ForumDataMessageParser';
import type {UnreadForumsCountMessageParser} from '@habbo/communication/messages/parser/groupforums/UnreadForumsCountMessageParser';
import type {PostMessageMessageParser} from '@habbo/communication/messages/parser/groupforums/PostMessageMessageParser';
import type {PostThreadMessageParser} from '@habbo/communication/messages/parser/groupforums/PostThreadMessageParser';
import type {UpdateThreadMessageParser} from '@habbo/communication/messages/parser/groupforums/UpdateThreadMessageParser';
import type {UpdateMessageMessageParser} from '@habbo/communication/messages/parser/groupforums/UpdateMessageMessageParser';
import type {ThreadMessagesMessageParser} from '@habbo/communication/messages/parser/groupforums/ThreadMessagesMessageParser';

import {GetForumsListMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/GetForumsListMessageComposer';
import {GetForumStatsMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/GetForumStatsMessageComposer';
import {GetThreadsMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/GetThreadsMessageComposer';
import {GetThreadMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/GetThreadMessageComposer';
import {GetMessagesMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/GetMessagesMessageComposer';
import {GetUnreadForumsCountMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/GetUnreadForumsCountMessageComposer';
import {UpdateForumSettingsMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/UpdateForumSettingsMessageComposer';
import {UpdateForumReadMarkerMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/UpdateForumReadMarkerMessageComposer';
import {UpdateThreadMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/UpdateThreadMessageComposer';
import {ModerateThreadMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/ModerateThreadMessageComposer';
import {ModerateMessageMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/ModerateMessageMessageComposer';
import {PostMessageMessageComposer} from '@habbo/communication/messages/outgoing/groupforums/PostMessageMessageComposer';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';

import type {ForumData} from '@habbo/communication/messages/parser/groupforums/ForumData';
import type {ForumPermissions} from '@habbo/communication/messages/parser/groupforums/ForumPermissions';
import type {ForumMessage} from '@habbo/communication/messages/parser/groupforums/ForumMessage';

import {ForumsListData} from './ForumsListData';
import {ThreadsListData} from './ThreadsListData';
import {MessagesListData} from './MessagesListData';
import {ForumModerationState} from './ForumModerationState';
import {UnseenForumsCountUpdatedEvent} from './UnseenForumsCountUpdatedEvent';
import {GroupForumView} from './GroupForumView';
import type {ComposeMessageView} from './ComposeMessageView';
import type {ForumSettingsView} from './ForumSettingsView';
import type {IGroupForumController} from './IGroupForumController';

/**
 * The group forums, end to end: it owns the connection to the server, the three page models, and
 * the single `GroupForumView` that renders whichever of them is current.
 *
 * Two things about the design are worth knowing before reading it.
 *
 * **Every incoming handler re-checks which forum is open.** `_forum` is the permissions record for
 * the forum the user is looking at, and a handler that arrives for a different `groupId` returns
 * without touching anything. That is not defensive coding — the unread-count poll below opens a
 * second, invisible conversation with the server on a timer, and its replies would otherwise
 * overwrite the visible page.
 *
 * **The poll changes shape depending on whether the window is open.** With no view it asks for the
 * count alone; with a view open it asks for the whole "my forums" list, because that list is what
 * the count is derived from and the open window needs the rows anyway.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/GroupForumController.as
 */
export class GroupForumController extends Component implements IGroupForumController, ILinkEventTracker
{
    // AS3: .../groupforums/GroupForumController.as::FORUMS_LIST_CODE_ACTIVE
    public static readonly FORUMS_LIST_CODE_ACTIVE: number = 0;

    // AS3: .../groupforums/GroupForumController.as::FORUMS_LIST_CODE_POPULAR
    public static readonly FORUMS_LIST_CODE_POPULAR: number = 1;

    // AS3: .../groupforums/GroupForumController.as::FORUMS_LIST_CODE_MY_FORUMS
    public static readonly FORUMS_LIST_CODE_MY_FORUMS: number = 2;

    // AS3: .../groupforums/GroupForumController.as::NO_ID
    public static readonly NO_ID: number = -1;

    // AS3: .../groupforums/GroupForumController.as::_configurationManager
    private _configurationManager: IHabboConfigurationManager | null = null;

    // AS3: .../groupforums/GroupForumController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: .../groupforums/GroupForumController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: .../groupforums/GroupForumController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: .../groupforums/GroupForumController.as::_help
    private _help: IHabboHelp | null = null;

    // AS3: .../groupforums/GroupForumController.as::_notifications
    private _notifications: IHabboNotifications | null = null;

    // AS3: .../groupforums/GroupForumController.as::_soundManager
    private _soundManager: IHabboSoundManager | null = null;

    // AS3: .../groupforums/GroupForumController.as::_habboTracking
    private _habboTracking: IHabboTracking | null = null;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_4684
    // **Name derived** (`_SafeStr_4684`, `var_172` in win63_version — obfuscated in every tree):
    // the one main window, whichever of the three lists it is currently showing.
    private _view: GroupForumView | null = null;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_6564
    // Name recovered from its own public accessor, `get composeMessageView()`.
    private _composeMessageView: ComposeMessageView | null = null;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_10136
    // Name recovered from its own public accessor, `get forumSettingsView()`.
    private _forumSettingsView: ForumSettingsView | null = null;

    // AS3: .../groupforums/GroupForumController.as::_requestedForumsListCode
    private _requestedForumsListCode: number = -1;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_5919
    // **Name derived**: the group whose forum was asked for, held until `onForumData` confirms it.
    private _requestedGroupId: number = -1;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_4633
    // **Name derived**: the open forum's permissions record — the value every handler below
    // compares an incoming `groupId` against.
    private _forum: ForumPermissions | null = null;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_6631
    // **Name derived**: the thread whose messages are on screen.
    private _currentThreadId: number = 0;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_5092
    // **Name derived**: the highest message id seen in this forum during this visit, which is what
    // gets flushed to the server as the read marker. Reset to 0 by `markForumAsRead()`.
    private _lastReadMessageId: number = 0;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_4954
    // **Name derived** from its type, as with the two below.
    private _forumsListData: ForumsListData | null = null;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_5145
    private _threadsListData: ThreadsListData | null = null;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_6135
    private _messagesListData: MessagesListData | null = null;

    // AS3: .../groupforums/GroupForumController.as::_lastReadMessageIndexByThread
    private _lastReadMessageIndexByThread: Map<number, number> = new Map();

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_7745
    // Name recovered from its own getter, `getGoToThreadId()`.
    private _goToThreadId: number = -1;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_7586
    // Name recovered from its own getter, `getGoToMessageIndex()`.
    private _goToMessageIndex: number = 0;

    /**
     * When the user last posted, as a `getTimer()` reading. It starts at -30000 rather than 0 so
     * that the flood check in `ComposeMessageView` reads "half a minute ago" before the first post
     * of the session, not "now".
     */
    // AS3: .../groupforums/GroupForumController.as::_lastPostTime
    private _lastPostTime: number = -30000;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_8107
    // Name recovered from its own getter, `get unreadForumsCount()`.
    private _unreadForumsCount: number = 0;

    // AS3: .../groupforums/GroupForumController.as::_SafeStr_6173
    // **Name derived** from its only producer, `startPollingForUnreadForumsCount()`.
    private _unreadForumsCountTimer: ReturnType<typeof setInterval> | null = null;

    // TS-only: AS3 removes its message events by disposing the component; the port's
    // communication manager needs each one handed back, so they are kept for `dispose()`.
    private _messageEvents: IMessageEvent[] = [];

    // AS3: .../groupforums/GroupForumController.as::GroupForumController()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    // AS3: .../groupforums/GroupForumController.as::get composeMessageView()
    get composeMessageView(): ComposeMessageView | null
    {
        return this._composeMessageView;
    }

    // AS3: .../groupforums/GroupForumController.as::set composeMessageView()
    set composeMessageView(value: ComposeMessageView | null)
    {
        this._composeMessageView = value;
    }

    // AS3: .../groupforums/GroupForumController.as::get forumSettingsView()
    get forumSettingsView(): ForumSettingsView | null
    {
        return this._forumSettingsView;
    }

    // AS3: .../groupforums/GroupForumController.as::set forumSettingsView()
    set forumSettingsView(value: ForumSettingsView | null)
    {
        this._forumSettingsView = value;
    }

    // AS3: .../groupforums/GroupForumController.as::get notifications()
    get notifications(): IHabboNotifications | null
    {
        return this._notifications;
    }

    // AS3: .../groupforums/GroupForumController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: .../groupforums/GroupForumController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: .../groupforums/GroupForumController.as::get lastPostTime()
    get lastPostTime(): number
    {
        return this._lastPostTime;
    }

    // AS3: .../groupforums/GroupForumController.as::get unreadForumsCount()
    get unreadForumsCount(): number
    {
        return this._unreadForumsCount;
    }

    // AS3: .../groupforums/GroupForumController.as::get tracking()
    get tracking(): IHabboTracking | null
    {
        return this._habboTracking;
    }

    // AS3: .../groupforums/GroupForumController.as::get dependencies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            ...super.dependencies,
            new ComponentDependency(
                IID_HabboConfigurationManager,
                (manager: IHabboConfigurationManager | null) =>
                {
                    this._configurationManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizationManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboHelp,
                (help: IHabboHelp | null) =>
                {
                    this._help = help;
                }
            ),
            new ComponentDependency(
                IID_HabboNotifications,
                (notifications: IHabboNotifications | null) =>
                {
                    this._notifications = notifications;
                }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboSoundManager,
                (manager: IHabboSoundManager | null) =>
                {
                    this._soundManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboTracking,
                (tracking: IHabboTracking | null) =>
                {
                    this._habboTracking = tracking;
                }
            ),
            // AS3 lists the toolbar with a null setter: it wants the toolbar to exist before the
            // forums do (the unread badge lives there) but keeps no reference to it.
            new ComponentDependency(IID_HabboToolbar, null),
        ];
    }

    // AS3: .../groupforums/GroupForumController.as::initComponent()
    protected override initComponent(): void
    {
        this.addMessageEvent(new ForumsListMessageEvent(this.onForumsList.bind(this)));
        this.addMessageEvent(new ForumThreadsMessageEvent(this.onThreadList.bind(this)));
        this.addMessageEvent(new ForumDataMessageEvent(this.onForumData.bind(this)));
        this.addMessageEvent(new UnreadForumsCountMessageEvent(this.onUnreadForumsCountMessage.bind(this)));
        this.addMessageEvent(new PostMessageMessageEvent(this.onPostMessageMessage.bind(this)));
        this.addMessageEvent(new PostThreadMessageEvent(this.onPostThreadMessage.bind(this)));
        this.addMessageEvent(new UpdateThreadMessageEvent(this.onUpdateThread.bind(this)));
        this.addMessageEvent(new UpdateMessageMessageEvent(this.onUpdateMessage.bind(this)));
        this.addMessageEvent(new ThreadMessagesMessageEvent(this.onThreadMessageList.bind(this)));
        this.context.addLinkEventTracker(this);
        this.startPollingForUnreadForumsCount();
    }

    // TS-only: AS3's `_communicationManager.addHabboConnectionMessageEvent()` registers and forgets;
    // the port has to keep each event so `dispose()` can hand it back.
    private addMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._communicationManager.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    // TS-only: AS3 sends through `_communicationManager.connection.send()` at every call site.
    private send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    /**
     * How often the unread-forums count is refreshed. AS3 reads it in seconds and defaults to 300,
     * i.e. five minutes; the first tick is fired immediately rather than waited for.
     */
    // AS3: .../groupforums/GroupForumController.as::startPollingForUnreadForumsCount()
    private startPollingForUnreadForumsCount(): void
    {
        const periodInSeconds = this._configurationManager?.getInteger('groupforum.poll.period', 300) ?? 300;

        this._unreadForumsCountTimer = setInterval(() => this.onUnreadForumsCountUpdateTimerEvent(), periodInSeconds * 1000);
        this.onUnreadForumsCountUpdateTimerEvent();
    }

    // AS3: .../groupforums/GroupForumController.as::openGroupForum()
    openGroupForum(groupId: number): void
    {
        if(!this._communicationManager)
        {
            return;
        }

        this.initForum(groupId);
        this.requestThreadList(groupId, 0);
    }

    // AS3: .../groupforums/GroupForumController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'groupforum/';
    }

    /**
     * Three shapes, all reached from a link:
     *
     * - `groupforum/list/{active|popular|my}` — one of the three hotel-wide lists.
     * - `groupforum/{groupId}` — that group's threads.
     * - `groupforum/{groupId}/{threadId}[/{messageIndex}]` — straight to a post.
     *
     * The last one clears `_forumsListData` first, on purpose: arriving by deep link means there is
     * no list behind this window, so the view's back button has to fall through to closing it.
     */
    // AS3: .../groupforums/GroupForumController.as::linkReceived()
    linkReceived(link: string): void
    {
        if(!this._communicationManager)
        {
            return;
        }

        const parts = link.split('/');

        if(parts.length < 2)
        {
            return;
        }

        if(parts[1] === 'list')
        {
            if(parts.length === 3)
            {
                // AS3 initialises this to 0 and lets `active` fall through to the same value; every
                // path here either assigns or returns, so the initialiser is dropped rather than
                // written and immediately overwritten.
                let listCode: number;

                switch(parts[2])
                {
                    case 'active':
                        listCode = GroupForumController.FORUMS_LIST_CODE_ACTIVE;
                        break;
                    case 'popular':
                        listCode = GroupForumController.FORUMS_LIST_CODE_POPULAR;
                        break;
                    case 'my':
                        listCode = GroupForumController.FORUMS_LIST_CODE_MY_FORUMS;
                        break;
                    default:
                        return;
                }

                this.openForumsList(listCode);
            }
        }
        else
        {
            const groupId = parseInt(parts[1], 10) || 0;

            if(groupId === 0)
            {
                return;
            }

            this._forumsListData = null;

            if(parts.length === 2)
            {
                this.openGroupForum(groupId);
            }
            else
            {
                const threadId = parseInt(parts[2], 10) || 0;
                let messageIndex = 0;

                if(parts.length > 3)
                {
                    messageIndex = parseInt(parts[3], 10) || 0;
                }

                this.initForum(groupId);
                this.send(new GetThreadMessageComposer(groupId, threadId));
                this.goToMessageIndex(groupId, threadId, messageIndex);
            }
        }
    }

    // AS3: .../groupforums/GroupForumController.as::openForumsList()
    openForumsList(listCode: number, startIndex: number = 0): void
    {
        this.markForumAsRead();
        this._requestedForumsListCode = listCode;
        this._requestedGroupId = -1;
        this.send(new GetForumsListMessageComposer(listCode, startIndex, ThreadsListData.PAGE_SIZE));
    }

    /**
     * The unread-count poll asks for the "my forums" list too, so this runs for pages nobody asked
     * to see. Everything before the `_requestedForumsListCode` check is what has to happen either
     * way — folding in the open forum's read marker and refreshing the badge — and the early
     * return is what stops the poll's page from being displayed.
     */
    // AS3: .../groupforums/GroupForumController.as::onForumsList()
    private onForumsList(event: IMessageEvent): void
    {
        const parser = event.parser as ForumsListMessageParser;
        const data = new ForumsListData(parser);

        if(this._forum !== null && this._lastReadMessageId > 0)
        {
            data.updateUnreadMessages(this._forum, this._lastReadMessageId);
        }

        if(data.listCode === GroupForumController.FORUMS_LIST_CODE_MY_FORUMS)
        {
            this.updateUnreadForumsCount(data.unreadForumsCount);
        }

        if(this._requestedForumsListCode !== data.listCode)
        {
            return;
        }

        this._forumsListData = data;

        if(!this._view)
        {
            this._view = new GroupForumView(this);
        }

        this._view.openForumsList(this._forumsListData);
    }

    // AS3: .../groupforums/GroupForumController.as::initForum()
    private initForum(groupId: number): void
    {
        this.markForumAsRead();
        this._requestedForumsListCode = -1;
        this._requestedGroupId = groupId;
        this._lastReadMessageId = 0;
        this.send(new GetForumStatsMessageComposer(groupId));
    }

    /**
     * The permission gate for the whole forum. A user who cannot read is not shown an empty
     * window: the view is disposed, the forum forgotten, and the *specific* reason the server gave
     * (`readPermissionError`) is substituted into the notification.
     */
    // AS3: .../groupforums/GroupForumController.as::onForumData()
    private onForumData(event: IMessageEvent): void
    {
        const forum = (event.parser as ForumDataMessageParser).forumData;

        if(forum === null || this._requestedGroupId !== forum.groupId)
        {
            return;
        }

        if(!forum.canRead)
        {
            if(this._view !== null)
            {
                this._view.dispose();
            }

            this._forum = null;
            this._requestedGroupId = 0;

            const parameters = new Map<string, string>();
            const operation = this.localizationManager?.getLocalization('groupforum.view.error.operation_read') ?? '';

            parameters.set(
                'message',
                this.localizationManager?.getLocalizationWithParams(
                    'groupforum.view.error.' + forum.readPermissionError,
                    '',
                    'operation',
                    operation
                ) ?? ''
            );

            this.notifications?.showNotification('forums.error.access_denied', parameters);

            return;
        }

        this._forum = forum;
        this._lastReadMessageId = forum.lastReadMessageId;
    }

    // AS3: .../groupforums/GroupForumController.as::requestThreadList()
    requestThreadList(groupId: number, startIndex: number): void
    {
        if(this._communicationManager)
        {
            this.send(new GetThreadsMessageComposer(groupId, startIndex, ThreadsListData.PAGE_SIZE));
        }
    }

    /**
     * The thread count comes from `_forum`, not from this message — the page carries only the
     * threads it holds, so paging would collapse to one page if it were taken from here.
     */
    // AS3: .../groupforums/GroupForumController.as::onThreadList()
    private onThreadList(event: IMessageEvent): void
    {
        const parser = event.parser as ForumThreadsMessageParser;

        if(this._forum === null || this._forum.groupId !== parser.groupId)
        {
            return;
        }

        this._threadsListData = new ThreadsListData(this._forum.totalThreads, parser.startIndex, parser.threads);

        if(!this._view)
        {
            this._view = new GroupForumView(this);
        }

        this._view.openThreadList(this._forumsListData, this._forum, this._threadsListData);
    }

    // AS3: .../groupforums/GroupForumController.as::requestThreadMessageList()
    requestThreadMessageList(groupId: number, threadId: number, startIndex: number): void
    {
        if(this._communicationManager)
        {
            this.send(new GetMessagesMessageComposer(groupId, threadId, startIndex, ThreadsListData.PAGE_SIZE));
        }
    }

    /**
     * Opening a page of posts is also what marks them read: the last post on the page is handed to
     * `updateUnreadMessageCounts()`, which is the only thing that ever moves the read marker
     * forward.
     */
    // AS3: .../groupforums/GroupForumController.as::onThreadMessageList()
    private onThreadMessageList(event: IMessageEvent): void
    {
        const parser = event.parser as ThreadMessagesMessageParser;

        if(this._forum === null || this._forum.groupId !== parser.groupId || this._threadsListData === null)
        {
            return;
        }

        this._currentThreadId = parser.threadId;

        const thread = this._threadsListData.threadsById.get(this._currentThreadId) ?? null;

        if(thread === null)
        {
            return;
        }

        const startIndex = parser.startIndex;
        const totalMessages = thread.nMessages;

        this._messagesListData = new MessagesListData(this._currentThreadId, totalMessages, startIndex, parser.messages);

        if(!this._view)
        {
            this._view = new GroupForumView(this);
        }

        this._view.openMessagesList(this._forumsListData, this._forum, this._threadsListData, this._messagesListData);

        if(parser.messages.length > 0)
        {
            const last = parser.messages[parser.messages.length - 1];

            if(last)
            {
                this.updateUnreadMessageCounts(last.messageId, last.threadId, last.messageIndex);
            }
        }
    }

    // AS3: .../groupforums/GroupForumController.as::updateForumSettings()
    updateForumSettings(groupId: number, readPermissions: number, postMessagePermissions: number, postThreadPermissions: number, moderatePermissions: number): void
    {
        if(this._communicationManager)
        {
            this.send(new UpdateForumSettingsMessageComposer(groupId, readPermissions, postMessagePermissions, postThreadPermissions, moderatePermissions));
        }
    }

    /**
     * A new thread and a reply are the same message on the wire; a thread carries a subject and
     * `threadId` 0, a reply carries `threadId` and an empty subject.
     */
    // AS3: .../groupforums/GroupForumController.as::postNewThread()
    postNewThread(groupId: number, subject: string, message: string): void
    {
        if(this._communicationManager)
        {
            this.send(new PostMessageMessageComposer(groupId, 0, subject, message));
            this._lastPostTime = GroupForumController.getTimer();
        }
    }

    /**
     * The reply lands, the compose window closes, and the thread list is re-requested rather than
     * patched: the new thread changes the ordering of every page, not just this one.
     */
    // AS3: .../groupforums/GroupForumController.as::onPostThreadMessage()
    private onPostThreadMessage(event: IMessageEvent): void
    {
        const parser = event.parser as PostThreadMessageParser;
        const thread = parser.thread;

        if(this._composeMessageView)
        {
            this._composeMessageView.dispose();
        }

        if(thread !== null && this._forum !== null && this._forum.groupId === parser.groupId)
        {
            this.updateUnreadMessageCounts(thread.lastMessageId, thread.threadId, thread.nMessages - 1);
        }

        if(this._forumsListData !== null && thread !== null)
        {
            const forum: ForumData | null = this._forumsListData.getForumData(parser.groupId);

            if(forum !== null)
            {
                forum.addNewThread(thread);
            }
        }

        if(this._view === null)
        {
            return;
        }

        if(this._forum === null || parser.groupId !== this._forum.groupId)
        {
            return;
        }

        this.requestThreadList(this._forum.groupId, 0);
    }

    // AS3: .../groupforums/GroupForumController.as::postNewMessage()
    postNewMessage(groupId: number, threadId: number, message: string): void
    {
        if(this._communicationManager)
        {
            this.send(new PostMessageMessageComposer(groupId, threadId, '', message));
            this._lastPostTime = GroupForumController.getTimer();
        }
    }

    /**
     * Jumps to the page the new post landed on rather than staying put — the reply is usually at
     * the end of the thread, which is often not the page that was open.
     */
    // AS3: .../groupforums/GroupForumController.as::onPostMessageMessage()
    private onPostMessageMessage(event: IMessageEvent): void
    {
        if(this._composeMessageView)
        {
            this._composeMessageView.dispose();
        }

        if(this._view === null)
        {
            return;
        }

        const parser = event.parser as PostMessageMessageParser;
        const message = parser.message;

        if(message === null || this._forum === null || parser.groupId !== this._forum.groupId || parser.threadId !== this._currentThreadId)
        {
            return;
        }

        const pageStart = message.messageIndex - (message.messageIndex % ThreadsListData.PAGE_SIZE);

        this.requestThreadMessageList(this._forum.groupId, this._currentThreadId, pageStart);
    }

    /**
     * Which state is sent depends on who is asking, and the default is neither: a caller with no
     * moderation rights at all sends `DEFAULT_STATE`, leaving the server to reject it.
     */
    // AS3: .../groupforums/GroupForumController.as::deleteThread()
    deleteThread(forum: ForumPermissions, threadId: number): void
    {
        if(this._communicationManager)
        {
            let state = ForumModerationState.DEFAULT_STATE;

            if(forum.canModerate)
            {
                state = ForumModerationState.HIDDEN_BY_ADMIN;
            }

            if(forum.isStaff)
            {
                state = ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD;
            }

            this.send(new ModerateThreadMessageComposer(forum.groupId, threadId, state));
        }
    }

    // AS3: .../groupforums/GroupForumController.as::unDeleteThread()
    unDeleteThread(forum: ForumData, threadId: number): void
    {
        if(this._communicationManager)
        {
            this.send(new ModerateThreadMessageComposer(forum.groupId, threadId, ForumModerationState.RESTORED_BY_ADMIN));
        }
    }

    /**
     * `lockThread` and `stickThread` send the identical message — one composer carries both flags,
     * so which one is being changed is decided by the caller, not here. `ThreadListItemView`
     * inverts exactly one of the two arguments in each case.
     */
    // AS3: .../groupforums/GroupForumController.as::lockThread()
    lockThread(forum: ForumData, threadId: number, isLocked: boolean, isSticky: boolean): void
    {
        if(this._communicationManager)
        {
            this.send(new UpdateThreadMessageComposer(forum.groupId, threadId, isLocked, isSticky));
        }
    }

    // AS3: .../groupforums/GroupForumController.as::stickThread()
    stickThread(forum: ForumData, threadId: number, isLocked: boolean, isSticky: boolean): void
    {
        if(this._communicationManager)
        {
            this.send(new UpdateThreadMessageComposer(forum.groupId, threadId, isLocked, isSticky));
        }
    }

    // AS3: .../groupforums/GroupForumController.as::reportThread()
    reportThread(forum: ForumData, threadId: number): void
    {
        if(this._help)
        {
            this._help.reportThread(forum.groupId, threadId);
        }
    }

    /**
     * A thread whose update arrives for a page that is no longer loaded does not update nothing —
     * AS3 replaces the whole page model with a one-thread page. That is what lets a thread reached
     * by deep link still be moderated: the id lookup in `onThreadMessageList` finds it.
     */
    // AS3: .../groupforums/GroupForumController.as::onUpdateThread()
    private onUpdateThread(event: IMessageEvent): void
    {
        const parser = event.parser as UpdateThreadMessageParser;

        if(this._forum === null || this._forum.groupId !== parser.groupId)
        {
            return;
        }

        const thread = parser.thread;

        if(thread === null)
        {
            return;
        }

        if(this._threadsListData && this._view)
        {
            if(this._threadsListData.updateThread(thread))
            {
                this._view.updateThread(thread);

                return;
            }
        }

        this._threadsListData = new ThreadsListData(1, 0, [thread]);
    }

    /**
     * The group id comes from `_forum`, not from the `forum` argument — AS3's own inconsistency,
     * and the reason this cannot be called for a forum other than the open one. `unDeleteMessage()`
     * right below uses the argument, as `deleteThread()` does.
     */
    // AS3: .../groupforums/GroupForumController.as::deleteMessage()
    deleteMessage(forum: ForumPermissions, threadId: number, messageId: number): void
    {
        if(this._communicationManager && this._forum)
        {
            let state = ForumModerationState.HIDDEN_BY_ADMIN;

            if(forum.isStaff)
            {
                state = ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD;
            }

            this.send(new ModerateMessageMessageComposer(this._forum.groupId, threadId, messageId, state));
        }
    }

    // AS3: .../groupforums/GroupForumController.as::unDeleteMessage()
    unDeleteMessage(forum: ForumData, threadId: number, messageId: number): void
    {
        if(this._communicationManager)
        {
            this.send(new ModerateMessageMessageComposer(forum.groupId, threadId, messageId, ForumModerationState.RESTORED_BY_ADMIN));
        }
    }

    // AS3: .../groupforums/GroupForumController.as::reportMessage()
    reportMessage(forum: ForumData, threadId: number, messageId: number): void
    {
        if(this._help)
        {
            this._help.reportMessage(forum.groupId, threadId, messageId);
        }
    }

    /**
     * Patches the post in place inside the open page. `MessagesListData` keeps an id index, but AS3
     * scans the array here anyway — it has to replace the element at its position, which the index
     * does not give it.
     */
    // AS3: .../groupforums/GroupForumController.as::onUpdateMessage()
    private onUpdateMessage(event: IMessageEvent): void
    {
        const parser = event.parser as UpdateMessageMessageParser;

        if(this._forum === null || this._forum.groupId !== parser.groupId || this._currentThreadId !== parser.threadId)
        {
            return;
        }

        const updated = parser.message;

        if(updated === null || this._messagesListData === null)
        {
            return;
        }

        const messages: ForumMessage[] = this._messagesListData.messages;

        for(let i = 0; i < messages.length; i++)
        {
            if(messages[i].messageId === updated.messageId)
            {
                messages[i] = updated;

                if(this._view)
                {
                    this._view.updateMessage(updated);
                }

                return;
            }
        }
    }

    /**
     * Deep-link entry point: remembers where to scroll to, then asks for the page that index falls
     * on. The remainder is kept because the request is page-aligned — the view reads it back
     * through `getGoToMessageIndex()` once the page arrives.
     */
    // AS3: .../groupforums/GroupForumController.as::goToMessageIndex()
    goToMessageIndex(groupId: number, threadId: number, messageIndex: number): void
    {
        this._goToThreadId = threadId;

        const page = Math.floor(messageIndex / ThreadsListData.PAGE_SIZE);

        this._goToMessageIndex = messageIndex % ThreadsListData.PAGE_SIZE;

        this.requestThreadMessageList(groupId, threadId, page * ThreadsListData.PAGE_SIZE);
    }

    // AS3: .../groupforums/GroupForumController.as::getUserInfo()
    getUserInfo(userId: number): void
    {
        if(this._communicationManager)
        {
            this.send(new GetExtendedProfileMessageComposer(userId));
        }
    }

    /**
     * Called by the view as it disposes itself. It drops the controller's own reference to the view
     * without disposing it back — the call is one-way, and `GroupForumView.dispose()` is what
     * initiates it.
     */
    // AS3: .../groupforums/GroupForumController.as::closeMainView()
    closeMainView(): void
    {
        this.markForumAsRead();
        this._view = null;
        this._forum = null;
        this._requestedForumsListCode = -1;
        this._requestedGroupId = -1;
    }

    /**
     * Flushes the read marker for the open forum, if it moved.
     *
     * `markAll` is the "mark read" button rather than ordinary navigation: it claims everything up
     * to `totalMessages` instead of the highest post actually seen, and sets the composer's third
     * field when nothing had been read at all.
     *
     * The two resets at the end run whether or not anything was sent, which is what makes this safe
     * to call on every navigation — including from `openForumsList()`, where there may be no forum.
     */
    // AS3: .../groupforums/GroupForumController.as::markForumAsRead()
    markForumAsRead(markAll: boolean = false): void
    {
        if(this._communicationManager && this._forum)
        {
            if(markAll || this._lastReadMessageId > this._forum.lastReadMessageId)
            {
                const composer = new UpdateForumReadMarkerMessageComposer();

                if(markAll)
                {
                    composer.add(
                        this._forum.groupId,
                        Math.max(this._forum.totalMessages, this._lastReadMessageId),
                        this._lastReadMessageId === 0
                    );
                }
                else
                {
                    composer.add(this._forum.groupId, this._lastReadMessageId, false);
                }

                this.send(composer);
            }
        }

        this._lastReadMessageId = 0;
        this._lastReadMessageIndexByThread = new Map();
    }

    /**
     * The forums-list "mark all read" button: one composer carrying every forum on the page that
     * has anything unread. Nothing is sent when the page is already clean, which is what the
     * `size > 0` guard is for.
     */
    // AS3: .../groupforums/GroupForumController.as::markForumsAsRead()
    markForumsAsRead(): void
    {
        if(this._communicationManager && this._forumsListData)
        {
            const composer = new UpdateForumReadMarkerMessageComposer();

            for(const forum of this._forumsListData.forums)
            {
                if(forum.unreadMessages > 0)
                {
                    composer.add(forum.groupId, forum.totalMessages, true);
                }
            }

            if(composer.size > 0)
            {
                this.send(composer);
                this.updateUnreadForumsCount(0);
            }
        }
    }

    /**
     * Where the thread list should show its "unread from here" divider. The per-visit map wins over
     * the server's own figure, so a thread read a moment ago does not jump back to its old divider.
     */
    // AS3: .../groupforums/GroupForumController.as::getThreadLastReadMessageIndex()
    getThreadLastReadMessageIndex(threadId: number): number
    {
        const remembered = this._lastReadMessageIndexByThread.get(threadId);

        if(remembered !== undefined)
        {
            return remembered;
        }

        if(this._threadsListData)
        {
            const thread = this._threadsListData.threadsById.get(threadId) ?? null;

            if(thread)
            {
                return thread.nMessages - thread.nUnreadMessages - 1;
            }
        }

        return -1;
    }

    /**
     * The only thing that moves the forum's read marker forward, and it only ever moves forward —
     * paging back through a thread does not un-read it.
     */
    // AS3: .../groupforums/GroupForumController.as::updateUnreadMessageCounts()
    updateUnreadMessageCounts(messageId: number, threadId: number, messageIndex: number): void
    {
        if(messageId > this._lastReadMessageId)
        {
            this._lastReadMessageId = messageId;

            if(this._forumsListData && this._forum)
            {
                this._forumsListData.updateUnreadMessages(this._forum, messageId);

                if(this._forumsListData.listCode === GroupForumController.FORUMS_LIST_CODE_MY_FORUMS)
                {
                    this.updateUnreadForumsCount(this._forumsListData.unreadForumsCount);
                }
            }
        }

        this._lastReadMessageIndexByThread.set(threadId, messageIndex);
    }

    // AS3: .../groupforums/GroupForumController.as::getGoToMessageIndex()
    getGoToMessageIndex(): number
    {
        return this._goToMessageIndex;
    }

    // AS3: .../groupforums/GroupForumController.as::getGoToThreadId()
    getGoToThreadId(): number
    {
        return this._goToThreadId;
    }

    // AS3: .../groupforums/GroupForumController.as::resetGoTo()
    resetGoTo(): void
    {
        this._goToThreadId = -1;
        this._goToMessageIndex = -1;
    }

    // AS3: .../groupforums/GroupForumController.as::updateUnreadForumsCount()
    updateUnreadForumsCount(count: number): void
    {
        if(this._unreadForumsCount === count)
        {
            return;
        }

        if(count > this._unreadForumsCount)
        {
            // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/
            // groupforums/GroupForumController.as::updateUnreadForumsCount() — the sound that
            // plays when the count goes up. The branch survives in the bytecode but its body does
            // not, and this is not one decompiler's mistake: win63_version, decompiled by a
            // different tool, emits the same empty `if(_soundManager != null){}`. `_soundManager`
            // has no other use in the class, so the missing call is the only reason it is injected.
            if(this._soundManager !== null)
            {
                // Intentionally empty — see above.
            }
        }

        this._unreadForumsCount = count;
        this.events.emit(
            UnseenForumsCountUpdatedEvent.TYPE,
            new UnseenForumsCountUpdatedEvent(UnseenForumsCountUpdatedEvent.TYPE, count)
        );

        if(this._view !== null)
        {
            this._view.updateUnreadForumsCount(count);
        }
    }

    // AS3: .../groupforums/GroupForumController.as::onUnreadForumsCountUpdateTimerEvent()
    private onUnreadForumsCountUpdateTimerEvent(): void
    {
        if(this._view !== null)
        {
            this.send(new GetForumsListMessageComposer(
                GroupForumController.FORUMS_LIST_CODE_MY_FORUMS,
                0,
                ThreadsListData.PAGE_SIZE
            ));
        }
        else
        {
            this.send(new GetUnreadForumsCountMessageComposer());
        }
    }

    // AS3: .../groupforums/GroupForumController.as::onUnreadForumsCountMessage()
    private onUnreadForumsCountMessage(event: IMessageEvent): void
    {
        this.updateUnreadForumsCount((event.parser as UnreadForumsCountMessageParser).unreadForumsCount);
    }

    // TS-only: stands in for `flash.utils.getTimer()`, matching HabboCatalog's own helper.
    private static getTimer(): number
    {
        if(typeof performance !== 'undefined')
        {
            return Math.floor(performance.now());
        }

        return Date.now();
    }

    // AS3: .../groupforums/GroupForumController.as::dispose()
    override dispose(): void
    {
        if(this._disposed) return;

        if(this._unreadForumsCountTimer !== null)
        {
            clearInterval(this._unreadForumsCountTimer);
            this._unreadForumsCountTimer = null;
        }

        // TS-only: the port's message events and link trackers are handed back explicitly, where
        // AS3 lets component disposal take them.
        for(const event of this._messageEvents)
        {
            this._communicationManager?.removeMessageEvent(event);
        }

        this._messageEvents.length = 0;
        this.context.removeLinkEventTracker(this);

        super.dispose();
    }
}
