import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';

import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {TableView} from '@habbo/window/utils/tableview/TableView';
import {LoadingIcon} from '@habbo/utils/LoadingIcon';

import {Util} from '../Util';

/**
 * PagedTableView — the shared base for the wired-menu sub-controller windows (room logs, variable
 * management overview/detail). Builds a paged window (first/prev/next/last/refresh navigation, a
 * "page N of M" text, a page-number input, a close button and a loading spinner) around a TableView
 * that subclasses populate. Subclasses override createTable()/currentPage()/calculateLastPage()/
 * totalEntries()/requestPage()/pagingTextKey()/requestPageRatelimit() to bind their own data + paging.
 *
 * Port notes: AS3 builds from an XmlAsset (assets.getAssetByName); the port takes a layout name and
 * builds through windowManager.buildWidgetLayout (the central widget-layout registry). flash Timer →
 * LoadingIcon's setInterval. IFrameWindow.center() has no port counterpart, so the window is centered
 * manually on the desktop. ITextFieldWindow has no `restrict`, so the page-input digit mask is a
 * TODO(AS3) (the numeric parse still clamps the value).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/common/PagedTableView.as
 */
export class PagedTableView
{
    // AS3: PagedTableView.as::DESKTOP_WINDOW_LAYER
    protected static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: PagedTableView.as::REQUEST_SAME_PAGE_TIMEOUT
    private static readonly REQUEST_SAME_PAGE_TIMEOUT: number = 2000;

    // AS3: PagedTableView.as::_disposed
    private _disposed: boolean = false;

    // AS3: PagedTableView.as::_windowManager
    protected _windowManager: IHabboWindowManager;

    // AS3: PagedTableView.as::_SafeStr_4683 (name derived: localization)
    protected _localization: IHabboLocalizationManager;

    // AS3: PagedTableView.as::_window
    protected _window: IWindowContainer;

    // AS3: PagedTableView.as::_SafeStr_5262 (name derived: the table)
    protected _table: TableView = null as unknown as TableView;

    // AS3: PagedTableView.as::_SafeStr_6941 (name derived: last requested page)
    private _lastRequestedPage: number = -1;

    // AS3: PagedTableView.as::_SafeStr_8573 (name derived: last request timestamp)
    private _lastRequestTime: number = 0;

    // AS3: PagedTableView.as::_loadingIcon
    private _loadingIcon: LoadingIcon;

    // AS3: PagedTableView.as::_samePageTimeout
    private _samePageTimeout: boolean = false;

    // AS3: PagedTableView.as::PagedTableView()
    constructor(layoutName: string, windowManager: IHabboWindowManager, localization: IHabboLocalizationManager, samePageTimeout: boolean = true)
    {
        this._samePageTimeout = samePageTimeout;
        this._windowManager = windowManager;
        this._localization = localization;
        this._window = windowManager.buildWidgetLayout(layoutName) as unknown as IWindowContainer;
        this._loadingIcon = new LoadingIcon();
        // TODO(AS3): AS3 sets pageNumberInput.restrict = "0-9" (digit-only input mask); the port's
        // ITextFieldWindow has no `restrict`. navigateToInputPage() still clamps the parsed value.
        this.createTable();
        this.firstPageButton.addEventListener('WME_CLICK', this._onFirstPageClick);
        this.previousPageButton.addEventListener('WME_CLICK', this._onPreviousPageClick);
        this.nextPageButton.addEventListener('WME_CLICK', this._onNextPageClick);
        this.lastPageButton.addEventListener('WME_CLICK', this._onLastPageClick);

        const refreshButton = this.refreshButton;

        if(refreshButton != null)
        {
            refreshButton.addEventListener('WME_CLICK', this._onRefreshClick);
        }

        this.pageNumberInput.addEventListener('WKE_KEY_DOWN', this._onPageInputDown);
        this.pageNumberInput.addEventListener('WME_CLICK_AWAY', this._onPageInputClickAway);
        this.closeButton.addEventListener('WME_CLICK', this._onClose);
        this.hide();
    }

    // AS3: PagedTableView.as::onClose()
    private _onClose = (_event: WindowMouseEvent): void =>
    {
        this.hide();
    };

