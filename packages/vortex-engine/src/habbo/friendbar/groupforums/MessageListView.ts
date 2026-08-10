import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IDisposable} from '@core/runtime';
import type {ForumPermissions} from '@habbo/communication/messages/parser/groupforums/ForumPermissions';
import type {ForumThread} from '@habbo/communication/messages/parser/groupforums/ForumThread';
import type {ForumMessage} from '@habbo/communication/messages/parser/groupforums/ForumMessage';
import {ForumModerationState} from './ForumModerationState';
import type {GroupForumController} from './GroupForumController';
import type {GroupForumView} from './GroupForumView';
import type {MessagesListData} from './MessagesListData';
import {MessageListItemView} from './MessageListItemView';

/**
 * One thread's posts.
 *
 * Unlike the other two lists these rows are not a fixed height — a post is as tall as its text —
 * so this class also owns the layout pass. `updateItemSizesInternal()` walks each row's text
 * blocks, stacks them, and sizes the row to the total; `autoArrangeItems` is switched off around
 * the whole thing so the list does not re-flow between every single row.
 *
 * `updateItemSizes()` then runs that pass **twice** when the first pass changed the scrollable
 * width — which it does exactly when growing the rows pushes the list past its height and a
 * scrollbar appears, narrowing everything by its width.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/MessageListView.as
 */
export class MessageListView implements IDisposable
{
    // AS3: .../groupforums/MessageListView.as::ITEM_POOL_MAX_SIZE
    private static readonly ITEM_POOL_MAX_SIZE: number = 20;

    /**
     * AS3 declares this and never reads it in any body either tree preserves — the avatar
     * throttling it paced is gone, but `MessageListItemView.hasPendingAvatarLoad` survives beside
     * it, still reporting the flag nothing sets. Kept so the pair stays visible together.
     */
    // AS3: .../groupforums/MessageListView.as::AVATAR_LOAD_INTERVAL_MS
    private static readonly AVATAR_LOAD_INTERVAL_MS: number = 100;

    /**
     * A private `2` that the decompiler inlined at all of its uses; the candidates in
     * `updateItemSizesInternal()` are the row's border (`width - 2`) and the first text block's top
     * offset. **The name is derived** and the use site is not recoverable from either tree, so the
     * literals below are left as literals rather than guessing which one this named.
     */
    // AS3: .../groupforums/MessageListView.as::_SafeStr_11328
    private static readonly ITEM_PADDING: number = 2;

    /**
     * The pseudo-state a post takes when it is *new to you* — not a real `ForumModerationState`,
     * just a fourth key into the colour table, which is why it is -1 and not 2.
     */
    // AS3: .../groupforums/MessageListView.as::UNREAD_MESSAGE_STATUS
    public static readonly UNREAD_MESSAGE_STATUS: number = -1;

    /**
     * How far one quote level indents a text block, in pixels. **Name derived**: the constant is
     * inlined at its two uses in `MessageListItemView.addTextBlock()`, which is the only place a
     * 20 appears in this pair of classes that is not a page size.
     */
    // AS3: .../groupforums/MessageListView.as::_SafeStr_10475
    public static readonly QUOTE_INDENT: number = 20;

    // AS3: .../groupforums/MessageListView.as::QUOTE_BG_COLOR
    public static readonly QUOTE_BG_COLOR: number = 4291611852;

    /**
     * The inline-markup scanner: `*bold*`, `_italic_`, `@mention`, or a backslash escape. It is
     * deliberately not global — `parseMessageChunk()` re-`exec`s it against a shrinking string
     * rather than walking `lastIndex`, and a global regex would carry state between rows.
     */
    // AS3: .../groupforums/MessageListView.as::LINE_PATTERN
    public static readonly LINE_PATTERN: RegExp = /\\?(?:(?:\*([^*]+)\*)|(?:_([^_]+)_)|(?:@\S+))/;

    /**
     * A quoted line: a leading `>` plus at most one space. **Name derived** from its only use, the
     * quote-level test in `MessageListItemView.initMessageText()`.
     */
    // AS3: .../groupforums/MessageListView.as::_SafeStr_8609
    public static readonly QUOTE_PATTERN: RegExp = /^>(?: ?|$)/;

    // AS3: .../groupforums/MessageListView.as::ITEM_POOL
    private static readonly ITEM_POOL: MessageListItemView[] = [];

    // AS3: .../groupforums/MessageListView.as::_SafeStr_4593
    private _controller: GroupForumController | null;

    // AS3: .../groupforums/MessageListView.as::_SafeStr_4684
    private _view: GroupForumView | null;

