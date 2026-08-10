import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IDisposable} from '@core/runtime';
import type {ForumPermissions} from '@habbo/communication/messages/parser/groupforums/ForumPermissions';
import type {ForumThread} from '@habbo/communication/messages/parser/groupforums/ForumThread';
import {ForumModerationState} from './ForumModerationState';
import type {GroupForumController} from './GroupForumController';
import type {GroupForumView} from './GroupForumView';
import type {ThreadsListData} from './ThreadsListData';

/**
 * One thread's row, with its moderation controls.
 *
 * Almost all of the complexity here is the four buttons, and they are not simply shown or hidden —
 * each has a visible/enabled pair that says three different things:
 *
 * - **hidden and disabled**: the action does not apply to you.
 * - **visible and disabled**: it does not apply, but the *state* it reports does — a locked or
 *   pinned thread still shows its padlock to a member who cannot unlock it.
 * - **visible and enabled**: you can act.
 *
 * The row also changes colour with the thread's moderation state rather than only with its index:
 * grey for hidden by a group admin, red for hidden by staff.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/ThreadListItemView.as
 */
export class ThreadListItemView implements IDisposable
{
    // AS3: .../groupforums/ThreadListItemView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_4684
    private _view: GroupForumView | null = null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_4593
    private _controller: GroupForumController | null = null;

    // AS3: .../groupforums/ThreadListItemView.as::_window
    private _window: IWindowContainer | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_6770
    // **Name derived** from `texts_container`; the same holds for every `_SafeStr_` field below,
    // each named after the layout child it is looked up by.
    private _textsContainer: IWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_header
    private _header: ITextWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_headerRegion
    private _headerRegion: IWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_details
    private _details: IWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_6601
    private _unreadTextsContainer: IWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_6305
    private _unreadRegion: IWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_messages1
    private _messages1: ITextWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_messages2
    private _messages2: ITextWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_buttonContainer
    private _buttonContainer: IWindowContainer | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_5113
    // The first `mod_buttons` entry: hide, or unhide when the thread is already hidden.
    private _hideButton: IRegionWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_6495
    private _hideButtonIcon: IStaticBitmapWrapperWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_5384
    // The second `mod_buttons` entry: report. It has no icon of its own to swap.
    private _reportButton: IRegionWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_6113
    private _leftButtonContainer: IWindowContainer | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_5269
    private _lockButton: IRegionWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_8270
    private _lockButtonIcon: IStaticBitmapWrapperWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_5317
    private _pinButton: IRegionWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_7523
    private _pinButtonIcon: IStaticBitmapWrapperWindow | null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_4633
    private _forum: ForumPermissions | null = null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_5145
    private _threadsListData: ThreadsListData | null = null;

    // AS3: .../groupforums/ThreadListItemView.as::_SafeStr_4866
    // Name recovered from its own getter, `get threadId()`.
    private _threadId: number = 0;

