import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IWindow} from '@core/window/IWindow';
import {Logger} from '@core/utils/Logger';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {isRoomViewerMode} from '@habbo/configuration/enum/HabboComponentFlags';
import type {IHabboFriendBar} from '@habbo/friendbar/IHabboFriendBar';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {
    ModeratorInitData
} from '@habbo/communication/messages/parser/moderation/ModeratorInitData';
import type {
    ICfhCategory
} from '@habbo/communication/messages/parser/help/CfhTopicsInitMessageParser';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboFriendBar} from '@iid/IIDHabboFriendBar';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboSoundManager} from '@iid/IIDHabboSoundManager';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_SessionDataManager} from '@iid/index';
import {IID_NewModerationTool} from '@iid/IIDNewModerationTool';

import type {IHabboModeration} from './IHabboModeration';
import {IssueCategoryNames} from './IssueCategoryNames';
import {IssueManager} from './IssueManager';
import {StartPanelCtrl} from './StartPanelCtrl';
import {ModerationMessageHandler} from './ModerationMessageHandler';
import {WindowTracker} from './WindowTracker';
import {NewModerationTool} from './NewModerationTool';

const log = Logger.getLogger('habbo.moderation.ModerationManager');

/**
 * ModerationManager — the mod tool's spine: it owns the issue manager, the message handler and the
 * window tracker, and is the single object every mod-tool window is handed a reference to.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/ModerationManager.as
 *
 * **It is built for every client, moderator or not.** `isModerator` (security rank 5) is what gates
 * the UI; the component itself always exists so the toolbar and the room can call into it. The one
 * exception is room-viewer mode, where `initComponent()` returns before building anything — a
 * viewer has no connection to moderate over.
 *
 * `getXmlWindow()` is how every window in this subsystem is built: a name, the `_xml` suffix the
 * asset keys carry, and a layer. It swallows failures exactly as AS3's bare `catch` does, so a
 * missing layout yields a null window rather than an exception halfway through a window's `show()`.
 */
export class ModerationManager extends Component implements IHabboModeration
{
    /** AS3's `getXmlWindow()` default: asset keys for layouts keep the `_xml` suffix. */
    // AS3: ModerationManager.as::getXmlWindow()
    private static readonly XML_ASSET_SUFFIX: string = '_xml';

    /** AS3's `getXmlWindow()` default layer. */
    // AS3: ModerationManager.as::getXmlWindow()
    private static readonly DEFAULT_WINDOW_LAYER: number = 1;

    /** AS3's `isModerator` tests security rank 5. */
    // AS3: ModerationManager.as::get isModerator()
    private static readonly MODERATOR_SECURITY_LEVEL: number = 5;

    // AS3: ModerationManager.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: ModerationManager.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: ModerationManager.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: ModerationManager.as::_navigator
    private _navigator: IHabboNavigator | null = null;

    // AS3: ModerationManager.as::_soundManager
    private _soundManager: IHabboSoundManager | null = null;

    // AS3: ModerationManager.as::_tracking
    private _tracking: IHabboTracking | null = null;

    /** Held as a dependency and never read, in AS3 too — see the `dependencies` note. */
    // AS3: ModerationManager.as::_friendBar
    private _friendBar: IHabboFriendBar | null = null;

    /** Derived name — `_SafeStr_9334`. */
    // AS3: ModerationManager.as::_SafeStr_9334
    private _messageHandler: ModerationMessageHandler | null = null;

    /** Derived name — `_SafeStr_6771`. */
    // AS3: ModerationManager.as::_SafeStr_6771
    private _issueManager: IssueManager | null = null;

    /** Derived name — `_SafeStr_6212`. */
    // AS3: ModerationManager.as::_SafeStr_6212
    private _startPanel: StartPanelCtrl | null = null;

    /** Derived name — `_SafeStr_8877`. */
    // AS3: ModerationManager.as::_SafeStr_8877
    private _windowTracker: WindowTracker | null = null;

    // AS3: ModerationManager.as::_initMsg
    private _initMsg: ModeratorInitData | null = null;

    /** Derived name — `_SafeStr_9439`: the room the moderator is currently looking at. */
    // AS3: ModerationManager.as::_SafeStr_9439
    private _currentFlatId: number = 0;

    /**
     * The *new* mod tool is attached here, from the constructor, exactly as AS3 does — it is a
     * sibling component with its own dependencies, not something this class drives. It shares this
     * component's asset library, which is where `new_moderation_tool_xml` lives.
     */
    // AS3: ModerationManager.as::ModerationManager()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);

        this._startPanel = new StartPanelCtrl(this);
        this._windowTracker = new WindowTracker();

