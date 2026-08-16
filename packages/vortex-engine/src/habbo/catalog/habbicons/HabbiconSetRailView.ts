import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';

import type {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconSetRailRowView} from './HabbiconSetRailRowView';

/**
 * The scrolling list of collections down the left of the hub.
 *
 * **The row template is removed from the list and kept**, so cloning it produces rows the list has
 * never owned. `dispose()` is the only thing that ever frees it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconSetRailView.as
 */
export class HabbiconSetRailView implements IDisposable
{
    // AS3: HabbiconSetRailView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconSetRailView.as::_SafeStr_6964 (name derived: the row template)
    private _rowTemplate: IWindowContainer | null = null;

    // AS3: HabbiconSetRailView.as::_SafeStr_5365 (name derived: the live rows)
    private _rows: HabbiconSetRailRowView[] = [];

    // AS3: HabbiconSetRailView.as::_SafeStr_4682 (name derived: the selected set)
    private _activeSet: HabbiconSetModel | null = null;

    // AS3: HabbiconSetRailView.as::_SafeStr_7074 (name derived: the selection callback)
    private _onSelected: ((set: HabbiconSetModel) => void) | null;

    // AS3: HabbiconSetRailView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconSetRailView.as::HabbiconSetRailView()
    constructor(window: IWindowContainer | null, onSelected: ((set: HabbiconSetModel) => void) | null)
    {
        this._window = window;
        this._onSelected = onSelected;

        const list = this.setRailList;
        const template = list?.getListItemByName('set_row_template') ?? null;

        if(list !== null && template !== null)
        {
            this._rowTemplate = list.removeListItem(template) as unknown as IWindowContainer | null;
        }
    }

    /**
	 * Rows are told whether they are active *before* being added to the list, using the active set
	 * captured from the previous build — which is why `setSets()` does not need a `setActiveSet()`
	 * call after it.
	 */
    // AS3: HabbiconSetRailView.as::setSets()
    setSets(sets: HabbiconSetModel[]): void
    {
        this.clearRows();

        const list = this.setRailList;

        if(this._rowTemplate === null || list === null) return;

        for(const set of sets)
        {
            const row = new HabbiconSetRailRowView(this._rowTemplate, this._onSelected);

            row.initialize(set);
            row.setActive(row.set === this._activeSet);

            const window = row.window;

            if(window !== null) list.addListItem(window as unknown as IWindow);

            this._rows.push(row);
        }
    }

    // AS3: HabbiconSetRailView.as::setActiveSet()
    setActiveSet(set: HabbiconSetModel | null): void
    {
        this._activeSet = set;

        for(const row of this._rows)
        {
            row.setActive(row.set === set);
        }
    }

    /**
	 * Matches on identity *or* collection id, because a rebuilt album hands over new objects for the
	 * same collections.
	 */
    // AS3: HabbiconSetRailView.as::refreshSet()
    refreshSet(set: HabbiconSetModel, animate: boolean): void
    {
        for(const row of this._rows)
        {
            if(row.set === set || row.set?.collectionId === set.collectionId)
            {
                row.refreshProgress(animate);

                return;
            }
        }
    }

    // AS3: HabbiconSetRailView.as::update()
    update(delta: number): void
    {
        for(const row of this._rows)
        {
            row.update(delta);
        }
    }

    // AS3: HabbiconSetRailView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconSetRailView.as::clearRows()
    private clearRows(): void
    {
        for(const row of this._rows)
        {
            row.dispose();
        }

        this._rows.length = 0;
    }

    // AS3: HabbiconSetRailView.as::get setRailList()
    private get setRailList(): IItemListWindow | null
    {
        return (this._window?.findChildByName('set_rail_list') as IItemListWindow | null) ?? null;
    }

    // AS3: HabbiconSetRailView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.clearRows();

        (this._rowTemplate as unknown as IWindow | null)?.dispose();
        this._rowTemplate = null;
        this._window = null;
        this._activeSet = null;
        this._onSelected = null;
        this._rows = [];
        this._disposed = true;
    }
}