    // AS3: .../groupforums/ThreadListItemView.as::ThreadListItemView()
    constructor(template: IWindowContainer, view: GroupForumView)
    {
        this.bind(view);

        this._window = template.clone() as IWindowContainer;
        this._textsContainer = this._window.findChildByName('texts_container');
        this._header = this._window.findChildByName('header') as ITextWindow | null;
        this._headerRegion = this._window.findChildByName('header_region');
        this._details = this._window.findChildByName('details');
        this._unreadTextsContainer = this._window.findChildByName('unread_texts_container');
        this._unreadRegion = this._window.findChildByName('unread_region');
        this._messages1 = this._window.findChildByName('messages1') as ITextWindow | null;
        this._messages2 = this._window.findChildByName('messages2') as ITextWindow | null;
        this._buttonContainer = this._window.findChildByName('button_container') as IWindowContainer | null;

        // The moderation buttons are addressed by position, the info buttons by name — AS3's own
        // asymmetry, kept because the layout's `mod_buttons` entries are unnamed.
        const modButtons = this._buttonContainer?.findChildByName('mod_buttons') as IItemListWindow | null;

        this._hideButton = modButtons?.getListItemAt(0) as IRegionWindow | null ?? null;
        this._hideButtonIcon = this._hideButton?.getChildByName('icon') as IStaticBitmapWrapperWindow | null ?? null;
        this._reportButton = modButtons?.getListItemAt(1) as IRegionWindow | null ?? null;

        this._leftButtonContainer = this._window.findChildByName('left_button_container') as IWindowContainer | null;

        const infoButtons = this._leftButtonContainer?.findChildByName('info_buttons') as IItemListWindow | null;

        this._lockButton = infoButtons?.getListItemByName('thread_lock') as IRegionWindow | null ?? null;
        this._lockButtonIcon = this._lockButton?.getChildByName('icon') as IStaticBitmapWrapperWindow | null ?? null;
        this._pinButton = infoButtons?.getListItemByName('thread_pin') as IRegionWindow | null ?? null;
        this._pinButtonIcon = this._pinButton?.getChildByName('icon') as IStaticBitmapWrapperWindow | null ?? null;

        this._headerRegion?.addEventListener('WME_CLICK', this.onGoToFirstUnread);
        this._unreadRegion?.addEventListener('WME_CLICK', this.onGoToFirstUnread);
        this._hideButton?.addEventListener('WME_CLICK', this.onDeleteOrUndelete);
        this._reportButton?.addEventListener('WME_CLICK', this.onReport);
        this._lockButton?.addEventListener('WME_CLICK', this.onToggleLock);
        this._pinButton?.addEventListener('WME_CLICK', this.onToggleSticky);
    }

    /**
     * Grey for a thread a group admin hid, red for one staff hid; anything else falls through to
     * the ordinary alternating background.
     */
    // AS3: .../groupforums/ThreadListItemView.as::getThreadColor()
    private static getThreadColor(state: number, index: number): number
    {
        switch(state)
        {
            case ForumModerationState.HIDDEN_BY_ADMIN:
                return 4289374890;
            case ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD:
                return 4294946981;
            case ForumModerationState.DEFAULT_STATE:
            case ForumModerationState.RESTORED_BY_ADMIN:
            default:
                return (index + 1) % 2 ? 4293852927 : 4289914618;
        }
    }

    // AS3: .../groupforums/ThreadListItemView.as::bind()
    bind(view: GroupForumView): void
    {
        this._view = view;
        this._controller = this._view.controller;
    }