        context.attachComponent(
            new NewModerationTool(context, flags, assetLibrary), [IID_NewModerationTool]
        );
    }

    /**
     * Eight dependencies, **all required** — AS3 passes no third argument and both its
     * `ComponentDependency` and this port's default that parameter to `true`.
     *
     * That is worth knowing before adding a ninth: a required dependency on an IID nothing provides
     * locks the component forever, with nothing logged. The friend bar is the one to watch — this
     * class stores it and never reads it, in AS3 too, so it is a hard gate paid for nothing.
     *
     * The localization dependency stores nothing at all: it feeds the static
     * `IssueCategoryNames.setLocalizationManager()`, which is where every CFH topic name resolves
     * from. (The previous port wired that setter to the *session* dependency and passed it `null`,
     * so every topic fell back to the English table.)
     */
    // AS3: ModerationManager.as::get dependencies()
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
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
                    this._communication = manager;
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
                IID_HabboNavigator,
                (manager: IHabboNavigator | null) =>
                {
                    this._navigator = manager;
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
                (manager: IHabboTracking | null) =>
                {
                    this._tracking = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    IssueCategoryNames.setLocalizationManager(manager);
                }
            ),
            new ComponentDependency(
                IID_HabboFriendBar,
                (manager: IHabboFriendBar | null) =>
                {
                    this._friendBar = manager;
                }
            ),
        ];
    }

    // AS3: ModerationManager.as::initComponent()
    protected override initComponent(): void
    {
        if(isRoomViewerMode(this.flags)) return;

        this._messageHandler = new ModerationMessageHandler(this);
        this._issueManager = new IssueManager(this);

        log.debug('ModerationManager initialized');
    }

    // AS3: ModerationManager.as::userSelected()
    userSelected(userId: number, userName: string): void
    {
        log.debug(`User selected: ${userId}, ${userName}`);

        this._startPanel?.userSelected(userId, userName);
    }

    /**
     * Builds one of the mod tool's windows from its layout.
     *
     * AS3 wraps the whole lookup in a bare `try`/`catch` that discards the error and returns an
     * undefined local — a missing or malformed layout yields null, never a throw. The port keeps
     * that: every caller here does `IFrameWindow(getXmlWindow(...))` without a null check, so a
     * throw would abort a window's `show()` halfway through instead.
     */
    // AS3: ModerationManager.as::getXmlWindow()
    getXmlWindow(
        name: string,
        suffix: string = ModerationManager.XML_ASSET_SUFFIX,
        layer: number = ModerationManager.DEFAULT_WINDOW_LAYER
    ): IWindow | null
    {
        try
        {
            const asset = this.assets?.getAssetByName(name + suffix) as XmlAsset | null;
            const layout = asset?.content ?? null;

            if(layout === null || this._windowManager === null) return null;

            return this._windowManager.buildFromXML(layout, layer);
        }
        catch
        {
            return null;
        }
    }

    /** `key` names a hotel property holding the tool's base URL; `suffix` is appended verbatim. */
    // AS3: ModerationManager.as::openHkPage()
    openHkPage(key: string, suffix: string): void
    {
        HabboWebTools.navigateToURL(this.getProperty(key) + suffix, 'housekeeping');
    }

    // AS3: ModerationManager.as::goToRoom()
    goToRoom(roomId: number): void
    {
        this._navigator?.goToPrivateRoom(roomId);
    }

    // AS3: ModerationManager.as::openThread()
    openThread(groupId: number, threadId: number): void
    {
        this.context?.createLinkEvent(`groupforum/${groupId}/${threadId}`);
    }

    // AS3: ModerationManager.as::openThreadMessage()
    openThreadMessage(groupId: number, threadId: number, messageId: number): void
    {
        this.context?.createLinkEvent(`groupforum/${groupId}/${threadId}/${messageId}`);
    }

    /** AS3 passes `label` as the tracking *action* and `action` as its label — order kept. */
    // AS3: ModerationManager.as::logEvent()
    logEvent(action: string, label: string): void
    {
        this._tracking?.trackEventLog('Moderation', label, action);
    }

    // AS3: ModerationManager.as::trackGoogle()
    trackGoogle(action: string, label: number = -1): void
    {
        this._tracking?.trackGoogle('moderationManager', action, label);
    }

    // AS3: ModerationManager.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: ModerationManager.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: ModerationManager.as::get issueManager()
    get issueManager(): IssueManager | null
    {
        return this._issueManager;
    }

    // AS3: ModerationManager.as::get connection()
    get connection(): IConnection | null
    {
        return this._communication?.connection ?? null;
    }

    // AS3: ModerationManager.as::get messageHandler()
    get messageHandler(): ModerationMessageHandler | null
    {
        return this._messageHandler;
    }

    // AS3: ModerationManager.as::get startPanel()
    get startPanel(): StartPanelCtrl | null
    {
        return this._startPanel;
    }

    // AS3: ModerationManager.as::get windowTracker()
    get windowTracker(): WindowTracker | null
    {
        return this._windowTracker;
    }

    // AS3: ModerationManager.as::get soundManager()
    get soundManager(): IHabboSoundManager | null
    {
        return this._soundManager;
    }

    // AS3: ModerationManager.as::get initMsg()
    get initMsg(): ModeratorInitData | null
    {
        return this._initMsg;
    }

    // AS3: ModerationManager.as::set initMsg()
    set initMsg(value: ModeratorInitData | null)
    {
        this._initMsg = value;
    }

    // AS3: ModerationManager.as::get currentFlatId()
    get currentFlatId(): number
    {
        return this._currentFlatId;
    }

    // AS3: ModerationManager.as::set currentFlatId()
    set currentFlatId(value: number)
    {
        this._currentFlatId = value;
    }

    // AS3: ModerationManager.as::get isModerator()
    get isModerator(): boolean
    {
        return this._sessionDataManager?.hasSecurity(ModerationManager.MODERATOR_SECURITY_LEVEL) ?? false;
    }

    // AS3: ModerationManager.as::set cfhTopics()
    set cfhTopics(topics: ICfhCategory[])
    {
        this._issueManager?.setCfhTopics(topics);
    }

    /**
     * AS3 disposes only `StartPanelCtrl` here and lets the component base take the rest; the port
     * also disposes the message handler and issue manager it built in `initComponent()`, since
     * nothing else owns them.
     */
    // AS3: ModerationManager.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._messageHandler !== null)
        {
            this._messageHandler.dispose();
            this._messageHandler = null;
        }

        if(this._issueManager !== null)
        {
            this._issueManager.dispose();
            this._issueManager = null;
        }

        if(this._startPanel !== null)
        {
            this._startPanel.dispose();
            this._startPanel = null;
        }

        this._windowTracker = null;
        this._initMsg = null;

        log.debug('ModerationManager disposed');

        super.dispose();
    }
}