    // AS3: .../groupforums/MessageListView.as::_SafeStr_4652
    // **Name derived**, as in the other two list views, and likewise for the two below.
    private _list: IScrollableListWindow | null;

    // AS3: .../groupforums/MessageListView.as::_SafeStr_6621
    private _itemTemplate: IWindowContainer | null;

    // AS3: .../groupforums/MessageListView.as::_SafeStr_4805
    private _items: MessageListItemView[];

    // AS3: .../groupforums/MessageListView.as::_SafeStr_4633
    private _forum: ForumPermissions | null;

    // AS3: .../groupforums/MessageListView.as::_SafeStr_5759
    // **Name derived**: the thread these posts belong to.
    private _thread: ForumThread | null;

    // AS3: .../groupforums/MessageListView.as::_SafeStr_6135
    private _messagesListData: MessagesListData | null;

    // AS3: .../groupforums/MessageListView.as::_SafeStr_8077
    // **Name derived**: true while `update()` is adding rows, which is what makes the sizing pass a
    // no-op until the whole page is in place. It starts true, so a resize arriving before the first
    // `update()` is ignored too.
    private _isBuilding: boolean = true;

    // AS3: .../groupforums/MessageListView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../groupforums/MessageListView.as::MessageListView()
    constructor(view: GroupForumView, list: IScrollableListWindow | null, forum: ForumPermissions, thread: ForumThread, messages: MessagesListData)
    {
        this._view = view;
        this._controller = this._view.controller;
        this._list = list;
        this._itemTemplate = this._controller?.windowManager?.buildWidgetLayout('groupforum_message_list_item_xml') as IWindowContainer | null ?? null;
        this._items = [];
        this._forum = forum;
        this._thread = thread;
        this._messagesListData = messages;
    }

    /**
     * Row background and avatar-strip background, in that order. A post you have not read yet gets
     * its own pair, which is why the unread pseudo-state shares this table with the real ones.
     */
    // AS3: .../groupforums/MessageListView.as::getMessageColor()
    private static getMessageColor(state: number): number[]
    {
        switch(state)
        {
            case ForumModerationState.HIDDEN_BY_ADMIN:
                return [4293519840, 4292335567];
            case ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD:
                return [4294952634, 4294959058];
            case MessageListView.UNREAD_MESSAGE_STATUS:
                return [4294964441, 4291227641];
            case ForumModerationState.DEFAULT_STATE:
            case ForumModerationState.RESTORED_BY_ADMIN:
            default:
                return [4294967295, 4291227641];
        }
    }

    // AS3: .../groupforums/MessageListView.as::getModerationMessage()
    static getModerationMessage(controller: GroupForumController | null, message: ForumMessage): string | null
    {
        const localization = controller?.localizationManager;

        switch(message.state)
        {
            case ForumModerationState.HIDDEN_BY_ADMIN:
                return localization?.getLocalizationWithParams('groupforum.view.message_hidden_by_admin', '', 'admin_name', message.adminName) ?? null;
            case ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD:
                return localization?.getLocalizationWithParams('groupforum.view.message_hidden_by_staff', '', 'admin_name', message.adminName) ?? null;
            default:
                return null;
        }
    }

    // AS3: .../groupforums/MessageListView.as::getMessageColorForState()
    // The public face of the private table above — `MessageListItemView` is the only caller.
    static getMessageColorForState(state: number): number[]
    {
        return MessageListView.getMessageColor(state);
    }

    /**
     * Whether a post counts as unread is decided here rather than by the server: it is any post
     * past the index the controller remembers for this thread.
     */
    // AS3: .../groupforums/MessageListView.as::update()
    update(): void
    {
        this.clear();
        this._list?.invalidate();

        if(this._messagesListData === null || this._forum === null || this._thread === null) return;

        const lastReadIndex = this._controller?.getThreadLastReadMessageIndex(this._messagesListData.threadId) ?? -1;

        this._isBuilding = true;

        if(this._list !== null) this._list.autoArrangeItems = false;

        for(const message of this._messagesListData.messages)
        {
            const isUnread = message.messageIndex > lastReadIndex;
            const item = this.claimView();

            if(item === null) continue;

            item.initialize(this._forum, this._thread, message, isUnread);
            this._items.push(item);

            const window = item.window;

            if(window !== null) this._list?.addListItem(window);
        }

        this._isBuilding = false;
        this.updateItemSizes();
    }

