import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import {TableView} from '@habbo/window/utils/tableview/TableView';
import {Logger} from '@core/utils/Logger';
import type {ChooserItem} from '../ChooserItem';
import {FurniChooserTableObject} from './FurniChooserTableObject';
import type {FurniChooserWidget} from './FurniChooserWidget';

const log = Logger.getLogger('habbo.ui.widget.chooser.furni.FurniView');

/**
 * The "what furniture is in this room" window: a search box, an **owner** dropdown built from the
 * items themselves, and a three-column table.
 *
 * The user chooser's sibling, and near-identical to it — the two differences are that the search
 * here is multi-token, and that the filter dropdown is populated at runtime rather than fixed.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/furni/FurniView.as
 */
export class FurniView
{
    // AS3: .../chooser/furni/FurniView.as::COLUMN_FURNI_NAME
    public static readonly COLUMN_FURNI_NAME: string = 'name';

    // AS3: .../chooser/furni/FurniView.as::COLUMN_FURNI_OWNER
    public static readonly COLUMN_FURNI_OWNER: string = 'owner';

    // AS3: .../chooser/furni/FurniView.as::COLUMN_ID
    public static readonly COLUMN_ID: string = 'id';

    // AS3: .../chooser/furni/FurniView.as::COLUMN_NAME_WIDTH
    // Name DERIVED: the three column weights AS3 passes inline.
    private static readonly COLUMN_NAME_WIDTH: number = 0.5;

    // AS3: .../chooser/furni/FurniView.as::COLUMN_OWNER_WIDTH
    private static readonly COLUMN_OWNER_WIDTH: number = 0.25;

    // AS3: .../chooser/furni/FurniView.as::COLUMN_ID_WIDTH
    private static readonly COLUMN_ID_WIDTH: number = 0.25;

    // AS3: .../chooser/furni/FurniView.as::WINDOW_MARGIN
    // Name DERIVED: the 10px inset from the parent's top-right corner.
    private static readonly WINDOW_MARGIN: number = 10;

