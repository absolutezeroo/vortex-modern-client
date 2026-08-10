import type {IWindow} from '@core/window/IWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import type {ForumData} from '@habbo/communication/messages/parser/groupforums/ForumData';
import type {ForumThread} from '@habbo/communication/messages/parser/groupforums/ForumThread';
import type {ForumMessage} from '@habbo/communication/messages/parser/groupforums/ForumMessage';
import type {GroupForumController} from './GroupForumController';
import {GroupForumView} from './GroupForumView';
import {MessageListView} from './MessageListView';
import {StringBuffer} from './StringBuffer';

/**
 * The window for writing a new thread or a reply. Which of the two it is is decided by whether a
 * thread was handed in: with one, the subject field shows that thread's header and is disabled;
 * without one, it is an editable field the user has to fill.
 *
 * It re-validates on a one-second timer as well as on every keystroke, because one of the three
 * conditions is not an input at all — the thirty-second post cooldown expires on its own, and the
 * button has to come back to life without the user touching anything.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/ComposeMessageView.as
 */
export class ComposeMessageView
{
    /**
     * AS3 checks `length <= 10` against both minimums, so a subject of exactly ten characters is
     * rejected — the constants are named `MIN_LENGTH` but behave as "must exceed".
     */
    // AS3: .../groupforums/ComposeMessageView.as::SUBJECT_MIN_LENGTH
    public static readonly SUBJECT_MIN_LENGTH: number = 10;

    // AS3: .../groupforums/ComposeMessageView.as::SUBJECT_MAX_LENGTH
    public static readonly SUBJECT_MAX_LENGTH: number = 120;

    // AS3: .../groupforums/ComposeMessageView.as::MESSAGE_MIN_LENGTH
    public static readonly MESSAGE_MIN_LENGTH: number = 10;

    // AS3: .../groupforums/ComposeMessageView.as::MESSAGE_MAX_LENGTH
    public static readonly MESSAGE_MAX_LENGTH: number = 4000;

    /**
     * The flood gate between two posts, in milliseconds. **Name derived** — the constant is inlined
     * at both of its uses in `validateInputs()`.
     */
    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_11134
    public static readonly POST_COOLDOWN_MS: number = 30000;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_4593
    private _controller: GroupForumController | null;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_4684
    private _view: GroupForumView | null;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_4902
    // **Name derived**: the one-second re-validation tick.
    private _validationTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../groupforums/ComposeMessageView.as::_window
    private _window: IFrameWindow | null;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_5501
    // **Names derived** from the layout children, here and for the two below.
    private _subjectField: ITextFieldWindow | null = null;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_5572
    private _messageField: ITextFieldWindow | null = null;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_5379
    private _postButton: IWindow | null = null;

    // AS3: .../groupforums/ComposeMessageView.as::_status
    private _status: IWindow | null = null;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_4633
    private _forum: ForumData | null;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_5759
    // **Name derived**: the thread being replied to, or null when composing a new one.
    private _thread: ForumThread | null;

    // AS3: .../groupforums/ComposeMessageView.as::_hasErrors
    private _hasErrors: boolean = false;

    // AS3: .../groupforums/ComposeMessageView.as::_SafeStr_7215
    // **Name derived**: set once the post has been sent, and never cleared — the window is disposed
    // by the controller when the server answers, so this only has to survive until then. It is what
    // keeps a second click from double-posting, and what stops `focus()` reusing a window mid-send.
    private _isPosting: boolean = false;

    /**
     * Opens to the right of the main window, then pulls itself back onto the desktop if that would
     * put it off the edge — the position is a suggestion, not a constraint.
     */
    // AS3: .../groupforums/ComposeMessageView.as::ComposeMessageView()
    constructor(view: GroupForumView, x: number, y: number, forum: ForumData, thread: ForumThread | null, message: ForumMessage | null)
    {
        this._view = view;
        this._controller = this._view.controller;
        this._forum = forum;
        this._thread = thread;
        this._window = this._controller?.windowManager?.buildWidgetLayout('groupforum_compose_message_xml') as IFrameWindow | null ?? null;

        if(this._window === null) return;

        this._window.x = x;

        const desktopWidth = this._controller?.windowManager?.getDesktop(1)?.width ?? 0;

        if(this._window.x + this._window.width > desktopWidth)
        {
            this._window.x = desktopWidth - this._window.width;
        }

        this._window.y = y;

        this.initControls(message);

        if(this._status !== null && this._status.caption.length === 0)
        {
            this._status.caption = this._controller?.localizationManager?.getLocalization('groupforum.compose.reply_hint') ?? '';
        }

        this._validationTimer = setInterval(this.onTimerEvent, 1000);
    }

