import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {WiredErrorData} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredErrorData';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';

import {WiredMenuMonitorTab} from './WiredMenuMonitorTab';

/**
 * ErrorDataTableObject — one row in the monitor tab's error table, backed by a WiredErrorData. Renders
 * a clickable error-name cell (opens the error info popup), category, occurrence count, and a friendly
 * "last seen" cell with an absolute-timestamp tooltip.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_monitor/ErrorDataTableObject.as
 */
export class ErrorDataTableObject implements ITableObject
{
    // AS3: ErrorDataTableObject.as::_SafeStr_10030 (name derived: owning monitor tab)
    private _tab: WiredMenuMonitorTab;

    // AS3: ErrorDataTableObject.as::_SafeStr_4556 (name derived: error data)
    private _error: WiredErrorData;

    // AS3: ErrorDataTableObject.as::_localization
    private _localization: IHabboLocalizationManager;

    // AS3: ErrorDataTableObject.as::ErrorDataTableObject()
    constructor(tab: WiredMenuMonitorTab, error: WiredErrorData, localization: IHabboLocalizationManager)
    {
        this._tab = tab;
        this._error = error;
        this._localization = localization;
    }

    // AS3: ErrorDataTableObject.as::convertTimestamp()
    private static convertTimestamp(ms: number): string
    {
        const date = new Date(ms);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        return year + '-' + ErrorDataTableObject.addLeadingZero(month) + '-' + ErrorDataTableObject.addLeadingZero(day) + ' ' + ErrorDataTableObject.addLeadingZero(hours) + ':' + ErrorDataTableObject.addLeadingZero(minutes) + ':' + ErrorDataTableObject.addLeadingZero(seconds);
    }

    // AS3: ErrorDataTableObject.as::addLeadingZero()
    private static addLeadingZero(value: number): string
    {
        return value < 10 ? '0' + value.toString() : value.toString();
    }

    // AS3: ErrorDataTableObject.as::get data()
    get data(): WiredErrorData
    {
        return this._error;
    }

    // AS3: ErrorDataTableObject.as::get identifier()
    get identifier(): string
    {
        return String(this._error.errorId);
    }

    // AS3: ErrorDataTableObject.as::isPropertyUpdated()
    isPropertyUpdated(columnId: string, other: object): boolean
    {
        const otherError = (other as ErrorDataTableObject).data;

        switch(columnId)
        {
            case WiredMenuMonitorTab.LOG_COLUMN_QUANTITY:
                return this._error.throwCount !== otherError.throwCount;
            case WiredMenuMonitorTab.LOG_COLUMN_LATEST:
                return this._error.msSinceLastOccurrence !== otherError.msSinceLastOccurrence;
            default:
                return false;
        }
    }

    // AS3: ErrorDataTableObject.as::isUpdated()
    isUpdated(other: object): boolean
    {
        const otherError = (other as ErrorDataTableObject).data;
        return this._error.msSinceLastOccurrence !== otherError.msSinceLastOccurrence || this._error.throwCount !== otherError.throwCount;
    }

    // AS3: ErrorDataTableObject.as::onLinkClicked()
    onLinkClicked = (): void =>
    {
        this._tab.onErrorLinkClicked(this._error);
    };

    // AS3: ErrorDataTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell
    {
        switch(columnId)
        {
            case WiredMenuMonitorTab.LOG_COLUMN_TYPE:
                return new TableCell(TableCell.TYPE_LINK, this._error.errorName, false, false, null, this.onLinkClicked);
            case WiredMenuMonitorTab.LOG_COLUMN_CATEGORY:
                return new TableCell(TableCell.TYPE_TEXT, this._error.category);
            case WiredMenuMonitorTab.LOG_COLUMN_QUANTITY:
                return new TableCell(TableCell.TYPE_TEXT, String(this._error.throwCount));
            case WiredMenuMonitorTab.LOG_COLUMN_LATEST:
                if(this._error.msSinceLastOccurrence < 0)
                {
                    return new TableCell(TableCell.TYPE_TEXT, '/');
                }

                // Port note: AS3 passes _localization to FriendlyTime.getFriendlyTime; the port's
                // FriendlyTime has no localization param (non-localized English units), so it is omitted.
                return new TableCell(TableCell.TYPE_TEXT, FriendlyTime.getFriendlyTime(this._error.msSinceLastOccurrence / 1000, '.ago', 3), false, false, null, null, false, this.timestampString);
            default:
                return null as unknown as TableCell;
        }
    }

    // AS3: ErrorDataTableObject.as::get timestampString()
    private get timestampString(): string
    {
        let ms = Date.now() - this._error.msSinceLastOccurrence;
        ms -= ms % 1000;
        return ErrorDataTableObject.convertTimestamp(ms);
    }
}
