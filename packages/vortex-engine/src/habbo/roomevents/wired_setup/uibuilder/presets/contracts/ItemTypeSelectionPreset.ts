import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {TextInputParam} from '../../params/TextInputParam';
import {TextParam} from '../../params/TextParam';
import type {TextPreset} from '../TextPreset';
import {WiredUIPreset} from '../WiredUIPreset';
import type {NamedTextInputPreset} from '../combinations/NamedTextInputPreset';
import {ItemTypeTableObject} from './itemtable/ItemTypeTableObject';

/**
 * Pick a furniture type out of the whole catalogue: a code field, a search box, a scrolling table
 * and a running count.
 *
 * The table is built once, from every floor and wall item the session knows about, and filtered in
 * memory afterwards — there is no server round trip when the player types.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/contracts/ItemTypeSelectionPreset.as
 */
export class ItemTypeSelectionPreset extends WiredUIPreset
{
    // AS3: ItemTypeSelectionPreset.as::COL_FURNI_CODE
    static readonly COL_FURNI_CODE: string = 'furni_code';

    // AS3: ItemTypeSelectionPreset.as::COL_FURNI_NAME
    static readonly COL_FURNI_NAME: string = 'furni_name';

    // AS3: ItemTypeSelectionPreset.as::COL_FURNI_TYPE
    static readonly COL_FURNI_TYPE: string = 'furni_type';

    // AS3: ItemTypeSelectionPreset.as::TYPE_POSTER
    private static readonly TYPE_POSTER: string = 'poster';

