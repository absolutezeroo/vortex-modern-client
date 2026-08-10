import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ILabelWindow} from '@core/window/components/ILabelWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import type {ForumData} from '@habbo/communication/messages/parser/groupforums/ForumData';
import type {ForumPermissions} from '@habbo/communication/messages/parser/groupforums/ForumPermissions';
import type {ForumThread} from '@habbo/communication/messages/parser/groupforums/ForumThread';
import type {ForumMessage} from '@habbo/communication/messages/parser/groupforums/ForumMessage';
import type {GroupForumController} from './GroupForumController';
import type {ForumsListData} from './ForumsListData';
import {ThreadsListData} from './ThreadsListData';
import type {MessagesListData} from './MessagesListData';
import {ForumsListView} from './ForumsListView';
import {ThreadListView} from './ThreadListView';
import {MessageListView} from './MessageListView';
import {ComposeMessageView} from './ComposeMessageView';
import {ForumSettingsView} from './ForumSettingsView';

/**
 * The forums' one and only window. It shows exactly one of three lists — forums, threads, posts —
 * and switching between them does not build a new window: `resetWindow()` tears down the list
 * views and reuses the frame, so the paging controls, the header and the top area keep their
 * identity across all three.
 *
 * That reuse is why so much of the class is `initCommonControls()`: the back and post buttons mean
 * something different in each mode ("mark read" vs "back", "start thread" vs "reply"), and their
 * meaning is decided by which of the three list views happens to be non-null, in that order.
 *
 * The window is not owned by the controller in the usual sense — `dispose()` calls back into
 * `closeMainView()` to let the controller drop its reference, rather than the controller disposing
 * this.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/GroupForumView.as
 */
export class GroupForumView
{
    /**
     * AS3 declares this constant and then inlines it: both trees emit two bare `100`s in
     * `resetWindow()` — the window's `y` and the `WE_RESIZED` listener priority — and neither says
     * which one it named. **The name is derived**; the value is not in doubt.
     */
    // AS3: .../groupforums/GroupForumView.as::_SafeStr_10809
    private static readonly WINDOW_TOP: number = 100;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_4593
    private _controller: GroupForumController | null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_5333
    // **Names derived** from their types, here and for the two below.
    private _forumsListView: ForumsListView | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_5085
    private _threadListView: ThreadListView | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_4980
    private _messageListView: MessageListView | null = null;

    // AS3: .../groupforums/GroupForumView.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_5946
    // **Name derived** from the child it holds, `scrollable_message_list`.
    private _scrollableList: IScrollableListWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_8476
    // **Names derived** from the layout children they are looked up by, here and for the next three.
    private _showPreviousButton: IWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_8615
    private _showNextButton: IWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_8567
    private _showFirstButton: IWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_8783
    private _showLastButton: IWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_txtElement
    private _txtElement: IWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_6197
    // **Name derived** from `back_button`.
    private _backButton: IWindowContainer | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_5379
    // **Name derived** from `post_button`.
    private _postButton: IWindowContainer | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_8948
    // **Name derived**: the frame's own close button, found by tag rather than by name.
    private _closeButton: IWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_7999
    // **Name derived** from `list_header`.
    private _listHeader: IWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_8628
    // **Name derived**: the "my forums" shortcut, the one row of the shortcut list that carries the
    // unread count.
    private _myForumsShortcut: ITextWindow | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_4954
    private _forumsListData: ForumsListData | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_4633
    // **Name derived**, as in the controller: the open forum's permissions record.
    private _forum: ForumPermissions | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_5145
    private _threadsListData: ThreadsListData | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_6135
    private _messagesListData: MessagesListData | null = null;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_4846
    // **Name derived**: the zero-based page currently displayed. It starts at 1, not 0, which the
    // first `resetWindow()` overwrites before anything reads it.
    private _currentPage: number = 1;

    // AS3: .../groupforums/GroupForumView.as::_numOfPages
    private _numOfPages: number = 1;

