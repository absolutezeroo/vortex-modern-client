import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import type {WiredLogEntry} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredLogEntry';

import type {WiredRoomLogListController} from './WiredRoomLogListController';

/**
 * WiredRoomLogListTableObject — one row in the room-logs table: a wired log entry rendered across the
 * timestamp / source / level / message columns, colour-coded by log level. Rows are immutable
 * (isUpdated always false).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/roomlogs/WiredRoomLogListTableObject.as
 */
export class WiredRoomLogListTableObject implements ITableObject
{
    // AS3: WiredRoomLogListTableObject.as::COLOR_INFO
    private static readonly COLOR_INFO: number = 4607;

    // AS3: WiredRoomLogListTableObject.as::COLOR_WARN
    private static readonly COLOR_WARN: number = 11757568;

    // AS3: WiredRoomLogListTableObject.as::COLOR_ERROR
    private static readonly COLOR_ERROR: number = 14362624;

    // AS3: WiredRoomLogListTableObject.as::COLOR_DEBUG
    private static readonly COLOR_DEBUG: number = 10158534;

    // AS3: WiredRoomLogListTableObject.as::COLORS
    private static readonly COLORS: number[] = [
        WiredRoomLogListTableObject.COLOR_INFO,
        WiredRoomLogListTableObject.COLOR_WARN,
        WiredRoomLogListTableObject.COLOR_ERROR,
        WiredRoomLogListTableObject.COLOR_DEBUG
    ];

    // AS3: WiredRoomLogListTableObject.as::_SafeStr_4593 (name derived: the controller)
    private _controller: WiredRoomLogListController;

    // AS3: WiredRoomLogListTableObject.as::_SafeStr_4896 (name derived: the log entry)
    private _entry: WiredLogEntry;

    // AS3: WiredRoomLogListTableObject.as::WiredRoomLogListTableObject()
    constructor(controller: WiredRoomLogListController, entry: WiredLogEntry)
    {
        this._controller = controller;
        this._entry = entry;
    }

    // AS3: WiredRoomLogListTableObject.as::get identifier()
    get identifier(): string
    {
        return String(this._entry.id);
    }

    // AS3: WiredRoomLogListTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell
    {
        const color = WiredRoomLogListTableObject.COLORS[this._entry.logLevel];

        switch(columnId)
        {
            case 'timestamp':
                return new TableCell(TableCell.TYPE_TEXT, this._entry.timestampStr, false, true, null, null, false, null, color);
            case 'source':
                return new TableCell(TableCell.TYPE_TEXT, this.localize('wiredmenu.logs_overview.log_source.' + this._entry.logSource), false, false, null, null, false, null, color);
            case 'level':
                return new TableCell(TableCell.TYPE_TEXT, this.localize('wiredmenu.logs_overview.log_level.' + this._entry.logLevel), false, false, null, null, false, null, color);
            case 'message':
                return new TableCell(TableCell.TYPE_TEXT, this._entry.logMessage, false, true, null, null, false, null, color);
            default:
                return null as unknown as TableCell;
        }
    }

    // AS3: WiredRoomLogListTableObject.as::localize()
    private localize(key: string): string
    {
        return this._controller.localizationManager.getLocalization(key);
    }

    // AS3: WiredRoomLogListTableObject.as::get element()
    get element(): WiredLogEntry
    {
        return this._entry;
    }

    // AS3: WiredRoomLogListTableObject.as::isPropertyUpdated()
    isPropertyUpdated(_columnId: string, _other: object): boolean
    {
        return false;
    }

    // AS3: WiredRoomLogListTableObject.as::isUpdated()
    isUpdated(_other: object): boolean
    {
        return false;
    }
}