    /**
     * The unread count is computed, not read off the thread: it is the message count minus how far
     * the controller thinks this visit got. That is why a thread just read shows nothing new even
     * though the server's own `nUnreadMessages` has not caught up.
     *
     * A hidden thread's subject is replaced for anyone who cannot moderate — the title of a removed
     * thread is exactly what should not survive its removal.
     */
    // AS3: .../groupforums/ThreadListItemView.as::initialize()
    initialize(forum: ForumPermissions, threads: ThreadsListData, thread: ForumThread, index: number): void
    {
        this._forum = forum;
        this._threadsListData = threads;
        this._threadId = thread.threadId;

        const localization = this._controller?.localizationManager;
        const state = thread.state;
        const canModerate = this._forum.canModerate;
        const isStaff = this._forum.isStaff;
        const unread = thread.nMessages - (this._controller?.getThreadLastReadMessageIndex(thread.threadId) ?? -1) - 1;
        const color = ThreadListItemView.getThreadColor(state, index);

        if(this._window !== null) this._window.name = 'thread_' + thread.threadId;

        if(this._textsContainer !== null)
        {
            this._textsContainer.id = thread.threadId;
            this._textsContainer.color = color;
        }

        let header = thread.header;

        if(header === '')
        {
            // AS3's literal, not a localization key.
            header = '(No Subject)';
        }

        if(state > ForumModerationState.RESTORED_BY_ADMIN && !canModerate && !isStaff)
        {
            header = this.getModerationMessage(thread) ?? '';
        }

        if(this._header !== null)
        {
            this._header.bold = unread > 0;
            this._header.text = header;
        }

        if(this._headerRegion !== null) this._headerRegion.id = thread.threadId;

        if(this._details !== null)
        {
            this._details.caption = localization?.getLocalizationWithParams(
                'groupforum.view.thread_details',
                '',
                'thread_author_id', String(thread.threadAuthorId),
                'thread_author_name', thread.threadAuthorName,
                'last_author_id', String(thread.lastMessageAuthorId),
                'last_author_name', thread.lastMessageAuthorName,
                'creation_time', this._view?.getAsDaysHoursMinutes(thread.creationTimeAsSecondsAgo) ?? '',
                'update_time', this._view?.getAsDaysHoursMinutes(thread.lastMessageTimeAsSecondsAgo) ?? ''
            ) ?? '';
        }

        if(this._unreadTextsContainer !== null)
        {
            this._unreadTextsContainer.id = thread.threadId;
            this._unreadTextsContainer.color = color;
        }

        if(this._unreadRegion !== null) this._unreadRegion.id = thread.threadId;

        if(this._messages1 !== null)
        {
            this._messages1.bold = unread > 0;
            this._messages1.text = localization?.getLocalizationWithParams(
                'groupforum.view.thread_details1',
                '',
                'total_messages', String(thread.nMessages),
                'new_messages', String(unread)
            ) ?? '';
        }

        if(this._messages2 !== null)
        {
            this._messages2.bold = unread > 0;
            this._messages2.text = localization?.getLocalizationWithParams(
                'groupforum.view.thread_details2',
                '',
                'total_messages', String(thread.nMessages),
                'new_messages', String(unread)
            ) ?? '';
        }

        // Both containers take their colour twice, before and after the visibility pass. AS3 does
        // the same: showing or hiding a child repaints the container from the skin, which undoes
        // the first assignment.
        if(this._buttonContainer !== null)
        {
            this._buttonContainer.id = thread.threadId;
            this._buttonContainer.color = color;
        }

        this.handleButtonVisibility(state);

        if(this._buttonContainer !== null) this._buttonContainer.color = color;

        if(this._leftButtonContainer !== null)
        {
            this._leftButtonContainer.id = thread.threadId;
            this._leftButtonContainer.color = color;
        }

        this.handleLeftButtonsVisibility(thread);

        if(this._leftButtonContainer !== null) this._leftButtonContainer.color = color;
    }

    /**
     * The hide button, and the report button beside it.
     *
     * A thread hidden by staff can only be restored by staff — a group's own moderator loses the
     * button entirely rather than being shown a disabled one, because for them the thread is gone.
     */
    // AS3: .../groupforums/ThreadListItemView.as::handleButtonVisibility()
    private handleButtonVisibility(state: number): void
    {
        if(this._forum === null) return;

        const canModerate = this._forum.canModerate;
        const isStaff = this._forum.isStaff;
        const canReport = this._forum.canReport;

        if(this._hideButton !== null)
        {
            this._hideButton.visible = true;
            this._hideButton.enable();
        }

        if(this._hideButtonIcon !== null) this._hideButtonIcon.assetUri = 'forum_forum_hide';

        if(canModerate || isStaff)
        {
            switch(state)
            {
                case ForumModerationState.HIDDEN_BY_ADMIN:
                    if(this._hideButtonIcon !== null) this._hideButtonIcon.assetUri = 'forum_forum_unhide';

                    break;
                case ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD:
                    if(isStaff)
                    {
                        if(this._hideButtonIcon !== null) this._hideButtonIcon.assetUri = 'forum_forum_unhide';

                        break;
                    }

                    if(this._hideButton !== null)
                    {
                        this._hideButton.visible = false;
                        this._hideButton.disable();
                    }
            }
        }
        else if(this._hideButton !== null)
        {
            this._hideButton.visible = false;
            this._hideButton.disable();
        }

        if(this._reportButton !== null)
        {
            this._reportButton.visible = canModerate || isStaff || canReport;

            if(this._reportButton.visible)
            {
                this._reportButton.enable();
            }
            else
            {
                this._reportButton.disable();
            }
        }
    }

