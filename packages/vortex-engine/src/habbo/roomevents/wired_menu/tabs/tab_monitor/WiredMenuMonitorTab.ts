import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHTMLTextWindow} from '@core/window/components/IHTMLTextWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import type {WiredErrorData} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredErrorData';
import type {WiredRoomStatsData} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredRoomStatsData';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {WiredRoomStatsEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredRoomStatsEvent';
import {WiredErrorLogsEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredErrorLogsEvent';
import type {WiredRoomStatsParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredRoomStatsParser';
import type {WiredErrorLogsParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredErrorLogsParser';
import {RequestWiredRoomStatsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredRoomStatsComposer';
import {RequestWiredErrorLogsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredErrorLogsComposer';
import {ClearWiredErrorLogsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/ClearWiredErrorLogsComposer';
import {WiredMonitorReportComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/WiredMonitorReportComposer';
import {RequestWiredRoomLogsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredRoomLogsComposer';

import {Util} from '../../../Util';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredRoomLogsConfig} from '../../roomlogs/WiredRoomLogsConfig';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';
import {ErrorDataTableObject} from './ErrorDataTableObject';
import {WiredErrorInfoView} from './WiredErrorInfoView';

/**
 * WiredMenuMonitorTab — the "monitor" tab: live room-resource statistics (execution cost, heavy flag,
 * furni/variable usage with color-coded thresholds), a self-refreshing execution-error table (with an
 * error info popup and a clear button), a link to the full room-log overview, and the "panicking
 * Frank" status image easter egg. Polls the server every POLL_MONITOR_MS while viewing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_monitor/WiredMenuMonitorTab.as
 */
export class WiredMenuMonitorTab extends WiredMenuDefaultTab implements IUpdateReceiver
{
    // AS3: WiredMenuMonitorTab.as::POLL_MONITOR_MS
    private static readonly POLL_MONITOR_MS: number = 500;

    // AS3: WiredMenuMonitorTab.as::CLEAR_LOGS_TIMEOUT
    private static readonly CLEAR_LOGS_TIMEOUT: number = 4000;

    // AS3: WiredMenuMonitorTab.as::COLOR_RED
    private static readonly COLOR_RED: string = 'ff5733';

    // AS3: WiredMenuMonitorTab.as::COLOR_ORANGE
    private static readonly COLOR_ORANGE: string = 'BD7800';

    // AS3: WiredMenuMonitorTab.as::COLOR_GREEN
    private static readonly COLOR_GREEN: string = '008000';

    // AS3: WiredMenuMonitorTab.as::THRESHOLD_USAGE_1
    private static readonly THRESHOLD_USAGE_1: number = 0.3;

    // AS3: WiredMenuMonitorTab.as::THRESHOLD_USAGE_2
    private static readonly THRESHOLD_USAGE_2: number = 0.7;

    // AS3: WiredMenuMonitorTab.as::THRESHOLD_FURNI_1
    private static readonly THRESHOLD_FURNI_1: number = 0.6;

    // AS3: WiredMenuMonitorTab.as::THRESHOLD_FURNI_2
    private static readonly THRESHOLD_FURNI_2: number = 0.85;

    // AS3: WiredMenuMonitorTab.as::THRESHOLD_VARS_1
    private static readonly THRESHOLD_VARS_1: number = 0.5;

    // AS3: WiredMenuMonitorTab.as::THRESHOLD_VARS_2
    private static readonly THRESHOLD_VARS_2: number = 0.8;

    // AS3: WiredMenuMonitorTab.as::LOG_COLUMN_TYPE
    static readonly LOG_COLUMN_TYPE: string = 'type';

    // AS3: WiredMenuMonitorTab.as::_SafeStr_10255 (name derived: category column id)
    static readonly LOG_COLUMN_CATEGORY: string = 'category';

    // AS3: WiredMenuMonitorTab.as::_SafeStr_10089 (name derived: quantity column id)
    static readonly LOG_COLUMN_QUANTITY: string = 'quantity';

    // AS3: WiredMenuMonitorTab.as::LOG_COLUMN_LATEST
    static readonly LOG_COLUMN_LATEST: string = 'latest';

    // AS3: WiredMenuMonitorTab.as::_SafeStr_6930 (name derived: error log table)
    private _logTable: TableView = null as unknown as TableView;

    // AS3: WiredMenuMonitorTab.as::_SafeStr_8981 (name derived: last request timestamp)
    private _lastRequestTime: number = 0;

    // AS3: WiredMenuMonitorTab.as::_SafeStr_6073 (name derived: error info popup)
    private _errorInfoView: WiredErrorInfoView | null = null;

    // AS3: WiredMenuMonitorTab.as::_SafeStr_9824 (name derived: last clear timestamp)
    private _lastClearTime: number = 0;

    // AS3: WiredMenuMonitorTab.as::_SafeStr_6042 (name derived: error list)
    private _errors: WiredErrorData[] | null = null;

    // AS3: WiredMenuMonitorTab.as::_SafeStr_4629 (name derived: room stats)
    private _roomStats: WiredRoomStatsData | null = null;

    // AS3: WiredMenuMonitorTab.as::WiredMenuMonitorTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
        this.createLogTable();
        this.addMessageEvent(new WiredRoomStatsEvent((event) => this.onRoomStatsEvent(event)));
        this.addMessageEvent(new WiredErrorLogsEvent((event) => this.onErrorLogsEvent(event)));
        this.clearButton.addEventListener('WME_CLICK', this._onClearButtonClicked);
        this.logOverviewButton.addEventListener('WME_CLICK', this._onLogOverviewButtonClicked);
        this.monitorImage2.addEventListener('WME_CLICK', this._onClickMonitor);
    }

    // AS3: WiredMenuMonitorTab.as::colorize()
    private static colorize(value: number, min: number, max: number, threshold1: number, threshold2: number): string
    {
        const ratio = (value - min) / (max - min);

        if(ratio < threshold1)
        {
            return WiredMenuMonitorTab.COLOR_GREEN;
        }

        if(ratio < threshold2)
        {
            return WiredMenuMonitorTab.COLOR_ORANGE;
        }

        return WiredMenuMonitorTab.COLOR_RED;
    }

    // AS3: WiredMenuMonitorTab.as::createLogTable()
    private createLogTable(): void
    {
        this._logTable = new TableView(this.controller.windowManager!, this.logTableContainer);
        const columns = [
            new TableColumn(WiredMenuMonitorTab.LOG_COLUMN_TYPE, this.loc('wiredmenu.monitor.column.type'), 0.33),
            new TableColumn(WiredMenuMonitorTab.LOG_COLUMN_CATEGORY, this.loc('wiredmenu.monitor.column.category'), 0.22),
            new TableColumn(WiredMenuMonitorTab.LOG_COLUMN_QUANTITY, this.loc('wiredmenu.monitor.column.occurrences'), 0.15),
            new TableColumn(WiredMenuMonitorTab.LOG_COLUMN_LATEST, this.loc('wiredmenu.monitor.column.latest'), 0.3)
        ];
        this._logTable.initialize(columns);
    }

    // AS3: WiredMenuMonitorTab.as::startViewing()
    override startViewing(): void
    {
        super.startViewing();
        this.clearData();
        this.updateLoadingState();
        this.requestData();
    }

    // AS3: WiredMenuMonitorTab.as::isDataReady()
    protected override isDataReady(): boolean
    {
        return this._errors != null && this._roomStats != null;
    }

    // AS3: WiredMenuMonitorTab.as::clearData()
    private clearData(): void
    {
        this._errors = null;
        this._roomStats = null;
    }

    // AS3: WiredMenuMonitorTab.as::requestData()
    private requestData(): void
    {
        this._lastRequestTime = performance.now();
        this.controller.send(new RequestWiredRoomStatsComposer());
        this.controller.send(new RequestWiredErrorLogsComposer());
    }

    // AS3: WiredMenuMonitorTab.as::onRoomStatsEvent()
    private onRoomStatsEvent(event: IMessageEvent): void
    {
        this._roomStats = (event.parser as WiredRoomStatsParser).roomStats;

        if(this.isLoading)
        {
            this.updateLoadingState();
        }
        else
        {
            this.updateRoomStatsUI();
            this.updateImageUI();
        }
    }

    // AS3: WiredMenuMonitorTab.as::onErrorLogsEvent()
    private onErrorLogsEvent(event: IMessageEvent): void
    {
        this._errors = (event.parser as WiredErrorLogsParser).errors;

        if(this.isLoading)
        {
            this.updateLoadingState();
        }
        else
        {
            this.updateErrorLogsUI();
            this.updateButtonsUI();
            this.updateImageUI();
        }
    }

    // AS3: WiredMenuMonitorTab.as::onClearButtonClicked()
    private _onClearButtonClicked = (_event: WindowMouseEvent): void =>
    {
        this.clearButton.disable();
        this.controller.send(new ClearWiredErrorLogsComposer());
        this._lastClearTime = performance.now();
        setTimeout(() => this.updateButtonsUI(), WiredMenuMonitorTab.CLEAR_LOGS_TIMEOUT + 500);
    };

    // AS3: WiredMenuMonitorTab.as::onLogOverviewButtonClicked()
    private _onLogOverviewButtonClicked = (_event: WindowMouseEvent): void =>
    {
        this.controller.roomLogListController!.send(new RequestWiredRoomLogsComposer(1, WiredRoomLogsConfig.PAGE_SIZE, -1, -1, ''));
    };

    // AS3: WiredMenuMonitorTab.as::initializeInterface()
    protected override initializeInterface(): void
    {
        this.updateRoomStatsUI();
        this.updateErrorLogsUI();
        this.updateButtonsUI();
        this.updateImageUI();
    }

    // AS3: WiredMenuMonitorTab.as::updateRoomStatsUI()
    private updateRoomStatsUI(): void
    {
        const stats = this._roomStats!;
        this.statWiredUsageHtml.caption = this.localization.getLocalizationWithParams('wiredmenu.monitor.statistics.usage', '', 'color', this.usageStatColor, 'amount', stats.executionCost.toFixed(0), 'limit', stats.executionCostCap.toFixed(0));
        this.statHeavyHtml.caption = this.localization.getLocalizationWithParams('wiredmenu.monitor.statistics.is_heavy', '', 'color', stats.isHeavy ? WiredMenuMonitorTab.COLOR_ORANGE : WiredMenuMonitorTab.COLOR_GREEN, 'bool', stats.isHeavy ? this.localization.getLocalization('wiredmenu.bool.yes') : this.localization.getLocalization('wiredmenu.bool.no'));
        this.statFloorCountHtml.caption = this.localization.getLocalizationWithParams('wiredmenu.monitor.statistics.floorfurni', '', 'color', this.floorItemStatColor, 'amount', String(stats.floorItemCount), 'limit', String(stats.floorItemCap));
        this.statWallCountHtml.caption = this.localization.getLocalizationWithParams('wiredmenu.monitor.statistics.wallfurni', '', 'color', this.wallItemStatColor, 'amount', String(stats.wallItemCount), 'limit', String(stats.wallItemCap));
        this.statPermFurniVarsHtml.caption = this.localization.getLocalizationWithParams('wiredmenu.monitor.statistics.perm_furni_vars', '', 'color', this.varLimitColor(stats.permanentFurniVariables, stats.maxPermanentFurniVariables), 'amount', String(stats.permanentFurniVariables), 'limit', String(stats.maxPermanentFurniVariables));
        this.statPermUserVarsHtml.caption = this.localization.getLocalizationWithParams('wiredmenu.monitor.statistics.perm_user_vars', '', 'color', this.varLimitColor(stats.permanentUserVariables, stats.maxPermanentUserVariables), 'amount', String(stats.permanentUserVariables), 'limit', String(stats.maxPermanentUserVariables));
        this.statPermGlobalVarsHtml.caption = this.localization.getLocalizationWithParams('wiredmenu.monitor.statistics.perm_global_vars', '', 'color', this.varLimitColor(stats.permanentGlobalVariables, stats.maxPermanentGlobalVariables), 'amount', String(stats.permanentGlobalVariables), 'limit', String(stats.maxPermanentGlobalVariables));
    }

    // AS3: WiredMenuMonitorTab.as::get usageStatColor()
    private get usageStatColor(): string
    {
        return WiredMenuMonitorTab.colorize(this._roomStats!.executionCost, 0, this._roomStats!.executionCostCap, WiredMenuMonitorTab.THRESHOLD_USAGE_1, WiredMenuMonitorTab.THRESHOLD_USAGE_2);
    }

    // AS3: WiredMenuMonitorTab.as::get floorItemStatColor()
    private get floorItemStatColor(): string
    {
        return WiredMenuMonitorTab.colorize(this._roomStats!.floorItemCount, 0, this._roomStats!.floorItemCap, WiredMenuMonitorTab.THRESHOLD_FURNI_1, WiredMenuMonitorTab.THRESHOLD_FURNI_2);
    }

    // AS3: WiredMenuMonitorTab.as::get wallItemStatColor()
    private get wallItemStatColor(): string
    {
        return WiredMenuMonitorTab.colorize(this._roomStats!.wallItemCount, 0, this._roomStats!.wallItemCap, WiredMenuMonitorTab.THRESHOLD_FURNI_1, WiredMenuMonitorTab.THRESHOLD_FURNI_2);
    }

    // AS3: WiredMenuMonitorTab.as::varLimitColor()
    private varLimitColor(value: number, cap: number): string
    {
        return WiredMenuMonitorTab.colorize(value, 0, cap, WiredMenuMonitorTab.THRESHOLD_VARS_1, WiredMenuMonitorTab.THRESHOLD_VARS_2);
    }

    // AS3: WiredMenuMonitorTab.as::updateErrorLogsUI()
    private updateErrorLogsUI(): void
    {
        const rows: ITableObject[] = [];

        for(const error of this._errors!)
        {
            rows.push(new ErrorDataTableObject(this, error, this.localization));
        }

        this._logTable.setObjects(rows);
    }

    // AS3: WiredMenuMonitorTab.as::updateImageUI()
    private updateImageUI(): void
    {
        const panicking = this.isFrankPanicking;
        this.monitorImage1.visible = !panicking;
        this.monitorImage2.visible = panicking;
    }

    // AS3: WiredMenuMonitorTab.as::get isFrankPanicking()
    private get isFrankPanicking(): boolean
    {
        if(this._roomStats!.isHeavy)
        {
            return true;
        }

        if(this.usageStatColor !== WiredMenuMonitorTab.COLOR_GREEN || this.floorItemStatColor !== WiredMenuMonitorTab.COLOR_GREEN || this.wallItemStatColor !== WiredMenuMonitorTab.COLOR_GREEN)
        {
            return true;
        }

        return this.hasErrors;
    }

    // AS3: WiredMenuMonitorTab.as::onErrorLinkClicked()
    onErrorLinkClicked(error: WiredErrorData): void
    {
        if(this._errorInfoView == null)
        {
            this._errorInfoView = new WiredErrorInfoView(this.controller);
        }

        this._errorInfoView.initialize(error);
        this._errorInfoView.show();
    }

    // AS3: WiredMenuMonitorTab.as::updateButtonsUI()
    private updateButtonsUI(): void
    {
        Util.disableSection(this.logOverviewButton, !this.controller.hasReadPermission);
        const clearing = performance.now() < this._lastClearTime + WiredMenuMonitorTab.CLEAR_LOGS_TIMEOUT;
        Util.disableSection(this.clearButton, !this.controller.hasWritePermission || clearing);
    }

    // AS3: WiredMenuMonitorTab.as::get hasErrors()
    private get hasErrors(): boolean
    {
        for(const error of this._errors!)
        {
            if(error.throwCount > 0)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: WiredMenuMonitorTab.as::permissionsUpdated()
    override permissionsUpdated(): void
    {
        this.updateButtonsUI();
    }

    // AS3: WiredMenuMonitorTab.as::onClickMonitor()
    private _onClickMonitor = (event: WindowMouseEvent): void =>
    {
        if(event.localX < 14 || event.localX > 61 || event.localY < 45 || event.localY > 107)
        {
            return;
        }

        this.controller.send(new WiredMonitorReportComposer('wf15', (event.window as unknown as IStaticBitmapWrapperWindow).assetUri));
    };

    // AS3: WiredMenuMonitorTab.as::update()
    update(_deltaTime: number): void
    {
        if(!this.isViewing)
        {
            return;
        }

        const now = performance.now();

        if(this._lastRequestTime < now - WiredMenuMonitorTab.POLL_MONITOR_MS)
        {
            this.requestData();
        }
    }

    // AS3: WiredMenuMonitorTab.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this._errorInfoView != null)
        {
            this._errorInfoView.dispose();
            this._errorInfoView = null;
        }

        this._logTable.dispose();
        this._logTable = null as unknown as TableView;
        this._errors = null;
        this._roomStats = null;
        super.dispose();
    }

    // AS3: WiredMenuMonitorTab.as::get statWiredUsageHtml()
    private get statWiredUsageHtml(): IHTMLTextWindow
    {
        return this.container.findChildByName('statistics_usage_html') as unknown as IHTMLTextWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get statHeavyHtml()
    private get statHeavyHtml(): IHTMLTextWindow
    {
        return this.container.findChildByName('statistics_heavy_html') as unknown as IHTMLTextWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get statFloorCountHtml()
    private get statFloorCountHtml(): IHTMLTextWindow
    {
        return this.container.findChildByName('statistics_floorfurni_html') as unknown as IHTMLTextWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get statWallCountHtml()
    private get statWallCountHtml(): IHTMLTextWindow
    {
        return this.container.findChildByName('statistics_wallfurni_html') as unknown as IHTMLTextWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get statPermFurniVarsHtml()
    private get statPermFurniVarsHtml(): IHTMLTextWindow
    {
        return this.container.findChildByName('statistics_perm_vars_furni_html') as unknown as IHTMLTextWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get statPermUserVarsHtml()
    private get statPermUserVarsHtml(): IHTMLTextWindow
    {
        return this.container.findChildByName('statistics_perm_vars_user_html') as unknown as IHTMLTextWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get statPermGlobalVarsHtml()
    private get statPermGlobalVarsHtml(): IHTMLTextWindow
    {
        return this.container.findChildByName('statistics_perm_vars_global_html') as unknown as IHTMLTextWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get logTableContainer()
    private get logTableContainer(): IWindowContainer
    {
        return this.container.findChildByName('log_table_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuMonitorTab.as::get clearButton()
    private get clearButton(): IInteractiveWindow
    {
        return this.container.findChildByName('clear_log_btn') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get logOverviewButton()
    private get logOverviewButton(): IInteractiveWindow
    {
        return this.container.findChildByName('log_overview_btn') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get monitorImage1()
    private get monitorImage1(): IStaticBitmapWrapperWindow
    {
        return this.container.findChildByName('monitor_image_1') as unknown as IStaticBitmapWrapperWindow;
    }

    // AS3: WiredMenuMonitorTab.as::get monitorImage2()
    private get monitorImage2(): IStaticBitmapWrapperWindow
    {
        return this.container.findChildByName('monitor_image_2') as unknown as IStaticBitmapWrapperWindow;
    }
}
