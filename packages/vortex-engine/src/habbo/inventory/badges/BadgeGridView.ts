import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import type {Badge} from './Badge';
import type {BadgesView} from './BadgesView';

/**
 * The paged grid of inactive badges inside the badges tab.
 *
 * Holds the whole badge list, filters it (category, rarity, search term) into `_passedItems`,
 * and shows one 200-item page of that at a time. The pager below the grid is built by cloning
 * the single region the layout ships, which the constructor takes out of the list first.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as
 */
export class BadgeGridView
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::FILTER_NORMAL_BADGES
    private static readonly FILTER_NORMAL_BADGES: number = 1;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::FILTER_ACHIEVEMENTS
    private static readonly FILTER_ACHIEVEMENTS: number = 2;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::RARITY_FILTER_ALL
    // Derived name: obfuscated in the primary tree.
    private static readonly RARITY_FILTER_ALL: number = -1;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::RARITY_FILTER_COMMON
    // Derived name: obfuscated in the primary tree.
    private static readonly RARITY_FILTER_COMMON: number = -2;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::ACHIEVEMENT_PREFIX
    private static readonly ACHIEVEMENT_PREFIX: string = 'ACH_';

    // Derived name: obfuscated in the primary tree; named for what it holds.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_view
    private _view: BadgesView | null;
    // Derived name: obfuscated in the primary tree; named for what it holds.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_grid
    private _grid: IItemGridWindow | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_items
    private _items: Badge[] = [];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_passedItems
    private _passedItems: Badge[] = [];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_pages
    private _pages: IItemListWindow | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_pageTemplate
    // Derived name: obfuscated in the primary tree — the one pager region the layout ships,
    // taken out of the list so the rest can be cloned from it.
    private _pageTemplate: IRegionWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_itemsPerPage
    // Derived name: obfuscated in the primary tree.
    private _itemsPerPage: number = 200;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_currentPage
    // Derived name: obfuscated in the primary tree.
    private _currentPage: number = -1;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_currentPageItems
    private _currentPageItems: Badge[] = [];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_searchTerm
    // Derived name: obfuscated in the primary tree.
    private _searchTerm: string = '';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_categoryFilter
    // Derived name: obfuscated in the primary tree.
    private _categoryFilter: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::_rarityFilter
    // Derived name: obfuscated in the primary tree.
    private _rarityFilter: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::BadgeGridView()
    constructor(view: BadgesView, grid: IItemGridWindow | null, pages: IItemListWindow | null)
    {
        this._view = view;
        this._grid = grid;
        this._pages = pages;

        if(this._grid !== null) this._grid.shouldRebuildGridOnResize = false;

        if(this._pages !== null) this._pageTemplate = this._pages.removeListItemAt(0) as IRegionWindow | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::get visibleCount()
    get visibleCount(): number
    {
        return this._grid?.numGridItems ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::get currentPageItems()
    get currentPageItems(): Badge[]
    {
        return this._currentPageItems;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::get pageCount()
    private get pageCount(): number
    {
        // AS3 divides two ints, so the result truncates before the +1.
        return Math.trunc(this._passedItems.length / this._itemsPerPage) + 1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::clearGrid()
    clearGrid(): void
    {
        if(this._grid === null) return;

        this._grid.removeGridItems();
        this._grid.destroyGridItems();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::setFilter()
    setFilter(categoryFilter: number, rarityFilter: number, searchTerm: string | null): void
    {
        this._categoryFilter = categoryFilter;
        this._rarityFilter = rarityFilter;
        this._searchTerm = searchTerm === null ? '' : searchTerm.toLowerCase();

        this.update();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::itemWasUpdated()
    itemWasUpdated(badge: Badge): void
    {
        if(this.passFilter(badge)) this.update();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::getFirstThumb()
    getFirstThumb(): IWindowContainer | null
    {
        if(this._grid === null || this._grid.numGridItems === 0) return null;

        return this._grid.getGridItemAt(0) as IWindowContainer | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::setItems()
    setItems(items: Badge[]): void
    {
        this._items = items;

        this.update();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::update()
    private update(): void
    {
        const passed = this._items.filter((badge) => this.passFilter(badge));

        // AS3 bails when the filtered list is identical, element for element, to the last one —
        // that is what keeps re-filtering on every keystroke from rebuilding the grid.
        if(passed.length === this._passedItems.length
            && passed.every((badge, index) => badge === this._passedItems[index]))
        {
            return;
        }

        this._passedItems = passed;

        this.changeToPage(this._currentPage, true);
        this.updatePaging();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::changeToPage()
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

        this._currentPage = Math.max(0, Math.min(page, this.pageCount - 1));
        this._currentPageItems = [];

        this.clearGrid();

        const first = this._currentPage * this._itemsPerPage;
        const last = Math.min(first + this._itemsPerPage, this._passedItems.length);

        for(let i = first; i < last; i++)
        {
            const window = this._passedItems[i].window;

            if(window !== null) this._grid?.addGridItem(window);

            this._currentPageItems.push(this._passedItems[i]);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::updatePaging()
    private updatePaging(): void
    {
        if(this._pages === null) return;

        const count = this.pageCount;

        this._pages.visible = count > 1;
        this._currentPage = Math.max(0, Math.min(this._currentPage, count - 1));

        if(count !== this._pages.numListItems)
        {
            for(let i = 0; i < this._pages.numListItems; i++)
            {
                this._pages.getListItemAt(i)?.removeEventListener(WindowMouseEvent.CLICK, this.onPageEventProc);
            }

            this._pages.destroyListItems();

            for(let i = 0; i < count; i++)
            {
                const page = this._pageTemplate?.clone() as IRegionWindow | null;

                if(page === null || page === undefined) continue;

                page.addEventListener(WindowMouseEvent.CLICK, this.onPageEventProc);
                page.addEventListener(WindowMouseEvent.OVER, this.onPageEventProc);
                page.addEventListener(WindowMouseEvent.OUT, this.onPageEventProc);
                page.id = i;
                page.name = `page_${i}`;

                this._pages.addListItem(page);
            }
        }

        for(let i = 0; i < count; i++)
        {
            const page = this._pages.getListItemAt(i) as IWindowContainer | null;
            const label = page?.findChildByTag('PAGE') as ITextWindow | null;

            if(!label) continue;

            label.caption = i.toString();
            label.underline = i === this._currentPage;
            label.textColor = i === this._currentPage ? 16711680 : 0;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::onPageEventProc()
    private onPageEventProc = (event: WindowMouseEvent, target: IWindow): void =>
    {
        const page = (event.window ?? target) as IWindow | null;
        const index = page?.id ?? 0;
        const label = (target as unknown as IWindowContainer).findChildByTag?.('PAGE') as ITextWindow | null;

        switch(event.type)
        {
            case WindowMouseEvent.CLICK:
                this.changeToPage(index);
                this.updatePaging();
                break;
            case WindowMouseEvent.OVER:
                if(label) label.textColor = 16711680;
                break;
            case WindowMouseEvent.OUT:
                if(label && index !== this._currentPage) label.textColor = 0;
                break;
        }
    };

    /**
	 * The three filters, in AS3's order: category (all / normal / achievements), rarity, then
	 * the search term against name *and* description.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::passFilter()
    private passFilter(badge: Badge | null): boolean
    {
        // AS3 tests both strings for null; the port types them non-null, so this is the
        // empty-string equivalent — a badge with no name never passed AS3's filter either.
        if(badge === null) return false;

        const isAchievement = badge.badgeId !== null && badge.badgeId.startsWith(BadgeGridView.ACHIEVEMENT_PREFIX);

        if(this._categoryFilter === BadgeGridView.FILTER_NORMAL_BADGES && isAchievement) return false;

        if(this._categoryFilter === BadgeGridView.FILTER_ACHIEVEMENTS && !isAchievement) return false;

        if(this._rarityFilter === BadgeGridView.RARITY_FILTER_COMMON)
        {
            if(this._view?.isStandaloneBadgeRarity(badge.badgeRarityId) ?? false) return false;
        }
        else if(this._rarityFilter !== BadgeGridView.RARITY_FILTER_ALL && badge.badgeRarityId !== this._rarityFilter)
        {
            return false;
        }

        if(this._searchTerm.length > 0)
        {
            const name = badge.name.toLowerCase();
            const description = badge.description.toLowerCase();

            if(!name.includes(this._searchTerm) && !description.includes(this._searchTerm)) return false;
        }

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgeGridView.as::dispose()
    dispose(): void
    {
        this._grid = null;
        this._items = [];
        this._view = null;
    }
}