    // AS3: .../groupforums/GroupForumView.as::_SafeStr_8389
    // **Name derived**: the page size, set once in the constructor and never changed — the same 20
    // every forum request carries.
    private _itemsPerPage: number;

    // AS3: .../groupforums/GroupForumView.as::GroupForumView()
    constructor(controller: GroupForumController)
    {
        this._controller = controller;
        this._itemsPerPage = ThreadsListData.PAGE_SIZE;
    }

    // AS3: .../groupforums/GroupForumView.as::enable()
    private static enable(window: IWindow | null, enabled: boolean): void
    {
        if(window === null) return;

        if(enabled)
        {
            window.enable();
        }
        else
        {
            window.disable();
        }
    }

    /**
     * Paints the header strip for a single forum and hands back its click region.
     *
     * Static and shared because the thread list and the message list both show the same strip, and
     * because the forums *list* needs the opposite of it — that one inlines the same lookups to
     * swap the group badge for a list icon and disable the region.
     */
    // AS3: .../groupforums/GroupForumView.as::initTopAreaForForum()
    static initTopAreaForForum(window: IFrameWindow, forum: ForumData): IRegionWindow | null
    {
        const topPart = window.findChildByName('top_part') as IWindowContainer | null;

        if(topPart === null) return null;

        const groupIcon = topPart.findChildByName('group_icon') as IWidgetWindow | null;

        if(groupIcon !== null)
        {
            groupIcon.visible = true;

            const badge = groupIcon.widget as IBadgeImageWidget | null;

            if(badge !== null)
            {
                badge.badgeId = forum.icon;
                badge.groupId = forum.groupId;
                badge.type = 'group';
            }
        }

        const headerIcon = topPart.findChildByName('header_icon') as IStaticBitmapWrapperWindow | null;

        if(headerIcon !== null)
        {
            headerIcon.visible = false;
        }

        const headerText = topPart.findChildByName('top_header_text') as ITextWindow | null;

        if(headerText !== null)
        {
            headerText.text = forum.name;
        }

        const topText = topPart.findChildByName('top_text') as ITextWindow | null;

        if(topText !== null)
        {
            topText.text = forum.description;
        }

        return topPart.findChildByName('top_click_area') as IRegionWindow | null;
    }

    // AS3: .../groupforums/GroupForumView.as::dispose()
    dispose(): void
    {
        if(this._controller)
        {
            this._controller.closeMainView();
        }

        if(this._window !== null)
        {
            this.disposeListViews();
            // AS3 removes a `"click"` listener here, but every listener below was added as
            // `"WME_CLICK"` — the call matches nothing. Kept verbatim; the `dispose()` on the next
            // line is what actually detaches them.
            this._window.removeEventListener('click', this.onClickButton);
            this._window.dispose();
            this._window = null;
            this._scrollableList = null;
            this._controller = null;
        }
    }