    /**
     * Re-points an already-open window at a different thread instead of stacking a second one.
     *
     * The subject is cleared only on the transition *from* a reply *to* a new thread — otherwise
     * the disabled field's old thread header would be submitted as the new thread's subject.
     *
     * A window mid-send is only brought to the front; nothing about it is changed.
     */
    // AS3: .../groupforums/ComposeMessageView.as::focus()
    focus(forum: ForumData, thread: ForumThread | null, message: ForumMessage | null): void
    {
        if(!this._isPosting)
        {
            this._forum = forum;

            if(this._thread !== null && thread === null && this._subjectField !== null)
            {
                this._subjectField.text = '';
            }

            this._thread = thread;
            this.initControls(message);
        }

        this._window?.activate();
    }

    // AS3: .../groupforums/ComposeMessageView.as::initControls()
    // Re-entrant: `focus()` calls it again on an open window, which is why every listener is
    // removed before it is added.
    private initControls(message: ForumMessage | null): void
    {
        if(this._window === null || this._forum === null) return;

        const localization = this._controller?.localizationManager;
        const clickArea = GroupForumView.initTopAreaForForum(this._window, this._forum);

        if(clickArea !== null)
        {
            clickArea.removeEventListener('WME_CLICK', this.onTopAreaClick);
            clickArea.addEventListener('WME_CLICK', this.onTopAreaClick);
        }

        const subjectHeader = this._window.findChildByName('thread_subject_header');

        this._subjectField = this._window.findChildByName('thread_subject') as ITextFieldWindow | null;

        if(this._thread)
        {
            if(subjectHeader !== null) subjectHeader.caption = localization?.getLocalization('groupforum.compose.subject_replying_to') ?? '';

            if(this._subjectField !== null)
            {
                this._subjectField.text = this._thread.header;
                this._subjectField.disable();
            }
        }
        else
        {
            if(subjectHeader !== null) subjectHeader.caption = localization?.getLocalization('groupforum.compose.subject') ?? '';

            if(this._subjectField !== null)
            {
                this._subjectField.addEventListener('WKE_KEY_UP', this.onHeaderKeyUpEvent);
                this._subjectField.maxChars = ComposeMessageView.SUBJECT_MAX_LENGTH;
                this._subjectField.enable();
            }
        }

        this._messageField = this._window.findChildByName('message_text') as ITextFieldWindow | null;

        if(this._messageField !== null)
        {
            this._messageField.removeEventListener('WKE_KEY_UP', this.onMessageKeyUpEvent);
            this._messageField.addEventListener('WKE_KEY_UP', this.onMessageKeyUpEvent);
            this._messageField.maxChars = ComposeMessageView.MESSAGE_MAX_LENGTH;
        }

        if(message !== null)
        {
            this.addQuote(message);
        }

        const cancelButton = this._window.findChildByName('cancel_btn');

        cancelButton?.removeEventListener('WME_CLICK', this.onCancelButtonClick);
        cancelButton?.addEventListener('WME_CLICK', this.onCancelButtonClick);

        const closeButton = this._window.findChildByName('header_button_close');

        closeButton?.removeEventListener('WME_CLICK', this.onCancelButtonClick);
        closeButton?.addEventListener('WME_CLICK', this.onCancelButtonClick);

        this._postButton = this._window.findChildByName('post_btn');
        this._postButton?.removeEventListener('WME_CLICK', this.onPostButtonClick);
        this._postButton?.addEventListener('WME_CLICK', this.onPostButtonClick);

        this._status = this._window.findChildByName('status_text');

        this.validateInputs();
    }

    /**
     * Prepends the quoted post to whatever is already typed.
     *
     * A quote of a quote is not nested — a run of already-quoted lines collapses to a single
     * "skipped" marker, so replying down a chain does not drag the whole chain along. The flag is
     * reset by any non-quoted line, so several separate quoted runs each get their own marker.
     */
    // AS3: .../groupforums/ComposeMessageView.as::addQuote()
    private addQuote(message: ForumMessage): void
    {
        if(this._messageField === null) return;

        const localization = this._controller?.localizationManager;
        const buffer = new StringBuffer();

        buffer.add(this._messageField.text);

        if(buffer.length > 0)
        {
            buffer.add('\r\r');
        }

        buffer.add(localization?.getLocalizationWithParams(
            'groupforum.compose.reply_template',
            '',
            'author_name', message.authorName,
            'creation_time', this._view?.getAsDaysHoursMinutes(message.creationTimeAsSecondsAgo) ?? ''
        ) ?? '');
        buffer.add('\r');

        const lines = message.messageText.split('\r');
        let skipped = false;

        for(const line of lines)
        {
            if(MessageListView.QUOTE_PATTERN.exec(line) !== null)
            {
                if(!skipped)
                {
                    skipped = true;
                    buffer.add('> ').add(localization?.getLocalization('groupforum.compose.skipped_quote') ?? '').add('\r');
                }
            }
            else
            {
                buffer.add('> ').add(line).add('\r');
                skipped = false;
            }
        }

        buffer.add('\r');

        this._messageField.text = buffer.toString();
    }

