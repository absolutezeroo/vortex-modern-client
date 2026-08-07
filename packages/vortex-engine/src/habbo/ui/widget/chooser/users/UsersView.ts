import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import {TableView} from '@habbo/window/utils/tableview/TableView';
import {Logger} from '@core/utils/Logger';
import type {ChooserItem} from '../ChooserItem';
import {UsersChooserTableObject} from './UsersChooserTableObject';
import type {UsersChooserWidget} from './UsersChooserWidget';

const log = Logger.getLogger('habbo.ui.widget.chooser.users.UsersView');

/**
 * The "who is in this room" window: a search box, a type filter and a two-column table.
 *
 * It filters in place — the widget owns the full item list and this only ever narrows it, so the
 * search never asks the room again.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/users/UsersView.as
 */
export class UsersView
{
    // AS3: .../chooser/users/UsersView.as::COLUMN_USER_NAME
    public static readonly COLUMN_USER_NAME: string = 'name';

    // AS3: .../chooser/users/UsersView.as::COLUMN_TYPE
    public static readonly COLUMN_TYPE: string = 'type';

    // AS3: .../chooser/users/UsersView.as::COLUMN_NAME_WIDTH
    // Name DERIVED: the two column weights AS3 passes inline.
    private static readonly COLUMN_NAME_WIDTH: number = 0.65;

    // AS3: .../chooser/users/UsersView.as::COLUMN_TYPE_WIDTH
    private static readonly COLUMN_TYPE_WIDTH: number = 0.35;

    // AS3: .../chooser/users/UsersView.as::WINDOW_MARGIN
    // Name DERIVED: the 10px inset from the parent's top-right corner.
    private static readonly WINDOW_MARGIN: number = 10;

    /**
     * AS3: .../chooser/users/UsersView.as::DROPDOWN_INDEX_REMAP_FROM
     *
     * Names DERIVED. The type dropdown's selections map onto user types 1:1 except the last:
     * selection 3 means user type **4**. There is no type 3 in the list, so the dropdown's fourth
     * entry has to be remapped by hand.
     */
    private static readonly DROPDOWN_INDEX_REMAP_FROM: number = 3;

    // AS3: .../chooser/users/UsersView.as::DROPDOWN_INDEX_REMAP_TO
    private static readonly DROPDOWN_INDEX_REMAP_TO: number = 4;

    // AS3: .../chooser/users/UsersView.as::_widget
    private _widget: UsersChooserWidget | null;

    // AS3: .../chooser/users/UsersView.as::_title
    private _title: string;

    // AS3: .../chooser/users/UsersView.as::_tableView
    private _tableView: TableView | null = null;

    // AS3: .../chooser/users/UsersView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../chooser/users/UsersView.as::_ignoreListeners
    // Declared and checked by all three input handlers, but never *set* — so the guard is
    // permanently false. Kept, since removing it would drop three real guards from the port.
    private _ignoreListeners: boolean = false;

    // AS3: .../chooser/users/UsersView.as::UsersView()
    // Builds nothing — the first `onItemsChanged()` is what creates the window.
    constructor(widget: UsersChooserWidget, title: string)
    {
        this._widget = widget;
        this._title = title;
    }

