import {Logger} from '@core/utils/Logger';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {LoadingIcon} from '@habbo/utils/LoadingIcon';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import {TableView} from '@habbo/window/utils/tableview/TableView';
import {
    WiredTransactionLogList
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionLogList';
import {
    RequestWiredChestLogsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/RequestWiredChestLogsComposer';
import {
    RequestWiredTransactionLogsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/RequestWiredTransactionLogsComposer';

import {Util} from '../../../Util';
import {TransactionConfig} from './TransactionConfig';
import {TransactionTableObject} from './TransactionTableObject';
import type {WiredTransactionLogsController} from './WiredTransactionLogsController';

const log = Logger.getLogger('habbo.roomevents.transactions.WiredTransactionLogsView');

/**
 * The paged transaction log — every chest movement in the room, or in one chest, twenty-five rows at
 * a time.
 *
 * **The same window serves both scopes**, and which one it is showing comes from the payload rather
 * than from any local state: `logListType` decides whether the id row reads "chest" or "room", and
 * {@link requestPage} sends 1999 (one chest) or 2016 (the whole room) off the same flag. Opening it
 * from a chest and then from the room replaces its contents in place.
 *
 * **Paging is rate-limited twice.** No request may follow another inside
 * {@link REQUEST_PAGE_RATELIMIT} ms, and re-requesting the page already pending is refused for a
 * further {@link REQUEST_SAME_PAGE_TIMEOUT} — so holding "next" cannot flood the server, and the
 * refresh button cannot be double-fired. The pending page is cleared when the answer arrives, which
 * is what lets refresh work at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/overview/WiredTransactionLogsView.as
 */
export class WiredTransactionLogsView implements IDisposable
{
    // AS3: WiredTransactionLogsView.as::LOG_COLUMN_TYPE
    static readonly LOG_COLUMN_TYPE: string = 'type';

    // AS3: WiredTransactionLogsView.as::LOG_COLUMN_TIMESTAMP
    static readonly LOG_COLUMN_TIMESTAMP: string = 'timestamp';

    // AS3: WiredTransactionLogsView.as::LOG_COLUMN_USERNAME
    static readonly LOG_COLUMN_USERNAME: string = 'username';

    // AS3: WiredTransactionLogsView.as::LOG_COLUMN_WITHDRAWS
    static readonly LOG_COLUMN_WITHDRAWS: string = 'withdraws';

    // AS3: WiredTransactionLogsView.as::_SafeStr_9661 (name derived from its value)
    static readonly LOG_COLUMN_DEPOSITS: string = 'deposits';

    // AS3: WiredTransactionLogsView.as::_SafeStr_11183 (name derived from its value)
    static readonly LOG_COLUMN_CHESTS: string = 'chests';

    // AS3: WiredTransactionLogsView.as::LOG_COLUMN_DETAILS
    static readonly LOG_COLUMN_DETAILS: string = 'details';

    // AS3: WiredTransactionLogsView.as::DESKTOP_WINDOW_LAYER
    static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: WiredTransactionLogsView.as::REQUEST_SAME_PAGE_TIMEOUT
    static readonly REQUEST_SAME_PAGE_TIMEOUT: number = 2000;

    // AS3: WiredTransactionLogsView.as::REQUEST_PAGE_RATELIMIT
    static readonly REQUEST_PAGE_RATELIMIT: number = 280;

    // AS3: WiredTransactionLogsView.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredTransactionLogsView.as::_SafeStr_4593 (name derived: the logs controller)
    private _controller: WiredTransactionLogsController | null;

    // AS3: WiredTransactionLogsView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: WiredTransactionLogsView.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: WiredTransactionLogsView.as::_SafeStr_6336 (name derived: the row table)
    private _tableView: TableView | null = null;

    // AS3: WiredTransactionLogsView.as::_SafeStr_6941 (name derived: the page a request is out for)
    private _pendingPage: number = -1;

    // AS3: WiredTransactionLogsView.as::_SafeStr_8573 (name derived: when the last request went out)
    private _lastRequestTime: number = 0;

    // AS3: WiredTransactionLogsView.as::_loadingIcon
    private _loadingIcon: LoadingIcon | null = null;

    // AS3: WiredTransactionLogsView.as::WiredTransactionLogsView()
    constructor(controller: WiredTransactionLogsController, windowManager: IHabboWindowManager | null)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        const xml = controller.assets?.getAssetByName('transaction_overview_xml')?.content ?? null;

        if(!xml || !windowManager)
        {
            // AS3 dereferences both unguarded and would throw; a missing layout is a shipping
            // problem rather than a code one, so it is reported instead.
            log.warn('transaction_overview_xml is not in the asset library — the logs window is not built');

            return;
        }

        this._window = windowManager.buildFromXML(xml as string, 1) as IFrameWindow;
        this._loadingIcon = new LoadingIcon();

        const pageNumberInput = this.pageNumberInput;

        if(pageNumberInput) pageNumberInput.restrict = '0-9';

        this.createTransactionTable();

        this.firstPageButton?.addEventListener('WME_CLICK', this.onFirstPageClick);
        this.previousPageButton?.addEventListener('WME_CLICK', this.onPreviousPageClick);
        this.nextPageButton?.addEventListener('WME_CLICK', this.onNextPageClick);
        this.lastPageButton?.addEventListener('WME_CLICK', this.onLastPageClick);
        this.refreshButton?.addEventListener('WME_CLICK', this.onRefreshClick);
        pageNumberInput?.addEventListener('WKE_KEY_DOWN', this.onPageInputDown);
        pageNumberInput?.addEventListener('WME_CLICK_AWAY', this.onPageInputClickAway);
        this.closeButton?.addEventListener('WME_CLICK', this.onClose);
    }

    // AS3: WiredTransactionLogsView.as::onClose()
    private onClose = (): void =>
    {
        this.hide();
    };

    /**
	 * The seven width factors add up to 1.
	 */
    // AS3: WiredTransactionLogsView.as::createTransactionTable()
    private createTransactionTable(): void
    {
        const parent = this.tableViewContainer;

        if(!this._windowManager || !parent) return;

        this._tableView = new TableView(this._windowManager, parent, true, true);

        this._tableView.initialize([
            new TableColumn(WiredTransactionLogsView.LOG_COLUMN_TYPE, this.loc('wiredchests.logs.col.type'), 0.17),
            new TableColumn(WiredTransactionLogsView.LOG_COLUMN_TIMESTAMP, this.loc('wiredchests.logs.col.timestamp'), 0.15),
            new TableColumn(WiredTransactionLogsView.LOG_COLUMN_USERNAME, this.loc('wiredchests.logs.col.username'), 0.14),
            new TableColumn(WiredTransactionLogsView.LOG_COLUMN_WITHDRAWS, this.loc('wiredchests.logs.col.withdraws'), 0.14),
            new TableColumn(WiredTransactionLogsView.LOG_COLUMN_DEPOSITS, this.loc('wiredchests.logs.col.deposits'), 0.14),
            new TableColumn(WiredTransactionLogsView.LOG_COLUMN_CHESTS, this.loc('wiredchests.logs.col.chests'), 0.12),
            new TableColumn(WiredTransactionLogsView.LOG_COLUMN_DETAILS, this.loc('wiredchests.logs.col.details'), 0.14),
        ], true, true);
    }

    // AS3: WiredTransactionLogsView.as::hide()
    hide(): void
    {
        if(!this.isShowing()) return;

        const desktop = this._windowManager?.getDesktop(WiredTransactionLogsView.DESKTOP_WINDOW_LAYER) ?? null;

        if(desktop !== null) (desktop as IWindowContainer).removeChild(this._window as unknown as IWindow);
    }

    // AS3: WiredTransactionLogsView.as::show()
    show(): void
    {
        if(this.isShowing()) return;

        const desktop = this._windowManager?.getDesktop(WiredTransactionLogsView.DESKTOP_WINDOW_LAYER) ?? null;

        if(desktop !== null && this._window !== null)
        {
            (desktop as IWindowContainer).addChild(this._window as unknown as IWindow);
            (this._window as unknown as IWindow).center();
        }
    }

    // AS3: WiredTransactionLogsView.as::isShowing()
    isShowing(): boolean
    {
        return this._window !== null && (this._window as unknown as IWindow).parent != null;
    }

    /**
	 * The footer text is one localized string with two placeholders around a `%page%` marker, split
	 * on that marker so the page input can sit between the halves. A translation missing `%page%`
	 * leaves all three windows untouched rather than rendering a broken line.
	 */
    // AS3: WiredTransactionLogsView.as::displayNewPage()
    displayNewPage(): void
    {
        const logs = this._controller?.logs ?? null;

        if(logs == null) return;

        const loadingIconWindow = this.loadingIconWindow;

        if(loadingIconWindow) this._loadingIcon?.setVisible(loadingIconWindow, false);

        // The answer we were waiting for: stop refusing a repeat of this page.
        if(logs.currentPage === this._pendingPage) this._pendingPage = -1;

        const listTypeValueText = this.listTypeValueText;
        const idKeyText = this.idKeyText;
        const idValueText = this.idValueText;

        if(listTypeValueText) listTypeValueText.text = this.loc(`wiredchests.logs.type.${logs.logListType}`);

        if(idKeyText)
        {
            idKeyText.text = logs.logListType === WiredTransactionLogList.LOG_LIST_TYPE_FULL
                ? this.loc('wiredchests.logs.chest_id')
                : this.loc('wiredchests.logs.room_id');
        }

        if(idValueText) idValueText.text = `${logs.logListId}`;

        const lastPage = this.calculateLastPage();

        if(this.firstPageButton) Util.disableSection(this.firstPageButton, logs.currentPage <= 1);
        if(this.previousPageButton) Util.disableSection(this.previousPageButton, logs.currentPage <= 1);
        if(this.nextPageButton) Util.disableSection(this.nextPageButton, logs.currentPage >= lastPage);
        if(this.lastPageButton) Util.disableSection(this.lastPageButton, logs.currentPage >= lastPage);

        const halves = this.loc('wiredchests.logs.bottom_text').split('%page%');

        if(halves.length === 2)
        {
            const pageTextStart = this.pageTextStart;
            const pageTextEnd = this.pageTextEnd;
            const pageNumberInput = this.pageNumberInput;

            if(pageTextStart) pageTextStart.text = halves[0].replace('%transaction_count%', String(logs.totalLogs));
            if(pageTextEnd) pageTextEnd.text = halves[1].replace('%page_count%', String(lastPage));
            if(pageNumberInput) pageNumberInput.text = `${logs.currentPage}`;
        }

        const rows: ITableObject[] = [];

        for(const info of logs.logs)
        {
            rows.push(new TransactionTableObject(this._controller!, info));
        }

        this._tableView?.setObjects(rows);
        this._tableView?.scrollToTop();
        (this._window as unknown as IWindow | null)?.activate();
    }

    /**
	 * `(totalLogs - 1) / PAGE_SIZE + 1`, which is a ceiling that also answers 1 for an empty log —
	 * the `max(…, 0)` is what keeps a zero total from producing page 0.
	 */
    // AS3: WiredTransactionLogsView.as::calculateLastPage()
    private calculateLastPage(): number
    {
        const logs = this._controller?.logs ?? null;

        if(logs == null)
        {
            return 1;
        }

        return Math.floor(Math.max(logs.totalLogs - 1, 0) / TransactionConfig.PAGE_SIZE) + 1;
    }

    // AS3: WiredTransactionLogsView.as::onLastPageClick()
    private onLastPageClick = (): void =>
    {
        if(this._controller?.logs == null) return;

        this.requestPage(this.calculateLastPage());
    };

    // AS3: WiredTransactionLogsView.as::onNextPageClick()
    private onNextPageClick = (): void =>
    {
        const logs = this._controller?.logs ?? null;

        if(logs == null) return;

        this.requestPage(logs.currentPage + 1);
    };

    // AS3: WiredTransactionLogsView.as::onPreviousPageClick()
    private onPreviousPageClick = (): void =>
    {
        const logs = this._controller?.logs ?? null;

        if(logs == null) return;

        this.requestPage(logs.currentPage - 1);
    };

    // AS3: WiredTransactionLogsView.as::onFirstPageClick()
    private onFirstPageClick = (): void =>
    {
        if(this._controller?.logs == null) return;

        this.requestPage(1);
    };

    // AS3: WiredTransactionLogsView.as::onRefreshClick()
    private onRefreshClick = (): void =>
    {
        const logs = this._controller?.logs ?? null;

        if(logs == null) return;

        this.requestPage(logs.currentPage);
    };

    // AS3: WiredTransactionLogsView.as::onPageInputClickAway()
    private onPageInputClickAway = (): void =>
    {
        this.navigateToInputPage();
    };

    // AS3: WiredTransactionLogsView.as::onPageInputDown()
    private onPageInputDown = (event: WindowKeyboardEvent): void =>
    {
        if(event.keyCode === 13)
        {
            this.navigateToInputPage();
        }
    };

    /**
	 * Out-of-range input is clamped **and written back**, so the field shows what will actually be
	 * fetched. Typing the page already displayed sends nothing.
	 */
    // AS3: WiredTransactionLogsView.as::navigateToInputPage()
    private navigateToInputPage(): void
    {
        const pageNumberInput = this.pageNumberInput;
        const lastPage = this.calculateLastPage();

        let page = parseInt(pageNumberInput?.text ?? '', 10) || 0;

        if(page < 1)
        {
            page = 1;

            if(pageNumberInput) pageNumberInput.text = String(page);
        }
        else if(page > lastPage)
        {
            page = lastPage;

            if(pageNumberInput) pageNumberInput.text = String(page);
        }

        const logs = this._controller?.logs ?? null;

        if(logs == null) return;

        if(page !== logs.currentPage) this.requestPage(page);
    }

    /**
	 * The two limiters, in AS3's order: nothing at all inside 280 ms, and no repeat of the pending
	 * page inside 2 s. `_pendingPage` is -1 once its answer has arrived, so a genuine refresh of the
	 * displayed page passes the second test.
	 */
    // AS3: WiredTransactionLogsView.as::requestPage()
    private requestPage(page: number): void
    {
        // AS3 uses flash's getTimer(); performance.now() is the same monotonic milliseconds.
        const now = performance.now();

        if(this._lastRequestTime > now - WiredTransactionLogsView.REQUEST_PAGE_RATELIMIT) return;

        if(page === this._pendingPage && this._lastRequestTime > now - WiredTransactionLogsView.REQUEST_SAME_PAGE_TIMEOUT) return;

        this._pendingPage = page;
        this._lastRequestTime = now;

        const logs = this._controller?.logs ?? null;

        if(logs !== null && logs.logListType === WiredTransactionLogList.LOG_LIST_TYPE_FULL)
        {
            this._controller?.send(new RequestWiredChestLogsComposer(logs.logListId, TransactionConfig.PAGE_SIZE, page));
        }
        else
        {
            this._controller?.send(new RequestWiredTransactionLogsComposer(TransactionConfig.PAGE_SIZE, page));
        }

        const loadingIconWindow = this.loadingIconWindow;

        if(loadingIconWindow) this._loadingIcon?.setVisible(loadingIconWindow, true);
    }

    // AS3: WiredTransactionLogsView.as::loc()
    loc(key: string): string
    {
        return this._controller?.localizationManager?.getLocalization(key, key) ?? key;
    }

    // AS3: WiredTransactionLogsView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._loadingIcon?.dispose();
        this._loadingIcon = null;
        this._tableView?.dispose();
        this._tableView = null;
        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._controller = null;
        this._windowManager = null;
        this._disposed = true;
    }

    // AS3: WiredTransactionLogsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredTransactionLogsView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get listTypeValueText()
    private get listTypeValueText(): ITextWindow | null
    {
        return (this._window?.findChildByName('list_type_value') as ITextWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get idKeyText()
    private get idKeyText(): ITextWindow | null
    {
        return (this._window?.findChildByName('id_key') as ITextWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get idValueText()
    private get idValueText(): ITextWindow | null
    {
        return (this._window?.findChildByName('id_value') as ITextWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get refreshButton()
    private get refreshButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('refresh_btn') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get loadingIconWindow()
    private get loadingIconWindow(): IIconWindow | null
    {
        return (this._window?.findChildByName('searching_icon') as IIconWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get tableView()
    private get tableViewContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('table_view') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get firstPageButton()
    private get firstPageButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('first_page_btn') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get previousPageButton()
    private get previousPageButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('prev_page_btn') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get nextPageButton()
    private get nextPageButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('next_page_btn') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get lastPageButton()
    private get lastPageButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('last_page_btn') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get pageTextStart()
    private get pageTextStart(): ITextWindow | null
    {
        return (this._window?.findChildByName('pagina_text_start') as ITextWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get pageNumberInput()
    private get pageNumberInput(): ITextFieldWindow | null
    {
        return (this._window?.findChildByName('pagina_number_input') as ITextFieldWindow | null) ?? null;
    }

    // AS3: WiredTransactionLogsView.as::get pageTextEnd()
    private get pageTextEnd(): ITextWindow | null
    {
        return (this._window?.findChildByName('pagina_text_end') as ITextWindow | null) ?? null;
    }
}
