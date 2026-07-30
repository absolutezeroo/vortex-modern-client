import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import {Logger} from '@core/utils/Logger';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IFriend} from '@habbo/friendlist/IFriend';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IHabboHelp} from '@habbo/help/IHabboHelp';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboFriendList} from '@iid/IIDHabboFriendList';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';

import {MessengerInitEvent} from '@habbo/communication/messages/incoming/friendlist/MessengerInitEvent';
import {NewConsoleMessageEvent} from '@habbo/communication/messages/incoming/friendlist/NewConsoleMessageEvent';
import {
    ConsoleMessageHistoryEvent
} from '@habbo/communication/messages/incoming/friendlist/ConsoleMessageHistoryEvent';
import {InstantMessageErrorEvent} from '@habbo/communication/messages/incoming/friendlist/InstantMessageErrorEvent';
import {RoomInviteEvent} from '@habbo/communication/messages/incoming/friendlist/RoomInviteEvent';

import type {IHabboMessenger} from './IHabboMessenger';
import type {ChatEntry} from './ChatEntry';
import {DummyFriend} from './DummyFriend';
import {ActiveConversationEvent} from './events/ActiveConversationEvent';

const log = Logger.getLogger('habbo.messenger.HabboMessenger');

/**
 * HabboMessenger
 *
 * The messenger component: owns the console window (`MainView`), routes every chat
 * message to it, and is what the friend list and friend bar reach for when they need to
 * open a conversation or report a presence change.
 *
 * Almost every method here is a guarded delegation to the view, and the guard is AS3's
 * own: the view is not built in the constructor but on `MessengerInit`, so everything
 * before that has to survive a null view. That is what lets this component exist and be
 * useful before `MainView` is ported — `IID_HabboMessenger` resolves, and callers get
 * the real no-op AS3 gives them rather than a crash.
 *
 * TODO(AS3): `MainView` (1,237 lines) and `habbicons/` are not ported yet, so the
 * console window never opens and `isOpen()` stays false. Everything that routes *into*
 * the view is wired and traced, so porting MainView is the only remaining step.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/HabboMessenger.as
 */