    /**
     * The shared chrome, re-decided on every list change.
     *
     * The back button says "mark read" over a list and "back" over a thread; the post button says
     * "start thread" over a thread list and "reply" over a message list, and is hidden entirely
     * over the forums list. Which branch wins is decided by which list view is live, and the order
     * of the tests is AS3's — thread list first, message list second.
     */
    // AS3: .../groupforums/GroupForumView.as::initCommonControls()
    private initCommonControls(): void
    {
        if(this._window === null || this._controller === null) return;

        const localization = this._controller.localizationManager;
        const settingsButton = this._window.findChildByName('settings_button');

        if(settingsButton !== null)
        {
            if(this._forum !== null && this._forum.canChangeSettings)
            {
                settingsButton.removeEventListener('WME_CLICK', this.onSettingsButtonClick);
                settingsButton.addEventListener('WME_CLICK', this.onSettingsButtonClick);
                settingsButton.visible = true;
            }
            else
            {
                settingsButton.visible = false;
            }
        }

        const backLabel = this._backButton?.findChildByName('back_button_label') as ILabelWindow | null;

        if(this._backButton !== null)
        {
            if(this._threadListView !== null)
            {
                this._backButton.visible = true;

                if(backLabel) backLabel.text = localization?.getLocalization('groupforum.view.mark_read') ?? '';
            }
            else if(this._messageListView !== null)
            {
                this._backButton.visible = true;

                if(backLabel) backLabel.text = localization?.getLocalization('groupforum.view.back') ?? '';
            }
            else if(this._forumsListView !== null)
            {
                this._backButton.visible = true;

                if(backLabel) backLabel.text = localization?.getLocalization('groupforum.view.mark_read') ?? '';
            }
            else
            {
                this._backButton.visible = false;
            }
        }

        const postLabel = this._postButton?.findChildByName('post_button_label') as ILabelWindow | null;

        if(this._postButton !== null)
        {
            if(this._threadListView !== null)
            {
                this._postButton.visible = true;

                if(postLabel) postLabel.text = localization?.getLocalization('groupforum.view.start_thread') ?? '';
            }
            else if(this._messageListView !== null)
            {
                this._postButton.visible = true;

                if(postLabel) postLabel.text = localization?.getLocalization('groupforum.view.reply') ?? '';
            }
            else
            {
                this._postButton.visible = false;
            }
        }

        if(this._txtElement !== null)
        {
            this._txtElement.caption = (this._currentPage + 1) + ' / ' + this._numOfPages;
        }

        this._window.scaler.enable();
        this._window.scaler.visible = true;

        GroupForumView.enable(this._showFirstButton, this._currentPage > 0);
        GroupForumView.enable(this._showPreviousButton, this._currentPage > 0);
        GroupForumView.enable(this._showNextButton, this._currentPage < this._numOfPages - 1);
        GroupForumView.enable(this._showLastButton, this._currentPage < this._numOfPages - 1);

        this.updateUnreadForumsCount(this._controller.unreadForumsCount);
    }

    /**
     * Builds the frame the first time and only clears it afterwards. Everything the three modes
     * share is wired here once, which is why switching lists costs a scroll reset rather than a
     * rebuild.
     */
    // AS3: .../groupforums/GroupForumView.as::resetWindow()
    private resetWindow(): void
    {
        if(this._window !== null)
        {
            this.disposeListViews();

            if(this._scrollableList !== null)
            {
                this._scrollableList.scrollV = 0;
            }

            return;
        }

        this._window = this._controller?.windowManager?.buildWidgetLayout('groupforum_main_view_xml') as IFrameWindow | null;

        if(this._window === null) return;

        this._scrollableList = this._window.findChildByName('scrollable_message_list') as IScrollableListWindow | null;
        this._scrollableList?.scrollableWindow.addEventListener('WE_RESIZED', this.onResized, GroupForumView.WINDOW_TOP);
        this._window.center();
        this._window.y = GroupForumView.WINDOW_TOP;
        this._txtElement = this._window.findChildByName('page_info');
        this._showPreviousButton = this._window.findChildByName('show_previous');
        this._showPreviousButton?.addEventListener('WME_CLICK', this.onClickButton);
        this._showNextButton = this._window.findChildByName('show_next');
        this._showNextButton?.addEventListener('WME_CLICK', this.onClickButton);
        this._showLastButton = this._window.findChildByName('show_last');
        this._showLastButton?.addEventListener('WME_CLICK', this.onClickButton);
        this._showFirstButton = this._window.findChildByName('show_first');
        this._showFirstButton?.addEventListener('WME_CLICK', this.onClickButton);
        this._backButton = this._window.findChildByName('back_button') as IWindowContainer | null;
        this._backButton?.addEventListener('WME_CLICK', this.onClickButton);
        this._postButton = this._window.findChildByName('post_button') as IWindowContainer | null;
        this._postButton?.addEventListener('WME_CLICK', this.onClickButton);
        this._closeButton = this._window.findChildByTag('close');
        this._closeButton?.addEventListener('WME_CLICK', this.onClickButton);
        this._listHeader = this._window.findChildByName('list_header');
        this._myForumsShortcut = (this._window.findChildByName('shortcuts') as IItemListWindow | null)?.getListItemByName('my') as ITextWindow | null ?? null;
    }

