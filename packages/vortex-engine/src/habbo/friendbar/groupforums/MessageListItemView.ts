import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IDisposable} from '@core/runtime';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {ForumPermissions} from '@habbo/communication/messages/parser/groupforums/ForumPermissions';
import type {ForumThread} from '@habbo/communication/messages/parser/groupforums/ForumThread';
import type {ForumMessage} from '@habbo/communication/messages/parser/groupforums/ForumMessage';
import {ForumModerationState} from './ForumModerationState';
import type {GroupForumController} from './GroupForumController';
import type {GroupForumView} from './GroupForumView';
import {MessageListView} from './MessageListView';
import {StringBuffer} from './StringBuffer';

/**
 * One post, and the forums' little markup language.
 *
 * A post is not one text field: it is a stack of them, one per run of lines at the same quote
 * level, so that a quoted block can be indented and given its own background while the rest of the
 * post stays flush. The fields come from a per-row pool built by cloning the layout's own
 * `message_text` — which is removed from its parent in the constructor and kept only as a
 * prototype, never shown.
 *
 * The markup is `*bold*`, `_italic_`, `@mention` and a backslash escape, plus `>` at the start of
 * a line for a quote. It is translated to the HTML subset the text window understands, and
 * everything that is not markup goes through `addEscaped()` — which is the only thing stopping a
 * post from injecting its own tags.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/MessageListItemView.as
 */
export class MessageListItemView implements IDisposable
{
    // AS3: .../groupforums/MessageListItemView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_4684
    private _view: GroupForumView | null = null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_4593
    private _controller: GroupForumController | null = null;

    // AS3: .../groupforums/MessageListItemView.as::_window
    private _window: IWindowContainer | null;

    // AS3: .../groupforums/MessageListItemView.as::_headerLineContainer
    private _headerLineContainer: IWindowContainer | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_6343
    // **Name derived** from `date`; every `_SafeStr_` field below is likewise named after the
    // layout child it is looked up by.
    private _date: ITextWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_7382
    private _replyNum: ITextWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_4869
    private _msgContainer: IWindowContainer | null;

    // AS3: .../groupforums/MessageListItemView.as::_messageArea
    private _messageArea: IWindowContainer | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_5585
    private _avatarImage: IWindowContainer | null;

    // AS3: .../groupforums/MessageListItemView.as::_avatarWidget
    private _avatarWidget: IAvatarImageWidget | null;

    // AS3: .../groupforums/MessageListItemView.as::_author
    private _author: ITextWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_6968
    private _authorPostCount: ITextWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_5113
    private _deleteButton: IRegionWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_6495
    private _deleteButtonIcon: IStaticBitmapWrapperWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_5384
    private _reportButton: IRegionWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_5377
    private _replyButton: IRegionWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_4803
    // The prototype text field. Detached from the layout in the constructor and never displayed —
    // every visible block is a clone of it, and every block is reset back to its geometry.
    private _messageTextTemplate: ITextWindow | null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_6241
    // **Name derived**: blocks not currently in use, ready to be claimed again.
    private _textBlockPool: ITextWindow[];

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_6913
    // **Name derived**: the blocks this post is currently showing.
    private _activeTextBlocks: ITextWindow[];

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_4633
    private _forum: ForumPermissions | null = null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_5759
    private _thread: ForumThread | null = null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_4748
    // **Name derived**: the post this row is showing.
    private _message: ForumMessage | null = null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_6551
    // **Name derived**: the figure last handed to the avatar widget.
    private _figure: string | null = null;

    // AS3: .../groupforums/MessageListItemView.as::_SafeStr_8137
    // Name recovered from its own getter, `get hasPendingAvatarLoad()`. Nothing ever sets it true:
    // the throttled avatar loading it belonged to is gone from this build, and only the flag, the
    // getter and `MessageListView.AVATAR_LOAD_INTERVAL_MS` are left of it.
    private _hasPendingAvatarLoad: boolean = false;

