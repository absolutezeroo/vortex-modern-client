import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IDisposable} from '@core/runtime';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {ForumData} from '@habbo/communication/messages/parser/groupforums/ForumData';
import type {GroupForumController} from './GroupForumController';
import type {GroupForumView} from './GroupForumView';

/**
 * One forum's row in the forums list.
 *
 * Built once from a cloned template and then refilled, which is what `initialize()` and
 * `recycle()` are for: the windows and their click listeners survive, only the text and the ids
 * change. `recycle()` deliberately leaves the badge widget alone — a pooled row is always
 * re-`initialize()`d before it is shown again, and clearing the badge would make it flicker.
 *
 * The group id is written onto four separate child windows as their `id`, not just kept in the
 * field: that is how the layout's own regions know which forum they belong to.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/ForumListItemView.as
 */
export class ForumListItemView implements IDisposable
{
    // AS3: .../groupforums/ForumListItemView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../groupforums/ForumListItemView.as::_SafeStr_4684
    private _view: GroupForumView | null = null;

    // AS3: .../groupforums/ForumListItemView.as::_SafeStr_4593
    private _controller: GroupForumController | null = null;

    // AS3: .../groupforums/ForumListItemView.as::_window
    private _window: IWindowContainer | null;

    // AS3: .../groupforums/ForumListItemView.as::_SafeStr_6770
    // **Name derived** from `texts_container`.
    private _textsContainer: IWindow | null;

    // AS3: .../groupforums/ForumListItemView.as::_header
    private _header: ITextWindow | null;

    // AS3: .../groupforums/ForumListItemView.as::_headerRegion
    private _headerRegion: IWindow | null;

    // AS3: .../groupforums/ForumListItemView.as::_details
    private _details: IWindow | null;

    // AS3: .../groupforums/ForumListItemView.as::_SafeStr_6601
    // **Name derived** from `unread_texts_container`.
    private _unreadTextsContainer: IWindow | null;

    // AS3: .../groupforums/ForumListItemView.as::_SafeStr_6305
    // **Name derived** from `unread_region`.
    private _unreadRegion: IWindow | null;

    // AS3: .../groupforums/ForumListItemView.as::_messages1
    private _messages1: ITextWindow | null;

    // AS3: .../groupforums/ForumListItemView.as::_messages2
    private _messages2: ITextWindow | null;

    // AS3: .../groupforums/ForumListItemView.as::_badgeWidget
    private _badgeWidget: IBadgeImageWidget | null;

    // AS3: .../groupforums/ForumListItemView.as::_groupId
    private _groupId: number = 0;

    // AS3: .../groupforums/ForumListItemView.as::ForumListItemView()
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
        this._badgeWidget = (this._window.findChildByName('group_icon') as IWidgetWindow | null)?.widget as IBadgeImageWidget | null ?? null;

        this._headerRegion?.addEventListener('WME_CLICK', this.onOpenForum);
        this._unreadRegion?.addEventListener('WME_CLICK', this.onOpenForum);
    }

    // AS3: .../groupforums/ForumListItemView.as::bind()
    bind(view: GroupForumView): void
    {
        this._view = view;
        this._controller = this._view.controller;
    }

    /**
     * Fills the row. Everything that changes when a forum has unread posts is a `bold` flag — the
     * row is not otherwise styled differently.
     *
     * The alternating background is computed from the row index, not stored: even rows take the
     * lighter colour.
     */
    // AS3: .../groupforums/ForumListItemView.as::initialize()
    initialize(forum: ForumData, index: number): void
    {
        const unread = forum.unreadMessages;
        const localization = this._controller?.localizationManager;

        this._groupId = forum.groupId;

        if(this._window !== null)
        {
            this._window.name = 'forum_' + forum.groupId;
            this._window.color = (index + 1) % 2 ? 4293852927 : 4289914618;
        }

        if(this._textsContainer !== null) this._textsContainer.id = forum.groupId;

        if(this._headerRegion !== null) this._headerRegion.id = forum.groupId;

        if(this._header !== null)
        {
            this._header.bold = unread > 0;
            this._header.text = forum.name;
        }

        if(this._details !== null)
        {
            this._details.caption = localization?.getLocalizationWithParams(
                'groupforum.view.forum_details',
                '',
                'rating', String(forum.leaderboardScore),
                'last_author_id', String(forum.lastMessageAuthorId),
                'last_author_name', forum.lastMessageAuthorName,
                'update_time', this._view?.getAsDaysHoursMinutes(forum.lastMessageTimeAsSecondsAgo) ?? ''
            ) ?? '';
        }

        if(this._unreadTextsContainer !== null) this._unreadTextsContainer.id = forum.groupId;

        if(this._unreadRegion !== null) this._unreadRegion.id = forum.groupId;

        if(this._messages1 !== null)
        {
            this._messages1.bold = unread > 0;
            this._messages1.text = localization?.getLocalizationWithParams(
                'groupforum.view.thread_details1',
                '',
                'total_messages', String(forum.totalMessages),
                'new_messages', String(unread)
            ) ?? '';
        }

        if(this._messages2 !== null)
        {
            this._messages2.bold = unread > 0;
            this._messages2.text = localization?.getLocalizationWithParams(
                'groupforum.view.thread_details2',
                '',
                'total_messages', String(forum.totalMessages),
                'new_messages', String(unread)
            ) ?? '';
        }

        if(this._badgeWidget !== null)
        {
            this._badgeWidget.badgeId = forum.icon;
            this._badgeWidget.groupId = forum.groupId;
            this._badgeWidget.type = 'group';
        }
    }

    // AS3: .../groupforums/ForumListItemView.as::recycle()
    recycle(): void
    {
        this._groupId = 0;

        if(this._window !== null) this._window.name = '';

        if(this._textsContainer !== null) this._textsContainer.id = 0;

        if(this._headerRegion !== null) this._headerRegion.id = 0;

        if(this._unreadTextsContainer !== null) this._unreadTextsContainer.id = 0;

        if(this._unreadRegion !== null) this._unreadRegion.id = 0;

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
    }

    // AS3: .../groupforums/ForumListItemView.as::onOpenForum()
    // The id guard is what makes a recycled row inert: `recycle()` zeroes it, so a click landing on
    // a row between lists opens nothing.
    private onOpenForum = (_event: WindowMouseEvent): void =>
    {
        if(this._groupId > 0)
        {
            this._controller?.openGroupForum(this._groupId);
        }
    };

    // AS3: .../groupforums/ForumListItemView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../groupforums/ForumListItemView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../groupforums/ForumListItemView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._headerRegion?.removeEventListener('WME_CLICK', this.onOpenForum);
        this._unreadRegion?.removeEventListener('WME_CLICK', this.onOpenForum);
        this._window?.dispose();
        this._window = null;
        this._badgeWidget = null;
        this._messages2 = null;
        this._messages1 = null;
        this._unreadRegion = null;
        this._unreadTextsContainer = null;
        this._details = null;
        this._headerRegion = null;
        this._header = null;
        this._textsContainer = null;
        this._controller = null;
        this._view = null;
        this._groupId = 0;
        this._disposed = true;
    }
}