    /**
     * Name DERIVED. Below this many entries the owner dropdown is disabled and half-faded — with
     * the default entry plus one owner there is nothing to choose between.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/furni/FurniView.as::MIN_OWNERS_FOR_FILTER
    private static readonly MIN_OWNERS_FOR_FILTER: number = 2;

    // AS3: .../chooser/furni/FurniView.as::_widget
    private _widget: FurniChooserWidget | null;

    // AS3: .../chooser/furni/FurniView.as::_title
    private _title: string;

    // AS3: .../chooser/furni/FurniView.as::_tableView
    private _tableView: TableView | null = null;

    // AS3: .../chooser/furni/FurniView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../chooser/furni/FurniView.as::_ignoreListeners
    // Unlike the user chooser's, this one **is** set — `constructOwners()` raises it while it
    // repopulates the dropdown, so the resulting WE_SELECTED does not re-filter mid-rebuild.
    private _ignoreListeners: boolean = false;

    // AS3: .../chooser/furni/FurniView.as::FurniView()
    constructor(widget: FurniChooserWidget, title: string)
    {
        this._widget = widget;
        this._title = title;
    }

    // AS3: .../chooser/furni/FurniView.as::isOpen()
    isOpen(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    // AS3: .../chooser/furni/FurniView.as::onItemsChanged()
    // Rebuilds the owner list before filtering, so a newly placed item's owner appears in the
    // dropdown — the user chooser has no equivalent step.
    onItemsChanged(): void
    {
        if(this._widget === null) return;

        if(this._window === null) this.createWindow();

        this.constructOwners();
        this.populateWithFilters();
    }

    /**
     * Rebuilds the owner dropdown from the current items, with a localised "all" entry first.
     *
     * It only repopulates when the count changed — or when the single entry is empty, which is
     * the freshly-built dropdown. That guard is what stops the selection resetting on every
     * refresh.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/furni/FurniView.as::constructOwners()
    constructOwners(): void
    {
        const dropdown = this.usernameDropDown;

        if(dropdown === null || dropdown === undefined) return;

        this._ignoreListeners = true;

        const seen = new Set<string | null>();
        const owners: string[] = [this.localize('new_furni_chooser.owner_selector.default')];

        for(const item of this._widget?.items ?? [])
        {
            if(seen.has(item.owner)) continue;

            // AS3 pushes the owner even when it is null, which lands as the string "null" in the
            // menu. Kept: the filter compares against the same value, so such a row is still
            // selectable rather than unreachable.
            owners.push(item.owner as string);
            seen.add(item.owner);
        }

        const isFresh = dropdown.numMenuItems === 1 && dropdown.enumerateSelection()[0] === '';

        if(dropdown.numMenuItems !== owners.length || isFresh)
        {
            dropdown.populate(owners);
            dropdown.selection = 0;

            if(owners.length <= FurniView.MIN_OWNERS_FOR_FILTER)
            {
                dropdown.disable();
                dropdown.blend = 0.5;
            }
            else
            {
                dropdown.enable();
                dropdown.blend = 1;
            }
        }

        this._ignoreListeners = false;
    }

    // AS3: .../chooser/furni/FurniView.as::localize()
    localize(key: string): string
    {
        return this._widget?.localizations?.getLocalization(key, key) ?? key;
    }

    // AS3: .../chooser/furni/FurniView.as::dispose()
    // Disposes the window but not the table view, as in AS3 — only `hideWindow()` does that.
    dispose(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../chooser/furni/FurniView.as::createWindow()
    private createWindow(): void
    {
        this._window = this._widget?.windowManager.buildWidgetLayout('new_furni_chooser_view') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('new_furni_chooser_view did not build — the furni chooser cannot be shown');
            this._window = null;

            return;
        }

        this._window.caption = this._title;

        this.createTable();

        this.closeButton?.addEventListener('WME_CLICK', this.onClose);
        this.searchTextInput?.addEventListener('WE_CHANGE', this.onSearchChanged);
        this.usernameDropDown?.addEventListener('WE_SELECTED', this.onUsernameChanged);
        this.clearButton?.addEventListener('WME_CLICK', this.onClearClicked);

        const parent = this._window.parent;

        if(parent !== null)
        {
            this._window.x = parent.width - this._window.width - FurniView.WINDOW_MARGIN;
            this._window.y = FurniView.WINDOW_MARGIN;
        }
    }

    // AS3: .../chooser/furni/FurniView.as::createTable()
    private createTable(): void
    {
        const container = this.tableViewContainer;

        if(container === null || this._widget === null) return;

        this._tableView = new TableView(this._widget.windowManager, container, true);

        this._tableView.initialize(
            [
                new TableColumn(FurniView.COLUMN_FURNI_NAME, this.localize('new_furni_chooser.col.name'), FurniView.COLUMN_NAME_WIDTH, 'left'),
                new TableColumn(FurniView.COLUMN_FURNI_OWNER, this.localize('new_furni_chooser.col.owner'), FurniView.COLUMN_OWNER_WIDTH, 'left'),
                new TableColumn(FurniView.COLUMN_ID, this.localize('new_furni_chooser.col.id'), FurniView.COLUMN_ID_WIDTH, 'left')
            ],
            true,
            true
        );

        this._tableView.onRowClickedCallback = this.onListItemClicked;
    }

    /**
     * The search is **multi-token**: the box is split on spaces and an item must contain *every*
     * token in its lower-cased name — unlike the user chooser, which matches one substring.
     *
     * REPAIRED. The decompilation of this method is damaged in the way this project has seen four
     * times before: the token loop collapses into `do { for each(token in tokens) {} ... break; }
     * while(item.lowerCaseName.indexOf(token) != -1)`, an empty `for each` body followed by an
     * unconditional `break`, with the real test stranded in the `while`. `UsersView` is the intact
     * sibling and shows the shape: filter, then push. Rebuilt as an every-token match, which is
     * what the split and the stranded `indexOf` together can only mean.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/furni/FurniView.as::populateWithFilters()
    private populateWithFilters(): void
    {
        const tokens = (this.searchTextInput?.text ?? '').toLowerCase().split(' ');
        const dropdown = this.usernameDropDown;
        const selection = dropdown?.selection ?? 0;
        const owner = selection > 0 ? (dropdown?.enumerateSelection()[selection] ?? null) : null;

        const filtered: ChooserItem[] = [];

        for(const item of this._widget?.items ?? [])
        {
            if(!tokens.every((token) => item.lowerCaseName.indexOf(token) !== -1)) continue;

            if(owner !== null && item.owner !== owner) continue;

            filtered.push(item);
        }

        this.populate(filtered);

        const indicator = this.amountIndicator;

        if(indicator !== null && indicator !== undefined)
        {
            indicator.text = this._widget?.localizations?.getLocalizationWithParams(
                'new_furni_chooser.amount_indicator', '', 'amount', String(filtered.length)
            ) ?? '';
        }
    }

    // AS3: .../chooser/furni/FurniView.as::populate()
    private populate(items: ChooserItem[]): void
    {
        const objects: ITableObject[] = items.map((item) => new FurniChooserTableObject(item));

        this._tableView?.setObjects(objects);
    }

    // AS3: .../chooser/furni/FurniView.as::hideWindow()
    private hideWindow(): void
    {
        if(this._window === null) return;

        this._tableView?.dispose();
        this._tableView = null;
        this._window.dispose();
        this._window = null;
    }

    // AS3: .../chooser/furni/FurniView.as::onListItemClicked()
    private onListItemClicked = (row: ITableObject | null): void =>
    {
        if(!(row instanceof FurniChooserTableObject)) return;

        const item = row.chooserItem;

        if(item === null || item === undefined) return;

        this._widget?.choose(item.id, item.category);
    };

    // AS3: .../chooser/furni/FurniView.as::onClose()
    private onClose = (): void =>
    {
        this.hideWindow();
    };

    // AS3: .../chooser/furni/FurniView.as::onClearClicked()
    private onClearClicked = (): void =>
    {
        if(this._ignoreListeners) return;

        const input = this.searchTextInput;

        if(input !== null && input !== undefined) input.text = '';

        this.onSearchChanged();
    };

    // AS3: .../chooser/furni/FurniView.as::onSearchChanged()
    private onSearchChanged = (): void =>
    {
        if(this._ignoreListeners) return;

        const text = this.searchTextInput?.text ?? '';
        const clear = this.clearButton;
        const placeholder = this.textPlaceholder;

        if(clear !== null && clear !== undefined) clear.visible = text.length > 0;

        if(placeholder !== null && placeholder !== undefined) placeholder.visible = text.length === 0;

        this.populateWithFilters();
    };

    // AS3: .../chooser/furni/FurniView.as::onUsernameChanged()
    private onUsernameChanged = (): void =>
    {
        if(this._ignoreListeners) return;

        this.populateWithFilters();
    };

    // AS3: .../chooser/furni/FurniView.as::get closeButton()
    private get closeButton()
    {
        return this._window?.findChildByTag('close') ?? null;
    }

    // AS3: .../chooser/furni/FurniView.as::get tableViewContainer()
    private get tableViewContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('table_container') ?? null) as IWindowContainer | null;
    }

    // AS3: .../chooser/furni/FurniView.as::get textPlaceholder()
    private get textPlaceholder(): ITextWindow | null
    {
        return (this._window?.findChildByName('search_placeholder') ?? null) as ITextWindow | null;
    }

    // AS3: .../chooser/furni/FurniView.as::get searchTextInput()
    private get searchTextInput(): ITextFieldWindow | null
    {
        return (this._window?.findChildByName('text_input') ?? null) as ITextFieldWindow | null;
    }

    // AS3: .../chooser/furni/FurniView.as::get usernameDropDown()
    // Named for the owner it filters on; the layout calls it `username_dropdown`.
    private get usernameDropDown(): IDropMenuWindow | null
    {
        return (this._window?.findChildByName('username_dropdown') ?? null) as IDropMenuWindow | null;
    }

    // AS3: .../chooser/furni/FurniView.as::get clearButton()
    private get clearButton(): IWindowContainer | null
    {
        return (this._window?.findChildByName('clear_button') ?? null) as IWindowContainer | null;
    }

    // AS3: .../chooser/furni/FurniView.as::get amountIndicator()
    private get amountIndicator(): ITextWindow | null
    {
        return (this._window?.findChildByName('amount_indicator') ?? null) as ITextWindow | null;
    }
}
