import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';

import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import {WiredMenuOverviewTab} from './WiredMenuOverviewTab';

/**
 * VariableTableObject — one row in the overview tab's variable list: renders the variable's name and
 * detects name changes for the incremental table update.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_variable_overview/VariableTableObject.as
 */
export class VariableTableObject implements ITableObject
{
    // AS3: VariableTableObject.as::_SafeStr_5878 (name derived: the variable)
    private _variable: WiredVariable;

    // AS3: VariableTableObject.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: VariableTableObject.as::VariableTableObject()
    constructor(variable: WiredVariable, roomEvents: HabboUserDefinedRoomEvents)
    {
        this._variable = variable;
        this._roomEvents = roomEvents;
    }

    // AS3: VariableTableObject.as::get identifier()
    get identifier(): string
    {
        return this._variable.variableId;
    }

    // AS3: VariableTableObject.as::isPropertyUpdated()
    isPropertyUpdated(columnId: string, other: object): boolean
    {
        const variable = (other as VariableTableObject).variable;

        if(columnId === WiredMenuOverviewTab.LIST_COLUMN_NAME)
        {
            return this._variable.variableName !== variable.variableName;
        }

        return false;
    }

    // AS3: VariableTableObject.as::isUpdated()
    isUpdated(other: object): boolean
    {
        return this._variable.variableName !== (other as VariableTableObject).variable.variableName;
    }

    // AS3: VariableTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell
    {
        if(columnId === WiredMenuOverviewTab.LIST_COLUMN_NAME)
        {
            return new TableCell(TableCell.TYPE_TEXT, this._variable.variableName);
        }

        return null as unknown as TableCell;
    }

    // AS3: VariableTableObject.as::get variable()
    get variable(): WiredVariable
    {
        return this._variable;
    }

    // AS3: VariableTableObject stores the roomEvents component (unused by the row itself, kept for
    // fidelity); expose it so the field is not dead.
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }
}
