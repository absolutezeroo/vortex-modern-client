import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import {
    CfhReportStatusData
} from '@habbo/communication/messages/parser/callforhelp/CfhReportStatusData';
import type {MyReportStatus} from '../MyReportStatus';
import {MyReportStatusColumn} from '../MyReportStatusColumn';

/**
 * One row of the "my reports" table.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as
 */
export class ReportStatusTableObject implements ITableObject
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::_myReportStatus
    private _myReportStatus: MyReportStatus;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::_SafeStr_5626 (the report row)
    private _message: CfhReportStatusData;

    /**
     * AS3 builds an anonymous `{deleted, userName, textColor}` in `getReportedUserDeleted()` and
     * reads it back in two places. Kept as three fields rather than an object literal — the shape
     * never leaves this class.
     */
    // TS-only: unpacked from AS3's single `_SafeStr_7987:Object`.
    private _reportedUserDeleted: boolean;
    // TS-only: unpacked from AS3's single `_SafeStr_7987:Object`.
    private _reportedUserName: string;
    // TS-only: unpacked from AS3's single `_SafeStr_7987:Object`.
    private _reportedUserTextColor: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::ReportStatusTableObject()
    constructor(myReportStatus: MyReportStatus, message: CfhReportStatusData)
    {
        this._myReportStatus = myReportStatus;
        this._message = message;

        // AS3: getReportedUserDeleted(), inlined — see the field comment above.
        const name = this._message.reportedAccountName;
        const deleted = name == null || name === '';

        this._reportedUserDeleted = deleted;
        this._reportedUserName = deleted ? this._myReportStatus.localize('report.status.deleted', 'Deleted') : name;
        this._reportedUserTextColor = deleted ? 13762560 : 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::get identifier()
    get identifier(): string
    {
        return String(this._message.id);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::get message()
    get message(): CfhReportStatusData
    {
        return this._message;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::isPropertyUpdated()
    isPropertyUpdated(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::isUpdated()
    isUpdated(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell | null
    {
        switch(columnId)
        {
            case MyReportStatusColumn.REPORT_DATE:
                return new TableCell(TableCell.TYPE_TEXT, this.formatDate(this._message.creationTime));

            case MyReportStatusColumn.REPORTED_ACCOUNT:
                return new TableCell(
                    TableCell.TYPE_TEXT, this._reportedUserName,
                    false, false, null, null, false, null, this._reportedUserTextColor
                );

            case MyReportStatusColumn.REASON:
                return new TableCell(
                    TableCell.TYPE_TEXT,
                    this._myReportStatus.localize(`help.cfh.topic.${this._message.userCategory}`)
                );

            case MyReportStatusColumn.APPEAL_STATUS: {
                const cell = new TableCell(TableCell.TYPE_TEXT, this.statusText);

                // A deleted reported account gets no info bubble — there is nothing to show about
                // an account that no longer exists.
                if(!this._reportedUserDeleted) cell.setExtraBtn('icons_info_grey', this.onExtraClick);

                return cell;
            }

            default:
                return null;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::onExtraClick()
    private onExtraClick = (): void =>
    {
        this._myReportStatus.clickInfoButton(this);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/reportstatus/ReportStatusTableObject.as::get statusText()
    private get statusText(): string
    {
        if(this._message.appealStatus === CfhReportStatusData.APPEAL_STATUS_PENDING)
        {
            return this._myReportStatus.localize('report.status.state.appealed');
        }

        if(this._message.closeTime !== -1)
        {
            return this._myReportStatus.localize('report.status.state.decided');
        }

        return this._myReportStatus.localize('report.status.state.pending');
    }

    /**
     * AS3 uses `flash.globalization.DateTimeFormatter` with the "dd/MM/yyyy" pattern under the
     * "i-default" locale — a fixed, locale-independent numeric date. `toLocaleDateString('en-GB')`
     * produces exactly that, and unlike the browser's default locale it cannot reorder the fields.
     */
    // TS-only: stands in for the AS3 field `_SafeStr_7224:DateTimeFormatter`, which has no
    // equivalent object here; the format it was configured with is what matters.
    private formatDate(timestamp: number): string
    {
        return new Date(timestamp).toLocaleDateString('en-GB');
    }
}
