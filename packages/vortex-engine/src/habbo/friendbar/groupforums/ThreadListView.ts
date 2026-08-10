import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {IDisposable} from '@core/runtime';
import type {ForumPermissions} from '@habbo/communication/messages/parser/groupforums/ForumPermissions';
import type {ForumThread} from '@habbo/communication/messages/parser/groupforums/ForumThread';
import type {GroupForumController} from './GroupForumController';
import type {GroupForumView} from './GroupForumView';
import type {ThreadsListData} from './ThreadsListData';
import {ThreadListItemView} from './ThreadListItemView';

/**
 * One forum's threads, as rows.
 *
 * Structurally the same pooled list as `ForumsListView` — its own static pool, its own cloned
 * template — with one addition: `updateElement()`, which re-fills a single row in place when the
 * server reports a thread changed. It finds the row by thread id and re-`initialize()`s it at the
 * position it already occupies, so a moderation action does not rebuild the page.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/ThreadListView.as
 */
export class ThreadListView implements IDisposable
{
    // AS3: .../groupforums/ThreadListView.as::ITEM_POOL_MAX_SIZE
    private static readonly ITEM_POOL_MAX_SIZE: number = 20;

    // AS3: .../groupforums/ThreadListView.as::ITEM_POOL
    private static readonly ITEM_POOL: ThreadListItemView[] = [];

    // AS3: .../groupforums/ThreadListView.as::_SafeStr_4593
    private _controller: GroupForumController | null;

    // AS3: .../groupforums/ThreadListView.as::_SafeStr_4684
    private _view: GroupForumView | null;

    // AS3: .../groupforums/ThreadListView.as::_SafeStr_4652
    // **Name derived**, as in `ForumsListView`, and likewise for the two below.
    private _list: IScrollableListWindow | null;

    // AS3: .../groupforums/ThreadListView.as::_SafeStr_6621
    private _itemTemplate: IWindowContainer | null;

    // AS3: .../groupforums/ThreadListView.as::_SafeStr_4805
    private _items: ThreadListItemView[];

    // AS3: .../groupforums/ThreadListView.as::_SafeStr_4633
    private _forum: ForumPermissions | null;

    // AS3: .../groupforums/ThreadListView.as::_SafeStr_5145
    private _threadsListData: ThreadsListData | null;

    // AS3: .../groupforums/ThreadListView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../groupforums/ThreadListView.as::ThreadListView()
    constructor(view: GroupForumView, list: IScrollableListWindow | null, forum: ForumPermissions, threads: ThreadsListData)
    {
        this._view = view;
        this._controller = this._view.controller;
        this._list = list;
        this._itemTemplate = this._controller?.windowManager?.buildWidgetLayout('groupforum_thread_list_item_xml') as IWindowContainer | null ?? null;
        this._items = [];
        this._forum = forum;
        this._threadsListData = threads;
    }

    // AS3: .../groupforums/ThreadListView.as::update()
    update(): void
    {
        this.clear();
        this._list?.invalidate();

        if(this._threadsListData === null || this._forum === null) return;

        for(let i = 0; i < this._threadsListData.size; i++)
        {
            const thread = this._threadsListData.threads[i];
            const item = this.claimView();

            if(item === null) continue;

            item.initialize(this._forum, this._threadsListData, thread, i);
            this._items.push(item);

            const window = item.window;

            if(window !== null) this._list?.addListItem(window);
        }

        this.updateItemWidths();
    }

    // AS3: .../groupforums/ThreadListView.as::updateItemWidths()
    updateItemWidths(): void
    {
        if(this._list === null) return;

        for(let i = 0; i < this._list.numListItems; i++)
        {
            const item = this._list.getListItemAt(i);

            if(item !== null) item.width = this._list.scrollableWindow.width - 2;
        }
    }

    // AS3: .../groupforums/ThreadListView.as::clear()
    private clear(): void
    {
        if(this._list !== null && this._list.numListItems > 0)
        {
            this._list.removeListItems();
        }

        for(const item of this._items)
        {
            ThreadListView.recycleView(item);
        }

        this._items.length = 0;
    }

    // AS3: .../groupforums/ThreadListView.as::updateElement()
    // The row keeps its index, which is what keeps the alternating background stable — the index is
    // also what `getThreadColor()` uses.
    updateElement(thread: ForumThread): void
    {
        if(this._forum === null || this._threadsListData === null) return;

        for(let i = 0; i < this._items.length; i++)
        {
            const item = this._items[i];

            if(item.threadId === thread.threadId)
            {
                item.initialize(this._forum, this._threadsListData, thread, i);

                return;
            }
        }
    }

    // AS3: .../groupforums/ThreadListView.as::claimView()
    private claimView(): ThreadListItemView | null
    {
        let item: ThreadListItemView | null = null;

        if(ThreadListView.ITEM_POOL.length > 0)
        {
            item = ThreadListView.ITEM_POOL.pop() ?? null;
        }
        else if(this._itemTemplate !== null && this._view !== null)
        {
            item = new ThreadListItemView(this._itemTemplate, this._view);
        }

        if(item !== null && this._view !== null) item.bind(this._view);

        return item;
    }

    // AS3: .../groupforums/ThreadListView.as::recycleView()
    private static recycleView(item: ThreadListItemView): void
    {
        if(ThreadListView.ITEM_POOL.length < ThreadListView.ITEM_POOL_MAX_SIZE)
        {
            item.recycle();
            ThreadListView.ITEM_POOL.push(item);
        }
        else
        {
            item.dispose();
        }
    }

    // AS3: .../groupforums/ThreadListView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../groupforums/ThreadListView.as::dispose()
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
        this._threadsListData = null;
        this._forum = null;
        this._list = null;
        this._controller = null;
        this._view = null;
        this._disposed = true;
    }
}