    // AS3: .../groupforums/GroupForumView.as::disposeListViews()
    private disposeListViews(): void
    {
        if(this._forumsListView !== null)
        {
            this._forumsListView.dispose();
            this._forumsListView = null;
        }

        if(this._threadListView !== null)
        {
            this._threadListView.dispose();
            this._threadListView = null;
        }

        if(this._messageListView !== null)
        {
            this._messageListView.dispose();
            this._messageListView = null;
        }
    }

    /**
     * The status line under the list, which is where a refused action explains itself. The two
     * arguments are localization *fragments*: the operation name is looked up, then substituted
     * into the error the server named.
     */
    // AS3: .../groupforums/GroupForumView.as::setStatusTextError()
    private setStatusTextError(operation: string, error: string | null): void
    {
        const status = this._window?.findChildByName('status') as ITextWindow | null;

        if(status === null) return;

        if(error === null || error.length === 0)
        {
            status.caption = '';
        }
        else
        {
            const localization = this._controller?.localizationManager;
            const operationText = localization?.getLocalization('groupforum.view.error.operation_' + operation) ?? '';

            status.text = localization?.getLocalizationWithParams(
                'groupforum.view.error.' + error,
                '',
                'operation',
                operationText
            ) ?? '';
        }
    }

    // AS3: .../groupforums/GroupForumView.as::onSettingsButtonClick()
    private onSettingsButtonClick = (_event: WindowMouseEvent): void =>
    {
        this.openForumSettingsView();
    };

    // AS3: .../groupforums/GroupForumView.as::onTopAreaClick()
    private onTopAreaClick = (_event: WindowMouseEvent): void =>
    {
        if(this._forum !== null)
        {
            this._controller?.context.createLinkEvent('group/' + this._forum.groupId);
        }
    };

    /**
     * The forums list — the one mode with no single forum behind it, so the group badge is hidden,
     * the header takes a per-list-code icon (`forum_forum_list0/1/2`), and the top area's click
     * region is disabled rather than pointed at a group.
     */
    // AS3: .../groupforums/GroupForumView.as::openForumsList()
    openForumsList(data: ForumsListData): void
    {
        this.resetWindow();

        if(this._window === null) return;

        this._forumsListData = data;
        this._forum = null;
        this._threadsListData = null;
        this._messagesListData = null;
        this._numOfPages = this.calculateNumOfPagesAvailable(this._forumsListData.totalAmount);
        this._currentPage = Math.ceil(this._forumsListData.startIndex / ThreadsListData.PAGE_SIZE);

        const localization = this._controller?.localizationManager;

        this._forumsListView = new ForumsListView(this, this._scrollableList, this._forumsListData.forums);
        this._forumsListView.update();

        if(this._listHeader !== null)
        {
            this._listHeader.caption = localization?.getLocalization('groupforum.view.forums_list.' + this._forumsListData.listCode) ?? '';
        }

        const topPart = this._window.findChildByName('top_part') as IWindowContainer | null;

        if(topPart !== null)
        {
            const groupIcon = topPart.findChildByName('group_icon') as IWidgetWindow | null;

            if(groupIcon !== null) groupIcon.visible = false;

            const headerIcon = topPart.findChildByName('header_icon') as IStaticBitmapWrapperWindow | null;

            if(headerIcon !== null)
            {
                headerIcon.visible = true;
                headerIcon.assetUri = 'forum_forum_list' + this._forumsListData.listCode;
            }

            const headerText = topPart.findChildByName('top_header_text') as ITextWindow | null;

            if(headerText !== null)
            {
                headerText.text = localization?.getLocalization('groupforum.view.forums_header.' + this._forumsListData.listCode) ?? '';
            }

            const topText = topPart.findChildByName('top_text') as ITextWindow | null;

            if(topText !== null)
            {
                topText.text = localization?.getLocalization('groupforum.view.forums_description.' + this._forumsListData.listCode) ?? '';
            }

            const clickArea = topPart.findChildByName('top_click_area') as IRegionWindow | null;

            if(clickArea !== null)
            {
                clickArea.removeEventListener('WME_CLICK', this.onTopAreaClick);
                clickArea.disable();
            }
        }

        this.initCommonControls();

        const status = this._window.findChildByName('status') as ITextWindow | null;

        if(status !== null)
        {
            status.text = localization?.getLocalization('groupforum.view.forums_list.status') ?? '';
        }
    }