    // AS3: .../groupforums/MessageListItemView.as::MessageListItemView()
    constructor(template: IWindowContainer, view: GroupForumView)
    {
        this.bind(view);

        this._window = template.clone() as IWindowContainer;
        this._headerLineContainer = this._window.findChildByName('texts_container') as IWindowContainer | null;
        this._date = this._headerLineContainer?.findChildByName('date') as ITextWindow | null ?? null;
        this._replyNum = this._headerLineContainer?.findChildByName('reply_num') as ITextWindow | null ?? null;
        this._msgContainer = this._window.findChildByName('msg_container') as IWindowContainer | null;
        this._messageArea = this._window.findChildByName('message_text_container') as IWindowContainer | null;
        this._avatarImage = this._window.findChildByName('avatar_image') as IWindowContainer | null;
        this._avatarWidget = (this._avatarImage?.findChildByName('avatar_widget') as IWidgetWindow | null)?.widget as IAvatarImageWidget | null ?? null;
        this._author = this._avatarImage?.findChildByName('author') as ITextWindow | null ?? null;
        this._authorPostCount = this._avatarImage?.findChildByName('author_post_count') as ITextWindow | null ?? null;
        this._deleteButton = this._window.findChildByName('delete_message') as IRegionWindow | null;
        this._deleteButtonIcon = this._deleteButton?.getChildByName('icon') as IStaticBitmapWrapperWindow | null ?? null;
        this._reportButton = this._window.findChildByName('report_message') as IRegionWindow | null;
        this._replyButton = this._window.findChildByName('reply_message') as IRegionWindow | null;
        this._messageTextTemplate = this._messageArea?.findChildByName('message_text') as ITextWindow | null ?? null;

        if(this._messageTextTemplate !== null) this._messageArea?.removeChild(this._messageTextTemplate);

        this._textBlockPool = [];
        this._activeTextBlocks = [];

        this._avatarImage?.addEventListener('WME_CLICK', this.onSelectAuthor);
        this._deleteButton?.addEventListener('WME_CLICK', this.onDeleteOrUndelete);
        this._reportButton?.addEventListener('WME_CLICK', this.onReport);
        this._replyButton?.addEventListener('WME_CLICK', this.onReply);
    }

    // AS3: .../groupforums/MessageListItemView.as::bind()
    bind(view: GroupForumView): void
    {
        this._view = view;
        this._controller = this._view.controller;
    }

    /**
     * An unread post is coloured as if it had a moderation state of its own — the `isUnread` flag
     * *replaces* the real state for colouring and for the text pass, which is why a hidden post you
     * have not read is drawn as unread rather than as hidden. AS3's own precedence, and it only
     * matters for the fraction of a second before the page is marked read.
     */
    // AS3: .../groupforums/MessageListItemView.as::initialize()
    initialize(forum: ForumPermissions, thread: ForumThread, message: ForumMessage, isUnread: boolean = false): void
    {
        this._forum = forum;
        this._thread = thread;
        this._message = message;

        const localization = this._controller?.localizationManager;

        if(this._window !== null) this._window.name = 'message_' + message.messageId;

        if(this._headerLineContainer !== null) this._headerLineContainer.id = message.messageId;

        if(this._date !== null) this._date.caption = this._view?.getAsDaysHoursMinutes(message.creationTimeAsSecondsAgo) ?? '';

        if(this._replyNum !== null) this._replyNum.caption = '#' + (message.messageIndex + 1);

        const state = isUnread ? MessageListView.UNREAD_MESSAGE_STATUS : message.state;

        this.updateMessageText(state);

        const colors = MessageListView.getMessageColorForState(state);

        if(this._msgContainer !== null) this._msgContainer.color = colors[0];

        if(this._avatarImage !== null)
        {
            this._avatarImage.color = colors[1];
            this._avatarImage.id = message.authorId;
        }

        this.updateAvatar();

        if(this._author !== null) this._author.caption = message.authorName;

        if(this._authorPostCount !== null)
        {
            this._authorPostCount.caption = message.authorPostCount + ' ' + (localization?.getLocalization('messageboard.messages', 'posts') ?? '');
        }

        this.handleButtonVisibility(state);
    }

    /**
     * A removed post shows why it was removed instead of what it said. The two branches differ in
     * who is exempt: a staff removal is only readable by staff, a group-admin removal by anyone who
     * can moderate the forum.
     */
    // AS3: .../groupforums/MessageListItemView.as::updateMessageText()
    private updateMessageText(state: number): void
    {
        this.recycleTextBlocks();

        if(this._forum === null || this._message === null) return;

        if(state === ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD && !this._forum.isStaff)
        {
            this.addPlainTextBlock(MessageListView.getModerationMessage(this._controller, this._message));
        }
        else if(state > ForumModerationState.RESTORED_BY_ADMIN && !this._forum.canModerate)
        {
            this.addPlainTextBlock(MessageListView.getModerationMessage(this._controller, this._message));
        }
        else
        {
            this.initMessageText(this._message.messageText);
        }
    }

