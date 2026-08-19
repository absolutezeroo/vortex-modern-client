/**
 * IssueHandler — the window a moderator actually works a report in: the bundle's reports, their
 * messages, both users' cards, the evidence chatlog, and the four ways to close it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/IssueHandler.as
 *
 * **It hosts two `UserInfoCtrl` panels rather than opening two windows** — the reporter's on the
 * left, the reported user's on the right — and one embedded `ChatlogCtrl` painting into the
 * layout's own evidence list. A bundle with no reported user has that whole column *removed from
 * the list*, caption included, rather than left blank.
 *
 * **The window's own geometry is a server-side preference.** It registers an update receiver and,
 * once the moderator has left it alone for five seconds, sends its position and size back so the
 * next issue opens where the last one was. The two list panes split the remaining height evenly
 * whenever the window is moved or resized.
 *
 * Clicking a report in the list re-points the caller card *and* the chatlog at that report, without
 * rebuilding the window.
 *
 * Two topic ids drive special behaviour: `27` (useless reports) disables the topic drop-down
 * entirely, and `28` (auto-triggered) makes the sanction button refuse until a topic is chosen.
 */
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {
    GetCfhChatlogMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/GetCfhChatlogMessageComposer';
import {
    ModToolPreferencesComposer
} from '@habbo/communication/messages/outgoing/moderation/ModToolPreferencesComposer';
import type {
    ICfhCategory
} from '@habbo/communication/messages/parser/help/CfhTopicsInitMessageParser';
import type {IssueInfoData} from '@habbo/communication/messages/parser/moderation/IssueInfoData';
import {ChatlogCtrl} from './ChatlogCtrl';
import type {IIssueHandler} from './IIssueHandler';
import type {IssueBundle} from './IssueBundle';
import {IssueCategoryNames} from './IssueCategoryNames';
import type {ITrackedWindow} from './ITrackedWindow';
import type {ModerationManager} from './ModerationManager';
import {UserInfoCtrl} from './UserInfoCtrl';
import {WindowTracker} from './WindowTracker';

const log = Logger.getLogger('habbo.moderation.IssueHandler');

export class IssueHandler implements ITrackedWindow, IIssueHandler, IUpdateReceiver
{
    /** Reports filed as "useless" cannot be re-categorised — the drop-down is disabled outright. */
    // AS3: IssueHandler.as::USELESS_REPORTS_TOPIC_ID
    private static readonly USELESS_REPORTS_TOPIC_ID: number = 27;

    /** An auto-triggered report arrives with no real topic, so one must be picked before closing. */
    // AS3: IssueHandler.as::AUTO_TOPIC_ID
    private static readonly AUTO_TOPIC_ID: number = 28;

    /** Derived name — `_SafeStr_10609`: the topic the auto-triggered case pre-selects. */
    // AS3: IssueHandler.as::_SafeStr_10609
    private static readonly AUTO_DEFAULT_TOPIC_ID: number = 1;

    // AS3: IssueHandler.as::AUTO_TRIGGERED_CATEGORY_ID
    private static readonly AUTO_TRIGGERED_CATEGORY_ID: number = 3;

    /** AS3's resolutions for the two plain close buttons. */
    // AS3: IssueHandler.as::onCloseUseless()
    private static readonly RESOLUTION_USELESS: number = 1;

    // AS3: IssueHandler.as::onCloseResolved()
    private static readonly RESOLUTION_RESOLVED: number = 3;

    /** Geometry is only sent back after this much quiet — see the class note. */
    // AS3: IssueHandler.as::update()
    private static readonly PREFERENCES_QUIET_MS: number = 5000;

    /** AS3 registers the update receiver at this priority. */
    // AS3: IssueHandler.as::show()
    private static readonly UPDATE_PRIORITY: number = 1000;

    /** The highest-priority report is bolded, but only when the bundle holds more than one. */
    // AS3: IssueHandler.as::updateIssueList()
    private static readonly FONT_BOLD: string = 'Volter Bold';

    // AS3: IssueHandler.as::updateIssueList()
    private static readonly FONT_NORMAL: string = 'Volter';

    // AS3: IssueHandler.as::_moderationManager
    private _moderationManager: ModerationManager | null;

    /** Derived name — `_SafeStr_4688`. */
    // AS3: IssueHandler.as::_SafeStr_4688
    private _bundle: IssueBundle | null;

    /** Derived name — `_SafeStr_5351`: the report currently selected in the list. */
    // AS3: IssueHandler.as::_SafeStr_5351
    private _selectedIssue: IssueInfoData | null = null;

    // AS3: IssueHandler.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: IssueHandler.as::_cfhCategories
    private _cfhCategories: ICfhCategory[];

    /** Derived name — `_SafeStr_7296`: drop-down row → topic id. */
    // AS3: IssueHandler.as::_SafeStr_7296
    private _topicIdsByRow: number[] = [];

    // AS3: IssueHandler.as::_topicDropdown
    private _topicDropdown: IDropMenuWindow | null = null;

    // AS3: IssueHandler.as::_callerUserInfo
    private _callerUserInfo: UserInfoCtrl | null = null;

    // AS3: IssueHandler.as::_reportedUserInfo
    private _reportedUserInfo: UserInfoCtrl | null = null;

    // AS3: IssueHandler.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_9452`: the row holding the auto-triggered default topic. */
    // AS3: IssueHandler.as::_SafeStr_9452
    private _autoTopicRow: number = 0;

    /** Derived name — `_SafeStr_6181`: the embedded evidence chatlog. */
    // AS3: IssueHandler.as::_SafeStr_6181
    private _chatlog: ChatlogCtrl | null = null;

    // AS3: IssueHandler.as::_chatFrame
    private _chatFrame: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6051`. */
    // AS3: IssueHandler.as::_SafeStr_6051
    private _evidenceList: IItemListWindow | null = null;

    /** Derived name — `_SafeStr_7006`: how many actions this window has tracked. */
    // AS3: IssueHandler.as::_SafeStr_7006
    private _actionCount: number = 0;

    /** Derived name — `_SafeStr_5672`. */
    // AS3: IssueHandler.as::_SafeStr_5672
    private _lastWindowX: number;

    /** Derived name — `_SafeStr_5740`. */
    // AS3: IssueHandler.as::_SafeStr_5740
    private _lastWindowY: number;

    // AS3: IssueHandler.as::_lastWindowWidth
    private _lastWindowWidth: number;

    /** Derived name — `_SafeStr_6155`. */
    // AS3: IssueHandler.as::_SafeStr_6155
    private _lastWindowHeight: number;

    /** Derived name — `_SafeStr_8148`: when the geometry last settled. */
    // AS3: IssueHandler.as::_SafeStr_8148
    private _lastPreferencesTime: number = IssueHandler.getTimer();

    /** Derived name — `_SafeStr_6820`: the report-row prototype. */
    // AS3: IssueHandler.as::_SafeStr_6820
    private _issueRowTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6506`: the message-row prototype. */
    // AS3: IssueHandler.as::_SafeStr_6506
    private _messageRowTemplate: ITextFieldWindow | null = null;

    // AS3: IssueHandler.as::IssueHandler()
    constructor(
        moderationManager: ModerationManager,
        bundle: IssueBundle,
        cfhCategories: ICfhCategory[],
        windowX: number,
        windowY: number,
        windowWidth: number,
        windowHeight: number
    )
    {
        this._moderationManager = moderationManager;
        this._bundle = bundle;
        this._cfhCategories = cfhCategories;
        this._lastWindowX = windowX;
        this._lastWindowY = windowY;
        this._lastWindowWidth = windowWidth;
        this._lastWindowHeight = windowHeight;
    }

    // AS3: IssueHandler.as::getType()
    public getType(): number
    {
        return WindowTracker.TYPE_ISSUEHANDLER;
    }

    // AS3: IssueHandler.as::getId()
    public getId(): string
    {
        return `${this._bundle?.id ?? 0}`;
    }

    // AS3: IssueHandler.as::getFrame()
    public getFrame(): IFrameWindow | null
    {
        return this._window;
    }

    // AS3: IssueHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: IssueHandler.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
        }

        if(this._callerUserInfo !== null)
        {
            this._callerUserInfo.dispose();
            this._callerUserInfo = null;
        }

        if(this._reportedUserInfo !== null)
        {
            this._reportedUserInfo.dispose();
            this._reportedUserInfo = null;
        }

        if(this._chatlog !== null)
        {
            this._chatlog.dispose();
            this._chatlog = null;
        }

        if(this._issueRowTemplate !== null)
        {
            (this._issueRowTemplate as unknown as IWindow).dispose();
            this._issueRowTemplate = null;
        }

        if(this._messageRowTemplate !== null)
        {
            (this._messageRowTemplate as unknown as IWindow).dispose();
            this._messageRowTemplate = null;
        }

        this._moderationManager?.removeUpdateReceiver(this);
        this._moderationManager = null;
        this._bundle = null;
    }

    // AS3: IssueHandler.as::show()
    public show(): void
    {
        if(this._window !== null) return;

        const manager = this._moderationManager;

        if(manager === null || manager.windowManager === null || manager.assets === null) return;

        this._window = manager.getXmlWindow('issue_handler') as unknown as IFrameWindow | null;

        if(this._window === null) return;

        const issueList = this._window.findChildByName('issues_item_list') as unknown as IItemListWindow | null;

        if(issueList !== null)
        {
            this._issueRowTemplate = issueList.getListItemAt(0) as unknown as IWindowContainer | null;
            issueList.removeListItems();
        }

        const messageList = this._window.findChildByName('msg_item_list') as unknown as IItemListWindow | null;

        if(messageList !== null)
        {
            this._messageRowTemplate = messageList.getListItemAt(0) as unknown as ITextFieldWindow | null;
            messageList.removeListItems();
        }

        this._window.findChildByTag('close')?.addEventListener('WME_CLICK', this.onClose);

        const issueContainer = this._window.findChildByName('issue_cont');

        if(issueContainer !== null)
        {
            issueContainer.addEventListener('WE_RELOCATED', this.onWindowRelocatedOrResized);
            issueContainer.addEventListener('WE_RESIZED', this.onWindowRelocatedOrResized);

            manager.registerUpdateReceiver(this, IssueHandler.UPDATE_PRIORITY);
        }

        this._lastPreferencesTime = IssueHandler.getTimer();

        this.setProc('close_useless', this.onCloseUseless);
        this.setProc('close_sanction', this.onCloseSanction);
        this.setProc('close_resolved', this.onCloseResolved);
        this.setProc('release', this.onRelease);

        this._window.findChildByName('move_to_player_support')?.disable();

        manager.issueManager?.requestSanctionData(this._bundle?.id ?? 0, -1);

        this.initializeTopicDropdown();

        this._selectedIssue = this._bundle?.getHighestPriorityIssue() ?? null;

        if(this._selectedIssue === null) return;

        this._callerUserInfo = new UserInfoCtrl(this._window, manager, this._selectedIssue, this);
        this._reportedUserInfo = new UserInfoCtrl(this._window, manager, this._selectedIssue, this);

        const callerContainer = this._window.findChildByName('caller_user_info') as unknown as IWindowContainer | null;

        if(callerContainer !== null)
        {
            this._callerUserInfo.load(callerContainer, this._selectedIssue.reporterUserId);
        }

        if(this._selectedIssue.categoryId === IssueHandler.AUTO_TRIGGERED_CATEGORY_ID
            && this._selectedIssue.reportedCategoryId === IssueHandler.AUTO_TOPIC_ID)
        {
            if(this._topicDropdown !== null) this._topicDropdown.selection = this._autoTopicRow;

            manager.issueManager?.requestSanctionData(
                this._bundle?.id ?? 0, IssueHandler.AUTO_DEFAULT_TOPIC_ID
            );
        }

        this.prepareReportedUserColumn();

        (this._window.findChildByName('handle_next_checkbox') as unknown as ISelectableWindow | null)
            ?.select?.();

        this._chatFrame = this._window.findChildByName('chat_cont') as unknown as IWindowContainer | null;
        this._evidenceList = this._chatFrame?.findChildByName('evidence_list') as unknown as IItemListWindow | null;

        this._chatlog = new ChatlogCtrl(
            new GetCfhChatlogMessageComposer(this._selectedIssue.issueId),
            manager,
            WindowTracker.TYPE_CHATLOG_ISSUE,
            this._selectedIssue.issueId,
            this._selectedIssue,
            this._chatFrame,
            this._evidenceList,
            true
        );
        this._chatlog.show();

        log.debug(`HARASSER: ${this._bundle?.reportedUserId ?? 0}`);

        this.updateIssueList();
        this.updateMessages();
    }

    /** A bundle with no reported user loses the whole right column, caption included. */
    // AS3: IssueHandler.as::show()
    private prepareReportedUserColumn(): void
    {
        const container = this._window?.findChildByName('reported_user_info') as unknown as IWindowContainer | null;

        if(container === null) return;

        if((this._bundle?.reportedUserId ?? 0) > 0)
        {
            this._reportedUserInfo?.load(container, this._bundle?.reportedUserId ?? 0);

            return;
        }

        const list = this._window?.findChildByName('issue_cont') as unknown as IItemListWindow | null;

        if(list === null) return;

        const caption = this._window?.findChildByName('reported_user_info_caption') ?? null;

        if(caption !== null) list.removeListItem(caption);

        list.removeListItem(container as unknown as IWindow);
    }

    /**
     * **AS3 transposes width and height here.** `setToolPreferences()` is declared
     * `(x, y, height, width)` — as the moderator-preferences packet calls it — but this method
     * passes `(x, y, width, height)`. So after the client sends its own geometry the two cached
     * values are swapped, and the next issue window opens with them the wrong way round. Kept: it
     * is what the source does, and the composer below still receives the correct order.
     */
    // AS3: IssueHandler.as::sendWindowPreferences()
    private sendWindowPreferences(): void
    {
        const window = this._window as unknown as IWindow | null;

        if(window === null) return;

        this._lastWindowX = window.x;
        this._lastWindowY = window.y;
        this._lastWindowWidth = window.width;
        this._lastWindowHeight = window.height;

        this._moderationManager?.issueManager?.setToolPreferences(
            this._lastWindowX, this._lastWindowY, this._lastWindowWidth, this._lastWindowHeight
        );

        this._moderationManager?.connection?.send(new ModToolPreferencesComposer(
            this._lastWindowX, this._lastWindowY, this._lastWindowWidth, this._lastWindowHeight
        ));
    }

    // AS3: IssueHandler.as::windowDimensionsChanged()
    private windowDimensionsChanged(): boolean
    {
        const window = this._window as unknown as IWindow | null;

        if(window === null) return false;

        return this._lastWindowX !== window.x
            || this._lastWindowY !== window.y
            || this._lastWindowWidth !== window.width
            || this._lastWindowHeight !== window.height;
    }

    /**
     * AS3 never refreshes `_SafeStr_8148` outside `show()` and `sendWindowPreferences()`, so once
     * the five seconds are up the geometry is sent on the very next tick after any change.
     */
    // AS3: IssueHandler.as::update()
    public update(_deltaTime: number): void
    {
        const now = IssueHandler.getTimer();

        if(this.windowDimensionsChanged() && now - this._lastPreferencesTime > IssueHandler.PREFERENCES_QUIET_MS)
        {
            this.sendWindowPreferences();
        }
    }

    /** Splits the space left over by the scrolled content evenly between the two panes. */
    // AS3: IssueHandler.as::onWindowRelocatedOrResized()
    private onWindowRelocatedOrResized = (event: WindowEvent): void =>
    {
        const container = event.window as unknown as IItemListWindow | null;

        if(container === null) return;

        const issueList = container.getListItemByName('issues_item_list') as unknown as IItemListWindow | null;
        const messageList = container.getListItemByName('msg_item_list') as unknown as IItemListWindow | null;

        if(issueList === null || messageList === null) return;

        const containerWindow = container as unknown as IWindow;
        const scrollable = container as unknown as IScrollableListWindow;
        const issueWindow = issueList as unknown as IWindow;
        const messageWindow = messageList as unknown as IWindow;

        const half = (containerWindow.height - scrollable.scrollableRegion.height
            + issueWindow.height + messageWindow.height) * 0.5;

        container.autoArrangeItems = false;

        issueWindow.height = half;
        messageWindow.height = half;

        container.autoArrangeItems = true;
    };

    /**
     * Rows are resized to match the report count and refilled in place, so each row rebinds its
     * click handler with a `removeEventListener` first — the same reuse pattern as `IssueListView`.
     *
     * AS3 clones the *first added row* for the rest rather than the prototype, which is equivalent
     * and kept.
     */
    // AS3: IssueHandler.as::updateIssueList()
    private updateIssueList(): void
    {
        if(this._window === null || this._bundle === null) return;

        const list = this._window.findChildByName('issues_item_list') as unknown as IItemListWindow | null;

        if(list === null) return;

        const issues = this._bundle.issues;
        const existing = list.numListItems;
        const wanted = issues.length;

        if(existing < wanted)
        {
            const first = (this._issueRowTemplate as unknown as IWindow | null)?.clone() ?? null;

            if(first === null) return;

            list.addListItem(first);

            for(let index = 1; index < wanted - existing; index++)
            {
                const clone = first.clone();

                if(clone === null) return;

                list.addListItem(clone);
            }
        }
        else if(existing > wanted)
        {
            for(let index = 0; index < existing - wanted; index++)
            {
                list.removeListItemAt(0)?.dispose();
            }
        }

        const highest = this._bundle.getHighestPriorityIssue();
        const highestId = highest === null ? 0 : highest.issueId;
        const now = IssueHandler.getTimer();

        let position = 0;

        for(const issue of issues)
        {
            const row = list.getListItemAt(position) as unknown as IWindowContainer | null;

            if(row === null) return;

            const rowWindow = row as unknown as IWindow;

            rowWindow.background = position++ % 2 === 0;
            rowWindow.id = issue.issueId;

            rowWindow.removeEventListener('WME_CLICK', this.onIssueClicked);
            rowWindow.addEventListener('WME_CLICK', this.onIssueClicked);

            IssueHandler.setCaption(row.findChildByName('reporter'), issue.reporterUserName);
            IssueHandler.setCaption(
                row.findChildByName('type'), IssueCategoryNames.getSourceName(issue.categoryId)
            );
            IssueHandler.setCaption(
                row.findChildByName('category'), IssueCategoryNames.getCategoryName(issue.reportedCategoryId)
            );
            IssueHandler.setCaption(row.findChildByName('time_open'), issue.getOpenTime(now));

            const category = row.findChildByName('category') as ITextWindow | null;

            if(category !== null)
            {
                category.fontFace = issue.issueId === highestId && wanted > 1
                    ? IssueHandler.FONT_BOLD
                    : IssueHandler.FONT_NORMAL;
            }
        }
    }

    /** The message rows are editable text fields made read-only, so the text stays selectable. */
    // AS3: IssueHandler.as::updateMessages()
    private updateMessages(): void
    {
        if(this._window === null || this._bundle === null) return;

        const list = this._window.findChildByName('msg_item_list') as unknown as IItemListWindow | null;

        if(list === null) return;

        const issues = this._bundle.issues;
        const existing = list.numListItems;
        const wanted = issues.length;

        if(existing < wanted)
        {
            const first = (this._messageRowTemplate as unknown as IWindow | null)?.clone() ?? null;

            if(first === null) return;

            const firstField = first as unknown as ITextFieldWindow;

            firstField.selectable = true;
            firstField.editable = false;

            list.addListItem(first);

            for(let index = 1; index < wanted - existing; index++)
            {
                const clone = first.clone();

                if(clone === null) return;

                list.addListItem(clone);
            }
        }
        else if(existing > wanted)
        {
            for(let index = 0; index < existing - wanted; index++)
            {
                list.removeListItemAt(0)?.dispose();
            }
        }

        let position = 0;

        for(const issue of issues)
        {
            const row = list.getListItemAt(position);

            if(row === null) return;

            const field = row as unknown as ITextFieldWindow;

            row.width = (list as unknown as IWindow).width;
            row.background = position++ % 2 === 0;
            row.caption = `${issue.reporterUserName}: ${issue.message}`;
            row.height = field.textHeight + 10;
        }
    }

    // AS3: IssueHandler.as::setCaption()
    private static setCaption(target: IWindow | null, value: string): void
    {
        if(target !== null) target.caption = value;
    }

    /**
     * The drop-down holds localization keys, not names. Two rows are remembered while building it:
     * the auto-triggered default topic, and the report's own topic — which is pre-selected.
     */
    // AS3: IssueHandler.as::initializeTopicDropdown()
    private initializeTopicDropdown(): void
    {
        this._topicDropdown = this._window?.findChildByName('cfh_topics') as unknown as IDropMenuWindow | null;

        if(this._topicDropdown === null) return;

        const reportedCategoryId = this._bundle?.getHighestPriorityIssue()?.reportedCategoryId ?? 0;

        if(reportedCategoryId === IssueHandler.USELESS_REPORTS_TOPIC_ID)
        {
            (this._topicDropdown as unknown as IWindow).disable();

            return;
        }

        this._topicIdsByRow = [];

        const captions: string[] = [];

        let selected = -1;
        let row = 0;

        for(const category of this._cfhCategories)
        {
            for(const topic of category.topics)
            {
                captions.push(`\${help.cfh.topic.${topic.id}}`);
                this._topicIdsByRow.push(topic.id);

                if(topic.id === IssueHandler.AUTO_DEFAULT_TOPIC_ID) this._autoTopicRow = row;
                if(topic.id === reportedCategoryId) selected = row;

                row++;
            }
        }

        this._topicDropdown.populate(captions);

        if(selected >= 0) this._topicDropdown.selection = selected;

        (this._topicDropdown as unknown as IWindow)
            .addEventListener('WE_SELECTED', this.refreshSanctionDataForSelectedTopic);
    }

    // AS3: IssueHandler.as::refreshSanctionDataForSelectedTopic()
    private refreshSanctionDataForSelectedTopic = (): void =>
    {
        const topicId = this._topicIdsByRow[this._topicDropdown?.selection ?? -1] ?? 0;

        this._moderationManager?.issueManager?.requestSanctionData(this._bundle?.id ?? 0, topicId);
    };

    // AS3: IssueHandler.as::setProc()
    private setProc(name: string, handler: (event: WindowEvent) => void): void
    {
        this._window?.findChildByName(name)?.addEventListener('WME_CLICK', handler);
    }

    /** Closing the window releases nothing — it only stops this client tracking the bundle. */
    // AS3: IssueHandler.as::onClose()
    private onClose = (): void =>
    {
        if(this._moderationManager !== null
            && this._moderationManager.issueManager !== null
            && this._bundle !== null)
        {
            this._moderationManager.issueManager.removeHandler(this._bundle.id);
            this.trackAction('closeWindow');
        }

        this.dispose();
    };

    // AS3: IssueHandler.as::onCloseUseless()
    private onCloseUseless = (): void =>
    {
        log.debug('Close useless clicked');

        this.trackAction('closeUseless');
        this._moderationManager?.trackGoogle('actionCountUseless', this._actionCount);
        this._moderationManager?.issueManager?.closeBundle(
            this._bundle?.id ?? 0, IssueHandler.RESOLUTION_USELESS
        );

        this.checkAutoHandling();
        this.dispose();
    };

    // AS3: IssueHandler.as::onCloseResolved()
    private onCloseResolved = (): void =>
    {
        log.debug('Close resolved clicked');

        this.trackAction('closeResolved');
        this._moderationManager?.trackGoogle('actionCountResolved', this._actionCount);
        this._moderationManager?.issueManager?.closeBundle(
            this._bundle?.id ?? 0, IssueHandler.RESOLUTION_RESOLVED
        );

        this.checkAutoHandling();
        this.dispose();
    };

    /** An auto-triggered report with no topic chosen is refused rather than closed blind. */
    // AS3: IssueHandler.as::onCloseSanction()
    private onCloseSanction = (): void =>
    {
        log.debug('Close with default sanction clicked');

        this.trackAction('closeSanction');
        this._moderationManager?.trackGoogle('actionCountSanction', this._actionCount);

        const row = this._topicDropdown?.selection ?? -1;
        const topicId = row >= 0 ? (this._topicIdsByRow[row] ?? -1) : -1;

        if(topicId <= 0
            && this._bundle?.getHighestPriorityIssue()?.reportedCategoryId === IssueHandler.AUTO_TOPIC_ID)
        {
            this._moderationManager?.windowManager?.alert(
                'Topic missing', 'You need to select the topic first.', 0, null
            );

            return;
        }

        this._moderationManager?.issueManager?.closeDefaultAction(this._bundle?.id ?? 0, topicId);

        this.checkAutoHandling();
        this.dispose();
    };

    // AS3: IssueHandler.as::onRelease()
    private onRelease = (): void =>
    {
        log.debug('Release clicked');

        this.trackAction('release');
        this._moderationManager?.issueManager?.releaseBundle(this._bundle?.id ?? 0);

        this.checkAutoHandling();
        this.dispose();
    };

    /**
     * Re-points the caller card and the chatlog at the clicked report. The chatlog is *re-subscribed*
     * rather than rebuilt — `setId()` then a fresh listener registration, since it unsubscribed
     * itself when its first answer arrived.
     */
    // AS3: IssueHandler.as::onIssueClicked()
    private onIssueClicked = (event: WindowMouseEvent): void =>
    {
        const manager = this._moderationManager;

        if(manager === null || this._bundle === null || this._window === null) return;

        for(const issue of this._bundle.issues)
        {
            if(issue.issueId !== event.window?.id) continue;

            this._selectedIssue = issue;

            const reporterId = issue.reporterUserId;

            if(reporterId !== 0)
            {
                this._callerUserInfo?.dispose();

                this._callerUserInfo = new UserInfoCtrl(this._window, manager, issue, this);

                const container = this._window.findChildByName('caller_user_info') as unknown as IWindowContainer | null;

                if(container !== null) this._callerUserInfo.load(container, reporterId);

                manager.connection?.send(new GetCfhChatlogMessageComposer(issue.issueId));

                this._chatlog?.setId(issue.issueId);

                if(this._chatlog !== null) manager.messageHandler?.addChatlogListener(this._chatlog);
            }

            break;
        }
    };

    // AS3: IssueHandler.as::updateIssuesAndMessages()
    public updateIssuesAndMessages(): void
    {
        this.updateIssueList();
        this.updateMessages();
    }

    /** Matched against the **reported** user, not the caller — this is the sanction preview. */
    // AS3: IssueHandler.as::showDefaultSanction()
    public showDefaultSanction(userId: number, label: string): void
    {
        if(this._window === null
            || this._moderationManager === null
            || this._moderationManager.issueManager === null
            || this._bundle === null)
        {
            return;
        }

        if(userId !== this._bundle.reportedUserId) return;

        const target = this._window.findChildByName('sanction_label') as ITextWindow | null;

        if(target !== null) (target as unknown as IWindow).caption = label;
    }

    /** The "handle next" checkbox is ticked by default, so closing one report opens the next. */
    // AS3: IssueHandler.as::checkAutoHandling()
    private checkAutoHandling(): void
    {
        if(this._window === null
            || this._moderationManager === null
            || this._moderationManager.issueManager === null)
        {
            return;
        }

        const checkbox = this._window.findChildByName('handle_next_checkbox') as unknown as ISelectableWindow | null;

        if(checkbox !== null && checkbox.isSelected)
        {
            this._moderationManager.issueManager.autoPick('issue handler pick next');
        }
    }

    // AS3: IssueHandler.as::get callerUserInfo()
    public get callerUserInfo(): UserInfoCtrl | null
    {
        return this._callerUserInfo;
    }

    // AS3: IssueHandler.as::get reportedUserInfo()
    public get reportedUserInfo(): UserInfoCtrl | null
    {
        return this._reportedUserInfo;
    }

    /** The counter is bumped on every tracked action and reported alongside the close reason. */
    // AS3: IssueHandler.as::trackAction()
    public trackAction(action: string): void
    {
        if(this._moderationManager === null || this._moderationManager.disposed) return;

        this._actionCount += 1;

        this._moderationManager.trackGoogle(`issueHandler_${action}`);
    }

    /** Stands in for AS3's `flash.utils.getTimer()`; only differences are ever used. */
    // AS3: IssueHandler.as::update()
    private static getTimer(): number
    {
        return Math.trunc(performance.now());
    }
}