    // AS3: .../groupforums/GroupForumView.as::get isForumsListOpened()
    get isForumsListOpened(): boolean
    {
        return this._forumsListView !== null;
    }

    /**
     * The thread list. The post button is enabled only if the forum allows it, and when it does
     * not, the status line carries the server's own reason rather than a generic refusal.
     */
    // AS3: .../groupforums/GroupForumView.as::openThreadList()
    openThreadList(forumsList: ForumsListData | null, forum: ForumPermissions, threads: ThreadsListData): void
    {
        this.resetWindow();

        if(this._window === null) return;

        this._forumsListData = forumsList;
        this._forum = forum;
        this._threadsListData = threads;
        this._messagesListData = null;
        this._numOfPages = this.calculateNumOfPagesAvailable(this._threadsListData.totalThreads);
        this._currentPage = Math.ceil(this._threadsListData.startIndex / ThreadsListData.PAGE_SIZE);

        this._threadListView = new ThreadListView(this, this._scrollableList, this._forum, this._threadsListData);
        this._threadListView.update();

        if(this._listHeader !== null)
        {
            this._listHeader.caption = this._controller?.localizationManager?.getLocalization('groupforum.view.all_threads') ?? '';
        }

        if(this._forum.canPostThread)
        {
            this._postButton?.enable();
            this.setStatusTextError('post_thread', null);
        }
        else
        {
            this._postButton?.disable();
            this.setStatusTextError('post_thread', this._forum.postThreadPermissionError);
        }

        const clickArea = GroupForumView.initTopAreaForForum(this._window, this._forum);

        if(clickArea !== null)
        {
            clickArea.removeEventListener('WME_CLICK', this.onTopAreaClick);
            clickArea.addEventListener('WME_CLICK', this.onTopAreaClick);
            clickArea.enable();
        }

        this.initCommonControls();
    }

    // AS3: .../groupforums/GroupForumView.as::updateThread()
    updateThread(thread: ForumThread): void
    {
        if(this._threadListView !== null)
        {
            this._threadListView.updateElement(thread);
        }
    }

    // AS3: .../groupforums/GroupForumView.as::updateMessage()
    updateMessage(message: ForumMessage): void
    {
        if(this._messageListView !== null)
        {
            this._messageListView.updateElement(message);
        }
    }

    /**
     * The posts of one thread.
     *
     * Two gates decide whether the reply button works, and they say different things: no permission
     * at all gets `post_message`, permission but a locked thread gets `post_in_locked` — and a
     * moderator is exempt from the lock.
     *
     * The deep-link scroll happens here too, once the page is built, and consumes the controller's
     * pending target so a later page does not jump again.
     */
    // AS3: .../groupforums/GroupForumView.as::openMessagesList()
    openMessagesList(forumsList: ForumsListData | null, forum: ForumPermissions, threads: ThreadsListData, messages: MessagesListData): void
    {
        this.resetWindow();

        if(this._window === null || this._controller === null) return;

        this._forumsListData = forumsList;
        this._forum = forum;
        this._threadsListData = threads;
        this._messagesListData = messages;

        const threadId = messages.threadId;
        const thread = this._threadsListData.threadsById.get(threadId) ?? null;

        if(thread === null) return;

        this._numOfPages = this.calculateNumOfPagesAvailable(messages.totalMessages);
        this._currentPage = Math.ceil(messages.startIndex / ThreadsListData.PAGE_SIZE);

        if(this._listHeader !== null)
        {
            this._listHeader.caption = thread.header;
        }

        this._messageListView = new MessageListView(this, this._scrollableList, this._forum, thread, messages);
        this._messageListView.update();

        if(this._controller.getGoToMessageIndex() > 0 && this._controller.getGoToThreadId() === threadId)
        {
            this._messageListView.scrollToSpecificElement(this._controller.getGoToMessageIndex(), true);
            this._controller.resetGoTo();
        }

        if(this._forum.canPostMessage)
        {
            if(this._forum.canModerate || !thread.isLocked)
            {
                this._postButton?.enable();
                this.setStatusTextError('post_message', null);
            }
            else
            {
                this._postButton?.disable();
                this.setStatusTextError('post_in_locked', this._forum.moderatePermissionError);
            }
        }
        else
        {
            this._postButton?.disable();
            this.setStatusTextError('post_message', this._forum.postMessagePermissionError);
        }

        const clickArea = GroupForumView.initTopAreaForForum(this._window, this._forum);

        if(clickArea !== null)
        {
            clickArea.removeEventListener('WME_CLICK', this.onTopAreaClick);
            clickArea.addEventListener('WME_CLICK', this.onTopAreaClick);
            clickArea.enable();
        }

        this.initCommonControls();
    }