    /**
     * Unlike the thread row, the hide button here is gated on `canModerate` alone — staff who are
     * not moderators of this forum do not get it, and the `isStaff` test only decides whether a
     * staff removal can be undone.
     */
    // AS3: .../groupforums/MessageListItemView.as::handleButtonVisibility()
    private handleButtonVisibility(state: number): void
    {
        if(this._forum === null) return;

        const canModerate = this._forum.canModerate;
        const isStaff = this._forum.isStaff;

        if(this._deleteButton !== null)
        {
            this._deleteButton.visible = true;
            this._deleteButton.enable();
        }

        if(this._deleteButtonIcon !== null) this._deleteButtonIcon.assetUri = 'forum_forum_hide';

        if(canModerate)
        {
            switch(state)
            {
                case ForumModerationState.HIDDEN_BY_ADMIN:
                    if(this._deleteButtonIcon !== null) this._deleteButtonIcon.assetUri = 'forum_forum_unhide';

                    break;
                case ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD:
                    if(isStaff)
                    {
                        if(this._deleteButtonIcon !== null) this._deleteButtonIcon.assetUri = 'forum_forum_unhide';

                        break;
                    }

                    if(this._deleteButton !== null)
                    {
                        this._deleteButton.visible = false;
                        this._deleteButton.disable();
                    }
            }
        }
        else if(this._deleteButton !== null)
        {
            this._deleteButton.visible = false;
            this._deleteButton.disable();
        }

        if(this._reportButton !== null)
        {
            this._reportButton.visible = this._forum.canReport;

            if(this._reportButton.visible)
            {
                this._reportButton.enable();
            }
            else
            {
                this._reportButton.disable();
            }
        }

        if(this._replyButton !== null)
        {
            this._replyButton.visible = this._forum.canPostMessage;

            if(this._replyButton.visible)
            {
                this._replyButton.enable();
            }
            else
            {
                this._replyButton.disable();
            }
        }
    }

    // AS3: .../groupforums/MessageListItemView.as::addPlainTextBlock()
    // `text`, not `htmlText` — a moderation notice carries a name and must not be parsed as markup.
    private addPlainTextBlock(text: string | null): void
    {
        const block = this.claimTextBlock();

        if(block !== null) block.text = text === null ? '' : text;
    }

    // AS3: .../groupforums/MessageListItemView.as::updateAvatar()
    private updateAvatar(): void
    {
        this._figure = this._message?.authorFigure ?? null;

        if(this._avatarWidget !== null) this._avatarWidget.figure = this._figure ?? '';
    }

    /**
     * Splits the post into blocks by quote level.
     *
     * Lines accumulate into one buffer while the level does not change, separated by `\r`; the
     * moment it changes, the buffer is flushed into a block at the *previous* level and started
     * again. Only one level of quoting exists — the pattern matches a single leading `>`.
     */
    // AS3: .../groupforums/MessageListItemView.as::initMessageText()
    private initMessageText(text: string): void
    {
        const lines = text.split('\r');
        const buffer = new StringBuffer();
        let currentQuoteLevel = 0;

        for(const rawLine of lines)
        {
            let line = rawLine;
            let quoteLevel = 0;
            const match = MessageListView.QUOTE_PATTERN.exec(line);

            if(match !== null)
            {
                quoteLevel = 1;
                line = line.substr(match[0].length);
            }

            if(quoteLevel !== currentQuoteLevel)
            {
                this.addTextBlock(buffer, currentQuoteLevel);
                currentQuoteLevel = quoteLevel;
            }
            else if(buffer.length > 0)
            {
                buffer.add('\r');
            }

            this.parseMessageChunk(buffer, line);
        }

        this.addTextBlock(buffer, currentQuoteLevel);
    }

