import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowMouseEvent as WindowMouseEventClass} from '@core/window/events/WindowMouseEvent';

import type {CollectibleGroupedItem} from './CollectibleGroupedItem';
// Type-only, so the CollectiblesView <-> CollectiblesGridView cycle is erased at compile time.
import type {CollectiblesView} from './CollectiblesView';

// TextController (the concrete ITextWindow implementation) exposes a real underline setter; the
// interface only declares it read-only. Same shim FurniGridView uses.
type WritableTextWindow = ITextWindow & {underline: boolean};

/**
 * The paginated collectibles grid: filter by product type and by name, 200 cells to a page.
 *
 * Structurally identical to FurniGridView — same paging, same "did the passing set actually
 * change" guard — with a much smaller filter: collectibles have no rent, no placement and no
 * wall/floor split, only a product-type dropdown and a search box.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/collectibles/CollectiblesGridView.as
 */
export class CollectiblesGridView
{
    private static readonly PAGE_COLOR_ACTIVE = 16711680;

    private static readonly PAGE_COLOR_INACTIVE = 0;

    // AS3: .../CollectiblesGridView.as::_SafeStr_4550 (the owning view)
    private _view: CollectiblesView | null;
    // AS3: .../CollectiblesGridView.as::_SafeStr_5211 (the grid window)
    private _grid: IItemGridWindow | null;
    // AS3: .../CollectiblesGridView.as::_pages
    private _pageList: IItemListWindow | null;
    // AS3: .../CollectiblesGridView.as::_SafeStr_7258 (the page-button template)
    private _pageTemplate: IRegionWindow | null = null;

    // AS3: .../CollectiblesGridView.as::_items
    private _items: CollectibleGroupedItem[] = [];
    // AS3: .../CollectiblesGridView.as::_passedItems
    private _passedItems: CollectibleGroupedItem[] = [];
    // AS3: .../CollectiblesGridView.as::_currentPageItems
    private _currentPageItems: CollectibleGroupedItem[] = [];

    // AS3: .../CollectiblesGridView.as::_SafeStr_8970 (items per page)
    private _itemsPerPage: number = 200;
    // AS3: .../CollectiblesGridView.as::_SafeStr_4846 (current page)
    private _currentPage: number = -1;
    // AS3: .../CollectiblesGridView.as::_SafeStr_8502 (the lower-cased search text)
    private _searchText: string = '';
    // AS3: .../CollectiblesGridView.as::_SafeStr_7832 (product-type filter, -1 = everything)
    private _productTypeFilter: number = -1;

    // AS3: .../CollectiblesGridView.as::CollectiblesGridView()
    constructor(view: CollectiblesView, grid: IItemGridWindow, pageList: IItemListWindow | null)
    {
        this._view = view;
        this._grid = grid;
        this._grid.shouldRebuildGridOnResize = false;
        this._pageList = pageList;

        if(this._pageList !== null)
        {
            this._pageTemplate = this._pageList.removeListItemAt(0) as IRegionWindow | null;
        }
    }

    // AS3: .../CollectiblesGridView.as::get visibleCount()
    get visibleCount(): number
    {
        return this._grid?.numGridItems ?? 0;
    }

    // AS3: .../CollectiblesGridView.as::get currentPageItems()
    get currentPageItems(): CollectibleGroupedItem[]
    {
        return this._currentPageItems;
    }

    // AS3: .../CollectiblesGridView.as::get pageCount()
    private get pageCount(): number
    {
        return Math.floor(this._passedItems.length / this._itemsPerPage) + 1;
    }

    // AS3: .../CollectiblesGridView.as::clearGrid()
    clearGrid(): void
    {
        if(this._grid === null) return;

        this._grid.removeGridItems();
        this._grid.destroyGridItems();
    }

    // AS3: .../CollectiblesGridView.as::setFilter()
    setFilter(productTypeId: number, searchText: string | null): void
    {
        this._searchText = searchText === null ? '' : searchText.toLowerCase();
        this._productTypeFilter = productTypeId;

        this.update();
    }

    // AS3: .../CollectiblesGridView.as::itemWasUpdated()
    itemWasUpdated(item: CollectibleGroupedItem): void
    {
        if(this.passFilter(item)) this.update();
    }

    // AS3: .../CollectiblesGridView.as::getFirstThumb()
    getFirstThumb(): IWindowContainer | null
    {
        if(this._grid === null || this._grid.numGridItems === 0) return null;

        return this._grid.getGridItemAt(0) as IWindowContainer | null;
    }

    // AS3: .../CollectiblesGridView.as::setItems()
    setItems(items: CollectibleGroupedItem[]): void
    {
        this._items = items;

        this.update();
    }