    // AS3: .../groupforums/GroupForumView.as::get controller()
    get controller(): GroupForumController | null
    {
        return this._controller;
    }

    // AS3: .../groupforums/GroupForumView.as::calculateNumOfPagesAvailable()
    private calculateNumOfPagesAvailable(totalItems: number): number
    {
        return Math.ceil(totalItems / this._itemsPerPage);
    }

    // AS3: .../groupforums/GroupForumView.as::getPreviousPageData()
    private getPreviousPageData(): void
    {
        const page = this._currentPage - 1;

        if(page >= 0)
        {
            this.requestNewPageData(page);
        }
    }

    // AS3: .../groupforums/GroupForumView.as::getNextPageData()
    // The bound is `<=`, not `<` — one past the last page. Nothing reaches it in practice, because
    // `initCommonControls()` disables the button at `_numOfPages - 1`.
    private getNextPageData(): void
    {
        const page = this._currentPage + 1;

        if(page <= this._numOfPages)
        {
            this.requestNewPageData(page);
        }
    }

    // AS3: .../groupforums/GroupForumView.as::getFirstPageData()
    private getFirstPageData(): void
    {
        if(this._currentPage === 0)
        {
            return;
        }

        this.requestNewPageData(0);
    }

    // AS3: .../groupforums/GroupForumView.as::getLastPageData()
    private getLastPageData(): void
    {
        if(this._currentPage >= this._numOfPages)
        {
            return;
        }

        this.requestNewPageData(this._numOfPages - 1);
    }

    /**
     * Asks the controller for a page of whichever list is open, and records the new page number
     * immediately — before the reply arrives. The reply overwrites it with the server's own start
     * index, so a refused page corrects itself on the next render.
     */
    // AS3: .../groupforums/GroupForumView.as::requestNewPageData()
    private requestNewPageData(page: number): void
    {
        const startIndex = page * this._itemsPerPage;

        if(this._forumsListView !== null && this._forumsListData !== null)
        {
            this._controller?.openForumsList(this._forumsListData.listCode, startIndex);
        }
        else if(this._threadListView !== null && this._forum !== null)
        {
            this._controller?.requestThreadList(this._forum.groupId, startIndex);
        }
        else if(this._messageListView !== null && this._forum !== null && this._messagesListData !== null)
        {
            this._controller?.requestThreadMessageList(this._forum.groupId, this._messagesListData.threadId, startIndex);
        }

        this._currentPage = page;
    }

    // AS3: .../groupforums/GroupForumView.as::getAsDaysHoursMinutes()
    getAsDaysHoursMinutes(seconds: number): string
    {
        return FriendlyTime.getFriendlyTime(this._controller?.localizationManager ?? null, seconds, '.ago', 1);
    }