export class HabboMessenger extends Component implements IHabboMessenger, ILinkEventTracker
{
    // AS3: .../messenger/HabboMessenger.as::HabboMessenger()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    // AS3: .../messenger/HabboMessenger.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: .../messenger/HabboMessenger.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: .../messenger/HabboMessenger.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: .../messenger/HabboMessenger.as::_localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: .../messenger/HabboMessenger.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._localization;
    }

    // AS3: .../messenger/HabboMessenger.as::_friendList
    private _friendList: IHabboFriendList | null = null;

    // AS3: .../messenger/HabboMessenger.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: .../messenger/HabboMessenger.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: .../messenger/HabboMessenger.as::_tracking
    private _tracking: IHabboTracking | null = null;

    // AS3: .../messenger/HabboMessenger.as::_help
    private _help: IHabboHelp | null = null;

    /**
     * TODO(AS3): `_soundManager` is an `IIDHabboSoundManager` dependency in AS3.
     * `habbo/sound` is 0/29 in this port and nothing is attached against that IID, so
     * the two sound calls below are no-ops.
     */
    // AS3: .../messenger/HabboMessenger.as::_soundManager
    private _soundManager: {playSound(name: string): void} | null = null;

    /**
     * TODO(AS3): `_habbiconController` is an `IIDHabbiconController` dependency —
     * optional in AS3 too. `habbo/catalog/habbicons` is unported and this port has no
     * such IID at all, so the field stays null and the habbicon picker is unavailable.
     */
    // AS3: .../messenger/HabboMessenger.as::get habbiconController()
    get habbiconController(): unknown | null
    {
        return null;
    }

    /**
     * The console window. Built on `MessengerInit`, not in the constructor — every
     * delegation below guards on it because AS3 does.
     *
     * TODO(AS3): typed `MainView` in AS3; that class is unported, so this stays null.
     */
    // AS3: .../messenger/HabboMessenger.as::_SafeStr_4684
    private _mainView: null = null;

    // AS3: .../messenger/HabboMessenger.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: .../messenger/HabboMessenger.as::_SafeStr_6201
    private _unseenMiniMailMessageCount: number = 0;

    // AS3: .../messenger/HabboMessenger.as::_SafeStr_8249
    private _roomInvitesIgnored: boolean = false;

    // AS3: .../messenger/HabboMessenger.as::_followingToGroupRoom
    private _followingToGroupRoom: boolean = false;

    /**
     * Sound, help and the habbicon controller are optional here where AS3 has the first
     * two required: nothing in this port is attached against their IIDs, and a required
     * dependency that never resolves would leave this component locked forever — which
     * is exactly the hole that kept the friend bar from ever building.
     */
    // AS3: .../messenger/HabboMessenger.as::get dependencies()
    protected override get dependencies(): Array<ComponentDependency<unknown>>
    {
        return [
            new ComponentDependency(IID_HabboWindowManager, (windowManager: IHabboWindowManager | null) =>
            {
                this._windowManager = windowManager;
            }, true),
            new ComponentDependency(IID_HabboCommunicationManager, (communication: IHabboCommunicationManager | null) =>
            {
                this._communication = communication;
            }, true),
            new ComponentDependency(IID_HabboLocalizationManager, (localization: IHabboLocalizationManager | null) =>
            {
                this._localization = localization;
            }, true),
            new ComponentDependency(IID_HabboFriendList, (friendList: IHabboFriendList | null) =>
            {
                this._friendList = friendList;
            }, true),
            new ComponentDependency(IID_SessionDataManager, (sessionDataManager: ISessionDataManager | null) =>
            {
                this._sessionDataManager = sessionDataManager;
            }, true),
            new ComponentDependency(IID_HabboTracking, (tracking: IHabboTracking | null) =>
            {
                this._tracking = tracking;
            }, true),
            new ComponentDependency(IID_HabboHelp, (help: IHabboHelp | null) =>
            {
                this._help = help;
            }, false)
        ] as Array<ComponentDependency<unknown>>;
    }

    // AS3: .../messenger/HabboMessenger.as::initComponent()
    protected override initComponent(): void
    {
        this.addMessageEvent(new MessengerInitEvent(this.onMessengerInit.bind(this)));

        // TODO(AS3): AS3 also registers AccountPreferences (roomInvitesIgnored) and
        // HabboGroupDetails (the follow-to-group-room hop) here, plus the two MiniMail
        // events behind `client.minimail.embed.enabled`. Those five incoming events are
        // not in this port's friendlist/users message set yet, so the corresponding
        // handlers below are reachable only from their own callers.
        this.context.addLinkEventTracker(this);
    }

    // AS3: .../messenger/HabboMessenger.as::onMessengerInit()
    private onMessengerInit(_event: IMessageEvent): void
    {
        // AS3 builds MainView here, then registers the four conversation events. The
        // events are registered regardless so the wiring is real once MainView lands;
        // each handler no-ops on the null view exactly as AS3's would.
        this.addMessageEvent(new NewConsoleMessageEvent(this.onNewConsoleMessage.bind(this)));
        this.addMessageEvent(new ConsoleMessageHistoryEvent(this.onConsoleHistory.bind(this)));
        this.addMessageEvent(new InstantMessageErrorEvent(this.onInstantMessageError.bind(this)));
        this.addMessageEvent(new RoomInviteEvent(this.onRoomInvite.bind(this)));

        log.debug('Messenger initialised');
    }

    // AS3: .../messenger/HabboMessenger.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communication?.connection?.send(composer);
    }

    // AS3: .../messenger/HabboMessenger.as::isOpen()
    isOpen(): boolean
    {
        return this._mainView !== null;
    }

    // AS3: .../messenger/HabboMessenger.as::toggleMessenger()
    toggleMessenger(): void
    {
        if(this._mainView !== null)
        {
            // AS3: _mainView.toggle();
        }
    }

    // AS3: .../messenger/HabboMessenger.as::hideTransientSelectors()
    hideTransientSelectors(): void
    {
        if(this._mainView !== null)
        {
            // AS3: _mainView.hideTransientSelectors();
        }
    }

    // AS3: .../messenger/HabboMessenger.as::startConversation()
    startConversation(_userId: number): void
    {
        if(this._mainView !== null)
        {
            // AS3: _mainView.startConversation(userId); _mainView.show(true);
        }
    }

    /**
     * Unlike its siblings this one is *not* guarded in AS3 — it dereferences the view
     * straight away, so it throws if anything closes a conversation before
     * `MessengerInit`. Guarded here, because the view is null for the whole session
     * until MainView is ported and `FriendCategories` calls this on every friend
     * removal.
     */
    // AS3: .../messenger/HabboMessenger.as::closeConversation()
    closeConversation(_userId: number): void
    {
        if(this._mainView !== null)
        {
            // AS3: _mainView.hideConversation(userId);
        }
    }

    // AS3: .../messenger/HabboMessenger.as::setFollowingAllowed()
    setFollowingAllowed(_userId: number, _allowed: boolean): void
    {
        if(this._mainView !== null)
        {
            // AS3: _mainView.setFollowingAllowed(userId, allowed);
        }
    }

    // AS3: .../messenger/HabboMessenger.as::setOnlineStatus()
    setOnlineStatus(_userId: number, _online: boolean): void
    {
        if(this._mainView !== null)
        {
            // AS3: _mainView.setOnlineStatus(userId, online);
        }
    }

    // AS3: .../messenger/HabboMessenger.as::getUnseenMiniMailMessageCount()
    getUnseenMiniMailMessageCount(): number
    {
        return this._unseenMiniMailMessageCount;
    }

    // AS3: .../messenger/HabboMessenger.as::getRoomInvitesIgnored()
    getRoomInvitesIgnored(): boolean
    {
        return this._roomInvitesIgnored;
    }

    // AS3: .../messenger/HabboMessenger.as::setRoomInvitesIgnored()
    setRoomInvitesIgnored(ignored: boolean): void
    {
        this._roomInvitesIgnored = ignored;
    }

    // AS3: .../messenger/HabboMessenger.as::set followingToGroupRoom()
    set followingToGroupRoom(value: boolean)
    {
        this._followingToGroupRoom = value;
    }

    // AS3: .../messenger/HabboMessenger.as::getText()
    getText(key: string): string
    {
        return this._localization?.getLocalization(key, key) ?? key;
    }

    // AS3: .../messenger/HabboMessenger.as::getXmlWindow()
    getXmlWindow(name: string): IWindow | null
    {
        return this._windowManager?.buildWidgetLayout(`${name}_xml`) ?? null;
    }

    // AS3: .../messenger/HabboMessenger.as::trackGoogle()
    trackGoogle(pageId: string, action: string, value: number = -1): void
    {
        this._tracking?.trackGoogle(pageId, action, value);
    }

    /**
     * The friend behind a conversation. Falls back to a `DummyFriend` built from the
     * chat entry when the sender is not on the friend list — staff, or a chat opened
     * from a profile.
     */
    // AS3: .../messenger/HabboMessenger.as::getFriend()
    getFriend(userId: number, chatEntry: ChatEntry | null = null): IFriend | null
    {
        const friend = this._friendList?.getFriendById(userId) ?? null;

        if(friend === null && chatEntry !== null)
        {
            return new DummyFriend(chatEntry.senderId, chatEntry.senderName, chatEntry.senderFigure);
        }

        return friend;
    }

    // AS3: .../messenger/HabboMessenger.as::reportUser()
    reportUser(userId: number): void
    {
        this._help?.reportUserFromIM(userId);
    }

    // AS3: .../messenger/HabboMessenger.as::conversationCountUpdated()
    conversationCountUpdated(count: number, hasUnread: boolean): void
    {
        this.events.emit(
            ActiveConversationEvent.ACTIVE_CONVERSATION_COUNT_CHANGED,
            new ActiveConversationEvent(ActiveConversationEvent.ACTIVE_CONVERSATION_COUNT_CHANGED, count, hasUnread)
        );
    }

    // AS3: .../messenger/HabboMessenger.as::playSendSound()
    playSendSound(): void
    {
        this._soundManager?.playSound('HBST_message_sent');
    }

    // AS3: .../messenger/HabboMessenger.as::playMessageReceivedSound()
    private playMessageReceivedSound(): void
    {
        this._soundManager?.playSound('HBST_message_received');
    }

    // AS3: .../messenger/HabboMessenger.as::onNewConsoleMessage()
    private onNewConsoleMessage(_event: IMessageEvent): void
    {
        if(this._mainView === null)
        {
            return;
        }

        // AS3: _mainView.addConsoleMessage(...); if(!isOpen) playMessageReceivedSound();
    }

    // AS3: .../messenger/HabboMessenger.as::onConsoleHistory()
    private onConsoleHistory(_event: IMessageEvent): void
    {
        if(this._mainView === null)
        {
            return;
        }

        // AS3: _mainView.loadMessageHistory(chatId, historyFragment);
    }

    // AS3: .../messenger/HabboMessenger.as::onRoomInvite()
    private onRoomInvite(_event: IMessageEvent): void
    {
        if(this._mainView === null)
        {
            return;
        }

        // AS3: _mainView.addRoomInvite(senderId, text); if(!isOpen) playMessageReceivedSound();
    }

    // AS3: .../messenger/HabboMessenger.as::onInstantMessageError()
    private onInstantMessageError(_event: IMessageEvent): void
    {
        if(this._mainView === null)
        {
            return;
        }

        // AS3: _mainView.onInstantMessageError(userId, errorCode, message);
    }

    // AS3: .../messenger/HabboMessenger.as::get linkPattern()
    get linkPattern(): string
    {
        return 'messenger/';
    }

    // AS3: .../messenger/HabboMessenger.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2)
        {
            return;
        }

        this.startConversation(parseInt(parts[1]!, 10));
    }

    // AS3: .../messenger/HabboMessenger.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        if(this._communication === null)
        {
            return;
        }

        this._communication.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    // AS3: .../messenger/HabboMessenger.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this._communication !== null)
        {
            for(const event of this._messageEvents)
            {
                this._communication.removeMessageEvent(event);
            }
        }

        this._messageEvents = [];
        this.context.removeLinkEventTracker(this);

        super.dispose();
    }
}