    // AS3: .../CollectiblesGridView.as::update()
    private update(): void
    {
        const passing = this._items.filter((item) => this.passFilter(item));

        // Same-length *and* same-order means nothing to redraw. AS3 bails here rather than
        // rebuilding the grid on every keystroke that changes no result.
        if(passing.length === this._passedItems.length)
        {
            let changed = false;

            for(let i = 0; i < passing.length; i++)
            {
                if(passing[i] !== this._passedItems[i])
                {
                    changed = true;
                    break;
                }
            }

            if(!changed) return;
        }

        this._passedItems = passing;
        this.changeToPage(this._currentPage, true);
        this.updatePaging();
    }

    // AS3: .../CollectiblesGridView.as::changeToPage()
    private changeToPage(page: number, force: boolean = false): void
    {
        if(page > -1)
        {
            if(this._currentPage === page && !force) return;
        }
        else
        {
            page = 0;
        }

        this._currentPage = page;

        if(this._currentPage >= this.pageCount)
        {
            this._currentPage = this.pageCount - 1;
        }

        this._currentPage = Math.max(this._currentPage, 0);
        this._currentPageItems = [];
        this.clearGrid();

        const start = this._currentPage * this._itemsPerPage;
        const end = Math.min(start + this._itemsPerPage, this._passedItems.length);

        for(let i = start; i < end; i++)
        {
            const item = this._passedItems[i];
            const window = item.window;

            if(window !== null) this._grid?.addGridItem(window);

            this._currentPageItems.push(item);
        }
    }

    // AS3: .../CollectiblesGridView.as::updatePaging()
    private updatePaging(): void
    {
        if(this._pageList === null) return;

        const count = this.pageCount;

        this._pageList.visible = count > 1;

        if(this._currentPage >= count)
        {
            this._currentPage = count - 1;
        }

        this._currentPage = Math.max(this._currentPage, 0);

        if(count !== this._pageList.numListItems)
        {
            for(let i = 0; i < this._pageList.numListItems; i++)
            {
                const existing = this._pageList.getListItemAt(i);

                existing?.removeEventListener(WindowMouseEventClass.CLICK, this.onPageEventProc as unknown as (...args: unknown[]) => void);
            }

            this._pageList.destroyListItems();

            for(let i = 0; i < count; i++)
            {
                if(this._pageTemplate === null) break;

                const pageItem = this._pageTemplate.clone() as IRegionWindow;

                pageItem.addEventListener(WindowMouseEventClass.CLICK, this.onPageEventProc as unknown as (...args: unknown[]) => void);
                pageItem.addEventListener(WindowMouseEventClass.OVER, this.onPageEventProc as unknown as (...args: unknown[]) => void);
                pageItem.addEventListener(WindowMouseEventClass.OUT, this.onPageEventProc as unknown as (...args: unknown[]) => void);
                pageItem.id = i;
                pageItem.name = `page_${i}`;
                this._pageList.addListItem(pageItem);
            }
        }

        for(let i = 0; i < count; i++)
        {
            const pageItem = this._pageList.getListItemAt(i) as unknown as IWindowContainer | null;
            const pageText = pageItem?.findChildByTag('PAGE') as WritableTextWindow | null;

            if(!pageText) continue;

            pageText.text = i.toString();

            if(i === this._currentPage)
            {
                pageText.underline = true;
                pageText.textColor = CollectiblesGridView.PAGE_COLOR_ACTIVE;
            }
            else
            {
                pageText.underline = false;
                pageText.textColor = CollectiblesGridView.PAGE_COLOR_INACTIVE;
            }
        }
    }

    // AS3: .../CollectiblesGridView.as::onPageEventProc()
    private onPageEventProc = (event: WindowMouseEvent): void =>
    {
        const window = event.window as IRegionWindow | null;

        if(!window) return;

        const page = window.id;
        const pageText = (window as unknown as IWindowContainer).findChildByTag('PAGE') as WritableTextWindow | null;

        switch(event.type)
        {
            case WindowMouseEventClass.CLICK:
                this.changeToPage(page);
                this.updatePaging();
                break;
            case WindowMouseEventClass.OVER:
                if(pageText) pageText.textColor = CollectiblesGridView.PAGE_COLOR_ACTIVE;
                break;
            case WindowMouseEventClass.OUT:
                if(pageText && page !== this._currentPage) pageText.textColor = CollectiblesGridView.PAGE_COLOR_INACTIVE;
                break;
        }
    };

    // AS3: .../CollectiblesGridView.as::passFilter()
    private passFilter(item: CollectibleGroupedItem | null): boolean
    {
        if(item === null || item.name === null) return false;

        if(this._searchText.length > 0)
        {
            if(item.name.toLowerCase().indexOf(this._searchText) === -1) return false;
        }

        if(this._productTypeFilter !== -1 && item.renderableItem.productTypeId !== this._productTypeFilter) return false;

        return true;
    }

    // AS3: .../CollectiblesGridView.as::dispose()
    dispose(): void
    {
        this._grid = null;
        this._items = [];
        this._view = null;
        this._pageList = null;
        this._pageTemplate = null;
    }
}