    // AS3: .../groupforums/ComposeMessageView.as::dispose()
    // Clears the controller's reference on the way out, which is what lets the next reply build a
    // fresh window instead of calling `focus()` on a disposed one.
    dispose(): void
    {
        if(this._validationTimer !== null)
        {
            clearInterval(this._validationTimer);
            this._validationTimer = null;
        }

        if(this._controller !== null) this._controller.composeMessageView = null;

        this._window?.dispose();
        this._window = null;
    }

    // AS3: .../groupforums/ComposeMessageView.as::onTimerEvent()
    private onTimerEvent = (): void =>
    {
        this.validateInputs();
    };

    // AS3: .../groupforums/ComposeMessageView.as::onHeaderKeyUpEvent()
    private onHeaderKeyUpEvent = (_event: WindowKeyboardEvent): void =>
    {
        this.validateInputs();
    };

    // AS3: .../groupforums/ComposeMessageView.as::onMessageKeyUpEvent()
    private onMessageKeyUpEvent = (_event: WindowKeyboardEvent): void =>
    {
        this.validateInputs();
    };

    // AS3: .../groupforums/ComposeMessageView.as::onTopAreaClick()
    private onTopAreaClick = (_event: WindowMouseEvent): void =>
    {
        if(this._forum !== null)
        {
            this._controller?.context.createLinkEvent('group/' + this._forum.groupId);
        }
    };

    /**
     * Sends, then locks the window down and waits. Nothing here closes it — the controller disposes
     * it when the server confirms, so a failed post leaves the text where the user can see it.
     */
    // AS3: .../groupforums/ComposeMessageView.as::onPostButtonClick()
    private onPostButtonClick = (_event: WindowMouseEvent): void =>
    {
        if(this._isPosting)
        {
            return;
        }

        this.validateInputs();

        if(this._hasErrors)
        {
            return;
        }

        this._isPosting = true;
        this._subjectField?.disable();
        this._messageField?.disable();
        this._postButton?.disable();

        if(this._status !== null)
        {
            this._status.caption = this._controller?.localizationManager?.getLocalization('groupforum.compose.posting') ?? '';
        }

        if(this._forum === null) return;

        if(this._thread)
        {
            this._controller?.postNewMessage(this._forum.groupId, this._thread.threadId, this._messageField?.text ?? '');
        }
        else
        {
            this._controller?.postNewThread(this._forum.groupId, this._subjectField?.text ?? '', this._messageField?.text ?? '');
        }
    };

    // AS3: .../groupforums/ComposeMessageView.as::onCancelButtonClick()
    private onCancelButtonClick = (_event: WindowMouseEvent): void =>
    {
        this.dispose();
    };

    /**
     * Three conditions, first one wins, and the status line always says which. The cooldown is the
     * only one that can clear itself, and it is skipped once posting has begun so that the "posting"
     * message is not overwritten by a countdown.
     */
    // AS3: .../groupforums/ComposeMessageView.as::validateInputs()
    private validateInputs(): void
    {
        const localization = this._controller?.localizationManager;

        this._hasErrors = false;

        if(!this._thread)
        {
            if((this._subjectField?.text.length ?? 0) <= ComposeMessageView.SUBJECT_MIN_LENGTH)
            {
                this._hasErrors = true;

                if(this._status !== null) this._status.caption = localization?.getLocalization('groupforum.compose.subject_too_short') ?? '';
            }
        }

        if(!this._hasErrors && (this._messageField?.text.length ?? 0) <= ComposeMessageView.MESSAGE_MIN_LENGTH)
        {
            this._hasErrors = true;

            if(this._status !== null) this._status.caption = localization?.getLocalization('groupforum.compose.message_too_short') ?? '';
        }

        if(!this._hasErrors && !this._isPosting)
        {
            const elapsed = ComposeMessageView.getTimer() - (this._controller?.lastPostTime ?? 0);

            if(elapsed < ComposeMessageView.POST_COOLDOWN_MS)
            {
                this._hasErrors = true;

                if(this._status !== null)
                {
                    // The `+ 1` rounds the countdown up, so it reads "1 second" rather than "0"
                    // through the last second of the wait.
                    this._status.caption = localization?.getLocalizationWithParams(
                        'groupforum.compose.post_cooldown',
                        '',
                        'time_remaining',
                        FriendlyTime.getFriendlyTime(localization ?? null, (ComposeMessageView.POST_COOLDOWN_MS - elapsed) / 1000 + 1, '', 1)
                    ) ?? '';
                }
            }
        }

        if(!this._isPosting && !this._hasErrors)
        {
            this._postButton?.enable();

            if(this._status !== null) this._status.caption = '';
        }
        else
        {
            this._postButton?.disable();
        }
    }

    // TS-only: stands in for `flash.utils.getTimer()`, matching the controller's own helper — the
    // two have to share a clock, since this compares against `controller.lastPostTime`.
    private static getTimer(): number
    {
        if(typeof performance !== 'undefined')
        {
            return Math.floor(performance.now());
        }

        return Date.now();
    }
}
