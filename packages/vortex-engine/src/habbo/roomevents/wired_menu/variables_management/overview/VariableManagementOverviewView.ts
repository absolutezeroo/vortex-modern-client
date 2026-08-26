import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';

import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {RequestVariableManagementComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestVariableManagementComposer';

import {PagedTableView} from '../../../common/PagedTableView';
import {VariableManagementConfig} from './VariableManagementConfig';
import type {VariableManagementOverviewController} from './VariableManagementOverviewController';
import {VariableManagementOverviewTableObject} from './VariableManagementOverviewTableObject';

/**
 * VariableManagementOverviewView — the "manage variable" window: a paginated table of every entity
 * holding a value of one managed variable, with user-type and sort dropdown filters. Each row links to
 * the holder's profile (users) and to the per-holder detail view. Extends PagedTableView.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/overview/VariableManagementOverviewView.as
 */
export class VariableManagementOverviewView extends PagedTableView
{
    // AS3: VariableManagementOverviewView.as::REQUEST_PAGE_RATELIMIT
    private static readonly REQUEST_PAGE_RATELIMIT: number = 280;

    /**
	 * The table's column keys, which double as the sort keys sent to the server
	 *
	 * `value` has no constant in AS3 — it is the one column written as a literal there — so it
	 * stays a literal here too rather than inventing a name for it.
	 */
    // AS3: VariableManagementOverviewView.as::LOG_COLUMN_USERTYPE
    public static readonly LOG_COLUMN_USERTYPE: string = 'usertype';

    // AS3: VariableManagementOverviewView.as::LOG_COLUMN_NAME
    public static readonly LOG_COLUMN_NAME: string = 'name';

    // AS3: VariableManagementOverviewView.as::LOG_COLUMN_CREATION_TIME
    public static readonly LOG_COLUMN_CREATION_TIME: string = 'creation_time';

    // AS3: VariableManagementOverviewView.as::LOG_COLUMN_LAST_UPDATE_TIME
    public static readonly LOG_COLUMN_LAST_UPDATE_TIME: string = 'last_update_time';

    // AS3: VariableManagementOverviewView.as::LOG_COLUMN_MANAGE
    public static readonly LOG_COLUMN_MANAGE: string = 'manage';

    // AS3: VariableManagementOverviewView.as::_SafeStr_4593 (name derived: the controller)
    private _controller: VariableManagementOverviewController;

    // AS3: VariableManagementOverviewView.as::_ignoreDropmenuEvents
    private _ignoreDropmenuEvents: boolean = false;

    // AS3: VariableManagementOverviewView.as::VariableManagementOverviewView()
    constructor(controller: VariableManagementOverviewController, windowManager: IHabboWindowManager)
    {
        super('variables_management_overview_xml', windowManager, controller.localizationManager);
        this._controller = controller;
        this.userTypeMenu.addEventListener('WE_SELECT', this._onSelectFilter);
        this.sortTypeMenu.addEventListener('WE_SELECT', this._onSelectFilter);
        this.userTypeMenu.addEventListener('WE_SELECTED', this._onSelectedFilter);
        this.sortTypeMenu.addEventListener('WE_SELECTED', this._onSelectedFilter);
    }

    // AS3: VariableManagementOverviewView.as::displayNewPage()
    displayNewPage(): void
    {
        if(this._controller.page == null)
        {
            return;
        }

        const page = this._controller.page;
        const variable = this._controller.roomEvents.variablesSynchronizer.getCachedVariableById(page.variableId);

        if(variable == null)
        {
            return;
        }

        this.variableNameValue.text = variable.variableName;
        this.userTypeOption = page.userTypeFilter;
        this.sortTypeOption = page.sortTypFilter;
        this.onPageLoaded();
        const rows: ITableObject[] = [];

        for(const element of page.elements)
        {
            rows.push(new VariableManagementOverviewTableObject(this._controller, element, variable));
        }

        this._table.setObjects(rows);
        this._table.scrollToTop();
        this._window.activate();
    }

    // AS3: VariableManagementOverviewView.as::createTable()
    protected override createTable(): void
    {
        this._table = new TableView(this._windowManager, this.tableViewContainer, true);
        const columns = [
            new TableColumn(VariableManagementOverviewView.LOG_COLUMN_USERTYPE, this.loc('wiredmenu.variable_management.col.usertype'), 0.1),
            new TableColumn(VariableManagementOverviewView.LOG_COLUMN_NAME, this.loc('wiredmenu.variable_management.col.name'), 0.18),
            new TableColumn(VariableManagementOverviewView.LOG_COLUMN_CREATION_TIME, this.loc('wiredmenu.variable_management.col.creation_time'), 0.21),
            new TableColumn(VariableManagementOverviewView.LOG_COLUMN_LAST_UPDATE_TIME, this.loc('wiredmenu.variable_management.col.last_update_time'), 0.21),
            new TableColumn('value', this.loc('wiredmenu.variable_management.col.value'), 0.18),
            new TableColumn(VariableManagementOverviewView.LOG_COLUMN_MANAGE, this.loc('wiredmenu.variable_management.col.manage'), 0.12)
        ];
        this._table.initialize(columns, true, true);
    }

    // AS3: VariableManagementOverviewView.as::calculateLastPage()
    protected override calculateLastPage(): number
    {
        if(this._controller.page == null)
        {
            return -1;
        }

        return Math.trunc(Math.max(this._controller.page.totalEntries - 1, 0) / VariableManagementConfig.PAGE_SIZE + 1);
    }

    // AS3: VariableManagementOverviewView.as::currentPage()
    protected override currentPage(): number
    {
        if(this._controller.page == null)
        {
            return -1;
        }

        return this._controller.page.currentPage;
    }

    // AS3: VariableManagementOverviewView.as::requestPageRatelimit()
    protected override requestPageRatelimit(): number
    {
        return VariableManagementOverviewView.REQUEST_PAGE_RATELIMIT;
    }

    // AS3: VariableManagementOverviewView.as::pagingTextKey()
    protected override pagingTextKey(): string
    {
        return 'wiredmenu.variable_management.bottom_text';
    }

    // AS3: VariableManagementOverviewView.as::totalEntries()
    protected override totalEntries(): number
    {
        if(this._controller.page == null)
        {
            return -1;
        }

        return this._controller.page.totalEntries;
    }

    // AS3: VariableManagementOverviewView.as::requestPageWithFilters()
    private requestPageWithFilters(page: number, sort: number, userType: number): boolean
    {
        if(!super.requestPage(page))
        {
            return false;
        }

        const current = this._controller.page;

        if(current == null)
        {
            return false;
        }

        if(sort === 2147483647)
        {
            sort = current.sortTypFilter;
        }

        if(userType === 2147483647)
        {
            userType = current.userTypeFilter;
        }

        this._controller.send(new RequestVariableManagementComposer(current.variableId, page, VariableManagementConfig.PAGE_SIZE, sort, userType));
        this.onPageLoaded();
        return true;
    }

    // AS3: VariableManagementOverviewView.as::requestPage()
    protected override requestPage(page: number): boolean
    {
        return this.requestPageWithFilters(page, 2147483647, 2147483647);
    }

    // AS3: VariableManagementOverviewView.as::onSelectFilter()
    private _onSelectFilter = (event: WindowEvent): void =>
    {
        if(this._ignoreDropmenuEvents)
        {
            return;
        }

        if(!this.canRequestNewPage(false))
        {
            event.preventWindowOperation();
        }
    };

    // AS3: VariableManagementOverviewView.as::onSelectedFilter()
    private _onSelectedFilter = (_event: WindowEvent): void =>
    {
        if(this._ignoreDropmenuEvents)
        {
            return;
        }

        if(!this.canRequestNewPage(false))
        {
            return;
        }

        this.requestPageWithFilters(1, this.sortTypeOption, this.userTypeOption);
    };

    // AS3: VariableManagementOverviewView.as::set sortTypeOption()
    private set sortTypeOption(value: number)
    {
        this._ignoreDropmenuEvents = true;
        this.sortTypeMenu.selection = value;
        this._ignoreDropmenuEvents = false;
    }

    // AS3: VariableManagementOverviewView.as::get sortTypeOption()
    private get sortTypeOption(): number
    {
        return this.sortTypeMenu.selection;
    }

    // AS3: VariableManagementOverviewView.as::set userTypeOption()
    private set userTypeOption(value: number)
    {
        let selection = value;

        if(selection === 4)
        {
            selection = 3;
        }
        else if(selection !== 1 && selection !== 2)
        {
            selection = 0;
        }

        this._ignoreDropmenuEvents = true;
        this.userTypeMenu.selection = selection;
        this._ignoreDropmenuEvents = false;
    }

    // AS3: VariableManagementOverviewView.as::get userTypeOption()
    private get userTypeOption(): number
    {
        const selection = this.userTypeMenu.selection;

        if(selection === 3)
        {
            return 4;
        }

        if(selection === 1 || selection === 2)
        {
            return selection;
        }

        return -1;
    }

    // AS3: VariableManagementOverviewView.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._controller = null as unknown as VariableManagementOverviewController;
    }

    // AS3: VariableManagementOverviewView.as::get variableNameValue()
    private get variableNameValue(): ITextWindow
    {
        return this._window.findChildByName('variable_name_value') as unknown as ITextWindow;
    }

    // AS3: VariableManagementOverviewView.as::get userTypeMenu()
    private get userTypeMenu(): IDropMenuWindow
    {
        return this._window.findChildByName('user_type_menu') as unknown as IDropMenuWindow;
    }

    // AS3: VariableManagementOverviewView.as::get sortTypeMenu()
    private get sortTypeMenu(): IDropMenuWindow
    {
        return this._window.findChildByName('sort_type_menu') as unknown as IDropMenuWindow;
    }
}