    /**
	 * Posters are one furniture type with many faces, so the catalogue lists a single "poster" wall
	 * item and this hard-coded list is what turns it into ~100 rows. The gaps in it are real —
	 * 60-82 and 524-999 are simply not posters that exist — so it is transcribed verbatim rather
	 * than generated from ranges.
	 */
    // AS3: ItemTypeSelectionPreset.as::POSTER_IDS
    private static readonly POSTER_IDS: number[] = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 83,
        500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515,
        516, 517, 518, 520, 521, 522, 523,
        1000, 1001, 1002, 1003, 1004, 1005, 1006,
        2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
    ];

    // AS3: ItemTypeSelectionPreset.as::_SafeStr_5256 (name derived: the vertical list holding the rows)
    private _listWindow: IItemListWindow | null = null;

    // AS3: ItemTypeSelectionPreset.as::_allFurnis
    private _allFurnis: ItemTypeTableObject[] = [];

    // AS3: ItemTypeSelectionPreset.as::_SafeStr_5490 (name derived: the furni-code field)
    private _codeInput: NamedTextInputPreset | null = null;

    // AS3: ItemTypeSelectionPreset.as::_SafeStr_5882 (name derived: the search field)
    private _searchInput: NamedTextInputPreset | null = null;

    // AS3: ItemTypeSelectionPreset.as::_SafeStr_5771 (name derived: the table's container)
    private _tableContainer: IWindowContainer | null = null;

    // AS3: ItemTypeSelectionPreset.as::_SafeStr_5262 (name derived: the results table)
    private _table: TableView | null = null;

    // AS3: ItemTypeSelectionPreset.as::_SafeStr_5944 (name derived: the "showing N" caption)
    private _countText: TextPreset | null = null;

    // AS3: ItemTypeSelectionPreset.as::_SafeStr_4690 (name derived: the selection)
    private _selectedItem: ChestItemType | null = null;

    // AS3: ItemTypeSelectionPreset.as::_ignoreListeners
    private _ignoreListeners: boolean = false;

    // AS3: ItemTypeSelectionPreset.as::_SafeStr_6587 (name derived: the table currently shows everything)
    private _showingAll: boolean = false;

    // AS3: ItemTypeSelectionPreset.as::_listeners
    private _listeners: Array<(item: ChestItemType | null) => void> = [];

    // AS3: ItemTypeSelectionPreset.as::ItemTypeSelectionPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._listWindow = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._listWindow.spacing = wiredStyle.genericVerticalSpacing;

        this.createAllFurnis();

        this._codeInput = presetManager.createNamedTextInput(
            new TextInputParam('', -1, '${wiredcontracts.element.itemtype.furni_code.placeholder}', 150, null, false),
            '${wiredcontracts.element.itemtype.furni_code}'
        );
        this._searchInput = presetManager.createNamedTextInput(
            new TextInputParam('', 220, '', 150),
            '${wiredcontracts.element.itemtype.search}'
        );

        this._tableContainer = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        this._tableContainer.width = 350;
        this._tableContainer.height = 234;

        this._countText = presetManager.createText('-', new TextParam(1));
        this._countText.halfBlend();

        this._listWindow.addListItem(this._codeInput.window);
        this._listWindow.addListItem(this._searchInput.window);
        this._listWindow.addListItem(this._tableContainer as unknown as IWindow);
        this._listWindow.addListItem(this._countText.window);

        this._searchInput.addEventListener('WE_CHANGE', this.onSearchChanged);

        this.createTableView();
        this.refreshShowCount();
    }

    // AS3: ItemTypeSelectionPreset.as::refreshShowCount()
    private refreshShowCount(): void
    {
        if(!this._countText) return;

        this._countText.text = this.localizations.getLocalizationWithParams(
            'wiredcontracts.element.show_count', '', 'amount', String(this._table?.rowCount ?? 0)
        );
    }

    /**
	 * Build the whole catalogue once.
	 *
	 * Three passes, in AS3's order: every floor item, every wall item *except* posters, then the
	 * poster faces expanded from {@link POSTER_IDS}. A furniture with an empty `fullName` is skipped
	 * — the catalogue carries placeholder rows that cannot be donated or traded.
	 */
    // AS3: ItemTypeSelectionPreset.as::createAllFurnis()
    private createAllFurnis(): void
    {
        this._allFurnis = [];

        const sessionData = this._roomEvents.sessionDataManager;

        if(!sessionData) return;

        for(const item of sessionData.getAllFloorItemDatas())
        {
            const fullCode = item.fullName;

            if(fullCode === '') continue;

            this._allFurnis.push(new ItemTypeTableObject(
                new ChestItemType(false, item.id, null),
                ItemTypeSelectionPreset.resolveName(item, fullCode),
                fullCode
            ));
        }

        let posterTypeId = -1;

        for(const item of sessionData.getAllWallItemDatas())
        {
            if(item.className === ItemTypeSelectionPreset.TYPE_POSTER)
            {
                posterTypeId = item.id;

                continue;
            }

            const fullCode = item.fullName;

            if(fullCode === '') continue;

            this._allFurnis.push(new ItemTypeTableObject(
                new ChestItemType(true, item.id, null),
                ItemTypeSelectionPreset.resolveName(item, fullCode),
                fullCode
            ));
        }

        // AS3 guards the wall loop on a `fullCode` that is still the *previous* iteration's value —
        // a decompile artefact of the hoisted locals, not a rule. The guard is applied to this
        // item's own code here, which is what the floor loop above does and plainly the intent.

        if(posterTypeId !== -1)
        {
            const localization = this._roomEvents.localization;

            for(const posterId of ItemTypeSelectionPreset.POSTER_IDS)
            {
                const key = `poster_${posterId}_name`;

                this._allFurnis.push(new ItemTypeTableObject(
                    new ChestItemType(true, posterTypeId, String(posterId)),
                    localization?.getLocalization(key, key) ?? key,
                    `poster*${posterId}`
                ));
            }
        }

        this._allFurnis.sort((a, b) => a.localizedName.localeCompare(b.localizedName));
    }

    /**
	 * TS-only: AS3 repeats `if(localizedName == "") localizedName = fullCode;` in both catalogue
	 * loops. A furniture with no translation falls back to its code rather than rendering blank.
	 */
    private static resolveName(item: IFurnitureData, fullCode: string): string
    {
        return item.localizedName === '' ? fullCode : item.localizedName;
    }

    // AS3: ItemTypeSelectionPreset.as::createTableView()
    private createTableView(): void
    {
        if(!this._tableContainer || !this._roomEvents.windowManager) return;

        this._table = new TableView(this._roomEvents.windowManager, this._tableContainer, false, false);

        this._table.initialize([
            new TableColumn(ItemTypeSelectionPreset.COL_FURNI_NAME, '${wiredcontracts.element.itemtype.col.furni_name}', 0.5, 'left'),
            new TableColumn(ItemTypeSelectionPreset.COL_FURNI_CODE, '${wiredcontracts.element.itemtype.col.furni_code}', 0.3, 'left'),
            new TableColumn(ItemTypeSelectionPreset.COL_FURNI_TYPE, '${wiredcontracts.element.itemtype.col.furni_type}', 0.2, 'left'),
        ], true, true);

        this._table.onRowClickedCallback = this.onListItemClicked;
        this._table.setObjects(this._allFurnis as ITableObject[]);

        this._showingAll = true;
    }

    // AS3: ItemTypeSelectionPreset.as::onListItemClicked()
    private onListItemClicked = (row: ITableObject | null): void =>
    {
        if(row === null) return;

        this.selectedItem = (row as ItemTypeTableObject).chestItemType;
    };

    // AS3: ItemTypeSelectionPreset.as::get selectedItem()
    get selectedItem(): ChestItemType | null
    {
        return this._selectedItem;
    }

    // AS3: ItemTypeSelectionPreset.as::get furniDataForSelectedItem()
    get furniDataForSelectedItem(): IFurnitureData | null
    {
        if(this._selectedItem === null) return null;

        const sessionData = this._roomEvents.sessionDataManager;

        if(!sessionData) return null;

        return this._selectedItem.isWallItem
            ? sessionData.getWallItemData(this._selectedItem.typeId)
            : sessionData.getFloorItemData(this._selectedItem.typeId);
    }

    /**
	 * Clear the search without letting the change handler see it — `_ignoreListeners` exists so the
	 * programmatic reset does not run the filter twice.
	 */
    // AS3: ItemTypeSelectionPreset.as::resetInteractions()
    resetInteractions(): void
    {
        this._ignoreListeners = true;

        if(this._searchInput) this._searchInput.text = '';

        this._ignoreListeners = false;

        this.updateFilters();
        this._table?.resetScrollingNextUpdate();
    }

    // AS3: ItemTypeSelectionPreset.as::onSearchChanged()
    private onSearchChanged = (): void =>
    {
        if(this._ignoreListeners) return;

        this.updateFilters();
    };

    /**
	 * Filter the table against the search box.
	 *
	 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/contracts/ItemTypeSelectionPreset.as::updateFilters()
	 * **The AS3 body is mangled and this is a reconstruction.** The decompile reads:
	 *
	 *     for each(item in _allFurnis) {
	 *        do { for each(term in terms) { } result.push(item); break; } while(item.matchesSubstring(query));
	 *     }
	 *
	 * — an empty inner loop, an unconditional `push`, and a `while` whose condition can never run
	 * because of the `break`. As written it would return the entire catalogue for every query, which
	 * is not a filter. The surviving pieces say what it meant: the query is split on spaces into
	 * `terms`, and `matchesSubstring` is the predicate. What cannot be recovered is whether the
	 * terms are combined with AND or OR — the loop that used them is gone.
	 *
	 * This ports the one predicate that is actually readable, `matchesSubstring(query)` on the whole
	 * lowercased query, and leaves the term split unused rather than inventing a combinator. A
	 * multi-word search therefore matches literally, spaces included.
	 *
	 * The `< 2` short-circuit and the `_showingAll` latch are intact in the source and are ported as
	 * written: a query under two characters shows everything, and the latch stops that from
	 * re-setting the same full list on every keystroke.
	 */
    private updateFilters(): void
    {
        const query = (this._searchInput?.text ?? '').toLowerCase();
        let rows: ItemTypeTableObject[];

        if(query.length < 2)
        {
            if(this._showingAll) return;

            rows = this._allFurnis;
            this._showingAll = true;
        }
        else
        {
            rows = this._allFurnis.filter((item) => item.matchesSubstring(query));
            this._showingAll = false;
        }

        this._table?.setObjects(rows as ITableObject[]);
        this.refreshShowCount();
    }

    /**
	 * Setting a selection also writes the code field, and a *poster* writes `poster*<face>` rather
	 * than the furniture's own name — the code box is what the player copies out.
	 *
	 * An item whose furniture data cannot be resolved is refused: the selection is rolled back to
	 * null and the listeners are told a second time.
	 */
    // AS3: ItemTypeSelectionPreset.as::set selectedItem()
    set selectedItem(value: ChestItemType | null)
    {
        this._selectedItem = value;

        this.notifyListeners(value);

        if(value === null)
        {
            if(this._codeInput) this._codeInput.text = '';

            return;
        }

        const sessionData = this._roomEvents.sessionDataManager;
        const furniData = value.isWallItem
            ? sessionData?.getWallItemData(value.typeId) ?? null
            : sessionData?.getFloorItemData(value.typeId) ?? null;

        if(furniData === null)
        {
            this._selectedItem = null;

            if(this._codeInput) this._codeInput.text = '';

            this.notifyListeners(null);

            return;
        }

        if(!this._codeInput) return;

        this._codeInput.text = value.isWallItem && furniData.className === ItemTypeSelectionPreset.TYPE_POSTER
            ? `poster*${value.legacyPosterId}`
            : furniData.fullName;
    }

    // AS3: ItemTypeSelectionPreset.as::addListener()
    addListener(listener: (item: ChestItemType | null) => void): void
    {
        this._listeners.push(listener);
    }

    // AS3: ItemTypeSelectionPreset.as::notifyListeners()
    private notifyListeners(item: ChestItemType | null): void
    {
        for(const listener of this._listeners)
        {
            listener(item);
        }
    }

    // AS3: ItemTypeSelectionPreset.as::get window()
    override get window(): IWindow
    {
        return this._listWindow as unknown as IWindow;
    }

    /**
	 * The table container is resized only when the width actually changed, because
	 * `resizeHorizontally()` re-lays every row out and the parent calls this on every reflow.
	 */
    // AS3: ItemTypeSelectionPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        if(this._listWindow) (this._listWindow as unknown as IWindow).width = width;

        this._codeInput?.resizeToWidth(width);
        this._searchInput?.resizeToWidth(width);
        this._countText?.resizeToWidth(width);

        if(this._tableContainer && this._tableContainer.width !== width)
        {
            this._tableContainer.width = width;
            this._table?.resizeHorizontally();
        }
    }

    // AS3: ItemTypeSelectionPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._codeInput, this._searchInput, this._countText].filter(
            (preset): preset is NamedTextInputPreset | TextPreset => preset !== null
        );
    }

    /**
	 * AS3 disposes the table *before* `super.dispose()` and the list window *after* it — the base
	 * disposes the child presets in between, and they sit inside that list.
	 */
    // AS3: ItemTypeSelectionPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this._table !== null)
        {
            this._table.dispose();
            this._table = null;
        }

        super.dispose();

        if(this._listWindow !== null)
        {
            (this._listWindow as unknown as IWindow).dispose();
            this._listWindow = null;
        }

        this._allFurnis = [];
        this._codeInput = null;
        this._searchInput = null;
        this._tableContainer = null;
        this._selectedItem = null;
        this._countText = null;
        this._listeners = [];
    }
}
