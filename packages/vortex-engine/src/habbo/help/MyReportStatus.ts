import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IBubbleWindow} from '@core/window/components/IBubbleWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHTMLTextWindow} from '@core/window/components/IHTMLTextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowLinkEvent} from '@core/window/events/WindowLinkEvent';
import {Logger} from '@core/utils/Logger';
import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {
    CfhReportStatusData
} from '@habbo/communication/messages/parser/callforhelp/CfhReportStatusData';
import type {
    MyCfhReportStatusMessageEventParser
} from '@habbo/communication/messages/parser/callforhelp/MyCfhReportStatusMessageEventParser';
import {AppealCfhMessageComposer} from '@habbo/communication/messages/outgoing/help/AppealCfhMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import {ReportStatusTableObject} from './reportstatus/ReportStatusTableObject';
import {MyReportStatusColumn} from './MyReportStatusColumn';
import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.MyReportStatus');

/**
 * "My reports": every call-for-help the player has filed, in a table, with an info bubble per row
 * and an appeal button for a sanction that has not been appealed yet.
 *
 * Opened by `MyCfhReportStatus` (3809), which answers the request `HabboHelp.requestReportsStatus()`
 * sends.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as
 */
export class MyReportStatus implements IDisposable
{
    // The four COLUMN_* statics AS3 declares here live in `MyReportStatusColumn` — see that file
    // for why they had to move.

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::_habboHelp
    private _habboHelp: HabboHelp;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::_SafeStr_5262 (the table view)
    private _tableView: TableView | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::_shownObject
    private _shownObject: ReportStatusTableObject | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::_SafeStr_6673 (the bubble's sticky toggle)
    private _bubblePinned: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::_SafeStr_4815 (the info bubble)
    private _infoBubble: IBubbleWindow | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::MyReportStatus()
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * AS3 calls `dispose()` first thing and then clears `_disposed` — reopening is a teardown plus
     * a rebuild, not a reuse. Kept literally: the window is rebuilt from the layout every time the
     * server answers, so a stale table can never survive into a new report list.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::openWindow()
    openWindow(parser: MyCfhReportStatusMessageEventParser): void
    {
        this.dispose();

        this._disposed = false;

        this._window = this._habboHelp.getXmlWindow('my_reports') as IWindowContainer | null;

        if(this._window == null)
        {
            log.warn('my_reports layout missing — the report list has nowhere to render');

            return;
        }

        this._infoBubble = this._window.findChildByName('status_info_bubble') as IBubbleWindow | null;

        if(this._infoBubble != null)
        {
            // AS3 reparents the bubble onto the desktop so it can be positioned in global
            // coordinates next to a row, outside the window's own clipping. The cast is because
            // `IWindow.desktop` is typed `IWindow | null` here where AS3 declares `IDesktopWindow`
            // — narrower than the source, and not worth widening globally from this one call site.
            (this._window.desktop as IWindowContainer | null)?.addChild(this._infoBubble);
            this._infoBubble.visible = false;
        }

        this.appealButton?.addEventListener('WME_CLICK', this.onClickAppeal);

        this._window.center();
        this._window.procedure = this.windowEventHandler;

        this.createTable();
        this.setTableObjects(parser.messages ?? []);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::createTable()
    createTable(): void
    {
        const container = this.reportsTableContainer;

        if(this._habboHelp.windowManager == null || container == null) return;

        this._tableView = new TableView(this._habboHelp.windowManager, container);

        this._tableView.initialize(
            [
                new TableColumn(MyReportStatusColumn.REPORT_DATE, this.localize('report.status.col.report_date'), 0.26, 'left'),
                new TableColumn(MyReportStatusColumn.REPORTED_ACCOUNT, this.localize('report.status.col.reported_account'), 0.18, 'left'),
                new TableColumn(MyReportStatusColumn.REASON, this.localize('report.status.col.reason'), 0.38, 'left'),
                new TableColumn(MyReportStatusColumn.APPEAL_STATUS, this.localize('report.status.col.appeal_status'), 0.18, 'left')
            ],
            true,
            false
        );

        this._tableView.onRowHoveredCallback = this.onRowHover;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::setTableObjects()
    setTableObjects(messages: CfhReportStatusData[]): void
    {
        // Newest report first.
        const sorted = [...messages].sort((a, b) => b.creationTime - a.creationTime);

        const rows: ITableObject[] = sorted.map((message) => new ReportStatusTableObject(this, message));

        this._tableView?.setObjects(rows);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::localize()
    localize(key: string, defaultValue: string | null = null): string
    {
        return this._habboHelp.localization?.getLocalization(key, defaultValue ?? key) ?? key;
    }

    /**
     * The info button on a row toggles the bubble: AS3 flips a sticky flag and either focuses that
     * row or clears the focus entirely, so a second click on the same button closes the bubble.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::clickInfoButton()
    clickInfoButton(row: ReportStatusTableObject): void
    {
        this._bubblePinned = !this._bubblePinned;

        this.setFocusRow(this._bubblePinned ? row : null);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::onRowHover()
    private onRowHover = (row: ITableObject | null): void =>
    {
        // Hover only moves the bubble once it is pinned open; it never opens it.
        if(row != null && this._shownObject !== row && this._bubblePinned)
        {
            this.setFocusRow(row as ReportStatusTableObject);
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::setFocusRow()
    private setFocusRow(row: ReportStatusTableObject | null): void
    {
        if(row === this._shownObject) return;

        this._shownObject = row;

        if(this._infoBubble == null) return;

        this._infoBubble.visible = this._shownObject != null;

        if(this._infoBubble.visible)
        {
            this.refreshBubbleUI();
            this.relocateBubbleAndFocus();
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::refreshBubbleUI()
    private refreshBubbleUI(): void
    {
        const message = this._shownObject?.message;

        if(message == null) return;

        const appealed = message.appealStatus !== CfhReportStatusData.APPEAL_STATUS_NONE;
        const decided = appealed ? message.appealResolutionTime !== -1 : message.closeTime !== -1;

        const decisionDate = decided
            ? this.formatDate(appealed ? message.appealResolutionTime : message.closeTime)
            : '-';

        let actionKey: string;

        if(decided)
        {
            actionKey = message.sanctioned ? 'report.status.info.action' : 'report.status.info.no_action';

            const explanation = this.getActionExplanation(
                message.sanctioned, message.sanctionGivenByAutoModeration, message.appealStatus
            );

            this.setText(this.actionDescText, this.localize(explanation));
        }
        else
        {
            actionKey = 'report.status.info.sanction_pending';

            this.setText(this.actionDescText, '');
        }

        this.setText(this.actionText, this.localize(actionKey));
        this.setText(this.createdKeyText, this.localize(appealed ? 'report.status.info.appealed' : 'report.status.info.reported'));
        this.setText(this.reportedDateText, this.formatDate(appealed ? message.appealCreationTime : message.creationTime));
        this.setText(this.decisionDateText, decisionDate);

        // Appealable exactly once, and only against a decided report that did NOT sanction the
        // reported player — there is nothing to appeal otherwise.
        const canAppeal = message.appealStatus === CfhReportStatusData.APPEAL_STATUS_NONE
            && decided
            && !message.sanctioned;

        if(canAppeal) this.appealButton?.enable();
        else this.appealButton?.disable();

        const sanctionInfo = this.sanctionInfoText;

        if(sanctionInfo == null) return;

        if(message.sanctioned)
        {
            const url = this._habboHelp.getProperty('zendesk.url') ?? '';

            sanctionInfo.text = this._habboHelp.localization?.getLocalizationWithParams(
                'report.status.info.sanction_help', '', 'url', url
            ) ?? '';

            sanctionInfo.initializeLinkStyle();
            sanctionInfo.addEventListener('WE_LINK', this.onClickHtmlLink);
        }
        else
        {
            sanctionInfo.text = '';
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::getActionExplanation()
    private getActionExplanation(sanctioned: boolean, autoModerated: boolean, appealStatus: number): string
    {
        if(appealStatus === CfhReportStatusData.APPEAL_STATUS_RESOLVED_ACTION)
        {
            return 'report.status.info.appeal.action';
        }

        if(appealStatus === CfhReportStatusData.APPEAL_STATUS_RESOLVED_NO_ACTION)
        {
            return 'report.status.info.appeal.no_action';
        }

        if(autoModerated)
        {
            return sanctioned
                ? 'report.status.info.auto_moderated.action'
                : 'report.status.info.auto_moderated.no_action';
        }

        return sanctioned
            ? 'report.status.info.manually_moderated.action'
            : 'report.status.info.manually_moderated.no_action';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::relocateBubbleAndFocus()
    private relocateBubbleAndFocus(): void
    {
        if(this._tableView == null || this._infoBubble == null || this._shownObject == null) return;

        const rect = this._tableView.getGlobalRowRectangle(this._shownObject);

        if(rect == null) return;

        // Pinned to the row's right edge, vertically centred on it.
        this._infoBubble.position = {
            x: rect.x + rect.width - 2,
            y: rect.y + rect.height / 2 - this._infoBubble.height / 2
        };

        this._infoBubble.activate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::onClickAppeal()
    private onClickAppeal = (): void =>
    {
        if(this._shownObject == null) return;

        this._habboHelp.sendMessage(new AppealCfhMessageComposer(this._shownObject.message.id));

        this.appealButton?.disable();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::onClickHtmlLink()
    private onClickHtmlLink = (event: WindowEvent): void =>
    {
        const link = (event as WindowLinkEvent).link;

        if(link) HabboWebTools.openWebPageAndMinimizeClient(link);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::windowEventHandler()
    private windowEventHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(this._disposed || this._window == null || event.type !== 'WME_CLICK' || !window) return;

        if(window.name === 'header_button_close') this.dispose();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get reportsTableContainer()
    private get reportsTableContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('reports_table_cont') ?? null) as IWindowContainer | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get reportedDateText()
    private get reportedDateText(): ITextWindow | null
    {
        return (this._infoBubble?.findChildByName('reported_date_txt') ?? null) as ITextWindow | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get decisionDateText()
    private get decisionDateText(): ITextWindow | null
    {
        return (this._infoBubble?.findChildByName('decision_date_txt') ?? null) as ITextWindow | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get createdKeyText()
    private get createdKeyText(): ITextWindow | null
    {
        return (this._infoBubble?.findChildByName('created_key_txt') ?? null) as ITextWindow | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get actionText()
    private get actionText(): ITextWindow | null
    {
        return (this._infoBubble?.findChildByName('action_txt') ?? null) as ITextWindow | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get actionDescText()
    private get actionDescText(): ITextWindow | null
    {
        return (this._infoBubble?.findChildByName('action_desc_txt') ?? null) as ITextWindow | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get appealButton()
    private get appealButton(): IWindow | null
    {
        return this._infoBubble?.findChildByName('appeal_button') ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::get sanctionInfoText()
    private get sanctionInfoText(): IHTMLTextWindow | null
    {
        return (this._infoBubble?.findChildByName('sanction_info_txt') ?? null) as IHTMLTextWindow | null;
    }

    // TS-only: AS3 assigns `.text` straight onto a window it knows is non-null; each of the six
    // getters above can return null here, and this keeps that check out of every call site.
    private setText(window: ITextWindow | null, value: string): void
    {
        if(window != null) window.text = value;
    }

    /**
     * AS3 uses `flash.globalization.DateTimeFormatter` with the "dd/MM/yyyy" pattern under the
     * "i-default" locale — a fixed numeric date that does not follow the player's locale.
     */
    // TS-only: stands in for the AS3 field `_SafeStr_7224:DateTimeFormatter`.
    private formatDate(timestamp: number): string
    {
        return new Date(timestamp).toLocaleDateString('en-GB');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._tableView != null)
        {
            this._tableView.dispose();
            this._tableView = null;
        }

        if(this._window != null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._shownObject = null;

        if(this._infoBubble != null)
        {
            this._infoBubble.dispose();
            this._infoBubble = null;
        }

        this._bubblePinned = false;
        this._disposed = true;
    }
}
