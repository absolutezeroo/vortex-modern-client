import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {IDisposable} from '@core/runtime';
import type {ForumData} from '@habbo/communication/messages/parser/groupforums/ForumData';
import type {GroupForumController} from './GroupForumController';
import type {GroupForumView} from './GroupForumView';
import {ForumListItemView} from './ForumListItemView';

/**
 * The forums list, as rows in the main window's scroll area.
 *
 * Rows are pooled **across instances**, not per list: `ITEM_POOL` is static, so navigating away
 * from a forums list and back reuses the same twenty item views rather than rebuilding their
 * windows. That is also why an item has `bind()` and `recycle()` separate from its constructor —
 * a pooled row is re-pointed at the current view and re-filled, never re-built.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/ForumsListView.as
 */
export class ForumsListView implements IDisposable
{
    // AS3: .../groupforums/ForumsListView.as::ITEM_POOL_MAX_SIZE
    private static readonly ITEM_POOL_MAX_SIZE: number = 20;

    // AS3: .../groupforums/ForumsListView.as::ITEM_POOL
    private static readonly ITEM_POOL: ForumListItemView[] = [];

    // AS3: .../groupforums/ForumsListView.as::_SafeStr_4593
    private _controller: GroupForumController | null;

    // AS3: .../groupforums/ForumsListView.as::_SafeStr_4684
    private _view: GroupForumView | null;

    // AS3: .../groupforums/ForumsListView.as::_SafeStr_4652
    // **Name derived**: the scroll area the rows are added to.
    private _list: IScrollableListWindow | null;

    // AS3: .../groupforums/ForumsListView.as::_SafeStr_6621
    // **Name derived**: the row built once from XML and cloned per item — never shown itself.
    private _itemTemplate: IWindowContainer | null;

    // AS3: .../groupforums/ForumsListView.as::_SafeStr_4805
    // **Name derived**: the rows currently on screen, in order.
    private _items: ForumListItemView[];

    // AS3: .../groupforums/ForumsListView.as::_forums
    private _forums: ForumData[] | null;

    // AS3: .../groupforums/ForumsListView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../groupforums/ForumsListView.as::ForumsListView()
    constructor(view: GroupForumView, list: IScrollableListWindow | null, forums: ForumData[])
    {
        this._view = view;
        this._controller = this._view.controller;
        this._list = list;
        this._itemTemplate = this._controller?.windowManager?.buildWidgetLayout('groupforum_forum_list_item_xml') as IWindowContainer | null ?? null;
        this._items = [];
        this._forums = forums;
    }

    // AS3: .../groupforums/ForumsListView.as::update()
    update(): void
    {
        this.clear();
        this._list?.invalidate();

        const forums = this._forums ?? [];

        for(let i = 0; i < forums.length; i++)
        {
            const item = this.claimView();

            if(item === null) continue;

            item.initialize(forums[i], i);
            this._items.push(item);

            const window = item.window;

            if(window !== null) this._list?.addListItem(window);
        }

        this.updateItemWidths();
    }

    // AS3: .../groupforums/ForumsListView.as::clear()
    private clear(): void
    {
        if(this._list !== null && this._list.numListItems > 0)
        {
            this._list.removeListItems();
        }

        for(const item of this._items)
        {
            ForumsListView.recycleView(item);
        }

        this._items.length = 0;
    }

    // AS3: .../groupforums/ForumsListView.as::updateItemWidths()
    // The -2 is the row's own border: the list item is sized to the scrollable area minus it, so
    // the rows do not overlap the scrollbar.
    updateItemWidths(): void
    {
        if(this._list === null) return;

        for(let i = 0; i < this._list.numListItems; i++)
        {
            const item = this._list.getListItemAt(i);

            if(item !== null) item.width = this._list.scrollableWindow.width - 2;
        }
    }

    // AS3: .../groupforums/ForumsListView.as::claimView()
    private claimView(): ForumListItemView | null
    {
        let item: ForumListItemView | null = null;

        if(ForumsListView.ITEM_POOL.length > 0)
        {
            item = ForumsListView.ITEM_POOL.pop() ?? null;
        }
        else if(this._itemTemplate !== null && this._view !== null)
        {
            item = new ForumListItemView(this._itemTemplate, this._view);
        }

        if(item !== null && this._view !== null) item.bind(this._view);

        return item;
    }

    // AS3: .../groupforums/ForumsListView.as::recycleView()
    // Past the pool's size the surplus row is disposed rather than kept — the cap is on how many
    // windows stay alive between visits, not on how many a single list may show.
    private static recycleView(item: ForumListItemView): void
    {
        if(ForumsListView.ITEM_POOL.length < ForumsListView.ITEM_POOL_MAX_SIZE)
        {
            item.recycle();
            ForumsListView.ITEM_POOL.push(item);
        }
        else
        {
            item.dispose();
        }
    }

    // AS3: .../groupforums/ForumsListView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../groupforums/ForumsListView.as::dispose()
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

        this._forums = null;
        this._items = [];
        this._list = null;
        this._controller = null;
        this._view = null;
        this._disposed = true;
    }
}