    /**
     * The inline pass, run against a string that shrinks as it goes rather than an index that
     * advances — which is why `LINE_PATTERN` must not be global.
     *
     * `*bold*` and `_italic_` recurse, so they nest. `@mention` only counts at the start of a word;
     * mid-word it emits a bare `@` and carries on, which is what stops an email address from
     * becoming a link. The default branch is the backslash escape: it copies the character *after*
     * the backslash through unescaped and skips both.
     */
    // AS3: .../groupforums/MessageListItemView.as::parseMessageChunk()
    private parseMessageChunk(buffer: StringBuffer, text: string): void
    {
        let remaining = text;

        for(;;)
        {
            const match = MessageListView.LINE_PATTERN.exec(remaining);

            if(!match)
            {
                break;
            }

            const index = match.index;

            if(index > 0)
            {
                buffer.addEscaped(remaining.substr(0, index));
            }

            const length = match[0].length;
            let consumed = true;

            switch(remaining.charAt(index))
            {
                case '*':
                    buffer.add(' <b>');
                    this.parseMessageChunk(buffer, remaining.substr(index + 1, length - 2));
                    buffer.add('</b> ');
                    break;
                case '_':
                    buffer.add(' <i>');
                    this.parseMessageChunk(buffer, remaining.substr(index + 1, length - 2));
                    buffer.add('</i> ');
                    break;
                case '@':
                    if(index === 0 || (index > 0 && remaining.substr(index - 1, 1) === ' '))
                    {
                        buffer.add('<u>').addEscaped(remaining.substr(index + 1, length - 1)).add('</u>');
                        break;
                    }

                    buffer.add('@');
                    remaining = remaining.substr(index + 1);
                    consumed = false;
                    break;
                default:
                    buffer.add(remaining.charAt(index + 1));
                    remaining = remaining.substr(index + 2);
                    consumed = false;
            }

            if(consumed)
            {
                remaining = remaining.substr(index + length);
            }
        }

        buffer.addEscaped(remaining);
    }

    /**
     * Flushes the buffer into one text field, indented and given the quote background when the
     * level is non-zero. The width shrinks by one indent *more* than the x moves, so a quote is
     * inset on both sides.
     */
    // AS3: .../groupforums/MessageListItemView.as::addTextBlock()
    private addTextBlock(buffer: StringBuffer, quoteLevel: number): void
    {
        const html = buffer.toString();
        const block = this.claimTextBlock();

        if(block !== null)
        {
            block.htmlText = html;

            if(quoteLevel > 0 && this._messageTextTemplate !== null)
            {
                block.x = this._messageTextTemplate.x + quoteLevel * MessageListView.QUOTE_INDENT;
                block.width = this._messageTextTemplate.width - (quoteLevel + 1) * MessageListView.QUOTE_INDENT;
                block.color = MessageListView.QUOTE_BG_COLOR;
                block.background = true;
            }
        }

        buffer.reset();
    }

    // AS3: .../groupforums/MessageListItemView.as::claimTextBlock()
    // Every claimed block is reset to the template's geometry first, because the last post that
    // used it may have left it indented as a quote.
    private claimTextBlock(): ITextWindow | null
    {
        if(this._messageTextTemplate === null) return null;

        const block = this._textBlockPool.length > 0
            ? this._textBlockPool.pop() as ITextWindow
            : this._messageTextTemplate.clone() as ITextWindow;

        block.x = this._messageTextTemplate.x;
        block.y = this._messageTextTemplate.y;
        block.width = this._messageTextTemplate.width;
        block.height = this._messageTextTemplate.height;
        block.color = this._messageTextTemplate.color;
        block.background = this._messageTextTemplate.background;
        block.text = '';

        this._messageArea?.addChild(block);
        this._activeTextBlocks.push(block);

        return block;
    }

    // AS3: .../groupforums/MessageListItemView.as::recycleTextBlocks()
    private recycleTextBlocks(): void
    {
        for(const block of this._activeTextBlocks)
        {
            if(block.parent !== null)
            {
                (block.parent as IWindowContainer).removeChild(block);
            }

            if(this._messageTextTemplate !== null)
            {
                block.x = this._messageTextTemplate.x;
                block.y = this._messageTextTemplate.y;
                block.width = this._messageTextTemplate.width;
                block.height = this._messageTextTemplate.height;
                block.color = this._messageTextTemplate.color;
                block.background = this._messageTextTemplate.background;
            }

            block.text = '';
            this._textBlockPool.push(block);
        }

        this._activeTextBlocks.length = 0;
    }

