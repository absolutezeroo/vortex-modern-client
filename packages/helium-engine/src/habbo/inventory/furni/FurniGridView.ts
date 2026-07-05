import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

// TextController (the concrete ITextWindow implementation) exposes a real
// underline setter; the interface only declares it read-only.
type WritableTextWindow = ITextWindow & {underline: boolean};
import {WindowMouseEvent as WindowMouseEventClass} from '@core/window/events/WindowMouseEvent';
import type {GroupItem} from '../items/GroupItem';

const PLACEMENT_ANYWHERE = 0;
const PLACEMENT_IN_ROOM = 1;
const PLACEMENT_NOT_IN_ROOM = 2;
const PAGE_COLOR_ACTIVE = 16711680;
const PAGE_COLOR_INACTIVE = 0;

/**
 * Manages the paginated furniture grid (filtering, sorting, paging).
 *
 * Based on AS3 com.sulake.habbo.inventory.furni.FurniGridView
 *
 * The AS3 decompilation of changeToPage()/updatePaging() is corrupted
 * (dead `while(0 < n)` loops that never advance, `null.x` references to
 * what must be the newly-created page item) — reconstructed here from
 * evident intent: iterate the actual index range / page count.
 */
export class FurniGridView
{
    private _grid: IItemGridWindow;
    private _pageList: IItemListWindow | null;
    private _pageTemplate: IRegionWindow | null = null;

    private _items: GroupItem[] = [];
    private _passedItems: GroupItem[] = [];
    private _currentPageItems: GroupItem[] = [];

    private _showFloorItems: boolean = true;
    private _showWallItems: boolean = true;
    private _showingRentedItems: boolean = false;
    private _mergeRentFurni: boolean = false;
    private _showingNfts: boolean = true;
    private _placementFilter: number = PLACEMENT_ANYWHERE;
    private _searchText: string = '';

    private _itemsPerPage: number = 200;
    private _currentPage: number = -1;

    constructor(grid: IItemGridWindow, pageList: IItemListWindow | null)
    {
        this._grid = grid;
        this._grid.shouldRebuildGridOnResize = false;

        if(pageList)
        {
            this._pageList = pageList;
            this._pageTemplate = pageList.removeListItemAt(0) as IRegionWindow | null;
        }
        else
        {
            this._pageList = null;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::get visibleCount()
    get visibleCount(): number
    {
        return this._grid.numGridItems;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::get currentPageItems()
    get currentPageItems(): GroupItem[]
    {
        return this._currentPageItems;
    }

    private get pageCount(): number
    {
        return Math.floor(this._passedItems.length / this._itemsPerPage) + 1;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::dispose()
    dispose(): void
    {
        this._items = [];
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::clearGrid()
    clearGrid(): void
    {
        this._grid.removeGridItems();
        this._grid.destroyGridItems();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::setFilter()
    setFilter(
        placementOrWallFilter: number,
        _filterLabel: string,
        showingRentedItems: boolean,
        mergeRentFurni: boolean,
        searchText: string,
        placementFilter: number,
        showingNfts: boolean
    ): void
    {
        this._showFloorItems = placementOrWallFilter === 0 || placementOrWallFilter === 1;
        this._showWallItems = placementOrWallFilter === 0 || placementOrWallFilter === 2;
        this._showingRentedItems = showingRentedItems;
        this._mergeRentFurni = mergeRentFurni;
        this._showingNfts = showingNfts;
        this._placementFilter = placementFilter;
        this._searchText = (searchText ?? '').toLowerCase();

        this.update();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::itemWasUpdated()
    itemWasUpdated(item: GroupItem): void
    {
        if(this.passFilter(item))
        {
            this.update();
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::getFirstThumb()
    getFirstThumb(): unknown
    {
        if(this._grid.numGridItems === 0) return null;

        return this._grid.getGridItemAt(0);
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::setItems()
    setItems(items: GroupItem[]): void
    {
        this._items = items;
        this.update();
    }

    private update(): void
    {
        let currentItems = this._items.filter((item) => this.passFilter(item));

        if(!this._mergeRentFurni && this._showingRentedItems)
        {
            currentItems = currentItems.slice().sort((a, b) =>
            {
                const itemA = a.peek();
                const itemB = b.peek();
                const startedDiff = Number(itemB?.hasRentPeriodStarted ?? false) - Number(itemA?.hasRentPeriodStarted ?? false);

                if(startedDiff !== 0) return startedDiff;

                return (itemA?.secondsToExpiration ?? 0) - (itemB?.secondsToExpiration ?? 0);
            });
        }

        if(currentItems.length === this._passedItems.length)
        {
            let changed = false;

            for(let i = 0; i < currentItems.length; i++)
            {
                if(currentItems[i] !== this._passedItems[i])
                {
                    changed = true;
                    break;
                }
            }

            if(!changed) return;
        }

        this._passedItems = currentItems;
        this.changeToPage(this._currentPage, true);
        this.updatePaging();
    }

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

            this._grid.addGridItem(item.window!);
            this._currentPageItems.push(item);
        }
    }

    private updatePaging(): void
    {
        if(!this._pageList) return;

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
                if(!this._pageTemplate) break;

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
                pageText.textColor = PAGE_COLOR_ACTIVE;
            }
            else
            {
                pageText.underline = false;
                pageText.textColor = PAGE_COLOR_INACTIVE;
            }
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::onPageEventProc()
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
                if(pageText) pageText.textColor = PAGE_COLOR_ACTIVE;
                break;
            case WindowMouseEventClass.OUT:
                if(pageText && page !== this._currentPage) pageText.textColor = PAGE_COLOR_INACTIVE;
                break;
        }
    };

    // AS3: sources/win63_version/habbo/inventory/furni/FurniGridView.as::passFilter()
    private passFilter(item: GroupItem): boolean
    {
        if(!this._showFloorItems && !item.isWallItem) return false;

        if(!this._showWallItems && item.isWallItem) return false;

        if(!this._mergeRentFurni && this._showingRentedItems !== item.isRented) return false;

        if(!this._showingNfts && item.isNft()) return false;

        if(this._placementFilter === PLACEMENT_IN_ROOM && item.flatId === -1) return false;

        if(this._placementFilter === PLACEMENT_NOT_IN_ROOM && item.flatId > -1) return false;

        if(this._searchText.length > 0)
        {
            const name = item.name.toLowerCase();
            const description = item.description.toLowerCase();

            if(name.indexOf(this._searchText) === -1 && description.indexOf(this._searchText) === -1) return false;
        }

        return true;
    }
}