    // AS3: .../groupforums/MessageListView.as::updateItemSizes()
    // The second pass is not belt-and-braces: growing the rows can bring in a scrollbar, and the
    // width it takes changes every row's wrap point.
    updateItemSizes(): void
    {
        if(this._isBuilding)
        {
            return;
        }

        if(this._list === null) return;

        const widthBefore = this._list.scrollableWindow.width;

        this.updateItemSizesInternal();

        if(this._list.scrollableWindow.width !== widthBefore)
        {
            this.updateItemSizesInternal();
        }
    }

    /**
     * Stacks each row's text blocks and sizes the row to the result. `autoArrangeItems` goes off
     * for the whole walk and back on at the end — the list re-flows once, not once per row.
     */
    // AS3: .../groupforums/MessageListView.as::updateItemSizesInternal()
    private updateItemSizesInternal(): void
    {
        if(this._list === null) return;

        this._list.autoArrangeItems = false;

        for(let i = 0; i < this._list.numListItems; i++)
        {
            const window = this._items[i]?.window ?? null;

            if(window === null) continue;

            const textsContainer = window.findChildByName('texts_container') as IWindowContainer | null;
            const messageContainer = window.findChildByName('message_text_container') as IWindowContainer | null;

            window.width = this._list.scrollableWindow.width - 2;

            if(messageContainer === null) continue;

            let bottom = 2;

            for(let j = 0; j < messageContainer.numChildren; j++)
            {
                const block = messageContainer.getChildAt(j) as ITextWindow | null;

                if(block === null) continue;

                block.y = bottom;
                bottom = Math.trunc(block.bottom);
            }

            messageContainer.height = bottom;
            window.height = (textsContainer?.height ?? 0) + messageContainer.bottom;
        }

        this._list.autoArrangeItems = true;
    }

    // AS3: .../groupforums/MessageListView.as::clear()
    private clear(): void
    {
        if(this._list !== null && this._list.numListItems > 0)
        {
            this._list.removeListItems();
        }

        for(const item of this._items)
        {
            MessageListView.recycleView(item);
        }

        this._items.length = 0;
    }

    // AS3: .../groupforums/MessageListView.as::updateElement()
    // Re-filling one post can change its height, so this re-runs the sizing pass — unlike the
    // thread list, where a row is a fixed height and `updateElement()` is enough on its own.
    updateElement(message: ForumMessage): void
    {
        if(this._forum === null || this._thread === null) return;

        for(const item of this._items)
        {
            if(item.messageId === message.messageId)
            {
                item.initialize(this._forum, this._thread, message);
                this.updateItemSizes();

                return;
            }
        }
    }

    /**
     * Two lookups in one, chosen by the flag: by message **id** normally, by 1-based **position on
     * the page** when `byIndex` is set. The deep-link path uses the second, because what it has is
     * an index within the thread reduced to an offset in the page.
     */
    // AS3: .../groupforums/MessageListView.as::scrollToSpecificElement()
    scrollToSpecificElement(target: number, byIndex: boolean = false): void
    {
        let window: IWindowContainer | null = null;

        if(!byIndex)
        {
            for(const item of this._items)
            {
                if(item.messageId === target)
                {
                    window = item.window;

                    break;
                }
            }
        }
        else if(target > 0 && target <= this._items.length)
        {
            window = this._items[target - 1].window;
        }

        if(window !== null && this._list !== null)
        {
            this._list.scrollV = window.bottom / this._list.maxScrollV;
        }
    }

    // AS3: .../groupforums/MessageListView.as::claimView()
    private claimView(): MessageListItemView | null
    {
        let item: MessageListItemView | null = null;

        if(MessageListView.ITEM_POOL.length > 0)
        {
            item = MessageListView.ITEM_POOL.pop() ?? null;
        }
        else if(this._itemTemplate !== null && this._view !== null)
        {
            item = new MessageListItemView(this._itemTemplate, this._view);
        }

        if(item !== null && this._view !== null) item.bind(this._view);

        return item;
    }

    // AS3: .../groupforums/MessageListView.as::recycleView()
    private static recycleView(item: MessageListItemView): void
    {
        if(MessageListView.ITEM_POOL.length < MessageListView.ITEM_POOL_MAX_SIZE)
        {
            item.recycle();
            MessageListView.ITEM_POOL.push(item);
        }
        else
        {
            item.dispose();
        }
    }

    // AS3: .../groupforums/MessageListView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../groupforums/MessageListView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.clear();

        if(this._itemTemplate !== null)
        {
            this._itemTemplate.dispose();
            this._itemTemplate = null;
        }

        this._items = [];
        this._messagesListData = null;
        this._thread = null;
        this._forum = null;
        this._list = null;
        this._controller = null;
        this._view = null;
        this._disposed = true;
    }
}
