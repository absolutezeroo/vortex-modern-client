import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IScrollableGridWindow} from '@core/window/components/IScrollableGridWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {OrderedMap} from '@core/utils/OrderedMap';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';

import type {WiredTransactionDetailsController} from '../WiredTransactionDetailsController';
import {TransactionItemView} from './TransactionItemView';

/**
 * One half of the details window — everything that went *in*, or everything that came *out*.
 * Two instances are built, over two different containers of the same layout.
 *
 * **Cells are pooled, not rebuilt.** Up to {@link ITEM_POOL_MAX_SIZE} views are kept alive between
 * transactions; past that a released cell is disposed instead. The pool is why `clear()` recycles
 * before emptying the grid rather than after.
 *
 * The order of a breakdown is: coins first if there were any, then one cell per furniture type in
 * the order the server sent them, then — only when the payload was truncated — a single "+N" cell
 * carrying the difference between the reported total and what actually arrived.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/details/furni_overview/TransactionOverviewView.as
 */
export class TransactionOverviewView implements IDisposable
{
    /**
	 * AS3 declares this `public static var`, not `const`, and nothing assigns it.
	 */
    // AS3: TransactionOverviewView.as::ITEM_POOL_MAX_SIZE
    private static readonly ITEM_POOL_MAX_SIZE: number = 15;

    // AS3: TransactionOverviewView.as::_SafeStr_5968 (name derived: the recycled-cell pool)
    private _pool: TransactionItemView[] = [];

    // AS3: TransactionOverviewView.as::_disposed
    private _disposed: boolean = false;

    // AS3: TransactionOverviewView.as::_SafeStr_5744 (name derived: the details controller)
    private _controller: WiredTransactionDetailsController | null;

    // AS3: TransactionOverviewView.as::_window
    private _window: IWindowContainer | null;

    // AS3: TransactionOverviewView.as::_SafeStr_6180 (name derived: the cell template)
    private _itemTemplate: IRegionWindow | null = null;

    // AS3: TransactionOverviewView.as::_SafeStr_5753 (name derived: the cells on screen)
    private _itemViews: TransactionItemView[] = [];

    /**
	 * The template is *removed* from the grid and kept to clone — the same trick the chest grid uses.
	 */
    // AS3: TransactionOverviewView.as::TransactionOverviewView()
    constructor(controller: WiredTransactionDetailsController, window: IWindowContainer)
    {
        this._controller = controller;
        this._window = window;
        this._itemTemplate = (this.itemGrid?.removeGridItemAt(0) as unknown as IRegionWindow | null) ?? null;
    }

    // AS3: TransactionOverviewView.as::clear()
    clear(): void
    {
        this.itemGrid?.removeGridItems();

        for(const view of this._itemViews)
        {
            this.recycleView(view);
        }

        this._itemViews = [];
    }

    /**
	 * `furnis` maps a furniture type to how many of it moved. AS3 walks `getKeys()` and reads the
	 * count twice by two different routes — `map[key]` for the running total and `getValue(key)` for
	 * the cell — which are the same value; both are `getValue()` here.
	 *
	 * The running total is what makes the truncation cell meaningful: `reportedFurniCount` is what
	 * the server says moved, the total is what it actually listed, and the difference is the `+N`.
	 */
    // AS3: TransactionOverviewView.as::itemsInitialize()
    itemsInitialize(
        coinsCount: number,
        furnis: OrderedMap<ChestItemType, number>,
        reportedFurniCount: number,
        isIncompleteData: boolean
    ): void
    {
        this.clear();

        const views: TransactionItemView[] = [];

        if(coinsCount !== 0)
        {
            views.push(this.claimView(coinsCount, TransactionItemView.TYPE_COINS));
        }

        let listedFurniCount = 0;

        for(const key of furnis.getKeys())
        {
            const count = furnis.getValue(key) ?? 0;
            const view = this.claimView(count, TransactionItemView.TYPE_FURNI, key);

            listedFurniCount += count;

            // AS3 null-checks the result even though claimView() cannot return null. Kept.
            if(view !== null) views.push(view);
        }

        if(isIncompleteData && listedFurniCount < reportedFurniCount)
        {
            views.push(this.claimView(reportedFurniCount - listedFurniCount, TransactionItemView.TYPE_INCOMPLETE_DATA));
        }

        this._itemViews = views;
        this.updateGrid();
    }

    // AS3: TransactionOverviewView.as::updateGrid()
    updateGrid(): void
    {
        const grid = this.itemGrid;

        grid?.removeGridItems();

        for(const view of this._itemViews)
        {
            const window = view.window;

            if(window) grid?.addGridItem(window as unknown as IWindow);
        }

        const emptyText = this.emptyText;

        if(emptyText) emptyText.visible = (grid?.numGridItems ?? 0) === 0;
    }

    // AS3: TransactionOverviewView.as::claimView()
    private claimView(count: number, itemKind: number, itemType: ChestItemType | null = null): TransactionItemView
    {
        const view = this._pool.length > 0
            ? this._pool.pop()!
            : new TransactionItemView(this._itemTemplate!, this._controller!);

        view.initialize(count, itemKind, itemType);

        return view;
    }

    // AS3: TransactionOverviewView.as::recycleView()
    private recycleView(view: TransactionItemView): void
    {
        if(this._pool.length < TransactionOverviewView.ITEM_POOL_MAX_SIZE)
        {
            view.recycle();
            this._pool.push(view);
        }
        else
        {
            view.dispose();
        }
    }

    /**
	 * AS3 recycles the live cells into the pool and then disposes the pool, so everything is disposed
	 * exactly once — the recycling looks redundant but keeps the cap logic in one place.
	 */
    // AS3: TransactionOverviewView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._window = null;
        (this._itemTemplate as unknown as IWindow | null)?.dispose();
        this._itemTemplate = null;

        for(const view of this._itemViews)
        {
            this.recycleView(view);
        }

        this._itemViews = [];

        for(const view of this._pool)
        {
            view.dispose();
        }

        this._pool = [];
        this._controller = null;
        this._disposed = true;
    }

    // AS3: TransactionOverviewView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: TransactionOverviewView.as::get itemGrid()
    private get itemGrid(): IScrollableGridWindow | null
    {
        return (this._window?.findChildByName('item_grid') as IScrollableGridWindow | null) ?? null;
    }

    // AS3: TransactionOverviewView.as::get emptyText()
    private get emptyText(): ITextWindow | null
    {
        return (this._window?.findChildByName('empty_text') as ITextWindow | null) ?? null;
    }
}
