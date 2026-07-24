import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';

import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {RequestWiredRoomLogsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredRoomLogsComposer';

import {PagedTableView} from '../../common/PagedTableView';
import {WiredRoomLogsConfig} from './WiredRoomLogsConfig';
import type {WiredRoomLogListController} from './WiredRoomLogListController';
import {WiredRoomLogListTableObject} from './WiredRoomLogListTableObject';

/**
 * WiredRoomLogListView — the room-logs window: a paginated, filterable table of wired executions and
 * errors. Adds source/level dropdown filters and a free-text filter on top of PagedTableView, plus an
 * auto-refresh checkbox that re-requests the current page on a timer.
 *
 * Port note: flash Timer → setInterval for the auto-refresh; the AS3 timer-reset-on-filter-change is
 * preserved (restartRefreshTimer). AS3 builds the window from the "logs_overview_xml" asset; the port
 * passes the layout name to PagedTableView which resolves it through buildWidgetLayout.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/roomlogs/WiredRoomLogListView.as
 */
export class WiredRoomLogListView extends PagedTableView
{
    // AS3: WiredRoomLogListView.as::REQUEST_PAGE_RATELIMIT
    private static readonly REQUEST_PAGE_RATELIMIT: number = 190;

    // AS3: WiredRoomLogListView.as::REFRESH_TIME
    private static readonly REFRESH_TIME: number = 2500;

    // AS3: WiredRoomLogListView.as::_SafeStr_4593 (name derived: the controller)
    private _controller: WiredRoomLogListController;

    // AS3: WiredRoomLogListView.as::_ignoreDropmenuEvents
    private _ignoreDropmenuEvents: boolean = false;

    // AS3: WiredRoomLogListView.as::_SafeStr_6058 (name derived: auto-refresh timer)
    private _refreshTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: WiredRoomLogListView.as::WiredRoomLogListView()
    constructor(controller: WiredRoomLogListController, windowManager: IHabboWindowManager)
    {
        super('logs_overview_xml', windowManager, controller.localizationManager, false);
        this._controller = controller;
        this.logSourceMenu.addEventListener('WE_SELECT', this._onSelectFilter);
        this.logLevelMenu.addEventListener('WE_SELECT', this._onSelectFilter);
        this.logSourceMenu.addEventListener('WE_SELECTED', this._onSelectedFilter);
        this.logLevelMenu.addEventListener('WE_SELECTED', this._onSelectedFilter);
        this.filterInput.addEventListener('WKE_KEY_DOWN', this._onFilterInputDown);
        this.autoRefreshCheckbox.select();
        this.startAutoRefresh();
    }

    // AS3: WiredRoomLogListView.as::onFilterInputDown()
    private _onFilterInputDown = (event: WindowKeyboardEvent): void =>
    {
        if(event.keyCode === 13)
        {
            this.updateFilters();
        }
    };

    // AS3: WiredRoomLogListView.as::startAutoRefresh()
    private startAutoRefresh(): void
    {
        if(this._refreshTimer == null)
        {
            this._refreshTimer = setInterval(() => this.onAutoRefresh(), WiredRoomLogListView.REFRESH_TIME);
        }
    }

    // Restart the auto-refresh timer (AS3 `_timer.reset(); _timer.start()`).
    private restartRefreshTimer(): void
    {
        if(this._refreshTimer != null)
        {
            clearInterval(this._refreshTimer);
        }

        this._refreshTimer = setInterval(() => this.onAutoRefresh(), WiredRoomLogListView.REFRESH_TIME);
    }

    // AS3: WiredRoomLogListView.as::onAutoRefresh()
    private onAutoRefresh(): void
    {
        if(!this.autoRefreshCheckbox.isSelected || !this.isShowing())
        {
            return;
        }

        const page = this._controller.page;

        if(page != null)
        {
            this.requestPageWithFilters(page.currentPage, page.logSourceFilter, page.logLevelFilter, page.query == null ? '' : page.query, true);
        }
    }

    // AS3: WiredRoomLogListView.as::displayNewPage()
    displayNewPage(isSilentRefresh: boolean): void
    {
        if(this._controller.page == null)
        {
            return;
        }

        const page = this._controller.page;

        if(!isSilentRefresh)
        {
            this.sourceOption = page.logSourceFilter;
            this.levelOption = page.logLevelFilter;
            this.filterInput.text = page.query ?? '';
        }

        this.onPageLoaded();
        const rows: ITableObject[] = [];

        for(const entry of page.elements)
        {
            rows.push(new WiredRoomLogListTableObject(this._controller, entry));
        }

        this._table.setObjects(rows);

        if(!isSilentRefresh)
        {
            this._table.scrollToTop();
            this._window.activate();
        }
    }

    // AS3: WiredRoomLogListView.as::createTable()
    protected override createTable(): void
    {
        this._table = new TableView(this._windowManager, this.tableViewContainer, true);
        const columns = [
            new TableColumn('timestamp', this.loc('wiredmenu.logs_overview.col.timestamp'), 0.2),
            new TableColumn('source', this.loc('wiredmenu.logs_overview.col.source'), 0.08),
            new TableColumn('level', this.loc('wiredmenu.logs_overview.col.level'), 0.08),
            new TableColumn('message', this.loc('wiredmenu.logs_overview.col.message'), 0.64)
        ];
        this._table.initialize(columns, true, true);
    }

    // AS3: WiredRoomLogListView.as::calculateLastPage()
    protected override calculateLastPage(): number
    {
        if(this._controller.page == null)
        {
            return -1;
        }

        return Math.trunc(Math.max(this._controller.page.totalEntries - 1, 0) / WiredRoomLogsConfig.PAGE_SIZE + 1);
    }

    // AS3: WiredRoomLogListView.as::currentPage()
    protected override currentPage(): number
    {
        if(this._controller.page == null)
        {
            return -1;
        }

        return this._controller.page.currentPage;
    }

    // AS3: WiredRoomLogListView.as::requestPageRatelimit()
    protected override requestPageRatelimit(): number
    {
        return WiredRoomLogListView.REQUEST_PAGE_RATELIMIT;
    }

    // AS3: WiredRoomLogListView.as::pagingTextKey()
    protected override pagingTextKey(): string
    {
        return 'wiredmenu.logs_overview.bottom_text';
    }

    // AS3: WiredRoomLogListView.as::totalEntries()
    protected override totalEntries(): number
    {
        if(this._controller.page == null)
        {
            return -1;
        }

        return this._controller.page.totalEntries;
    }

    // AS3: WiredRoomLogListView.as::requestPageWithFilters()
    private requestPageWithFilters(page: number, source: number, level: number, query: string | null, silent: boolean = false): boolean
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

        if(source === 2147483647)
        {
            source = current.logSourceFilter;
        }

        if(level === 2147483647)
        {
            level = current.logLevelFilter;
        }

        if(query == null)
        {
            query = '';
        }

        this._controller.send(new RequestWiredRoomLogsComposer(page, WiredRoomLogsConfig.PAGE_SIZE, level, source, query), silent);
        this.onPageLoaded();
        return true;
    }

    // AS3: WiredRoomLogListView.as::requestPage()
    protected override requestPage(page: number): boolean
    {
        return this.requestPageWithFilters(page, 2147483647, 2147483647, null);
    }

    // AS3: WiredRoomLogListView.as::onSelectFilter()
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

    // AS3: WiredRoomLogListView.as::onSelectedFilter()
    private _onSelectedFilter = (_event: WindowEvent): void =>
    {
        if(this._ignoreDropmenuEvents)
        {
            return;
        }

        this.updateFilters();
    };

    // AS3: WiredRoomLogListView.as::updateFilters()
    private updateFilters(firstAttempt: boolean = true): void
    {
        if(!this.canRequestNewPage(false))
        {
            if(!firstAttempt)
            {
                this.restartRefreshTimer();
                setTimeout(() => this.updateFilters(false), WiredRoomLogListView.REQUEST_PAGE_RATELIMIT + 10);
            }

            return;
        }

        this.restartRefreshTimer();
        this.requestPageWithFilters(1, this.sourceOption, this.levelOption, this.filterInput.text);
    }

    // AS3: WiredRoomLogListView.as::set levelOption()
    private set levelOption(value: number)
    {
        this._ignoreDropmenuEvents = true;
        this.logLevelMenu.selection = value + 1;
        this._ignoreDropmenuEvents = false;
    }

    // AS3: WiredRoomLogListView.as::get levelOption()
    private get levelOption(): number
    {
        return this.logLevelMenu.selection - 1;
    }

    // AS3: WiredRoomLogListView.as::set sourceOption()
    private set sourceOption(value: number)
    {
        this._ignoreDropmenuEvents = true;
        this.logSourceMenu.selection = value + 1;
        this._ignoreDropmenuEvents = false;
    }

    // AS3: WiredRoomLogListView.as::get sourceOption()
    private get sourceOption(): number
    {
        return this.logSourceMenu.selection - 1;
    }

    // AS3: WiredRoomLogListView.as::activate()
    activate(): void
    {
        this._window.activate();
    }

    // AS3: WiredRoomLogListView.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this._refreshTimer != null)
        {
            clearInterval(this._refreshTimer);
            this._refreshTimer = null;
        }

        super.dispose();
        this._controller = null as unknown as WiredRoomLogListController;
    }

    // AS3: WiredRoomLogListView.as::get autoRefreshCheckbox()
    private get autoRefreshCheckbox(): ISelectableWindow
    {
        return this._window.findChildByName('auto_refresh_cbx') as unknown as ISelectableWindow;
    }

    // AS3: WiredRoomLogListView.as::get logSourceMenu()
    private get logSourceMenu(): IDropMenuWindow
    {
        return this._window.findChildByName('log_source_menu') as unknown as IDropMenuWindow;
    }

    // AS3: WiredRoomLogListView.as::get logLevelMenu()
    private get logLevelMenu(): IDropMenuWindow
    {
        return this._window.findChildByName('log_level_menu') as unknown as IDropMenuWindow;
    }

    // AS3: WiredRoomLogListView.as::get filterInput()
    private get filterInput(): ITextFieldWindow
    {
        return this._window.findChildByName('filter_input') as unknown as ITextFieldWindow;
    }
}