    // AS3: .../chooser/users/UsersView.as::isOpen()
    isOpen(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    // AS3: .../chooser/users/UsersView.as::onItemsChanged()
    // Creates the window on first use, then re-filters — so new arrivals refresh a list that is
    // already up without reopening it.
    onItemsChanged(): void
    {
        if(this._widget === null) return;

        if(this._window === null) this.createWindow();

        this.populateWithFilters();
    }

    // AS3: .../chooser/users/UsersView.as::localize()
    // Falls back to the key itself rather than to an empty string.
    localize(key: string): string
    {
        return this._widget?.localizations?.getLocalization(key, key) ?? key;
    }

    // AS3: .../chooser/users/UsersView.as::dispose()
    // Disposes the window but *not* the table view, in AS3 too — only `hideWindow()` does that.
    dispose(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../chooser/users/UsersView.as::createWindow()
    // Placed against the top-right of its parent rather than centred.
    private createWindow(): void
    {
        this._window = this._widget?.windowManager.buildWidgetLayout('new_user_chooser_view') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('new_user_chooser_view did not build — the user chooser cannot be shown');
            this._window = null;

            return;
        }

        this._window.caption = this._title;

        this.createTable();

        this.closeButton?.addEventListener('WME_CLICK', this.onClose);
        this.searchTextInput?.addEventListener('WE_CHANGE', this.onSearchChanged);
        this.typeDropdown?.addEventListener('WE_SELECTED', this.onTypeChanged);
        this.clearButton?.addEventListener('WME_CLICK', this.onClearClicked);

        const parent = this._window.parent;

        if(parent !== null)
        {
            this._window.x = parent.width - this._window.width - UsersView.WINDOW_MARGIN;
            this._window.y = UsersView.WINDOW_MARGIN;
        }
    }

    // AS3: .../chooser/users/UsersView.as::createTable()
    private createTable(): void
    {
        const container = this.tableViewContainer;

        if(container === null || this._widget === null) return;

        this._tableView = new TableView(this._widget.windowManager, container, true);

        this._tableView.initialize(
            [
                new TableColumn(UsersView.COLUMN_USER_NAME, this.localize('new_user_chooser.col.name'), UsersView.COLUMN_NAME_WIDTH, 'left'),
                new TableColumn(UsersView.COLUMN_TYPE, this.localize('new_user_chooser.col.type'), UsersView.COLUMN_TYPE_WIDTH, 'left')
            ],
            true,
            true
        );

        this._tableView.onRowClickedCallback = this.onListItemClicked;
    }

    /**
     * AS3: .../chooser/users/UsersView.as::populateWithFilters()
     *
     * Both filters at once: the search matches anywhere in the lower-cased name, and the type
     * dropdown filters by exact type — with selection 0 meaning "all", so the `> 0` test is what
     * makes the first entry a no-op.
     */
    private populateWithFilters(): void
    {
        const search = (this.searchTextInput?.text ?? '').toLowerCase();

        let type = this.typeDropdown?.selection ?? 0;

        if(type === UsersView.DROPDOWN_INDEX_REMAP_FROM) type = UsersView.DROPDOWN_INDEX_REMAP_TO;

        const filtered: ChooserItem[] = [];

        for(const item of this._widget?.items ?? [])
        {
            if(search.length > 0 && item.lowerCaseName.indexOf(search) === -1) continue;

            if(type > 0 && item.type !== type) continue;

            filtered.push(item);
        }

        this.populate(filtered);

        const indicator = this.amountIndicator;

        if(indicator !== null && indicator !== undefined)
        {
            indicator.text = this._widget?.localizations?.getLocalizationWithParams(
                'new_user_chooser.amount_indicator', '', 'amount', String(filtered.length)
            ) ?? '';
        }
    }

    // AS3: .../chooser/users/UsersView.as::populate()
    private populate(items: ChooserItem[]): void
    {
        const objects: ITableObject[] = items.map((item) => new UsersChooserTableObject(item));

        this._tableView?.setObjects(objects);
    }

    // AS3: .../chooser/users/UsersView.as::hideWindow()
    // Unlike `dispose()` this one tears the table down too, which is why closing and reopening
    // rebuilds the columns.
    private hideWindow(): void
    {
        if(this._window === null) return;

        this._tableView?.dispose();
        this._tableView = null;
        this._window.dispose();
        this._window = null;
    }

    // AS3: .../chooser/users/UsersView.as::onListItemClicked()
    private onListItemClicked = (row: ITableObject | null): void =>
    {
        if(!(row instanceof UsersChooserTableObject)) return;

        const item = row.chooserItem;

        if(item === null || item === undefined) return;

        this._widget?.choose(item.id, item.category);
    };

    // AS3: .../chooser/users/UsersView.as::onClose()
    private onClose = (): void =>
    {
        this.hideWindow();
    };

    // AS3: .../chooser/users/UsersView.as::onClearClicked()
    // Clears the box and then runs the search handler by hand, rather than relying on WE_CHANGE.
    private onClearClicked = (): void =>
    {
        if(this._ignoreListeners) return;

        const input = this.searchTextInput;

        if(input !== null && input !== undefined) input.text = '';

        this.onSearchChanged();
    };

    // AS3: .../chooser/users/UsersView.as::onSearchChanged()
    // The clear button and the placeholder are exact opposites of each other.
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

    // AS3: .../chooser/users/UsersView.as::onTypeChanged()
    private onTypeChanged = (): void =>
    {
        if(this._ignoreListeners) return;

        this.populateWithFilters();
    };

    // AS3: .../chooser/users/UsersView.as::get closeButton()
    // By tag, not by name — the only one of the seven that is.
    private get closeButton()
    {
        return this._window?.findChildByTag('close') ?? null;
    }

    // AS3: .../chooser/users/UsersView.as::get tableViewContainer()
    private get tableViewContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('table_container') ?? null) as IWindowContainer | null;
    }

    // AS3: .../chooser/users/UsersView.as::get textPlaceholder()
    private get textPlaceholder(): ITextWindow | null
    {
        return (this._window?.findChildByName('search_placeholder') ?? null) as ITextWindow | null;
    }

    // AS3: .../chooser/users/UsersView.as::get searchTextInput()
    private get searchTextInput(): ITextFieldWindow | null
    {
        return (this._window?.findChildByName('text_input') ?? null) as ITextFieldWindow | null;
    }

    // AS3: .../chooser/users/UsersView.as::get typeDropdown()
    // AS3 types this as its drop-menu interface (`_SafeCls_2308`, the one with `selection` and
    // `openMenu`); this port calls the same thing `IDropMenuWindow`.
    private get typeDropdown(): IDropMenuWindow | null
    {
        return (this._window?.findChildByName('type_dropdown') ?? null) as IDropMenuWindow | null;
    }

    // AS3: .../chooser/users/UsersView.as::get clearButton()
    private get clearButton(): IWindowContainer | null
    {
        return (this._window?.findChildByName('clear_button') ?? null) as IWindowContainer | null;
    }

    // AS3: .../chooser/users/UsersView.as::get amountIndicator()
    private get amountIndicator(): ITextWindow | null
    {
        return (this._window?.findChildByName('amount_indicator') ?? null) as ITextWindow | null;
    }
}