    /**
     * The padlock and the pin. For a moderator they are controls; for everyone else they are
     * indicators — shown only while the thread is in that state, and never clickable.
     */
    // AS3: .../groupforums/ThreadListItemView.as::handleLeftButtonsVisibility()
    private handleLeftButtonsVisibility(thread: ForumThread): void
    {
        if(this._forum === null) return;

        const canModerate = this._forum.canModerate;
        const isStaff = this._forum.isStaff;

        if(this._lockButtonIcon !== null)
        {
            this._lockButtonIcon.assetUri = thread.isLocked ? 'forum_forum_locked' : 'forum_forum_unlocked';
        }

        if(this._lockButton !== null)
        {
            if(canModerate || isStaff)
            {
                this._lockButton.visible = true;
                this._lockButton.enable();
            }
            else
            {
                this._lockButton.visible = thread.isLocked;
                this._lockButton.disable();
            }
        }

        if(this._pinButtonIcon !== null)
        {
            this._pinButtonIcon.assetUri = thread.isSticky ? 'forum_forum_pinned' : 'forum_forum_unpinned';
        }

        if(this._pinButton !== null)
        {
            if(canModerate || isStaff)
            {
                this._pinButton.visible = true;
                this._pinButton.enable();
            }
            else
            {
                this._pinButton.visible = thread.isSticky;
                this._pinButton.disable();
            }
        }
    }

    // AS3: .../groupforums/ThreadListItemView.as::getModerationMessage()
    private getModerationMessage(thread: ForumThread): string | null
    {
        const localization = this._controller?.localizationManager;

        switch(thread.state)
        {
            case ForumModerationState.HIDDEN_BY_ADMIN:
                return localization?.getLocalizationWithParams('groupforum.view.thread_hidden_by_admin', '', 'admin_name', thread.adminName) ?? null;
            case ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD:
                return localization?.getLocalizationWithParams('groupforum.view.thread_hidden_by_staff', '', 'admin_name', thread.adminName) ?? null;
            default:
                return null;
        }
    }

    /**
     * The lock and pin toggles send the same message and differ only in which flag they invert —
     * the composer carries both, so the untouched one has to be sent at its current value or it
     * would be cleared.
     */
    // AS3: .../groupforums/ThreadListItemView.as::onToggleLock()
    private onToggleLock = (_event: WindowMouseEvent): void =>
    {
        const thread = this._threadsListData?.threadsById.get(this._threadId) ?? null;

        if(thread === null || this._forum === null)
        {
            return;
        }

        this._controller?.lockThread(this._forum, this._threadId, !thread.isLocked, thread.isSticky);
    };

    // AS3: .../groupforums/ThreadListItemView.as::onToggleSticky()
    private onToggleSticky = (_event: WindowMouseEvent): void =>
    {
        const thread = this._threadsListData?.threadsById.get(this._threadId) ?? null;

        if(thread === null || this._forum === null)
        {
            return;
        }

        this._controller?.stickThread(this._forum, this._threadId, thread.isLocked, !thread.isSticky);
    };

    // AS3: .../groupforums/ThreadListItemView.as::onReport()
    private onReport = (_event: WindowMouseEvent): void =>
    {
        if(this._threadId > 0 && this._forum !== null)
        {
            this._controller?.reportThread(this._forum, this._threadId);
        }
    };

    /**
     * One button, two actions, decided by the thread's own state. Staff can undo a staff removal;
     * a group moderator can only undo their own, which is why `isStaff` gates the second case.
     */
    // AS3: .../groupforums/ThreadListItemView.as::onDeleteOrUndelete()
    private onDeleteOrUndelete = (_event: WindowMouseEvent): void =>
    {
        const thread = this._threadsListData?.threadsById.get(this._threadId) ?? null;

        if(thread === null || this._forum === null)
        {
            return;
        }

        if(thread.state === ForumModerationState.HIDDEN_BY_ADMIN
            || (thread.state === ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD && this._forum.isStaff))
        {
            this._controller?.unDeleteThread(this._forum, this._threadId);
        }
        else
        {
            this._controller?.deleteThread(this._forum, this._threadId);
        }
    };