    // AS3: PagedTableView.as::hide()
    hide(): void
    {
        if(this.isShowing())
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null)
            {
                desktop.removeChild(this._window);
            }
        }
    }

    // AS3: PagedTableView.as::show()
    show(): void
    {
        if(!this.isShowing())
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null)
            {
                desktop.addChild(this._window);
                // AS3 IFrameWindow.center(); no port counterpart — center on the desktop manually.
                this._window.x = Math.floor((desktop.width - this._window.width) / 2);
                this._window.y = Math.floor((desktop.height - this._window.height) / 2);
            }
        }
    }

    // AS3: PagedTableView.as::isShowing()
    isShowing(): boolean
    {
        return this._window.parent != null;
    }

    // AS3: PagedTableView.as::onLastPageClick()
    private _onLastPageClick = (_event: WindowMouseEvent): void =>
    {
        const last = this.calculateLastPage();

        if(last === -1)
        {
            return;
        }

        this.requestPage(last);
    };

    // AS3: PagedTableView.as::onNextPageClick()
    private _onNextPageClick = (_event: WindowMouseEvent): void =>
    {
        const current = this.currentPage();

        if(current === -1)
        {
            return;
        }

        this.requestPage(current + 1);
    };

    // AS3: PagedTableView.as::onPreviousPageClick()
    private _onPreviousPageClick = (_event: WindowMouseEvent): void =>
    {
        const current = this.currentPage();

        if(current === -1)
        {
            return;
        }

        this.requestPage(current - 1);
    };

    // AS3: PagedTableView.as::onFirstPageClick()
    private _onFirstPageClick = (_event: WindowMouseEvent): void =>
    {
        this.requestPage(1);
    };

    // AS3: PagedTableView.as::onRefreshClick()
    private _onRefreshClick = (_event: WindowMouseEvent): void =>
    {
        const current = this.currentPage();

        if(current === -1)
        {
            return;
        }

        this.requestPage(current);
    };

    // AS3: PagedTableView.as::onPageInputClickAway()
    private _onPageInputClickAway = (_event: WindowMouseEvent): void =>
    {
        this.navigateToInputPage();
    };

    // AS3: PagedTableView.as::onPageInputDown()
    private _onPageInputDown = (event: WindowKeyboardEvent): void =>
    {
        if(event.keyCode === 13)
        {
            this.navigateToInputPage();
        }
    };

    // AS3: PagedTableView.as::navigateToInputPage()
    private navigateToInputPage(): void
    {
        const parsed = Number(this.pageNumberInput.text);
        let page = isNaN(parsed) ? 0 : Math.trunc(parsed);
        const last = this.calculateLastPage();

        if(page < 1)
        {
            page = 1;
            this.pageNumberInput.text = String(page);
        }
        else if(page > last)
        {
            page = last;
            this.pageNumberInput.text = String(page);
        }

        const current = this.currentPage();

        if(current === -1)
        {
            return;
        }

        if(page !== current)
        {
            this.requestPage(page);
        }
    }

    // AS3: PagedTableView.as::canRequestNewPage()
    protected canRequestNewPage(samePage: boolean): boolean
    {
        const now = performance.now();

        if(this._lastRequestTime > now - this.requestPageRatelimit())
        {
            return false;
        }

        if(this._samePageTimeout && samePage && this._lastRequestTime > now - PagedTableView.REQUEST_SAME_PAGE_TIMEOUT)
        {
            return false;
        }

        return true;
    }

    // AS3: PagedTableView.as::loc()
    loc(key: string): string
    {
        return this._localization.getLocalization(key, key);
    }

    // AS3: PagedTableView.as::onPageRequested()
    protected onPageRequested(): void
    {
        this._loadingIcon.setVisible(this.loadingIconWindow, true);
    }

    // AS3: PagedTableView.as::onPageLoaded()
    protected onPageLoaded(): void
    {
        this._loadingIcon.setVisible(this.loadingIconWindow, false);
        const current = this.currentPage();

        if(current === this._lastRequestedPage)
        {
            this._lastRequestedPage = -1;
        }

        const last = this.calculateLastPage();
        Util.disableSection(this.firstPageButton, current <= 1);
        Util.disableSection(this.previousPageButton, current <= 1);
        Util.disableSection(this.nextPageButton, current >= last);
        Util.disableSection(this.lastPageButton, current >= last);
        const text = this.loc(this.pagingTextKey());
        const parts = text.split('%page%');

        if(parts.length === 2)
        {
            this.pageTextStart.text = parts[0].replace('%entries_count%', String(this.totalEntries()));
            this.pageTextEnd.text = parts[1].replace('%page_count%', String(last));
            this.pageNumberInput.text = current + '';
        }
    }

    // AS3: PagedTableView.as::createTable()
    protected createTable(): void
    {
    }

    // AS3: PagedTableView.as::calculateLastPage()
    protected calculateLastPage(): number
    {
        return 0;
    }

    // AS3: PagedTableView.as::currentPage()
    protected currentPage(): number
    {
        return 0;
    }

    // AS3: PagedTableView.as::requestPageRatelimit()
    protected requestPageRatelimit(): number
    {
        return 200;
    }

    // AS3: PagedTableView.as::pagingTextKey()
    protected pagingTextKey(): string
    {
        return '';
    }

    // AS3: PagedTableView.as::totalEntries()
    protected totalEntries(): number
    {
        return 0;
    }

    // AS3: PagedTableView.as::requestPage()
    protected requestPage(page: number): boolean
    {
        const now = performance.now();

        if(!this.canRequestNewPage(page === this._lastRequestedPage))
        {
            return false;
        }

        this._lastRequestedPage = page;
        this._lastRequestTime = now;
        return true;
    }

    // AS3: PagedTableView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._loadingIcon.dispose();
        this._loadingIcon = null as unknown as LoadingIcon;
        this._table.dispose();
        this._table = null as unknown as TableView;
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
        this._windowManager = null as unknown as IHabboWindowManager;
        this._localization = null as unknown as IHabboLocalizationManager;
        this._disposed = true;
    }

    // AS3: PagedTableView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: PagedTableView.as::get closeButton()
    private get closeButton(): IWindow
    {
        return this._window.findChildByName('header_button_close') as unknown as IWindow;
    }

    // AS3: PagedTableView.as::get loadingIconWindow()
    private get loadingIconWindow(): IIconWindow
    {
        return this._window.findChildByName('searching_icon') as unknown as IIconWindow;
    }

    // AS3: PagedTableView.as::get refreshButton()
    private get refreshButton(): IInteractiveWindow | null
    {
        return (this._window.findChildByName('refresh_btn') ?? null) as unknown as IInteractiveWindow | null;
    }

    // AS3: PagedTableView.as::get tableViewContainer()
    protected get tableViewContainer(): IWindowContainer
    {
        return this._window.findChildByName('table_view') as unknown as IWindowContainer;
    }

    // AS3: PagedTableView.as::get firstPageButton()
    private get firstPageButton(): IInteractiveWindow
    {
        return this._window.findChildByName('first_page_btn') as unknown as IInteractiveWindow;
    }

    // AS3: PagedTableView.as::get previousPageButton()
    private get previousPageButton(): IInteractiveWindow
    {
        return this._window.findChildByName('prev_page_btn') as unknown as IInteractiveWindow;
    }

    // AS3: PagedTableView.as::get nextPageButton()
    private get nextPageButton(): IInteractiveWindow
    {
        return this._window.findChildByName('next_page_btn') as unknown as IInteractiveWindow;
    }

    // AS3: PagedTableView.as::get lastPageButton()
    private get lastPageButton(): IInteractiveWindow
    {
        return this._window.findChildByName('last_page_btn') as unknown as IInteractiveWindow;
    }

    // AS3: PagedTableView.as::get pageTextStart()
    private get pageTextStart(): ITextWindow
    {
        return this._window.findChildByName('pagina_text_start') as unknown as ITextWindow;
    }

    // AS3: PagedTableView.as::get pageNumberInput()
    private get pageNumberInput(): ITextFieldWindow
    {
        return this._window.findChildByName('pagina_number_input') as unknown as ITextFieldWindow;
    }

    // AS3: PagedTableView.as::get pageTextEnd()
    private get pageTextEnd(): ITextWindow
    {
        return this._window.findChildByName('pagina_text_end') as unknown as ITextWindow;
    }
}