    // AS3: .../groupforums/GroupForumView.as::onResized()
    private onResized = (_event: WindowEvent | null = null): void =>
    {
        if(this._forumsListView !== null)
        {
            this._forumsListView.updateItemWidths();
        }

        if(this._threadListView !== null)
        {
            this._threadListView.updateItemWidths();
        }

        if(this._messageListView !== null)
        {
            this._messageListView.updateItemSizes();
        }
    };

    /**
     * One handler for every button on the frame.
     *
     * The back button has three destinations depending on depth, and the deepest two are not
     * symmetrical: from the messages it returns to the thread list at the page it came from, but
     * from the thread list it *marks the forum read* first and only then goes back — and if there
     * is no forums list behind it (a deep link), it closes the window instead.
     */
    // AS3: .../groupforums/GroupForumView.as::onClickButton()
    private onClickButton = (event: WindowMouseEvent): void =>
    {
        switch(event.target?.name)
        {
            case 'back_button':
                if(this._messageListView !== null)
                {
                    if(this._forum !== null && this._threadsListData !== null)
                    {
                        this._controller?.requestThreadList(this._forum.groupId, this._threadsListData.startIndex);
                    }

                    break;
                }

                if(this._threadListView !== null)
                {
                    this._controller?.markForumAsRead(true);

                    if(this._forumsListData !== null)
                    {
                        this._controller?.openForumsList(this._forumsListData.listCode, this._forumsListData.startIndex);

                        break;
                    }

                    this.dispose();

                    break;
                }

                if(this._forumsListView !== null)
                {
                    this._controller?.markForumsAsRead();
                    this.dispose();
                }

                break;
            case 'show_previous':
                this.getPreviousPageData();
                break;
            case 'show_next':
                this.getNextPageData();
                break;
            case 'show_last':
                this.getLastPageData();
                break;
            case 'show_first':
                this.getFirstPageData();
                break;
            case 'header_button_close':
                if(this._window !== null) this._window.visible = false;

                this.dispose();
                break;
            case 'post_button':
                this.openComposeMessageView(
                    this._messagesListData !== null
                        ? this._threadsListData?.threadsById.get(this._messagesListData.threadId) ?? null
                        : null
                );
        }
    };

    /**
     * Reuses the compose window if one is already up rather than stacking a second: `focus()`
     * re-points it at the new thread. Both windows are owned by the *controller*, not by this view,
     * so they survive a list change.
     */
    // AS3: .../groupforums/GroupForumView.as::openComposeMessageView()
    openComposeMessageView(thread: ForumThread | null, message: ForumMessage | null = null): void
    {
        if(this._controller === null || this._window === null || this._forum === null) return;

        if(this._controller.composeMessageView !== null)
        {
            this._controller.composeMessageView.focus(this._forum, thread, message);
        }
        else
        {
            this._controller.composeMessageView = new ComposeMessageView(
                this,
                this._window.x + this._window.width,
                this._window.y,
                this._forum,
                thread,
                message
            );
        }
    }

    // AS3: .../groupforums/GroupForumView.as::openForumSettingsView()
    openForumSettingsView(): void
    {
        if(this._controller === null || this._window === null || this._forum === null) return;

        if(this._controller.forumSettingsView !== null)
        {
            this._controller.forumSettingsView.focus(this._forum);
        }
        else
        {
            this._controller.forumSettingsView = new ForumSettingsView(
                this,
                this._window.x + this._window.width,
                this._window.y,
                this._forum
            );
        }
    }

    // AS3: .../groupforums/GroupForumView.as::updateUnreadForumsCount()
    updateUnreadForumsCount(count: number): void
    {
        if(this._myForumsShortcut === null) return;

        const localization = this._controller?.localizationManager;

        if(count > 0)
        {
            this._myForumsShortcut.htmlText = localization?.getLocalizationWithParams(
                'groupforum.view.shortcuts.my.unread',
                '',
                'unread_count',
                String(count)
            ) ?? '';
        }
        else
        {
            this._myForumsShortcut.htmlText = localization?.getLocalization('groupforum.view.shortcuts.my', '') ?? '';
        }
    }
}