    // AS3: .../groupforums/MessageListItemView.as::onReport()
    private onReport = (_event: WindowMouseEvent): void =>
    {
        if(this._message !== null && this._forum !== null && this._thread !== null)
        {
            this._controller?.reportMessage(this._forum, this._thread.threadId, this._message.messageId);
        }
    };

    // AS3: .../groupforums/MessageListItemView.as::onDeleteOrUndelete()
    private onDeleteOrUndelete = (_event: WindowMouseEvent): void =>
    {
        if(this._message === null || this._forum === null || this._thread === null)
        {
            return;
        }

        if(this._message.state === ForumModerationState.HIDDEN_BY_ADMIN
            || (this._message.state === ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD && this._forum.isStaff))
        {
            this._controller?.unDeleteMessage(this._forum, this._thread.threadId, this._message.messageId);
        }
        else
        {
            this._controller?.deleteMessage(this._forum, this._thread.threadId, this._message.messageId);
        }
    };

    // AS3: .../groupforums/MessageListItemView.as::onSelectAuthor()
    private onSelectAuthor = (_event: WindowMouseEvent): void =>
    {
        if(this._message !== null)
        {
            this._controller?.getUserInfo(this._message.authorId);
        }
    };

    // AS3: .../groupforums/MessageListItemView.as::onReply()
    // Replying carries the post being replied to, which is how the compose window can quote it.
    private onReply = (_event: WindowMouseEvent): void =>
    {
        if(this._message !== null)
        {
            this._view?.openComposeMessageView(this._thread, this._message);
        }
    };

    // AS3: .../groupforums/MessageListItemView.as::recycle()
    recycle(): void
    {
        this.recycleTextBlocks();

        this._forum = null;
        this._thread = null;
        this._message = null;
        this._figure = null;
        this._hasPendingAvatarLoad = false;

        if(this._window !== null) this._window.name = '';

        if(this._headerLineContainer !== null) this._headerLineContainer.id = 0;

        if(this._date !== null) this._date.caption = '';

        if(this._replyNum !== null) this._replyNum.caption = '';

        if(this._author !== null) this._author.caption = '';

        if(this._authorPostCount !== null) this._authorPostCount.caption = '';

        for(const button of [this._deleteButton, this._reportButton, this._replyButton])
        {
            if(button !== null)
            {
                button.visible = true;
                button.enable();
            }
        }
    }

    // AS3: .../groupforums/MessageListItemView.as::get messageId()
    // AS3 reads `_message?.messageId` into an `int`, so a recycled row reports 0 rather than
    // failing a lookup — which is what keeps `updateElement()` from matching an empty row.
    get messageId(): number
    {
        return this._message?.messageId ?? 0;
    }

    // AS3: .../groupforums/MessageListItemView.as::get hasPendingAvatarLoad()
    get hasPendingAvatarLoad(): boolean
    {
        return this._hasPendingAvatarLoad;
    }

    // AS3: .../groupforums/MessageListItemView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../groupforums/MessageListItemView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../groupforums/MessageListItemView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        // The pooled blocks are disposed by hand: they were cloned off the template and added to
        // the message area, so disposing the row's window would not reach the ones sitting in the
        // pool detached.
        this.recycleTextBlocks();

        for(const block of this._textBlockPool)
        {
            block.dispose();
        }

        this._textBlockPool = [];
        this._messageTextTemplate?.dispose();
        this._messageTextTemplate = null;
        this._avatarImage?.removeEventListener('WME_CLICK', this.onSelectAuthor);
        this._deleteButton?.removeEventListener('WME_CLICK', this.onDeleteOrUndelete);
        this._reportButton?.removeEventListener('WME_CLICK', this.onReport);
        this._replyButton?.removeEventListener('WME_CLICK', this.onReply);
        this._window?.dispose();
        this._window = null;
        this._activeTextBlocks = [];
        this._replyButton = null;
        this._reportButton = null;
        this._deleteButtonIcon = null;
        this._deleteButton = null;
        this._authorPostCount = null;
        this._author = null;
        this._avatarWidget = null;
        this._avatarImage = null;
        this._messageArea = null;
        this._msgContainer = null;
        this._replyNum = null;
        this._date = null;
        this._headerLineContainer = null;
        this._message = null;
        this._thread = null;
        this._forum = null;
        this._figure = null;
        this._hasPendingAvatarLoad = false;
        this._controller = null;
        this._view = null;
        this._disposed = true;
    }
}