    /**
     * Clicking the row opens the thread at its first unread post, not at the top — clamped to the
     * last post so a fully-read thread lands on the end rather than past it.
     */
    // AS3: .../groupforums/ThreadListItemView.as::onGoToFirstUnread()
    private onGoToFirstUnread = (_event: WindowMouseEvent): void =>
    {
        const thread = this._threadsListData?.threadsById.get(this._threadId) ?? null;

        if(thread !== null && this._forum !== null && this._controller !== null)
        {
            const index = Math.min(this._controller.getThreadLastReadMessageIndex(this._threadId) + 1, thread.nMessages - 1);

            this._controller.goToMessageIndex(this._forum.groupId, this._threadId, index);
        }
    };

    /**
     * Returns the row to the pool. The four buttons are re-shown and re-enabled rather than left as
     * the last thread set them — `initialize()` re-decides all four anyway, but a pooled row is
     * briefly reachable before that, and a disabled button would stay dead.
     */
    // AS3: .../groupforums/ThreadListItemView.as::recycle()
    recycle(): void
    {
        this._forum = null;
        this._threadsListData = null;
        this._threadId = 0;

        if(this._window !== null) this._window.name = '';

        if(this._textsContainer !== null) this._textsContainer.id = 0;

        if(this._headerRegion !== null) this._headerRegion.id = 0;

        if(this._unreadTextsContainer !== null) this._unreadTextsContainer.id = 0;

        if(this._unreadRegion !== null) this._unreadRegion.id = 0;

        if(this._buttonContainer !== null) this._buttonContainer.id = 0;

        if(this._leftButtonContainer !== null) this._leftButtonContainer.id = 0;

        if(this._header !== null)
        {
            this._header.bold = false;
            this._header.text = '';
        }

        if(this._details !== null) this._details.caption = '';

        if(this._messages1 !== null)
        {
            this._messages1.bold = false;
            this._messages1.text = '';
        }

        if(this._messages2 !== null)
        {
            this._messages2.bold = false;
            this._messages2.text = '';
        }

        for(const button of [this._hideButton, this._reportButton, this._lockButton, this._pinButton])
        {
            if(button !== null)
            {
                button.visible = true;
                button.enable();
            }
        }
    }

    // AS3: .../groupforums/ThreadListItemView.as::get threadId()
    get threadId(): number
    {
        return this._threadId;
    }

    // AS3: .../groupforums/ThreadListItemView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../groupforums/ThreadListItemView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../groupforums/ThreadListItemView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._headerRegion?.removeEventListener('WME_CLICK', this.onGoToFirstUnread);
        this._unreadRegion?.removeEventListener('WME_CLICK', this.onGoToFirstUnread);
        this._hideButton?.removeEventListener('WME_CLICK', this.onDeleteOrUndelete);
        this._reportButton?.removeEventListener('WME_CLICK', this.onReport);
        this._lockButton?.removeEventListener('WME_CLICK', this.onToggleLock);
        this._pinButton?.removeEventListener('WME_CLICK', this.onToggleSticky);
        this._window?.dispose();
        this._window = null;
        this._pinButtonIcon = null;
        this._pinButton = null;
        this._lockButtonIcon = null;
        this._lockButton = null;
        this._leftButtonContainer = null;
        this._reportButton = null;
        this._hideButtonIcon = null;
        this._hideButton = null;
        this._buttonContainer = null;
        this._messages2 = null;
        this._messages1 = null;
        this._unreadRegion = null;
        this._unreadTextsContainer = null;
        this._details = null;
        this._headerRegion = null;
        this._header = null;
        this._textsContainer = null;
        this._threadsListData = null;
        this._forum = null;
        this._controller = null;
        this._view = null;
        this._threadId = 0;
        this._disposed = true;
    }
}
