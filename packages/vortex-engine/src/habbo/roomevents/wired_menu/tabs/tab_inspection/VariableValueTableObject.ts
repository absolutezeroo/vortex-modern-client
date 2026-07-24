import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';

import {Util} from '../../../Util';
import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import {WiredMenuInspectionTab} from './WiredMenuInspectionTab';

/**
 * VariableValueTableObject — one row in the inspection tab's variable-values table: the variable name
 * and its current value on the inspected object. The value cell is inline-editable when the viewer can
 * modify the object and the variable is writable; out-of-range Flash-int sentinels render as a
 * "restriction" note in red. Change detection drives the incremental table refresh.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_inspection/VariableValueTableObject.as
 */
export class VariableValueTableObject implements ITableObject
{
    // AS3: VariableValueTableObject.as::_highlightChanges
    private _highlightChanges: boolean;

    // AS3: VariableValueTableObject.as::_SafeStr_5878 (name derived: the variable)
    private _variable: WiredVariable;

    // AS3: VariableValueTableObject.as::_SafeStr_4717 (name derived: the value)
    private _value: number;

    // AS3: VariableValueTableObject.as::_SafeStr_7662 (name derived: can-modify)
    private _canModify: boolean;

    // AS3: VariableValueTableObject.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: VariableValueTableObject.as::VariableValueTableObject()
    constructor(variable: WiredVariable, value: number, canModify: boolean, highlightChanges: boolean, roomEvents: HabboUserDefinedRoomEvents)
    {
        this._variable = variable;
        this._value = value;
        this._canModify = canModify;
        this._highlightChanges = highlightChanges;
        this._roomEvents = roomEvents;
    }

    // AS3: VariableValueTableObject.as::createVariableValueCell()
    static createVariableValueCell(variable: WiredVariable, value: number, roomEvents: HabboUserDefinedRoomEvents, highlightChanges: boolean, canModify: boolean): TableCell
    {
        const localization = roomEvents.localization;

        if(variable.hasValue)
        {
            const restricted = value === 2147483647 || value === -2147483648;

            if(restricted)
            {
                return new TableCell(TableCell.TYPE_TEXT, localization.getLocalization('wiredmenu.inspection.flash_restriction.text'), false, false, null, null, false, localization.getLocalization('wiredmenu.inspection.flash_restriction.desc'), 16734003);
            }

            const text = Util.variableValueWithString(variable, value);
            return new TableCell(TableCell.TYPE_TEXT, text, variable.canWriteValue && canModify, true, String(value), null, highlightChanges);
        }

        return new TableCell(TableCell.TYPE_TEXT, '');
    }

    // AS3: VariableValueTableObject.as::get identifier()
    get identifier(): string
    {
        return this._variable.variableId;
    }

    // AS3: VariableValueTableObject.as::isPropertyUpdated()
    isPropertyUpdated(columnId: string, other: object): boolean
    {
        const otherObject = other as VariableValueTableObject;

        if(columnId === WiredMenuInspectionTab.VARIABLES_COLUMN_VARIABLE)
        {
            return this._variable.variableName !== otherObject.variable.variableName;
        }

        if(columnId === WiredMenuInspectionTab.VARIABLES_COLUMN_VALUE)
        {
            if(this._canModify !== otherObject.canModify)
            {
                return true;
            }

            if(this._variable.hasValue !== otherObject.variable.hasValue)
            {
                return true;
            }

            if(!this._variable.hasValue)
            {
                return false;
            }

            return this._value !== otherObject.value || Util.getConnectedText(this._variable, this._value) !== Util.getConnectedText(otherObject.variable, otherObject.value);
        }

        return false;
    }

    // AS3: VariableValueTableObject.as::isUpdated()
    isUpdated(other: object): boolean
    {
        return this.isPropertyUpdated(WiredMenuInspectionTab.VARIABLES_COLUMN_VALUE, other) || this.isPropertyUpdated(WiredMenuInspectionTab.VARIABLES_COLUMN_VARIABLE, other);
    }

    // AS3: VariableValueTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell
    {
        if(columnId === WiredMenuInspectionTab.VARIABLES_COLUMN_VARIABLE)
        {
            return new TableCell(TableCell.TYPE_TEXT, this._variable.variableName, false, true, this._variable.variableName);
        }

        if(columnId === WiredMenuInspectionTab.VARIABLES_COLUMN_VALUE)
        {
            return VariableValueTableObject.createVariableValueCell(this._variable, this._value, this._roomEvents, this._highlightChanges, this._canModify);
        }

        return null as unknown as TableCell;
    }

    // AS3: VariableValueTableObject.as::get variable()
    get variable(): WiredVariable
    {
        return this._variable;
    }

    // AS3: VariableValueTableObject.as::get value()
    get value(): number
    {
        return this._value;
    }

    // AS3: VariableValueTableObject.as::get canModify()
    get canModify(): boolean
    {
        return this._canModify;
    }
}
